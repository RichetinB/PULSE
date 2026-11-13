# Architecture Overview

## Scope
PULSE is a local-first desktop app for replay analysis and coaching, with an
optional API foundation for future web and account features. Desktop replay
import and analysis must continue to work offline without the API.

## Recommended architecture
Layered modular structure inspired by Clean/Hexagonal boundaries:

- **Presentation**: desktop UI (Tauri + React)
- **Application**: use-case orchestration
- **Domain**: core entities, rules, invariants
- **Infrastructure**: replay files, beatmaps, SQLite, optional APIs
- **API**: NestJS HTTP boundary and Prisma/PostgreSQL access for future online features
- **Analytics**: deterministic metrics + diagnostics
- **Training**: recommendation logic
- **AI (optional)**: explanation assistant over computed results

## Data flow (high-level)
1. Import replay file.
2. Parse + normalize events.
3. Resolve beatmap metadata.
4. Compute metrics and confidence.
5. Persist raw + derived results with algorithm versions.
6. Render reports and training recommendations.

The online API is a separate, optional path for future account and
synchronization use cases. Replay parsing and analysis remain in Rust and are
not moved into NestJS. The initial API foundation currently exposes only
`GET /api/health`; it does not implement authentication or synchronization.

## Boundary rules
- Domain depends on nothing outside itself.
- Application depends on domain contracts.
- Infrastructure implements application/domain ports.
- UI calls application services via versioned DTOs.
