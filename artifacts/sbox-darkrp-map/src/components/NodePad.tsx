import { GraphState, GraphAction } from "@/lib/types";

interface NodePadProps {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
}

// D-pad cross layout:
//         [CAT]
//  [NODE]  [+]  [NOTE]
//         [FIT]

const btn =
  "w-11 h-11 flex flex-col items-center justify-center font-mono text-[9px] tracking-widest leading-tight " +
  "bg-[#091018] border border-blue-500/30 text-slate-400 " +
  "hover:bg-blue-500/15 hover:border-blue-400/60 hover:text-blue-200 " +
  "active:scale-95 transition-all duration-100 select-none";

export function NodePad({ state, dispatch }: NodePadProps) {
  const centerX = () =>
    -state.viewport.x / state.viewport.zoom + window.innerWidth / 2 / state.viewport.zoom;
  const centerY = () =>
    -state.viewport.y / state.viewport.zoom + window.innerHeight / 2 / state.viewport.zoom;

  const newCategory = () => {
    dispatch({
      type: "ADD_NODE",
      payload: { id: `cat_${Date.now()}`, type: "CATEGORY", label: "NEW CATEGORY", x: centerX(), y: centerY(), color: "#60a5fa", collapsed: false },
    });
  };

  const newNode = () => {
    dispatch({
      type: "ADD_NODE",
      payload: { id: `sys_${Date.now()}`, type: "SYSTEM", label: "NEW NODE", x: centerX(), y: centerY() },
    });
  };

  const newNote = () => {
    dispatch({
      type: "ADD_NODE",
      payload: { id: `note_${Date.now()}`, type: "NOTE", label: "New note", x: centerX(), y: centerY() },
    });
  };

  const zoomFit = () => {
    if (state.nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    const w = maxX - minX + 500;
    const h = maxY - minY + 500;
    const zoom = Math.min(window.innerWidth / w, window.innerHeight / h, 2);
    const cx = minX + (maxX - minX) / 2;
    const cy = minY + (maxY - minY) / 2;
    dispatch({ type: "UPDATE_VIEWPORT", payload: { x: window.innerWidth / 2 - cx * zoom, y: window.innerHeight / 2 - cy * zoom, zoom } });
  };

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50 grid grid-cols-3 gap-0.5">
      {/* Row 1 */}
      <div />
      <button onClick={newCategory} className={btn} title="New Category">
        <span className="text-blue-400 text-base leading-none">⬡</span>
        <span>CAT</span>
      </button>
      <div />

      {/* Row 2 */}
      <button onClick={newNode} className={btn} title="New Node">
        <span className="text-blue-300 text-base leading-none">●</span>
        <span>NODE</span>
      </button>
      <div className="w-11 h-11 flex items-center justify-center bg-[#091018] border border-blue-500/20 text-blue-500/40 text-lg select-none">
        +
      </div>
      <button onClick={newNote} className={btn} title="New Note">
        <span className="text-slate-400 text-base leading-none">≡</span>
        <span>NOTE</span>
      </button>

      {/* Row 3 */}
      <div />
      <button onClick={zoomFit} className={btn} title="Zoom to fit">
        <span className="text-blue-300 text-base leading-none">⊞</span>
        <span>FIT</span>
      </button>
      <div />
    </div>
  );
}
