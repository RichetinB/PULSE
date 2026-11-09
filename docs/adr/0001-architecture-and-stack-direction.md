# ADR 0001: Architecture and Stack Direction

## Status
Accepted (Phase-0 baseline; revisitable in Phase-1)

## Context
PULSE needs a Windows desktop UX, local-first storage, deterministic analytics, and maintainable boundaries.

## Decision
Use a modular architecture with:
- Tauri 2 desktop shell
- React + TypeScript UI
- Rust crates for domain/application/replay/analytics/storage/training
- SQLite for local persistence

Python remains optional only for narrowly justified analytics/parsing advantages.

## Alternatives considered
1. **Electron + Node-only core**
   - Rejected: larger runtime footprint, weaker fit for high-performance parsing/analytics.
2. **.NET/WPF desktop with mixed libs**
   - Rejected: less direct cross-platform path and weaker reuse with web-centric UI tooling.
3. **Remote-first web app**
   - Rejected: conflicts with local-first and offline goals.

## Consequences
- Strong performance and native integration via Rust.
- Requires disciplined contract boundaries and build tooling setup.
- Early investment needed for DTO/versioning and migrations.
