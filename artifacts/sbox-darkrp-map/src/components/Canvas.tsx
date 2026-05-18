import { GraphState, GraphAction } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Node } from "./Node";

export function Canvas({ state, dispatch }: { state: GraphState, dispatch: React.Dispatch<GraphAction> }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [nodeStartPos, setNodeStartPos] = useState({ x: 0, y: 0 });

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, nodeId: string | null} | null>(null);

  // Wheel zoom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.target !== el && !(e.target as Element).closest('.canvas-container')) return;
      e.preventDefault();
      const zoomFactor = 1.1;
      const zoomDelta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
      let newZoom = state.viewport.zoom * zoomDelta;
      newZoom = Math.max(0.05, Math.min(newZoom, 5));

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newX = x - (x - state.viewport.x) * (newZoom / state.viewport.zoom);
      const newY = y - (y - state.viewport.y) * (newZoom / state.viewport.zoom);

      dispatch({ type: 'UPDATE_VIEWPORT', payload: { x: newX, y: newY, zoom: newZoom } });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [state.viewport, dispatch]);

  const screenToWorld = (sx: number, sy: number) => {
    return {
      x: (sx - state.viewport.x) / state.viewport.zoom,
      y: (sy - state.viewport.y) / state.viewport.zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // Right click handled by contextMenu
    if (contextMenu) setContextMenu(null);
    if (editingNode) setEditingNode(null);

    const target = e.target as HTMLElement;
    if (target.closest('.toolbar-container')) return;

    if (target.id === 'canvas-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - state.viewport.x, y: e.clientY - state.viewport.y });
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button === 2) return;
    e.stopPropagation();
    if (contextMenu) setContextMenu(null);
    if (editingNode) setEditingNode(null);

    if (e.shiftKey) {
      setConnectingFrom(id);
      return;
    }

    const node = state.nodes.find(n => n.id === id);
    if (node) {
      setDraggingNode(id);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setNodeStartPos({ x: node.x, y: node.y });
      setSelectedNode(id);
      setSelectedEdge(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      dispatch({
        type: 'UPDATE_VIEWPORT',
        payload: {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        }
      });
    } else if (draggingNode) {
      const dx = (e.clientX - dragStartPos.x) / state.viewport.zoom;
      const dy = (e.clientY - dragStartPos.y) / state.viewport.zoom;
      dispatch({
        type: 'UPDATE_NODE',
        payload: { id: draggingNode, x: nodeStartPos.x + dx, y: nodeStartPos.y + dy }
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) setIsPanning(false);
    if (draggingNode) setDraggingNode(null);

    if (connectingFrom) {
      // Find element under mouse
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest('.group');
      // Hacky approach: we'd ideally have node IDs in dataset. 
      // Let's use coordinates instead.
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const targetNode = state.nodes.find(n => {
        const w = n.type === 'CATEGORY' ? 250 : n.type === 'NOTE' ? 200 : 150;
        const h = n.type === 'CATEGORY' ? 50 : n.type === 'NOTE' ? 80 : 40;
        return Math.abs(n.x - worldPos.x) < w/2 && Math.abs(n.y - worldPos.y) < h/2;
      });

      if (targetNode && targetNode.id !== connectingFrom) {
        dispatch({
          type: 'ADD_EDGE',
          payload: { id: `e_${Date.now()}`, from: connectingFrom, to: targetNode.id }
        });
      }
      setConnectingFrom(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string | null = null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && !editingNode) {
          dispatch({ type: 'DELETE_NODE', payload: selectedNode });
          setSelectedNode(null);
        }
        if (selectedEdge) {
          dispatch({ type: 'DELETE_EDGE', payload: selectedEdge });
          setSelectedEdge(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, editingNode, dispatch]);

  const handleNodeDoubleClick = (id: string) => {
    const node = state.nodes.find(n => n.id === id);
    if (node?.type === 'CATEGORY') {
      dispatch({ type: 'TOGGLE_COLLAPSE', payload: id });
    } else {
      setEditingNode(id);
    }
  };

  const handleLabelChange = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      dispatch({ type: 'UPDATE_NODE', payload: { id, label: e.currentTarget.value } });
      setEditingNode(null);
    } else if (e.key === 'Escape') {
      setEditingNode(null);
    }
  };

  const visibleNodes = state.nodes.filter(n => {
    if (!n.parentId) return true;
    const parent = state.nodes.find(p => p.id === n.parentId);
    return !(parent?.collapsed);
  });

  const visibleEdges = state.edges.filter(e => {
    const fromNode = state.nodes.find(n => n.id === e.from);
    const toNode = state.nodes.find(n => n.id === e.to);
    if (!fromNode || !toNode) return false;
    
    // Hide edge if either endpoint is hidden due to parent collapse
    const fromHidden = fromNode.parentId && state.nodes.find(p => p.id === fromNode.parentId)?.collapsed;
    const toHidden = toNode.parentId && state.nodes.find(p => p.id === toNode.parentId)?.collapsed;
    return !fromHidden && !toHidden;
  });

  return (
    <div 
      className="absolute inset-0 bg-grid-pattern cursor-crosshair canvas-container overflow-hidden pt-10"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => handleContextMenu(e)}
      ref={canvasRef}
    >
      <div id="canvas-bg" className="absolute inset-0 z-0"></div>

      <div 
        className="absolute origin-top-left pointer-events-none"
        style={{
          transform: `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.zoom})`
        }}
      >
        <svg className="absolute overflow-visible" style={{ zIndex: 1 }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.6)" />
            </marker>
            <marker id="arrow-selected" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00ff41" />
            </marker>
          </defs>
          {visibleEdges.map(edge => {
            const from = visibleNodes.find(n => n.id === edge.from);
            const to = visibleNodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            
            const isSelected = selectedEdge === edge.id;
            
            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isSelected ? "#00ff41" : "rgba(255,255,255,0.6)"}
                strokeWidth={isSelected ? 2 : 1}
                markerEnd={`url(#${isSelected ? 'arrow-selected' : 'arrow'})`}
                className="pointer-events-auto cursor-pointer transition-colors"
                onMouseDown={(e) => { e.stopPropagation(); setSelectedEdge(edge.id); setSelectedNode(null); }}
              />
            );
          })}
          
          {connectingFrom && (
            <line
              x1={state.nodes.find(n => n.id === connectingFrom)?.x || 0}
              y1={state.nodes.find(n => n.id === connectingFrom)?.y || 0}
              x2={screenToWorld(mousePos.x, mousePos.y).x}
              y2={screenToWorld(mousePos.x, mousePos.y).y}
              stroke="#00ff41"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        <div className="absolute pointer-events-auto" style={{ zIndex: 2 }}>
          {visibleNodes.map(node => (
            <Node 
              key={node.id} 
              node={node} 
              zoom={state.viewport.zoom}
              selected={selectedNode === node.id}
              childCount={state.nodes.filter(n => n.parentId === node.id).length}
              onMouseDown={handleNodeMouseDown}
              onDoubleClick={handleNodeDoubleClick}
              onContextMenu={handleContextMenu}
            />
          ))}
          {editingNode && (
            <div 
              style={{
                position: 'absolute',
                left: state.nodes.find(n => n.id === editingNode)?.x,
                top: state.nodes.find(n => n.id === editingNode)?.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <input
                ref={editInputRef}
                autoFocus
                className="bg-black border border-green-500 text-white p-1 font-mono text-center outline-none"
                defaultValue={state.nodes.find(n => n.id === editingNode)?.label}
                onKeyDown={(e) => handleLabelChange(e, editingNode)}
                onBlur={(e) => {
                  dispatch({ type: 'UPDATE_NODE', payload: { id: editingNode, label: e.currentTarget.value } });
                  setEditingNode(null);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed bg-black border border-white p-1 flex flex-col z-50 shadow-2xl text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.nodeId ? (
            <>
              <button 
                className="px-4 py-1 text-left hover:bg-white hover:text-black whitespace-nowrap"
                onClick={() => {
                  const node = state.nodes.find(n => n.id === contextMenu.nodeId);
                  if (node) {
                    dispatch({
                      type: 'ADD_NODE',
                      payload: { id: `sys_${Date.now()}`, type: 'SYSTEM', label: 'NEW SYSTEM', x: node.x + 100, y: node.y + 100, parentId: node.id }
                    });
                  }
                  setContextMenu(null);
                }}
              >
                Add child node
              </button>
              <button 
                className="px-4 py-1 text-left hover:bg-red-500 hover:text-black text-red-400 whitespace-nowrap"
                onClick={() => {
                  dispatch({ type: 'DELETE_NODE', payload: contextMenu.nodeId! });
                  setContextMenu(null);
                }}
              >
                Delete node
              </button>
            </>
          ) : (
            <button 
                className="px-4 py-1 text-left hover:bg-white hover:text-black whitespace-nowrap"
                onClick={() => {
                  const worldPos = screenToWorld(contextMenu.x, contextMenu.y);
                  dispatch({
                    type: 'ADD_NODE',
                    payload: { id: `note_${Date.now()}`, type: 'NOTE', label: 'New Note', x: worldPos.x, y: worldPos.y }
                  });
                  setContextMenu(null);
                }}
              >
                Add note here
              </button>
          )}
        </div>
      )}
    </div>
  );
}