---
description: "Use when parsing replay or beatmap files, resolving paths, persisting imported data, or logging import failures."
applyTo:
  - "crates/pulse-replay/**"
  - "crates/pulse-storage/**"
---

# Replay Input Safety

- Treat replay and beatmap files as untrusted input.
- Validate paths, file sizes, format versions, and parser bounds before processing.
- Do not log secrets or sensitive personal identifiers.
- Preserve parse confidence and explicit failure categories where the data model supports them.
