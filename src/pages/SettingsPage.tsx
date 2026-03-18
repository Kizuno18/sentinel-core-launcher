import { useState } from "react";
import { useConfig } from "../config/serverConfig";
import "./SettingsPage.css";

/**
 * Settings Page — Launcher configuration options.
 * Shows server name (from config) and user-configurable toggles.
 */
function SettingsPage() {
  const config = useConfig();

  // Settings state — persisted via Tauri store in production
  const [settings, setSettings] = useState({
    closeOnLaunch: false,
    autoUpdate: true,
    startWithWindows: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-section">
        <div className="settings-group">
          <ToggleItem
            label="Close launcher on game start"
            description="Automatically close the launcher when the game is launched"
            checked={settings.closeOnLaunch}
            onChange={() => toggleSetting("closeOnLaunch")}
          />
          <ToggleItem
            label="Auto-update on start"
            description="Check for updates automatically when the launcher starts"
            checked={settings.autoUpdate}
            onChange={() => toggleSetting("autoUpdate")}
          />
          <ToggleItem
            label="Start with Windows"
            description="Launch the application when Windows starts"
            checked={settings.startWithWindows}
            onChange={() => toggleSetting("startWithWindows")}
          />
        </div>
      </div>

      {/* Build info footer */}
      <div className="settings-footer">
        <span className="settings-build">
          {config.server.name} Launcher — Build 1.0.0
        </span>
        <span className="settings-sentinel">
          Sentinel Core v{config.sentinel.version}
        </span>
      </div>
    </div>
  );
}

/** Reusable toggle switch item */
function ToggleItem({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-item" onClick={onChange}>
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        <span className="toggle-description">{description}</span>
      </div>
      <div className={`toggle-switch ${checked ? "on" : ""}`}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}

export default SettingsPage;
