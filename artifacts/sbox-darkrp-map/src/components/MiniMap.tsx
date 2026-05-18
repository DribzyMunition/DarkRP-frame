import { GraphState } from "@/lib/types";

export function MiniMap({ state }: { state: GraphState }) {
  if (state.nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.nodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  });

  const w = maxX - minX + 500;
  const h = maxY - minY + 500;
  
  const mapWidth = 200;
  const mapHeight = 150;
  const scale = Math.min(mapWidth / w, mapHeight / h);
  
  const offsetX = -minX + 250;
  const offsetY = -minY + 250;

  // Viewport rect
  const vw = window.innerWidth / state.viewport.zoom;
  const vh = window.innerHeight / state.viewport.zoom;
  const vx = -state.viewport.x / state.viewport.zoom;
  const vy = -state.viewport.y / state.viewport.zoom;

  return (
    <div className="fixed bottom-4 left-4 w-[200px] h-[150px] bg-black border border-white border-opacity-30 z-40 overflow-hidden pointer-events-none opacity-80">
      {state.nodes.map(n => (
        <div
          key={n.id}
          className="absolute"
          style={{
            left: (n.x + offsetX) * scale,
            top: (n.y + offsetY) * scale,
            width: n.type === 'CATEGORY' ? 4 : 2,
            height: n.type === 'CATEGORY' ? 4 : 2,
            background: n.type === 'CATEGORY' ? n.color || 'white' : 'rgba(255,255,255,0.5)',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      <div 
        className="absolute border border-green-500 bg-green-500 bg-opacity-10"
        style={{
          left: (vx + offsetX) * scale,
          top: (vy + offsetY) * scale,
          width: vw * scale,
          height: vh * scale
        }}
      />
    </div>
  );
}