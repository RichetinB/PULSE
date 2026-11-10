#[tauri::command]
fn get_app_version() -> Result<&'static str, String> {
    Ok(env!("CARGO_PKG_VERSION"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_version])
        .run(tauri::generate_context!())
        .expect("error while running PULSE desktop application");
}
