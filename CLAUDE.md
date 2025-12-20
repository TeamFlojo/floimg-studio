# floimg-studio - Claude Code Quick Reference

Visual drag-and-drop workflow builder for floimg.

## Project Overview

- **Type**: Public monorepo
- **Stack**: React 19, Fastify 5, TypeScript, pnpm workspaces
- **Packages**: 3 (frontend, backend, shared)

## Quick Start

```bash
pnpm install          # Install all dependencies

# Development (run both in parallel)
pnpm dev              # Starts both frontend and backend

# Or separately:
pnpm --filter @floimg-studio/backend dev    # Port 3001
pnpm --filter @floimg-studio/frontend dev   # Port 5173
```

## Workflow Commands

### Task Lifecycle
- `/p [description]` - Plan new work (creates vault task)
- `/s T-YYYY-NNN` - Start task (creates branch, updates status)
- `/c` - Close current task
- `/ctx [note]` - Update context doc
- `/st` - Quick status check
- `/w` - End-of-session wrap

### Escape Hatch
- `/x [request]` - Bypass PM workflow for quick tasks

## File Locations

```
packages/
├── backend/
│   └── src/
│       ├── floimg/       # floimg integration (registry, executor)
│       ├── routes/       # API endpoints
│       └── storage/      # Image storage
├── frontend/
│   └── src/
│       ├── components/   # UI components
│       ├── editor/       # React Flow canvas
│       ├── stores/       # Zustand state
│       └── api/          # TanStack Query client
└── shared/               # TypeScript types

vault/
├── _meta/                # Guidelines
├── _templates/           # Task templates
├── architecture/         # Technical docs
├── product/              # Product vision
└── pm/
    ├── tasks/
    ├── bugs/
    └── _context/
```

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Flow** - Visual node editor
- **Zustand 5** - State management
- **TanStack Query** - Server state
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Fastify 5** - API server
- **floimg** - Image processing engine
- **WebSocket** - Real-time execution

### Shared
- TypeScript type definitions

## Key Patterns

### Zustand Store
```typescript
const useWorkflowStore = create((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
}));
```

### Fastify Route
```typescript
fastify.post('/api/execute', async (request, reply) => {
  const workflow = request.body;
  const result = await executor.run(workflow);
  return result;
});
```

### TanStack Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['nodes'],
  queryFn: () => fetch('/api/nodes/generators').then(r => r.json()),
});
```

## Agents

- `coordinator` - Multi-package work (frontend + backend)
- `full-stack-dev` - Feature implementation
- `code-reviewer` - Code quality review
- `vault-organizer` - Documentation maintenance

## Dependency on floimg

floimg-studio depends on the floimg package:
- Backend uses floimg for workflow execution
- Version specified in `packages/backend/package.json`
- Use `/sync-releases` (from parent) to coordinate updates

## Chrome DevTools MCP

**To enable browser debugging:**

```bash
# Launch Chrome with remote debugging (macOS)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 --headless=new &
```

Then Claude can use:
- `mcp__chrome-devtools__navigate_page` - Go to a URL
- `mcp__chrome-devtools__take_screenshot` - Capture the page
- `mcp__chrome-devtools__take_snapshot` - Get DOM state
- `mcp__chrome-devtools__get_console_logs` - See console output

If you see "Failed to fetch browser webSocket URL" - Chrome isn't running. Launch it yourself with the command above.

## Server Logs

Dev servers write to log files that any Claude session can read:

- `logs/backend.log` - Fastify backend (port 3001)
- `logs/frontend.log` - Vite frontend (port 5173)

To check for errors, use the Read tool on these files or:
```bash
tail -50 logs/backend.log
```

## Key Principles

1. **Read PROJECT_STATUS.md first**
2. **Use /p before multi-step work**
3. **Evergreen docs have no temporal language**
4. **Commit frequently with conventional format**
