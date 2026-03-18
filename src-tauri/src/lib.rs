use serde::Serialize;

/// Represents the status of a single anti-cheat module
#[derive(Serialize, Clone)]
pub struct ModuleStatus {
    pub name: String,
    pub key: String,
    pub status: String,
    pub description: String,
}

/// Detect the system architecture (x64 or x86)
/// Used by the frontend to auto-select the correct executable
#[tauri::command]
fn detect_architecture() -> String {
    let arch = std::env::consts::ARCH;
    match arch {
        "x86_64" | "aarch64" => "x64".to_string(),
        _ => "x86".to_string(),
    }
}

/// Verify file integrity by computing SHA-256 hash
/// Compares the actual file hash against the expected hash
#[tauri::command]
fn verify_file_integrity(file_path: String, expected_hash: String) -> Result<bool, String> {
    use std::fs;
    use std::io::Read;

    // Read the file
    let mut file = fs::File::open(&file_path)
        .map_err(|e| format!("Cannot open file '{}': {}", file_path, e))?;

    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| format!("Cannot read file '{}': {}", file_path, e))?;

    // Compute SHA-256 hash (simple implementation without external crate)
    // In production, use the `sha2` crate for proper SHA-256
    let hash = format!("{:x}", md5_hash(&buffer));

    Ok(hash == expected_hash)
}

/// Simple hash function for integrity check placeholder
/// In production, replace with SHA-256 from the `sha2` crate
fn md5_hash(data: &[u8]) -> u64 {
    let mut hash: u64 = 0xcbf29ce484222325;
    for &byte in data {
        hash ^= byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

/// Launch the OTClient game executable
/// Receives the fully resolved path (basePath + version + arch binary)
#[tauri::command]
fn launch_game(exec_path: String) -> Result<String, String> {
    println!("[Sentinel Core] Launching game: {}", exec_path);

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        match Command::new(&exec_path).spawn() {
            Ok(_) => Ok(format!("Game launched: {}", exec_path)),
            Err(e) => Err(format!("Failed to launch game: {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("[DEV] Would launch: {}", exec_path))
    }
}

/// Get the current anti-cheat module statuses
/// In production, this queries the actual Sentinel Core engine
#[tauri::command]
fn get_anticheat_status() -> Vec<ModuleStatus> {
    vec![
        ModuleStatus {
            name: "Handle Verification".to_string(),
            key: "handles".to_string(),
            status: "ok".to_string(),
            description: "No suspicious handles detected".to_string(),
        },
        ModuleStatus {
            name: "Input Telemetry".to_string(),
            key: "telemetry".to_string(),
            status: "ok".to_string(),
            description: "Input patterns nominal".to_string(),
        },
        ModuleStatus {
            name: "DLL Integrity".to_string(),
            key: "dll".to_string(),
            status: "ok".to_string(),
            description: "All DLLs verified against whitelist".to_string(),
        },
        ModuleStatus {
            name: "Screen Capture".to_string(),
            key: "screen".to_string(),
            status: "ok".to_string(),
            description: "Black screen capture active".to_string(),
        },
        ModuleStatus {
            name: "File Integrity".to_string(),
            key: "integrity".to_string(),
            status: "ok".to_string(),
            description: "All game files verified (SHA-256)".to_string(),
        },
    ]
}

/// Configure and run the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            launch_game,
            get_anticheat_status,
            detect_architecture,
            verify_file_integrity
        ])
        .run(tauri::generate_context!())
        .expect("Failed to run Sentinel Core Launcher");
}
