# Roadmap

High-level direction for imgflo-studio development.

## Vision

imgflo-studio is a visual workflow builder that makes imgflo accessible to non-developers. It provides a drag-and-drop interface for creating image generation and manipulation workflows.

## Current State (v0.1.0)

### Core Capabilities
- React Flow-based visual editor
- Node palette with generators and transforms
- Workflow execution via backend
- Basic image gallery

### Technical Foundation
- React 19 + Fastify 5 monorepo
- TypeScript throughout
- pnpm workspaces

## Focus Areas

### Editor Polish
- Improved node inspector UI
- Better connection validation
- Undo/redo support
- Keyboard shortcuts

### Workflow Features
- Workflow save/load
- Export to YAML format
- Template library
- Sharing capabilities

### Backend Improvements
- Persistent workflow storage
- User sessions
- Execution history
- Better error handling

### UX Refinement
- Responsive design
- Dark/light themes
- Loading states
- Error feedback

## Integration with imgflo

imgflo-studio depends on the imgflo core package:
- Node definitions derived from imgflo schemas
- Workflow execution uses imgflo engine
- Version coordination managed via parent repo

## Non-Goals

These are out of scope for initial development:
- Multi-user collaboration (future)
- Real-time preview during editing
- Mobile app
- Offline support
