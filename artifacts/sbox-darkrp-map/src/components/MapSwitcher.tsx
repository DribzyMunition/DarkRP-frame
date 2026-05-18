import { useLocation } from "wouter";

const maps = [
  { path: "/",      label: "SYSTEMS", sub: "MAP" },
  { path: "/jobs",  label: "JOB",     sub: "MAP"  },
];

export function MapSwitcher() {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-5 z-50">
      {maps.map(m => {
        const active = location === m.path;
        return (
          <button
            key={m.path}
            onClick={() => navigate(m.path)}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-mono tracking-widest transition-all duration-200 border-2 select-none ${
              active
                ? "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_24px_rgba(96,165,250,0.45)] scale-110"
                : "bg-[#091018] border-blue-500/25 text-slate-500 hover:border-blue-400/50 hover:text-blue-300 hover:scale-105 hover:shadow-[0_0_12px_rgba(96,165,250,0.2)]"
            }`}
          >
            <span className="font-bold text-[13px] leading-tight">{m.label}</span>
            <span className="text-[9px] opacity-60 mt-0.5">{m.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
