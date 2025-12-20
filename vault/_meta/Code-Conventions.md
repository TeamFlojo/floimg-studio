# Code Conventions

Standards for code in imgflo-studio.

## TypeScript

### General Rules
- Strict mode enabled
- No `as any` - fix types properly
- No commented-out code
- No stale TODOs - include task ID or fix
- Comments explain "why", not "what"

### Imports
- Group: external deps, internal packages, relative imports
- Prefer named exports

## React (Frontend)

### Components
```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  return <button onClick={onAction}>{title}</button>;
}
```

### State Management (Zustand)
```typescript
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

### Data Fetching (TanStack Query)
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['items', id],
  queryFn: () => fetchItem(id),
});
```

## Fastify (Backend)

### Route Pattern
```typescript
fastify.get('/api/items', async (request, reply) => {
  const items = await getItems();
  return { items };
});

fastify.post('/api/items', async (request, reply) => {
  const data = request.body as CreateItemInput;
  const item = await createItem(data);
  return item;
});
```

### Error Handling
```typescript
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});
```

## Git Commits

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

## Styling (Tailwind)

- Use Tailwind utility classes
- Extract components for repeated patterns
- Follow responsive-first approach
