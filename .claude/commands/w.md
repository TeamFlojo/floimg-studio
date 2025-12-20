---
description: End-of-session wrap (saves context)
---

# Wrap Session

Save context before ending or compaction.

## Steps

1. **Identify current task**

2. **Summarize**:
   - What was accomplished
   - Key decisions
   - Open questions
   - Next steps

3. **Update context doc**:
   - Add to Session Notes
   - Update Next Steps

4. **Update task file** if progress made

5. **Sync PROJECT_STATUS.md**

6. **Commit**:
   ```bash
   git add vault/pm/ PROJECT_STATUS.md
   git commit -m "docs: wrap session for {ID}"
   ```

7. **Output**:
   ```
   ## Session Wrap

   **Task**: {ID}

   ### Accomplished
   - {items}

   ### Next Steps
   1. {actions}

   Context saved.
   ```
