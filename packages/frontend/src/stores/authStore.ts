import { create } from "zustand";
import { persist } from "zustand/middleware";

// User from floimg-cloud API
export interface User {
  id: string;
  email: string;
  name: string | null;
  tier: "free" | "starter" | "pro" | "enterprise";
  emailVerifiedAt: string | null;
  createdAt: string;
}

// Guest usage tracking (localStorage)
interface GuestUsage {
  count: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Cloud mode detection
  isCloudMode: boolean;

  // Guest usage (only relevant in cloud mode)
  guestUsage: GuestUsage;

  // Auth modal
  showAuthModal: boolean;
  authModalMessage: string;

  // Actions
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  incrementGuestUsage: () => boolean; // returns false if limit reached
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

const GUEST_DAILY_LIMIT = 5;
const CLOUD_API_URL = import.meta.env.VITE_API_URL || "";
const WEB_URL = import.meta.env.VITE_WEB_URL || "https://floimg.com";
const DEPLOYMENT_MODE = import.meta.env.VITE_DEPLOYMENT_MODE || "self-hosted";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getInitialGuestUsage(): GuestUsage {
  const today = getTodayDate();
  try {
    const stored = localStorage.getItem("floimg_guest_usage");
    if (stored) {
      const parsed = JSON.parse(stored) as GuestUsage;
      // Reset if it's a new day
      if (parsed.date === today) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return { count: 0, date: today };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isCloudMode: DEPLOYMENT_MODE === "cloud",
      guestUsage: getInitialGuestUsage(),
      showAuthModal: false,
      authModalMessage: "",

      checkAuth: async () => {
        const { isCloudMode } = get();

        // In self-hosted mode, skip auth check
        if (!isCloudMode || !CLOUD_API_URL) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await fetch(`${CLOUD_API_URL}/api/auth/me`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Not authenticated - that's fine, guest mode
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          // Network error - assume guest mode
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        const { isCloudMode } = get();

        if (isCloudMode && CLOUD_API_URL) {
          try {
            await fetch(`${CLOUD_API_URL}/api/auth/logout`, {
              method: "POST",
              credentials: "include",
            });
          } catch {
            // Ignore logout errors
          }
        }

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      incrementGuestUsage: () => {
        const { isAuthenticated, isCloudMode, guestUsage } = get();

        // No limits for authenticated users or self-hosted
        if (isAuthenticated || !isCloudMode) {
          return true;
        }

        const today = getTodayDate();

        // Reset if new day
        if (guestUsage.date !== today) {
          const newUsage = { count: 1, date: today };
          set({ guestUsage: newUsage });
          localStorage.setItem("floimg_guest_usage", JSON.stringify(newUsage));
          return true;
        }

        // Check limit
        if (guestUsage.count >= GUEST_DAILY_LIMIT) {
          return false;
        }

        // Increment
        const newUsage = { count: guestUsage.count + 1, date: today };
        set({ guestUsage: newUsage });
        localStorage.setItem("floimg_guest_usage", JSON.stringify(newUsage));
        return true;
      },

      openAuthModal: (message?: string) => {
        set({
          showAuthModal: true,
          authModalMessage: message || "Sign up to continue",
        });
      },

      closeAuthModal: () => {
        set({ showAuthModal: false, authModalMessage: "" });
      },
    }),
    {
      name: "floimg-studio-auth",
      // Only persist guest usage, not user (that comes from cookie)
      partialize: (state) => ({ guestUsage: state.guestUsage }),
    }
  )
);

// Helper to get signup URL with redirect back to studio
export function getSignupUrl(): string {
  const currentUrl = window.location.href;
  return `${WEB_URL}/signup?redirect=${encodeURIComponent(currentUrl)}`;
}

// Helper to get login URL with redirect back to studio
export function getLoginUrl(): string {
  const currentUrl = window.location.href;
  return `${WEB_URL}/login?redirect=${encodeURIComponent(currentUrl)}`;
}
