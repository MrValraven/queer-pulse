import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import { activeLocale } from "../../../shared/i18n/locale";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";
import type { ChatMessage, Conversation, GroupMemberView } from "../data";
import { systemMessageText } from "../systemMessageText";
import type { ConversationResponse, MessageResponse } from "./messages.api";
import type { ConversationMemberPreview } from "../../../shared/contracts/contracts";

/**
 * ENG-253: `conversationToView`'s return, extended with the trimmed preview
 * fields an inbox LIST row now carries instead of the full `members`/`draft`
 * (see their own docs on `ConversationResponse`). Structurally a superset of
 * `Conversation`: every one of these fields is optional, so a plain
 * `Conversation` (e.g. a DEMO row, which never carries them) is still
 * assignable here, and this value is still assignable wherever a plain
 * `Conversation` is expected. Declared here rather than widening
 * `Conversation` itself (`../data.ts`) because this file doesn't own that
 * type this build. See the messaging-engineer report for exactly which
 * components (the inbox row's avatar stack / draft preview) still need to
 * import this type to actually render the new fields.
 */
export interface ConversationWithPreview extends Conversation {
  /** Group avatar-stack preview (empty for DMs), capped server-side. */
  memberPreview?: ConversationMemberPreview[];
  /** First 120 characters of the stored draft, present wherever `draft`
   *  itself would have been considered pre-ENG-253. Null exactly when
   *  `hasDraft` is false. */
  draftPreview?: string | null;
  /** Whether a draft is currently stored at all, without inspecting
   *  `draftPreview`'s length. */
  hasDraft?: boolean;
  /** The other DM participant's real read INSTANT (distinct from the
   *  `otherLastReadAt` watermark, which is a message timestamp). Null for
   *  official/group threads or a counterpart who has never read. */
  otherLastReadInstant?: string | null;
}

// Map the backend DTOs onto the EXISTING messages view-models (../data.ts) so
// ConversationPanel / MessagesThreadList render unchanged. Prototype-only fields
// (initials, tint, day-grouping) are synthesized from the DTO.

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.length > 1 ? parts.at(-1)! : "" };
}

/** Wall-clock label ("9:14 PM" in EN, "21:14" in PT) for a timestamp, with no
 *  relative day part, EVER. This is what a chat BUBBLE shows: the day a message
 *  belongs to is already carried by the day separator above its group (see
 *  `buildMessageRows`), so repeating it in the bubble is noise at best — and
 *  under the old shared `timeLabel` a week-old bubble showed ONLY "13 Aug" and
 *  lost its time of day altogether (FE-MSG-41). Same formatting as
 *  `timeLabel`'s own same-day branch, so a bubble's label doesn't change shape
 *  as the conversation ages. */
export function clockLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(activeLocale(), {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "9:14 PM" / weekday / date label the INBOX thread rows show — the label
 *  collapses to a coarser unit as the row ages, because a list row has one
 *  line to say "how long ago" in. Chat bubbles use `clockLabel` instead.
 *  Exported for `patchConversationPreview` (`shared/api/messageCache.ts`),
 *  which needs the same formatting to patch a socket/send frame into the inbox
 *  row's `time` field without a `["conversations"]` refetch. */
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const locale = activeLocale();
  if (sameDay) return clockLabel(iso);
  const days = Math.round((now.getTime() - d.getTime()) / 86_400_000);
  if (days < 7) return d.toLocaleDateString(locale, { weekday: "short" });
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/** Day heading ("Today" / "Yesterday" / "1 Jun") the panel groups by. "Today"/
 *  "Yesterday" are machine tokens further resolved through the catalog by
 *  `MessageAreaRow`'s `dayHeading` — never shown to a member as raw English. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const days = Math.round(
    (new Date(now.toDateString()).getTime() -
      new Date(d.toDateString()).getTime()) /
      86_400_000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(activeLocale(), {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** Stable local-calendar-date machine id ("2026-08-21") for a timestamp — the
 *  key a day bucket is grouped/matched on. Exported for the optimistic-merge
 *  logic in `useMessagesController.helpers.ts`, which needs the SAME
 *  computation to find "today's bucket" by an absolute date rather than the
 *  `day` display label above. That label recomputes relative to "now" and
 *  rolls "Today" → "Yesterday" at midnight, but nothing forces a refetch just
 *  because the clock ticked — a long-lived tab's cached bucket can keep
 *  saying "Today" well past real midnight, and matching a fresh optimistic
 *  send on that stale label would silently misfile it into yesterday's
 *  bucket (FE-MSG-30). */
export function localDayKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Month-and-year label ("Feb 2026" in EN) for when a DM's two members
 *  connected, the shape the demo threads carry and the header interpolates
 *  into `messages:conversation.connectedSinceSuffix`. Empty for a missing or
 *  unparseable timestamp, which the header treats as "nothing to say". */
function connectedSinceLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(activeLocale(), {
    month: "short",
    year: "numeric",
  });
}

/** Group avatar initials from a title ("Pride Brunch Crew" → "PB"). Exported
 *  for `useMessageSearch.ts`'s search/starred grouping (ENG-251), so a group
 *  hit's initials fallback matches the inbox row's exactly. */
export function groupInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return title.trim().slice(0, 2).toUpperCase();
}

