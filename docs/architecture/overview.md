# Architecture Overview

## Scope
PULSE is a local-first desktop app for replay analysis and coaching.

## Recommended architecture
Layered modular structure inspired by Clean/Hexagonal boundaries:

- **Presentation**: desktop UI (Tauri + React)
- **Application**: use-case orchestration
- **Domain**: core entities, rules, invariants
- **Infrastructure**: replay files, beatmaps, SQLite, optional APIs
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

## Boundary rules
- Domain depends on nothing outside itself.
- Application depends on domain contracts.
- Infrastructure implements application/domain ports.
- UI calls application services via versioned DTOs.
