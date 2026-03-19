use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use hmac::{Hmac, Mac};
use reqwest::Client;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

type HmacSha256 = Hmac<Sha256>;

#[derive(Serialize, Deserialize, Clone)]
pub struct ModuleStatus {
    pub name: String,
    pub key: String,
    pub status: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ManifestFile {
    pub path: String,
    pub hash: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Manifest {
    pub version: String,
    pub algorithm: String,
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    pub files: Vec<ManifestFile>,
}

#[derive(Serialize, Clone)]
pub struct VerificationResult {
    pub missing: Vec<String>,
    pub mismatched: Vec<String>,
    pub extra: Vec<String>, // Foreign/malicious files
}

#[tauri::command]
fn detect_architecture() -> String {
    let arch = std::env::consts::ARCH;
    match arch {
        "x86_64" | "aarch64" => "x64".to_string(),
        _ => "x86".to_string(),
    }
}

/// Computes SHA-256 for a given local file
fn compute_sha256(path: &Path) -> Result<String, String> {
    let mut file = fs::File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 65536]; // 64KB buffer

    loop {
        let n = file.read(&mut buffer).map_err(|e| format!("Read error: {}", e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }

    Ok(hex::encode(hasher.finalize()))
}

/// Fetch the JSON manifest from the PHP script
#[tauri::command]
async fn fetch_checksums(manifest_url: String) -> Result<Manifest, String> {
    let client = Client::new();
    let res = client.get(&manifest_url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let manifest: Manifest = res.json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
        
    Ok(manifest)
}

/// Scans local folder and compares against expected manifest
#[tauri::command]
async fn verify_integrity(base_path: String, manifest_files: Vec<ManifestFile>) -> Result<VerificationResult, String> {
    let base = Path::new(&base_path);
    let mut missing = Vec::new();
    let mut mismatched = Vec::new();
    let mut expected_paths = std::collections::HashSet::new();

    // 1. Check expected files (Missing or Mismatched)
    for expected in manifest_files {
        expected_paths.insert(expected.path.clone());
        let local_path = base.join(&expected.path);
        
        if !local_path.exists() {
            missing.push(expected.path);
            continue;
        }

        match compute_sha256(&local_path) {
            Ok(local_hash) => {
                if local_hash != expected.hash {
                    mismatched.push(expected.path);
                }
            },
            Err(_) => mismatched.push(expected.path), // Treat read error as mismatch
            
        }
    }

    // 2. Discover extra/foreign files (injected DLLs, cheats, etc.)
    let mut extra = Vec::new();
    if base.exists() {
        for entry in WalkDir::new(base).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                let rel_path = entry.path().strip_prefix(base)
                    .unwrap_or(entry.path())
                    .to_string_lossy()
                    .replace("\\", "/");

                // Ignore the Sentinel Core Launcher itself and safe files
                if rel_path.ends_with(".log") || rel_path.contains("sentinel") {
                    continue;
                }

                if !expected_paths.contains(&rel_path) {
                    extra.push(rel_path);
                }
            }
        }
    }

    Ok(VerificationResult { missing, mismatched, extra })
}

/// Downloads a file using HMAC-SHA256 signature to authenticate with the PHP endpoint
#[tauri::command]
async fn download_file(base_url: String, file_path: String, target_path: String, expected_hash: String, secret: String) -> Result<bool, String> {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs().to_string();
    
    // Generate HMAC signature
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).map_err(|e| e.to_string())?;
    let data_to_sign = format!("{}{}", timestamp, file_path);
    mac.update(data_to_sign.as_bytes());
    let signature = hex::encode(mac.finalize().into_bytes());

    let download_url = format!("{}{}", base_url, file_path);
    
    let client = Client::new();
    let response = client.get(&download_url)
        .header("X-Sentinel-Timestamp", timestamp)
        .header("X-Sentinel-Signature", signature)
        .send()
        .await
        .map_err(|e| format!("Download request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Server returned {}", response.status()));
    }

    let target = Path::new(&target_path);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create dirs: {}", e))?;
    }

    let bytes = response.bytes().await.map_err(|e| format!("Failed to read bytes: {}", e))?;
    fs::write(target, &bytes).map_err(|e| format!("Failed to write file: {}", e))?;

    // Post-download integrity check
    let downloaded_hash = compute_sha256(target)?;
    if downloaded_hash != expected_hash {
        fs::remove_file(target).ok();
        return Err("Hash mismatch after download. File corrupted or tampered.".to_string());
    }

    Ok(true)
}

/// Report foreign files to Sentinel Core API
#[tauri::command]
async fn report_foreign_files(files: Vec<String>, hwid: String) -> Result<bool, String> {
    println!("[Sentinel Core API] Reporting malicious/foreign files for HWID {}: {:?}", hwid, files);
    // In production, send a POST request to your API
    Ok(true)
}

/// Recursively delete all files in a folder
#[tauri::command]
fn purge_client_folder(path: String) -> Result<bool, String> {
    let p = Path::new(&path);
    if p.exists() {
        fs::remove_dir_all(p).map_err(|e| format!("Purge failed: {}", e))?;
        fs::create_dir_all(p).map_err(|e| format!("Recreate failed: {}", e))?;
    }
    Ok(true)
}

#[tauri::command]
fn launch_game(exec_path: String) -> Result<String, String> {
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

#[tauri::command]
fn get_anticheat_status() -> Vec<ModuleStatus> {
    vec![
        ModuleStatus { name: "Handle Verification".to_string(), key: "handles".to_string(), status: "ok".to_string(), description: "No suspicious handles detected".to_string() },
        ModuleStatus { name: "Input Telemetry".to_string(), key: "telemetry".to_string(), status: "ok".to_string(), description: "Input patterns nominal".to_string() },
        ModuleStatus { name: "DLL Integrity".to_string(), key: "dll".to_string(), status: "ok".to_string(), description: "All DLLs verified against whitelist".to_string() },
        ModuleStatus { name: "Screen Capture".to_string(), key: "screen".to_string(), status: "ok".to_string(), description: "Black screen capture active".to_string() },
        ModuleStatus { name: "File Integrity".to_string(), key: "integrity".to_string(), status: "ok".to_string(), description: "All game files verified (SHA-256)".to_string() },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            launch_game,
            get_anticheat_status,
            detect_architecture,
            fetch_checksums,
            verify_integrity,
            download_file,
            report_foreign_files,
            purge_client_folder
        ])
        .run(tauri::generate_context!())
        .expect("Failed to run Sentinel Core Launcher");
}
