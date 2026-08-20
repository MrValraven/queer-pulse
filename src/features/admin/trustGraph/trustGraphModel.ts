import type { AvatarTone } from "../ui";

export type Standing = "trusted" | "warned" | "new" | "flagged";

export interface ToneInk {
  stroke: string;
  fill: string;
}

/** Per-tone SVG fill/stroke, token-backed (no hex). Mirrors the old TONE map
 *  but keyed by AvatarTone so it covers every real member tone (including
 *  "anon", used for identity-shielded vouchers — see VouchGraphPreview's
 *  AVATAR_TONE_INK, which this mirrors). */
export const TONE: Record<AvatarTone, ToneInk> = {
  coral: { stroke: "var(--accent-ink)", fill: "rgba(var(--accent-rgb), .16)" },
  jade: { stroke: "var(--jade)", fill: "rgba(var(--jade-rgb), .18)" },
  violet: { stroke: "var(--violet)", fill: "rgba(var(--violet-rgb), .16)" },
  amber: { stroke: "var(--amber)", fill: "rgba(var(--amber-rgb), .24)" },
  plum: { stroke: "var(--plum)", fill: "rgba(var(--plum-rgb), .10)" },
  anon: { stroke: "var(--ink-40)", fill: "rgba(var(--plum-rgb), .08)" },
};

export interface VouchPerson {
  id: string;
  /** The member's real account id — distinct from `id` (the profile slug
   *  used as this graph's node key). Needed for an account-level admin
   *  action against this node (e.g. verify). */
  userId: string;
  name: string;
  pronoun: string;
  initials: string;
  tone: AvatarTone;
  joined: string; // 'YYYY-MM'
  standing: Standing;
  sceneId: string | null;
  role: string | null;
  reports?: number;
  private?: boolean;
  verified?: boolean;
  avatarUrl?: string | null;
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
}

export interface TrustGraph extends TrustGraphData {
  neighbors(id: string, includeWithdrawn?: boolean): string[];
  edgeWeight(edge: VouchEdge): number;
  isIsolated(id: string): boolean;
  findEdge(a: string, b: string): VouchEdge | undefined;
  shortestPath(a: string, b: string): string[] | null;
  nodeRadius(id: string, focusId: string): number;
}

/** Backend enum codes for `VouchEdge.relationship` in LIVE mode. Any other
 *  value (e.g. demo free-text tags like "co-founder", "mentor") passes
 *  through unchanged — see relationshipLabel(). */
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

export function createTrustGraph(data: TrustGraphData): TrustGraph {
  const { edges, peopleById } = data;

  function neighbors(id: string, includeWithdrawn = false): string[] {
    const out: string[] = [];
    for (const edge of edges) {
      if (edge.withdrawn && !includeWithdrawn) continue;
      if (edge.from === id) out.push(edge.to);
      if (edge.to === id) out.push(edge.from);
    }
    return out.filter((value, index, array) => array.indexOf(value) === index);
  }

  function edgeWeight(edge: VouchEdge): number {
    const standing = peopleById[edge.from]?.standing;
    return standing === "trusted" ? 1 : standing === "warned" ? 0.6 : 0.4;
  }

  function isIsolated(id: string): boolean {
    const inbound = edges.filter((edge) => edge.to === id && !edge.withdrawn);
    if (inbound.length === 0) return false;
    return inbound.every((edge) => {
      const standing = peopleById[edge.from]?.standing;
      return standing === "new" || standing === "flagged";
    });
  }

  function findEdge(a: string, b: string): VouchEdge | undefined {
    return edges.find(
      (edge) =>
        (edge.from === a && edge.to === b) ||
        (edge.from === b && edge.to === a),
    );
  }

  function shortestPath(a: string, b: string): string[] | null {
    const queue: string[][] = [[a]];
    const seen = new Set<string>([a]);
    while (queue.length) {
      const path = queue.shift() as string[];
      const last = path[path.length - 1]!;
      if (last === b) return path;
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
  };
}
