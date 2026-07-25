/* ============================================================
   Admin — Vouch graph (the full trust-network experience).
   Static trust network + pure graph helpers. No React here.
   ============================================================ */

import { portrait } from "./adminPeople.data";

export type VouchTone =
  "coral" | "jade" | "violet" | "amber" | "plum" | "danger";
export type SceneKey =
  "tf" | "creatives" | "nightlife" | "newly" | "elders" | "ring";
export type Standing = "trusted" | "warned" | "new" | "flagged";

export interface Scene {
  /** Real community/scene name (content) — undefined for the one chrome
   *  exception ("ring"), which sets `labelKey` instead. */
  label?: string;
  /** Set only for the "ring" entry: a system-generated category, not a real
   *  community name, so it resolves through the catalog like the same label
   *  in the "Safety" legend (`vouchGraph.legend.safety.ring`). */
  labelKey?: string;
  /** token-backed series colour for the "Scenes" overlay + legend */
  color: string;
}

export const SCENES: Record<SceneKey, Scene> = {
  tf: { label: "Trans & Friends", color: "var(--jade)" },
  creatives: { label: "Queer Creatives", color: "var(--violet)" },
  nightlife: { label: "Nightlife", color: "var(--accent)" },
  newly: { label: "Newly Arrived", color: "var(--amber)" },
  elders: { label: "Elders & Memory", color: "var(--plum)" },
  ring: {
    labelKey: "admin:vouchGraph.legend.safety.ring",
    color: "var(--danger)",
  },
};

/**
 * Fixed sector each community is pulled toward, so the force layout organises
 * into readable clusters instead of one tangle. Evenly spread around the focus.
 */
const ANCHOR_R = 215;
const SCENE_ANGLE: Record<SceneKey, number> = {
  tf: -Math.PI / 2,
  creatives: -Math.PI / 6,
  nightlife: Math.PI / 6,
  newly: Math.PI / 2,
  elders: (5 * Math.PI) / 6,
  ring: (-5 * Math.PI) / 6,
};
export const SCENE_ANCHOR = Object.fromEntries(
  (Object.entries(SCENE_ANGLE) as [SceneKey, number][]).map(([k, a]) => [
    k,
    { x: Math.cos(a) * ANCHOR_R, y: Math.sin(a) * ANCHOR_R },
  ]),
) as Record<SceneKey, { x: number; y: number }>;

export interface ToneInk {
  stroke: string;
  fill: string;
}

/** Per-tone SVG fill/stroke, token-backed (no hex). */
export const TONE: Record<VouchTone, ToneInk> = {
  coral: { stroke: "var(--accent-ink)", fill: "rgba(var(--accent-rgb), .16)" },
  jade: { stroke: "var(--jade)", fill: "rgba(var(--jade-rgb), .18)" },
  violet: { stroke: "var(--violet)", fill: "rgba(var(--violet-rgb), .16)" },
  amber: { stroke: "var(--amber)", fill: "rgba(var(--amber-rgb), .24)" },
  plum: { stroke: "var(--plum)", fill: "rgba(var(--plum-rgb), .10)" },
  danger: { stroke: "var(--danger)", fill: "rgba(var(--danger-rgb), .12)" },
};

export interface VouchPerson {
  id: string;
  name: string;
  pronoun: string;
  initials: string;
  tone: VouchTone;
  /** join month, 'YYYY-MM' */
  joined: string;
  standing: Standing;
  scene: SceneKey;
  role: string;
  /** reports on record */
  reports?: number;
  /** member hides their vouch graph */
  private?: boolean;
  /** an anonymous voucher whose identity is shielded */
  anon?: boolean;
}

