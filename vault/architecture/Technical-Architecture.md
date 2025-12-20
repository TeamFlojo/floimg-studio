# Technical Architecture

imgflo-studio system architecture.

## Overview

imgflo-studio is a visual workflow builder that provides a drag-and-drop interface for creating imgflo workflows.

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
│  │       imgflo Integration        │   │
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
│              imgflo Core                │
│    (Image Generation & Transforms)      │
└─────────────────────────────────────────┘
```

## Package Structure

### @imgflo-studio/frontend
- **Framework**: React 19 + Vite
- **Visual Editor**: React Flow for node-based editing
- **State**: Zustand for local state, TanStack Query for server state
- **Styling**: Tailwind CSS

### @imgflo-studio/backend
- **Framework**: Fastify 5
- **Plugins**: CORS, Multipart uploads, WebSocket
- **Integration**: imgflo for workflow execution

### @imgflo-studio/shared
- TypeScript type definitions shared between packages

## Data Flow

### Workflow Creation
1. User drags nodes from palette onto canvas
2. React Flow manages node/edge state
3. Zustand store persists workflow locally
4. Optional: Save to backend for persistence

### Workflow Execution
1. Frontend sends workflow to `/api/execute`
2. Backend converts visual workflow to imgflo format
3. imgflo executes the workflow
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

## imgflo Integration

### Capability Auto-Discovery

imgflo-studio uses imgflo's `getCapabilities()` API to auto-discover available generators and transforms. This ensures the visual editor always reflects what the execution engine supports.

```
┌─────────────────────────────────────────┐
│           Backend Startup               │
├─────────────────────────────────────────┤
│ 1. initializeClient() called            │
│    - Creates imgflo client              │
│    - Registers generator plugins        │
│    - Caches capabilities                │
│                                         │
│ 2. getCapabilities() returns:           │
│    - generators[] with schemas          │
│    - transforms[] with schemas          │
│    - saveProviders[]                    │
│                                         │
│ 3. Registry converts schemas            │
│    - imgflo schemas → NodeDefinitions   │
│    - Served via /api/nodes/*            │
└─────────────────────────────────────────┘
```

### Plugin Registration

Generators are registered in `src/imgflo/setup.ts`:

```typescript
import { createClient } from "imgflo";
import qr from "imgflo-qr";
import mermaid from "imgflo-mermaid";
import quickchart from "imgflo-quickchart";

const client = createClient({...});
client.registerGenerator(qr());
client.registerGenerator(mermaid());
client.registerGenerator(quickchart());
```

### Schema Mapping

imgflo schemas are converted to studio NodeDefinitions:

| imgflo Type | Studio Type |
|-------------|-------------|
| `GeneratorSchema` | `NodeDefinition` (type: "generator") |
| `TransformOperationSchema` | `NodeDefinition` (type: "transform") |
| `ParameterSchema` | `ParamField` |

### Dependencies

imgflo packages are installed from npm:

```json
{
  "dependencies": {
    "imgflo": "^0.5.0",
    "imgflo-qr": "^0.2.0",
    "imgflo-mermaid": "^0.2.0",
    "imgflo-quickchart": "^0.2.0"
  }
}
```

For local development with unpublished imgflo changes, add `"../imgflo/packages/*"` to `pnpm-workspace.yaml` and use `workspace:*` protocol.

### Key Files

| File | Purpose |
|------|---------|
| `src/imgflo/setup.ts` | Client initialization and plugin registration |
| `src/imgflo/registry.ts` | Schema conversion and capability exposure |
| `src/imgflo/executor.ts` | Workflow execution using shared client |
