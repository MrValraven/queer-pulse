/* ============================================================
   Admin: vouch graph (the full trust-network experience).
   Static trust network + pure graph helpers. No React here.
   ============================================================ */

import { portrait } from "./adminPeople.data";
import { DENSE_EDGES, DENSE_PEOPLE } from "./adminVouchGraphDense.data";
import {
  DEMO_CASES,
  DEMO_NEW_ACCOUNT_WINDOW_DAYS,
  DEMO_OPEN_CASE_COUNT,
  DEMO_PLATFORM_STARTED_AT,
  DEMO_RINGS,
  RING_MEMBER_JOINED_AT,
} from "./adminVouchGraphCases.data";

export type VouchTone =
  "coral" | "jade" | "violet" | "amber" | "plum" | "danger";
export type SceneKey =
  "tf" | "creatives" | "nightlife" | "newly" | "elders" | "ring";
export type Standing = "trusted" | "warned" | "new" | "flagged";

export interface Scene {
  /** Real community/scene name (content), undefined for the one chrome
   *  exception ("ring"), which sets `labelKey` instead. */
  label?: string;
  /** Set only for the "ring" entry: a system-generated category label, so it
   *  resolves through the catalog like the same label in the "Safety" legend
   *  (`vouchGraph.legend.safety.ring`). */
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
 * into readable clusters. Evenly spread around the focus.
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

const BASE_PEOPLE: VouchPerson[] = [
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
    role: "Nurse",
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
    role: "Elder",
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
    role: "",
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
    role: "",
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
    role: "",
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
    role: "",
    private: true,
  },
  {
    id: "a1",
    name: "@new_4471",
    pronoun: "",
    initials: "a1",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "",
  },
  {
    id: "a2",
    name: "@new_4472",
    pronoun: "",
    initials: "a2",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "",
  },
  {
    id: "a3",
    name: "@new_4473",
    pronoun: "",
    initials: "a3",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "",
  },
  {
    id: "a4",
    name: "@new_4474",
    pronoun: "",
    initials: "a4",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "",
  },
  {
    id: "a5",
    name: "@new_4475",
    pronoun: "",
    initials: "a5",
    tone: "danger",
    joined: "2026-06",
    standing: "flagged",
    scene: "ring",
    role: "",
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
    role: "",
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
    role: "",
    anon: true,
  },
  // Members the admin members list also shows, so their drawers open a graph.
  {
    id: "nightowl",
    name: "@nightowl",
    pronoun: "they/them",
    initials: "N",
    tone: "plum",
    joined: "2024-09",
    standing: "flagged",
    scene: "nightlife",
    role: "Member",
    reports: 4,
  },
  {
    id: "anon_4471",
    name: "@anon_4471",
    pronoun: "",
    initials: "A",
    tone: "plum",
    joined: "2026-10",
    standing: "flagged",
    scene: "newly",
    role: "",
  },
  {
    id: "coin_daily",
    name: "@coin_daily",
    pronoun: "",
    initials: "CD",
    tone: "amber",
    joined: "2026-10",
    standing: "new",
    scene: "newly",
    role: "",
  },
];

export const PEOPLE: VouchPerson[] = [...BASE_PEOPLE, ...DENSE_PEOPLE];

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
  kind?: "invite" | "vouch";
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
    reason: "Met at a Maré gig, instant trust.",
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
    kind: "invite",
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
    kind: "invite",
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
    kind: "invite",
  },
  { from: "sofia", to: "devon", mutual: true, date: "2025-07" },
  { from: "kai", to: "devon", date: "2025-09" },
  { from: "lurdes", to: "sofia", date: "2024-02", tag: "mentor" },
  {
    from: "priv",
    to: "ines",
    date: "2024-03",
    reason: "Private member: details withheld by their choice.",
  },
  {
    from: "vera",
    to: "theo",
    withdrawn: true,
    date: "2025-09",
    reason: "Withdrawn after a falling-out.",
  },
  { from: "pcosta", to: "theo", mutual: true, date: "2025-10" },
  { from: "theo", to: "pcosta", mutual: true, date: "2025-10" },
  // suspected ring: a closed loop of new accounts
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
  // flagged and new members reachable from the members list
  { from: "theo", to: "nightowl", date: "2024-10" },
  { from: "mara", to: "nightowl", date: "2024-11" },
  { from: "kai", to: "coin_daily", date: "2026-10" },
];

