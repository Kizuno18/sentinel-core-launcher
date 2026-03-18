import { createContext, useContext } from "react";
import type { AppConfig } from "./types";
import serverConfigJson from "../../server.config.json";

// Default Sentinel Core configuration (never changes between servers)
const SENTINEL_DEFAULTS = {
  apiEndpoint: "https://api.sentinelcore.gg",
  borderColor: "#00f0ff",
  version: "1.0.0",
};

// Default game configuration
const GAME_DEFAULTS = {
  basePath: "./otclient",
  versions: [],
  defaultVersion: "",
  checksums: {
    enabled: false,
    manifestUrl: "",
  },
};

// Default server configuration (fallback for missing fields)
const SERVER_DEFAULTS = {
  name: "OTServer",
  logo: "",
  accentColor: "#00f0ff",
  game: GAME_DEFAULTS,
  socials: {},
  news: [],
};

/**
 * Load and merge the server configuration with defaults.
 * Sentinel Core config is always enforced — servers cannot override it.
 */
export function loadConfig(): AppConfig {
  const raw = serverConfigJson as unknown as AppConfig;

  return {
    server: {
      ...SERVER_DEFAULTS,
      ...raw.server,
      game: {
        ...GAME_DEFAULTS,
        ...raw.server?.game,
        checksums: {
          ...GAME_DEFAULTS.checksums,
          ...raw.server?.game?.checksums,
        },
      },
    },
    sentinel: {
      ...SENTINEL_DEFAULTS,
      ...raw.sentinel,
      // Enforce Sentinel Core border color — white-label cannot override this
      borderColor: SENTINEL_DEFAULTS.borderColor,
    },
  };
}

/** Global app configuration singleton */
export const appConfig = loadConfig();

/** React context for accessing config in components */
export const ConfigContext = createContext<AppConfig>(appConfig);

/** Hook to access the app configuration */
export function useConfig(): AppConfig {
  return useContext(ConfigContext);
}

/**
 * Inject CSS custom properties from the config into the document root.
 * Called once at app startup to apply white-label theme.
 */
export function applyConfigTheme(config: AppConfig): void {
  const root = document.documentElement;
  root.style.setProperty("--server-accent", config.server.accentColor);
  root.style.setProperty("--sentinel-border", config.sentinel.borderColor);
  root.style.setProperty("--sentinel-glow", `${config.sentinel.borderColor}40`);
}