export const PEOPLE: VouchPerson[] = [
  {
    id: "ines",
    name: "Inês Martins",
    pronoun: "she/her",
    initials: "IM",
    tone: "jade",
    joined: "2023-03",
    standing: "trusted",
    scene: "tf",
    role: "Founder, Maré Records",
  },
  {
    id: "sofia",
    name: "Sofia Almeida",
    pronoun: "she/they",
    initials: "SA",
    tone: "amber",
    joined: "2024-01",
    standing: "trusted",
    scene: "tf",
    role: "Nurse · mutual-aid lead",
  },
  {
    id: "devon",
    name: "Devon Okoro",
    pronoun: "they/them",
    initials: "DO",
    tone: "coral",
    joined: "2025-06",
    standing: "trusted",
    scene: "creatives",
    role: "Illustrator",
  },
  {
    id: "kai",
    name: "Kai Sousa",
    pronoun: "xe/xem",
    initials: "KS",
    tone: "plum",
    joined: "2025-11",
    standing: "trusted",
    scene: "nightlife",
    role: "DJ",
  },
  {
    id: "theo",
    name: "Théo Mendes",
    pronoun: "he/him",
    initials: "TM",
    tone: "violet",
    joined: "2024-09",
    standing: "warned",
    scene: "tf",
    role: "Community organiser",
    reports: 1,
  },
  {
    id: "mara",
    name: "Mara Khoury",
    pronoun: "she/her",
    initials: "MK",
    tone: "jade",
    joined: "2024-05",
    standing: "trusted",
    scene: "newly",
    role: "Newcomer buddy",
  },
  {
    id: "lurdes",
    name: "Lurdes Brito",
    pronoun: "she/her",
    initials: "LB",
    tone: "amber",
    joined: "2023-11",
    standing: "trusted",
    scene: "elders",
    role: "Elder · memory-keeper",
  },
  {
    id: "vera",
    name: "@studio.vera",
    pronoun: "she/her",
    initials: "SV",
    tone: "amber",
    joined: "2025-07",
    standing: "warned",
    scene: "tf",
    role: "Maker",
  },
  {
    id: "marco",
    name: "Marco Vieira",
    pronoun: "he/him",
    initials: "MV",
    tone: "coral",
    joined: "2026-05",
    standing: "new",
    scene: "tf",
    role: "Pending verification",
  },
  {
    id: "nadia",
    name: "Nadia Lopes",
    pronoun: "she/her",
    initials: "NL",
    tone: "violet",
    joined: "2026-01",
    standing: "new",
    scene: "creatives",
    role: "Pending verification",
  },
  {
    id: "rui",
    name: "Rui Antunes",
    pronoun: "he/they",
    initials: "RA",
    tone: "jade",
    joined: "2026-06",
    standing: "new",
    scene: "creatives",
    role: "Pending verification",
  },
  {
    id: "pcosta",
    name: "@p.costa",
    pronoun: "he/him",
    initials: "PC",
    tone: "coral",
    joined: "2025-08",
    standing: "warned",
    scene: "creatives",
    role: "Member",
    reports: 1,
  },
  {
    id: "priv",
    name: "A. (private)",
    pronoun: "they/them",
    initials: "·",
    tone: "plum",
    joined: "2024-02",
    standing: "trusted",
    scene: "tf",
    role: "Keeps their network private",
    private: true,
  },
  {
    id: "a1",
    name: "@new_4471",
    pronoun: "not shared",
    initials: "a1",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "New account · 0 outside trust",
  },
  {
    id: "a2",
    name: "@new_4472",
    pronoun: "not shared",
    initials: "a2",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "New account",
  },
  {
    id: "a3",
    name: "@new_4473",
    pronoun: "not shared",
    initials: "a3",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "New account",
  },
  {
    id: "a4",
    name: "@new_4474",
    pronoun: "not shared",
    initials: "a4",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "New account",
  },
  {
    id: "a5",
    name: "@new_4475",
    pronoun: "not shared",
    initials: "a5",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "New account",
  },
  {
    id: "lone",
    name: "@lone.star",
    pronoun: "they/them",
    initials: "LS",
    tone: "plum",
    joined: "2026-06",
    standing: "new",
    scene: "creatives",
    role: "Vouched only by new accounts",
  },
  {
    id: "anon",
    name: "Anonymous",
    pronoun: "shielded",
    initials: "?",
    tone: "plum",
    joined: "2025-01",
    standing: "trusted",
    scene: "tf",
    role: "Identity shielded",
    anon: true,
  },
];

export const personById: Record<string, VouchPerson> = Object.fromEntries(
  PEOPLE.map((p) => [p.id, p]),
);

export interface VouchEdge {
  id: string;
  /** `from` vouches for `to` */
  from: string;
  to: string;
  mutual?: boolean;
  withdrawn?: boolean;
  date: string;
  tag?: string;
  reason?: string;
}

