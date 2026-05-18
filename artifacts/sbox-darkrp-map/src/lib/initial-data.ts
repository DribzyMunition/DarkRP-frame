import { GraphNode, GraphEdge, GraphState } from "./types";

// ─── Helper ──────────────────────────────────────────────────────────────────
function ring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  parentId: string,
  cx: number,
  cy: number,
  labels: string[],
  radius = 310
) {
  const step = (2 * Math.PI) / labels.length;
  labels.forEach((label, i) => {
    const angle = i * step - Math.PI / 2;
    const id = `${parentId}_s${i}`;
    nodes.push({ id, type: "SYSTEM", label, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, parentId });
    edges.push({ id: `e_${parentId}_${id}`, from: parentId, to: id });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — SYSTEMS MAP
// ═══════════════════════════════════════════════════════════════════════════════
const categories = [
  { id: "c1",  label: "CORE GAMEPLAY LOOP",   color: "#00ff41", x: 3000, y: 2000, systems: ["Spawn Point","Job Selection","Earn Money","Buy Items","Player Conflict","Death and Respawn","Persistent World","Session Length"] },
  { id: "c2",  label: "ECONOMY",              color: "#ffd700", x: 4200, y: 1800, systems: ["Money Printer","Drug Lab","Black Market","Tax System","Inflation Control","Banking System","Cash on Death","Wage System"] },
  { id: "c3",  label: "JOBS AND ROLES",       color: "#00bfff", x: 3000, y: 800,  systems: ["Citizen","Gun Dealer","Drug Cook","Police Officer","Mayor","Mob Boss","Hitman","Medic","Builder","Informant"] },
  { id: "c4",  label: "GOVERNMENT SYSTEMS",   color: "#ff6b6b", x: 4500, y: 900,  systems: ["Mayor Voting","Law Board","Police Force","Warrant System","Corruption Mechanic","Wanted Level"] },
  { id: "c5",  label: "CRIMINAL SYSTEMS",     color: "#ff4500", x: 4400, y: 2800, systems: ["Gang Territory","Contract System","Crime Rating","Prison System","Escape Mechanics","Crime Syndicate"] },
  { id: "c6",  label: "MERCHANT SYSTEMS",     color: "#da70d6", x: 4800, y: 2000, systems: ["Shop Licenses","Black Market Vendor","Dynamic Pricing","Crafting Recipes","Quality Tiers"] },
  { id: "c7",  label: "HOUSING AND BASES",    color: "#90ee90", x: 1500, y: 900,  systems: ["Property Ownership","Door Locks and Keys","Base Building","Raid Window","Insurance","Squatting"] },
  { id: "c8",  label: "SOCIAL DYNAMICS",      color: "#87ceeb", x: 1200, y: 2000, systems: ["Party System","Reputation Score","Friend Networks","Alliance System","Betrayal Mechanic"] },
  { id: "c9",  label: "COMBAT AND RAIDING",   color: "#ff6347", x: 3200, y: 3200, systems: ["Weapon Classes","Ammo Economy","Raid Tools","Safe Zones","Damage Falloff","Combat Logging"] },
  { id: "c10", label: "ITEM PIPELINES",       color: "#dda0dd", x: 1800, y: 3100, systems: ["Resource Nodes","Crafting Stations","Item Durability","Black Market Flow","Contraband Detection","Supply Chains"] },
  { id: "c11", label: "WEALTH CREATION",      color: "#f0e68c", x: 2600, y: 3500, systems: ["Legal Income","Semi-legal Income","Illegal Income","Investment","Theft","Gambling"] },
  { id: "c12", label: "PLAYER RETENTION",     color: "#98fb98", x: 600,  y: 2500, systems: ["Daily Login Bonus","Achievement System","Prestige Loop","Leaderboards","Clan and Gang Perks","Story Events","Seasonal Wipes"] },
  { id: "c13", label: "TECHNICAL SYSTEMS",    color: "#b0c4de", x: 5200, y: 3500, systems: ["Anti-cheat Layer","Persistence DB","Admin Tools","Event System","Permission Framework","Networking Layer"] },
  { id: "c14", label: "UI AND UX SYSTEMS",    color: "#e0e0e0", x: 3500, y: 200,  systems: ["HUD Design","Phone System","Map Overlay","Chat System","Notification System","Tutorial Flow"] },
  { id: "c15", label: "FUTURE CONTENT",       color: "#9370db", x: 800,  y: 3500, systems: ["Cross-server Trading","Political Elections","Storyline Engine","Skill Trees","Vehicle System","Player Housing Persistence"] },
];

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];

categories.forEach(cat => {
  nodes.push({ id: cat.id, type: "CATEGORY", label: cat.label, x: cat.x, y: cat.y, color: cat.color, collapsed: false });
  const step = (2 * Math.PI) / cat.systems.length;
  cat.systems.forEach((sys, i) => {
    const r = 250 + (i % 3) * 60;
    const angle = i * step;
    const sysId = `s_${cat.id}_${i}`;
    nodes.push({ id: sysId, type: "SYSTEM", label: sys, x: cat.x + Math.cos(angle) * r, y: cat.y + Math.sin(angle) * r, parentId: cat.id });
    edges.push({ id: `e_${cat.id}_${sysId}`, from: cat.id, to: sysId });
  });
});

// WEALTH FLOW hub
const WF_X = 3400, WF_Y = 2300, WF_R = 340;
nodes.push({ id: "wf_hub", type: "CATEGORY", label: "WEALTH FLOW", x: WF_X, y: WF_Y, color: "#ff9500", collapsed: false });
[
  { id: "wf_creation",      label: "CREATION",      angle: 0 },
  { id: "wf_storage",       label: "STORAGE",       angle: Math.PI * 0.25 },
  { id: "wf_risk",          label: "RISK",          angle: Math.PI * 0.5 },
  { id: "wf_laundering",    label: "LAUNDERING",    angle: Math.PI * 0.75 },
  { id: "wf_taxation",      label: "TAXATION",      angle: Math.PI },
  { id: "wf_robbery",       label: "ROBBERY",       angle: Math.PI * 1.25 },
  { id: "wf_deathloss",     label: "DEATH LOSS",    angle: Math.PI * 1.5 },
  { id: "wf_weaponization", label: "WEAPONIZATION", angle: Math.PI * 1.75 },
].forEach(({ id, label, angle }) => {
  nodes.push({ id, type: "SYSTEM", label, x: WF_X + Math.cos(angle) * WF_R, y: WF_Y + Math.sin(angle) * WF_R, parentId: "wf_hub" });
  edges.push({ id: `e_wf_${id}`, from: "wf_hub", to: id });
});
[["c1","wf_hub"],["wf_hub","c2"],["wf_hub","c4"],["wf_hub","c5"],["wf_hub","c9"],["wf_hub","c11"]].forEach(([f,t]) =>
  edges.push({ id: `e_${f}_${t}_wf`, from: f, to: t })
);

// Notes
[
  { id: "n1", label: "Crime Loop: Drug Cooks -> Black Market -> Gun Dealers -> Raiders -> Police Response", x: 4400, y: 3300 },
  { id: "n2", label: "Political Loop: Mayor sets taxes -> Citizens revolt -> Gang fills power vacuum", x: 4500, y: 1300 },
  { id: "n3", label: "Wealth Loop: Rich players become targets -> Hire hitmen -> Create bounty economy", x: 2600, y: 4000 },
  { id: "n4", label: "Onboarding Loop: New players -> Merchant income -> Stability -> Retention", x: 1000, y: 2800 },
  { id: "n5", label: "Wealth Flow Hub: Money is created, stored, taxed, stolen, laundered, weaponized, and lost on death.", x: 3400, y: 2900 },
].forEach(n => nodes.push({ id: n.id, type: "NOTE", label: n.label, x: n.x, y: n.y }));

// Category edges
[["c1","c2"],["c1","c3"],["c1","c9"],["c2","c11"],["c2","c6"],["c2","c4"],["c3","c5"],["c3","c4"],["c3","c6"],
 ["c4","c5"],["c5","c9"],["c5","c10"],["c5","c11"],["c12","c8"],["c13","c1"],["c13","c2"],["c14","c1"],
 ["c14","c8"],["c10","c2"],["c7","c9"],["c8","c12"]
].forEach(([f,t]) => edges.push({ id: `e_${f}_${t}`, from: f, to: t }));


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — JOB DETAIL MAP  (starts at x ≈ 7000, entirely separate)
// ═══════════════════════════════════════════════════════════════════════════════

// Section header & divider
nodes.push({ id: "jdm_header", type: "NOTE", label: "// JOB FUNCTION MAP — each job's complete web of income, risk, tools, and interactions", x: 8200, y: 100 });
nodes.push({ id: "jdm_divider", type: "NOTE", label: "← DARK RP STRUCTURE   //   JOB DETAIL MAP →", x: 6150, y: 2100 });

// ── Job definitions ───────────────────────────────────────────────────────────
const jobs = [
  {
    id: "j_citizen", label: "CITIZEN", color: "#d4d4d4", x: 7400, y: 1200,
    systems: ["Basic Wage","Property Rental","Mugging Target","Voting Rights","Business Patron","Freelance Work","Witness Role","Self Defense"],
  },
  {
    id: "j_gundealer", label: "GUN DEALER", color: "#ff8c00", x: 9200, y: 1200,
    systems: ["Weapon Inventory","License Requirement","Ammo Supply Chain","Police Contract","Gang Contract","Black Market Route","Price Markup","Raid Vulnerability"],
  },
  {
    id: "j_drugcook", label: "DRUG COOK", color: "#39ff14", x: 7400, y: 2800,
    systems: ["Lab Setup Cost","Ingredient Sourcing","Product Quality Tiers","Distribution Network","Police Heat","Cook Time (AFK)","Cartel Tribute","Rival Cook Conflict"],
  },
  {
    id: "j_police", label: "POLICE OFFICER", color: "#1e90ff", x: 9200, y: 2800,
    systems: ["Government Salary","Fine Collection","Confiscation Rights","Warrant Execution","Bribery Temptation","Gang Intel","Equipment Loadout","Corruption Risk"],
  },
  {
    id: "j_mayor", label: "MAYOR", color: "#ffd700", x: 7400, y: 4400,
    systems: ["Tax Rate Control","Law Decree","Police Budget","Public Treasury","Corruption Deals","Recall Election","VIP Access","Diplomatic Leverage"],
  },
  {
    id: "j_mobboss", label: "MOB BOSS", color: "#dc143c", x: 9200, y: 4400,
    systems: ["Tribute Network","Territory Map","Soldier Roster","Contract Issuing","Money Laundering","Rival Suppression","Political Influence","Escape Fund"],
  },
  {
    id: "j_hitman", label: "HITMAN", color: "#ff69b4", x: 7400, y: 6000,
    systems: ["Contract Board","Advance Deposit","Target Tracking","Disguise Option","Evidence Scrubbing","Reputation Tier","Double Cross Risk","Escape Route"],
  },
  {
    id: "j_medic", label: "MEDIC", color: "#00ff99", x: 9200, y: 6000,
    systems: ["Heal Rate","Field Medicine","Drug Treatment","Revive Service","Mobile Clinic","Gang Retainer","Police Medic","Black Market Meds"],
  },
  {
    id: "j_builder", label: "BUILDER", color: "#ff9500", x: 7400, y: 7600,
    systems: ["Prop Placement","Commission Jobs","Fortification Work","Blueprint Library","Material Sourcing","Demolition Contract","Hidden Room Design","Defense Consulting"],
  },
  {
    id: "j_informant", label: "INFORMANT", color: "#ba55d3", x: 9200, y: 7600,
    systems: ["Intel Gathering","Police Channel","Criminal Channel","Double Agent Play","Leak Pricing","Identity Concealment","Burn Risk","Safe House Access"],
  },
];

jobs.forEach(job => {
  nodes.push({ id: job.id, type: "CATEGORY", label: job.label, x: job.x, y: job.y, color: job.color, collapsed: false });
  ring(nodes, edges, job.id, job.x, job.y, job.systems);
});

// ── Inter-job relationship edges ──────────────────────────────────────────────
const jobEdges: [string, string, string][] = [
  // [from, to, relationship-label-note-optional]
  ["j_citizen",   "j_gundealer",  "buys weapons"],
  ["j_citizen",   "j_medic",      "pays for healing"],
  ["j_gundealer", "j_police",     "legal supply"],
  ["j_gundealer", "j_mobboss",    "illegal bulk"],
  ["j_gundealer", "j_hitman",     "contract supply"],
  ["j_drugcook",  "j_mobboss",    "pays tribute"],
  ["j_drugcook",  "j_informant",  "intel target"],
  ["j_drugcook",  "j_police",     "police target"],
  ["j_police",    "j_mayor",      "funded by mayor"],
  ["j_police",    "j_informant",  "buys intel"],
  ["j_mobboss",   "j_hitman",     "employs hitmen"],
  ["j_mobboss",   "j_informant",  "buys intel"],
  ["j_mobboss",   "j_mayor",      "bribes mayor"],
  ["j_mobboss",   "j_builder",    "builds bases"],
  ["j_hitman",    "j_informant",  "buys target intel"],
  ["j_medic",     "j_mobboss",    "gang retainer"],
  ["j_medic",     "j_police",     "police contract"],
  ["j_informant", "j_police",     "sells to police"],
  ["j_informant", "j_mobboss",    "sells to mob"],
  ["j_builder",   "j_citizen",    "builds for citizens"],
  ["j_mayor",     "j_police",     "commands police"],
  ["j_mayor",     "j_citizen",    "taxes citizens"],
];

jobEdges.forEach(([f, t]) =>
  edges.push({ id: `ej_${f}_${t}`, from: f, to: t })
);

// ── Cross-section bridges: connect jobs to main systems map ──────────────────
edges.push({ id: "bridge_mayor_gov",    from: "j_mayor",    to: "c4"  });  // Mayor -> GOVERNMENT SYSTEMS
edges.push({ id: "bridge_police_gov",   from: "j_police",   to: "c4"  });  // Police -> GOVERNMENT SYSTEMS
edges.push({ id: "bridge_mob_crim",     from: "j_mobboss",  to: "c5"  });  // Mob Boss -> CRIMINAL SYSTEMS
edges.push({ id: "bridge_cook_econ",    from: "j_drugcook", to: "c2"  });  // Drug Cook -> ECONOMY
edges.push({ id: "bridge_gundealer_c6", from: "j_gundealer","to": "c6" });  // Gun Dealer -> MERCHANT SYSTEMS
edges.push({ id: "bridge_hitman_wf",    from: "j_hitman",   to: "wf_hub" }); // Hitman -> WEALTH FLOW


// ─── Viewport — zoomed out to show both maps together ───────────────────────
// Combined bounds: x 400-9700, y 100-8400  =>  center (5050, 4250)
// At zoom 0.1: vx = 640 - 5050*0.1 = 135 | vy = 340 - 4250*0.1 = -85
export const initialGraphState: GraphState = {
  nodes,
  edges,
  viewport: { x: 135, y: -85, zoom: 0.1 }
};
