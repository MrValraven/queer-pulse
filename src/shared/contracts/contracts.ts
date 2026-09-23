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
  /** Messaging only (ENG-243): true for the author of a message whose sender
   *  erased their account. `handle` is empty and `avatarUrl` null; render a
   *  localized "Former member" with a neutral avatar and no profile link. */
  isFormerMember?: boolean;
  /** Business mailboxes: the identity this summary was built for. Present on
   *  a sender, counterpart or claimant the server resolved through an
   *  identity; absent on the older profile-only summaries. */
  identityId?: string;
  /** The kind of `identityId`, with the same presence rule. */
  identityKind?: IdentityKind;
  /** A business reply's staff first name. Present only when both
   *  attribution switches allow this reader to see it, or the reader is
   *  staff of the same mailbox; never a blank string. Never set on a
   *  profile summary. */
  staffFirstName?: string;
  /** True for a message sent as a business, persona or company that has
   *  since been deleted: `handle` is empty, `avatarUrl` null, and
   *  `displayName` is the English fallback "Former business". Distinct from
   *  `isFormerMember`, which is about a human's own erased account. */
  isFormerIdentity?: boolean;
}

/** The kind of identity a message can be sent as, and a mailbox belongs to:
 *  the member's own profile, a persona (`subprofile`), a directory listing,
 *  or a company. */
export type IdentityKind = "profile" | "subprofile" | "listing" | "company";

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

/** One member's reaction on a message, for the "who reacted" sheet (PRD-352).
 *  Fetched lazily from `GET /conversations/:id/messages/:messageId/reactions`
 *  and never carried on `MessageResponse`. */
export interface MessageReactor {
  key: MessageReactionKey;
  member: AuthorSummary;
  /** The signed-in member's own reaction, which the sheet offers to remove. */
  isMine: boolean;
  /** When the reaction was made. Null until the backend records it. */
  reactedAt: string | null;
}

export interface MessageReactorsResponse {
  reactors: MessageReactor[];
}

/** Mirrors `StickerAttachment` in the backend's `message.entity.ts`: the
 *  third shape a `MessageResponse.attachment` jsonb column can hold,
 *  discriminated from the other two by `provider === "sticker"`. */
export interface StickerAttachmentResponse {
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  provider: "sticker";
  stickerId: string;
  label: string;
}

/** Every system event type this client renders a dedicated sentence for. See
 *  `MessageResponse.systemEvent.type`'s own doc for what happens to a type
 *  outside this list. */
export type KnownSystemEventType =
  | "group_created"
  | "member_added"
  | "member_removed"
  | "member_left"
  | "group_renamed"
  | "member_promoted"
  | "member_demoted"
  | "owner_changed"
  | "group_photo_changed"
  | "group_description_changed"
  | "member_joined"
  | "group_dissolved"
  | "moved_to_business_mailbox";

