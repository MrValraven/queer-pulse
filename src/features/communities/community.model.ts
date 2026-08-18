import type { Person } from "./communityDetails";
import type { AccessTier, CommunityRole } from "./membership.types";
import type { ReasonCode } from "../safety/reportReasons";

/** A named reaction; `key` maps to a react-icon in the ReactionBar. */
export type ReactionKey = "heart" | "celebrate" | "support" | "fire";

export interface Reaction {
  key: ReactionKey;
  count: number;
  /** Whether the current user has reacted (drives the active pill state). */
  reacted?: boolean;
}

export interface PostReply {
  author: Person;
  text: string;
  time: string;
  /** Backend reply id — the edit/delete target (sub-project #3). */
  id?: string;
  // ── Live edit/delete/restore metadata (backend-provided; absent in demo) ──
  editedAt?: string | null;
  deleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
}

/** A lightweight Pulse post — the "for now" unit (vs. heavier Discussion threads). */
export interface Post {
  id: string;
  author: Person;
  body: string;
  image?: string;
  kind: "post" | "announcement";
  pinned?: boolean;
  reactions: Reaction[];
  /** A bounded PREVIEW (server-capped), NOT every reply — see `replyCount`. */
  replies: PostReply[];
  /** The TRUE total reply count. Live-wired posts always set this (may
   *  exceed `replies.length`); demo mock posts omit it, so callers fall back
   *  to `replies.length`. */
  replyCount?: number;
  time: string;
  /** ISO creation timestamp (for Newest sorting in the discussion view). */
  createdAt?: string;
  communitySlug: string;
  // ── Live edit/delete/restore metadata (backend-provided; absent in demo) ──
  editedAt?: string | null;
  deleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
}

/** A non-post moment interleaved into the Pulse feed (joins, new gatherings…). */
export interface PulseMoment {
  id: string;
  kind: "joined" | "event" | "pinned" | "resource";
  text: string;
  time: string;
}

export interface CommunityResource {
  title: string;
  href: string;
  kind: "link" | "doc" | "guide";
  /** Optional one-line description. */
  note?: string;
}

export interface CommunityEvent {
  id: string;
  dd: string;
  mm: string;
  title: string;
  meta: string;
  spots?: string;
  past?: boolean;
  recapHref?: string;
  /** Slug of the real gathering this row mirrors, when there is one — the RSVP
   *  button links to `gatheringPath(slug)` rather than the generic landing. */
  slug?: string;
}

/** A community member with their role + light directory metadata. */
export interface RosterMember extends Person {
  /** Community standing — overrides Person's free-text job title. */
  role: CommunityRole;
  /** The member's job/role title (carried over from the Person registry). */
  title?: string;
  pronouns?: string;
  hood?: string;
  verified?: boolean;
}

export interface CommunityStats {
  members: number;
  activeThisWeek: number;
  postsThisWeek: number;
}

/** A pending request to join a gated (request/invite/private) community. */
export interface ModRequest {
  id: string;
  person: Person;
  note?: string;
  time: string;
}

/** A flagged post or reply awaiting a mod decision. Demo mocks populate the
 *  rich fields below (`postExcerpt`/`author`/`reporter`/`reason`); live rows
 *  come from the backend's leaner `GET /communities/:slug/reports` (owner/mod
 *  only), which only ever carries the fields marked "live" — it has no
 *  content excerpt or reporter/author identity. `ModReportedPosts` renders
 *  whichever half is present. */
export interface ModReport {
  id: string;
  time: string;
  /** Demo-only excerpt of the flagged content. */
  postExcerpt?: string;
  /** Demo-only: who posted the flagged content. */
  author?: Person;
  /** Demo-only: who filed the report. */
  reporter?: Person;
  /** Demo-only free-text reason (the mock data authors this directly). */
  reason?: string;
  /** Live: the report's stable reason code — resolve to a label via
   *  `REASON_LABEL_KEYS` + `t()` (see `../safety/reportReasons`). */
  reasonCode?: ReasonCode;
  /** Live: what got reported. "Remove" only wires up for `"post"` — a reply
   *  report can still be dismissed, but this queue has no way to reach the
   *  reply's parent post id to delete it (see `ModReportedPosts`). */
  subjectType?: "post" | "reply";
  /** Live: the post or reply id — the "Remove" action's delete target. */
  subjectId?: string;
}

/** The enriched, "living" data layered on top of the base Community + CommunityDetail. */
export interface LivingCommunity {
  slug: string;
  accessTier: AccessTier;
  rules: string[];
  resources: CommunityResource[];
  events: CommunityEvent[];
  roster: RosterMember[];
  pinned: Post[];
  pulse: Post[];
  moments: PulseMoment[];
  stats: CommunityStats;
  /** Pending join requests for mods to triage (gated communities). */
  joinRequests?: ModRequest[];
  /** Flagged posts awaiting a mod decision. */
  reports?: ModReport[];
  /** True while the community is auto-frozen pending report review — the hub
   *  shows a "frozen, under review" banner and blocks new posts for members.
   *  Owner/mods lift it from the banner. */
  frozen?: boolean;
  /** The founder/edit-modal feature toggles (⊆ "discussion"|"events"|"roster",
   *  plus possibly legacy "rooms"/"library" values already persisted — see
   *  `startCommunity.data.ts`'s `FEATURE_OPTIONS` comment). Drives whether the
   *  Events and Members/Roster tabs render at all. `undefined` (demo mock data
   *  that predates this field) is treated as "every feature on", matching the
   *  behaviour before tabs were gated. */
  features?: string[];
  /** Owner/mod setting: whether the member roster is shown to fellow members
   *  ("Show the member list to members" in the safety chapter / edit modal).
   *  `undefined` (demo mock data) defaults to visible, matching prior
   *  behaviour. */
  rosterVisible?: boolean;
}
