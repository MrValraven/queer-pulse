import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import { activeLocale } from "../../../shared/i18n/locale";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";
import type { ChatMessage, Conversation, GroupMemberView } from "../data";
import type { ConversationResponse, MessageResponse } from "./messages.api";

// Map the backend DTOs onto the EXISTING messages view-models (../data.ts) so
// ConversationPanel / MessagesThreadList render unchanged. Prototype-only fields
// (initials, tint, day-grouping) are synthesized from the DTO.

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.length > 1 ? parts.at(-1)! : "" };
}

/** "9:14 PM" / weekday / date label the thread rows + bubbles show. Exported
 *  for `patchConversationPreview` (`shared/api/messageCache.ts`), which needs
 *  the same formatting to patch a socket/send frame into the inbox row's
 *  `time` field without a `["conversations"]` refetch. */
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const locale = activeLocale();
  if (sameDay)
    return d.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
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

/** Group avatar initials from a title ("Pride Brunch Crew" → "PB"). */
function groupInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return title.trim().slice(0, 2).toUpperCase();
}

/** Inbox preview for a group's last message: sender first name prefixed for a
 *  member message ("Ana: …"), or the system fallback body prefixed with the
 *  actor ("Ana created the group"). Empty when the group has no messages. */
function groupPreview(last: MessageResponse | null): string {
  if (!last) return "";
  const first = last.sender.displayName.trim().split(/\s+/)[0] ?? "";
  if (last.kind === "system") return `${first} ${last.body}`.trim();
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
): Conversation {
  const title = dto.title ?? t("messages:group.untitled");
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
    preview: groupPreview(dto.lastMessage),
    unread: dto.unreadCount > 0,
    unreadCount: dto.unreadCount,
    pinnedAt: dto.pinnedAt ?? undefined,
    favorite: dto.favorite ?? undefined,
    muted: dto.muted ?? undefined,
    archivedAt: dto.archivedAt ?? undefined,
    draft: dto.draft ?? undefined,
    members,
    memberCount: dto.memberCount,
    hasLeft: dto.hasLeft ?? false,
    myRole: dto.myRole ?? undefined,
    // SERVER-AUTHORITATIVE capability flags — the management UI gates on these.
    canAddMembers: dto.canAddMembers ?? false,
    canRemoveMembers: dto.canRemoveMembers ?? false,
    canRename: dto.canRename ?? false,
    canManageRoles: dto.canManageRoles ?? false,
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
): Conversation {
  if (dto.kind === "group") return groupConversationToView(dto, t);
  const p = dto.otherParticipant;
  const name = p?.displayName ?? t("messages:conversation.officialName");
  const { first, last } = splitName(name);
  const slug = p?.handle;
  const tint: AvatarTint = slug ? tintForSlug(slug) : "plum";
  return {
    id: dto.id,
    slug,
    initials: p ? initialsOf(first, last) : "QP",
    tint,
    avatarUrl: p?.avatarUrl ?? undefined,
    name,
    // Only ever rendered when `official` is false — `ConversationHeader`
    // shows a dedicated translated "Official" meta line instead of this field
    // whenever `official` is true, so there's no English literal to leak here.
    pronouns: p ? "" : "",
    connectedSince: "",
    time: timeLabel(dto.updatedAt),
    updatedAt: dto.updatedAt,
    preview: dto.lastMessage?.body ?? "",
    unread: dto.unreadCount > 0,
    pinnedAt: dto.pinnedAt ?? undefined,
    favorite: dto.favorite ?? undefined,
    muted: dto.muted ?? undefined,
    archivedAt: dto.archivedAt ?? undefined,
    draft: dto.draft ?? undefined,
    otherLastReadAt: dto.otherLastReadAt ?? undefined,
    otherDeliveredAt: dto.otherDeliveredAt ?? undefined,
    otherParticipantId: dto.otherParticipantId ?? undefined,
    official: !p,
    messages: [],
  };
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
    time: timeLabel(dto.createdAt),
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
            : undefined,
    attachment: dto.attachment ?? undefined,
    systemEvent: dto.systemEvent
      ? {
          type: dto.systemEvent.type,
          actorName: dto.systemEvent.actorName,
          targetName: dto.systemEvent.targetName,
          value: dto.systemEvent.value,
          actorIsMe: isMe,
        }
      : undefined,
    // Group attribution: the sender's identity so a received run in a group can
    // show a name label + avatar. Harmlessly carried in DMs too (ignored there).
    senderName: dto.sender.displayName,
    senderHandle: dto.sender.handle || undefined,
    senderTint: dto.sender.handle ? tintForSlug(dto.sender.handle) : undefined,
    senderAvatar: dto.sender.avatarUrl ?? undefined,
  };
}

/** Group an oldest-first message list into the `{ day, dayKey, items }[]` the
 *  panel renders. Bucketed by `dayKey` (the stable machine id), not the `day`
 *  display label — see `localDayKey`'s doc. */
export function groupMessages(
  messages: MessageResponse[],
  myHandle: string | null,
): { day: string; dayKey: string; items: ChatMessage[] }[] {
  const groups: { day: string; dayKey: string; items: ChatMessage[] }[] = [];
  for (const m of messages) {
    const parsed = new Date(m.createdAt);
    const dayKey = Number.isNaN(parsed.getTime())
      ? m.createdAt
      : localDayKey(parsed);
    const day = dayLabel(m.createdAt);
    const bucket = groups.at(-1);
    if (bucket && bucket.dayKey === dayKey)
      bucket.items.push(messageToChat(m, myHandle));
    else groups.push({ day, dayKey, items: [messageToChat(m, myHandle)] });
  }
  return groups;
}
