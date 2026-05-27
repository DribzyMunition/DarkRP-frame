import { useGraphStore } from "@/lib/store";
import { initialSystemsState } from "@/lib/initial-data-systems";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { MiniMap } from "@/components/MiniMap";
import { ZoomHUD } from "@/components/ZoomHUD";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { MapSwitcher } from "@/components/MapSwitcher";
import { NodePad } from "@/components/NodePad";
import { useState, useEffect, useMemo } from "react";
import { decodeState, buildShareUrl } from "@/lib/share";

const STORAGE_KEY = "sbox-darkrp-systems-v1";
const WEB_COLOR_KEY = "sbox-darkrp-webcolor-systems";

export default function MapEditor() {
  const urlState = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const encoded = p.get("map");
    return encoded ? decodeState(encoded) : null;
  }, []);

  const { state, dispatch } = useGraphStore(STORAGE_KEY, initialSystemsState, urlState);
  const [saveFlash, setSaveFlash] = useState(false);
  const [shareFlash, setShareFlash] = useState(false);
  const [webColor, setWebColor] = useState(() => localStorage.getItem(WEB_COLOR_KEY) || "#60a5fa");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(WEB_COLOR_KEY, webColor);
  }, [webColor]);

  const handleManualSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1000);
  };

  const handleShare = () => {
    const url = buildShareUrl(state);
    navigator.clipboard.writeText(url).then(() => {
      setShareFlash(true);
      setTimeout(() => setShareFlash(false), 2000);
    });
  };

  return (
    <div className="w-full h-screen relative bg-[#0d1623] text-slate-100 font-mono overflow-hidden">
      <Toolbar state={state} dispatch={dispatch} onSave={handleManualSave} onShare={handleShare} />
      <Canvas state={state} dispatch={dispatch} webColor={webColor} editingNodeId={editingNodeId} onEditingNodeChange={setEditingNodeId} />
      <MiniMap state={state} />
      <ZoomHUD state={state} dispatch={dispatch} />
      <ShortcutsPanel />
      <NodePad state={state} dispatch={dispatch} webColor={webColor} onWebColorChange={setWebColor} onNodeCreated={setEditingNodeId} />
      <MapSwitcher />

      {saveFlash && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 font-bold z-50">
          [SAVED]
        </div>
      )}
      {shareFlash && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 font-bold z-50">
          [LINK COPIED]
        </div>
      )}
    </div>
  );
}