const RAW_EDGES: Omit<VouchEdge, "id">[] = [
  {
    from: "sofia",
    to: "ines",
    mutual: true,
    date: "2023-04",
    tag: "co-founder",
    reason: "We built this together.",
  },
  {
    from: "devon",
    to: "ines",
    mutual: true,
    date: "2025-06",
    tag: "chosen family",
    reason: "My person. No question.",
  },
  {
    from: "kai",
    to: "ines",
    date: "2025-11",
    reason: "Met at a Maré gig — instant trust.",
  },
  {
    from: "theo",
    to: "ines",
    date: "2024-09",
    reason: "Organised three Prides with her.",
  },
  {
    from: "mara",
    to: "ines",
    mutual: true,
    date: "2024-06",
    tag: "mentor",
    reason: "She showed me the ropes when I arrived.",
  },
  {
    from: "lurdes",
    to: "ines",
    date: "2023-12",
    tag: "mentor",
    reason: "I have watched her hold this community with care.",
  },
  { from: "vera", to: "ines", date: "2025-08", reason: "Always shows up." },
  {
    from: "anon",
    to: "ines",
    date: "2025-01",
    reason: "Vouch kept anonymous at the voucher’s request.",
  },
  {
    from: "ines",
    to: "marco",
    date: "2026-05",
    reason: "Exactly who this network is for.",
  },
  {
    from: "sofia",
    to: "marco",
    date: "2026-05",
    reason: "Knew him for years before QueerPulse.",
  },
  {
    from: "ines",
    to: "nadia",
    date: "2026-01",
    reason: "Brilliant, kind, ready.",
  },
  {
    from: "kai",
    to: "nadia",
    date: "2026-01",
    reason: "Part of the after-hours crew.",
  },
  {
    from: "theo",
    to: "nadia",
    date: "2026-02",
    reason: "Vouching with confidence.",
  },
  {
    from: "devon",
    to: "rui",
    date: "2026-06",
    tag: "collaborator",
    reason: "We make work together.",
  },
  { from: "sofia", to: "devon", mutual: true, date: "2025-07" },
  { from: "kai", to: "devon", date: "2025-09" },
  { from: "lurdes", to: "sofia", date: "2024-02", tag: "mentor" },
  {
    from: "priv",
    to: "ines",
    date: "2024-03",
    reason: "Private member — details withheld by their choice.",
  },
  {
    from: "vera",
    to: "theo",
    withdrawn: true,
    date: "2025-09",
    reason: "Withdrawn after a falling-out.",
  },
  { from: "pcosta", to: "theo", date: "2025-10" },
  { from: "theo", to: "pcosta", mutual: true, date: "2025-10" },
  // suspected ring — a closed loop of new accounts
  { from: "a1", to: "a2", date: "2026-06" },
  { from: "a2", to: "a3", date: "2026-06" },
  { from: "a3", to: "a4", date: "2026-06" },
  { from: "a4", to: "a5", date: "2026-06" },
  { from: "a5", to: "a1", date: "2026-06" },
  { from: "a2", to: "a4", date: "2026-06" },
  { from: "a1", to: "a3", date: "2026-06" },
  // isolation: @lone.star vouched only by ring-adjacent new accounts
  { from: "a1", to: "lone", date: "2026-06" },
  { from: "a2", to: "lone", date: "2026-06" },
];

export const EDGES: VouchEdge[] = RAW_EDGES.map((e) => ({
  ...e,
  id: `${e.from}>${e.to}`,
}));

// ── Pure graph helpers ──────────────────────────────────────────────────────

export function neighbors(id: string, includeWithdrawn = false): string[] {
  const out: string[] = [];
  for (const e of EDGES) {
    if (e.withdrawn && !includeWithdrawn) continue;
    if (e.from === id) out.push(e.to);
    if (e.to === id) out.push(e.from);
  }
  return out.filter((v, i, a) => a.indexOf(v) === i);
}

export function edgeWeight(e: VouchEdge): number {
  const s = personById[e.from]?.standing;
  return s === "trusted" ? 1 : s === "warned" ? 0.6 : 0.4;
}

/** months-since-epoch number for an 'YYYY-MM' string */
export function ym(date: string): number {
  const [y, m] = date.split("-");
  return parseInt(y!, 10) * 12 + parseInt(m!, 10);
}

export const T_MIN = ym("2023-01");
export const T_MAX = ym("2026-07");

/** every inbound voucher is itself new or flagged → trust isolation */
export function isIsolated(id: string): boolean {
  const inbound = EDGES.filter((e) => e.to === id && !e.withdrawn);
  if (inbound.length === 0) return false;
  return inbound.every((e) => {
    const s = personById[e.from]?.standing;
    return s === "new" || s === "flagged";
  });
}

