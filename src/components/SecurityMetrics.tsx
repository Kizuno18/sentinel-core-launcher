import type { ModuleStatus } from "../config/types";
import "./SecurityMetrics.css";

/** Status indicator dot with color mapping */
function StatusDot({ status }: { status: ModuleStatus["status"] }) {
  const colorMap = {
    ok: "var(--sentinel-green)",
    warning: "var(--sentinel-yellow)",
    error: "var(--sentinel-red)",
    scanning: "var(--sentinel-yellow)",
  };

  return (
    <span
      className={`status-dot ${status}`}
      style={{ "--dot-color": colorMap[status] } as React.CSSProperties}
    />
  );
}

interface SecurityMetricsProps {
  modules: ModuleStatus[];
  progress?: number;
}

/**
 * Security Metrics panel — SENTINEL CORE FIXED component.
 * Shows the status of all 5 anti-cheat + integrity modules.
 * Now wired to useLauncherState for real pipeline progression.
 */
function SecurityMetrics({ modules, progress }: SecurityMetricsProps) {
  return (
    <div className="security-metrics sentinel-card">
      <h3 className="metrics-title">Security Metrics</h3>
      <div className="metrics-grid">
        {modules.map((module) => (
          <div key={module.key} className="metric-item">
            <div className="metric-header">
              <StatusDot status={module.status} />
              <span className="metric-name">{module.name}</span>
            </div>
            <span className={`metric-status-label ${module.status}`}>
              {module.status === "ok" ? "Verified" : 
               module.status === "scanning" ? (
                 (module.key === "integrity" && progress !== undefined && progress >= 50 && progress < 95)
                   ? `Downloading (${progress}%)`
                   : "Scanning..."
               ) : module.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityMetrics;
