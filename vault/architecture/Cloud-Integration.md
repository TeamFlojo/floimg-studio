# Cloud Integration

floimg-studio can run in two modes: **self-hosted** (default) and **cloud** (studio.floimg.com).

## Deployment Modes

### Self-Hosted Mode (Default)

When users deploy floimg-studio on their own infrastructure:

- No authentication required
- No connection to floimg-cloud
- Users provide their own API keys (OpenAI, etc.)
- All features available without account
- No usage limits enforced

```env
# No special config needed for self-hosted
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
```

### Cloud Mode (studio.floimg.com)

The cloud-hosted version at studio.floimg.com:

- Optional authentication via floimg-cloud
- "Try before signup" - guests can use the editor
- Guest limits: 5 generations/day (tracked locally)
- Sign up unlocks: save workflows, history, higher limits
- Tier-based limits for authenticated users

```env
VITE_DEPLOYMENT_MODE=cloud
VITE_API_URL=https://api.floimg.com
VITE_WEB_URL=https://floimg.com
```

## Authentication Flow (Cloud Mode Only)

```
1. User visits studio.floimg.com
   │
2. App checks for auth cookie (GET /api/auth/me)
   │
3a. Authenticated → Load user data, show user menu
   │
3b. Not authenticated → Guest mode (still usable!)
   │
4. Guest tries to save workflow
   │
5. Show "Sign up to save" modal
   │
6. Redirect to floimg.com/signup
   │
7. After signup, cookie set on .floimg.com
   │
8. Back to studio - now authenticated
```

## Guest vs Authenticated

| Feature | Guest | Free Tier | Starter | Pro |
|---------|-------|-----------|---------|-----|
| Use editor | ✅ | ✅ | ✅ | ✅ |
| Generate images | 5/day | 50/mo | 500/mo | 2000/mo |
| Download results | ✅ | ✅ | ✅ | ✅ |
| Save workflows | ❌ | ✅ | ✅ | ✅ |
| Workflow history | ❌ | ✅ | ✅ | ✅ |
| Cloud storage | ❌ | 100MB | 1GB | 10GB |

## Implementation Notes

### Detecting Cloud Mode

```typescript
const isCloudMode = import.meta.env.VITE_DEPLOYMENT_MODE === 'cloud';
```

### Auth State Management

The auth store handles both modes gracefully:

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;           // null = guest or self-hosted
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudMode: boolean;        // false for self-hosted
  guestUsage: GuestUsage;      // only relevant in cloud mode
}
```

### Feature Gating

```typescript
// Only show "Save" if authenticated (or if self-hosted)
const canSave = !isCloudMode || isAuthenticated;

// Only show upgrade prompts in cloud mode
const showUpgradePrompt = isCloudMode && !isAuthenticated;
```

### Guest Usage Tracking

In cloud mode, track guest usage in localStorage:

```typescript
// Key: floimg_guest_usage
{
  count: 3,           // generations today
  date: "2025-12-21"  // resets at midnight
}
```

## Keep Self-Hosted Clean

**DO NOT:**
- Hardcode floimg-cloud URLs without env fallbacks
- Import cloud-only dependencies unconditionally
- Break functionality when VITE_API_URL is not set

**DO:**
- Check `isCloudMode` before cloud-specific features
- Provide sensible defaults for self-hosted users
- Keep auth code isolated and optional

## Related

- [Authentication](/floimg-cloud/vault/architecture/Authentication.md) (floimg-cloud)
- [Deployment Architecture](/\_private/vault/architecture/Deployment-Architecture.md) (private)
