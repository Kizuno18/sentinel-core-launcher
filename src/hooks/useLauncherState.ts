import { useState, useEffect, useCallback } from "react";
import type { LauncherStage, SystemArch, ModuleStatus } from "../config/types";
import { useConfig } from "../config/serverConfig";

/** Verification pipeline modules — Sentinel Core FIXED */
const PIPELINE_MODULES: ModuleStatus[] = [
  {
    name: "Handle Verification",
    key: "handles",
    status: "scanning",
    description: "Detects attached debuggers and cheat engines",
  },
  {
    name: "Input Telemetry",
    key: "telemetry",
    status: "scanning",
    description: "Monitors for automated input simulation",
  },
  {
    name: "DLL Integrity",
    key: "dll",
    status: "scanning",
    description: "Verifies DLL signatures against whitelist",
  },
  {
    name: "Screen Capture",
    key: "screen",
    status: "scanning",
    description: "Black screen protection (EMAC method)",
  },
  {
    name: "File Integrity",
    key: "integrity",
    status: "scanning",
    description: "SHA-256 verification of game files",
  },
];

/** Stage-to-label mapping for the progress bar */
const STAGE_LABELS: Record<LauncherStage, string> = {
  checking_update: "Checking for updates...",
  updating: "Downloading update...",
  verifying_exe: "Verifying executable...",
  verifying_dlls: "Verifying DLL integrity...",
  verifying_assets: "Verifying game assets...",
  ready: "Ready to play",
  launching: "Launching...",
  error: "Verification failed",
};

/** Map stages to which module index gets verified at each stage */
const STAGE_MODULE_MAP: Partial<Record<LauncherStage, number>> = {
  checking_update: -1,
  verifying_exe: 0,    // Handle Verification
  verifying_dlls: 2,   // DLL Integrity
  verifying_assets: 4, // File Integrity
};

interface LauncherState {
  /** Current pipeline stage */
  stage: LauncherStage;
  /** Human-readable label for the current stage */
  stageLabel: string;
  /** Update/verification progress percentage (0-100) */
  progress: number;
  /** Whether the launcher is ready to launch */
  isReady: boolean;
  /** Selected game version ID (e.g., "dx9", "opengl") */
  selectedVersion: string;
  /** Auto-detected system architecture */
  detectedArch: SystemArch;
  /** Current module statuses */
  modules: ModuleStatus[];
  /** Resolved executable path for the selected version + arch */
  resolvedExecPath: string;
  /** Change the selected version */
  setSelectedVersion: (id: string) => void;
  /** Trigger the launch */
  triggerLaunch: () => void;
}

/**
 * Central state hook for the entire launch pipeline.
 * Manages: update check → verification → ready → launch.
 * Single source of truth used by LaunchBar, SecurityMetrics, AntiCheatStatus.
 */
export function useLauncherState(): LauncherState {
  const config = useConfig();
  const { game } = config.server;

  const [stage, setStage] = useState<LauncherStage>("checking_update");
  const [progress, setProgress] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(game.defaultVersion || game.versions[0]?.id || "");
  const [detectedArch, setDetectedArch] = useState<SystemArch>("x64");
  const [modules, setModules] = useState<ModuleStatus[]>(PIPELINE_MODULES.map((m) => ({ ...m })));

  // Detect system architecture via Tauri or fallback
  useEffect(() => {
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const arch = await invoke<string>("detect_architecture");
        setDetectedArch(arch === "x86" ? "x86" : "x64");
      } catch {
        // Fallback: browser dev mode — default to x64
        setDetectedArch("x64");
      }
    })();
  }, []);

  // Set a module to verified status
  const verifyModule = useCallback((moduleIndex: number) => {
    setModules((prev) =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, status: "ok" as const } : m))
    );
  }, []);

  // Simulate the verification pipeline with realistic timings
  useEffect(() => {
    const pipeline: Array<{ stage: LauncherStage; delay: number; progress: number; moduleIdx?: number }> = [
      { stage: "checking_update", delay: 0, progress: 5 },
      { stage: "verifying_exe", delay: 1200, progress: 25, moduleIdx: 0 },
      { stage: "verifying_dlls", delay: 2400, progress: 50, moduleIdx: 1 },
      { stage: "verifying_dlls", delay: 3200, progress: 65, moduleIdx: 2 },
      { stage: "verifying_assets", delay: 4000, progress: 80, moduleIdx: 3 },
      { stage: "verifying_assets", delay: 4800, progress: 95, moduleIdx: 4 },
      { stage: "ready", delay: 5500, progress: 100 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    pipeline.forEach(({ stage: s, delay, progress: p, moduleIdx }) => {
      const timer = setTimeout(() => {
        setStage(s);
        setProgress(p);
        if (moduleIdx !== undefined) {
          verifyModule(moduleIdx);
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [verifyModule]);

  // Resolve the executable path based on selected version + detected architecture
  const resolvedExecPath = (() => {
    const version = game.versions.find((v) => v.id === selectedVersion);
    if (!version) return "";

    const archPath = version.architectures[detectedArch] || version.architectures.x86 || "";
    return `${game.basePath}/${archPath}`;
  })();

  const triggerLaunch = useCallback(() => {
    if (stage !== "ready") return;
    setStage("launching");
  }, [stage]);

  return {
    stage,
    stageLabel: STAGE_LABELS[stage],
    progress,
    isReady: stage === "ready",
    selectedVersion,
    detectedArch,
    modules,
    resolvedExecPath,
    setSelectedVersion,
    triggerLaunch,
  };
}

// Re-export for convenience
export { STAGE_LABELS, STAGE_MODULE_MAP };
