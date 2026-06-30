import { routes } from "../../app/routeMap";
import { MEMBERS } from "../members/data/members";
import type { AvatarTint } from "../../shared/components/ui";

export type TabId = "all" | "incoming" | "sent" | "blocked" | "vouched";

export const MESSAGES = routes.messages;

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
  pron?: string;
  mutuals?: number;
  since?: string;
  vouchBadge?: "vouched-for-you" | "you-vouched" | "mutual";
  requestMessage?: string;
  sentAgo?: string;
}

export const CONNECTION_META: Record<string, ConnectionMeta> = {
  // — connected —
  "catarina-vaz": {
    pron: "she/her",
    mutuals: 11,
    since: "Mar 2025",
    vouchBadge: "vouched-for-you",
  },
  jonas: { pron: "he/him", mutuals: 8, since: "Dec 2024" },
  luisa: { pron: "she/her", mutuals: 14, vouchBadge: "you-vouched" },
  anika: { pron: "she/her", mutuals: 6, since: "Jan 2026" },
  rita: {
    pron: "they/them",
    mutuals: 9,
    since: "Nov 2024",
    vouchBadge: "mutual",
  },
  nuno: { pron: "he/him", mutuals: 11, since: "Feb 2025" },
  "sofia-castano": { pron: "she/her", mutuals: 4, since: "Apr 2026" },
  "sara-pinheiro": { pron: "she/her", mutuals: 13, since: "Sep 2025" },
  // — incoming requests —
  "daniel-oliveira": {
    pron: "he/him",
    mutuals: 1,
    sentAgo: "2h ago",
    requestMessage:
      '"Hi Tiago — we met briefly at the harm-reduction workshop. I\'d love to stay in touch and compare notes sometime."',
  },
  "mariana-costa": { pron: "she/her", mutuals: 2, sentAgo: "yesterday" },
  "bilal-kaya": { pron: "he/him", mutuals: 3, sentAgo: "3 days ago" },
  "ines-fonseca": { pron: "she/her", mutuals: 0, sentAgo: "5 days ago" },
  // — sent —
  "raquel-baptista": { pron: "she/her", sentAgo: "2 days ago" },
  "catarina-melo": { pron: "she/her", sentAgo: "5 days ago" },
  // — "Load more" pool —
  beatriz: { pron: "she/her", mutuals: 3, since: "2025" },
  kai: { pron: "they/them", mutuals: 5, since: "2025" },
  monica: { pron: "she/her", mutuals: 4, since: "2025" },
  andre: { pron: "he/him", mutuals: 6, since: "2025" },
  carla: { pron: "she/her", mutuals: 7, since: "2025" },
  diogo: { pron: "he/him", mutuals: 2, since: "2025" },
  jordan: { pron: "they/them", mutuals: 8, since: "2025" },
  fatima: { pron: "she/her", mutuals: 5, since: "2025" },
  "rui-fernandes": { pron: "he/him", mutuals: 4, since: "2025" },
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

const VOUCH_LABEL: Record<NonNullable<ConnectionMeta["vouchBadge"]>, string> = {
  "vouched-for-you": "Vouched for you",
  "you-vouched": "You vouched",
  mutual: "Mutual vouch",
};

/** Short label for a connection's vouch relationship, if any. */
export function vouchBadgeLabel(meta: ConnectionMeta): string | undefined {
  return meta.vouchBadge ? VOUCH_LABEL[meta.vouchBadge] : undefined;
}

/** The note shown on a card in the Vouched-for tab. */
export function vouchNote(slug: string, youVouched: boolean): string {
  const badge = CONNECTION_META[slug]?.vouchBadge;
  const theyVouched = badge === "vouched-for-you" || badge === "mutual";
  if (youVouched && theyVouched) return "Vouched both ways";
  if (youVouched) return "You vouched";
  if (badge === "vouched-for-you") return "Vouched for you";
  if (badge === "mutual") return "Vouched both ways";
  return "You vouched";
}