// PRD-375: a message page persisted offline carries this shape verbatim; bump
// MESSAGING_CACHE_SCHEMA_VERSION (messagingCacheSelection.ts) if it changes.
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
    /** ENG-243: the quoted message's author erased their account; render the
     *  localized "Former member" label in place of `senderName`. Optional so
     *  an older cached response still parses. */
    senderIsFormerMember?: boolean;
    deleted: boolean;
    /** The quoted parent's own kind, reported even when it is deleted. */
    kind: "user" | "system" | "gif" | "image" | "document" | "sticker";
    /** The parent's resolved preview URL for a `gif`/`image`/`sticker`, else
     *  null (and null once the parent is deleted or taken down). */
    thumbnailUrl: string | null;
    /** The parent document's file name, else null (and null once the parent
     *  is deleted or taken down). */
    fileName: string | null;
  } | null;
  /** `user` (an ordinary bubble), `system` (a rendered event pill), `gif` (a
   *  picked provider GIF) and `image` (a member-uploaded photo), which both
   *  render as an inline-image bubble, `document` (a member-uploaded
   *  PDF/spreadsheet/text file, PRD-226), which renders as a file-card
   *  bubble, or `sticker` (a published catalogue sticker), which renders as
   *  a sticker bubble. Every DM message is `user`, so the existing bubble
   *  path is unchanged. */
  kind: "user" | "system" | "gif" | "image" | "document" | "sticker";
  /** The media attachment for a `kind:"gif"`/`kind:"image"` (inline image),
   *  `kind:"document"` (file-card), or `kind:"sticker"` message, else null.
   *  `body` carries a "GIF"/"Photo"/"Document"/"Sticker" text fallback so
   *  previews/notifications keep working. */
  attachment:
    | {
        url: string;
        previewUrl: string;
        width: number;
        height: number;
        provider: string;
        /** The sender's caption, when one was written. */
        caption?: string | null;
      }
    | {
        url: string;
        fileName: string;
        byteSize: number;
        contentType: string;
        provider: string;
        /** The sender's caption, when one was written. */
        caption?: string | null;
      }
    | StickerAttachmentResponse
    | null;
  /** Resolved system event for a `system` message (else null). Actor/target come
   *  back as DISPLAY NAMES (never user ids); the client renders bilingual
   *  templates. `value` carries a scalar the event needs (e.g. a new title). */
  systemEvent: {
    /** A newer server may send a type this client has never heard of (e.g. a
     *  migration that starts writing an event before the client that renders
     *  it ships); the adapter always folds anything outside
     *  `KnownSystemEventType` into `"unknown"` before it reaches the
     *  `default` branch. */
    type: KnownSystemEventType | (string & {});
    actorName: string;
    targetName: string | null;
    /** For `member_joined`: `"link"` (the invite-link path) or `"invite"` (an
     *  accepted group invite). Null for every other event type. */
    value: string | null;
    /** True when the SIGNED-IN member is the actor: the client swaps to
     *  "You …" phrasing instead of naming them. Optional-tolerant: absent on
     *  an older cached response, which the adapter falls back to computing
     *  from the sender handle for (see `messageToChat`). */
    actorIsMe?: boolean;
    /** True when the SIGNED-IN member is the TARGET (e.g. the one added,
     *  removed, promoted, demoted or made owner): the client swaps to "…
     *  you" phrasing instead of naming them. Optional-tolerant: absent/undefined
     *  on an older cached response or an event with no target, which the
     *  adapter treats as false. */
    targetIsMe?: boolean;
    /** Actor's public profile handle, absent on a room broadcast the actor
     *  cannot be identified against (e.g. a stale cache). The adapter falls
     *  back to it when `actorIsMe` itself is absent. */
    actorHandle?: string | null;
    /** Target's public profile handle, null when the event has no target.
     *  The adapter falls back to it when `targetIsMe` itself is absent. */
    targetHandle?: string | null;
    /** `moved_to_business_mailbox` only: the business the thread moved
     *  into, resolved on every read (thread pages and the inbox preview
     *  alike) so a later rename shows everywhere, and "Former business" once
     *  it no longer resolves. */
    mailboxName?: string;
    /** `moved_to_business_mailbox` only: true when the business no longer
     *  resolves, so `mailboxName` holds the fallback label. */
    isFormerMailbox?: boolean;
  } | null;
  /** Business mailboxes: present only on a business reply read by staff of
   *  the business that sent it. True when this viewer typed it, false when a
   *  colleague did. Absent on every other row (personal messages, the
   *  customer's view, system rows, group threads). Carried by thread reads,
   *  send responses, per-viewer socket frames and the inbox preview
   *  (`ConversationResponse.lastMessage`), under the same rule. */
  isSentByViewer?: boolean;
}

export type ConversationRole = "owner" | "admin" | "member";

/** One member of a GROUP conversation (empty for DMs). `id` is the user id. */
export interface ConversationMemberSummary {
  id: string;
  /** Profile handle (slug), member link + avatar tint seed. */
  handle: string;
  name: string;
  avatarUrl: string | null;
  role: ConversationRole;
  /** This member's read watermark (ISO), else null. The client computes
   *  "Seen by N" by comparing it against a message's timestamp (no per-message
   *  receipts fetch). */
  lastReadAt?: string | null;
  /** This member's delivered watermark (ISO), else null (one rung below read). */
  deliveredAt?: string | null;
  /** PRD-351: the real INSTANT this member last read (distinct from the
   *  `lastReadAt` watermark above, which is a message timestamp, not the
   *  moment of reading). Null for a member who has never read, and withheld
   *  under the same read-receipt privacy gate as `lastReadAt`. */
  lastReadInstant?: string | null;
}

