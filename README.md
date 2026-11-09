# PULSE

PULSE is a local-first desktop performance coach for **osu!standard**.

Current status: **Phase 0 (Discovery / Framing)**.

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

## Repository docs
- Architecture overview: `docs/architecture/overview.md`
- Module map: `docs/architecture/module-map.md`
- Feasibility matrix: `docs/product/feasibility-matrix.md`
- ADRs: `docs/adr/`
- Contribution guide: `CONTRIBUTING.md`
- Current state and next steps: `docs/development/current-state.md`

## Current phase deliverable
This repository now contains framing artifacts (architecture, feasibility, MVP acceptance criteria, and operating rules) before major implementation.
