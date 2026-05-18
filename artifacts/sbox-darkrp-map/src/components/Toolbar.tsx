import { GraphState, GraphAction, GraphNode } from "@/lib/types";
import { useLocation } from "wouter";

export function Toolbar({
  state,
  dispatch,
  onSave
}: {
  state: GraphState,
  dispatch: React.Dispatch<GraphAction>,
  onSave: () => void
}) {
  const [location, navigate] = useLocation();
  const handleNewNode = () => {
    const id = `sys_${Date.now()}`;
    const x = -state.viewport.x / state.viewport.zoom + window.innerWidth / 2 / state.viewport.zoom;
    const y = -state.viewport.y / state.viewport.zoom + window.innerHeight / 2 / state.viewport.zoom;
    dispatch({ type: 'ADD_NODE', payload: { id, type: 'SYSTEM', label: 'NEW SYSTEM', x, y } });
  };

  const handleNewCategory = () => {
    const id = `cat_${Date.now()}`;
    const x = -state.viewport.x / state.viewport.zoom + window.innerWidth / 2 / state.viewport.zoom;
    const y = -state.viewport.y / state.viewport.zoom + window.innerHeight / 2 / state.viewport.zoom;
    dispatch({ type: 'ADD_NODE', payload: { id, type: 'CATEGORY', label: 'NEW CATEGORY', x, y, color: '#ffffff' } });
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire map?")) {
      dispatch({ type: 'SET_STATE', payload: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } } });
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "sbox-darkrp-map.json");
    dlAnchorElem.click();
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
    
    const w = maxX - minX + 500;
    const h = maxY - minY + 500;
    
    const zoomX = window.innerWidth / w;
    const zoomY = window.innerHeight / h;
    const zoom = Math.min(zoomX, zoomY, 2);
    
    const cx = minX + (maxX - minX) / 2;
    const cy = minY + (maxY - minY) / 2;
    
    const vx = window.innerWidth / 2 - cx * zoom;
    const vy = window.innerHeight / 2 - cy * zoom;
    
    dispatch({ type: 'UPDATE_VIEWPORT', payload: { x: vx, y: vy, zoom } });
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
          const content = re.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.nodes && parsed.edges && parsed.viewport) {
             dispatch({ type: 'SET_STATE', payload: parsed });
          } else {
             alert("Invalid JSON format");
          }
        } catch (e) {
          alert("Error reading file");
        }
      };
      reader.readAsText(file);
    };
    el.click();
  };

  const tabs = [
    { label: "SYSTEMS MAP", path: "/" },
    { label: "JOB MAP", path: "/jobs" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-[#091018] border-b border-blue-500/20 flex items-center z-50 overflow-x-auto text-sm">
      <div className="font-bold text-blue-400 px-4 tracking-widest whitespace-nowrap border-r border-blue-500/20 h-full flex items-center">
        S&amp;BOX
      </div>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`px-4 h-full text-xs tracking-widest whitespace-nowrap border-r border-blue-500/20 transition-colors ${
            location === tab.path
              ? "text-blue-300 bg-blue-500/15"
              : "text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <div className="w-px h-full border-r border-blue-500/20 mx-1" />
      <button onClick={handleNewNode} className="px-2 py-1 mx-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[NEW NODE]</button>
      <button onClick={handleNewCategory} className="px-2 py-1 mx-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[NEW CATEGORY]</button>
      <button onClick={onSave} className="px-2 py-1 mx-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[SAVE]</button>
      <button onClick={loadData} className="px-2 py-1 mx-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[LOAD]</button>
      <button onClick={handleClear} className="px-2 py-1 mx-1 border border-red-500/40 text-red-400 hover:bg-red-500/20 whitespace-nowrap transition-colors">[CLEAR]</button>
      <div className="flex-1" />
      <button onClick={handleExport} className="px-2 py-1 mx-1 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[EXPORT JSON]</button>
      <button onClick={handleZoomFit} className="px-2 py-1 mx-1 mr-3 border border-blue-500/30 text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap transition-colors">[ZOOM FIT]</button>
    </div>
  );
}