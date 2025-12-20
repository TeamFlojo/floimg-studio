# Technical Architecture

floimg-studio system architecture.

## Overview

floimg-studio is a visual workflow builder that provides a drag-and-drop interface for creating floimg workflows.

```
┌─────────────────────────────────────────┐
│           Frontend (React 19)           │
│  ┌─────────────────────────────────┐   │
│  │     React Flow Canvas           │   │
│  │   (Visual Node Editor)          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────┐ ┌─────────────────┐   │
│  │ Node Palette│ │ Node Inspector  │   │
│  └─────────────┘ └─────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Zustand State + TanStack Query │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    │ HTTP / WebSocket
                    ▼
┌─────────────────────────────────────────┐
│           Backend (Fastify 5)           │
│  ┌─────────────────────────────────┐   │
│  │         API Routes              │   │
│  │  /api/nodes, /api/execute, etc. │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │       floimg Integration        │   │
│  │  (Registry, Executor)           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │       Storage Layer             │   │
│  │  (Generated/Uploaded Images)    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              floimg Core                │
│    (Image Generation & Transforms)      │
└─────────────────────────────────────────┘
```

## Package Structure

### @floimg-studio/frontend
- **Framework**: React 19 + Vite
- **Visual Editor**: React Flow for node-based editing
- **State**: Zustand for local state, TanStack Query for server state
- **Styling**: Tailwind CSS

### @floimg-studio/backend
- **Framework**: Fastify 5
- **Plugins**: CORS, Multipart uploads, WebSocket
- **Integration**: floimg for workflow execution

### @floimg-studio/shared
- TypeScript type definitions shared between packages

## Data Flow

### Workflow Creation
1. User drags nodes from palette onto canvas
2. React Flow manages node/edge state
3. Zustand store persists workflow locally
4. Optional: Save to backend for persistence

### Workflow Execution
1. Frontend sends workflow to `/api/execute`
2. Backend converts visual workflow to floimg format
3. floimg executes the workflow
4. Results returned to frontend
5. Generated images stored and displayed

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nodes/generators` | GET | List available generators |
| `/api/nodes/transforms` | GET | List available transforms |
| `/api/execute` | POST | Execute a workflow |
| `/api/images/*` | GET | Retrieve generated images |
| `/api/uploads` | CRUD | Manage uploaded images |

## State Management

### Frontend State (Zustand)
- `nodes` - React Flow nodes
- `edges` - React Flow edges
- `selectedNode` - Currently selected node
- `executionStatus` - Workflow execution state

### Server State (TanStack Query)
- Node definitions (generators, transforms)
- Uploaded images
- Execution results

## floimg Integration

### Capability Auto-Discovery

floimg-studio uses floimg's `getCapabilities()` API to auto-discover available generators and transforms. This ensures the visual editor always reflects what the execution engine supports.

```
┌─────────────────────────────────────────┐
│           Backend Startup               │
├─────────────────────────────────────────┤
│ 1. initializeClient() called            │
│    - Creates floimg client              │
│    - Registers generator plugins        │
│    - Caches capabilities                │
│                                         │
│ 2. getCapabilities() returns:           │
│    - generators[] with schemas          │
│    - transforms[] with schemas          │
│    - saveProviders[]                    │
│                                         │
│ 3. Registry converts schemas            │
│    - floimg schemas → NodeDefinitions   │
│    - Served via /api/nodes/*            │
└─────────────────────────────────────────┘
```

### Plugin Registration

Generators are registered in `src/floimg/setup.ts`:

```typescript
import { createClient } from "floimg";
import qr from "floimg-qr";
import mermaid from "floimg-mermaid";
import quickchart from "floimg-quickchart";

const client = createClient({...});
client.registerGenerator(qr());
client.registerGenerator(mermaid());
client.registerGenerator(quickchart());
```

### Schema Mapping

floimg schemas are converted to studio NodeDefinitions:

| floimg Type | Studio Type |
|-------------|-------------|
| `GeneratorSchema` | `NodeDefinition` (type: "generator") |
| `TransformOperationSchema` | `NodeDefinition` (type: "transform") |
| `ParameterSchema` | `ParamField` |

### Dependencies

floimg packages are installed from npm:

```json
{
  "dependencies": {
    "floimg": "^0.5.0",
    "floimg-qr": "^0.2.0",
    "floimg-mermaid": "^0.2.0",
    "floimg-quickchart": "^0.2.0"
  }
}
```

For local development with unpublished floimg changes, add `"../floimg/packages/*"` to `pnpm-workspace.yaml` and use `workspace:*` protocol.

### Key Files

| File | Purpose |
|------|---------|
| `src/floimg/setup.ts` | Client initialization and plugin registration |
| `src/floimg/registry.ts` | Schema conversion and capability exposure |
| `src/floimg/executor.ts` | Workflow execution using shared client |
