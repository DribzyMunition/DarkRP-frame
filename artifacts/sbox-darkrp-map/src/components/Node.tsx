import { GraphNode } from "@/lib/types";

export function Node({
  node,
  zoom,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
  selected,
  childCount
}: {
  node: GraphNode;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDoubleClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  selected: boolean;
  childCount: number;
}) {
  let w = 150;
  let h = 40;
  let border = "1px solid white";
  let bg = "black";
  let textColor = "white";
  let classes = "flex items-center justify-center text-center p-2 box-border cursor-pointer absolute origin-top-left group";
  
  if (node.type === "CATEGORY") {
    w = 250;
    h = 50;
    border = `1px ${node.collapsed ? 'dashed' : 'solid'} ${node.color || '#fff'}`;
    textColor = node.color || 'white';
    classes += " font-bold text-lg tracking-wider bg-black";
    if (node.collapsed) bg = 'rgba(0,0,0,0.8)';
  } else if (node.type === "NOTE") {
    w = 200;
    h = 80;
    border = "1px dashed rgba(255,255,255,0.5)";
    textColor = "rgba(255,255,255,0.7)";
    classes += " italic text-sm";
  }

  if (selected) {
    border = `1px solid #00ff41`;
    classes += " shadow-[0_0_10px_rgba(0,255,65,0.5)]";
  }

  return (
    <div
      style={{
        transform: `translate(${node.x}px, ${node.y}px) translate(-50%, -50%)`,
        width: w,
        height: h,
        border,
        background: bg,
        color: textColor,
        zIndex: node.type === "CATEGORY" ? 10 : 5
      }}
      className={classes}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(node.id); }}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      <div className="select-none pointer-events-none line-clamp-3">
        {node.label}
        {node.type === "CATEGORY" && node.collapsed && childCount > 0 && ` [+${childCount}]`}
      </div>
      
      {/* Port overlays for shift-drag connection logic if we wanted visual ports, not required but nice. We connect center-to-center. */}
    </div>
  );
}