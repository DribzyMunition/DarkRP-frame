import { GraphState, GraphAction } from "@/lib/types";

export function Toolbar({
  state,
  dispatch,
  onSave,
}: {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
  onSave: () => void;
}) {
  const handleClear = () => {
    if (confirm("Clear the entire map?")) {
      dispatch({ type: "SET_STATE", payload: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } } });
    }
  };

  const handleExport = () => {
    const a = document.createElement("a");
    a.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state)));
    a.setAttribute("download", "sbox-darkrp-map.json");
    a.click();
  };

  const handleZoomFit = () => {
    if (state.nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    const zoom = Math.min(window.innerWidth / (maxX - minX + 500), window.innerHeight / (maxY - minY + 500), 2);
    const cx = minX + (maxX - minX) / 2;
    const cy = minY + (maxY - minY) / 2;
    dispatch({ type: "UPDATE_VIEWPORT", payload: { x: window.innerWidth / 2 - cx * zoom, y: window.innerHeight / 2 - cy * zoom, zoom } });
  };

  const loadData = () => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".json";
    el.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target?.result as string);
          if (parsed.nodes && parsed.edges && parsed.viewport) {
            dispatch({ type: "SET_STATE", payload: parsed });
          } else {
            alert("Invalid JSON format");
          }
        } catch {
          alert("Error reading file");
        }
      };
      reader.readAsText(file);
    };
    el.click();
  };

  const b = "px-2 py-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors text-xs";

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-[#091018] border-b border-blue-500/20 flex items-center px-4 gap-2 z-50 overflow-x-auto">
      <div className="font-bold text-blue-400 tracking-widest whitespace-nowrap mr-3 text-sm">
        S&amp;BOX
      </div>
      <div className="w-px h-5 bg-blue-500/20" />
      <button onClick={onSave}    className={b}>[SAVE]</button>
      <button onClick={loadData}  className={b}>[LOAD]</button>
      <button onClick={handleClear} className="px-2 py-1 border border-red-500/40 text-red-400 hover:bg-red-500/20 whitespace-nowrap transition-colors text-xs">[CLEAR]</button>
      <div className="flex-1" />
      <button onClick={handleExport}  className={b}>[EXPORT JSON]</button>
      <button onClick={handleZoomFit} className={b}>[ZOOM FIT]</button>
    </div>
  );
}
