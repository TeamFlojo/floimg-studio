import { useState, useCallback, DragEvent } from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowEditor } from "./editor/WorkflowEditor";
import { NodePalette } from "./components/NodePalette";
import { NodeInspector } from "./components/NodeInspector";
import { Toolbar } from "./components/Toolbar";
import { Gallery } from "./components/Gallery";
import { useWorkflowStore } from "./stores/workflowStore";
import type { NodeDefinition } from "@floimg-studio/shared";

type TabType = "editor" | "gallery";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("editor");
  const addNode = useWorkflowStore((s) => s.addNode);

  // Handle drop from palette
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData("application/json");
      if (!data) return;

      try {
        const definition: NodeDefinition = JSON.parse(data);

        // Get drop position relative to the canvas
        const reactFlowBounds = document
          .querySelector(".react-flow")
          ?.getBoundingClientRect();

        if (!reactFlowBounds) return;

        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        addNode(definition, position);
      } catch (e) {
        console.error("Failed to parse dropped node:", e);
      }
    },
    [addNode]
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        <Toolbar />

        {/* Tab navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "editor"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "gallery"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Gallery
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "editor" ? (
            <>
              <NodePalette />
              <div
                className="flex-1"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <WorkflowEditor />
              </div>
              <NodeInspector />
            </>
          ) : (
            <div className="flex-1 overflow-auto">
              <Gallery />
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
