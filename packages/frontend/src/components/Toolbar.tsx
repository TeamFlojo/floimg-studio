import { useState, useRef, useEffect } from "react";
import { useWorkflowStore } from "../stores/workflowStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore, getSignupUrl, getLoginUrl } from "../stores/authStore";
import { getImageUrl } from "../api/client";

export function Toolbar() {
  const execution = useWorkflowStore((s) => s.execution);
  const execute = useWorkflowStore((s) => s.execute);
  const exportToYaml = useWorkflowStore((s) => s.exportToYaml);
  const nodes = useWorkflowStore((s) => s.nodes);
  const openSettings = useSettingsStore((s) => s.openSettings);

  // Auth state
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCloudMode = useAuthStore((s) => s.isCloudMode);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const guestUsage = useAuthStore((s) => s.guestUsage);

  const [showYaml, setShowYaml] = useState(false);
  const [yamlContent, setYamlContent] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExecute = async () => {
    await execute();
  };

  const handleExport = async () => {
    const yaml = await exportToYaml();
    setYamlContent(yaml);
    setShowYaml(true);
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "?";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  return (
    <>
      <div className="h-14 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">floimg Studio</h1>
            <a
              href="https://flojo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
            >
              by Flojo
            </a>
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {nodes.length} node{nodes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* User menu (only in cloud mode) */}
          {isCloudMode && (
            <div className="relative" ref={userMenuRef}>
              {isAuthLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              ) : isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-medium">
                      {getInitials()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 capitalize">
                          {user.tier} plan
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {guestUsage.count}/5 today
                  </span>
                  <a
                    href={getLoginUrl()}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    Sign in
                  </a>
                  <a
                    href={getSignupUrl()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
                  >
                    Sign up
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            onClick={openSettings}
            className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md"
            title="AI Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export YAML
          </button>

          <button
            onClick={handleExecute}
            disabled={nodes.length === 0 || execution.status === "running"}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {execution.status === "running" ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Execute
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution result banner */}
      {execution.status === "completed" && execution.imageIds.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-green-700 dark:text-green-400 font-medium">
              Generated {execution.imageIds.length} image
              {execution.imageIds.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {execution.imageIds.slice(0, 4).map((id) => (
                <a
                  key={id}
                  href={getImageUrl(id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={getImageUrl(id)}
                    alt="Generated"
                    className="h-12 w-12 object-cover rounded border border-green-300 dark:border-green-700"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {execution.status === "error" && (
        <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-3">
          <span className="text-red-700 dark:text-red-400">Error: {execution.error}</span>
        </div>
      )}

      {/* YAML export modal */}
      {showYaml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exported Workflow (YAML)</h3>
              <button
                onClick={() => setShowYaml(false)}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-zinc-200">
                {yamlContent}
              </pre>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-zinc-700">
              <button
                onClick={handleCopyYaml}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowYaml(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
