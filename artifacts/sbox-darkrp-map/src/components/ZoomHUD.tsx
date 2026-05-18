import { GraphState, GraphAction } from "@/lib/types";

export function ZoomHUD({ state, dispatch }: { state: GraphState, dispatch: React.Dispatch<GraphAction> }) {
  const handleZoom = (delta: number) => {
    let newZoom = state.viewport.zoom + delta;
    newZoom = Math.max(0.05, Math.min(newZoom, 5));
    
    // Zoom around center of screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    
    const newX = cx - (cx - state.viewport.x) * (newZoom / state.viewport.zoom);
    const newY = cy - (cy - state.viewport.y) * (newZoom / state.viewport.zoom);
    
    dispatch({ type: 'UPDATE_VIEWPORT', payload: { x: newX, y: newY, zoom: newZoom } });
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center bg-[#091018] border border-blue-500/30 z-40 text-sm">
      <div className="px-3 py-1 font-mono border-r border-blue-500/30 text-slate-300">
        ZOOM: {state.viewport.zoom.toFixed(2)}x
      </div>
      <button onClick={() => handleZoom(-0.25)} className="px-3 py-1 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 border-r border-blue-500/30 transition-colors">-</button>
      <button onClick={() => handleZoom(0.25)} className="px-3 py-1 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 transition-colors">+</button>
    </div>
  );
}