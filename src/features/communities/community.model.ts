import type { Person } from "./communityDetails";
import type { JoinInvolvement } from "./api/communityJoin.api";
import type { AccessTier, CommunityRole } from "./membership.types";
import type { ReasonCode } from "../safety/reportReasons";
import type { CommunityReportSeverity } from "./api/communities.api";

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
  /** ISO creation timestamp — the ONLY relative-time source for live rows.
   *  Rendered through `useCommunityTime()` so the "3 hours ago" phrase is
   *  built in the viewer's locale at render, never baked in by an adapter. */
  createdAt?: string;
  /** Legacy pre-rendered relative token ("2h") that only the demo mock data
   *  authors. Live rows carry `createdAt` instead. */
  time?: string;
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
  /** Legacy pre-rendered relative token ("2h"), demo mock data only — live
   *  posts carry `createdAt` and are formatted at render (`useCommunityTime`). */
  time?: string;
  /** ISO creation timestamp (relative-time source + Newest sorting). */
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
  /** ISO request timestamp (live). Formatted at render by `useCommunityTime`. */
  createdAt?: string;
  /** Legacy pre-rendered relative token, demo mock data only. */
  time?: string;
  /** The applicant's pronouns, when their profile carries them (live rows;
   *  the backend's `MemberRef` includes them). */
  pronouns?: string;
  /** How they said they want to take part, as its own answer. Absent when they
   *  skipped the question or the request predates the field. */
  involvement?: JoinInvolvement;
  /** Reviewer-side context, all live-only and all optional. Present as CONTEXT
   *  for a human decision: nothing here is a score, a rank or a
   *  recommendation, and no surface may turn it into one.
   *  When the applicant's ACCOUNT was created (not when they applied). */
  accountCreatedAt?: string;
  /** Accepted connections this applicant and the reviewer's community share. */
  sharedConnectionCount?: number;
  /** Other communities the applicant is on the roster of alongside this one's
   *  members. */
  sharedCommunityCount?: number;
}

/** A flagged post or reply awaiting a mod decision.
 *
 *  Both halves now carry the evidence: the demo mocks author
 *  `postExcerpt`/`author`/`reporter`/`reason` by hand, and live rows come from
 *  `GET /communities/:slug/reports` (owner/mod only), which resolves the
 *  reported body, its author, its thread and its moderation state onto each
 *  report. `reporter` stays demo-only: who filed a report is deliberately not
 *  shown to a community moderator. `ModReportedPosts` renders whatever is
 *  present. */
export interface ModReport {
  id: string;
  /** ISO report timestamp (live). Formatted at render by `useCommunityTime`. */
  createdAt?: string;
  /** Legacy pre-rendered relative token, demo mock data only. */
  time?: string;
  /** An excerpt of the flagged content (both modes). Plain text, already cut
   *  server-side in live mode. */
  postExcerpt?: string;
  /** Live: the excerpt stops short of the full body, so the row offers a way
   *  through to the thread for the rest. */
  isExcerptTruncated?: boolean;
  /** Who posted the flagged content (both modes). */
  author?: Person;
  /** Demo-only: who filed the report. */
  reporter?: Person;
  /** Demo-only free-text reason (the mock data authors this directly). */
  reason?: string;
  /** Live: the report's stable reason code. Resolve it to a label via
   *  `REASON_LABEL_KEYS` + `t()` (see `../safety/reportReasons`). */
  reasonCode?: ReasonCode;
  /** Live: how urgent the platform judged this report, derived from the reason
   *  code. Rendered as a badge with its own text, never as colour alone. */
  severity?: CommunityReportSeverity;
  /** Live: when the response window closes (ISO). */
  slaDueAt?: string;
  /** Live: that window has already closed and the report is still open. */
  isOverdue?: boolean;
  /** Live: what got reported. "Remove" only wires up for `"post"`. A reply
   *  report is dismissible and links through to its thread, and an
   *  `"event_photo"` report is one photograph in a gathering's album, which
   *  has no thread to link to at all (see `ModReportedPosts`). */
  subjectType?: "post" | "reply" | "event_photo";
  /** Live: the post, reply or photo id, the "Remove" action's delete target. */
  subjectId?: string;
  /** Live: the thread to open. The post itself, or a reply's parent post.
   *  Unset for a photo report, which lives in an album rather than a thread. */
  threadPostId?: string;
  /** Live: the content is already tombstoned by its author or a moderator. */
  isContentDeleted?: boolean;
  /** Live: the content is moderation-hidden from members right now. */
  isContentHidden?: boolean;
  /** Live: the content is moderation-removed (a tombstone everyone sees). */
  isContentRemoved?: boolean;
  /** Live: the report points at a row that no longer exists, so there is no
   *  body to show and nothing to link to. */
  isContentMissing?: boolean;
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
