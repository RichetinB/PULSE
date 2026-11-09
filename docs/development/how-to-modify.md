# How to Modify PULSE (Planned Workflow)

## Modify a page
1. Update the screen component in `apps/desktop/src/pages`.
2. Keep state model in feature/application adapters.
3. Add/update UI tests for changed states (empty/loading/success/partial/error).

## Add a metric
1. Add metric contract in `pulse-domain`.
2. Implement computation in `pulse-analytics`.
3. Add fixture/golden tests with formula + limits documented.
4. Expose via versioned DTO to UI.

## Add a weakness diagnostic
1. Define rule + thresholds in analytics config.
2. Emit diagnostic payload with confidence + alternatives.
3. Add insufficient-data branch.
4. Test true/false/edge cases.

## Add a training recommendation
1. Extend `TrainingRecommender` contract.
2. Implement rule using weaknesses/history/constraints.
3. Add explainability fields (reason + expected indicators).
4. Validate with representative scenarios.

## Modify database
1. Add versioned migration.
2. Keep backward-compatible reads where possible.
3. Add migration tests and rollback checks.

## Debug replay import
1. Reproduce with fixture.
2. Check parser/normalization logs.
3. Confirm beatmap resolution step.
4. Record failure category and confidence.
