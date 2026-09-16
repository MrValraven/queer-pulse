import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import type {
  ConversationPendingInvite,
  ConversationRole,
  ReactionSummary,
} from "../../shared/contracts/contracts";
import {
  anikaConversation,
  bilalConversation,
  jordanConversation,
  kaiConversation,
  marcoConversation,
  noahConversation,
  priyaConversation,
  teamConversation,
  tomasConversation,
  yusufConversation,
} from "./demoDirectThreads.data";
import {
  bookSwapConversation,
  brunchCrewConversation,
  portoMentorsConversation,
  prideVolunteersConversation,
} from "./demoGroupThreads.data";
import { mariaConversation } from "./demoLongThread.data";

/** The resolved system-event a `kind: "system"` message renders as a centred
 *  pill. Names are already resolved (never user ids); the pill text is built
 *  bilingually on the client from `type` + these names. */
export interface ChatSystemEvent {
  type:
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
    | "group_dissolved";
  actorName: string;
  targetName?: string | null;
  /** For `member_joined`: `"link"` (the invite-link path) or `"invite"` (an
   *  accepted group invite). Absent for every other event type. */
  value?: string | null;
  /** True when the signed-in member is the actor: lets the pill read "You
   *  created the group" rather than the actor's name. */
  actorIsMe?: boolean;
  /** True when the signed-in member is the TARGET (e.g. the one added,
   *  removed, promoted, demoted or made owner): lets the pill read "…you"
   *  rather than the target's name. Absent/false when the event carries no
   *  target, or the target isn't the viewer. */
  targetIsMe?: boolean;
}

/** One member of a GROUP thread, for the header/info roster + bubble avatars. */
export interface GroupMemberView {
  /** User id (live) — correlates presence + the leave/remove/role calls. Absent in demo. */
  id?: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
  role: ConversationRole;
  /** Profile slug (live) for the member link. Absent for demo/unknown. */
  slug?: string;
  /** This member's read watermark (ISO) — drives "Seen by N" (a member has seen
   *  a message when this is at-or-after its timestamp). Absent = never read. */
  lastReadAt?: string;
  /** This member's delivered watermark (ISO), one rung below read. */
  deliveredAt?: string;
}

