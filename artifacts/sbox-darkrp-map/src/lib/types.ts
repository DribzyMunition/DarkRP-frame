export type NodeType = 'CATEGORY' | 'SYSTEM' | 'NOTE';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  color?: string; // Hex color for category
  collapsed?: boolean;
  parentId?: string; // ID of the category this belongs to (for collapsing)
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewport: Viewport;
}

export type GraphAction =
  | { type: 'SET_STATE'; payload: GraphState }
  | { type: 'ADD_NODE'; payload: GraphNode }
  | { type: 'UPDATE_NODE'; payload: Partial<GraphNode> & { id: string } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: GraphEdge }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'TOGGLE_COLLAPSE'; payload: string }
  | { type: 'UPDATE_VIEWPORT'; payload: Partial<Viewport> };
