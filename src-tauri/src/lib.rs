pub mod backups;
pub mod pack_download;
pub mod windows_sound;

use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

use backups::BackupSummary;
use windows_sound::{EventSnapshot, SoundEvent};

#[tauri::command]
fn scan_events() -> Result<Vec<SoundEvent>, String> {
    windows_sound::list_events().map_err(|e| e.to_string())
}

#[tauri::command]
async fn download_pack_asset(
    app: tauri::AppHandle,
    url: String,
    pack_id: String,
    file_name: String,
) -> Result<String, String> {
    pack_download::download_asset(&app, url, pack_id, file_name).await
}

#[derive(Debug, Deserialize)]
pub struct ApplyEntry {
    pub app: String,
    pub event: String,
    /// "pack" | "default" | "disabled"
    pub action: String,
    /// Absolute local path, required when action is "pack".
    pub wav_path: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ApplyPackResult {
    pub applied: usize,
    pub backup_id: Option<String>,
}

fn backups_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    dir.push("backups");
    Ok(dir)
}

/// Applies a whole pack in one pass: snapshot every affected event, persist a
/// backup, then write. If any write fails the already-written events are
/// rolled back from their snapshots, so the scheme is never left half-applied
/// — the alternative would strand the user between two packs with no way back
/// short of restoring a backup by hand.
///
/// Takes the backups directory rather than an `AppHandle` so the whole
/// snapshot → backup → write → rollback cycle is testable without a running
/// Tauri app.
pub fn apply_pack_to_registry(
    backups_dir: &std::path::Path,
    entries: Vec<ApplyEntry>,
    create_backup: bool,
    backup_label: String,
    pack_name: Option<String>,
    created_at: String,
) -> Result<ApplyPackResult, String> {
    if entries.is_empty() {
        return Err("No events to apply.".to_string());
    }
    for entry in &entries {
        match entry.action.as_str() {
            "pack" => {
                let path = entry
                    .wav_path
                    .as_deref()
                    .filter(|p| !p.is_empty())
                    .ok_or_else(|| {
                        format!("Missing sound file for {}\\{}.", entry.app, entry.event)
                    })?;
                if !std::path::Path::new(path).is_file() {
                    return Err(format!("Sound file not found: {path}"));
                }
            }
            "default" | "disabled" => {}
            other => return Err(format!("Unknown action: {other}")),
        }
    }

    let snapshots: Vec<EventSnapshot> = entries
        .iter()
        .map(|e| windows_sound::snapshot_event(&e.app, &e.event))
        .collect();

    let backup_id = if create_backup {
        Some(
            backups::save(
                backups_dir,
                created_at,
                backup_label,
                pack_name,
                snapshots.clone(),
            )?
            .id,
        )
    } else {
        None
    };

    for (index, entry) in entries.iter().enumerate() {
        let result = match entry.action.as_str() {
            "pack" => windows_sound::apply_sound(
                &entry.app,
                &entry.event,
                entry.wav_path.as_deref().unwrap_or_default(),
            )
            .map(|_| ()),
            "default" => windows_sound::apply_windows_default(&entry.app, &entry.event),
            _ => windows_sound::disable_sound(&entry.app, &entry.event),
        };

        if let Err(err) = result {
            for snapshot in snapshots.iter().take(index) {
                let _ = windows_sound::restore_sound(snapshot);
            }
            return Err(format!(
                "Failed on {}\\{}: {err}. Previous sounds were restored.",
                entry.app, entry.event
            ));
        }
    }

    Ok(ApplyPackResult {
        applied: entries.len(),
        backup_id,
    })
}

#[tauri::command]
fn apply_sound_pack(
    app: tauri::AppHandle,
    entries: Vec<ApplyEntry>,
    create_backup: bool,
    backup_label: String,
    pack_name: Option<String>,
    created_at: String,
) -> Result<ApplyPackResult, String> {
    let dir = backups_dir(&app)?;
    apply_pack_to_registry(
        &dir,
        entries,
        create_backup,
        backup_label,
        pack_name,
        created_at,
    )
}

#[tauri::command]
fn list_backups(app: tauri::AppHandle) -> Result<Vec<BackupSummary>, String> {
    backups::list(&backups_dir(&app)?)
}

/// Writes a backup's snapshots back. Split out for the same testability
/// reason as `apply_pack_to_registry`.
pub fn restore_backup_from(backups_dir: &std::path::Path, id: &str) -> Result<usize, String> {
    let record = backups::read(backups_dir, id)?;
    let mut restored = 0usize;
    let mut failures = Vec::new();

    // Unlike apply, this keeps going after a failure: a backup is the user's
    // way back, so restoring most of it beats aborting on the first bad event.
    for snapshot in &record.snapshots {
        match windows_sound::restore_sound(snapshot) {
            Ok(()) => restored += 1,
            Err(err) => failures.push(format!("{}\\{}: {err}", snapshot.app, snapshot.event)),
        }
    }

    if failures.is_empty() {
        Ok(restored)
    } else {
        Err(format!(
            "Restored {restored} of {}. Failed: {}",
            record.snapshots.len(),
            failures.join("; ")
        ))
    }
}