export interface ChatMessage {
  from: "me" | "them";
  text: string;
  time?: string;
  /** `"system"` renders a centred event pill (see `systemEvent`); `"gif"` and
   *  `"image"` both render an inline image (see `attachment`, distinguished
   *  only for copy/analytics — the bubble markup is identical either way);
   *  `"document"` renders a file-card (name, format, size, a download link —
   *  PRD-226); absent/`"user"` is an ordinary bubble. */
  kind?: "user" | "system" | "gif" | "image" | "document";
  /** Resolved system event for a `kind: "system"` message. */
  systemEvent?: ChatSystemEvent;
  /** The media/document attachment a `kind:"gif"`/`kind:"image"`/
   *  `kind:"document"` bubble RENDERS. Absent for text/system messages.
   *  `text` holds a "GIF"/"Photo"/"Document" fallback. For an image or
   *  document message this is the upload's local blob preview while the send
   *  is optimistic (immediately paintable) — see `sendAttachment` for what's
   *  actually sent. */
  attachment?:
    | import("../../shared/api/gifs").GifAttachment
    | import("../../shared/api/documentAttachment").DocumentAttachment;
  /** Client-only: the SEND payload for a `kind:"image"`/`kind:"document"`
   *  optimistic message — the private storage key the upload minted, distinct
   *  from `attachment` (the local blob preview) because the key alone isn't a
   *  fetchable URL to render with. `retrySend`/the offline-outbox replay
   *  resend this, never `attachment`. Absent for a gif (its `attachment`
   *  already IS the real, resendable value) and for every server-derived
   *  message (the server response's `attachment` is already the real,
   *  resolved URL). */
  sendAttachment?:
    | import("../../shared/api/gifs").GifAttachment
    | import("../../shared/api/documentAttachment").DocumentAttachment;
  /** GROUP threads only — the sender's identity for per-run attribution (name
   *  label + avatar above a received run). Absent in DMs, where the header
   *  already identifies the single counterpart. */
  senderName?: string;
  senderHandle?: string;
  senderTint?: AvatarTint;
  senderAvatar?: string;
  /** ENG-243: the sender erased their account. The run renders a localized
   *  "Former member" with a neutral avatar in place of `senderName`, and the
   *  message carries no handle, so nothing links to a profile. */
  isSenderFormerMember?: boolean;
  /** Stable server id for React keys and every per-message action. Live mode
   *  gets it from the DTO; the demo seed carries a readable stable one
   *  (`demo-msg-<thread>-NNN`). Absent only for optimistic messages, which
   *  fall back to their `localId`. */
  id?: string;
  /** ISO timestamp used to break same-sender runs across large time gaps, to
   *  place the unread divider and to derive `time`. Set on live and demo
   *  history; absent on an optimistic send. */
  at?: string;
  /** Delivery state of an optimistic (this-session) send. Absent for server/history
   *  messages, whose state is derived from `at` + the counterpart's watermarks.
   *  `"delivered"`/`"seen"` are only ever set by the DEMO simulation (which has no
   *  server and no watermarks), advancing the local ladder on a timer. */
  status?: "sending" | "sent" | "delivered" | "seen" | "failed";
  /** ISO of the recipient's delivered watermark once it has reached this OWN
   *  outgoing message (live mode, from the DTO) — renders the "double check" on
   *  non-final own bubbles too. Absent when not yet delivered / for received or
   *  demo messages. Distinct from `deletedAt`. */
  deliveredAt?: string;
  /** Client id for an optimistic message, so a failed one can be found + retried. */
  localId?: string;
  /** Whether the offline outbox (`useMessageOutbox`) may automatically replay
   *  this `"failed"` send again on mount / `online` / socket reconnect.
   *  Undefined/`true` = still eligible. `false` = either a PERMANENT
   *  rejection (400/403/404/409/413/422 — e.g. a blocked pair, or a housing
   *  enquiry thread's 403) that can never succeed by resending the same
   *  payload, or a transient failure that already exhausted its automatic
   *  retry budget (`MAX_AUTO_REPLAY_ATTEMPTS` in `useMessageOutbox.ts`). The
   *  bubble still renders `"failed"` either way, and a MANUAL `retrySend`
   *  still attempts it again regardless of this flag — only the unattended
   *  replay loop honours it. Set by `useMessageDeliverCore`'s `onError`. */
  isRetryable?: boolean;
  /** ENG-242: the machine-readable code off a failed send's error body, when
   *  one was present (e.g. `"ACCOUNT_RESTRICTED"` — a moderator `restrict`
   *  action refused this send). Absent for a plain network/timeout failure,
   *  which carries no such code. Lets the failed-send row show an honest,
   *  specific reason instead of a generic "Retry" for a refusal retrying
   *  cannot fix right now — distinct from an auth/session failure, which
   *  never reaches this per-message state at all (it is handled at the
   *  transport/session layer, not rendered on a bubble). Set by
   *  `useMessageDeliverCore`'s `onError`. */
  failureCode?: string;
  /** Count of AUTOMATIC outbox-replay attempts made for this send (mount /
   *  `online` / reconnect only — a manual `retrySend` never advances this).
   *  Bounds a still-transient failure's automatic retries and picks its
   *  backoff delay; absent/0 = never auto-replayed. */
  retryCount?: number;
  /** Epoch ms of the last send attempt (automatic replay OR manual retry) —
   *  the automatic replay loop won't re-attempt before `retryCount`'s backoff
   *  window has elapsed since this, so a burst of reconnects/online events
   *  close together can't hammer the same still-cooling-down entry. Absent =
   *  never attempted. */
  lastAttemptAt?: number;
  /** Per-key reaction counts + whether the signed-in member reacted (live mode,
   *  and on a few demo seed messages). Absent for optimistic messages, which
   *  carry no reactions. */
  reactions?: ReactionSummary[];
  /** ISO timestamp the message was soft-deleted at (live mode, and one demo
   *  tombstone). Absent for a message that hasn't been deleted, and for
   *  optimistic messages. */
  deletedAt?: string;
  /** ISO timestamp of the last edit (live mode). Absent if never edited. */
  editedAt?: string;
  /** The quoted message this one replies to (live mode). Absent if not a reply. */
  replyTo?: {
    id: string;
    snippet: string;
    senderName: string;
    /** ENG-243: the quoted author erased their account. */
    senderIsFormerMember?: boolean;
    deleted: boolean;
    /** The quoted parent's kind (live mode and demo seed quotes). Absent on
     *  optimistic quotes, which only ever carry text. */
    kind?: "user" | "system" | "gif" | "image" | "document";
    /** The parent's gif/image preview URL (live mode), else null/absent. */
    thumbnailUrl?: string | null;
    /** The parent document's file name (live mode), else null/absent. */
    fileName?: string | null;
  };
  /** True when this message was created by forwarding — renders a "Forwarded"
   *  label on the bubble. Absent/false otherwise. */
  forwarded?: boolean;
  /** ISO timestamp the message is pinned in the conversation (SHARED, live).
   *  Absent when not pinned — drives the in-bubble pin indicator. */
  pinnedAt?: string;
  /** Whether the signed-in member has privately starred this message (live).
   *  Absent/false otherwise — drives the owner-only star indicator. */
  starred?: boolean;
  /** Server-authoritative: whether the viewer may pin/unpin this message (live). */
  canPin?: boolean;
  /** Server-authoritative: whether the viewer may edit this message (live) —
   *  author, within the server's edit window, not deleted. Drives the Edit
   *  action; never recomputed client-side at render. The demo seed stamps it
   *  once at load with the server's own rule (`demoTimeline.data.ts`). Absent
   *  for optimistic messages, which have no server id and never reach the
   *  action menu. */
  canEdit?: boolean;
  /** Server-authoritative: whether the viewer may delete this message (live) —
   *  author or platform staff, not already deleted. Drives the Delete action. */
  canDelete?: boolean;
  /** Server-authoritative: whether the viewer may report this message (live) —
   *  not the viewer's own message, not deleted. Drives the Report action. */
  canReport?: boolean;
}

