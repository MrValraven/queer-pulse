import type { AvatarTone } from "./ui";
import { portraitByInitials } from "./adminVouchGraph.data";

/* ── Types ────────────────────────────────────────────────── */

export type MemberStatus = "active" | "review" | "frozen" | "limited";

export interface VouchAvatar {
  initials: string;
  tone: AvatarTone;
  avatarUrl?: string | null;
}

/**
 * i18n note: the status CHIP LABEL is derived, never stored — `verified`
 * (already a canonical boolean) plus `openReportsCount` (a real per-member
 * count) are all AdminMemberRows.tsx needs to resolve
 * `admin:members.status.verified` / `admin:members.status.openReports` at
 * render. This avoids baking an English "1 open report" phrase into data.
 */
export interface AdminMember {
  id: string;
  /** stable slug the trust-network graph keys on (`AdminVouchGraphModal`'s
   *  `focusSlug`) — distinct from `id` in live mode. */
  slug: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  pronoun: string;
  verified: boolean;
  /** Open reports against this member, when not verified. */
  openReportsCount?: number;
  /** tone for the status chip */
  statusTone: "jade" | "amber" | "coral" | "violet" | "plum" | "ghost";
  /** used by the "New this week" filter */
  newThisWeek: boolean;
  meta: string;
  vouchCount: number;
  /** the small stacked vouch avatars to preview on the row */
  vouchedBy: VouchAvatar[];
}

/** Canonical, stable flagged-member status id — the chip label resolves via
 *  `admin:members.flagged.status.<statusId>`, never a stored English string. */
export type FlaggedStatusId = "underReview" | "frozen" | "limited";

export interface FlaggedMember {
  id: string;
  handle: string;
  initials: string;
  tone: AvatarTone;
  /** left category chip: a fixed reason id ("doxxing"/"spam") or a real
   *  per-member report count (`{ count }`), never a baked English string. */
  category:
    { kind: "doxxing" | "spam" } | { kind: "reportsCount"; count: number };
  catTone: "danger" | "amber" | "violet" | "coral";
  meta: string;
  statusId: FlaggedStatusId;
  statusTone: "danger" | "amber" | "violet" | "coral";
}

export interface DrawerStat {
  labelKey: string;
  value: string;
}

export interface ContributionItem {
  what: string;
  when: string;
}

export type CommTone = "jade" | "violet" | "plum" | "coral" | "amber" | "ghost";

/** A single entry in the "for & against" moderation timeline. */
export interface ModerationEntry {
  tone: "good" | "neutral" | "bad";
  title: string;
  meta: string;
  /** when set, the meta ends with a link (e.g. "view") to the audit log */
  metaLink?: string;
  note?: string;
}

export interface MemberDetail {
  id: string;
  glance: DrawerStat[];
  graphNote: string;
  communities: { label: string; tone: CommTone }[];
  contributions: ContributionItem[];
  moderationTimeline: ModerationEntry[];
  removeBody: string;
  /** central node + surrounding bubbles for the vouch graph */
  graph: {
    center: { initials: string; tone: AvatarTone };
    nodes: VouchAvatar[];
  };
}

/* ── Verification pending badge ──────────────────────────── */

/** The tab badge reads 11 even though only 3 cards are shown (per design). */
export const VERIFY_PENDING_COUNT = 11;

/** Vanity total shown in the admin members header in demo mode. Also doubles
 *  as the demo `pageSize`, so `page * pageSize === total` after page 1 and
 *  `getNextPageParam` yields `undefined` — demo mode never fetches a page 2. */
export const ACTIVE_MEMBER_COUNT = 8412;

/* ── All members (directory) ─────────────────────────────── */

