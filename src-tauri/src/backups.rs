// Persisted backups of the Windows sound scheme.
//
// A backup is the full set of `.Current` values (raw bytes + registry type)
// for every event a pack apply is about to touch, captured before the first
// write. Stored as one JSON file per backup under the app's own data dir, so
// a backup survives app restarts and app upgrades — the data dir is keyed by
// the bundle identifier, not by the install path, so reinstalling or
// upgrading to a new version keeps them.

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::windows_sound::EventSnapshot;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BackupRecord {
    pub id: String,
    pub created_at: String,
    pub label: String,
    pub pack_name: Option<String>,
    pub snapshots: Vec<EventSnapshot>,
}

/// What the library list needs, without paying to deserialize every snapshot.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BackupSummary {
    pub id: String,
    pub created_at: String,
    pub label: String,
    pub pack_name: Option<String>,
    pub event_count: usize,
    pub size_bytes: u64,
}

fn backups_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    dir.push("backups");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// Backup ids are generated here rather than accepted from the frontend so a
/// caller can't overwrite an existing backup by passing a colliding id.
fn new_id() -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    format!("bkp-{millis}")
}

fn record_path(app: &tauri::AppHandle, id: &str) -> Result<PathBuf, String> {
    // Ids are generated internally, but this is the boundary where one is
    // turned back into a filesystem path — reject anything that isn't the
    // shape we generate rather than trusting the caller.
    let safe = !id.is_empty()
        && id.len() <= 64
        && id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
    if !safe {
        return Err("Invalid backup id.".to_string());
    }
    let mut path = backups_dir(app)?;
    path.push(format!("{id}.json"));
    Ok(path)
}

pub fn save(
    app: &tauri::AppHandle,
    created_at: String,
    label: String,
    pack_name: Option<String>,
    snapshots: Vec<EventSnapshot>,
) -> Result<BackupRecord, String> {
    let record = BackupRecord {
        id: new_id(),
        created_at,
        label,
        pack_name,
        snapshots,
    };
    let path = record_path(app, &record.id)?;
    let json = serde_json::to_vec_pretty(&record).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(record)
}

pub fn list(app: &tauri::AppHandle) -> Result<Vec<BackupSummary>, String> {
    let dir = backups_dir(app)?;
    let entries = match std::fs::read_dir(&dir) {
        Ok(entries) => entries,
        Err(_) => return Ok(Vec::new()),
    };

    let mut summaries = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);
        // A single corrupt file shouldn't make the whole list unreadable.
        let Ok(bytes) = std::fs::read(&path) else {
            continue;
        };
        let Ok(record) = serde_json::from_slice::<BackupRecord>(&bytes) else {
            continue;
        };
        summaries.push(BackupSummary {
            id: record.id,
            created_at: record.created_at,
            label: record.label,
            pack_name: record.pack_name,
            event_count: record.snapshots.len(),
            size_bytes,
        });
    }

    // Newest first. Ids embed a millisecond timestamp, but created_at is the
    // value the user actually sees, so sort on that.
    summaries.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(summaries)
}

pub fn read(app: &tauri::AppHandle, id: &str) -> Result<BackupRecord, String> {
    let path = record_path(app, id)?;
    let bytes = std::fs::read(&path).map_err(|_| "Backup not found.".to_string())?;
    serde_json::from_slice(&bytes).map_err(|e| e.to_string())
}

pub fn delete(app: &tauri::AppHandle, id: &str) -> Result<(), String> {
    let path = record_path(app, id)?;
    std::fs::remove_file(&path).map_err(|e| e.to_string())
}
