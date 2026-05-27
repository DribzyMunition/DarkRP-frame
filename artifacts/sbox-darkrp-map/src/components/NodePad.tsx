import { GraphState, GraphAction } from "@/lib/types";
import { useRef, useState } from "react";

interface NodePadProps {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
  webColor: string;
  onWebColorChange: (color: string) => void;
  onNodeCreated: (id: string) => void;
}

const btn =
  "w-11 h-11 flex flex-col items-center justify-center font-mono text-[9px] tracking-widest leading-tight " +
  "bg-[#091018] border border-blue-500/30 text-slate-400 " +
  "hover:bg-blue-500/15 hover:border-blue-400/60 hover:text-blue-200 " +
  "active:scale-95 transition-all duration-100 select-none";

export function NodePad({ state, dispatch, webColor, onWebColorChange, onNodeCreated }: NodePadProps) {
  const [catColor, setCatColor] = useState("#60a5fa");
  const catColorRef = useRef<HTMLInputElement>(null);
  const webColorRef = useRef<HTMLInputElement>(null);

  const centerX = () =>
    -state.viewport.x / state.viewport.zoom + window.innerWidth / 2 / state.viewport.zoom;
  const centerY = () =>
    -state.viewport.y / state.viewport.zoom + window.innerHeight / 2 / state.viewport.zoom;

  const newCategory = () => {
    const id = `cat_${Date.now()}`;
    dispatch({
      type: "ADD_NODE",
      payload: { id, type: "CATEGORY", label: "NEW CATEGORY", x: centerX(), y: centerY(), color: catColor, collapsed: false },
    });
    onNodeCreated(id);
  };

  const newNode = () => {
    const id = `sys_${Date.now()}`;
    dispatch({
      type: "ADD_NODE",
      payload: { id, type: "SYSTEM", label: "NEW NODE", x: centerX(), y: centerY() },
    });
    onNodeCreated(id);
  };

  const newNote = () => {
    const id = `note_${Date.now()}`;
    dispatch({
      type: "ADD_NODE",
      payload: { id, type: "NOTE", label: "New note", x: centerX(), y: centerY() },
    });
    onNodeCreated(id);
  };

  const zoomFit = () => {
    if (state.nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.nodes.forEach((n) => {
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
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1">
      <div className="grid grid-cols-3 gap-0.5">
        <div />
        <button onClick={newCategory} className={btn} title="New Category">
          <span className="text-base leading-none transition-colors duration-150" style={{ color: catColor }}>⬡</span>
          <span>CAT</span>
        </button>
        <div />

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

        <div />
        <button onClick={zoomFit} className={btn} title="Zoom to fit">
          <span className="text-blue-300 text-base leading-none">⊞</span>
          <span>FIT</span>
        </button>
        <div />
      </div>

      <div className="mt-1 w-full flex flex-col gap-0.5">
        <button
          className="w-full flex items-center gap-1.5 px-2 py-1.5 bg-[#091018] border border-blue-500/20 text-[9px] text-slate-500 font-mono tracking-widest hover:border-blue-400/50 hover:text-slate-300 active:scale-95 transition-all duration-100 select-none"
          onClick={() => catColorRef.current?.click()}
          title="Category colour — used for the next CAT added"
        >
          <span className="w-3 h-3 flex-shrink-0 border border-white/20 transition-colors duration-150" style={{ background: catColor }} />
          <span>CAT CLR</span>
          <input
            ref={catColorRef}
            type="color"
            value={catColor}
            className="sr-only"
            onChange={(e) => setCatColor(e.target.value)}
          />
        </button>

        <button
          className="w-full flex items-center gap-1.5 px-2 py-1.5 bg-[#091018] border border-blue-500/20 text-[9px] text-slate-500 font-mono tracking-widest hover:border-blue-400/50 hover:text-slate-300 active:scale-95 transition-all duration-100 select-none"
          onClick={() => webColorRef.current?.click()}
          title="Web/connection colour — applies to all lines on this map"
        >
          <span className="w-3 h-3 flex-shrink-0 border border-white/20 transition-colors duration-150" style={{ background: webColor }} />
          <span>WEB CLR</span>
          <input
            ref={webColorRef}
            type="color"
            value={webColor}
            className="sr-only"
            onChange={(e) => onWebColorChange(e.target.value)}
          />
        </button>
      </div>
    </div>
  );
}