/**
 * ENG-253: the trimmed avatar-stack preview `ConversationResponse.
 * memberPreview` carries INSTEAD of the full `members` roster on an inbox
 * list row. Enough to render group avatars; never a role or a
 * read/delivered watermark, which the inbox list never rendered. Populated
 * for a group on every `ConversationResponse` (list and single-conversation
 * alike), capped server-side at a small avatar-stack size. Empty for DMs.
 */
export interface ConversationMemberPreview {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
}

/** One outstanding invite on a group's `ConversationResponse.pendingInvites`
 *  (owner/admin only, else always `[]`). Distinct from `GroupInviteSummary`
 *  below, which is the INVITEE's own `GET /group-invites` row. */
export interface ConversationPendingInvite {
  id: string;
  user: Pick<ConversationMemberSummary, "id" | "handle" | "name" | "avatarUrl">;
  createdAt: string;
}

/** PRD-353: who may add the caller to a group directly. `"connections"`
 *  (default): an owner/admin who is an accepted connection may seat the
 *  caller directly. `"invite_only"`: every add becomes an invite the caller
 *  accepts or declines. There is deliberately no third "everyone" value: only
 *  accepted connections of the adder can ever be added or invited. */
export type GroupAddPolicy = "connections" | "invite_only";

/**
 * PRD-366: who may send the caller a new message/connection request.
 * `"everyone"` (default): today's profile-visibility rules, unchanged.
 * `"introduced"`: a new request needs a mutual-connection introducer
 * regardless of visibility. `"connections"`: every new message/connection
 * request is refused — except an enquiry about the caller's own published
 * listing, which always still reaches them. Enforced server-side
 * (`ConnectionsService.resolveRequestGate`); this type only names the choice.
 */
export type WhoCanMessage = "everyone" | "introduced" | "connections";

/** GET /conversations/group-invites row: one pending invite ADDRESSED TO the
 *  caller, grouped by the group it invites them into. */
export interface GroupInviteSummary {
  id: string;
  conversationId: string;
  title: string | null;
  avatarUrl: string | null;
  memberCount: number;
  inviter: AuthorSummary;
  createdAt: string;
}

/** GET /conversations/join/:token: a preview of the group an invite link
 *  points at, shown before the caller decides to join. */
export interface GroupJoinPreview {
  conversationId: string;
  title: string | null;
  avatarUrl: string | null;
  description: string | null;
  memberCount: number;
  isMember: boolean;
}

