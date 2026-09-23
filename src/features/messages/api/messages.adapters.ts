import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import { activeLocale } from "../../../shared/i18n/locale";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";
import type { ChatMessage, Conversation, GroupMemberView } from "../data";
import {
  normalizeSystemEventType,
  systemMessageText,
} from "../systemMessageText";
import type { ConversationResponse, MessageResponse } from "./messages.api";
import type { ConversationMemberPreview } from "../../../shared/contracts/contracts";
import {
  isFromViewerSide,
  type MessageViewer,
} from "../../../shared/api/mailboxViewer";
import { toConversationClaimant } from "../../../shared/api/conversationClaim";

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

/** A sticker send blanks `body` server-side BY DESIGN: the sticker branch of
 *  `MessagingCoreService.postMessage` drops the frontend's placeholder text
 *  before persisting, since every field a sticker bubble needs already lives
 *  on its baked `attachment`. A raw `.body` read for a sticker is therefore
 *  always empty. Every caller that shows a message as plain TEXT (a chat
 *  bubble, an inbox/group preview) falls back to the sticker's own `label`
 *  instead, exactly the placeholder a locally-sent optimistic sticker
 *  already carries (`useMessageSendActions.sendSticker`'s `text:
 *  sticker.label`). Narrows with the raw `"stickerId" in attachment` check
 *  rather than the shared `isStickerAttachment` guard, mirroring
 *  `attachmentToChat`'s own reasoning below: this function sits on the wire
 *  `MessageResponse["attachment"]` shape, whose `caption` is nullable, unlike
 *  the normalized `ChatMessage` shape the guard is typed against. */
export function messageDisplayText(message: MessageResponse): string {
  const attachment = message.attachment;
  return message.kind === "sticker" && attachment && "stickerId" in attachment
    ? attachment.label
    : message.body;
}

/** The business a moved note names, kept only while that business still
 *  resolves: a deleted one (`isFormerMailbox`) carries the English fallback
 *  label, so its note reads the unnamed line. */
function movedNoteMailboxName(
  systemEvent: NonNullable<MessageResponse["systemEvent"]>,
): string | undefined {
  if (systemEvent.isFormerMailbox === true) return undefined;
  return systemEvent.mailboxName || undefined;
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
          type: normalizeSystemEventType(last.systemEvent.type),
          actorName: last.systemEvent.actorName,
          targetName: last.systemEvent.targetName,
          value: last.systemEvent.value,
          actorIsMe: last.systemEvent.actorIsMe,
          targetIsMe: last.systemEvent.targetIsMe,
          mailboxName: movedNoteMailboxName(last.systemEvent),
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
  const displayText = messageDisplayText(last);
  return first ? `${first}: ${displayText}` : displayText;
}

/** Inbox-row preview text for a just-sent/received message, matching group vs
 *  DM formatting. Exported for `patchConversationPreview`
 *  (`shared/api/messageCache.ts`), which patches a live socket/send frame into
 *  the `["conversations"]` cache in place instead of refetching. */
export function previewForMessage(
  isGroup: boolean,
  message: MessageResponse,
): string {
  return isGroup ? groupPreview(message) : messageDisplayText(message);
}

/** Inbox preview for a DIRECT thread's last message: the localized system
 *  sentence for a system message (e.g. the migration's "This conversation
 *  moved to the business mailbox" note), or the plain display text
 *  otherwise. A DM preview is always plain text: the row's own header
 *  already identifies the single counterpart, the job a group's prefixed
 *  sender name does instead. */
function directPreview(
  lastMessage: MessageResponse | null,
  t: TFunction,
): string {
  if (!lastMessage) return "";
  if (lastMessage.kind === "system" && lastMessage.systemEvent) {
    return systemMessageText(
      {
        type: normalizeSystemEventType(lastMessage.systemEvent.type),
        actorName: lastMessage.systemEvent.actorName,
        targetName: lastMessage.systemEvent.targetName,
        value: lastMessage.systemEvent.value,
        actorIsMe: lastMessage.systemEvent.actorIsMe,
        targetIsMe: lastMessage.systemEvent.targetIsMe,
        mailboxName: movedNoteMailboxName(lastMessage.systemEvent),
      },
      t,
    );
  }
  return messageDisplayText(lastMessage);
}

/** The business side of a row's last message, every key always present. */
export interface LastMessageMailboxFields {
  lastMessageSenderIdentityId: string | undefined;
  lastMessageStaffFirstName: string | undefined;
  lastMessageIsSentByViewer: boolean | undefined;
}

/** The business side of a row's last message: the identity it was sent as,
 *  the staff first name the server let this reader see, and whether the
 *  viewer typed it. Every key is always returned, `undefined` for a system
 *  or personal message, so a caller that spreads the result over an existing
 *  row (`patchConversationPreview`) clears the previous message's values.
 *  The server list rows carry `isSentByViewer`, and so does each live
 *  message the patch receives, since the server renders it per reader; it
 *  stays `undefined` when the key is absent, since `false` means a
 *  colleague typed it. */
