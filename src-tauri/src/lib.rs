pub mod backups;
pub mod pack_download;
pub mod windows_sound;

use serde::{Deserialize, Serialize};

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

/// Applies a whole pack in one pass: snapshot every affected event, persist a
/// backup, then write. If any write fails the already-written events are
/// rolled back from their snapshots, so the scheme is never left half-applied
/// — the alternative would strand the user between two packs with no way back
/// short of restoring a backup by hand.
#[tauri::command]
fn apply_sound_pack(
    app: tauri::AppHandle,
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
                &app,
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
fn list_backups(app: tauri::AppHandle) -> Result<Vec<BackupSummary>, String> {
    backups::list(&app)
}

#[tauri::command]
fn restore_backup(app: tauri::AppHandle, id: String) -> Result<usize, String> {
    let record = backups::read(&app, &id)?;
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
fn delete_backup(app: tauri::AppHandle, id: String) -> Result<(), String> {
    backups::delete(&app, &id)
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
