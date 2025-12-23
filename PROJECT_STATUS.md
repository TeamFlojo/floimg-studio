# PROJECT STATUS

**Last Updated**: 2025-12-22

## Current Focus

### T-2025-002: Remove Cloud Business Logic from Public Repo

Make floimg-studio pure open-source by removing leaked cloud code.

- [x] Remove cloud imports/hooks from App.tsx
- [x] Delete authStore.ts, useGuestUsage.ts, TOSConsent.tsx, AuthModal.tsx
- [x] Update Toolbar (remove cloud user menu)
- [x] Simplify backend moderator (remove FLOIMG_CLOUD detection)
- [x] Test self-hosted mode (build passes)

## Recent Progress

- **T-2025-001 Complete**: Workflow persistence and JS code export shipped

- **AI Nodes & Settings**: Added vision and text generation to visual interface
  - VisionNode component for AI image analysis (GPT-4V, Claude, LLaVA)
  - TextNode component for AI text generation
  - AISettings modal for BYOK API key configuration
  - Support for cloud (OpenAI, Anthropic, Gemini) and local (Ollama) providers
  - Settings persisted to localStorage
- Content moderation, templates, and gallery unification
- Initial project setup (v0.1.0)
- React Flow visual editor foundation
- Fastify backend with floimg integration

## Next Up

1. Add AI nodes to NodePalette for drag-and-drop
2. Test end-to-end AI workflow execution
3. Add NodeInspector support for vision/text node parameters

## Blockers

- None currently

## Notes

- Early stage project (v0.1.0)
- Depends on floimg workspace:\* (linked for development)
- AI features require user-provided API keys (BYOK)