/** Inbox preview for a group's last message: sender first name prefixed for a
 *  member message ("Ana: …"), or the localized system sentence for a system
 *  message ("Ana made Bea an admin"), built by the SAME `systemMessageText`
 *  the chat log's pill uses so the inbox row never drifts from it (and never
 *  prefixes the actor's name onto an already-worded sentence, which used to
 *  misname the target of an event like `owner_changed`). `t` is required to
 *  localize a system preview; without it (the live-patch call site, which has
 *  no translator in scope) a system message falls back to its English body.
 *  Empty when the group has no messages. */
function groupPreview(
  last: MessageResponse | null,
  formerMemberLabel?: string,
  t?: TFunction,
): string {
  if (!last) return "";
  if (last.kind === "system" && last.systemEvent) {
    if (t) {
      return systemMessageText(
        {
          type: last.systemEvent.type,
          actorName: last.systemEvent.actorName,
          targetName: last.systemEvent.targetName,
          value: last.systemEvent.value,
          actorIsMe: last.systemEvent.actorIsMe,
          targetIsMe: last.systemEvent.targetIsMe,
        },
        t,
      );
    }
    return last.body;
  }
  // ENG-243: an erased sender is named in the viewer's language when the
  // caller has a translator (the inbox list does), else by the server's
  // English fallback.
  const first =
    last.sender.isFormerMember && formerMemberLabel
      ? formerMemberLabel
      : (last.sender.displayName.trim().split(/\s+/)[0] ?? "");
  return first ? `${first}: ${last.body}` : last.body;
}

/** Inbox-row preview text for a just-sent/received message, matching group vs
 *  DM formatting. Exported for `patchConversationPreview`
 *  (`shared/api/messageCache.ts`), which patches a live socket/send frame into
 *  the `["conversations"]` cache in place instead of refetching. */
export function previewForMessage(
  isGroup: boolean,
  message: MessageResponse,
): string {
  return isGroup ? groupPreview(message) : message.body;
}

