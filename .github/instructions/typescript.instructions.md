---
description: "Use when creating or modifying the Tauri, React, or TypeScript desktop UI."
applyTo:
  - "apps/desktop/**/*.ts"
  - "apps/desktop/**/*.tsx"
---

# TypeScript Conventions

- Keep strict typing and avoid `any` unless the reason is documented.
- Keep UI components focused on presentation and interaction state.
- Move business logic to application or domain layers.
- Preserve versioned DTO contracts between the UI and Rust/application layers.
