import { useAuthStore } from "../stores/authStore";

/**
 * Hook for tracking and enforcing guest usage limits.
 *
 * Returns helpers for checking if a user can perform an action
 * and for prompting signup when limits are reached.
 */
export function useGuestUsage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCloudMode = useAuthStore((s) => s.isCloudMode);
  const guestUsage = useAuthStore((s) => s.guestUsage);
  const incrementGuestUsage = useAuthStore((s) => s.incrementGuestUsage);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  /**
   * Check if guest can generate an image.
   * Returns true if allowed, false if limit reached.
   *
   * In self-hosted mode or for authenticated users, always returns true.
   */
  const canGenerate = (): boolean => {
    // Self-hosted mode: no limits
    if (!isCloudMode) {
      return true;
    }

    // Authenticated users: no guest limits (server enforces tier limits)
    if (isAuthenticated) {
      return true;
    }

    // Guest in cloud mode: check daily limit
    return guestUsage.count < 5;
  };

  /**
   * Try to use a generation slot.
   * Returns true if successful, false if limit reached.
   *
   * If limit is reached, shows the auth modal prompting signup.
   */
  const useGenerationSlot = (): boolean => {
    // Self-hosted or authenticated: always allowed
    if (!isCloudMode || isAuthenticated) {
      return true;
    }

    // Try to increment guest usage
    const success = incrementGuestUsage();

    if (!success) {
      openAuthModal("You've reached today's limit");
    }

    return success;
  };

  /**
   * Prompt for signup when trying to save a workflow.
   * Only shows modal in cloud mode for unauthenticated users.
   */
  const promptForSave = (): boolean => {
    if (!isCloudMode || isAuthenticated) {
      return true;
    }

    openAuthModal("Sign up to save your work");
    return false;
  };

  return {
    canGenerate,
    useGenerationSlot,
    promptForSave,
    remainingToday: isCloudMode && !isAuthenticated ? Math.max(0, 5 - guestUsage.count) : null,
  };
}