export const MEMBERS: AdminMember[] = [
  {
    id: "ines",
    slug: "ines",
    name: "Inês Martins",
    initials: "IM",
    tone: "jade",
    pronoun: "she/her",
    verified: true,
    statusTone: "jade",
    newThisWeek: false,
    meta: "Joined Mar 2023 · Founder, Maré Records · Trans & Friends · Queer Creatives",
    vouchCount: 21,
    vouchedBy: [
      { initials: "TM", tone: "violet", avatarUrl: portraitByInitials("TM") },
      { initials: "AL", tone: "coral", avatarUrl: portraitByInitials("AL") },
      { initials: "DO", tone: "coral", avatarUrl: portraitByInitials("DO") },
    ],
  },
  {
    id: "devon",
    slug: "devon",
    name: "Devon Okoro",
    initials: "DO",
    tone: "coral",
    pronoun: "they/them",
    verified: true,
    statusTone: "jade",
    newThisWeek: false,
    meta: "Joined Jun 2025 · Illustrator · Queer Creatives",
    vouchCount: 10,
    vouchedBy: [
      { initials: "IM", tone: "jade", avatarUrl: portraitByInitials("IM") },
      { initials: "KS", tone: "plum", avatarUrl: portraitByInitials("KS") },
    ],
  },
  {
    id: "theo",
    slug: "theo",
    name: "Théo Mendes",
    initials: "TM",
    tone: "violet",
    pronoun: "he/him",
    verified: false,
    openReportsCount: 1,
    statusTone: "coral",
    newThisWeek: false,
    meta: "Joined Sep 2024 · Community organiser · Lisbon Queers",
    vouchCount: 7,
    vouchedBy: [
      { initials: "IM", tone: "jade", avatarUrl: portraitByInitials("IM") },
      { initials: "SA", tone: "amber", avatarUrl: portraitByInitials("SA") },
    ],
  },
  {
    id: "sofia",
    slug: "sofia",
    name: "Sofia Almeida",
    initials: "SA",
    tone: "amber",
    pronoun: "she/they",
    verified: true,
    statusTone: "jade",
    newThisWeek: false,
    meta: "Joined Jan 2024 · Nurse · mutual aid lead · Trans & Friends",
    vouchCount: 14,
    vouchedBy: [
      { initials: "DO", tone: "coral", avatarUrl: portraitByInitials("DO") },
      { initials: "TM", tone: "violet", avatarUrl: portraitByInitials("TM") },
    ],
  },
  {
    id: "kai",
    slug: "kai",
    name: "Kai Sousa",
    initials: "KS",
    tone: "plum",
    pronoun: "xe/xem",
    verified: true,
    statusTone: "jade",
    newThisWeek: true,
    meta: "Joined Nov 2025 · DJ · night-life · Queer Creatives",
    vouchCount: 4,
    vouchedBy: [
      { initials: "SA", tone: "amber", avatarUrl: portraitByInitials("SA") },
    ],
  },
];

/* ── Flagged ─────────────────────────────────────────────── */

export const FLAGGED: FlaggedMember[] = [
  {
    id: "nightowl",
    handle: "@nightowl",
    initials: "N",
    tone: "plum",
    category: { kind: "reportsCount", count: 4 },
    catTone: "danger",
    meta: "Joined Sep 2024 · Pattern: repeated DMs after blocks",
    statusId: "underReview",
    statusTone: "coral",
  },
  {
    id: "anon_4471",
    handle: "@anon_4471",
    initials: "A",
    tone: "anon",
    category: { kind: "doxxing" },
    catTone: "danger",
    meta: "New account · 1h old · 0 vouches · Auto-frozen pending review",
    statusId: "frozen",
    statusTone: "danger",
  },
  {
    id: "coin_daily",
    handle: "@coin_daily",
    initials: "CD",
    tone: "amber",
    category: { kind: "spam" },
    catTone: "amber",
    meta: "Joined last week · Crypto links across 6 threads",
    statusId: "limited",
    statusTone: "amber",
  },
];

/* ── Drawer detail (keyed by member id) ──────────────────── */