export const EDGES: VouchEdge[] = [
  ...RAW_EDGES.map((rawEdge) => ({
    ...rawEdge,
    id: `${rawEdge.from}>${rawEdge.to}`,
  })),
  ...DENSE_EDGES,
];

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

/** months-since-epoch number for an 'YYYY-MM' string */
export function ym(date: string): number {
  const [y, m] = date.split("-");
  return parseInt(y!, 10) * 12 + parseInt(m!, 10);
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
// graph model as live mode. `Scene` is aliased to `TrustScene`; this file
// already declares its own (unrelated) local `Scene` interface above.

import {
  ymValue,
  type JoinPath,
  type Scene as TrustScene,
  type TrackRecord,
  type TrustGraphData,
  type VouchEdge as ModelEdge,
  type VouchPerson as ModelPerson,
  type WeakVoucher,
} from "./trustGraph/trustGraphModel";
import type { TrustNetworkMemberSearchResultDTO } from "./api/adminTrustNetwork.api";

const DEMO_SCENES: TrustScene[] = Object.entries(SCENES).map(
  ([key, scene]) => ({
    id: key,
    label: scene.label ?? key,
    color: scene.color,
  }),
);

const FOUNDER_IDS = ["ines", "sofia", "lurdes"];
const SECOND_SCENE_IDS: Record<string, string> = {
  ines: "creatives",
  devon: "tf",
  mara: "tf",
};
const REVIEWER_ID = "ines";
const JOIN_DAY_STEP = 7;
const JOIN_DAY_SPAN = 27;
const JOIN_TIME_SUFFIX = "T10:00:00.000Z";
const ANON_JOINED_AT = "2026-10-19T08:00:00.000Z";

function padDay(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** Full ISO join time: a deterministic day inside the member's join month. */
function joinedAtFor(person: VouchPerson, personIndex: number): string {
  const ringJoinedAt = RING_MEMBER_JOINED_AT[person.id];
  if (ringJoinedAt) return ringJoinedAt;
  if (person.id === "anon_4471") return ANON_JOINED_AT;
  const day = ((personIndex * JOIN_DAY_STEP) % JOIN_DAY_SPAN) + 1;
  return `${person.joined}-${padDay(day)}${JOIN_TIME_SUFFIX}`;
}

function accountKindFor(personId: string): ModelPerson["accountKind"] {
  return FOUNDER_IDS.includes(personId) ? "founder" : "member";
}

/** The edge that brought a member onto the platform, when there is one. */
const INVITE_EDGE_BY_MEMBER_ID: Record<string, VouchEdge> = Object.fromEntries(
  EDGES.filter((edge) => edge.kind === "invite").map((edge) => [edge.to, edge]),
);

function joinPathFor(person: VouchPerson, joinedAt: string): JoinPath {
  if (FOUNDER_IDS.includes(person.id)) {
    return { kind: "founder", byId: null, byName: null, at: joinedAt };
  }
  if (person.anon) {
    return { kind: "unknown", byId: null, byName: null, at: null };
  }
  const inviteEdge = INVITE_EDGE_BY_MEMBER_ID[person.id];
  const inviter = inviteEdge ? personById[inviteEdge.from] : undefined;
  if (inviter) {
    return {
      kind: "invite",
      byId: inviter.id,
      byName: inviter.name,
      at: joinedAt,
    };
  }
  return {
    kind: "application",
    byId: REVIEWER_ID,
    byName: personById[REVIEWER_ID]!.name,
    at: joinedAt,
  };
}

/** Distinct members linked to `personId` in one direction. A mutual edge
 *  carries trust both ways, so it counts for both sides, the same as live's
 *  pair of rows; each other member counts once. */
function trustPartnerIds(
  personId: string,
  direction: "inbound" | "outbound",
  shouldIncludeWithdrawn: boolean,
): Set<string> {
  const partnerIds = new Set<string>();
  for (const edge of EDGES) {
    if (edge.from === edge.to) continue;
    if (edge.withdrawn && !shouldIncludeWithdrawn) continue;
    const isMutual = edge.mutual === true;
    const isOnSide =
      direction === "inbound"
        ? edge.to === personId || (isMutual && edge.from === personId)
        : edge.from === personId || (isMutual && edge.to === personId);
    if (!isOnSide) continue;
    partnerIds.add(edge.from === personId ? edge.to : edge.from);
  }
  return partnerIds;
}

/** Live counts every vouch ever given, withdrawn ones included. */
function trackRecordFor(personId: string): TrackRecord {
  const voucheeIds = trustPartnerIds(personId, "outbound", true);
  let laterFlaggedCount = 0;
  voucheeIds.forEach((voucheeId) => {
    if (personById[voucheeId]?.standing === "flagged") laterFlaggedCount += 1;
  });
  return { vouchesGiven: voucheeIds.size, laterFlaggedCount };
}

function countActiveEdges(
  personId: string,
  direction: "inbound" | "outbound",
): number {
  return trustPartnerIds(personId, direction, false).size;
}

function weakRingVoucher(personId: string): WeakVoucher {
  return { id: personId, name: personById[personId]!.name, reason: "ring" };
}

const ISOLATED_BY: Record<string, WeakVoucher[]> = {
  lone: [weakRingVoucher("a1"), weakRingVoucher("a2")],
};

const DEMO_PEOPLE: ModelPerson[] = PEOPLE.map((person, personIndex) => {
  const joinedAt = joinedAtFor(person, personIndex);
  const secondSceneId = SECOND_SCENE_IDS[person.id];
  return {
    id: person.id,
    // Demo has no separate account id; the fixture's slug-shaped `id` stands
    // in for it. `useVerifyMember`'s demo path never validates the shape.
    userId: person.id,
    name: person.name,
    pronoun: person.pronoun,
    initials: person.initials,
    tone: person.tone === "danger" ? "coral" : person.tone,
    joined: person.joined,
    joinedAt,
    standing: person.standing,
    // ADM-23: the fixture's "ring" scene IS the seed's 5-account self-vouching
    // loop (a1…a5, below). Real cycle detection would find exactly this shape
    // server-side, so demo mode reuses the same fixture flag.
    inRing: person.scene === "ring",
    ringId: person.scene === "ring" ? "ring:a1" : null,
    sceneId: person.scene,
    sceneIds: secondSceneId ? [person.scene, secondSceneId] : [person.scene],
    role: person.role,
    reports: person.reports,
    private: person.private,
    verified: person.standing === "trusted",
    avatarUrl: portrait(person.name) ?? null,
    accountKind: accountKindFor(person.id),
    isolatedBy: ISOLATED_BY[person.id] ?? [],
    joinPath: joinPathFor(person, joinedAt),
    trackRecord: trackRecordFor(person.id),
    activeInboundCount: countActiveEdges(person.id, "inbound"),
    activeOutboundCount: countActiveEdges(person.id, "outbound"),
  };
});

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
  kind: edge.kind ?? "vouch",
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
  rings: DEMO_RINGS,
  cases: DEMO_CASES,
  openCaseCount: DEMO_OPEN_CASE_COUNT,
  platformStartedAt: DEMO_PLATFORM_STARTED_AT,
  newAccountWindowDays: DEMO_NEW_ACCOUNT_WINDOW_DAYS,
};

/**
 * Demo fallback for the "find a member" search box (ADM-10): the live
 * endpoint queries every member so an admin can reach someone outside the
 * graph's node cap, but the demo graph is small and already loads everyone,
 * so a local filter over `DEMO_PEOPLE` gives the same picker experience
 * offline.
 */
export function searchDemoTrustNetworkMembers(
  term: string,
): TrustNetworkMemberSearchResultDTO[] {
  const q = term.trim().toLowerCase();
  if (q.length < 2) return [];
  return DEMO_PEOPLE.filter(
    (person) =>
      person.name.toLowerCase().includes(q) ||
      person.id.toLowerCase().includes(q),
  )
    .slice(0, 20)
    .map((person) => ({
      slug: person.id,
      name: person.name,
      initials: person.initials,
      avatarUrl: person.avatarUrl ?? null,
    }));
}
