import { useConfig } from "../config/serverConfig";
import type { SystemArch } from "../config/types";
import "./VersionSelector.css";

interface VersionSelectorProps {
  selectedVersion: string;
  detectedArch: SystemArch;
  onSelect: (versionId: string) => void;
  disabled: boolean;
}

/**
 * Version Selector dropdown — shows available OTClient renderers (DirectX, OpenGL)
 * with auto-detected architecture badge. White-label configurable via server.config.json.
 */
function VersionSelector({ selectedVersion, detectedArch, onSelect, disabled }: VersionSelectorProps) {
  const config = useConfig();
  const { versions } = config.server.game;

  if (versions.length <= 1) {
    // Single version — no dropdown needed, just show the arch badge
    return (
      <div className="version-selector-single">
        <span className="version-arch-badge">{detectedArch.toUpperCase()}</span>
        {versions[0] && <span className="version-label-text">{versions[0].label}</span>}
      </div>
    );
  }

  return (
    <div className="version-selector">
      <div className="version-select-wrapper">
        <select
          className="version-select"
          value={selectedVersion}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        {/* Dropdown chevron */}
        <svg className="version-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <span className="version-arch-badge">{detectedArch.toUpperCase()}</span>
    </div>
  );
}

export default VersionSelector;
