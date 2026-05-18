import { useLocation } from "wouter";

const tabs = [
  { label: "SYSTEMS MAP", path: "/" },
  { label: "JOB MAP", path: "/jobs" },
];

export function NavTabs() {
  const [location, navigate] = useLocation();

  return (
    <div className="absolute top-0 left-0 z-50 flex" style={{ marginLeft: "0px" }}>
      {tabs.map((tab) => {
        const active = location === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`px-5 py-2 text-xs font-mono font-bold tracking-widest border-r border-b transition-colors ${
              active
                ? "bg-white text-black border-white"
                : "bg-black text-gray-400 border-gray-700 hover:text-white hover:border-gray-400"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