export function lastMessageMailboxFields(
  lastMessage: MessageResponse | null,
): LastMessageMailboxFields {
  if (!lastMessage || lastMessage.kind === "system") {
    return {
      lastMessageSenderIdentityId: undefined,
      lastMessageStaffFirstName: undefined,
      lastMessageIsSentByViewer: undefined,
    };
  }
  return {
    lastMessageSenderIdentityId: lastMessage.sender.identityId,
    lastMessageStaffFirstName: lastMessage.sender.staffFirstName,
    lastMessageIsSentByViewer: lastMessage.isSentByViewer,
  };
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
    lastMessageBody: dto.lastMessage
      ? messageDisplayText(dto.lastMessage)
      : undefined,
    lastMessageIsSystem: dto.lastMessage?.kind === "system",
    ...lastMessageMailboxFields(dto.lastMessage),
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
  // A deleted business keeps a summary with the server's English fallback
  // name, so the row names it in the viewer's language with no initials.
  const isCounterpartFormerBusiness = counterpart?.isFormerIdentity === true;
  const name = isCounterpartFormerBusiness
    ? t("messages:mailbox.formerBusiness")
    : (counterpart?.displayName ??
      (isOfficial
        ? t("messages:conversation.officialName")
        : t("messages:formerMember")));
  const { first, last } = splitName(name);
  const slug = counterpart?.handle;
  const tint: AvatarTint = slug ? tintForSlug(slug) : "plum";
  return {
    id: dto.id,
    slug,
    initials:
      counterpart && !isCounterpartFormerBusiness
        ? initialsOf(first, last)
        : isOfficial
          ? "QP"
          : "",
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
    preview: directPreview(dto.lastMessage, t),
    // DES-190: see the matching comment in `groupConversationToView`. A DM's
    // `preview` is already the sender-agnostic display text, but the row
    // still needs to know WHO sent it to show "You: " when the viewer did.
    lastMessageSenderHandle: dto.lastMessage?.sender.handle || undefined,
    lastMessageBody: dto.lastMessage
      ? messageDisplayText(dto.lastMessage)
      : undefined,
    lastMessageIsSystem: dto.lastMessage?.kind === "system",
    ...lastMessageMailboxFields(dto.lastMessage),
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
    // Business mailboxes: the counterpart's identity when the other side is
    // a business, persona or company (a profile counterpart leaves these
    // unset), and the staff-only claim, whose null and absent both survive.
    counterpartIdentityId: counterpart?.identityId,
    counterpartIdentityKind:
      counterpart?.identityKind && counterpart.identityKind !== "profile"
        ? counterpart.identityKind
        : undefined,
    isCounterpartFormerBusiness: isCounterpartFormerBusiness || undefined,
    mailboxIdentityId: dto.mailboxIdentityId,
    claimedAt: dto.claimedAt,
    claimedBy: toConversationClaimant(dto.claimedBy),
    claimedByUserId: dto.claimedByUserId,
    claimTakenOverFrom: toConversationClaimant(dto.claimTakenOverFrom),
    messages: [],
  };
}

/** The wire attachment onto the bubble's attachment type. The backend may send
 *  `caption: null`, while `GifAttachment`/`DocumentAttachment` promise a caption
 *  is absent whenever there is none, so a null or empty one is dropped here.
 *
 *  A sticker is checked FIRST, before the `fileName` test: it is the third
 *  shape `MessageResponse["attachment"]` carries (`StickerAttachmentResponse`)
 *  and, unlike the other two, has no `caption` at all, so it must never reach
 *  either the document or the image/gif branch below, both of which
 *  destructure `caption` off whatever they're given.
 *
 *  This narrows with a raw `"stickerId" in attachment` check rather than the
 *  shared `isStickerAttachment` guard (`shared/api/stickerAttachment.ts`):
 *  that guard's parameter type is pinned to the already-normalized
 *  `ChatMessage["attachment"]` shapes, whose `caption` is optional-only
 *  (`string | undefined`); the wire shape here still carries the nullable
 *  `string | null` caption, which is not assignable to it. `stickerId` is
 *  unique to the sticker member of the wire union, so this narrows exactly
 *  as precisely as the shared guard would, for the one caller that sits on
 *  the wire shape instead of the FE one, mirroring the `"fileName" in
 *  attachment` structural check the document branch already uses for the
 *  same reason. */
function attachmentToChat(
  attachment: MessageResponse["attachment"],
): ChatMessage["attachment"] {
  if (!attachment) return undefined;
  if ("stickerId" in attachment) return attachment;
  if ("fileName" in attachment) {
    const { caption: documentCaption, ...document } = attachment;
    return documentCaption
      ? { ...document, caption: documentCaption }
      : document;
  }
  const { caption: imageCaption, ...image } = attachment;
  return imageCaption ? { ...image, caption: imageCaption } : image;
}

/** MessageResponse → a single chat bubble, `from` decided by
 *  `isFromViewerSide`: a reply sent as a business the viewer staffs sits on
 *  the viewer's side whoever typed it. */
