---
argument-hint: [work description]
description: Plan a new work item (Task/Bug)
---

# Plan Work Item

Check `<command-args>` for the work description.

If empty or a question, abort and respond normally.

---

## Classification

1. **Bug?** - Fixing broken behavior
2. **Task?** (Default) - Everything else

## Steps

1. **Classify** (Task or Bug)

2. **Generate next ID**:
   ```bash
   ls vault/pm/tasks/ 2>/dev/null | grep -oP 'T-2025-\d{3}(?!\.)' | sort -u | tail -1
   ls vault/pm/bugs/ 2>/dev/null | grep -oP 'BUG-2025-\d{3}' | sort -u | tail -1
   ```
   Increment by 1. If none exist, start at 001.

3. **Check for subtask context**:
   - Check git branch for parent task ID
   - If on task branch, ask: "Create as subtask? (yes/no)"

4. **Create work item file**:
   - Task: `vault/pm/tasks/{ID}-{slug}.md`
   - Bug: `vault/pm/bugs/{ID}-{slug}.md`
   - Use template, fill frontmatter and description
   - Generate 3-5 acceptance criteria

5. **Create context doc** (root tasks):
   - Location: `vault/pm/_context/{ID}-context.md`

6. **Sync PROJECT_STATUS.md**:
   - Add to "Next Up" section
   - Update timestamp

7. **Commit**:
   ```bash
   git add vault/pm/ PROJECT_STATUS.md
   git commit -m "chore: create {type} {ID}"
   ```

8. **Output**:
   ```
   Created {Type} {ID}

   Files:
   - vault/pm/{folder}/{ID}-{slug}.md
   - vault/pm/_context/{ID}-context.md

   Next: /s {ID} to start work
   ```

## Rules

- Always create work item AND context doc
- Commit immediately
- Suggest /s to start
