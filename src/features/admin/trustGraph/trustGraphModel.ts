import type { AvatarTone } from "../ui";

export type Standing = "trusted" | "warned" | "new" | "flagged";
export type AccountKind = "founder" | "staff" | "system" | "member";
export type WeakVoucherReason = "new" | "flagged" | "ring";

/** A member named by the backend. `id` is the profile slug, the graph's
 *  node key. */
export interface MemberRef {
  id: string;
  name: string;
}

export interface WeakVoucher extends MemberRef {
  reason: WeakVoucherReason;
}

export interface JoinPath {
  kind: "founder" | "invite" | "application" | "unknown";
  /** Inviter (invite) or reviewer (application). */
  byId: string | null;
  byName: string | null;
  /** ISO. */
  at: string | null;
}

export interface TrackRecord {
  vouchesGiven: number;
  laterFlaggedCount: number;
}

export interface ToneInk {
  stroke: string;
  fill: string;
}

/** Per-tone SVG fill/stroke, token-backed (no hex). Mirrors the old TONE map
 *  but keyed by AvatarTone so it covers every real member tone (including
 *  "anon", used for identity-shielded vouchers; see VouchGraphPreview's
 *  AVATAR_TONE_INK, which this mirrors). */
export const TONE: Record<AvatarTone, ToneInk> = {
  coral: { stroke: "var(--accent-text)", fill: "rgba(var(--accent-rgb), .16)" },
  jade: { stroke: "var(--jade-ink)", fill: "rgba(var(--jade-rgb), .18)" },
  violet: { stroke: "var(--violet)", fill: "rgba(var(--violet-rgb), .16)" },
  amber: { stroke: "var(--amber-ink)", fill: "rgba(var(--amber-rgb), .24)" },
  plum: { stroke: "var(--text-strong)", fill: "rgba(var(--plum-rgb), .10)" },
  anon: { stroke: "var(--ink-40)", fill: "rgba(var(--plum-rgb), .08)" },
};

export interface VouchPerson {
  id: string;
  /** The member's real account id, distinct from `id` (the profile slug
   *  used as this graph's node key). Needed for an account-level admin
   *  action against this node (e.g. verify). */
  userId: string;
  name: string;
  pronoun: string;
  initials: string;
  tone: AvatarTone;
  joined: string; // 'YYYY-MM'
  standing: Standing;
  /** ADM-23: real cycle detection: true when this person is part of a
   *  closed self-vouching loop among new/unverified accounts. A
   *  graph-structure signal distinct from `standing`, which keeps its own
   *  meaning (suspended/frozen/high-report-count). Optional so demo fixtures
   *  that predate this field still type-check as `false`/absent. */
  inRing?: boolean;
  sceneId: string | null;
  role: string | null;
  reports?: number;
  private?: boolean;
  verified?: boolean;
  avatarUrl?: string | null;
  /** Full ISO. `joined` stays 'YYYY-MM'. */
  joinedAt: string;
  accountKind: AccountKind;
  ringId: string | null;
  /** Backend-sourced; empty when the member is not trust-isolated. */
  isolatedBy: WeakVoucher[];
  joinPath: JoinPath;
  trackRecord: TrackRecord;
  /** Platform-wide counts across every member. */
  activeInboundCount: number;
  activeOutboundCount: number;
  /** Every top-level community, primary first. */
  sceneIds: string[];
}

export interface VouchEdge {
  id: string;
  from: string;
  to: string;
  mutual?: boolean;
  withdrawn?: boolean;
  date: string; // 'YYYY-MM'
  relationship?: string | null;
  reason?: string | null;
  anonymous?: boolean;
  /** 'invite' = the voucher brought this member onto the platform. */
  kind?: "invite" | "vouch";
}

export interface Scene {
  id: string;
  label: string;
  color: string;
}

export interface TrustGraphData {
  people: VouchPerson[];
  peopleById: Record<string, VouchPerson>;
  edges: VouchEdge[];
  scenes: Scene[];
  sceneAnchor: Record<string, { x: number; y: number }>;
  tMin: number;
  tMax: number;
  truncated: boolean;
  rings: TrustRing[];
  cases: TrustCase[];
  /** Platform-wide total. */
  openCaseCount: number;
  /** ISO. */
  platformStartedAt: string;
  newAccountWindowDays: number;
}

export interface TrustRing {
  id: string;
  /** The full ring, members outside the view included. */
  memberIds: string[];
  memberCount: number;
  firstJoinedAt: string;
  lastJoinedAt: string;
  /** Outside members vouching for 2+ ring members. */
  sharedVouchers: MemberRef[];
}

export type TrustCaseKind = "ring" | "isolated" | "flagged";

export interface TrustCase {
  id: string;
  kind: TrustCaseKind;
  /** Who the graph focuses on when the case is clicked. */
  subjectId: string;
  subjectName: string;
  ringId: string | null;
  memberCount: number;
  weakVoucherCount: number;
  openReportCount: number;
  windowHours: number | null;
  score: number;
}

export interface TrustGraph extends TrustGraphData {
  neighbors(id: string, includeWithdrawn?: boolean): string[];
  edgeWeight(edge: VouchEdge): number;
  isIsolated(id: string): boolean;
  findEdge(firstId: string, secondId: string): VouchEdge | undefined;
  shortestPath(fromId: string, toId: string): string[] | null;
  nodeRadius(id: string, focusId: string): number;
  /** Every edge touching `id`, withdrawn included, from the adjacency map.
   *  The array is the graph's own adjacency list: do not mutate it. */
  incidentEdges(id: string): VouchEdge[];
  /** Active rows pointing at `id`, by direction only. For mutual-aware,
   *  one-per-member counts use `inboundTrustLinks` in trustPath.ts. */
  activeInboundEdges(id: string): VouchEdge[];
  /** Active rows leaving `id`, by direction only. For mutual-aware,
   *  one-per-member counts use `outboundTrustLinks` in trustPath.ts. */
  activeOutboundEdges(id: string): VouchEdge[];
  ringById(id: string): TrustRing | undefined;
}

