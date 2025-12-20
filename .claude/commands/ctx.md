---
argument-hint: [note]
description: Update context doc with a note
---

# Update Context

Add a note to the current task's context document.

## Steps

1. **Find current task** from PROJECT_STATUS.md or git branch

2. **Find context doc**: `vault/pm/_context/{ID}-context.md`

3. **Categorize note**:
   - "decided/decision" → Key Decisions
   - "question/unclear" → Open Questions
   - "problem/challenge" → Challenges Encountered
   - Default → Session Notes

4. **Append with timestamp**

5. **Commit**:
   ```bash
   git add vault/pm/_context/
   git commit -m "docs: update context for {ID}"
   ```

6. **Confirm**:
   ```
   Updated context for {ID}
   Added to: {Section}
   ```