export function findEdge(a: string, b: string): VouchEdge | undefined {
  return EDGES.find(
    (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
  );
}

/** BFS shortest trust path between two members (inclusive of withdrawn edges) */
export function shortestPath(a: string, b: string): string[] | null {
  const queue: string[][] = [[a]];
  const seen = new Set<string>([a]);
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1]!;
    if (last === b) return path;
    for (const nb of neighbors(last, true)) {
      if (!seen.has(nb)) {
        seen.add(nb);
        queue.push(path.concat([nb]));
      }
    }
  }
  return null;
}

/** 'YYYY-MM' → the first of that month as a real `Date`, for `fmt.date()`. */
export function monthDate(date: string): Date {
  const [y, m] = date.split("-");
  return new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, 1);
}

export function monthStr(value: number): string {
  const y = Math.floor((value - 1) / 12);
  const m = ((value - 1) % 12) + 1;
  return `${y}-${m < 10 ? "0" : ""}${m}`;
}

/** months-since-epoch number → a real `Date`, for `fmt.date()`. */
export function monthDateFromValue(value: number): Date {
  return monthDate(monthStr(value));
}

/** node radius: focus is largest, ring accounts smallest */
export function nodeRadius(id: string, focusId: string): number {
  if (id === focusId) return 30;
  return personById[id]!.scene === "ring" ? 15 : 20;
}

/** portrait for a network member by initials, or undefined (→ initials fallback).
 *  Still used by `adminMembers.data.ts`'s demo `MEMBERS.vouchedBy` fixtures so
 *  the row vouch-strip keeps real portraits in demo mode. */
export function portraitByInitials(initials: string): string | undefined {
  const match = PEOPLE.find(
    (p) => p.initials.toLowerCase() === initials.toLowerCase(),
  );
  return match ? portrait(match.name) : undefined;
}

// ── Demo TrustGraphData adapter ─────────────────────────────────────────────
// Adapts this file's fixtures (PEOPLE/EDGES/SCENES/SCENE_ANCHOR/personById)
// into the shape `createTrustGraph` expects, so demo mode can share the same
// graph model as live mode. `Scene` is aliased to `TrustScene` — this file
// already declares its own (unrelated) local `Scene` interface above.

import {
  createTrustGraph,
  ymValue,
  type Scene as TrustScene,
  type TrustGraphData,
  type VouchEdge as ModelEdge,
  type VouchPerson as ModelPerson,
} from "./trustGraph/trustGraphModel";

const DEMO_SCENES: TrustScene[] = Object.entries(SCENES).map(([key, scene]) => ({
  id: key,
  label: scene.label ?? key,
  color: scene.color,
}));

const DEMO_PEOPLE: ModelPerson[] = PEOPLE.map((person) => ({
  id: person.id,
  name: person.name,
  pronoun: person.pronoun,
  initials: person.initials,
  tone: person.tone === "danger" ? "coral" : (person.tone as ModelPerson["tone"]),
  joined: person.joined,
  standing: person.standing,
  sceneId: person.scene,
  role: person.role,
  reports: person.reports,
  private: person.private,
  verified: person.standing === "trusted",
  avatarUrl: portrait(person.name) ?? null,
}));

const DEMO_EDGES: ModelEdge[] = EDGES.map((edge) => ({
  id: edge.id,
  from: edge.from,
  to: edge.to,
  mutual: edge.mutual,
  withdrawn: edge.withdrawn,
  date: edge.date,
  relationship: edge.tag ?? null,
  reason: edge.reason ?? null,
  anonymous: personById[edge.from]?.anon ?? false,
}));

const DEMO_SCENE_ANCHOR: Record<string, { x: number; y: number }> =
  Object.fromEntries(
    Object.entries(SCENE_ANCHOR).map(([key, anchor]) => [key, anchor]),
  );

export const DEMO_TRUST_GRAPH_DATA: TrustGraphData = {
  people: DEMO_PEOPLE,
  peopleById: Object.fromEntries(DEMO_PEOPLE.map((p) => [p.id, p])),
  edges: DEMO_EDGES,
  scenes: DEMO_SCENES,
  sceneAnchor: DEMO_SCENE_ANCHOR,
  tMin: Math.min(...DEMO_EDGES.map((e) => ymValue(e.date))),
  tMax: Math.max(...DEMO_EDGES.map((e) => ymValue(e.date))),
  truncated: false,
};

export const DEMO_TRUST_GRAPH = createTrustGraph(DEMO_TRUST_GRAPH_DATA);
