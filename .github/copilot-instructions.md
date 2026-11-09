# PULSE Copilot Guidelines

PULSE is a local-first osu!standard performance coach. Keep the modular boundaries
described in [the architecture overview](../docs/architecture/overview.md) and
[the module map](../docs/architecture/module-map.md).

## Engineering rules

- Keep domain logic independent from UI, storage, and provider concerns.
- Use explicit, versioned contracts across module boundaries.
- Prefer deterministic, explainable analytics over opaque heuristics.
- Treat replay and beatmap files as untrusted input.
- Make focused, reversible changes with matching tests and documentation.

## Workflow

- Read [CONTRIBUTING.md](../CONTRIBUTING.md) and the relevant documents in `docs/`
  before changing architecture or public contracts.
- Inspect existing code and tests before editing; avoid broad refactors.
- Run the smallest relevant validation, then report commands and results.
- Use atomic commits with the prefixes documented in
  [CONTRIBUTING.md](../CONTRIBUTING.md).
- Report limits as VERIFIED, INFERRED, UNKNOWN, or BLOCKED.

The Claude Code configuration in [CLAUDE.md](../CLAUDE.md) remains supported and
must not be removed or rewritten to add Copilot support.
