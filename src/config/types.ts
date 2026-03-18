// Server configuration types for white-label customization
// Each OTServ customizes their launcher via server.config.json

/** News article displayed in the hero carousel */
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

/** Social media links configurable per server */
export interface SocialLinks {
  discord?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

/** Architecture-specific executable paths for a game version */
export interface ArchitecturePaths {
  x64?: string;
  x86?: string;
}

/** A single OTClient version/renderer option (e.g., DirectX, OpenGL) */
export interface GameVersion {
  id: string;
  label: string;
  architectures: ArchitecturePaths;
}

/** Checksum verification configuration */
export interface ChecksumConfig {
  enabled: boolean;
  manifestUrl: string;
}

/** Game configuration — executables, versions, integrity check */
export interface GameConfig {
  basePath: string;
  versions: GameVersion[];
  defaultVersion: string;
  checksums: ChecksumConfig;
}

/** Server-specific configuration (white-label customizable) */
export interface ServerConfig {
  name: string;
  logo: string;
  accentColor: string;
  game: GameConfig;
  socials: SocialLinks;
  news: NewsItem[];
}

/** Sentinel Core configuration (fixed, not customizable) */
export interface SentinelConfig {
  apiEndpoint: string;
  borderColor: string;
  version: string;
}

/** Root configuration schema */
export interface AppConfig {
  server: ServerConfig;
  sentinel: SentinelConfig;
}

/** Anti-cheat module status */
export interface ModuleStatus {
  name: string;
  key: string;
  status: "ok" | "warning" | "error" | "scanning";
  description: string;
}

/** Overall anti-cheat status */
export type AntiCheatState = "active" | "scanning" | "error" | "inactive";

/** Launcher pipeline stages */
export type LauncherStage =
  | "checking_update"
  | "updating"
  | "verifying_exe"
  | "verifying_dlls"
  | "verifying_assets"
  | "ready"
  | "launching"
  | "error";

/** Detected system architecture */
export type SystemArch = "x64" | "x86";
