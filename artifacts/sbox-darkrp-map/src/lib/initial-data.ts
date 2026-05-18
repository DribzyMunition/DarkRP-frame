import { GraphNode, GraphEdge, GraphState } from "./types";

const categories = [
  { id: "c1", label: "CORE GAMEPLAY LOOP", color: "#00ff41", x: 3000, y: 2000, systems: ["Spawn Point", "Job Selection", "Earn Money", "Buy Items", "Player Conflict", "Death and Respawn", "Persistent World", "Session Length"] },
  { id: "c2", label: "ECONOMY", color: "#ffd700", x: 4200, y: 1800, systems: ["Money Printer", "Drug Lab", "Black Market", "Tax System", "Inflation Control", "Banking System", "Cash on Death", "Wage System"] },
  { id: "c3", label: "JOBS AND ROLES", color: "#00bfff", x: 3000, y: 800, systems: ["Citizen", "Gun Dealer", "Drug Cook", "Police Officer", "Mayor", "Mob Boss", "Hitman", "Medic", "Builder", "Informant"] },
  { id: "c4", label: "GOVERNMENT SYSTEMS", color: "#ff6b6b", x: 4500, y: 900, systems: ["Mayor Voting", "Law Board", "Police Force", "Warrant System", "Corruption Mechanic", "Wanted Level"] },
  { id: "c5", label: "CRIMINAL SYSTEMS", color: "#ff4500", x: 4400, y: 2800, systems: ["Gang Territory", "Contract System", "Crime Rating", "Prison System", "Escape Mechanics", "Crime Syndicate"] },
  { id: "c6", label: "MERCHANT SYSTEMS", color: "#da70d6", x: 4800, y: 2000, systems: ["Shop Licenses", "Black Market Vendor", "Dynamic Pricing", "Crafting Recipes", "Quality Tiers"] },
  { id: "c7", label: "HOUSING AND BASES", color: "#90ee90", x: 1500, y: 900, systems: ["Property Ownership", "Door Locks and Keys", "Base Building", "Raid Window", "Insurance", "Squatting"] },
  { id: "c8", label: "SOCIAL DYNAMICS", color: "#87ceeb", x: 1200, y: 2000, systems: ["Party System", "Reputation Score", "Friend Networks", "Alliance System", "Betrayal Mechanic"] },
  { id: "c9", label: "COMBAT AND RAIDING", color: "#ff6347", x: 3200, y: 3200, systems: ["Weapon Classes", "Ammo Economy", "Raid Tools", "Safe Zones", "Damage Falloff", "Combat Logging"] },
  { id: "c10", label: "ITEM PIPELINES", color: "#dda0dd", x: 1800, y: 3100, systems: ["Resource Nodes", "Crafting Stations", "Item Durability", "Black Market Flow", "Contraband Detection", "Supply Chains"] },
  { id: "c11", label: "WEALTH CREATION", color: "#f0e68c", x: 2600, y: 3500, systems: ["Legal Income", "Semi-legal Income", "Illegal Income", "Investment", "Theft", "Gambling"] },
  { id: "c12", label: "PLAYER RETENTION", color: "#98fb98", x: 600, y: 2500, systems: ["Daily Login Bonus", "Achievement System", "Prestige Loop", "Leaderboards", "Clan and Gang Perks", "Story Events", "Seasonal Wipes"] },
  { id: "c13", label: "TECHNICAL SYSTEMS", color: "#b0c4de", x: 5200, y: 3500, systems: ["Anti-cheat Layer", "Persistence DB", "Admin Tools", "Event System", "Permission Framework", "Networking Layer"] },
  { id: "c14", label: "UI AND UX SYSTEMS", color: "#e0e0e0", x: 3500, y: 200, systems: ["HUD Design", "Phone System", "Map Overlay", "Chat System", "Notification System", "Tutorial Flow"] },
  { id: "c15", label: "FUTURE CONTENT", color: "#9370db", x: 800, y: 3500, systems: ["Cross-server Trading", "Political Elections", "Storyline Engine", "Skill Trees", "Vehicle System", "Player Housing Persistence"] }
];

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];

categories.forEach(cat => {
  nodes.push({
    id: cat.id,
    type: "CATEGORY",
    label: cat.label,
    x: cat.x,
    y: cat.y,
    color: cat.color,
    collapsed: false
  });

  const angleStep = (2 * Math.PI) / cat.systems.length;
  cat.systems.forEach((sys, i) => {
    const r = 250 + (i % 3) * 60;
    const angle = i * angleStep;
    const sysId = `s_${cat.id}_${i}`;
    nodes.push({
      id: sysId,
      type: "SYSTEM",
      label: sys,
      x: cat.x + Math.cos(angle) * r,
      y: cat.y + Math.sin(angle) * r,
      parentId: cat.id
    });
    edges.push({
      id: `e_${cat.id}_${sysId}`,
      from: cat.id,
      to: sysId
    });
  });
});