/** ConversationResponse (group) → the inbox `Conversation` row. */
function groupConversationToView(
  dto: ConversationResponse,
  t: TFunction,
): ConversationWithPreview {
  const title = dto.title ?? t("messages:group.untitled");
  // ENG-253: `dto.members` is `[]` on a LIST row (`GET /conversations`) and
  // only populated on `GET /conversations/:id` (see `useConversationDetail`
  // in `useConversations.ts`). This maps whichever the DTO actually carries,
  // so a detail-fetch response still adapts its real roster correctly.
  const members: GroupMemberView[] = dto.members.map((member) => {
    const { first, last } = splitName(member.name);
    return {
      id: member.id,
      slug: member.handle,
      name: member.name,
      initials: initialsOf(first, last),
      tint: tintForSlug(member.handle),
      avatarUrl: member.avatarUrl ?? undefined,
      role: member.role,
      lastReadAt: member.lastReadAt ?? undefined,
      deliveredAt: member.deliveredAt ?? undefined,
    };
  });
  return {
    id: dto.id,
    isGroup: true,
    initials: groupInitials(title),
    tint: "plum",
    avatarUrl: dto.avatarUrl ?? undefined,
    avatarCrop: dto.avatarCrop ?? undefined,
    name: title,
    pronouns: "",
    connectedSince: "",
    time: timeLabel(dto.updatedAt),
    updatedAt: dto.updatedAt,
    preview: groupPreview(dto.lastMessage, t("messages:formerMember"), t),
    // DES-190: the raw sender/body/kind behind `preview`, so the row can
    // substitute "You: " for the baked-in sender name when the viewer sent
    // the last message, without re-parsing `groupPreview`'s formatted string.
    lastMessageSenderHandle: dto.lastMessage?.sender.handle || undefined,
    lastMessageBody: dto.lastMessage?.body,
    lastMessageIsSystem: dto.lastMessage?.kind === "system",
    // PRD-225: a manual "mark unread" is unread even with nothing new to
    // read — ORed in alongside the count-based rule, never replacing it.
    unread: dto.unreadCount > 0 || !!dto.markedUnreadAt,
    unreadCount: dto.unreadCount,
    pinnedAt: dto.pinnedAt ?? undefined,
    favorite: dto.favorite ?? undefined,
    muted: dto.muted ?? undefined,
    mutedUntil: dto.mutedUntil ?? undefined,
    // PRD-349: a second, independent mute axis (see `Conversation.muteMode`'s
    // own doc on why this is never collapsed into `muted`/`mutedUntil`).
    muteMode: dto.muteMode ?? undefined,
    hasUnreadMention: dto.hasUnreadMention ?? false,
    archivedAt: dto.archivedAt ?? undefined,
    markedUnreadAt: dto.markedUnreadAt ?? undefined,
    draft: dto.draft ?? undefined,
    // ENG-253: the LIST row's own preview fields, see `ConversationWithPreview`.
    memberPreview: dto.memberPreview ?? [],
    draftPreview: dto.draftPreview ?? null,
    hasDraft: dto.hasDraft ?? false,
    members,
    memberCount: dto.memberCount,
    hasLeft: dto.hasLeft ?? false,
    myRole: dto.myRole ?? undefined,
    myLastReadAt: dto.myLastReadAt ?? null,
    // SERVER-AUTHORITATIVE capability flags — the management UI gates on these.
    canAddMembers: dto.canAddMembers ?? false,
    canRemoveMembers: dto.canRemoveMembers ?? false,
    canRename: dto.canRename ?? false,
    canManageRoles: dto.canManageRoles ?? false,
    description: dto.description ?? undefined,
    dissolvedAt: dto.dissolvedAt ?? undefined,
    leftReason: dto.leftReason ?? undefined,
    // Only ever populated for the owner/admin who may manage it, see the
    // field's own doc on `ConversationResponse`.
    inviteToken: dto.inviteToken ?? undefined,
    canManageInviteLink: dto.canManageInviteLink ?? false,
    canTransferOwnership: dto.canTransferOwnership ?? false,
    canDissolve: dto.canDissolve ?? false,
    pendingInvites: dto.pendingInvites ?? [],
    messages: [],
  };
}

/** ConversationResponse → the inbox `Conversation` row (messages filled later).
 *  `t` resolves the "official account with no counterpart profile" / "group
 *  with no title" fallbacks bilingually — see `messages:conversation.officialName`
 *  / `messages:group.untitled`. */
