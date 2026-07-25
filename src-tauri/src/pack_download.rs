// Downloads a single sound-pack asset (.wav) from the configured remote
// catalog host into this app's own data directory. Scoped narrowly on
// purpose — this is not a general-purpose downloader:
//   - only https, only an explicitly allow-listed host suffix
//   - pack_id/file_name must be plain path segments (no separators, no ..)
//   - file_name must end in .wav
// TODO: replace with the real R2 public/custom domain once the bucket exists.
const ALLOWED_HOST_SUFFIXES: &[&str] = &["r2.dev", "r2.cloudflarestorage.com"];

fn is_allowed_host(url: &url::Url) -> bool {
    match url.host_str() {
        Some(host) => ALLOWED_HOST_SUFFIXES
            .iter()
            .any(|suffix| host == *suffix || host.ends_with(&format!(".{suffix}"))),
        None => false,
    }
}

fn is_safe_segment(segment: &str) -> bool {
    !segment.is_empty()
        && !segment.contains('/')
        && !segment.contains('\\')
        && segment != "."
        && segment != ".."
}

pub async fn download_asset(
    app: &tauri::AppHandle,
    url: String,
    pack_id: String,
    file_name: String,
) -> Result<String, String> {
    use tauri::Manager;

    let parsed = url::Url::parse(&url).map_err(|e| format!("URL inválida: {e}"))?;
    if parsed.scheme() != "https" {
        return Err("Apenas URLs https são permitidas.".to_string());
    }
    if !is_allowed_host(&parsed) {
        return Err(format!(
            "Host não autorizado para download: {:?}",
            parsed.host_str()
        ));
    }
    if !is_safe_segment(&pack_id) || !is_safe_segment(&file_name) {
        return Err("Identificador de pack ou nome de arquivo inválido.".to_string());
    }
    if !file_name.to_lowercase().ends_with(".wav") {
        return Err("Somente arquivos .wav são aceitos.".to_string());
    }

    let response = reqwest::get(parsed).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("Falha ao baixar: HTTP {}", response.status()));
    }
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    let mut dest_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    dest_dir.push("packs");
    dest_dir.push(&pack_id);
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;

    let mut dest_file = dest_dir;
    dest_file.push(&file_name);
    std::fs::write(&dest_file, &bytes).map_err(|e| e.to_string())?;

    Ok(dest_file.to_string_lossy().to_string())
}