// ─── WEALTH FLOW: central mega-hub ──────────────────────────────────────────
// Positioned at the gravitational center between ECONOMY, CRIMINAL SYSTEMS,
// CORE GAMEPLAY LOOP — acts as the second major axis of the whole map.
const WF_X = 3400;
const WF_Y = 2300;
const WF_RADIUS = 340;

nodes.push({
  id: "wf_hub",
  type: "CATEGORY",
  label: "WEALTH FLOW",
  x: WF_X,
  y: WF_Y,
  color: "#ff9500",
  collapsed: false
});

const wfSpokes = [
  { id: "wf_creation",     label: "CREATION",     angle: 0 },
  { id: "wf_storage",      label: "STORAGE",      angle: Math.PI * 0.25 },
  { id: "wf_risk",         label: "RISK",         angle: Math.PI * 0.5 },
  { id: "wf_laundering",   label: "LAUNDERING",   angle: Math.PI * 0.75 },
  { id: "wf_taxation",     label: "TAXATION",     angle: Math.PI },
  { id: "wf_robbery",      label: "ROBBERY",      angle: Math.PI * 1.25 },
  { id: "wf_deathloss",    label: "DEATH LOSS",   angle: Math.PI * 1.5 },
  { id: "wf_weaponization",label: "WEAPONIZATION",angle: Math.PI * 1.75 },
];

wfSpokes.forEach(({ id, label, angle }) => {
  nodes.push({
    id,
    type: "SYSTEM",
    label,
    x: WF_X + Math.cos(angle) * WF_RADIUS,
    y: WF_Y + Math.sin(angle) * WF_RADIUS,
    parentId: "wf_hub"
  });
  edges.push({ id: `e_wf_${id}`, from: "wf_hub", to: id });
});

// Connect WEALTH FLOW hub to the relevant category nodes
const wfCatLinks: [string, string][] = [
  ["c1",    "wf_hub"],   // CORE GAMEPLAY LOOP -> WEALTH FLOW
  ["wf_hub","c2"],       // WEALTH FLOW -> ECONOMY
  ["wf_hub","c4"],       // WEALTH FLOW -> GOVERNMENT SYSTEMS (taxation)
  ["wf_hub","c5"],       // WEALTH FLOW -> CRIMINAL SYSTEMS (laundering, robbery)
  ["wf_hub","c9"],       // WEALTH FLOW -> COMBAT AND RAIDING (weaponization)
  ["wf_hub","c11"],      // WEALTH FLOW -> WEALTH CREATION (creation)
];

wfCatLinks.forEach(([from, to]) => {
  edges.push({ id: `e_${from}_${to}_wf`, from, to });
});

// ─── NOTE nodes ─────────────────────────────────────────────────────────────
const noteNodes = [
  { id: "n1", label: "Crime Loop: Drug Cooks -> Black Market -> Gun Dealers -> Raiders -> Police Response", x: 4400, y: 3300 },
  { id: "n2", label: "Political Loop: Mayor sets taxes -> Citizens revolt -> Gang fills power vacuum", x: 4500, y: 1300 },
  { id: "n3", label: "Wealth Loop: Rich players become targets -> Hire hitmen -> Create bounty economy", x: 2600, y: 4000 },
  { id: "n4", label: "Onboarding Loop: New players -> Merchant income -> Stability -> Retention", x: 1000, y: 2800 },
  { id: "n5", label: "Wealth Flow Hub: Money is created, stored, taxed, stolen, laundered, weaponized, and lost on death — the complete lifecycle.", x: 3400, y: 2900 }
];

noteNodes.forEach(n => {
  nodes.push({ id: n.id, type: "NOTE", label: n.label, x: n.x, y: n.y });
});

// ─── Category-to-category edges ──────────────────────────────────────────────
const catEdges: [string, string][] = [
  ["c1", "c2"],
  ["c1", "c3"],
  ["c1", "c9"],
  ["c2", "c11"],
  ["c2", "c6"],
  ["c2", "c4"],
  ["c3", "c5"],
  ["c3", "c4"],
  ["c3", "c6"],
  ["c4", "c5"],
  ["c5", "c9"],
  ["c5", "c10"],
  ["c5", "c11"],
  ["c12", "c8"],
  ["c13", "c1"],
  ["c13", "c2"],
  ["c14", "c1"],
  ["c14", "c8"],
  ["c10", "c2"],
  ["c7", "c9"],
  ["c8", "c12"]
];

catEdges.forEach(([from, to]) => {
  edges.push({ id: `e_${from}_${to}`, from, to });
});

// Center viewport on the full map
// Map spans x: 600-5500, y: 200-4000 => center ~(3050, 2100)
export const initialGraphState: GraphState = {
  nodes,
  edges,
  viewport: {
    x: -122,
    y: -100,
    zoom: 0.25
  }
};
