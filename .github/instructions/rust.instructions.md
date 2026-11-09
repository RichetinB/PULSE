---
description: "Use when creating or modifying Rust domain, application, replay, analytics, training, or storage code."
applyTo: "crates/**/*.rs"
---

# Rust Conventions

- Prefer explicit error types over `unwrap` or `expect` in production paths.
- Keep parsing and analytics deterministic.
- Validate file, path, size, and parse boundaries at IO inputs.
- Preserve the module boundaries in `docs/architecture/module-map.md`.
