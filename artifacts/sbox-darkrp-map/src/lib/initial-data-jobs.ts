import { GraphNode, GraphEdge, GraphState } from "./types";

function ring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  parentId: string,
  cx: number,
  cy: number,
  labels: string[],
  radius = 280
) {
  const step = (2 * Math.PI) / labels.length;
  labels.forEach((label, i) => {
    const angle = i * step - Math.PI / 2;
    const id = `${parentId}_s${i}`;
    nodes.push({
      id, type: "SYSTEM", label,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      parentId,
    });
    edges.push({ id: `e_${parentId}_${id}`, from: parentId, to: id });
  });
}

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];

// 2-column layout: col A = x:1400, col B = x:2800 | rows spaced 1300 apart
const jobs = [
  {
    id: "j_citizen",    label: "CITIZEN",        color: "#d4d4d4", x: 1400, y: 800,
    systems: ["Basic Wage","Property Rental","Mugging Target","Voting Rights","Business Patron","Freelance Work","Witness Role","Self Defense"],
  },
  {
    id: "j_gundealer",  label: "GUN DEALER",     color: "#ff8c00", x: 2800, y: 800,
    systems: ["Weapon Inventory","License Requirement","Ammo Supply Chain","Police Contract","Gang Contract","Black Market Route","Price Markup","Raid Vulnerability"],
  },
  {
    id: "j_drugcook",   label: "DRUG COOK",      color: "#39ff14", x: 1400, y: 2100,
    systems: ["Lab Setup Cost","Ingredient Sourcing","Product Quality Tiers","Distribution Network","Police Heat","Cook Time (AFK)","Cartel Tribute","Rival Cook Conflict"],
  },
  {
    id: "j_police",     label: "POLICE OFFICER", color: "#1e90ff", x: 2800, y: 2100,
    systems: ["Government Salary","Fine Collection","Confiscation Rights","Warrant Execution","Bribery Temptation","Gang Intel","Equipment Loadout","Corruption Risk"],
  },
  {
    id: "j_mayor",      label: "MAYOR",          color: "#ffd700", x: 1400, y: 3400,
    systems: ["Tax Rate Control","Law Decree","Police Budget","Public Treasury","Corruption Deals","Recall Election","VIP Access","Diplomatic Leverage"],
  },
  {
    id: "j_mobboss",    label: "MOB BOSS",        color: "#dc143c", x: 2800, y: 3400,
    systems: ["Tribute Network","Territory Map","Soldier Roster","Contract Issuing","Money Laundering","Rival Suppression","Political Influence","Escape Fund"],
  },
  {
    id: "j_hitman",     label: "HITMAN",          color: "#ff69b4", x: 1400, y: 4700,
    systems: ["Contract Board","Advance Deposit","Target Tracking","Disguise Option","Evidence Scrubbing","Reputation Tier","Double Cross Risk","Escape Route"],
  },
  {
    id: "j_medic",      label: "MEDIC",           color: "#00ff99", x: 2800, y: 4700,
    systems: ["Heal Rate","Field Medicine","Drug Treatment","Revive Service","Mobile Clinic","Gang Retainer","Police Medic","Black Market Meds"],
  },
  {
    id: "j_builder",    label: "BUILDER",         color: "#ff9500", x: 1400, y: 6000,
    systems: ["Prop Placement","Commission Jobs","Fortification Work","Blueprint Library","Material Sourcing","Demolition Contract","Hidden Room Design","Defense Consulting"],
  },
  {
    id: "j_informant",  label: "INFORMANT",       color: "#ba55d3", x: 2800, y: 6000,
    systems: ["Intel Gathering","Police Channel","Criminal Channel","Double Agent Play","Leak Pricing","Identity Concealment","Burn Risk","Safe House Access"],
  },
];

jobs.forEach(job => {
  nodes.push({ id: job.id, type: "CATEGORY", label: job.label, x: job.x, y: job.y, color: job.color, collapsed: false });
  ring(nodes, edges, job.id, job.x, job.y, job.systems);
});

[
  ["j_citizen",  "j_gundealer"],
  ["j_citizen",  "j_medic"],
  ["j_gundealer","j_police"],
  ["j_gundealer","j_mobboss"],
  ["j_gundealer","j_hitman"],
  ["j_drugcook", "j_mobboss"],
  ["j_drugcook", "j_informant"],
  ["j_drugcook", "j_police"],
  ["j_police",   "j_mayor"],
  ["j_police",   "j_informant"],
  ["j_mobboss",  "j_hitman"],
  ["j_mobboss",  "j_informant"],
  ["j_mobboss",  "j_mayor"],
  ["j_mobboss",  "j_builder"],
  ["j_hitman",   "j_informant"],
  ["j_medic",    "j_mobboss"],
  ["j_medic",    "j_police"],
  ["j_informant","j_police"],
  ["j_informant","j_mobboss"],
  ["j_builder",  "j_citizen"],
  ["j_mayor",    "j_police"],
  ["j_mayor",    "j_citizen"],
].forEach(([f, t]) => edges.push({ id: `ej_${f}_${t}`, from: f, to: t }));

export const initialJobsState: GraphState = {
  nodes,
  edges,
  viewport: { x: -50, y: -100, zoom: 0.13 },
};
