# Sentinel Core Launcher

> Cybernetic Defense System Launcher for OTClient — Powered by [Sentinel Core](https://sentinelcore.gg)

A premium Tauri 2.0 + React + TypeScript desktop launcher for OTClient with built-in anti-cheat protection. Built with a **white-label architecture** so each OTServ can fully customize their branding.

## Features

- 🛡️ **Anti-Cheat Status** — Real-time monitoring of all 4 Sentinel Core modules
- 📰 **News Carousel** — Server configurable news and updates
- 📺 **Twitch Streams** — Live streams integration *(under development)*
- 🎮 **One-Click Launch** — Start OTClient with anti-cheat injection
- 🎨 **White-Label** — Full server branding customization via `server.config.json`
- 🔒 **Sentinel Core Fixed** — Anti-cheat panel and cyan borders always present

## Anti-Cheat Modules

| Module | Method | Description |
|--------|--------|-------------|
| Handle Verification | Custom | Detects debuggers, cheat engines, and bots opening handles |
| Input Telemetry | Custom | Monitors for automated input/mouse simulation |
| DLL Integrity | BattlEye-like | Verifies DLL signatures against a whitelist |
| Screen Capture | EMAC | Black screen protection against screen readers |

## White-Label Customization

Each OTServ customizes their launcher by editing `server.config.json`:

```json
{
  "server": {
    "name": "Your Server Name",
    "logo": "./assets/your-logo.png",
    "accentColor": "#ff8c00",
    "gameExecutable": "./otclient/otclient.exe",
    "socials": {
      "discord": "https://discord.gg/...",
      "instagram": "...",
      "youtube": "...",
      "website": "..."
    },
    "news": [...]
  }
}
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Tauri 2.0 (Rust)
- **Styling**: Vanilla CSS with design tokens
- **Fonts**: Inter + JetBrains Mono

## Development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Rust](https://rustup.rs/)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Setup

```bash
# Install frontend dependencies
npm install

# Run in development mode (frontend + Tauri)
npm run tauri dev

# Run frontend only (browser dev)
npm run dev
```

### Docker (Frontend Only)

```bash
# Start frontend dev server via Docker
docker compose -f docker-compose.yml up
```

### Build

```bash
# Build production executable
npm run tauri build
```

## Project Structure

```
sentinel-core-launcher/
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   │   ├── Titlebar.tsx      # Custom window titlebar
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── AntiCheatStatus.tsx   # Shield status (Sentinel fixed)
│   │   ├── SecurityMetrics.tsx   # Module grid (Sentinel fixed)
│   │   ├── NewsCarousel.tsx  # News banner (white-label)
│   │   ├── TwitchStreams.tsx  # Stream grid (under dev)
│   │   └── LaunchBar.tsx     # Launch button + progress
│   ├── pages/                # Page layouts
│   │   ├── HomePage.tsx      # Main dashboard
│   │   └── SettingsPage.tsx  # App settings
│   ├── config/               # White-label config system
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── serverConfig.ts   # Config loader + React context
│   └── styles/               # Global CSS design system
├── src-tauri/                # Rust/Tauri backend
│   ├── src/lib.rs            # Tauri commands
│   └── tauri.conf.json       # Window config
├── docker/                   # Docker config
├── server.config.json        # White-label config (edit this!)
└── package.json
```

## License

Proprietary — Sentinel Core Team