export function messageToChat(
  dto: MessageResponse,
  viewer: MessageViewer,
): ChatMessage {
  const isMe = isFromViewerSide(dto.sender, viewer);
  const isSystem = dto.kind === "system";
  return {
    id: dto.id,
    from: isMe ? "me" : "them",
    // CRITICAL 1: a sticker's stored `body` is always empty (see
    // `messageDisplayText`'s own doc); falling back to its label here is
    // what lets a forwarded sticker's `SendMessageDto.body` clear
    // `@MinLength(1)` instead of 400ing forever.
    text: messageDisplayText(dto),
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
              : dto.kind === "sticker"
                ? "sticker"
                : undefined,
    attachment: attachmentToChat(dto.attachment),
    systemEvent: dto.systemEvent
      ? {
          type: normalizeSystemEventType(dto.systemEvent.type),
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
              ? dto.systemEvent.actorHandle === viewer.myHandle
              : isMe),
          targetIsMe:
            dto.systemEvent.targetIsMe ??
            (dto.systemEvent.targetHandle != null &&
              dto.systemEvent.targetHandle === viewer.myHandle),
          mailboxName: movedNoteMailboxName(dto.systemEvent),
        }
      : undefined,
    // Group attribution: the sender's identity so a received run in a group can
    // show a name label + avatar. Harmlessly carried in DMs too (ignored there).
    // A `system` row names its actor through the event itself (`systemEvent`),
    // never through these sender fields: the mailbox migration writes such a
    // row with `sender_id` NULL, which the server renders as "Former member"
    // (`isFormerMember: true`) purely so an OLDER client (one that doesn't
    // know this event yet) still shows something plausible. A client that DOES
    // know the event must never let that server-side placeholder reach a pill
    // or a run, so every sender field below is left undefined for a system row.
    senderName: dto.kind === "system" ? undefined : dto.sender.displayName,
    senderHandle:
      dto.kind === "system" ? undefined : dto.sender.handle || undefined,
    senderTint:
      dto.kind === "system"
        ? undefined
        : dto.sender.handle
          ? tintForSlug(dto.sender.handle)
          : undefined,
    senderAvatar:
      dto.kind === "system" ? undefined : (dto.sender.avatarUrl ?? undefined),
    // ENG-243: an erased sender renders as a localized "Former member" on
    // an ordinary message. A system row's sender fields are always left
    // undefined instead, per the comment above.
    isSenderFormerMember:
      dto.kind === "system"
        ? undefined
        : dto.sender.isFormerMember || undefined,
    // Business mailboxes, under the same system-row rule: the identity the
    // message was sent as, the staff first name this reader may see, a
    // deleted business's flag, and the server's word on who typed a reply
    // (`undefined` when the key is absent, since `false` names a colleague).
    senderIdentityId: isSystem ? undefined : dto.sender.identityId,
    senderIdentityKind: isSystem ? undefined : dto.sender.identityKind,
    senderStaffFirstName: isSystem ? undefined : dto.sender.staffFirstName,
    isSenderFormerBusiness: isSystem
      ? undefined
      : dto.sender.isFormerIdentity || undefined,
    isSentByViewer: isSystem ? undefined : dto.isSentByViewer,
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
 * (`from`, `actorIsMe`: their handle and staffed identities) and the locale
 * (`time`), so each entry remembers the context it was built for and rebuilds
 * when that moves. A WeakMap lets an entry go with its DTO once the query
 * cache drops it.
 */
const chatMessageByDto = new WeakMap<
  MessageResponse,
  { contextKey: string; chatMessage: ChatMessage }
>();

function stableMessageToChat(
  dto: MessageResponse,
  viewer: MessageViewer,
  contextKey: string,
): ChatMessage {
  const cached = chatMessageByDto.get(dto);
  if (cached && cached.contextKey === contextKey) return cached.chatMessage;
  const chatMessage = messageToChat(dto, viewer);
  chatMessageByDto.set(dto, { contextKey, chatMessage });
  return chatMessage;
}

/** Group an oldest-first message list into the `{ day, dayKey, items }[]` the
 *  panel renders. Bucketed by `dayKey` (the stable machine id), not the `day`
 *  display label — see `localDayKey`'s doc. Bubbles come from
 *  `stableMessageToChat`, so an unchanged DTO keeps its bubble object. */
export function groupMessages(
  messages: MessageResponse[],
  viewer: MessageViewer,
): { day: string; dayKey: string; items: ChatMessage[] }[] {
  const groups: { day: string; dayKey: string; items: ChatMessage[] }[] = [];
  // The staffed identities are part of the context: gaining or losing a
  // mailbox moves a business reply between sides, so every bubble rebuilds.
  const staffedIdentitiesKey = [...viewer.staffedIdentityIds].sort().join(",");
  const contextKey = `${activeLocale()}|${viewer.myHandle ?? ""}|${staffedIdentitiesKey}`;
  for (const message of messages) {
    const parsed = new Date(message.createdAt);
    const dayKey = Number.isNaN(parsed.getTime())
      ? message.createdAt
      : localDayKey(parsed);
    const chatMessage = stableMessageToChat(message, viewer, contextKey);
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
