---
argument-hint: [TASK-ID]
description: Start working on a task
---

# Start Task

Check `<command-args>` for task ID. If none, check PROJECT_STATUS.md "Next Up".

## Steps

1. **Validate task exists**:
   ```bash
   ls vault/pm/tasks/ vault/pm/bugs/ | grep "{TASK-ID}"
   ```

2. **Read task file** for details

3. **Create feature branch** (root tasks only):
   ```bash
   # Task: feat/, Bug: fix/
   git checkout -b {prefix}/{ID}-{slug}
   ```
   Subtasks use parent's branch.

4. **Update task status**:
   - Set `status: in-progress`
   - Update `updated` date

5. **Update PROJECT_STATUS.md**:
   - Move to "Current Focus"
   - Mark IN PROGRESS

6. **Commit**:
   ```bash
   git add vault/pm/ PROJECT_STATUS.md
   git commit -m "chore: start {ID}"
   ```

7. **Output**:
   ```
   Started {ID}: {Title}

   Branch: {prefix}/{ID}-{slug}
   Status: in-progress

   Acceptance Criteria:
   - [ ] ...

   Ready to implement. Use /ctx for notes.
   ```