export function conversationToView(
  dto: ConversationResponse,
  t: TFunction,
): ConversationWithPreview {
  if (dto.kind === "group") return groupConversationToView(dto, t);
  const counterpart = dto.otherParticipant;
  // A null counterpart is the official thread, or a DM whose counterpart
  // erased their account (ENG-243). `isOfficial` tells them apart; an older
  // response without it keeps the historical reading (null means official).
  const isOfficial = dto.isOfficial ?? !counterpart;
  const name =
    counterpart?.displayName ??
    (isOfficial
      ? t("messages:conversation.officialName")
      : t("messages:formerMember"));
  const { first, last } = splitName(name);
  const slug = counterpart?.handle;
  const tint: AvatarTint = slug ? tintForSlug(slug) : "plum";
  return {
    id: dto.id,
    slug,
    initials: counterpart ? initialsOf(first, last) : isOfficial ? "QP" : "",
    tint,
    avatarUrl: counterpart?.avatarUrl ?? undefined,
    name,
    // Only ever rendered when `official` is false — `ConversationHeader`
    // shows a dedicated translated "Official" meta line instead of this field
    // whenever `official` is true, so there's no English literal to leak here.
    pronouns: counterpart?.pronouns ?? "",
    connectedSince: connectedSinceLabel(dto.connectedSince),
    time: timeLabel(dto.updatedAt),
    updatedAt: dto.updatedAt,
    preview: dto.lastMessage?.body ?? "",
    // DES-190: see the matching comment in `groupConversationToView`. A DM's
    // `preview` is already the bare body, but the row still needs to know WHO
    // sent it to show "You: " when the viewer did.
    lastMessageSenderHandle: dto.lastMessage?.sender.handle || undefined,
    lastMessageBody: dto.lastMessage?.body,
    lastMessageIsSystem: dto.lastMessage?.kind === "system",
    // PRD-225: see the matching comment in `groupConversationToView`.
    unread: dto.unreadCount > 0 || !!dto.markedUnreadAt,
    pinnedAt: dto.pinnedAt ?? undefined,
    favorite: dto.favorite ?? undefined,
    muted: dto.muted ?? undefined,
    mutedUntil: dto.mutedUntil ?? undefined,
    // PRD-349: a second, independent mute axis (see `Conversation.muteMode`'s
    // own doc on why this is never collapsed into `muted`/`mutedUntil`).
    muteMode: dto.muteMode ?? undefined,
    hasUnreadMention: dto.hasUnreadMention ?? false,
    archivedAt: dto.archivedAt ?? undefined,
    markedUnreadAt: dto.markedUnreadAt ?? undefined,
    draft: dto.draft ?? undefined,
    // ENG-253: the LIST row's own preview fields, see `ConversationWithPreview`.
    draftPreview: dto.draftPreview ?? null,
    hasDraft: dto.hasDraft ?? false,
    otherLastReadAt: dto.otherLastReadAt ?? undefined,
    otherLastReadInstant: dto.otherLastReadInstant ?? null,
    otherDeliveredAt: dto.otherDeliveredAt ?? undefined,
    myLastReadAt: dto.myLastReadAt ?? null,
    otherParticipantId: dto.otherParticipantId ?? undefined,
    official: isOfficial,
    // Set when the DM's counterpart erased their account: nobody is left to
    // read a reply, so the composer is replaced by a notice.
    isCounterpartErased: !counterpart && !isOfficial,
    // Server-authoritative (PRD-220), see `Conversation.replyRequiresConnection`.
    // Never set without a real counterpart to connect with.
    replyRequiresConnection: counterpart
      ? (dto.replyRequiresConnection ?? false)
      : false,
    // Server-authoritative (PRD-340); see `Conversation.replyGate`.
    replyGate: counterpart ? (dto.replyGate ?? "open") : "open",
    messages: [],
  };
}

/** The wire attachment onto the bubble's attachment type. The backend may send
 *  `caption: null`, while `GifAttachment`/`DocumentAttachment` promise a caption
 *  is absent whenever there is none, so a null or empty one is dropped here. */
function attachmentToChat(
  attachment: MessageResponse["attachment"],
): ChatMessage["attachment"] {
  if (!attachment) return undefined;
  if ("fileName" in attachment) {
    const { caption: documentCaption, ...document } = attachment;
    return documentCaption
      ? { ...document, caption: documentCaption }
      : document;
  }
  const { caption: imageCaption, ...image } = attachment;
  return imageCaption ? { ...image, caption: imageCaption } : image;
}

