# PULSE Desktop

The desktop foundation is a React + TypeScript frontend hosted by Tauri 2.
Replay analysis, persistence, and training modules are intentionally not
implemented in this slice.

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
