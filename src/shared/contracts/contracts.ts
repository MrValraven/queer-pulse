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
import type { CropRect } from "../components/ui/cropGeometry";

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
  /** Optional — only a forum `ForumThreadResponse.author` ever carries this
   *  (a thread an admin posted as "QueerPulse Official"). Absent/`undefined`
   *  everywhere else. */
  official?: boolean;
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
  "love" | "laugh" | "like" | "wow" | "sad" | "thanks";

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
  /** `user` (an ordinary bubble), `system` (a rendered event pill), `gif` (a
   *  picked provider GIF), `image` (a member-uploaded photo) — both render as
   *  an inline-image bubble — or `document` (a member-uploaded PDF/spreadsheet/
   *  text file, PRD-226), which renders as a file-card bubble. Every DM
   *  message is `user`, so the existing bubble path is unchanged. */
  kind: "user" | "system" | "gif" | "image" | "document";
  /** The media attachment for a `kind:"gif"`/`kind:"image"` (inline image) or
   *  `kind:"document"` (file-card) message, else null. `body` carries a
   *  "GIF"/"Photo"/"Document" text fallback so previews/notifications keep
   *  working. */
  attachment:
    | {
        url: string;
        previewUrl: string;
        width: number;
        height: number;
        provider: string;
      }
    | {
        url: string;
        fileName: string;
        byteSize: number;
        contentType: string;
        provider: string;
      }
    | null;
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
  /** ISO timestamp this chat was pinned to the top of the caller's inbox
   *  (WhatsApp-style, CONVERSATION-scoped — distinct from the message-level
   *  `MessageResponse.pinnedAt`). Null/absent = not pinned. Server caps a
   *  caller at 3 pinned chats and answers 409 past it. */
  pinnedAt?: string | null;
  /** Whether the caller has favorited this chat. Absent/false = not a favorite. */
  favorite?: boolean;
  /** Whether the caller has muted this chat (any thread). Absent/false = not
   *  muted. Suppresses push notifications for new messages in this thread
   *  (`push` module only pushes to unmuted recipients) and drives the row's
   *  mute indicator; unread counting/badges are unaffected. */
  muted?: boolean;
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
  /** True for a DM where the two are NOT accepted connections (PRD-220) — e.g.
   *  a housing/flatmate enquiry that opened the thread cold. The ordinary send
   *  path refuses every message past the enquiry itself, from either side, so
   *  the composer must render a connection-request affordance instead of a
   *  normal input. Always false for official/group threads. Absent on an
   *  older cached response is treated as false (no gate) client-side. */
  replyRequiresConnection?: boolean;
  /** `direct` (1:1 DM / official) or `group` (member-created, titled,
   *  multi-participant). DMs stay `direct` and render exactly as before. */
  kind: "direct" | "group";
  /** Group name (null for DMs — their name is the counterpart's). */
  title: string | null;
  /** Group avatar URL (null for DMs). */
  avatarUrl: string | null;
  /** Saved reframe crop for `avatarUrl` (fractions of the source image),
   *  when the group's avatar was cropped in the reframe editor. Null/absent
   *  for DMs and for an uncropped group avatar. */
  avatarCrop?: CropRect | null;
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

/**
 * POST /messages/request response — a first-contact message to a member by
 * handle. When the two are already accepted connections the body was
 * delivered as an ordinary message and `conversationId` is set; otherwise the
 * body seeds a connection request instead (materializing the conversation
 * only once the recipient accepts) and `connectionRequestId` is set. Exactly
 * one of the two is non-null. `message` (the backend's internal `MessageView`
 * shape) is deliberately omitted here — the client already knows what it
 * sent and only needs to know which of the two outcomes happened.
 */
export interface MessageRequestResponse {
  conversationId: string | null;
  connectionRequestId: string | null;
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
  /** The byline's own portrait, or the linked member's avatar as a fallback. */
  avatarUrl: string | null;
  /**
   * CON-11 — the member profile slug this byline is linked to, or `null` for
   * a contributor credited by name only. Bylines link to `/members/<slug>`
   * when it is set and to the magazine author page when it is not.
   */
  memberSlug: string | null;
  /** Published pieces carrying this byline. */
  pieceCount: number;
}

export interface IssueResponse {
  number: string;
  title: string;
  dek: string;
  publishedOn: string | null;
  coverUrl: string | null;
}

