import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import type {
  ConversationRole,
  ReactionSummary,
} from "../../shared/contracts/contracts";

/** The resolved system-event a `kind: "system"` message renders as a centred
 *  pill. Names are already resolved (never user ids); the pill text is built
 *  bilingually on the client from `type` + these names. */
export interface ChatSystemEvent {
  type:
    | "group_created"
    | "member_added"
    | "member_removed"
    | "member_left"
    | "group_renamed";
  actorName: string;
  targetName?: string | null;
  value?: string | null;
  /** True when the signed-in member is the actor — lets the pill read "You
   *  created the group" rather than the actor's name. */
  actorIsMe?: boolean;
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
  /** Stable server id (live mode) for React keys. Absent for demo/optimistic
   *  messages, which fall back to a positional key. */
  id?: string;
  /** ISO timestamp (live mode) used to break same-sender runs across large time
   *  gaps. Absent in demo (mock groups are day-bucketed and need no gap logic). */
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
  /** Per-key reaction counts + whether the signed-in member reacted (live mode).
   *  Absent for demo/optimistic messages, which carry no reactions. */
  reactions?: ReactionSummary[];
  /** ISO timestamp the message was soft-deleted at (live mode). Absent for a
   *  message that hasn't been deleted, and for demo/optimistic messages. */
  deletedAt?: string;
  /** ISO timestamp of the last edit (live mode). Absent if never edited. */
  editedAt?: string;
  /** The quoted message this one replies to (live mode). Absent if not a reply. */
  replyTo?: {
    id: string;
    snippet: string;
    senderName: string;
    deleted: boolean;
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
   *  action; never recomputed client-side. Absent for demo/optimistic messages
   *  (which have no server id and never reach the action menu). */
  canEdit?: boolean;
  /** Server-authoritative: whether the viewer may delete this message (live) —
   *  author or platform staff, not already deleted. Drives the Delete action. */
  canDelete?: boolean;
  /** Server-authoritative: whether the viewer may report this message (live) —
   *  not the viewer's own message, not deleted. Drives the Report action. */
  canReport?: boolean;
}

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
   *  at fetch/patch time — kept for backwards compatibility (`messageCache.ts`'s
   *  `patchConversationPreview` only ever has this shorthand to write, no ISO
   *  timestamp) and as the DEMO row's only source (mock data has no ISO
   *  `updatedAt`). LIVE rows additionally carry `updatedAt` below, which
   *  `MessagesThreadRow` prefers so the label re-derives at render time
   *  instead of going stale (e.g. "Today" past midnight) until the next fetch. */
  time: string;
  /** ISO timestamp of the conversation's last activity (LIVE mode only — see
   *  `time`'s doc). Absent for DEMO rows and any row a shared cache patch built
   *  before this field existed. */
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
  /** Counterpart's user id (live) — correlates presence events. */
  otherParticipantId?: string;
  official?: boolean;
  /** SERVER-AUTHORITATIVE (PRD-220): true for a DM the two aren't accepted
   *  connections in — e.g. a housing/flatmate enquiry that opened a thread
   *  cold. The ordinary send path 403s every message past the enquiry itself,
   *  from either side, so the composer renders `ComposerConnectionNotice`
   *  instead of a normal input. Always false/absent for official and group
   *  threads (the connection gate doesn't apply to them). */
  replyRequiresConnection?: boolean;
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
  /** `dayKey` (a stable, ISO calendar-date machine id) is set on LIVE-mode
   *  buckets (`messages.adapters.ts`'s `groupMessages`) so the optimistic
   *  merge in `useMessagesController.helpers.ts` matches "today's bucket" by
   *  an absolute date rather than the `day` display label, which can go stale
   *  ("Today" said yesterday) in a long-lived tab — see FE-MSG-30. DEMO's
   *  hand-authored buckets below never set it: their `day` label is fiction
   *  that never rolls over on a real clock, so matching on it directly stays
   *  correct there. */
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

