# Context: T-2025-001 Workflow Persistence

**Task**: [[T-2025-001-workflow-persistence]]
**Created**: 2025-12-22
**Status**: In Progress

## Overview

Studio looks polished but is functionally incomplete - users can build workflows but can't save them. This is the #1 blocker to real usage.

Two features for tonight:

1. **Workflow Persistence** - Save/load workflows to localStorage
2. **Code Export** - Show JavaScript equivalent in export modal

## Files to Modify

1. `packages/frontend/src/stores/workflowStore.ts`
   - Add zustand/persist middleware
   - Add SavedWorkflow type
   - Add save/load/delete/rename/duplicate methods
   - Track activeWorkflowId and hasUnsavedChanges

2. `packages/frontend/src/components/Toolbar.tsx`
   - Add tabs to export modal (YAML | JavaScript)
   - Add Save button with Cmd+S shortcut
   - Add "My Workflows" button

3. `packages/frontend/src/App.tsx`
   - Integrate WorkflowLibrary panel

## Files to Create

1. `packages/frontend/src/components/WorkflowLibrary.tsx`
   - Slide-out panel with workflow list
   - Save/Load/Delete/Rename/Duplicate actions

2. `packages/frontend/src/utils/codeGenerator.ts`
   - Generate JavaScript code from nodes/edges
   - Topological sort for dependency order

## Data Schema

```typescript
interface SavedWorkflow {
  id: string; // e.g., "wf_1703289600_abc123"
  name: string; // User-provided name
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
  templateId?: string; // If loaded from template
}
```

## Key Decisions

- Use localStorage (not cloud) for v1 - simplest path
- Storage key: `floimg-studio-workflows`
- Pattern: follow settingsStore.ts persist implementation

## Open Questions

- None for v1 - ship and learn

## Next Steps

1. Complete workflowStore.ts persistence
2. Create WorkflowLibrary component
3. Add code export to Toolbar
4. Create codeGenerator utility
5. Test and polish
