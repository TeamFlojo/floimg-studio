---
description: Close the current task
---

# Close Task

## Steps

1. **Identify current task** from PROJECT_STATUS.md or git branch

2. **Read task** and verify acceptance criteria

3. **Check subtasks** - all must be complete before parent closes

4. **Validate**:
   ```bash
   pnpm -r typecheck
   pnpm -r build
   ```

5. **Update task file**:
   - Set `status: completed`
   - Fill "Completed" date

6. **Update PROJECT_STATUS.md**:
   - Move to "Recent Progress"

7. **Commit**:
   ```bash
   git add vault/pm/ PROJECT_STATUS.md
   git commit -m "chore: complete {ID}"
   ```

8. **Ask about PR**:
   > "Create pull request? (yes/no)"

9. **Output**:
   ```
   Completed {ID}: {Title}

   Status: completed
   PR: {URL if created}

   Use /st to see next tasks
   ```
