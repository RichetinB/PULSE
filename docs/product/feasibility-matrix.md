# Replay Feasibility Matrix (Phase 0)

| Feature | Required Data | Source | Method | Reliability | Known Limits | Complexity |
|---|---|---|---|---|---|---|
| Replay import validation | file bytes, metadata | local replay file | signature/version checks | Medium | format drift | Low |
| Timing error distribution | hit timing deltas | replay + beatmap timing points | normalize hit windows, aggregate bins | Medium | incomplete events in some formats | Medium |
| Unstable Rate (UR) | hit offsets | replay events | stddev * 10 (osu convention) | Medium | requires reliable hit offset reconstruction | Medium |
| BPM-segment performance | beatmap timing sections + hit outcomes | local beatmap + replay | segment map by BPM, join outcomes | Medium | missing beatmap or timing changes | Medium |
| Pattern-level diagnostics | object stream + inferred pattern labels | beatmap + replay | pattern classifier + grouped errors | Low/Medium | noisy pattern inference | High |
| Session trend tracking | multiple analyzed sessions + timestamps | local DB | longitudinal aggregation | High | sparse data early on | Medium |
| Training recommendations | weaknesses/history/objectives | analytics + user settings | rule-based scoring | Medium | causal certainty impossible | Medium |

## Format notes
- **VERIFIED**: stable and lazer formats differ and require explicit version-aware parsing paths.
- **INFERRED**: unified normalized event model is feasible if parser confidence is preserved per field.
- **UNKNOWN**: exact fidelity for all mods and edge-case scoring variants until fixtures are collected.
- **BLOCKED**: legal/licensing validation for third-party parser candidates requires dependency shortlist.