/** Backend enum codes for `VouchEdge.relationship` in LIVE mode. Any other
 *  value (e.g. demo free-text tags like "co-founder", "mentor") passes
 *  through unchanged; see relationshipLabel(). */
const RELATIONSHIP_CODES = new Set([
  "collaborated",
  "friends",
  "group",
  "met_through",
  "neighbours",
]);

/** Humanizes an edge's `relationship`: known LIVE enum codes resolve to an
 *  i18n label; anything else (demo free-text tags, or already-localized
 *  strings) passes through verbatim. Returns null for empty input so
 *  callers can keep their existing `relationship &&` guards. */
export function relationshipLabel(
  t: (key: string) => string,
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (RELATIONSHIP_CODES.has(value)) {
    return t(`admin:vouchGraph.relationship.${value}`);
  }
  return value;
}

/** months-since-epoch for 'YYYY-MM'. */
export function ymValue(month: string): number {
  const [year, mon] = month.split("-");
  return parseInt(year!, 10) * 12 + parseInt(mon!, 10);
}

export function monthStr(value: number): string {
  const year = Math.floor((value - 1) / 12);
  const mon = ((value - 1) % 12) + 1;
  return `${year}-${mon < 10 ? "0" : ""}${mon}`;
}

export function monthDate(month: string): Date {
  const [year, mon] = month.split("-");
  return new Date(parseInt(year!, 10), parseInt(mon!, 10) - 1, 1);
}

export function monthDateFromValue(value: number): Date {
  return monthDate(monthStr(value));
}

/** Order-independent key for the pair map, so `findEdge` answers in O(1)
 *  whichever direction the edge points. */
function pairKey(firstId: string, secondId: string): string {
  return firstId < secondId
    ? `${firstId}\u0000${secondId}`
    : `${secondId}\u0000${firstId}`;
}

function appendIncidentEdge(
  edgesByNodeId: Map<string, VouchEdge[]>,
  nodeId: string,
  edge: VouchEdge,
): void {
  const incident = edgesByNodeId.get(nodeId);
  if (incident) incident.push(edge);
  else edgesByNodeId.set(nodeId, [edge]);
}

export function createTrustGraph(data: TrustGraphData): TrustGraph {
  const { edges, peopleById } = data;

  // Built once per graph: every per-node method below reads these maps, so a
  // lookup costs the node's degree and skips a scan of every edge.
  const edgesByNodeId = new Map<string, VouchEdge[]>();
  const edgeByPair = new Map<string, VouchEdge>();
  for (const edge of edges) {
    appendIncidentEdge(edgesByNodeId, edge.from, edge);
    if (edge.to !== edge.from) appendIncidentEdge(edgesByNodeId, edge.to, edge);
    const key = pairKey(edge.from, edge.to);
    // First edge in array order wins, matching the old `edges.find`.
    if (!edgeByPair.has(key)) edgeByPair.set(key, edge);
  }
  const ringsById = new Map<string, TrustRing>(
    data.rings.map((ring) => [ring.id, ring]),
  );

  function incidentEdges(id: string): VouchEdge[] {
    return edgesByNodeId.get(id) ?? [];
  }

  function activeInboundEdges(id: string): VouchEdge[] {
    return incidentEdges(id).filter(
      (edge) => edge.to === id && !edge.withdrawn,
    );
  }

  function activeOutboundEdges(id: string): VouchEdge[] {
    return incidentEdges(id).filter(
      (edge) => edge.from === id && !edge.withdrawn,
    );
  }

  function neighbors(id: string, includeWithdrawn = false): string[] {
    const neighborIds = new Set<string>();
    for (const edge of incidentEdges(id)) {
      if (edge.withdrawn && !includeWithdrawn) continue;
      if (edge.from === id) neighborIds.add(edge.to);
      if (edge.to === id) neighborIds.add(edge.from);
    }
    return [...neighborIds];
  }

  function edgeWeight(edge: VouchEdge): number {
    const standing = peopleById[edge.from]?.standing;
    return standing === "trusted" ? 1 : standing === "warned" ? 0.6 : 0.4;
  }

  /** Backend-sourced: true when every active voucher of the member is weak
   *  (new, flagged or in a ring), as listed in `isolatedBy`. */
  function isIsolated(id: string): boolean {
    return (peopleById[id]?.isolatedBy.length ?? 0) > 0;
  }

  function findEdge(firstId: string, secondId: string): VouchEdge | undefined {
    return edgeByPair.get(pairKey(firstId, secondId));
  }

  function ringById(id: string): TrustRing | undefined {
    return ringsById.get(id);
  }

  function shortestPath(fromId: string, toId: string): string[] | null {
    const queue: string[][] = [[fromId]];
    const seen = new Set<string>([fromId]);
    while (queue.length) {
      const path = queue.shift() as string[];
      const last = path[path.length - 1]!;
      if (last === toId) return path;
      for (const next of neighbors(last, true)) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(path.concat([next]));
        }
      }
    }
    return null;
  }

  function nodeRadius(id: string, focusId: string): number {
    if (id === focusId) return 30;
    return peopleById[id]?.standing === "flagged" ? 15 : 20;
  }

  return {
    ...data,
    neighbors,
    edgeWeight,
    isIsolated,
    findEdge,
    shortestPath,
    nodeRadius,
    incidentEdges,
    activeInboundEdges,
    activeOutboundEdges,
    ringById,
  };
}
