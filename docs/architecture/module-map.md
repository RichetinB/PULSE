# Module Map

## apps/desktop (planned)
- Responsibility: UI, navigation, interaction states.
- Public API: user-facing screens and command handlers.
- Depends on: application DTO contracts.
- Tests: UI unit tests + selected E2E flows.

## crates/pulse-domain (planned)
- Responsibility: entities, value objects, invariants.
- Public API: domain types and validation rules.
- Depends on: none.
- Tests: unit/property tests.

## crates/pulse-application (planned)
- Responsibility: use cases and orchestration.
- Public API: service interfaces for UI and automation.
- Depends on: domain + ports.
- Tests: use-case tests with fakes.

## crates/pulse-replay (planned)
- Responsibility: replay format parsing + normalization.
- Public API: ReplayParser contract implementation.
- Depends on: domain/application contracts.
- Tests: fixture/golden tests.

## crates/pulse-analytics (planned)
- Responsibility: metrics and weakness diagnostics.
- Public API: PerformanceAnalyzer + WeaknessDetector.
- Depends on: domain types.
- Tests: unit/golden/statistical validation tests.

## crates/pulse-training (planned)
- Responsibility: training recommendations from diagnostics/history.
- Public API: TrainingRecommender.
- Depends on: domain + analytics outputs.
- Tests: rule-based recommendation tests.

## crates/pulse-storage (planned)
- Responsibility: SQLite repositories + migrations.
- Public API: repository implementations.
- Depends on: domain/application contracts.
- Tests: migration + repository integration tests.