/**
 * `GET /magazine/articles` query params: `issue`, `tag`, `author`, `section`,
 * `page`, and (CON-12) `q`.
 *
 * `q` is free-text search over the magazine's own archive, matched against
 * `magazine_article.search_vector` — a generated `tsvector` covering the
 * title, dek, standfirst, tags, and both body representations (the legacy
 * `body` text and the block-editor `blocks` jsonb). Results come back ranked
 * by relevance (`ts_rank_cd`, headline matches weighted above body mentions)
 * with publish date as the tiebreaker, so a `q` search does NOT answer in
 * publish order the way every other filter does. Every token is prefix-matched
 * and the tokens are AND-ed. The response shape is the ordinary
 * `Paginated<ArticleListItem>`.
 */
export interface ArticleListItem {
  slug: string;
  title: string;
  dek: string;
  author: AuthorSummary;
  issueNumber: string | null;
  tags: string[];
  readMinutes: number;
  publishedAt: string | null;
  /** CON-04 — the piece's lead art, resolved to a fetchable URL. `null` when
   *  the desk commissioned none, in which case the card keeps its tinted
   *  `ImageSlot` placeholder rather than standing in a stock photograph. */
  heroImageUrl: string | null;
  /** CON-16 — where this piece stands today, so a card can mark an archived
   *  or superseded piece instead of presenting it as current. */
  lifecycle: ArticleLifecycle;
  /** CON-16 — the language this row is written in. An issue is often only
   *  partly translated, so each row states its own. */
  locale: ContentLocale;
}

/**
 * CON-16 — where a published piece stands, independent of whether it is
 * published at all. `published_at` alone answered "is this visible?", so the
 * only way to retire a piece was to unpublish it, which also deleted it from
 * the archive and broke every link anyone had shared.
 *
 *  - `live` — current; the desk stands by it as written.
 *  - `under_review` — being re-checked against the law or service as they
 *    stand now; parts may already be out of date.
 *  - `archived` — of its time, kept as a record, no longer maintained.
 *  - `superseded` — a newer piece replaces it.
 *
 * Never a reason to hide a row: every public read still returns archived and
 * superseded pieces, and the reader gets a dated banner instead of a 404.
 */
export type ArticleLifecycle =
  "live" | "under_review" | "archived" | "superseded";

/** CON-16 — the languages the magazine publishes journalism in. Mirrors the
 *  chrome's `Language` union, so a reader's interface language is directly
 *  usable as a content language. */
export type ContentLocale = "en" | "pt";

/** CON-16 — the rest of the dated lifecycle banner (the state itself is the
 *  article's `lifecycle`). */
export interface ArticleLifecycleNotice {
  /** The editor's own sentence, or `""` when the banner falls back to the
   *  generic wording for the state. */
  note: string;
  /** ISO 8601 instant the piece entered this state, or null. The DATE in
   *  "dated banner": the reader is told when the desk last looked. */
  changedAt: string | null;
  /** YYYY-MM-DD, or null when no re-review is scheduled. */
  reviewDueOn: string | null;
  supersededBy: { slug: string; title: string } | null;
}

/**
 * CON-16 — one language a piece is readable in, for the article page's
 * switcher. Always includes the piece the reader is on, so the switcher can
 * render a selected option without a special case.
 *
 * A translation is a first-class article: its own row, slug, publish state,
 * lifecycle and comments, linked to the original through `translation_of`.
 * `GET /magazine/articles/:slug?lang=xx` resolves to the sibling in that
 * language when one is published and returns the piece as written otherwise.
 */
export interface ArticleTranslationLink {
  locale: ContentLocale;
  slug: string;
  title: string;
  /** False for a translation drafted but not shipped: the switcher shows it
   *  as in progress rather than linking the reader to a 404. */
  isPublished: boolean;
}

/** CON-02 — a published correction, shown as a dated note at the foot of the
 *  piece. The desk's promise is "we never edit silently". */
export interface ArticleCorrection {
  id: string;
  text: string;
  /** YYYY-MM-DD. */
  publishedOn: string;
}

export interface ArticleResponse extends ArticleListItem {
  body: string;
  /** CON-06 — the care-tab content notes the publish gate insists on. */
  contentNotes: string[];
  /** CON-02 — newest first, empty when the piece has never been corrected. */
  corrections: ArticleCorrection[];
  /** CON-17 — the SEO rail's fields, served so `PageMeta` can use them.
   *  Empty/null falls back to the derived description, hero image and route. */
  metaDescription: string;
  socialImage: string | null;
  canonicalUrl: string;
  /** CON-04 — the reframe crop saved for `heroImageUrl`. Rendered as a FOCAL
   *  POINT (`ImageSlot`'s `focus`), never as an exact frame: the hero is a
   *  full-bleed banner whose box aspect never matches an arbitrary crop, and
   *  `crop` would distort the art there. */
  heroCrop?: CropRect;
  /** CON-16 — the dated lifecycle banner's data. Always present; a `live`
   *  piece draws no banner. */
  lifecycleNotice: ArticleLifecycleNotice;
  /** CON-16 — every language this piece is readable in, the current one
   *  included. One entry means there is no translation. */
  translations: ArticleTranslationLink[];
  /** CON-16 — the original this piece translates, or null when it IS the
   *  original. */
  translationOf: { locale: ContentLocale; slug: string } | null;
  /** CON-16 — the translator's byline. `author` stays the writer's, always:
   *  a translator is a second contributor with their own credit. */
  translator: AuthorSummary | null;
}

