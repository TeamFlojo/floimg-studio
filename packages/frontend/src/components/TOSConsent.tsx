import { useState, useEffect } from "react";

const TOS_CONSENT_KEY = "floimg-tos-consent";
const TOS_VERSION = "1.0"; // Bump this to re-prompt for new TOS versions

interface TOSConsentProps {
  onAccept: () => void;
}

export function TOSConsent({ onAccept }: TOSConsentProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    localStorage.setItem(
      TOS_CONSENT_KEY,
      JSON.stringify({
        version: TOS_VERSION,
        acceptedAt: new Date().toISOString(),
      })
    );
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome to floimg Studio
          </h2>

          <div className="text-sm text-gray-600 dark:text-zinc-300 space-y-4 mb-6">
            <p>
              Before you get started, please review our content policy. floimg
              Studio is a powerful image generation tool, and we want to ensure
              it's used responsibly.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Content Policy Summary
              </h3>
              <ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
                <li>
                  - No illegal content (especially CSAM - this is a criminal
                  offense)
                </li>
                <li>- No sexually explicit or pornographic content</li>
                <li>- No violent, graphic, or gory content</li>
                <li>- No hate speech, harassment, or discrimination</li>
                <li>- No malware, phishing links, or harmful QR codes</li>
              </ul>
            </div>

            <p>
              All generated content is automatically scanned by our moderation
              system. Violations may result in content being blocked.
            </p>

            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Self-hosted users: You are responsible for content created on your
              own infrastructure, but our software must never be used to create
              illegal content.
            </p>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700 dark:text-zinc-300">
              I have read and agree to the{" "}
              <a
                href="https://floimg.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and Content Policy. I understand that violations may result in my
              content being blocked.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!isChecked}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isChecked
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if TOS consent has been given
 */
export function useTOSConsent(): {
  hasConsent: boolean;
  isLoading: boolean;
  grantConsent: () => void;
} {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOS_CONSENT_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if consent is for current TOS version
        if (data.version === TOS_VERSION) {
          setHasConsent(true);
        }
      }
    } catch {
      // Invalid stored data
    }
    setIsLoading(false);
  }, []);

  const grantConsent = () => {
    setHasConsent(true);
  };

  return { hasConsent, isLoading, grantConsent };
}
