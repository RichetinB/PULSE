# Contributing to PULSE

## Workflow
1. Sync branch.
2. Make focused, reversible changes.
3. Add/adjust tests for behavior changes.
4. Run targeted validations.
5. Update docs impacted by your change.

## Commit style
Use atomic commits with prefixes:
- `feat:`
- `fix:`
- `refactor:`
- `test:`
- `docs:`
- `chore:`

## Architectural guardrails
- Domain logic must stay independent from UI and DB frameworks.
- Replay analysis must remain deterministic and explainable.
- Imported files are untrusted input (validate size/path/content assumptions).

## Phase-0 note
The repository is in framing mode. Follow docs in `docs/` before adding new modules.
