import { useGraphStore } from "@/lib/store";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { MiniMap } from "@/components/MiniMap";
import { ZoomHUD } from "@/components/ZoomHUD";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { useState } from "react";

export default function MapEditor() {
  const { state, dispatch } = useGraphStore();
  const [saveFlash, setSaveFlash] = useState(false);

  const handleManualSave = () => {
    localStorage.setItem('sbox-darkrp-map-v1', JSON.stringify(state));
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1000);
  };

  return (
    <div className="w-full h-screen relative bg-black text-white font-mono overflow-hidden">
      <Toolbar state={state} dispatch={dispatch} onSave={handleManualSave} />
      <Canvas state={state} dispatch={dispatch} />
      <MiniMap state={state} />
      <ZoomHUD state={state} dispatch={dispatch} />
      <ShortcutsPanel />
      
      {saveFlash && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 font-bold z-50 transition-opacity">
          [SAVED]
        </div>
      )}
    </div>
  );
}