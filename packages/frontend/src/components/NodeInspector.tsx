import type {
  GeneratorNodeData,
  TransformNodeData,
  SaveNodeData,
  ParamField,
} from "@floimg-studio/shared";
import { useWorkflowStore } from "../stores/workflowStore";

export function NodeInspector() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const generators = useWorkflowStore((s) => s.generators);
  const transforms = useWorkflowStore((s) => s.transforms);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-gray-500 text-sm">
          Select a node to edit its properties
        </div>
      </div>
    );
  }

  // Get schema for the selected node
  let schema: Record<string, ParamField> | undefined;
  let nodeLabel = "";

  if (selectedNode.type === "generator") {
    const data = selectedNode.data as GeneratorNodeData;
    const def = generators.find((g) => g.name === data.generatorName);
    schema = def?.params?.properties;
    nodeLabel = def?.label || data.generatorName;
  } else if (selectedNode.type === "transform") {
    const data = selectedNode.data as TransformNodeData;
    const def = transforms.find((t) => t.name === data.operation);
    schema = def?.params?.properties;
    nodeLabel = def?.label || data.operation;
  } else if (selectedNode.type === "save") {
    nodeLabel = "Save";
    schema = {
      destination: {
        type: "string",
        title: "Destination",
        description: "File path to save the image",
      },
    };
  }

  const handleParamChange = (key: string, value: unknown) => {
    if (selectedNode.type === "generator") {
      const data = selectedNode.data as GeneratorNodeData;
      updateNodeData(selectedNode.id, {
        params: { ...data.params, [key]: value },
      });
    } else if (selectedNode.type === "transform") {
      const data = selectedNode.data as TransformNodeData;
      updateNodeData(selectedNode.id, {
        params: { ...data.params, [key]: value },
      });
    } else if (selectedNode.type === "save") {
      updateNodeData(selectedNode.id, { [key]: value });
    }
  };

  const getParamValue = (key: string): unknown => {
    if (selectedNode.type === "generator") {
      return (selectedNode.data as GeneratorNodeData).params[key];
    } else if (selectedNode.type === "transform") {
      return (selectedNode.data as TransformNodeData).params[key];
    } else if (selectedNode.type === "save") {
      return (selectedNode.data as SaveNodeData)[key as keyof SaveNodeData];
    }
    return undefined;
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{nodeLabel}</h2>
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>

        <div className="space-y-4">
          {schema &&
            Object.entries(schema).map(([key, field]) => (
              <FieldEditor
                key={key}
                name={key}
                field={field}
                value={getParamValue(key)}
                onChange={(value) => handleParamChange(key, value)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

interface FieldEditorProps {
  name: string;
  field: ParamField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldEditor({ name, field, value, onChange }: FieldEditorProps) {
  const label = field.title || name;

  // Enum -> select dropdown
  if (field.enum) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select...</option>
          {field.enum.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {field.description && (
          <p className="mt-1 text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  }

  // Number input
  if (field.type === "number") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="number"
          value={value !== undefined ? Number(value) : ""}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.minimum}
          max={field.maximum}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {field.description && (
          <p className="mt-1 text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  }

  // Boolean -> checkbox
  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
    );
  }

  // Color picker for color-related fields
  if (
    name.toLowerCase().includes("color") &&
    typeof value === "string" &&
    value.startsWith("#")
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={String(value || "#000000")}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 p-1 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  }

  // Default: text input (also for objects as JSON)
  if (field.type === "object") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <textarea
          value={value ? JSON.stringify(value, null, 2) : "{}"}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
        />
        {field.description && (
          <p className="mt-1 text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  }

  // String input (default)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {name === "prompt" || name === "code" || name === "text" ? (
        <textarea
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <input
          type="text"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      )}
      {field.description && (
        <p className="mt-1 text-xs text-gray-500">{field.description}</p>
      )}
    </div>
  );
}
