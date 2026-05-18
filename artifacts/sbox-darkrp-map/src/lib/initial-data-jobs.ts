import { GraphNode, GraphEdge, GraphState } from "./types";

function ring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  parentId: string,
  cx: number,
  cy: number,
  labels: string[],
  radius = 210
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
//  Circular web layout — 9 jobs on the outer ring, INFORMANT at the hub.
//  Reading clockwise from 12 o'clock:
//
//              MAYOR   (2000,  550)   ← governance
//           /                    \
//   POLICE  (900, 1100)    MOB BOSS (3100, 1100)
//      |                              |
//   CITIZEN (600, 2050)        DRUG COOK (3450, 2000)
//      |                              |
//   BUILDER (950, 3100)         HITMAN  (3200, 2850)
//           \                    /
//          GUN DEALER (2000, 3550)   ← supply hub
//              MEDIC   (2750, 3200)   (lower-right)
//
//          INFORMANT   (2000, 1800)   ← centre / cross-faction hub
//

const jobs = [
  {
    id:      "j_mayor",
    label:   "MAYOR",
    color:   "#ffd700",
    x: 2000, y: 550,
    systems: ["Set Tax Rate", "Pass Laws", "Fund Police", "Take Bribes"],
  },
  {
    id:      "j_police",
    label:   "POLICE",
    color:   "#1e90ff",
    x: 900,  y: 1100,
    systems: ["Enforce Laws", "Arrest Criminals", "Issue Warrants", "Protect Citizens"],
  },
  {
    id:      "j_mobboss",
    label:   "MOB BOSS",
    color:   "#dc143c",
    x: 3100, y: 1100,
    systems: ["Control Territory", "Issue Contracts", "Collect Tribute", "Launder Money"],
  },
  {
    id:      "j_citizen",
    label:   "CITIZEN",
    color:   "#d4d4d4",
    x: 600,  y: 2050,
    systems: ["Pay Taxes", "Own Property", "Vote", "Survive"],
  },
  {
    id:      "j_drugcook",
    label:   "DRUG COOK",
    color:   "#39ff14",
    x: 3450, y: 2000,
    systems: ["Run Lab", "Sell Product", "Evade Police", "Pay Tribute"],
  },
  {
    id:      "j_builder",
    label:   "BUILDER",
    color:   "#ff9500",
    x: 950,  y: 3100,
    systems: ["Build Bases", "Fortify Properties", "Take Commissions", "Design Hideouts"],
  },
  {
    id:      "j_hitman",
    label:   "HITMAN",
    color:   "#ff69b4",
    x: 3200, y: 2850,
    systems: ["Take Contracts", "Track Targets", "Eliminate Target", "Collect Payment"],
  },
  {
    id:      "j_gundealer",
    label:   "GUN DEALER",
    color:   "#ff8c00",
    x: 2000, y: 3550,
    systems: ["Sell Weapons", "Set Prices", "Legal Sales", "Black Market"],
  },
  {
    id:      "j_medic",
    label:   "MEDIC",
    color:   "#00ff99",
    x: 2750, y: 3200,
    systems: ["Heal Players", "Revive Downed", "Sell Meds", "Field Support"],
  },
  {
    id:      "j_informant",
    label:   "INFORMANT",
    color:   "#ba55d3",
    x: 2000, y: 1850,
    systems: ["Gather Intel", "Sell to Police", "Sell to Criminals", "Stay Hidden"],
  },
];

jobs.forEach(job => {
  nodes.push({
    id: job.id, type: "CATEGORY", label: job.label,
    x: job.x, y: job.y, color: job.color, collapsed: false,
  });
  ring(nodes, edges, job.id, job.x, job.y, job.systems);
});

// ─── Relationship edges ────────────────────────────────────────────────────────
//
//  Outer ring edges (clockwise adjacency where a real relationship exists):
//    MAYOR → POLICE → CITIZEN → BUILDER → GUN DEALER → MEDIC → HITMAN → DRUG COOK → MOB BOSS → MAYOR
//
//  Inner spoke edges (INFORMANT hub to relevant outer nodes):
//    INFORMANT → POLICE, MOB BOSS, DRUG COOK, HITMAN
//
//  Cross-ring edges (faction logic):
//    POLICE ↔ MOB BOSS (direct conflict)
//    MOB BOSS ↔ HITMAN (contracts)
//    MOB BOSS ↔ DRUG COOK (tribute)
//    GUN DEALER → POLICE, MOB BOSS, HITMAN, DRUG COOK, BUILDER
//    MEDIC → POLICE, MOB BOSS
//    BUILDER → CITIZEN, MOB BOSS
//    MAYOR → CITIZEN, MOB BOSS

[
  // ── Outer ring arc — law side (left) ──
  ["j_mayor",     "j_police"],      // commands police
  ["j_police",    "j_citizen"],     // protects citizens
  ["j_citizen",   "j_builder"],     // builder works for citizens

  // ── Outer ring arc — criminal side (right) ──
  ["j_mayor",     "j_mobboss"],     // corruption / political leverage
  ["j_mobboss",   "j_drugcook"],    // tribute & supply control
  ["j_drugcook",  "j_hitman"],      // hired muscle for the cook

  // ── Bottom arc ──
  ["j_builder",   "j_gundealer"],   // equipment for base builds
  ["j_gundealer", "j_medic"],       // medic buys supplies/protection
  ["j_hitman",    "j_gundealer"],   // assassination tools
  ["j_medic",     "j_hitman"],      // patched up after hits (proximity)

  // ── Cross-ring: law vs criminal ──
  ["j_police",    "j_mobboss"],     // direct conflict
  ["j_police",    "j_drugcook"],    // enforcement target

  // ── Cross-ring: gun dealer supply web ──
  ["j_gundealer", "j_police"],      // legal sales
  ["j_gundealer", "j_mobboss"],     // black market

  // ── Mayor governance ──
  ["j_mayor",     "j_citizen"],     // taxes & voting

  // ── Mob boss reach ──
  ["j_mobboss",   "j_hitman"],      // issues kill contracts
  ["j_mobboss",   "j_builder"],     // builds criminal hideouts

  // ── Medic: neutral, serves both sides ──
  ["j_medic",     "j_police"],
  ["j_medic",     "j_mobboss"],

  // ── Informant hub spokes — cross-faction intelligence ──
  ["j_informant", "j_police"],      // sells intel to police
  ["j_informant", "j_mobboss"],     // mole / sells intel to mob
  ["j_informant", "j_drugcook"],    // embedded in drug network
  ["j_informant", "j_hitman"],      // feeds target locations
  ["j_informant", "j_mayor"],       // tips off mayor
].forEach(([f, t]) =>
  edges.push({ id: `ej_${f}_${t}`, from: f, to: t })
);

// ─── Axis / zone labels ────────────────────────────────────────────────────────
nodes.push({ id: "lbl_law",    type: "NOTE", label: "← LAW",       x: -200,  y: 1550 });
nodes.push({ id: "lbl_crim",   type: "NOTE", label: "CRIMINAL →",  x: 4100,  y: 1550 });
nodes.push({ id: "lbl_supply", type: "NOTE", label: "SUPPLY HUB",  x: 2000,  y: 3950 });

export const initialJobsState: GraphState = {
  nodes,
  edges,
  // centre on (2025, 2050), show full web at zoom 0.13
  viewport: { x: 377, y: 133, zoom: 0.13 },
};
