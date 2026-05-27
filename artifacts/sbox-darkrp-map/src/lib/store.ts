import { useReducer, useEffect } from 'react';
import { GraphState, GraphAction } from './types';

function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n)
      };
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== action.payload),
        edges: state.edges.filter(e => e.from !== action.payload && e.to !== action.payload)
      };
    case 'ADD_EDGE':
      if (state.edges.some(e => e.from === action.payload.from && e.to === action.payload.to)) {
        return state;
      }
      return { ...state, edges: [...state.edges, action.payload] };
    case 'DELETE_EDGE':
      return { ...state, edges: state.edges.filter(e => e.id !== action.payload) };
    case 'TOGGLE_COLLAPSE': {
      return {
        ...state,
        nodes: state.nodes.map(n => n.id === action.payload ? { ...n, collapsed: !n.collapsed } : n)
      };
    }
    case 'UPDATE_VIEWPORT':
      return { ...state, viewport: { ...state.viewport, ...action.payload } };
    default:
      return state;
  }
}

export function useGraphStore(
  storageKey: string,
  initialState: GraphState,
  urlState?: GraphState | null,
) {
  const [state, dispatch] = useReducer(graphReducer, null as any, () => {
    // URL-shared state takes priority
    if (urlState) return urlState;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load map state", e);
    }
    return initialState;
  });

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(t);
  }, [state, storageKey]);

  return { state, dispatch };
}
