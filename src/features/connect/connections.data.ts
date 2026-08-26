import { MEMBERS } from "../members/data/members";
import type { AvatarTint } from "../../shared/components/ui";

export type TabId = "all" | "incoming" | "sent" | "blocked" | "vouched";

/** Path to a member's public profile. */
export function profilePath(slug: string): string {
  return `/members/${slug}`;
}

/**
 * Relationship metadata that is NOT derivable from the member registry — keyed by
 * member slug. The registry owns name, role, tags and avatar; this owns the
 * connection-specific bits (pronouns, mutuals, when you connected, the vouch
 * relationship, a request's message). "You vouched" is read live from
 * VouchProvider; the seed flag below covers "vouched for you" / "mutual", which
 * the registry can't express for the current user.
 */
export interface ConnectionMeta {
  /** Backend connection id, present only on live-mode cards; drives PATCH/DELETE
   *  /connections/:id. Absent for mock cards, which act by slug through the
   *  local providers. */
  id?: string;
  pron?: string;
  mutuals?: number;
  since?: string;
  /** Raw ISO timestamp the connection was accepted (or, while pending, when the
   *  request was created). `since` is the human-readable display string; this is
   *  the machine value the profile "Your network" section sorts by. */
  connectedAtIso?: string;
  vouchBadge?: "vouched-for-you" | "you-vouched" | "mutual";
  requestMessage?: string;
  /** Why they reached out: `open:<id>` | `custom:<label>` | a REASONS id. */
  requestReason?: string;
  /** Whether the viewer is the one who sent the request. Once a connection is
   *  accepted both sides read as "connected", so this is what lets a card say
   *  "you reached out about…" rather than "they did". */
  isRequestedByYou?: boolean;
  /** The viewer's OWN private note about this connection. Never the other
   *  party's: the server only ever reads notes authored by the viewer. */
  note?: string;
  sentAgo?: string;
  /** The mutual who introduced this requester (live-mode network intros only). */
  introducedBy?: { slug: string; name: string };
}

export const CONNECTION_META: Record<string, ConnectionMeta> = {
  // — connected —
  "catarina-vaz": {
    pron: "she/her",
    mutuals: 11,
    since: "Mar 2025",
    connectedAtIso: "2025-03-14T10:15:00.000Z",
    vouchBadge: "vouched-for-you",
  },
  jonas: {
    pron: "he/him",
    mutuals: 8,
    since: "Dec 2024",
    connectedAtIso: "2024-12-05T18:40:00.000Z",
  },
  luisa: {
    pron: "she/her",
    mutuals: 14,
    since: "Jun 2025",
    connectedAtIso: "2025-06-20T09:05:00.000Z",
    vouchBadge: "you-vouched",
  },
  anika: {
    pron: "she/her",
    mutuals: 6,
    since: "Jan 2026",
    connectedAtIso: "2026-01-12T14:20:00.000Z",
  },
  rita: {
    pron: "they/them",
    mutuals: 9,
    since: "Nov 2024",
    connectedAtIso: "2024-11-03T11:30:00.000Z",
    vouchBadge: "mutual",
  },
  nuno: {
    pron: "he/him",
    mutuals: 11,
    since: "Feb 2025",
    connectedAtIso: "2025-02-18T16:50:00.000Z",
  },
  "sofia-castano": {
    pron: "she/her",
    mutuals: 4,
    since: "Apr 2026",
    connectedAtIso: "2026-04-09T08:25:00.000Z",
  },
  "sara-pinheiro": {
    pron: "she/her",
    mutuals: 13,
    since: "Sep 2025",
    connectedAtIso: "2025-09-22T13:10:00.000Z",
  },
  // — incoming requests —
  "daniel-oliveira": {
    pron: "he/him",
    mutuals: 1,
    sentAgo: "2h ago",
    requestMessage:
      '"Hi Tiago, we met briefly at the harm-reduction workshop. I\'d love to stay in touch and compare notes sometime."',
  },
  "mariana-costa": { pron: "she/her", mutuals: 2, sentAgo: "yesterday" },
  "bilal-kaya": { pron: "he/him", mutuals: 3, sentAgo: "3 days ago" },
  "ines-fonseca": { pron: "she/her", mutuals: 0, sentAgo: "5 days ago" },
  // — sent —
  "raquel-baptista": { pron: "she/her", sentAgo: "2 days ago" },
  "catarina-melo": { pron: "she/her", sentAgo: "5 days ago" },
  // — "Load more" pool —
  beatriz: {
    pron: "she/her",
    mutuals: 3,
    since: "2025",
    connectedAtIso: "2025-01-24T10:00:00.000Z",
  },
  kai: {
    pron: "they/them",
    mutuals: 5,
    since: "2025",
    connectedAtIso: "2025-02-11T10:00:00.000Z",
  },
  monica: {
    pron: "she/her",
    mutuals: 4,
    since: "2025",
    connectedAtIso: "2025-03-30T10:00:00.000Z",
  },
  andre: {
    pron: "he/him",
    mutuals: 6,
    since: "2025",
    connectedAtIso: "2025-05-08T10:00:00.000Z",
  },
  carla: {
    pron: "she/her",
    mutuals: 7,
    since: "2025",
    connectedAtIso: "2025-06-17T10:00:00.000Z",
  },
  diogo: {
    pron: "he/him",
    mutuals: 2,
    since: "2025",
    connectedAtIso: "2025-07-26T10:00:00.000Z",
  },
  jordan: {
    pron: "they/them",
    mutuals: 8,
    since: "2025",
    connectedAtIso: "2025-09-04T10:00:00.000Z",
  },
  fatima: {
    pron: "she/her",
    mutuals: 5,
    since: "2025",
    connectedAtIso: "2025-10-13T10:00:00.000Z",
  },
  "rui-fernandes": {
    pron: "he/him",
    mutuals: 4,
    since: "2025",
    connectedAtIso: "2025-11-21T10:00:00.000Z",
  },
};