export const conversations: Conversation[] = [
  {
    id: "brunch-crew",
    initials: "PB",
    tint: "coral",
    name: "Pride Brunch Crew",
    pronouns: "",
    connectedSince: "",
    time: "Now",
    // Group previews are prefixed with the sender's first name (see the live
    // adapter); the demo bakes the same shape in.
    preview: "Anika: The terrace is booked for 11am, see you all there!",
    unread: true,
    unreadCount: 3,
    isGroup: true,
    memberCount: 4,
    // The signed-in demo member ("Tiago Costa") owns this group, so the demo
    // shows the full management surface (add/remove/rename/roles). The two
    // members with a `lastReadAt` past the last own message drive a demo
    // "Seen by 2" receipt; Kai (no watermark) hasn't caught up.
    myRole: "owner",
    canAddMembers: true,
    canRemoveMembers: true,
    canRename: true,
    canManageRoles: true,
    members: [
      {
        name: "Tiago Costa",
        initials: "TC",
        tint: "plum",
        role: "owner",
        slug: "tiago",
      },
      {
        name: "Anika Kovač",
        initials: "AK",
        tint: "coral",
        role: "member",
        slug: "anika",
        lastReadAt: "2026-07-29T10:00:00.000Z",
      },
      {
        name: "Jordan Park",
        initials: "JP",
        tint: "jade",
        role: "admin",
        slug: "jordan",
        lastReadAt: "2026-07-29T10:00:00.000Z",
      },
      {
        name: "Kai Larsson",
        initials: "KL",
        tint: "plum",
        role: "member",
        slug: "kai",
      },
    ],
    messages: [
      {
        day: "Today",
        items: [
          {
            from: "me",
            text: "created the group",
            kind: "system",
            systemEvent: {
              type: "group_created",
              actorName: "You",
              actorIsMe: true,
            },
          },
          {
            from: "them",
            text: "So excited for this! What time are we thinking?",
            senderName: "Anika Kovač",
            senderHandle: "anika",
            senderTint: "coral",
          },
          {
            from: "them",
            text: "Late morning works best for me, 11ish?",
            senderName: "Jordan Park",
            senderHandle: "jordan",
            senderTint: "jade",
          },
          {
            from: "me",
            text: "11am it is. I'll confirm the terrace booking.",
            at: "2026-07-29T09:00:00.000Z",
          },
          {
            from: "them",
            text: "The terrace is booked for 11am, see you all there!",
            senderName: "Anika Kovač",
            senderHandle: "anika",
            senderTint: "coral",
            time: "Just now",
            reactions: [{ key: "love", count: 2, mine: true }],
          },
        ],
      },
    ],
  },
  {
    id: "anika",
    slug: "anika",
    initials: "AK",
    tint: "coral",
    name: "Anika Kovač",
    pronouns: "she/they",
    connectedSince: "Feb 2026",
    time: "Now",
    preview: "Thanks for the recommendation! I'll reach out to her this week",
    unread: true,
    unreadCount: 2,
    messages: [
      {
        day: "Yesterday",
        items: [
          {
            from: "them",
            text: "Hey! I saw your question in the Trans & Non-Binary thread about GPs. Dr. Carla Nunes at Clínica do Marquês is brilliant. She gets it without needing a full explanation every visit.",
          },
          {
            from: "me",
            text: "Oh brilliant, thank you! Is she taking new patients?",
          },
          {
            from: "them",
            text: "Yes, I'd recommend booking by email rather than phone, she's quicker to respond. You can request a first appointment here: https://clinicadomarques.pt/book",
          },
        ],
      },
      {
        day: "Today",
        items: [
          {
            from: "me",
            text: "That would be amazing, yes please. And I saw the brunch is confirmed: https://queerpulse.example/pride-brunch",
          },
          {
            from: "them",
            text: "Thanks for the recommendation! I'll reach out to her this week. Really appreciate you taking the time.",
            time: "Just now",
            // Demo-only seed so the reaction chips have something to render in
            // the prototype; toggling is inert here (no server id to mutate —
            // see `useToggleReaction`'s demo no-op branch).
            reactions: [
              { key: "love", count: 2, mine: false },
              { key: "like", count: 1, mine: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "jordan",
    slug: "jordan",
    initials: "JP",
    tint: "plum",
    name: "Jordan Park",
    pronouns: "they/them",
    connectedSince: "Mar 2026",
    time: "Yesterday",
    preview: "See you at the book club on Saturday",
    unread: false,
    online: true,
    messages: [
      {
        day: "Yesterday",
        items: [
          { from: "me", text: "Are you going to the book club on Saturday?" },
          {
            from: "them",
            text: "See you at the book club on Saturday",
            time: "Yesterday 3:14 PM",
          },
        ],
      },
    ],
  },
  {
    id: "tomas",
    slug: "tomas-mendes",
    initials: "TM",
    tint: "jade",
    name: "Tomás Mendes",
    pronouns: "he/him",
    connectedSince: "Jan 2026",
    time: "Mon",
    preview: "The venue confirmed. We're all set for the…",
    unread: true,
    messages: [
      {
        day: "Monday",
        items: [
          {
            from: "them",
            text: "The venue confirmed. We're all set for the Pride Brunch. They've given us the whole terrace from 11am.",
            time: "Mon 2:30 PM",
          },
        ],
      },
    ],
  },
  {
    id: "maria",
    slug: "maria",
    initials: "MF",
    tint: "jade",
    name: "Maria Ferreira",
    pronouns: "she/her",
    connectedSince: "Apr 2026",
    time: "Sun",
    preview: "Of course, happy to chat. Are you free Thursday?",
    unread: false,
    messages: [
      {
        day: "Sunday",
        items: [
          {
            from: "me",
            text: "Hi Maria, would you be open to a quick chat sometime? I have some questions about trans healthcare resources.",
          },
          {
            from: "them",
            text: "Of course, happy to chat. Are you free Thursday?",
            time: "Sun 11:22 AM",
          },
        ],
      },
    ],
  },
  {
    id: "kai",
    slug: "kai",
    initials: "KL",
    tint: "plum",
    name: "Kai Larsson",
    pronouns: "they/them",
    connectedSince: "May 2026",
    time: "Fri",
    preview: "That's exactly the angle I was looking for, thank you",
    unread: false,
    messages: [
      {
        day: "Friday",
        items: [
          {
            from: "me",
            text: "I think the angle you want is less about documentation and more about memory: what communities choose to remember vs forget.",
          },
          {
            from: "them",
            text: "That's exactly the angle I was looking for, thank you",
            time: "Fri 6:48 PM",
          },
        ],
      },
    ],
  },
  {
    id: "team",
    initials: "QP",
    tint: "plum",
    name: "QueerPulse Team",
    pronouns: "Official",
    connectedSince: "",
    time: "1 Jun",
    preview: "Welcome to QueerPulse! Here's what to explore first…",
    unread: false,
    official: true,
    messages: [
      {
        day: "1 June 2026",
        items: [
          {
            from: "them",
            text: "Welcome to QueerPulse! Here's what to explore first: your profile, upcoming gatherings, and the member directory. We're glad you're here.",
            time: "1 Jun 9:00 AM",
          },
        ],
      },
    ],
  },
  {
    id: "bilal",
    slug: "bilal-kaya",
    initials: "BK",
    tint: "coral",
    name: "Bilal Kaya",
    pronouns: "he/him",
    connectedSince: "May 2026",
    time: "28 May",
    preview: "Let me know if you want me to introduce you",
    unread: false,
    messages: [
      {
        day: "28 May",
        items: [
          {
            from: "them",
            text: "Let me know if you want me to introduce you to Nadia. She does exactly the kind of work you're describing.",
            time: "28 May 4:12 PM",
          },
        ],
      },
    ],
  },
];
