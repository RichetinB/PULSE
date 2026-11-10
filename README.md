# PULSE

PULSE is a local-first desktop performance coach for **osu!standard**.

Current status: **Phase 1 foundation (desktop shell)**.

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

## Repository docs
- Architecture overview: `docs/architecture/overview.md`
- Module map: `docs/architecture/module-map.md`
- Feasibility matrix: `docs/product/feasibility-matrix.md`
- ADRs: `docs/adr/`
- Contribution guide: `CONTRIBUTING.md`
- Current state and next steps: `docs/development/current-state.md`

## Current phase deliverable
This repository contains the Phase-0 framing artifacts and the initial Phase-1
desktop foundation. Replay import, analytics, persistence, and training remain
outside this PR and do not produce placeholder performance results.
