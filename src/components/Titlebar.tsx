import { useConfig } from "../config/serverConfig";
import "./Titlebar.css";

/**
 * Custom frameless window titlebar.
 * - Server logo + name (white-label customizable)
 * - Sentinel Core badge (fixed, always visible)
 * - Window controls (minimize, close)
 */
function Titlebar() {
  const config = useConfig();

  // Tauri window controls — uses Tauri API when available
  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      console.log("[Titlebar] Minimize — Tauri API not available (dev mode)");
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      console.log("[Titlebar] Close — Tauri API not available (dev mode)");
    }
  };

  return (
    <header className="titlebar" data-tauri-drag-region>
      {/* Server branding — white-label zone */}
      <div className="titlebar-left">
        <div className="titlebar-logo">
          {config.server.logo ? (
            <img src={config.server.logo} alt={config.server.name} className="titlebar-logo-img" />
          ) : (
            <div className="titlebar-logo-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sentinel-border)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          )}
          <span className="titlebar-server-name">{config.server.name}</span>
        </div>
      </div>

      {/* Sentinel Core badge — fixed, always visible */}
      <div className="titlebar-center">
        <span className="sentinel-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--sentinel-border)">
            <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
          </svg>
          Sentinel Core
        </span>
      </div>

      {/* Window controls */}
      <div className="titlebar-right">
        <button className="titlebar-btn titlebar-btn-minimize" onClick={handleMinimize} title="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1" rx="0.5" fill="currentColor" />
          </svg>
        </button>
        <button className="titlebar-btn titlebar-btn-close" onClick={handleClose} title="Close">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Titlebar;