/** PRD-349: this caller's own mute MODE, mirroring the backend's
 *  `ConversationMuteMode` enum as a plain string union (the two repos don't
 *  share types). `"all"` is the ordinary `muted`/`mutedUntil` ladder;
 *  `"mentionsOnly"` means this caller never gets the plain "new message"
 *  push for the thread (an `@`-mention still reaches them), independent of
 *  whatever `muted`/`mutedUntil` are set to. See `Conversation.muteMode`'s
 *  own doc for how the two axes coexist. */
export type ConversationMuteMode = "all" | "mentionsOnly";

export interface Conversation {
  id: string;
  /** Member profile slug of the counterpart — the key a block is stored under.
   *  Absent for official/system threads (QueerPulse Team). */
  slug?: string;
  initials: string;
  tint: AvatarTint;
  /** Counterpart's profile photo (live: from the DTO). Absent → initials avatar. */
  avatarUrl?: string;
  /** Saved reframe crop for `avatarUrl` — GROUP conversations only (a locked
   *  1:1 crop); absent for DMs, where the counterpart's own profile avatar
   *  crop isn't carried on the conversation DTO. */
  avatarCrop?: CropRect;
  name: string;
  pronouns: string;
  connectedSince: string;
  /** Pre-formatted relative/short time label ("14:02", "Mon", "1 Jun") baked
   *  at fetch/patch time, kept for backwards compatibility (`messageCache.ts`'s
   *  `patchConversationPreview` only ever has this shorthand to write, no ISO
   *  timestamp). Rows that also carry `updatedAt` below (live rows and every
   *  demo row) have `MessagesThreadRow` re-derive the label from it at render
   *  time instead, so it never goes stale (e.g. "Today" past midnight). */
  time: string;
  /** ISO timestamp of the conversation's last activity. Live rows get it from
   *  the DTO; demo rows derive it from their newest seeded message. Absent only
   *  on a row a shared cache patch built before this field existed. */
  updatedAt?: string;
  preview: string;
  unread: boolean;
  /** Optional presence — renders a ring on the avatar when true. Absent = unknown, renders nothing. */
  online?: boolean;
  /** Optional precise unread count — renders a badge when > 0. Absent = fall back to the `unread` dot. */
  unreadCount?: number;
  /** ISO timestamp this chat was pinned to the top of the inbox (WhatsApp-style,
   *  CONVERSATION-scoped — distinct from a message's own `ChatMessage.pinnedAt`).
   *  Absent = not pinned. Drives both the pinned-first inbox sort and the row's
   *  pin indicator. Capped at 3 pinned chats server-side (409 past that). */
  pinnedAt?: string;
  /** Whether the signed-in member has favorited this chat. Absent/false =
   *  not a favorite. Drives the row's heart indicator and the Favorites tab. */
  favorite?: boolean;
  /** Whether the signed-in member has muted this chat. Absent/false = not
   *  muted. Suppresses push notifications for new messages here; unread
   *  counting/badges are unaffected (mirrors WhatsApp). Drives the row's
   *  mute indicator. */
  muted?: boolean;
  /** ISO timestamp a TIMED mute (PRD-349) expires, else null/absent for a
   *  plain forever-mute (`muted` above) or no mute at all. Governs the row's
   *  mute indicator independently of `muted` once set: in the future it's
   *  muted with a "Muted until {time}" accessible name; in the past it
   *  renders as unmuted even if `muted` hasn't been cleared server-side yet.
   *  Mapped from `ConversationResponse.mutedUntil` in this feature's
   *  `messages.adapters.ts`. */
  mutedUntil?: string | null;
  /** PRD-349: this caller's own mute MODE, a second axis independent of
   *  `muted`/`mutedUntil` above. Absent reads as `"all"` (the ordinary
   *  ladder those two fields already govern). `"mentionsOnly"` means this
   *  caller never gets the plain "new message" push for this thread (an
   *  `@`-mention still reaches them), regardless of `muted`'s own value: a
   *  thread can be in mentions-only mode while also carrying a plain timed
   *  mute, or carrying none at all. The row/thread menu renders ONE coherent
   *  choice from the two axes together (see `useThreadRowMenuItems.tsx`),
   *  never two competing "muted" states. Mapped from
   *  `ConversationResponse.muteMode` in this feature's `messages.adapters.ts`. */
  muteMode?: ConversationMuteMode;
  /** Whether this viewer was @-mentioned in an unread message in this thread
   *  (PRD-348). Absent/false = no pending mention. Drives the row's `@`
   *  indicator, independent of the plain unread count/badge. Mapped from
   *  `ConversationResponse.hasUnreadMention` in this feature's
   *  `messages.adapters.ts`. */
  hasUnreadMention?: boolean;
  /** The handle of whoever sent `preview`/`lastMessageBody`, letting the row
   *  substitute "You: " for the sender's own name when the viewer sent the
   *  last message (DES-190), in both DMs and groups. Absent when the DTO
   *  predates this field or the thread has no messages yet. */
  lastMessageSenderHandle?: string;
  /** The raw (unprefixed) body of the last message, needed for the "You: "
   *  substitution in a GROUP row, whose `preview` already has the real
   *  sender's first name baked in by `groupPreview`. Absent/ignored for a
   *  `lastMessageIsSystem` row (an event pill has no "sender" to substitute). */
  lastMessageBody?: string;
  /** True when the last message is a rendered system event ("Ana created the
   *  group") rather than a member's own text. The "You: "/status-tick
   *  treatment never applies to it, even when the actor is the viewer. */
  lastMessageIsSystem?: boolean;
  /** ISO timestamp this chat was archived out of the main inbox. Absent/null =
   *  not archived. The reversible replacement for the destructive clear-for-me
   *  as the everyday way to declutter — server auto-clears this the instant a
   *  new message lands (`ConversationParticipant.archivedAt`'s own doc), so an
   *  archived thread can never be the reason a reply goes unseen. Drives the
   *  Archived inbox filter/tab. */
  archivedAt?: string | null;
  /** ISO timestamp this member explicitly marked the chat unread from the row
   *  menu (WhatsApp/Telegram/Signal-style "come back to this"). Absent/null =
   *  not manually marked. Server state (survives navigating away and shows on
   *  other devices) — independent of `unreadCount`: a genuinely-read thread
   *  can still carry this until the member re-opens it, which is the only
   *  thing that clears it. `unread` above already ORs this in. */
  markedUnreadAt?: string | null;
  /** This member's own unsent composer text, synced from whichever device last
   *  wrote it (server cross-device layer). Absent/null = no stored draft. Only
   *  read once, to SEED the composer on mount alongside the instant local
   *  `drafts.ts` copy — never patched into a live cache the way `preview`/
   *  `unread` are, since the composer itself is the only writer once open. */
  draft?: string | null;
  /** Counterpart's read watermark (ISO, live). Drives the "Seen" receipt. */
  otherLastReadAt?: string;
  /** Counterpart's delivered watermark (ISO, live). Drives the "double check". */
  otherDeliveredAt?: string;
  /** The signed-in member's OWN read watermark (ISO, live, DMs and groups).
   *  Null when they have never read the thread; absent for most demo rows
   *  (the long demo thread carries one). Places the "New messages" divider by
   *  timestamp (ENG-195). */
  myLastReadAt?: string | null;
  /** Counterpart's user id (live) — correlates presence events. */
  otherParticipantId?: string;
  official?: boolean;
  /** ENG-243 (live): a DM whose counterpart erased their account. The thread
   *  stays readable, renders as "Former member", and the composer is replaced
   *  by a notice. Absent for official threads, groups and demo rows. */
  isCounterpartErased?: boolean;
  /** SERVER-AUTHORITATIVE (PRD-220): true for a DM the two aren't accepted
   *  connections in — e.g. a housing/flatmate enquiry that opened a thread
   *  cold. The ordinary send path 403s every message past the enquiry itself,
   *  from either side, so the composer renders `ComposerConnectionNotice`
   *  instead of a normal input. Always false/absent for official and group
   *  threads (the connection gate doesn't apply to them). */
  replyRequiresConnection?: boolean;
  /** SERVER-AUTHORITATIVE (PRD-340): the one-tap-reply state of a DM the two
   *  aren't accepted connections in, from the signed-in member's side.
   *  `"open"` means an ordinary send will succeed (they may reply, or the
   *  thread is already opened). `"awaitingTheirReply"` means this member
   *  started the thread and is waiting on the other side's first reply.
   *  `"needsConnection"` is the platform's original rule: neither side may
   *  send yet. Absent for official/group threads and for a demo row; treat a
   *  missing value as `"open"`. `ComposerConnectionNotice` reads this to tell
   *  "they haven't answered yet" apart from "you two aren't connected". */
  replyGate?: "open" | "awaitingTheirReply" | "needsConnection";
  /** True for a GROUP thread — swaps the header/inbox to group framing (title +
   *  member-count subtitle, per-sender attribution, "Group info"). Absent = DM. */
  isGroup?: boolean;
  /** Group roster (read-only in Phase 1). Absent for DMs. */
  members?: GroupMemberView[];
  /** Active member count for a group (header subtitle). Absent for DMs. */
  memberCount?: number;
  /** For a group: whether the signed-in member has left it (composer severed). */
  hasLeft?: boolean;
  /** The signed-in member's own role in a group. Absent for DMs. */
  myRole?: ConversationRole;
  /** SERVER-AUTHORITATIVE group-management capability flags — the management UI
   *  gates on these; the server re-checks the caller's role on every mutation.
   *  Absent/false for DMs and a member who has left. */
  canAddMembers?: boolean;
  canRemoveMembers?: boolean;
  canRename?: boolean;
  canManageRoles?: boolean;
  /** GROUP only (PRD-358): the group's description. Absent/null for DMs and
   *  for a group with no description set. */
  description?: string | null;
  /** GROUP only (PRD-357): ISO timestamp the group was dissolved. Once set,
   *  the group is read-only for every former participant. Absent/null while
   *  active, and for DMs. */
  dissolvedAt?: string | null;
  /** GROUP only, THIS member (DES-227): why the composer is severed:
   *  `"left"` (voluntary), `"removed"` (an owner/admin removed them), or
   *  `"dissolved"` (the owner ended the group). Absent/null while an active
   *  member, and for DMs. Drives `ComposerSeveredNotice`'s copy; a group with
   *  `hasLeft` true but no `leftReason` (an older cached response) falls back
   *  to the `"left"` wording. */
  leftReason?: "left" | "removed" | "dissolved" | null;
  /** GROUP only (PRD-358): the revocable invite-link token, only ever
   *  populated for the owner/admin who may manage it. Absent/null for every
   *  other member, a group with no active link, and DMs. */
  inviteToken?: string | null;
  /** Whether THIS member may create/rotate/disable the invite link, gated on
   *  being owner/admin with the group active and not dissolved. Absent/false
   *  for DMs and a member who has left. */
  canManageInviteLink?: boolean;
  /** Whether THIS member (the owner) may transfer ownership, gated on the
   *  group being active and not dissolved. Absent/false for DMs, non-owners,
   *  and a member who has left. */
  canTransferOwnership?: boolean;
  /** Whether THIS member (the owner) may dissolve the group, gated on it
   *  being active and not already dissolved. Absent/false for DMs,
   *  non-owners, and a member who has left. */
  canDissolve?: boolean;
  /** GROUP only, owner/admin (PRD-353): invites still awaiting a response.
   *  Absent/empty for a non-owner/admin, a member who has left, and DMs. */
  pendingInvites?: ConversationPendingInvite[];
  /** `dayKey` (a stable, ISO calendar-date machine id) is set on every bucket,
   *  live (`messages.adapters.ts`'s `groupMessages`) and demo
   *  (`demoTimeline.data.ts`'s `demoThread`), so the optimistic merge in
   *  `useMessagesController.helpers.ts` matches "today's bucket" by an
   *  absolute date rather than the `day` display label, which can go stale
   *  ("Today" said yesterday) in a long-lived tab (FE-MSG-30). */
  messages: { day: string; dayKey?: string; items: ChatMessage[] }[];
}

