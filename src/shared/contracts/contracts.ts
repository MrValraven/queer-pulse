// Response shapes shared with the web client (the typed SDK target, docs/backend/24).
// Request DTOs with validation live in apps/api; these are the plain output types.

import type {
  CommunityType,
  ConnectionState,
  ReportStatus,
  RsvpStatus,
  SubmissionStatus,
  Visibility,
} from "./enums";

export type ReportSubjectType =
  | "user"
  | "profile"
  | "community_post"
  | "forum_post"
  | "message"
  | "gathering"
  | "article";

export interface ReportResponse {
  id: string;
  subjectType: ReportSubjectType;
  subjectId: string;
  reason: string;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
}

export type AppealStatus = "open" | "upheld" | "overturned";

export interface AppealResponse {
  id: string;
  reportId: string | null;
  body: string;
  status: AppealStatus;
  decision: string | null;
  createdAt: string;
}

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Paginated<T> {
  data: T[];
  pageInfo: PageInfo;
}

export interface ProfileResponse {
  handle: string;
  displayName: string;
  pronouns: string | null;
  bio: string | null;
  avatarUrl: string | null;
  neighbourhood: string | null;
  interests: string[];
  visibility: Visibility;
  isVerified: boolean;
}

export interface SessionResponse {
  id: string;
  deviceLabel: string | null;
  userAgent: string;
  current: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface InviteResponse {
  id: string;
  code: string;
  email: string | null;
  maxUses: number;
  uses: number;
  expiresAt: string;
  revokedAt: string | null;
}

export interface ConnectionResponse {
  id: string;
  state: ConnectionState;
  direction: "incoming" | "outgoing";
  profile: ProfileResponse;
  createdAt: string;
  respondedAt: string | null;
}

export type CommunityMembershipState = "active" | "pending" | "left" | null;

export interface CommunitySummary {
  slug: string;
  name: string;
  description: string;
  type: CommunityType;
  visibility: Visibility;
  isLowVisibility: boolean;
  requiresApproval: boolean;
  membershipState: CommunityMembershipState;
  memberCount: number | null;
}

export interface AuthorSummary {
  handle: string;
  displayName: string;
  /** Optional — only some author contexts carry it (e.g. the feed's
   *  `new_member` actor, which `MemberCard` renders next to the name).
   *  Absent/`null` where the producing endpoint doesn't resolve it. */
  pronouns?: string | null;
  avatarUrl: string | null;
}

export interface CommunityPostResponse {
  id: string;
  body: string;
  author: AuthorSummary;
  replyCount: number;
  voteCount: number;
  createdAt: string;
}

export type MessageReactionKey =
  | "love"
  | "laugh"
  | "like"
  | "wow"
  | "sad"
  | "thanks";

export interface ReactionSummary {
  key: MessageReactionKey;
  count: number;
  mine: boolean;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  body: string;
  sender: AuthorSummary;
  createdAt: string;
  editedAt: string | null;
  reactions: ReactionSummary[];
  deletedAt: string | null;
  /** Set on the viewer's OWN outgoing message once the recipient's delivered
   *  watermark has reached it — the ISO of that watermark (an upper bound on
   *  arrival). Null when not yet delivered, and for received messages. Drives
   *  the "double check"; distinct from `deletedAt` and outranked by the read
   *  ("seen") watermark. */
  deliveredAt: string | null;
  /** The sender's client-generated idempotency id, echoed back so an optimistic
   *  outbox bubble reconciles against its server row by the same key. Null for
   *  server-originated or legacy messages. */
  clientMessageId: string | null;
  /** True when this message was created by forwarding — the bubble renders a
   *  subtle "Forwarded" label. Only the body is carried on a forward. */
  forwarded: boolean;
  /** ISO timestamp the message was pinned in the conversation (SHARED — both
   *  participants see the same value), else null. Drives the pin indicator + the
   *  pinned-messages banner. */
  pinnedAt: string | null;
  /** Whether THIS viewer has privately starred (bookmarked) the message. Scoped
   *  to the caller — never reflects the other participant's stars. */
  starred: boolean;
  /** Server-authoritative: whether this viewer may pin/unpin this message. */
  canPin: boolean;
  /** Server-authoritative: whether this viewer may edit this message (author,
   *  within the server's edit window, not deleted). Mirrors exactly what the
   *  edit endpoint would accept — never recompute this client-side. */
  canEdit: boolean;
  /** Server-authoritative: whether this viewer may delete this message (author
   *  or platform staff, not already deleted). Mirrors the delete endpoint. */
  canDelete: boolean;
  /** Server-authoritative: whether this viewer may report this message (not
   *  the author's own message, not deleted). */
  canReport: boolean;
  replyTo: {
    id: string;
    snippet: string;
    senderName: string;
    deleted: boolean;
  } | null;
  /** `user` (an ordinary bubble), `system` (a rendered event pill), or `gif`
   *  (an inline-image bubble). Every DM message is `user`, so the existing
   *  bubble path is unchanged. */
  kind: "user" | "system" | "gif";
  /** Provider-hosted GIF for a `kind:"gif"` message, else null. The client
   *  renders it as an inline image; `body` carries a "GIF" text fallback so
   *  previews/notifications keep working. */
  attachment: {
    url: string;
    previewUrl: string;
    width: number;
    height: number;
    provider: string;
  } | null;
  /** Resolved system event for a `system` message (else null). Actor/target come
   *  back as DISPLAY NAMES (never user ids); the client renders bilingual
   *  templates. `value` carries a scalar the event needs (e.g. a new title). */
  systemEvent: {
    type:
      | "group_created"
      | "member_added"
      | "member_removed"
      | "member_left"
      | "group_renamed";
    actorName: string;
    targetName: string | null;
    value: string | null;
  } | null;
}

export type ConversationRole = "owner" | "admin" | "member";

/** One member of a GROUP conversation (empty for DMs). `id` is the user id. */
export interface ConversationMemberSummary {
  id: string;
  /** Profile handle (slug) — member link + avatar tint seed. */
  handle: string;
  name: string;
  avatarUrl: string | null;
  role: ConversationRole;
  /** This member's read watermark (ISO), else null — the client computes
   *  "Seen by N" by comparing it against a message's timestamp (no per-message
   *  receipts fetch). */
  lastReadAt?: string | null;
  /** This member's delivered watermark (ISO), else null (one rung below read). */
  deliveredAt?: string | null;
}

export interface ConversationResponse {
  id: string;
  type: "dm" | "group";
  otherParticipant: AuthorSummary | null;
  lastMessage: MessageResponse | null;
  unreadCount: number;
  updatedAt: string;
  /** The OTHER participant's read watermark (ISO), for "Seen" receipts. Null for
   *  official/group threads or a counterpart who has never read. */
  otherLastReadAt: string | null;
  /** The OTHER participant's delivered watermark (ISO), for the "double check".
   *  Mirrors `otherLastReadAt` one rung down; null for official/group threads or
   *  a counterpart whose device hasn't acked anything yet. */
  otherDeliveredAt: string | null;
  /** The other participant's user id — used only client-side to correlate
   *  presence (`presence` events key by userId). Null for official/group. */
  otherParticipantId: string | null;
  /** `direct` (1:1 DM / official) or `group` (member-created, titled,
   *  multi-participant). DMs stay `direct` and render exactly as before. */
  kind: "direct" | "group";
  /** Group name (null for DMs — their name is the counterpart's). */
  title: string | null;
  /** Group avatar URL (null for DMs). */
  avatarUrl: string | null;
  /** Active member count for a group; 0 for DMs. */
  memberCount: number;
  /** Group member roster (empty for DMs). */
  members: ConversationMemberSummary[];
  /** For a group: whether THIS caller has left it. Absent/false for DMs. */
  hasLeft?: boolean;
  /** This caller's own standing in the group. Null/absent for DMs. */
  myRole?: ConversationRole | null;
  /** SERVER-AUTHORITATIVE group-management capability flags — the client gates
   *  its management UI on these; every mutation re-checks the role server-side.
   *  All false/absent for DMs and a member who has left. */
  canAddMembers?: boolean;
  canRemoveMembers?: boolean;
  canRename?: boolean;
  canManageRoles?: boolean;
}

// --- Message search (cross-inbox body search) ---

/** One cross-conversation message-search hit (GET /messages/search). `snippet`
 *  is a server-windowed excerpt around the match — the full body is never sent.
 *  Mirrors the backend `MessageSearchHit` field-for-field. */
export interface MessageSearchHit {
  id: string;
  conversationId: string;
  snippet: string;
  sender: AuthorSummary;
  createdAt: string;
}

/** Per-conversation grouping metadata for search hits: the counterpart (null for
 *  the official/welcome thread) and `isOfficial` so the client renders the right
 *  name/avatar without a second request. */
export interface MessageSearchConversationGroup {
  conversationId: string;
  otherParticipant: AuthorSummary | null;
  isOfficial: boolean;
}

/** GET /messages/search response: the echoed (trimmed) query, flat hits
 *  newest-first, and the conversation metadata to group them under. */
export interface MessageSearchResponse {
  query: string;
  hits: MessageSearchHit[];
  conversations: MessageSearchConversationGroup[];
}

/** One starred-message row (GET /messages/starred) — a search-hit shape plus
 *  `starredAt` (when the viewer bookmarked it). Mirrors backend `StarredMessageHit`. */
export interface StarredMessageHit extends MessageSearchHit {
  starredAt: string;
}

/** GET /messages/starred response: the caller's starred messages newest-star-first,
 *  plus the per-conversation grouping metadata (reused from search). */
export interface StarredMessagesResponse {
  items: StarredMessageHit[];
  conversations: MessageSearchConversationGroup[];
}

export interface GatheringResponse {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  host: AuthorSummary | null;
  neighbourhood: string;
  venueName: string | null;
  /** Only present for the host or a confirmed (going) attendee. */
  addressPrivate: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  rsvpCount: number;
  spotsLeft: number | null;
  isCancelled: boolean;
  isFree: boolean;
  priceCents: number;
  slidingScale: boolean;
  priceMinCents: number;
  visibility: Visibility;
  myRsvpStatus: RsvpStatus | null;
}

/** RSVP result. `clientSecret` is present when a Stripe payment must be completed. */
export interface RsvpResult {
  status: RsvpStatus;
  ticketCode: string | null;
  clientSecret: string | null;
}

// --- Magazine ---

export interface AuthorResponse {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface IssueResponse {
  number: string;
  title: string;
  dek: string;
  publishedOn: string;
  coverUrl: string | null;
}

export interface ArticleListItem {
  slug: string;
  title: string;
  dek: string;
  author: AuthorSummary;
  issueNumber: string | null;
  tags: string[];
  readMinutes: number;
  publishedAt: string | null;
}

export interface ArticleResponse extends ArticleListItem {
  body: string;
}

export interface StorySubmissionResponse {
  id: string;
  format: string;
  workingTitle: string;
  pitch: string;
  status: SubmissionStatus;
  createdAt: string;
}

// --- Forum ---

export interface ForumThreadResponse {
  id: string;
  slug: string;
  title: string;
  author: AuthorSummary;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  canEdit: boolean;
  /** Row-moderation permissions on the thread's opening post, denormalized onto
   *  the thread DTO so the list row can render its ⋯ menu (delete / restore /
   *  history) without fetching the post. `canLock` is a thread-level moderator
   *  permission (close / reopen replies). Author sees `canEdit`; a moderator who
   *  isn't the author sees the others. */
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  canLock: boolean;
  /** Id of the thread's opening post (oldest post) — the list-row upvote +
   *  row-moderation target. Empty string on responses that didn't resolve it. */
  opPostId: string;
  /** The OP post's vote count — drives the card upvotes and the "Top" sort. */
  opVoteCount: number;
  /** The viewer's own vote on the OP (0 or 1). */
  myVote: number;
  /** Normalized (lowercase, deduped) thread tags. */
  tags: string[];
}

export interface ForumPostResponse {
  id: string;
  threadId: string;
  /** Parent comment id, or null for a top-level comment (reply to the thread/OP). */
  parentPostId: string | null;
  author: AuthorSummary;
  body: string;
  voteCount: number;
  myVote: number;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  /** A moderator `remove_content` takedown (distinct from an author's own
   *  delete). Optional: absent on older responses / demo. */
  moderationRemoved?: boolean;
  /** A moderator `hide_content` takedown — only ever present in a moderator's
   *  own view (members never receive a hidden post). */
  moderationHidden?: boolean;
}

export interface ForumPostHistoryEntry {
  id: string;
  previousBody: string;
  previousTitle: string | null;
  author: AuthorSummary;
  createdAt: string;
}

export interface ForumPostHistoryResponse {
  revisions: ForumPostHistoryEntry[];
}

// --- Content / CMS ---

export interface PageResponse {
  slug: string;
  title: string;
  body: string;
  locale: string;
  publishedAt: string | null;
}

export interface PartnerResponse {
  slug: string;
  name: string;
  description: string;
  url: string | null;
  tier: string | null;
}

// --- Topics (hashtag directory + per-topic post feed) ---

export interface TopicResponse {
  tag: string;
  label: string;
  description: string;
  totalPosts: number;
}

export interface RelatedTopicResponse {
  tag: string;
  count: number;
}

export interface TopicDetailResponse extends TopicResponse {
  followerCount: number;
  postsThisWeek: number;
  relatedTopics: RelatedTopicResponse[];
}

export interface TopicPostResponse {
  id: string;
  topicId: string;
  author: string;
  authorInitials: string;
  authorTone: string;
  contextLabel: string | null;
  kind: string;
  category: string;
  title: string;
  body: string;
  reactionCount: number;
  reactionLabel: string;
  replyCount: number;
  replyLabel: string | null;
  tags: string[];
  href: string;
  createdAt: string;
}

// --- Resources ---

export interface ResourceResponse {
  slug: string;
  category: string;
  title: string;
  description: string;
  body: string;
  externalUrl: string | null;
}

export interface GlossaryTermResponse {
  slug: string;
  term: string;
  definition: string;
  category: string | null;
}

// --- Feed (read-time aggregation) ---

/** `new_member` backs the "People" tab: a recently-joined active member,
 *  surfaced by `NewMemberCard`. It carries no fields beyond the shared
 *  `FeedItem` shape — see the field mapping below. */
export type FeedItemType =
  "community_post" | "forum_thread" | "gathering" | "new_member";

/**
 * For `type: "new_member"`: `actor` is the member who joined (handle/
 * displayName/avatarUrl), `title` is their display name, `summary` is their
 * tagline/short bio (may be empty), `link` is their profile path, and
 * `createdAt` is when they joined. `actor.pronouns` carries the member's
 * pronouns (rendered next to the name by `MemberCard`), and the top-level
 * `neighbourhood`/`interests` fields enrich the card with a location line and
 * interest chips (see their notes). The common-communities chips the demo
 * `NewMemberCard` mock also shows aren't part of the aggregate and are omitted
 * for live `new_member` items.
 */
export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  title: string;
  summary: string;
  link: string;
  actor: AuthorSummary | null;
  /** `new_member` (People tab) only — extra profile fields the member card
   *  renders beneath/around the name. `neighbourhood` honours the member's
   *  visibility (null unless their profile is public); `interests` are their
   *  public tags. Both absent for every other item type. */
  neighbourhood?: string | null;
  interests?: string[];
}

// --- Media ---

export type MediaKind = "image" | "audio" | "video" | "pdf" | "doc";

export interface MediaUploadTicket {
  mediaId: string;
  uploadUrl: string;
  storageKey: string;
}

export interface MediaAssetResponse {
  id: string;
  kind: MediaKind;
  url: string | null;
  processingState: "pending" | "ready" | "failed";
}

// --- Search ---

export type SearchType = "member" | "gathering" | "community" | "article";

export interface SearchHit {
  type: SearchType;
  id: string;
  title: string;
  snippet: string;
  link: string;
}

export interface SearchResults {
  query: string;
  hits: SearchHit[];
}

// --- Settings / GDPR ---

export interface UserSettingsResponse {
  notifications: Record<string, boolean>;
  accessibility: Record<string, unknown>;
  privacy: Record<string, unknown>;
  locale: string;
}

export interface ConsentResponse {
  purpose: string;
  granted: boolean;
  policyVersion: string;
  updatedAt: string;
}

export interface DataExportResponse {
  generatedAt: string;
  data: Record<string, unknown>;
}

export interface DeletionRequestResponse {
  state: "scheduled" | "cancelled" | "completed";
  scheduledFor: string;
}

// --- Link previews (messaging unfurls) ---

/**
 * Server-side unfurl of a URL pasted into a message. Every field is nullable:
 * a URL that yields no usable metadata (or one the SSRF-hardened backend
 * declines to fetch) comes back all-null, and the client renders NOTHING rather
 * than a broken card. Mirrors the backend `LinkPreviewResponse` field-for-field.
 */
export interface LinkPreviewResponse {
  url: string;
  siteName: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}