// PRD-375: the inbox persisted offline carries rows in this shape verbatim;
// bump MESSAGING_CACHE_SCHEMA_VERSION (messagingCacheSelection.ts) if it changes.
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
  /** When a TIMED mute (PRD-349) expires. Null while `muted` is false, and
   *  also null while `muted` is true but the caller chose "Always" (there is
   *  no separate forever sentinel). Absent/null = not muted, or muted
   *  forever. */
  mutedUntil?: string | null;
  /** PRD-349: the caller's own mute MODE, a second axis independent of
   *  `muted`/`mutedUntil` above. `"all"` (absent reads the same) is the
   *  ordinary ladder those two fields already govern; `"mentionsOnly"` means
   *  this caller never gets the plain "new message" push for this thread (an
   *  `@`-mention still reaches them) regardless of `muted`'s own value — the
   *  two axes can coexist rather than collapsing into one. Mapped onto the
   *  `Conversation` view model in this feature's `messages.adapters.ts`. */
  muteMode?: "all" | "mentionsOnly";
  /** PRD-348: whether an UNREAD message in this thread `@`-mentions the
   *  caller, server-computed from the caller's own read watermark. */
  hasUnreadMention?: boolean;
  /** ISO timestamp THIS caller archived the thread out of their main inbox.
   *  Null/absent = not archived. Auto-cleared server-side the instant a new
   *  message lands. */
  archivedAt?: string | null;
  /** ISO timestamp THIS caller explicitly marked the thread unread from the
   *  inbox row menu (PRD-225). Null/absent = not manually marked unread.
   *  Independent of `unreadCount`: a genuinely-read thread can still carry
   *  this until the caller re-opens it. */
  markedUnreadAt?: string | null;
  /**
   * THIS caller's own unsent composer text for the thread, synced across
   * devices. Null/absent = no stored draft.
   *
   * ENG-253: no longer sent on an inbox LIST row (`GET /conversations`),
   * where it can run to 5000 characters and only a short preview is ever
   * rendered. Present in full only on `GET /conversations/:id` (the
   * single-conversation read path) and on responses that already returned
   * full detail before ENG-253 (create/leave/add-member/etc.). A list row
   * instead carries `draftPreview`/`hasDraft` below, which ARE present on
   * every response shape, list and single-conversation alike.
   */
  draft?: string | null;
  /** ENG-253: the first 120 characters of `draft`, present wherever `draft`
   *  itself would have been considered (list and single-conversation alike).
   *  Enough for the inbox row's own draft preview without shipping the full
   *  body on every refetch. Null exactly when `hasDraft` is false. */
  draftPreview?: string | null;
  /** ENG-253: whether a draft is currently stored at all. Lets the client
   *  show the "Draft" label/badge without inspecting `draftPreview`'s length. */
  hasDraft?: boolean;
  /** THIS caller's own read watermark (ISO), for placing the "New messages"
   *  divider on open: every message after it that the caller did not send is
   *  unread. Null when the caller has never read the thread. */
  myLastReadAt: string | null;
  /** The OTHER participant's read watermark (ISO), for "Seen" receipts. Null for
   *  official/group threads or a counterpart who has never read. */
  otherLastReadAt: string | null;
  /** PRD-351: the OTHER participant's real read INSTANT (ISO), distinct from
   *  the watermark above (`otherLastReadAt` is a message timestamp, not the
   *  moment of reading). Drives the message info sheet's "Read" row with an
   *  actual time instead of no time at all. Null under the exact same
   *  conditions as `otherLastReadAt`. */
  otherLastReadInstant?: string | null;
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
  /** PRD-340: the one-tap-reply state of a DM the two aren't accepted
   *  connections in, from the caller's side: `"open"` (an ordinary send will
   *  succeed), `"awaitingTheirReply"` (the caller started it and is waiting on
   *  the other side's first reply), or `"needsConnection"` (the original
   *  rule, neither side may send). Absent for official/group threads or an
   *  older cached response; treat a missing value as `"open"`. */
  replyGate?: "open" | "awaitingTheirReply" | "needsConnection";
  /** True for the QueerPulse official thread. A `direct` thread whose
   *  `otherParticipant` is null and that is NOT official lost its counterpart
   *  to account erasure and renders as a former member. Absent on an older
   *  response, where a null counterpart still means official. */
  isOfficial?: boolean;
  /** ISO timestamp the caller and a DM's counterpart became accepted
   *  connections (DES-225). Null for groups, official threads and a DM
   *  between members who aren't connected; absent on an older response. */
  connectedSince?: string | null;
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
  /** Active member count for a group; 0 for DMs. Always the true count,
   *  independent of how many rows `members`/`memberPreview` actually carry. */
  memberCount: number;
  /**
   * Group member roster with role and per-member read/delivered watermarks
   * (empty for DMs). ENG-253: no longer populated on an inbox LIST row
   * (`GET /conversations`); only non-empty on `GET /conversations/:id` (the
   * single-conversation read path) and on responses that already returned
   * full detail before ENG-253 (create/leave/add-member/role-change/etc.). A
   * list row gets `[]` here and reads `memberPreview` below for its avatar
   * stack instead.
   */
  members: ConversationMemberSummary[];
  /** ENG-253: the lightweight avatar-stack preview, populated for a group on
   *  EVERY response shape (list and single-conversation alike). See
   *  `ConversationMemberPreview`'s own doc. Empty for DMs. */
  memberPreview?: ConversationMemberPreview[];
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
  /** GROUP only (PRD-358): the group's description, editable by owner/admin.
   *  Null for DMs and for a group with no description set. */
  description?: string | null;
  /** GROUP only (PRD-357): ISO timestamp the group was dissolved. Once set,
   *  the group is read-only for every former participant. Null while active;
   *  absent for DMs. */
  dissolvedAt?: string | null;
  /** GROUP only, THIS caller (DES-227): why the composer is severed:
   *  `"left"` (voluntary), `"removed"` (an owner/admin removed them), or
   *  `"dissolved"` (the owner ended the group). Null while the caller is an
   *  active member; absent for DMs. Drives `ComposerSeveredNotice`'s copy. */
  leftReason?: "left" | "removed" | "dissolved" | null;
  /** GROUP only (PRD-358): the group's revocable invite-link token. Only ever
   *  set for the owner/admin who may manage it; null for every other member
   *  and for a group with no active link. Absent for DMs. */
  inviteToken?: string | null;
  /** GROUP only: whether THIS caller may create/rotate/disable the invite
   *  link, gated on being owner/admin with the group active and not
   *  dissolved. Absent/false for DMs and a member who has left. */
  canManageInviteLink?: boolean;
  /** GROUP only: whether THIS caller (the owner) may transfer ownership,
   *  gated on the group being active and not dissolved. Absent/false for
   *  DMs, non-owners, and a member who has left. */
  canTransferOwnership?: boolean;
  /** GROUP only: whether THIS caller (the owner) may dissolve the group,
   *  gated on it being active and not already dissolved. Absent/false for
   *  DMs, non-owners, and a member who has left. */
  canDissolve?: boolean;
  /** GROUP only, owner/admin (PRD-353): invites still awaiting a response.
   *  Always `[]` for a non-owner/admin, a DM, or a member who has left. */
  pendingInvites?: ConversationPendingInvite[];
  /** Business mailboxes: the business, persona or company identity this
   *  thread belongs to, the mailbox the claim routes act on. Present for a
   *  direct, non-official thread with a business side, for staff and
   *  customer alike; absent on a member-to-member DM, a group and an
   *  official thread. */
  mailboxIdentityId?: string;
  /** STAFF ONLY: the staff member holding this thread, as their own profile
   *  summary. Null while unclaimed, and always null for a customer. Absent
   *  where the read resolved no mailbox for the row. */
  claimedBy?: AuthorSummary | null;
  /** STAFF ONLY: when the current claim was taken. Null while unclaimed and
   *  for a customer. */
  claimedAt?: string | null;
  /** STAFF ONLY: the current claimant's user id, the `fromUserId` a
   *  colleague passes to take the thread over. Null while unclaimed and for
   *  a customer. */
  claimedByUserId?: string | null;
  /** STAFF ONLY: who last released the claim. Null when nobody has, when a
   *  claim has been taken since, after a system release, and for a
   *  customer. */
  claimReleasedBy?: AuthorSummary | null;
  /** STAFF ONLY: when `claimReleasedBy` released it. Null for a customer. */
  claimReleasedAt?: string | null;
  /** STAFF ONLY: the colleague the current claimant took the thread over
   *  from. Null for an ordinary claim, while unclaimed, and for a customer. */
  claimTakenOverFrom?: AuthorSummary | null;
}