/**
 * Neutral placeholder for the sent-bubble avatar during the brief pre-auth /
 * logged-out window only. The real sent avatar always comes from the signed-in
 * member (`useAuth().user.profile` — see `ConversationPanel`); this must stay a
 * non-identity so no fabricated persona ("SR", a demo member) can ever leak into
 * a live thread. Empty initials render as a plain neutral circle.
 */
export const me = { initials: "", tint: "default" as AvatarTint };

/**
 * The demo inbox registry (demo mode only; live rows come from the API). Seeds
 * live in colocated `demo*.data.ts` files split by concern, every message has a
 * stable `demo-msg-<thread>-NNN` id, and every label derives from an ISO `at`
 * through the live formatters (see `demoTimeline.data.ts`). Listed newest
 * activity first, since the inbox keeps this order below any pinned rows.
 */
/** DEMO ONLY: the line `useDemoInboundMessageSimulation` delivers into
 *  Maria's thread a fixed delay after it opens (`DEMO_INBOUND_MESSAGE_DELAY_MS`,
 *  `demoSignalSimulation.ts`), a natural continuation of the Saturday
 *  flatshare-visit thread above, so the arrival reads as a genuine reply
 *  rather than a stock line. EN only, like every other demo message body
 *  (see `demoDirectThreads.data.ts`'s own file comment). */
export const DEMO_INBOUND_SIMULATION_MESSAGE_BODY =
  "One more thing: should Inês bring anything Saturday, or just herself?";

export const conversations: Conversation[] = [
  brunchCrewConversation,
  anikaConversation,
  mariaConversation,
  priyaConversation,
  jordanConversation,
  noahConversation,
  portoMentorsConversation,
  tomasConversation,
  yusufConversation,
  marcoConversation,
  kaiConversation,
  prideVolunteersConversation,
  bookSwapConversation,
  bilalConversation,
  teamConversation,
];
