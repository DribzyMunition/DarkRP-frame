import { useState } from 'react';

export function ShortcutsPanel() {
  const [open, setOpen] = useState(false);

  // Toggle with '?' key
  useState(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && e.target === document.body) {
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  if (!open) {
    return (
      <div className="fixed top-12 right-4 text-xs text-white opacity-50 z-40 pointer-events-none">
        Press '?' for shortcuts
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white p-6 z-50 max-w-md w-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <div className="flex justify-between items-center mb-4 border-b border-white border-opacity-30 pb-2">
        <h2 className="text-green-500 font-bold tracking-widest">KEYBOARD SHORTCUTS</h2>
        <button onClick={() => setOpen(false)} className="hover:text-red-500">[X]</button>
      </div>
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="text-gray-400">Pan Canvas</div>
        <div>Drag Background</div>
        <div className="text-gray-400">Zoom</div>
        <div>Scroll Wheel</div>
        <div className="text-gray-400">Connect Nodes</div>
        <div>Shift + Drag</div>
        <div className="text-gray-400">Edit Node</div>
        <div>Double Click</div>
        <div className="text-gray-400">Collapse Category</div>
        <div>Double Click</div>
        <div className="text-gray-400">Delete Node/Edge</div>
        <div>Select + Delete / Backspace</div>
        <div className="text-gray-400">Context Menu</div>
        <div>Right Click</div>
      </div>
    </div>
  );
}