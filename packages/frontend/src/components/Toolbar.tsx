import { useState } from "react";
import { useWorkflowStore } from "../stores/workflowStore";
import { getImageUrl } from "../api/client";

export function Toolbar() {
  const execution = useWorkflowStore((s) => s.execution);
  const execute = useWorkflowStore((s) => s.execute);
  const exportToYaml = useWorkflowStore((s) => s.exportToYaml);
  const nodes = useWorkflowStore((s) => s.nodes);
  const [showYaml, setShowYaml] = useState(false);
  const [yamlContent, setYamlContent] = useState("");

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

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-gray-800">floimg Studio</h1>
            <a
              href="https://flojo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              by Flojo
            </a>
          </div>
          <span className="text-sm text-gray-500">
            {nodes.length} node{nodes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export YAML
          </button>

          <button
            onClick={handleExecute}
            disabled={nodes.length === 0 || execution.status === "running"}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-green-700 font-medium">
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
                    className="h-12 w-12 object-cover rounded border border-green-300"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {execution.status === "error" && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <span className="text-red-700">Error: {execution.error}</span>
        </div>
      )}

      {/* YAML export modal */}
      {showYaml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Exported Workflow (YAML)</h3>
              <button
                onClick={() => setShowYaml(false)}
                className="text-gray-500 hover:text-gray-700"
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
              <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">
                {yamlContent}
              </pre>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                onClick={handleCopyYaml}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowYaml(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
