# floimg-studio

A visual drag-and-drop workflow builder for [floimg](https://github.com/TeamFlojo/floimg).

Build image processing pipelines by connecting nodes on a canvas, then execute them to generate images.

## Features

- **Visual Editor** - React Flow-based canvas for building workflows
- **Node Types**:
  - **Generators** - Create images (shapes, QR codes, charts, diagrams, AI-generated)
  - **Transforms** - Modify images (resize, blur, convert, add text, etc.)
  - **Input** - Upload your own images as starting points
  - **Save** - Output to filesystem
- **Preview Toggle** - Show/hide previews on any node
- **Image Upload** - Drag-drop images onto Input nodes or browse gallery
- **Parallel Execution** - Workflows execute in optimized waves
- **Gallery** - Browse and manage generated images

## Tech Stack

- **Frontend**: React 19, React Flow, Zustand 5, TanStack Query, Tailwind CSS
- **Backend**: Fastify 5, floimg
- **Monorepo**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/TeamFlojo/floimg-studio.git
cd floimg-studio

# Install dependencies
pnpm install

# Build shared types
pnpm --filter @floimg-studio/shared build
```

### Development

Start both backend and frontend in development mode:

```bash
# Terminal 1 - Backend (port 3001)
pnpm --filter @floimg-studio/backend dev

# Terminal 2 - Frontend (port 5173)
pnpm --filter @floimg-studio/frontend dev
```

Open http://localhost:5173 in your browser.

### Building

```bash
# Build all packages
pnpm build
```

## Project Structure

```
floimg-studio/
├── packages/
│   ├── backend/          # Fastify API server
│   │   └── src/
│   │       ├── floimg/   # floimg integration (executor, registry)
│   │       └── routes/   # API endpoints
│   ├── frontend/         # React application
│   │   └── src/
│   │       ├── components/   # UI components
│   │       ├── editor/       # Workflow editor (React Flow)
│   │       ├── stores/       # Zustand state
│   │       └── api/          # API client
│   └── shared/           # Shared TypeScript types
├── pnpm-workspace.yaml
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/nodes/generators` | List available generators |
| GET | `/api/nodes/transforms` | List available transforms |
| POST | `/api/execute` | Execute a workflow |
| POST | `/api/export/yaml` | Export workflow as YAML |
| GET | `/api/images` | List generated images |
| GET | `/api/images/:id/blob` | Get image blob |
| POST | `/api/uploads` | Upload an image |
| GET | `/api/uploads` | List uploaded images |
| GET | `/api/uploads/:id/blob` | Get uploaded image blob |
| DELETE | `/api/uploads/:id` | Delete an upload |

## Usage

1. **Add nodes** - Drag from the palette or double-click to add nodes
2. **Connect nodes** - Drag from output handle to input handle
3. **Configure** - Select a node and edit parameters in the inspector
4. **Execute** - Click "Run" to execute the workflow
5. **View results** - See previews on nodes or browse the gallery

## License

MIT
