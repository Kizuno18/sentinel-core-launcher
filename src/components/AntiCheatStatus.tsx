import type { AntiCheatState } from "../config/types";
import "./AntiCheatStatus.css";

/** Status label and color mapping */
const STATUS_MAP: Record<AntiCheatState, { label: string; color: string }> = {
  active: { label: "ACTIVE", color: "var(--sentinel-green)" },
  scanning: { label: "SCANNING", color: "var(--sentinel-yellow)" },
  error: { label: "ERROR", color: "var(--sentinel-red)" },
  inactive: { label: "INACTIVE", color: "var(--text-muted)" },
};

interface AntiCheatStatusProps {
  status: AntiCheatState;
}

/**
 * Anti-Cheat Status panel — SENTINEL CORE FIXED component.
 * Shows a shield icon with pulse animation and current protection status.
 * Now wired to useLauncherState — shield stays "scanning" until integrity passes.
 */
function AntiCheatStatus({ status }: AntiCheatStatusProps) {
  const { label, color } = STATUS_MAP[status];

  return (
    <div className="anticheat-status sentinel-card">
      <h3 className="anticheat-title">Anti-Cheat Status</h3>

      <div className="anticheat-shield-container">
        <div className={`anticheat-shield ${status}`} style={{ "--shield-color": color } as React.CSSProperties}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z"
              fill={`${color}20`}
              stroke={color}
              strokeWidth="1.5"
            />
            {status === "active" && (
              <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {status === "scanning" && (
              <circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="4 2">
                <animateTransform attributeName="transform" type="rotate" from="0 12 13" to="360 12 13" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {status === "error" && (
              <>
                <line x1="10" y1="10" x2="14" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="10" x2="10" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>
        <span className="anticheat-label" style={{ color }}>{label}</span>
        <span className="anticheat-sublabel" style={{ color }}>
          {status === "active" ? "System Protected" : status === "scanning" ? "Verifying integrity..." : "Protection unavailable"}
        </span>
      </div>
    </div>
  );
}

export default AntiCheatStatus;
