# Vault Writing Guidelines

Standards for documentation in the imgflo-studio vault.

## Document Types

### Evergreen Documents (architecture/, product/)
- Describe current state, not future plans
- No temporal language: avoid "will", "recently", "soon", "currently", "now"
- Update when reality changes, not when plans change
- Use wiki links: `[[Document Name]]`

### PM Documents (pm/)
- Temporal language allowed
- Track with task IDs (T-YYYY-NNN, BUG-YYYY-NNN)
- Link to relevant evergreen docs
- Include dates and status

### Context Documents (pm/_context/)
- Working notes during task execution
- Decisions, challenges, open questions
- Can be messy - distill to evergreen docs when done

## Formatting Standards

### Frontmatter
```yaml
---
tags: [type/task]
status: backlog
priority: p2
created: 2025-12-08
updated: 2025-12-08
parent:
children: []
---
```

### Status Values
- `backlog` - Not yet started
- `in-progress` - Actively working
- `paused` - Temporarily stopped
- `completed` - Done
- `deferred` - Postponed
- `cancelled` - Will not be done

### Priority Values
- `p0` - Critical
- `p1` - High priority
- `p2` - Normal (default)
- `p3` - Low priority

## File Naming

- Use kebab-case: `My-Document-Name.md`
- Tasks: `T-YYYY-NNN-short-description.md`
- Bugs: `BUG-YYYY-NNN-short-description.md`