/**
 * ENG-253: `GET /conversations` (the inbox) now returns one cursor-paginated
 * page of this shape, replacing the previous bare `ConversationResponse[]`.
 * `data` is this page's rows, most-recently-active first; `pageInfo` is the
 * shared `PageInfo` envelope (`nextCursor`/`hasMore`) every other
 * cursor-paginated list in this app already uses, passed back as `?cursor=`
 * for the next page. Every row in `data` is a LIST row: see
 * `ConversationResponse.members`/`.draft`'s own docs for exactly which
 * fields are trimmed relative to `GET /conversations/:id`.
 */
export type ConversationListPage = Paginated<ConversationResponse>;

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
  /** Mirrors `MessageResponse.kind` for this hit's message. */
  kind: "user" | "system" | "gif" | "image" | "document" | "sticker";
  /** Mirrors `MessageResponse.attachment` for this hit's message, null for a
   *  plain-text hit. */
  attachment: MessageResponse["attachment"];
}

/** Per-conversation grouping metadata for search hits: the counterpart (null for
 *  the official/welcome thread OR a group, which renders under its own identity
 *  instead) and `isOfficial` so the client renders the right name/avatar without
 *  a second request. `kind`/`title`/`avatarUrl` mirror `ConversationResponse`'s
 *  own fields so a hit inside a GROUP conversation labels under the group's own
 *  name/avatar rather than an arbitrary member's. */
