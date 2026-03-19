import NewsCarousel from "../components/NewsCarousel";
import AntiCheatStatus from "../components/AntiCheatStatus";
import SecurityMetrics from "../components/SecurityMetrics";
import TwitchStreams from "../components/TwitchStreams";
import LaunchBar from "../components/LaunchBar";
import { useLauncherState } from "../hooks/useLauncherState";
import "./HomePage.css";

/**
 * Home Page — Main dashboard layout composing all panels.
 * Uses useLauncherState as single source of truth for the verification pipeline.
 * Left side: News + Twitch Streams (white-label content)
 * Right side: Anti-Cheat Status + Security Metrics (Sentinel Core fixed)
 * Bottom: Launch bar with version selector
 */
function HomePage() {
  const launcher = useLauncherState();

  // Derive anti-cheat shield status from pipeline stage
  const shieldStatus = launcher.isReady ? "active" as const
    : launcher.stage === "error" ? "error" as const
    : "scanning" as const;

  return (
    <div className="home-page">
      <div className="home-grid">
        {/* Left column — Server content (white-label) */}
        <div className="home-left">
          <NewsCarousel />
          <TwitchStreams />
        </div>

        {/* Right column — Sentinel Core panels (fixed) */}
        <div className="home-right">
          <AntiCheatStatus status={shieldStatus} />
          <SecurityMetrics modules={launcher.modules} progress={launcher.progress} />
        </div>
      </div>

      {/* Bottom launch bar with version selector */}
      <LaunchBar
        stage={launcher.stage}
        stageLabel={launcher.stageLabel}
        progress={launcher.progress}
        isReady={launcher.isReady}
        selectedVersion={launcher.selectedVersion}
        detectedArch={launcher.detectedArch}
        resolvedExecPath={launcher.resolvedExecPath}
        onSelectVersion={launcher.setSelectedVersion}
        onLaunch={launcher.triggerLaunch}
      />
    </div>
  );
}

export default HomePage;
