import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for Sentinel Core Launcher
// @see https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Prevent vite from obscuring Rust errors
  clearScreen: false,

  // Tauri expects a fixed port; fail if port is taken
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Tell vite to ignore watching `src-tauri` for Tauri HMR
      ignored: ["**/src-tauri/**"],
    },
  },
}));