export interface MessageSearchConversationGroup {
  conversationId: string;
  otherParticipant: AuthorSummary | null;
  isOfficial: boolean;
  /** `direct` (DM/official) or `group` — mirrors `ConversationResponse.kind`. */
  kind: "direct" | "group";
  /** Group name, null for a DM/official thread. */
  title: string | null;
  /** Group avatar URL, null for a DM/official thread. */
  avatarUrl: string | null;
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
 *  plus the per-conversation grouping metadata (reused from search).
 *
 *  PRD-374: keyset-paginated. `nextCursor` is the opaque cursor for the next
 *  older page, null once the last page is reached; `hasMore` is the same
 *  fact as a plain boolean, so a caller doesn't need to null-check the
 *  cursor just to decide whether to show a "Load more" affordance. */
export interface StarredMessagesResponse {
  items: StarredMessageHit[];
  conversations: MessageSearchConversationGroup[];
  nextCursor: string | null;
  hasMore: boolean;
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

/** One block of an editor-authored guide body. Paragraph, listItem and note
 *  blocks may carry sanitized inline HTML in `html` (em, strong, a, br),
 *  sanitized by the backend on write and by the frontend on read. Subheadings
 *  are always plain text. */
export type GuideBlockKind = "paragraph" | "subheading" | "listItem" | "note";

export interface GuideBlock {
  kind: GuideBlockKind;
  /** Plain text. Always present; the backend derives it from `html`. */
  text: string;
  /** Sanitized inline HTML (em, strong, a, br) on paragraph, listItem and
   *  note blocks written by the guide workspace. Absent on older blocks,
   *  which render from `text`. */
  html?: string;
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

// --- Stickers ---

/** Mirrors `StickerResponse` in the backend's `src/stickers/sticker-response.ts`.
 *  One sticker as the composer picker needs it. `url` is already a fully
 *  resolved URL, never a bare storage key. */
export interface StickerResponse {
  id: string;
  slug: string;
  label: string;
  url: string;
  width: number;
  height: number;
  keywords: { en: string[]; pt: string[] };
}

/** Mirrors `StickerPackResponse` in the backend's
 *  `src/stickers/sticker-response.ts`. `GET /sticker-packs` returns every
 *  published pack in this shape. */
export interface StickerPackResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverStickerId: string | null;
  stickers: StickerResponse[];
}

/** Mirrors the admin sticker shape from the backend's admin `sticker-packs`
 *  module (`POST/PATCH /admin/sticker-packs/:packId/stickers`): the public
 *  sticker plus the template it was drawn with and its position in the pack,
 *  so the builder can tell which flag a sticker came from and redraw it. */
export interface AdminStickerResponse extends StickerResponse {
  templateId: string;
  templateParams: Record<string, unknown>;
  sortOrder: number;
}

/** Mirrors the admin sticker pack response from the backend's admin
 *  `sticker-packs` module (`GET/POST/PATCH /admin/sticker-packs`): the same
 *  pack shape plus the moderation/ordering fields only the builder needs,
 *  with every sticker in its admin shape. */
export type AdminStickerPackResponse = Omit<StickerPackResponse, "stickers"> & {
  status: "draft" | "published" | "archived";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  stickers: AdminStickerResponse[];
};

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