export const MEMBER_DETAIL: Record<string, MemberDetail> = {
  ines: {
    id: "ines",
    glance: [
      { labelKey: "admin:members.glance.vouches", value: "21" },
      { labelKey: "admin:members.glance.memberFor", value: "3yr" },
      { labelKey: "admin:members.glance.reportsAgainst", value: "0" },
    ],
    graphNote:
      "21 members vouch for Inês. A dense, mutual graph is a sign of deeply-held trust — not a metric to game.",
    communities: [
      { label: "Trans & Friends · moderator", tone: "jade" },
      { label: "Queer Creatives", tone: "violet" },
      { label: "Lisbon Queers", tone: "plum" },
    ],
    contributions: [
      {
        what: "Resolved a harassment report in Trans & Friends",
        when: "2 min ago",
      },
      {
        what: 'Hosted "Queer founders breakfast" — 34 attended',
        when: "Jun 12",
      },
      { what: "Vouched for Marco Vieira", when: "May 30" },
      { what: "Published an essay in the Magazine", when: "Apr 18" },
    ],
    moderationTimeline: [
      {
        tone: "good",
        title: "No reports against this member",
        meta: "In 3 years of membership",
      },
      {
        tone: "neutral",
        title: "Filed a report (harassment) — resolved",
        meta: "Jan 2026 · acted on by Júlia S. · ",
        metaLink: "view",
        note: '"Reported misgendering in a thread; the other member was warned."',
      },
      {
        tone: "good",
        title: "Verified identity",
        meta: "Mar 2023 · 2 vouches confirmed",
      },
    ],
    removeBody:
      "This ends Inês Martins's membership, hides their content, and notifies them with your reason and the right to appeal. Their vouches for others stay valid. This is logged in the audit trail under your name.",
    graph: {
      center: { initials: "IM", tone: "jade" },
      nodes: [
        { initials: "TM", tone: "violet" },
        { initials: "AL", tone: "coral" },
        { initials: "DO", tone: "coral" },
        { initials: "SA", tone: "amber" },
        { initials: "KS", tone: "plum" },
        { initials: "MV", tone: "coral" },
        { initials: "NL", tone: "violet" },
        { initials: "RA", tone: "jade" },
        { initials: "PE", tone: "plum" },
        { initials: "YC", tone: "jade" },
        { initials: "JO", tone: "amber" },
        { initials: "BR", tone: "violet" },
      ],
    },
  },
};

/** Fallback detail so any member opens a populated drawer. */
export function detailFor(member: AdminMember): MemberDetail {
  const found = MEMBER_DETAIL[member.id];
  if (found) return found;
  const first = member.name.split(" ")[0];
  return {
    id: member.id,
    glance: [
      {
        labelKey: "admin:members.glance.vouches",
        value: String(member.vouchCount),
      },
      {
        labelKey: "admin:members.glance.memberFor",
        value: member.newThisWeek ? "new" : "1yr+",
      },
      { labelKey: "admin:members.glance.reportsAgainst", value: "0" },
    ],
    graphNote: `${member.vouchCount} members have vouched for ${first}. A mutual graph is a sign of trust — not a metric to optimise.`,
    communities: [
      { label: "Trans & Friends", tone: "jade" },
      { label: "Queer Creatives", tone: "violet" },
    ],
    contributions: [
      { what: "Joined QueerPulse", when: "this year" },
      { what: "Posted in a community", when: "recently" },
    ],
    moderationTimeline: [
      {
        tone: "good",
        title: "No reports against this member",
        meta: "A clean record so far",
      },
      {
        tone: "good",
        title: "Verified identity",
        meta: `${member.newThisWeek ? "This month" : "On joining"} · vouches confirmed`,
      },
    ],
    removeBody: `This ends ${member.name}'s membership, hides their content, and notifies them with your reason and the right to appeal. Their vouches for others stay valid. This is logged in the audit trail under your name.`,
    graph: {
      center: { initials: member.initials, tone: member.tone },
      nodes: member.vouchedBy.length
        ? member.vouchedBy
        : [{ initials: "?", tone: "anon" }],
    },
  };
}

/* ── Identity & privacy (sealed-lock card copy) ──────────── */
/** i18n Pattern A — platform policy copy, sole consumer is SealedIdentity in
 *  AdminMemberDrawerSections.tsx. */
export const SEALED_IDENTITY = {
  titleKey: "admin:members.sealed.title",
  bodyKey: "admin:members.sealed.body",
};
