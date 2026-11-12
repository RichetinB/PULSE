#[tauri::command]
fn get_app_version() -> Result<&'static str, String> {
    Ok(env!("CARGO_PKG_VERSION"))
}

#[tauri::command]
fn import_replay(path: String) -> Result<pulse_replay::ReplaySummary, String> {
    pulse_replay::parse_file(path).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_app_version, import_replay])
        .run(tauri::generate_context!())
        .expect("error while running PULSE desktop application");
}
