---
argument-hint: [request]
description: Escape hatch - bypass PM workflow
---

# Escape Hatch

Skip task management for quick tasks.

## When to Use
- Quick exploration
- One-line fixes
- Research without tracking
- Experimentation

## When NOT to Use
- Multi-file changes
- Features needing tracking
- Multi-session work

## Behavior

Skip task creation and status updates. Proceed directly with request.

```
Bypass mode: Proceeding without task tracking.
```

If work grows, stop and use /p.
