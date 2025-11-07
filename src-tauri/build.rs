fn main() {
    // Skip icon requirement for Windows build if icon not found
    #[cfg(windows)]
    {
        let icon_path = std::path::Path::new("icons/icon.ico");
        if !icon_path.exists() {
            println!("cargo:warning=Icon file not found, skipping Windows icon resource");
        }
    }
    
    tauri_build::build()
}

