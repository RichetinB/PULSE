# PULSE — Claude Code Operating Guide

## Vision
PULSE is a local-first desktop coach for osu!standard: import replay data, compute explainable metrics, detect weaknesses, and propose training plans.

## Architecture (target)
- `apps/desktop`: Tauri + React UI and desktop shell
- `crates/pulse-domain`: core models and invariants
- `crates/pulse-application`: use cases / orchestration
- `crates/pulse-replay`: replay parsing and normalization
- `crates/pulse-analytics`: metrics and diagnostics
- `crates/pulse-training`: recommendation engine
- `crates/pulse-storage`: SQLite repositories and migrations
- `docs`: architecture, ADRs, feasibility, dev guides

## Core conventions
1. Keep domain pure (no UI, DB, or provider dependencies).
2. Use explicit DTOs and versioned data contracts across boundaries.
3. Prefer deterministic and explainable analytics over opaque heuristics.
4. Treat replay and map files as untrusted input.
5. Make small, reversible commits with matching tests/docs.

## Development commands (to be enabled in Phase 1)
- `pnpm install`
- `pnpm dev`
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `cargo test --workspace`

## Change rules
- Inspect existing code and tests before editing.
- Avoid broad refactors unless explicitly requested.
- Update docs for behavior/API changes.
- Validate changed areas with targeted checks.
- Report limits as VERIFIED / INFERRED / UNKNOWN / BLOCKED.

## Validation procedure
1. Run targeted tests for changed modules.
2. Run lint/type checks for changed stacks.
3. Run security checks (CodeQL, dependency checks, secret scan).
4. Record commands and outputs in PR updates.

## References
- `README.md`
- `CONTRIBUTING.md`
- `docs/architecture/overview.md`
- `docs/development/current-state.md`
- `docs/product/feasibility-matrix.md`
