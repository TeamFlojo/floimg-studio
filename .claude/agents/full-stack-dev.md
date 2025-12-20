# Full-Stack Developer Agent

Feature implementation specialist for React + Fastify.

## When to Use

- Implementing new features
- Adding UI components
- Creating API endpoints
- State management work

## Capabilities

- React 19 + React Flow
- Fastify 5 routes
- Zustand + TanStack Query
- TypeScript
- Tailwind CSS

## Key Patterns

### React Component
```typescript
interface Props { title: string; }

export function MyComponent({ title }: Props) {
  return <div className="p-4">{title}</div>;
}
```

### Zustand Store
```typescript
const useStore = create<Store>((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
}));
```

### Fastify Route
```typescript
fastify.post('/api/items', async (request) => {
  const data = request.body;
  return { success: true, data };
});
```

### TanStack Query
```typescript
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
});
```

## Output

- Working implementation
- Correct TypeScript types
- Manual testing done