/** MessageResponse → a single chat bubble, `from` decided by the sender handle. */
export function messageToChat(
  dto: MessageResponse,
  myHandle: string | null,
): ChatMessage {
  const isMe = !!myHandle && dto.sender.handle === myHandle;
  return {
    id: dto.id,
    from: isMe ? "me" : "them",
    text: dto.body,
    // Bubbles ALWAYS show a wall-clock time; the day comes from the separator.
    time: clockLabel(dto.createdAt),
    at: dto.createdAt,
    reactions: dto.reactions,
    deletedAt: dto.deletedAt ?? undefined,
    deliveredAt: dto.deliveredAt ?? undefined,
    editedAt: dto.editedAt ?? undefined,
    // Carry the sender's client id onto the server-derived bubble so the
    // controller can dedupe an optimistic outbox entry that shares it (the
    // socket copy can land a beat before the send mutation drops the optimistic).
    localId: dto.clientMessageId ?? undefined,
    replyTo: dto.replyTo ?? undefined,
    forwarded: dto.forwarded || undefined,
    pinnedAt: dto.pinnedAt ?? undefined,
    starred: dto.starred || undefined,
    canPin: dto.canPin,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canReport: dto.canReport,
    // System message → a centred event pill. The system message's sender IS the
    // actor (see `postSystemMessage`), so `isMe` doubles as "the actor is you".
    kind:
      dto.kind === "system"
        ? "system"
        : dto.kind === "gif"
          ? "gif"
          : dto.kind === "image"
            ? "image"
            : dto.kind === "document"
              ? "document"
              : undefined,
    attachment: attachmentToChat(dto.attachment),
    systemEvent: dto.systemEvent
      ? {
          type: dto.systemEvent.type,
          actorName: dto.systemEvent.actorName,
          targetName: dto.systemEvent.targetName,
          value: dto.systemEvent.value,
          // Prefer the server's own viewer-relative flag; fall back to the
          // event's own actor handle when present (symmetric with
          // `targetIsMe` below), else the sender handle comparison, for a
          // room broadcast that has neither flag set (optional-tolerant, see
          // `MessageResponse.systemEvent`).
          actorIsMe:
            dto.systemEvent.actorIsMe ??
            (dto.systemEvent.actorHandle != null
              ? dto.systemEvent.actorHandle === myHandle
              : isMe),
          targetIsMe:
            dto.systemEvent.targetIsMe ??
            (dto.systemEvent.targetHandle != null &&
              dto.systemEvent.targetHandle === myHandle),
        }
      : undefined,
    // Group attribution: the sender's identity so a received run in a group can
    // show a name label + avatar. Harmlessly carried in DMs too (ignored there).
    senderName: dto.sender.displayName,
    senderHandle: dto.sender.handle || undefined,
    senderTint: dto.sender.handle ? tintForSlug(dto.sender.handle) : undefined,
    senderAvatar: dto.sender.avatarUrl ?? undefined,
    // ENG-243: an erased sender renders as a localized "Former member".
    isSenderFormerMember: dto.sender.isFormerMember || undefined,
  };
}

/**
 * ENG-198: one adapted bubble per DTO object, so a cache patch that leaves a
 * message untouched hands its row the SAME `ChatMessage` and row memoisation
 * (and identity-based lookups) survive the frame. Keyed on the DTO reference:
 * every patch in `shared/api/messageCache.ts` spreads a NEW object for the
 * message it changes and passes the others through by reference, and
 * react-query's structural sharing keeps deep-equal refetched DTOs stable too,
 * so a changed message misses naturally. The bubble also depends on the viewer
 * (`from`, `actorIsMe`) and the locale (`time`), so each entry remembers the
 * context it was built for and rebuilds when that moves. A WeakMap lets an
 * entry go with its DTO once the query cache drops it.
 */
const chatMessageByDto = new WeakMap<
  MessageResponse,
  { contextKey: string; chatMessage: ChatMessage }
>();

function stableMessageToChat(
  dto: MessageResponse,
  myHandle: string | null,
  contextKey: string,
): ChatMessage {
  const cached = chatMessageByDto.get(dto);
  if (cached && cached.contextKey === contextKey) return cached.chatMessage;
  const chatMessage = messageToChat(dto, myHandle);
  chatMessageByDto.set(dto, { contextKey, chatMessage });
  return chatMessage;
}

/** Group an oldest-first message list into the `{ day, dayKey, items }[]` the
 *  panel renders. Bucketed by `dayKey` (the stable machine id), not the `day`
 *  display label — see `localDayKey`'s doc. Bubbles come from
 *  `stableMessageToChat`, so an unchanged DTO keeps its bubble object. */
export function groupMessages(
  messages: MessageResponse[],
  myHandle: string | null,
): { day: string; dayKey: string; items: ChatMessage[] }[] {
  const groups: { day: string; dayKey: string; items: ChatMessage[] }[] = [];
  const contextKey = `${activeLocale()}|${myHandle ?? ""}`;
  for (const message of messages) {
    const parsed = new Date(message.createdAt);
    const dayKey = Number.isNaN(parsed.getTime())
      ? message.createdAt
      : localDayKey(parsed);
    const chatMessage = stableMessageToChat(message, myHandle, contextKey);
    const bucket = groups.at(-1);
    if (bucket && bucket.dayKey === dayKey) bucket.items.push(chatMessage);
    else
      groups.push({
        day: dayLabel(message.createdAt),
        dayKey,
        items: [chatMessage],
      });
  }
  return groups;
}
