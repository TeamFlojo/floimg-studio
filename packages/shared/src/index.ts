/**
 * Shared types for floimg-studio
 */

// Node types in the visual editor
export type StudioNodeType = "generator" | "transform" | "save" | "input";

// Position on the canvas
export interface Position {
  x: number;
  y: number;
}

// Generator node data
export interface GeneratorNodeData {
  generatorName: string;
  params: Record<string, unknown>;
}

// Transform node data
export interface TransformNodeData {
  operation: string;
  params: Record<string, unknown>;
}

// Save node data
export interface SaveNodeData {
  destination: string;
  provider?: "filesystem" | "s3";
}

// Input node data (uploaded image)
export interface InputNodeData {
  uploadId?: string;      // Reference to uploaded image
  filename?: string;      // Original filename for display
  mime?: string;          // Content type
}

// Union type for node data
export type StudioNodeData =
  | GeneratorNodeData
  | TransformNodeData
  | SaveNodeData
  | InputNodeData;

// A node in the visual editor
export interface StudioNode {
  id: string;
  type: StudioNodeType;
  position: Position;
  data: StudioNodeData;
}

// An edge (connection) between nodes
export interface StudioEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// A complete workflow
export interface StudioWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: StudioNode[];
  edges: StudioEdge[];
  createdAt: number;
  updatedAt: number;
}

// Execution status
export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "error"
  | "cancelled";

// Step result during execution
export interface ExecutionStepResult {
  stepIndex: number;
  nodeId: string;
  status: "running" | "completed" | "error";
  imageId?: string;
  preview?: string; // base64 thumbnail
  error?: string;
}

// Full execution result
export interface ExecutionResult {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  steps: ExecutionStepResult[];
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// Generated image metadata
export interface GeneratedImage {
  id: string;
  workflowId?: string;
  executionId: string;
  stepIndex: number;
  nodeId: string;
  mime: string;
  width?: number;
  height?: number;
  params?: Record<string, unknown>;
  createdAt: number;
}

// Node definition for the palette (what nodes are available)
export interface NodeDefinition {
  id: string;
  type: StudioNodeType;
  name: string;
  label: string;
  description?: string;
  category: string;
  params: ParamSchema;
}

// Parameter schema for dynamic form generation
export interface ParamSchema {
  type: "object";
  properties: Record<string, ParamField>;
  required?: string[];
}

export interface ParamField {
  type: "string" | "number" | "boolean" | "object" | "array";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  properties?: Record<string, ParamField>;
}

// API request/response types
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes: StudioNode[];
  edges: StudioEdge[];
}

export interface ExecuteRequest {
  nodes: StudioNode[];
  edges: StudioEdge[];
}

export interface ExecuteResponse {
  executionId: string;
}

// WebSocket event types
export type WSEventType =
  | "execution.started"
  | "execution.step"
  | "execution.completed"
  | "execution.error";

export interface WSEvent {
  type: WSEventType;
  executionId: string;
  data?: unknown;
}

export interface WSExecutionStarted extends WSEvent {
  type: "execution.started";
  data: {
    workflowId?: string;
    totalSteps: number;
  };
}

export interface WSExecutionStep extends WSEvent {
  type: "execution.step";
  data: ExecutionStepResult;
}

export interface WSExecutionCompleted extends WSEvent {
  type: "execution.completed";
  data: {
    imageIds: string[];
  };
}

export interface WSExecutionError extends WSEvent {
  type: "execution.error";
  data: {
    error: string;
  };
}
