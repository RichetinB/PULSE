# PULSE Desktop

The desktop foundation is a React + TypeScript frontend hosted by Tauri 2.
Replay analysis, persistence, and training modules are intentionally not
implemented in this slice.

## Frontend structure

- `src/app` owns application composition and navigation.
- `src/components/layout` contains the platform-independent application shell.
- `src/pages` contains the dashboard and explicit not-yet-implemented sections.
- `src/features/replay-analyzer` owns replay import UI state, display, and
  platform-independent replay summary contracts.
- `src/platform/desktop` contains Tauri commands and the native file picker.

The app composition root provides the desktop import service to the Replay
Analyzer. UI and feature code depend on a small service contract rather than
Tauri APIs. If a web client is added, keep its API adapter outside these
features and share only platform-independent contracts and UI. Extract a
workspace package only when a second frontend exists and the shared surface is
clear; do not make local replay analysis depend on a backend.

## Commands

From `apps/desktop`:

```powershell
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm tauri dev
```

`pnpm tauri dev` requires the Rust toolchain, Microsoft C++ Build Tools, and
WebView2 on Windows. The browser-only `pnpm dev` command is useful for working
on the presentation layer without the desktop shell.
