import type { LauncherStage, SystemArch } from "../config/types";
import VersionSelector from "./VersionSelector";
import "./LaunchBar.css";

interface LaunchBarProps {
  stage: LauncherStage;
  stageLabel: string;
  progress: number;
  isReady: boolean;
  selectedVersion: string;
  detectedArch: SystemArch;
  resolvedExecPath: string;
  onSelectVersion: (id: string) => void;
  onLaunch: () => void;
}

/**
 * Launch Bar — Bottom bar with version dropdown, "LAUNCH GAME" button, and progress.
 * Launch is BLOCKED until integrity verification completes (stage === "ready").
 */
function LaunchBar({
  stage,
  stageLabel,
  progress,
  isReady,
  selectedVersion,
  detectedArch,
  resolvedExecPath,
  onSelectVersion,
  onLaunch,
}: LaunchBarProps) {
  const isLaunching = stage === "launching";
  const isVerifying = !isReady && !isLaunching && stage !== "error";

  const handleLaunch = async () => {
    if (!isReady) return;
    onLaunch();

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("launch_game", { execPath: resolvedExecPath });
    } catch {
      console.log("[LaunchBar] Tauri API not available (dev mode). Would launch:", resolvedExecPath);
    }
  };

  // Determine button label based on pipeline stage
  const buttonLabel = (() => {
    if (isLaunching) return "LAUNCHING...";
    if (stage === "error") return "RETRY";
    if (isVerifying) return "VERIFYING...";
    return "LAUNCH GAME";
  })();

  return (
    <div className="launch-bar">
      {/* Version selector dropdown */}
      <VersionSelector
        selectedVersion={selectedVersion}
        detectedArch={detectedArch}
        onSelect={onSelectVersion}
        disabled={!isReady}
      />

      {/* Launch button — blocked until verified */}
      <button
        className={`launch-button ${isLaunching ? "launching" : ""} ${isVerifying ? "verifying" : ""}`}
        onClick={handleLaunch}
        disabled={!isReady || isLaunching}
      >
        {isReady ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="launch-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="30 70" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
        <span>{buttonLabel}</span>
      </button>

      {/* Progress / Status section */}
      <div className="launch-progress-section">
        <div className="launch-progress-info">
          <span className="launch-progress-label">{stageLabel}</span>
          {progress < 100 && (
            <span className="launch-progress-percent">{progress}%</span>
          )}
        </div>
        {progress < 100 && (
          <div className="launch-progress-bar">
            <div
              className="launch-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Sentinel Core watermark */}
      <div className="launch-sentinel-mark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--sentinel-border)" opacity="0.5">
          <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
        </svg>
        <span>Protected by Sentinel Core</span>
      </div>
    </div>
  );
}

export default LaunchBar;

// Re-export type for HomePage convenience
export type { LaunchBarProps };
