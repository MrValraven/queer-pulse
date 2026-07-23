import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { ChatMessage, Conversation } from "../data";
import type { ConversationResponse, MessageResponse } from "./messages.api";

// Map the backend DTOs onto the EXISTING messages view-models (../data.ts) so
// ConversationPanel / MessagesThreadList render unchanged. Prototype-only fields
// (initials, tint, day-grouping) are synthesized from the DTO.

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.length > 1 ? parts.at(-1)! : "" };
}

/** "9:14 PM" / weekday / date label the thread rows + bubbles show. */
function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay)
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  const days = Math.round((now.getTime() - d.getTime()) / 86_400_000);
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Day heading ("Today" / "Yesterday" / "1 Jun") the panel groups by. */
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
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** ConversationResponse → the inbox `Conversation` row (messages filled later). */
export function conversationToView(dto: ConversationResponse): Conversation {
  const p = dto.otherParticipant;
  const name = p?.displayName ?? "QueerPulse Team";
  const { first, last } = splitName(name);
  const slug = p?.handle;
  const tint: AvatarTint = slug ? tintForSlug(slug) : "plum";
  return {
    id: dto.id,
    slug,
    initials: p ? initialsOf(first, last) : "QP",
    tint,
    name,
    pronouns: p ? "" : "Official",
    connectedSince: "",
    time: timeLabel(dto.updatedAt),
    preview: dto.lastMessage?.body ?? "",
    unread: dto.unreadCount > 0,
    official: !p,
    messages: [],
  };
}

/** MessageResponse → a single chat bubble, `from` decided by the sender handle. */
export function messageToChat(
  dto: MessageResponse,
  myHandle: string | null,
): ChatMessage {
  return {
    id: dto.id,
    from: myHandle && dto.sender.handle === myHandle ? "me" : "them",
    text: dto.body,
    time: timeLabel(dto.createdAt),
  };
}

/** Group an oldest-first message list into the `{ day, items }[]` the panel renders. */
export function groupMessages(
  messages: MessageResponse[],
  myHandle: string | null,
): { day: string; items: ChatMessage[] }[] {
  const groups: { day: string; items: ChatMessage[] }[] = [];
  for (const m of messages) {
    const day = dayLabel(m.createdAt);
    const bucket = groups.at(-1);
    if (bucket && bucket.day === day)
      bucket.items.push(messageToChat(m, myHandle));
    else groups.push({ day, items: [messageToChat(m, myHandle)] });
  }
  return groups;
}

/** Sum unread across conversations for the nav badge. */
export function unreadTotal(convos: ConversationResponse[]): number {
  return convos.reduce((n, c) => n + (c.unreadCount ?? 0), 0);
}
