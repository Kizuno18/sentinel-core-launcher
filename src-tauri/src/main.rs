// Sentinel Core Launcher — Main entry point for desktop builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    sentinel_core_launcher_lib::run()
}
