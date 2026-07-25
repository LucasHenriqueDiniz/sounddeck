pub mod pack_download;
pub mod windows_sound;

use windows_sound::{EventSnapshot, SoundEvent};

#[tauri::command]
fn scan_events() -> Result<Vec<SoundEvent>, String> {
    windows_sound::list_events().map_err(|e| e.to_string())
}

#[tauri::command]
fn apply_test_sound(app: String, event: String, wav_path: String) -> Result<EventSnapshot, String> {
    windows_sound::apply_sound(&app, &event, &wav_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_sound(snapshot: EventSnapshot) -> Result<(), String> {
    windows_sound::restore_sound(&snapshot).map_err(|e| e.to_string())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_events,
            apply_test_sound,
            restore_sound,
            download_pack_asset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
