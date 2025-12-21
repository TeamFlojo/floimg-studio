import { create } from "zustand";
import type { Node, Edge, Connection } from "reactflow";
import type {
  GeneratorNodeData,
  TransformNodeData,
  SaveNodeData,
  InputNodeData,
  NodeDefinition,
  GalleryTemplate,
} from "@floimg-studio/shared";
import { executeWorkflow, exportYaml } from "../api/client";

type NodeData = GeneratorNodeData | TransformNodeData | SaveNodeData | InputNodeData;

type NodeExecutionStatus = "idle" | "running" | "completed" | "error";

interface ExecutionState {
  status: "idle" | "running" | "completed" | "error";
  imageIds: string[];
  previews: Record<string, string>; // nodeId -> data URL
  nodeStatus: Record<string, NodeExecutionStatus>; // per-node execution status
  error?: string;
}

interface WorkflowStore {
  // Nodes and edges (React Flow compatible)
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Template tracking
  currentTemplateId: string | null;
  loadTemplate: (template: GalleryTemplate) => void;
  clearWorkflow: () => void;

  // Preview visibility per node (default: true)
  previewVisible: Record<string, boolean>;
  togglePreview: (id: string) => void;

  // Node registry
  generators: NodeDefinition[];
  transforms: NodeDefinition[];
  setGenerators: (generators: NodeDefinition[]) => void;
  setTransforms: (transforms: NodeDefinition[]) => void;

  // Node operations
  addNode: (definition: NodeDefinition, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;

  // Edge operations
  addEdge: (connection: Connection) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: Edge[]) => void;

  // Selection
  setSelectedNode: (id: string | null) => void;

  // Execution
  execution: ExecutionState;
  execute: () => Promise<void>;

  // Export
  exportToYaml: () => Promise<string>;
}

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node_${++nodeIdCounter}`;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  currentTemplateId: null,
  previewVisible: {},
  generators: [],
  transforms: [],

  execution: {
    status: "idle",
    imageIds: [],
    previews: {},
    nodeStatus: {},
  },

  loadTemplate: (template) => {
    // Convert StudioNodes to React Flow nodes with new IDs
    const idMap = new Map<string, string>();

    const nodes: Node<NodeData>[] = template.workflow.nodes.map((studioNode) => {
      const newId = generateNodeId();
      idMap.set(studioNode.id, newId);

      return {
        id: newId,
        type: studioNode.type,
        position: studioNode.position,
        data: studioNode.data as NodeData,
      };
    });

    // Convert edges with mapped IDs
    const edges: Edge[] = template.workflow.edges.map((studioEdge) => {
      const newSource = idMap.get(studioEdge.source) || studioEdge.source;
      const newTarget = idMap.get(studioEdge.target) || studioEdge.target;

      return {
        id: `edge_${newSource}_${newTarget}`,
        source: newSource,
        target: newTarget,
      };
    });

    set({
      nodes,
      edges,
      selectedNodeId: null,
      currentTemplateId: template.id,
      previewVisible: {},
      execution: {
        status: "idle",
        imageIds: [],
        previews: {},
        nodeStatus: {},
      },
    });
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      currentTemplateId: null,
      previewVisible: {},
      execution: {
        status: "idle",
        imageIds: [],
        previews: {},
        nodeStatus: {},
      },
    });
  },

  togglePreview: (id) => {
    set((state) => ({
      previewVisible: {
        ...state.previewVisible,
        [id]: state.previewVisible[id] === false ? true : false, // default true, toggle
      },
    }));
  },

  setGenerators: (generators) => set({ generators }),
  setTransforms: (transforms) => set({ transforms }),

  addNode: (definition, position) => {
    const id = generateNodeId();
    let data: NodeData;

    if (definition.type === "generator") {
      data = {
        generatorName: definition.name,
        params: getDefaultParams(definition),
      } as GeneratorNodeData;
    } else if (definition.type === "transform") {
      data = {
        operation: definition.name,
        params: getDefaultParams(definition),
      } as TransformNodeData;
    } else if (definition.type === "input") {
      data = {
        uploadId: undefined,
        filename: undefined,
        mime: undefined,
      } as InputNodeData;
    } else {
      data = {
        destination: "./output/image.png",
        provider: "filesystem",
      } as SaveNodeData;
    }

    const newNode: Node<NodeData> = {
      id,
      type: definition.type,
      position,
      data,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  setNodes: (nodes) => set({ nodes }),

  addEdge: (connection) => {
    if (!connection.source || !connection.target) return;

    const id = `edge_${connection.source}_${connection.target}`;
    const newEdge: Edge = {
      id,
      source: connection.source,
      target: connection.target,
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    }));
  },

  setEdges: (edges) => set({ edges }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  execute: async () => {
    const { nodes, edges } = get();

    // Convert React Flow nodes to StudioNodes
    const studioNodes = nodes.map((n) => ({
      id: n.id,
      type: n.type as "generator" | "transform" | "save",
      position: n.position,
      data: n.data,
    }));

    const studioEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    // Set all nodes to "running" status
    const initialNodeStatus: Record<string, NodeExecutionStatus> = {};
    for (const node of nodes) {
      initialNodeStatus[node.id] = "running";
    }

    set({
      execution: { status: "running", imageIds: [], previews: {}, nodeStatus: initialNodeStatus },
    });

    try {
      const result = await executeWorkflow(studioNodes, studioEdges);

      // Set all nodes to completed or error based on result
      const finalNodeStatus: Record<string, NodeExecutionStatus> = {};
      for (const node of nodes) {
        finalNodeStatus[node.id] = result.status === "completed" ? "completed" : "error";
      }

      if (result.status === "completed") {
        set({
          execution: {
            status: "completed",
            imageIds: result.imageIds,
            previews: result.previews || {},
            nodeStatus: finalNodeStatus,
          },
        });
      } else {
        set({
          execution: {
            status: "error",
            imageIds: [],
            previews: {},
            nodeStatus: finalNodeStatus,
            error: result.error,
          },
        });
      }
    } catch (error) {
      // Set all nodes to error status
      const errorNodeStatus: Record<string, NodeExecutionStatus> = {};
      for (const node of nodes) {
        errorNodeStatus[node.id] = "error";
      }

      set({
        execution: {
          status: "error",
          imageIds: [],
          previews: {},
          nodeStatus: errorNodeStatus,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  },

  exportToYaml: async () => {
    const { nodes, edges } = get();

    const studioNodes = nodes.map((n) => ({
      id: n.id,
      type: n.type as "generator" | "transform" | "save",
      position: n.position,
      data: n.data,
    }));

    const studioEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    const result = await exportYaml(studioNodes, studioEdges);
    return result.yaml;
  },
}));

// Helper to extract default values from schema
function getDefaultParams(definition: NodeDefinition): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (definition.params?.properties) {
    for (const [key, field] of Object.entries(definition.params.properties)) {
      if (field.default !== undefined) {
        params[key] = field.default;
      }
    }
  }

  return params;
}