/** The staff verdict on a reader's story. Deliberately separate from
 *  `SubmissionStatus`: `accepted` and `commissioned` are both a yes and both
 *  land `status` on `accepted`, differing only in whether the piece also
 *  entered the desk's pitch inbox. */
export type SubmissionDecision = "accepted" | "declined" | "commissioned";

export interface StorySubmissionResponse {
  id: string;
  format: string;
  workingTitle: string;
  pitch: string;
  deck: string | null;
  coverUrl: string | null;
  status: SubmissionStatus;
  decision: SubmissionDecision | null;
  /** The reply the decider wrote back. There is no email in this product, so
   *  this and the in-app bell are how a submitter hears. */
  decisionNote: string | null;
  decidedAt: string | null;
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
  /** Optional moderator note explaining why the thread was locked. Null when
   *  the current lock (or the thread's unlocked state) carries no note. */
  lockReason: string | null;
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
  /** Whether the viewer may pin/unpin this thread — a plain moderator check,
   *  same shape as `canLock`. */
  canPin: boolean;
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

/** One block of an editor-authored guide body. Plain text: the renderer
 *  prints it, so there is no markup for an editor to get wrong. */
export type GuideBlockKind = "paragraph" | "subheading" | "listItem" | "note";

export interface GuideBlock {
  kind: GuideBlockKind;
  text: string;
}

/** One H2 section of a guide body, plus its ordered blocks. */
export interface GuideSection {
  id: string;
  heading: string;
  blocks: GuideBlock[];
}

export interface ResourceResponse {
  slug: string;
  category: string;
  title: string;
  description: string;
  body: string;
  externalUrl: string | null;
  /** ISO timestamp of the last editorial verification, or null if never verified. */
  lastVerifiedAt: string | null;
  /** Portuguese copy, or null when the guide has no translation yet. */
  titlePt: string | null;
  descriptionPt: string | null;
  /** The editor-authored prose. EMPTY means the guide is metadata-only and
   *  the frontend keeps rendering its hardcoded page. */
  sections: GuideSection[];
  sectionsPt: GuideSection[] | null;
  /** Site-relative path the guide is addressable at, e.g. "/resources/sober". */
  routePath: string | null;
  /** ISO date (YYYY-MM-DD) an editor last read the guide end to end, who
   *  that was, and when it is due again. All null means never reviewed. */
  lastReviewedOn: string | null;
  reviewedBy: string | null;
  reviewDueOn: string | null;
}

/** Compact row for the guide index: every published guide, one request. */
export interface ResourceIndexEntryResponse {
  slug: string;
  category: string;
  title: string;
  description: string;
  routePath: string | null;
  lastReviewedOn: string | null;
  isManaged: boolean;
}

export interface GlossaryTermResponse {
  slug: string;
  term: string;
  definition: string;
  /** Portuguese definition, or null when the term has no translation yet. */
  definitionPt: string | null;
  category: string | null;
}

// --- Feed (read-time aggregation) ---

/** `new_member` backs the "People" tab: a recently-joined active member,
 *  surfaced by `NewMemberCard`. It carries no fields beyond the shared
 *  `FeedItem` shape — see the field mapping below.
 *
 *  `article` (PRD-107) is a published magazine piece: `title` is the headline,
 *  `summary` the dek, and `link` the piece's own path. The magazine furniture
 *  the feed card also renders (kicker, section, read minutes, lead art, byline)
 *  is the feed's alone and stays declared in `features/feed/api/feed.api.ts`. */
export type FeedItemType =
  "community_post" | "forum_thread" | "gathering" | "new_member" | "article";

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
  /** `forum_thread` only (PRD-167) — the opening post's own words, HTML
   *  stripped, whitespace collapsed and cut to 180 characters on a word
   *  boundary with a trailing ellipsis. Null when the opening post is
   *  tombstoned, missing, hidden, or strips down to nothing at all (an
   *  image-only post), in which case the card renders no preview rather than an
   *  empty one. Absent for every other item type. */
  excerpt?: string | null;
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
