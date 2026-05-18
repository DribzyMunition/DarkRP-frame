import { GraphNode, GraphEdge, GraphState } from "./types";

function ring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  parentId: string,
  cx: number,
  cy: number,
  labels: string[],
  radius = 220
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

//
//  Layout — reads left=law, right=criminal, center=neutral/supply
//
//                    MAYOR  (2000, 350)
//                  /               \
//        POLICE (650, 1050)      MOB BOSS (3350, 1050)
//          |   \                 /   |
//       CITIZEN  \  INFORMANT  /  DRUG COOK
//      (200,1950)  \  (2000,1650)  / (3800,1950)
//                   \            /
//                   GUN DEALER (2000,2650)  ← supply hub
//                   /       \
//              HITMAN        MEDIC
//             (900,3400)   (3100,3400)
//                   \        /
//                   BUILDER (2000,4000)
//

const jobs = [
  {
    id: "j_mayor",
    label: "MAYOR",
    color: "#ffd700",
    x: 2000, y: 350,
    systems: ["Set Tax Rate", "Pass Laws", "Fund Police", "Take Bribes"],
  },
  {
    id: "j_police",
    label: "POLICE",
    color: "#1e90ff",
    x: 650, y: 1050,
    systems: ["Arrest Criminals", "Issue Warrants", "Collect Fines", "Enforce Laws"],
  },
  {
    id: "j_mobboss",
    label: "MOB BOSS",
    color: "#dc143c",
    x: 3350, y: 1050,
    systems: ["Control Territory", "Issue Contracts", "Collect Tribute", "Launder Money"],
  },
  {
    id: "j_citizen",
    label: "CITIZEN",
    color: "#d4d4d4",
    x: 200, y: 1950,
    systems: ["Pay Taxes", "Own Property", "Vote", "Get Mugged"],
  },
  {
    id: "j_informant",
    label: "INFORMANT",
    color: "#ba55d3",
    x: 2000, y: 1650,
    systems: ["Gather Intel", "Sell to Police", "Sell to Criminals", "Stay Hidden"],
  },
  {
    id: "j_drugcook",
    label: "DRUG COOK",
    color: "#39ff14",
    x: 3800, y: 1950,
    systems: ["Run Lab", "Sell Product", "Evade Police", "Pay Tribute"],
  },
  {
    id: "j_gundealer",
    label: "GUN DEALER",
    color: "#ff8c00",
    x: 2000, y: 2650,
    systems: ["Sell Weapons", "Set Prices", "Legal Sales", "Black Market Sales"],
  },
  {
    id: "j_hitman",
    label: "HITMAN",
    color: "#ff69b4",
    x: 900, y: 3400,
    systems: ["Take Contracts", "Track Targets", "Eliminate Target", "Collect Payment"],
  },
  {
    id: "j_medic",
    label: "MEDIC",
    color: "#00ff99",
    x: 3100, y: 3400,
    systems: ["Heal Players", "Revive Downed", "Sell Meds", "Field Support"],
  },
  {
    id: "j_builder",
    label: "BUILDER",
    color: "#ff9500",
    x: 2000, y: 4100,
    systems: ["Build Bases", "Fortify Properties", "Take Commissions", "Design Hideouts"],
  },
];

jobs.forEach(job => {
  nodes.push({ id: job.id, type: "CATEGORY", label: job.label, x: job.x, y: job.y, color: job.color, collapsed: false });
  ring(nodes, edges, job.id, job.x, job.y, job.systems);
});

// ─── Relationship edges ────────────────────────────────────────────────────────
// Mayor bridges both sides
[
  ["j_mayor",     "j_police"],     // commands police
  ["j_mayor",     "j_mobboss"],    // corrupted by / pressures mob
  ["j_mayor",     "j_citizen"],    // taxes & voting

  // Law side
  ["j_police",    "j_drugcook"],   // enforcement target
  ["j_police",    "j_informant"],  // buys intel
  ["j_police",    "j_citizen"],    // protects citizens
  ["j_police",    "j_mobboss"],    // direct conflict

  // Criminal side
  ["j_mobboss",   "j_drugcook"],   // tribute / supply control
  ["j_mobboss",   "j_hitman"],     // issues kill contracts
  ["j_mobboss",   "j_informant"],  // buys intel / has informants
  ["j_drugcook",  "j_informant"],  // tipped off / protected by

  // Gun Dealer — central supply hub (no mayor, no medic)
  ["j_gundealer", "j_police"],     // legal sales
  ["j_gundealer", "j_mobboss"],    // criminal sales
  ["j_gundealer", "j_hitman"],     // assassination tools
  ["j_gundealer", "j_drugcook"],   // lab protection
  ["j_gundealer", "j_builder"],    // equipment for base builds

  // Hitman
  ["j_hitman",    "j_informant"],  // needs target info

  // Medic — neutral, serves both sides
  ["j_medic",     "j_police"],     // law enforcement support
  ["j_medic",     "j_mobboss"],    // gang retainer

  // Builder — neutral construction
  ["j_builder",   "j_mobboss"],    // builds criminal hideouts
  ["j_builder",   "j_citizen"],    // builds civilian properties
].forEach(([f, t]) => edges.push({ id: `ej_${f}_${t}`, from: f, to: t }));

// ─── Axis labels ──────────────────────────────────────────────────────────────
nodes.push({ id: "lbl_law",      type: "NOTE", label: "← LAW",            x: -300,  y: 1050 });
nodes.push({ id: "lbl_crim",     type: "NOTE", label: "CRIMINAL →",        x: 4400,  y: 1050 });
nodes.push({ id: "lbl_supply",   type: "NOTE", label: "SUPPLY HUB — most factions require weapons", x: 2000, y: 3000 });

export const initialJobsState: GraphState = {
  nodes,
  edges,
  viewport: { x: 370, y: 80, zoom: 0.14 },
};
