use astral_core::{Library, https_url};
use std::{fs, sync::Mutex};
use tauri::Manager;
struct Storage(Mutex<()>);
#[tauri::command]
fn load_library(app: tauri::AppHandle, storage: tauri::State<Storage>) -> Result<Library,String> {
    let _guard = storage.0.lock().map_err(|e| e.to_string())?;
    let path = app.path().app_data_dir().map_err(|e|e.to_string())?.join("library.json");
    if !path.exists() { return Ok(Library::default()); }
    serde_json::from_slice(&fs::read(path).map_err(|e|e.to_string())?).map_err(|e|e.to_string())
}
#[tauri::command]
fn save_library(app: tauri::AppHandle, storage: tauri::State<Storage>, library: Library) -> Result<(),String> {
    let _guard = storage.0.lock().map_err(|e|e.to_string())?;
    let dir = app.path().app_data_dir().map_err(|e|e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e|e.to_string())?;
    let tmp = dir.join("library.tmp");
    fs::write(&tmp,serde_json::to_vec(&library).map_err(|e|e.to_string())?).map_err(|e|e.to_string())?;
    fs::rename(tmp,dir.join("library.json")).map_err(|e|e.to_string())
}
#[tauri::command]
async fn addon_request(manifest_url: String, resource: Option<String>) -> Result<serde_json::Value,String> {
    let base = https_url(&manifest_url)?;
    if !base.path().ends_with("/manifest.json") || base.query().is_some() || base.fragment().is_some() { return Err("L’URL doit se terminer par /manifest.json".into()); }
    let target = match resource {
        None => base,
        Some(r) => {
            if !["catalog/", "meta/", "stream/"].iter().any(|p|r.starts_with(p)) || r.contains("..") || r.contains('?') || r.contains('#') { return Err("Ressource invalide".into()); }
            base.join(&r).map_err(|e|e.to_string())?
        }
    };
    let response = reqwest::Client::builder().https_only(true).redirect(reqwest::redirect::Policy::none()).timeout(std::time::Duration::from_secs(15)).build().map_err(|e|e.to_string())?
        .get(target).send().await.map_err(|e|e.to_string())?.error_for_status().map_err(|e|e.to_string())?;
    if response.content_length().unwrap_or(0) > 4_000_000 { return Err("Réponse trop volumineuse".into()); }
    let mut response = response;
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|e|e.to_string())? { if bytes.len()+chunk.len()>4_000_000 { return Err("Réponse trop volumineuse".into()); } bytes.extend_from_slice(&chunk); }
    serde_json::from_slice(&bytes).map_err(|e|e.to_string())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default().manage(Storage(Mutex::new(()))).invoke_handler(tauri::generate_handler![load_library,save_library,addon_request]).run(tauri::generate_context!()).expect("Impossible de démarrer Astral");
}
