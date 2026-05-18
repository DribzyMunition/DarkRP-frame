import { GraphState, GraphAction, GraphNode } from "@/lib/types";

export function Toolbar({ 
  state, 
  dispatch, 
  onSave 
}: { 
  state: GraphState, 
  dispatch: React.Dispatch<GraphAction>,
  onSave: () => void 
}) {
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

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-black border-b border-white border-opacity-30 flex items-center px-4 gap-2 z-50 overflow-x-auto text-sm">
      <div className="font-bold text-green-500 mr-4 tracking-widest whitespace-nowrap">S&BOX_ARCHITECT</div>
      <button onClick={handleNewNode} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[NEW NODE]</button>
      <button onClick={handleNewCategory} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[NEW CATEGORY]</button>
      <button onClick={onSave} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[SAVE]</button>
      <button onClick={loadData} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[LOAD]</button>
      <button onClick={handleClear} className="px-2 py-1 border border-red-500 border-opacity-50 text-red-400 hover:bg-red-500 hover:text-black whitespace-nowrap transition-colors">[CLEAR]</button>
      <div className="flex-1"></div>
      <button onClick={handleExport} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[EXPORT JSON]</button>
      <button onClick={handleZoomFit} className="px-2 py-1 border border-white border-opacity-30 hover:bg-white hover:text-black whitespace-nowrap transition-colors">[ZOOM FIT]</button>
    </div>
  );
}