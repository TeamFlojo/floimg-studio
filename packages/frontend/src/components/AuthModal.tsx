import { useAuthStore, getSignupUrl, getLoginUrl } from "../stores/authStore";

export function AuthModal() {
  const showAuthModal = useAuthStore((s) => s.showAuthModal);
  const authModalMessage = useAuthStore((s) => s.authModalMessage);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  if (!showAuthModal) {
    return null;
  }

  const handleSignup = () => {
    window.location.href = getSignupUrl();
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {authModalMessage}
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            Create a free account to save your workflows, access your history,
            and get 50 free image generations per month.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleSignup}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
            >
              Sign up free
            </button>

            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900 rounded-b-lg border-t border-gray-200 dark:border-zinc-700">
          <button
            onClick={closeAuthModal}
            className="w-full text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