#[tauri::command]
fn restore_backup(app: tauri::AppHandle, id: String) -> Result<usize, String> {
    restore_backup_from(&backups_dir(&app)?, &id)
}

#[tauri::command]
fn delete_backup(app: tauri::AppHandle, id: String) -> Result<(), String> {
    backups::delete(&backups_dir(&app)?, &id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_events,
            download_pack_asset,
            apply_sound_pack,
            list_backups,
            restore_backup,
            delete_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod apply_tests {
    use super::*;
    use windows_sound::{get_current_sound, list_events, snapshot_event};

    fn temp_backups_dir(tag: &str) -> PathBuf {
        let mut dir = std::env::temp_dir();
        dir.push(format!("sounddeck-test-{tag}"));
        let _ = std::fs::remove_dir_all(&dir);
        dir
    }

    /// Full apply → verify → restore cycle against the live registry, mixing
    /// all three actions. Restores everything it touched before returning.
    #[test]
    #[ignore = "writes to the live HKCU sound scheme"]
    fn apply_pack_then_restore_backup_round_trip() {
        let probe = r"C:\Windows\Media\Windows Ding.wav";
        assert!(std::path::Path::new(probe).is_file(), "probe wav must exist");

        // Three real events off this machine, one per action.
        let events: Vec<_> = list_events()
            .expect("registry readable")
            .into_iter()
            .filter(|e| e.current_sound.is_some())
            .take(3)
            .collect();
        assert_eq!(events.len(), 3, "need 3 events with sounds to test with");

        let before: Vec<_> = events
            .iter()
            .map(|e| snapshot_event(&e.app, &e.event))
            .collect();

        let entries = vec![
            ApplyEntry {
                app: events[0].app.clone(),
                event: events[0].event.clone(),
                action: "pack".into(),
                wav_path: Some(probe.to_string()),
            },
            ApplyEntry {
                app: events[1].app.clone(),
                event: events[1].event.clone(),
                action: "disabled".into(),
                wav_path: None,
            },
            ApplyEntry {
                app: events[2].app.clone(),
                event: events[2].event.clone(),
                action: "default".into(),
                wav_path: None,
            },
        ];

        let dir = temp_backups_dir("roundtrip");
        let result = apply_pack_to_registry(
            &dir,
            entries,
            true,
            "Test backup".into(),
            Some("Test pack".into()),
            "2026-08-19T10:00:00.000Z".into(),
        )
        .expect("apply should succeed");

        assert_eq!(result.applied, 3);
        let backup_id = result.backup_id.clone().expect("a backup was requested");

        // The writes actually landed.
        assert_eq!(
            get_current_sound(&events[0].app, &events[0].event).as_deref(),
            Some(probe),
            "pack action should write the wav path"
        );
        assert_eq!(
            get_current_sound(&events[1].app, &events[1].event),
            None,
            "disabled action should clear the sound"
        );

        // The backup is listed and readable.
        let listed = backups::list(&dir).expect("list");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].id, backup_id);
        assert_eq!(listed[0].event_count, 3);
        assert_eq!(listed[0].label, "Test backup");

        // Restore puts every event back byte-for-byte.
        let restored = restore_backup_from(&dir, &backup_id).expect("restore should succeed");
        assert_eq!(restored, 3);

        for original in &before {
            let now = snapshot_event(&original.app, &original.event);
            assert_eq!(
                now.previous_sound, original.previous_sound,
                "sound not restored for {}\\{}",
                original.app, original.event
            );
            let (a, b) = (&now.previous_raw, &original.previous_raw);
            assert_eq!(
                a.as_ref().map(|r| r.reg_type),
                b.as_ref().map(|r| r.reg_type),
                "registry type not restored for {}\\{}",
                original.app,
                original.event
            );
            assert_eq!(
                a.as_ref().map(|r| &r.bytes),
                b.as_ref().map(|r| &r.bytes),
                "registry bytes not restored for {}\\{}",
                original.app,
                original.event
            );
        }

        let _ = std::fs::remove_dir_all(&dir);
    }

    /// A missing .wav must abort before anything is written, not halfway.
    #[test]
    #[ignore = "reads the live HKCU sound scheme"]
    fn missing_wav_aborts_without_writing() {
        let target = list_events()
            .expect("registry readable")
            .into_iter()
            .find(|e| e.current_sound.is_some())
            .expect("an event with a sound");
        let before = snapshot_event(&target.app, &target.event);

        let dir = temp_backups_dir("missing-wav");
        let err = apply_pack_to_registry(
            &dir,
            vec![ApplyEntry {
                app: target.app.clone(),
                event: target.event.clone(),
                action: "pack".into(),
                wav_path: Some(r"C:\definitely\not\here.wav".into()),
            }],
            true,
            "Should not exist".into(),
            None,
            "2026-08-19T10:00:00.000Z".into(),
        )
        .expect_err("apply must fail when the wav is missing");
        assert!(err.contains("not found"), "unexpected error: {err}");

        assert_eq!(
            snapshot_event(&target.app, &target.event).previous_sound,
            before.previous_sound,
            "registry must be untouched"
        );
        assert!(
            backups::list(&dir).expect("list").is_empty(),
            "no backup should be written when validation fails"
        );

        let _ = std::fs::remove_dir_all(&dir);
    }
}