/** Initial buckets (real member slugs). The ConnectionsProvider seeds from these. */
export const SEED_CONNECTED = [
  "catarina-vaz",
  "jonas",
  "luisa",
  "anika",
  "rita",
  "nuno",
  "sofia-castano",
  "sara-pinheiro",
];
export const SEED_INCOMING = [
  "daniel-oliveira",
  "mariana-costa",
  "bilal-kaya",
  "ines-fonseca",
];
export const SEED_SENT = ["raquel-baptista", "catarina-melo"];

/** Extra members revealed by "Load more" in the All tab. */
export const MORE_POOL = [
  "beatriz",
  "kai",
  "monica",
  "andre",
  "carla",
  "diogo",
  "jordan",
  "fatima",
  "rui-fernandes",
];
export const MORE_PER_PAGE = 4;

/** Everything a connection card needs, merged from the registry + relationship meta. */
export interface ConnectionView {
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  photo?: string;
  role: string;
  pron?: string;
  tags: string[];
  meta: ConnectionMeta;
}

/** Build a card view for a member slug, or null if the slug isn't a real member. */
export function connectionView(slug: string): ConnectionView | null {
  const m = MEMBERS[slug];
  if (!m) return null;
  return {
    slug,
    name: `${m.first} ${m.last}`,
    initials: m.initials,
    tint: m.tint,
    photo: m.photo,
    role: m.role,
    pron: CONNECTION_META[slug]?.pron,
    tags: m.tags,
    meta: CONNECTION_META[slug] ?? {},
  };
}

/** Resolve a list of slugs to views, dropping any that aren't real members. */
export function connectionViews(slugs: string[]): ConnectionView[] {
  return slugs
    .map(connectionView)
    .filter((v): v is ConnectionView => v !== null);
}

// i18n Pattern A (label-key indirection): the vouch relationship is a stable
// English enum (`vouchBadge`); only the rendered label is resolved via `t()`
// by the consuming component, so a language switch never touches the stored
// relationship value.
const VOUCH_LABEL_KEY: Record<
  NonNullable<ConnectionMeta["vouchBadge"]>,
  string
> = {
  "vouched-for-you": "connect:vouch.forYou",
  "you-vouched": "connect:vouch.byYou",
  mutual: "connect:vouch.mutual",
};

/** Catalog key for a connection's vouch relationship badge, if any. */
export function vouchBadgeLabelKey(meta: ConnectionMeta): string | undefined {
  return meta.vouchBadge ? VOUCH_LABEL_KEY[meta.vouchBadge] : undefined;
}

/**
 * Catalog key for the note shown on a card in the Vouched-for tab.
 *
 * Takes the badge off the card's own view (`view.meta.vouchBadge`), which the
 * live adapter fills from the server and the demo path fills from
 * `CONNECTION_META`. It must NOT look the slug up in `CONNECTION_META` itself:
 * a live slug misses that mock table, so every live card fell through to
 * "You vouched" even when the server said otherwise.
 */
export function vouchNoteKey(
  badge: ConnectionMeta["vouchBadge"],
  youVouched: boolean,
): string {
  const theyVouched = badge === "vouched-for-you" || badge === "mutual";
  if (youVouched && theyVouched) return "connect:vouch.bothWays";
  if (youVouched) return "connect:vouch.byYou";
  if (badge === "vouched-for-you") return "connect:vouch.forYou";
  if (badge === "mutual") return "connect:vouch.bothWays";
  return "connect:vouch.byYou";
}
