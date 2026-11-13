# PULSE

PULSE is a local-first desktop performance coach for **osu!standard**.

Current status: **Desktop foundation and initial optional API foundation**.

## Goals
- Analyze replay performance with deterministic, explainable metrics.
- Detect measurable weaknesses with confidence levels.
- Recommend practical local training sessions.
- Keep all core functionality available offline.

## Planned stack (under validation)
- Desktop shell: **Tauri 2**
- UI: **React + TypeScript + Vite**
- Core/analytics/storage adapters: **Rust crates**
- Local storage: **SQLite**
- Optional web API: **NestJS + TypeScript + PostgreSQL**

The API is an optional online foundation for future web and synchronization
features. It is not required for local replay import or analysis; replay
parsing and performance analysis remain Rust responsibilities.

## Desktop development

The first executable foundation lives in `apps/desktop` and uses Tauri 2,
React, TypeScript, Vite, and Rust.

### Prerequisites on Windows

- Node.js 22+
- pnpm 9.15.5 (Corepack can provide the pinned version)
- Rust stable with Cargo
- Microsoft C++ Build Tools
- WebView2 Runtime

From `apps/desktop`:

```powershell
corepack pnpm install
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm tauri dev
```

The browser Vite server validates the frontend without the desktop shell.
Tauri and Windows builds are validated by the Windows CI job; they are not
claimed as locally verified from environments without Cargo and Windows.

## API development

The optional NestJS API lives in `apps/api`. It currently provides only a
database-aware health endpoint; authentication, replay synchronization, and a
web client are not implemented.

See [apps/api/README.md](apps/api/README.md) for environment setup, Docker
Compose, and API checks. PostgreSQL is bound to the local loopback interface
only, and the desktop continues to work without the API.

## Downloading PULSE for Windows

Windows installers are attached to releases whose tags use the `v*` format,
such as `v0.1.0`. Download the `.exe` installer from the release page, run it,
and launch PULSE from the Start menu or installed shortcut. The installer uses
the Microsoft WebView2 bootstrapper; an internet connection may be needed on
the first install if WebView2 is not already present.

PULSE is currently distributed as an NSIS installer. A portable ZIP is not
published unless it has been validated as a standalone application build.

Because release binaries are currently unsigned, Windows SmartScreen may show
a warning. Verify that the download came from this repository's GitHub Release,
then select **More info** and **Run anyway** only if you trust the source.

## Repository docs
- Architecture overview: `docs/architecture/overview.md`
- Module map: `docs/architecture/module-map.md`
- Feasibility matrix: `docs/product/feasibility-matrix.md`
- ADRs: `docs/adr/`
- Contribution guide: `CONTRIBUTING.md`
- Current state and next steps: `docs/development/current-state.md`
- API development: `apps/api/README.md`
- Windows distribution: `docs/development/windows-distribution.md`
- Replay import: `docs/development/replay-import.md`

## Current phase deliverable
This repository contains the Phase-0 framing artifacts and the initial Phase-1
desktop foundation. Replay import, analytics, persistence, and training remain
outside this PR and do not produce placeholder performance results.
