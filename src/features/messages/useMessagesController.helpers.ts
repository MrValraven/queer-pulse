import type { TFunction } from "../../shared/i18n/types";
import type {
  ChatMessage,
  ChatSystemEvent,
  Conversation,
  GroupMemberView,
} from "./data";
import type { GroupMemberPick } from "./NewGroupModal";

/** A day-bucketed run of messages (demo `Conversation.messages` / live `thread.groups`). */
export type MessageGroup = { day: string; items: ChatMessage[] };

/** Group avatar initials from a title ("Pride Brunch Crew" → "PB"). */
export function groupInitialsFromTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return title.trim().slice(0, 2).toUpperCase() || "GP";
}

/**
 * A client-generated idempotency id for an optimistic message. Sent to the
 * server as `clientMessageId` on the POST, so the dual HTTP + WS write paths and
 * any offline-outbox retry all collapse to a single stored row (the server
 * dedupes on it) and the optimistic bubble reconciles against its server copy by
 * the same key. Falls back to a random-enough token where `crypto.randomUUID` is
 * unavailable (older embedded webviews), which still satisfies uniqueness.
 */
export function nextLocalId(): string {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }
  // Fallback for older embedded webviews without `crypto.randomUUID`. Must still
  // be a valid v4 UUID — the server validates `clientMessageId` as one (a plain
  // token would 400) — so synthesize the canonical v4 shape.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * The real server conversation id for `active`, or null while it's still a
 * just-picked placeholder. A picked-but-not-yet-created recipient uses the
 * member's slug as its `id` (see `buildRecipientConversation` /
 * `connectionToRecipient`); a real conversation's id is a server UUID, always
 * distinct from the counterpart's handle. Live conversation-scoped requests
 * (message history, realtime join, mark-read) must NOT fire against the
 * placeholder — the backend validates `/conversations/:id` with `ParseUUIDPipe`,
 * so a slug returns `400 "Validation failed (uuid is expected)"`. Returning null
 * keeps those hooks inert until `startConversation` reconciles the real UUID.
 */
export function realConversationId(conversation: Conversation | null): string | null {
  if (!conversation) return null;
  return conversation.id === conversation.slug ? null : conversation.id;
}

/** A demo group with `event` appended as a centred system pill in Today. */
export function withDemoSystemPill(
  conversation: Conversation,
  event: ChatSystemEvent,
): Conversation {
  const pill: ChatMessage = { from: "me", text: "", kind: "system", systemEvent: event };
  const messages = conversation.messages.map((group) => ({ ...group, items: [...group.items] }));
  const today = messages.find((group) => group.day === "Today");
  if (today) today.items.push(pill);
  else messages.push({ day: "Today", items: [pill] });
  return { ...conversation, messages };
}

/**
 * Build the demo mock group conversation (owner = the signed-in member) with a
 * `group_created` system message — the local-only counterpart to POST
 * /conversations/group. Pure: the caller wires it into thread state.
 */
export function buildDemoGroupConversation(
  title: string,
  members: GroupMemberPick[],
  avatarUrl: string | undefined,
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined,
  t: TFunction,
): Conversation {
  const myName = myProfile
    ? `${myProfile.firstName} ${myProfile.lastName}`.trim()
    : t("messages:conversation.you");
  const memberViews: GroupMemberView[] = [
    {
      name: myName,
      initials:
        (myProfile?.firstName?.[0] ?? "") + (myProfile?.lastName?.[0] ?? ""),
      tint: "plum",
      role: "owner",
      slug: myProfile?.slug,
    },
    ...members.map((member) => ({
      name: member.name,
      initials: member.initials,
      tint: member.tint,
      role: "member" as const,
      slug: member.slug,
    })),
  ];
  const groupId = `group-${Date.now()}`;
  return {
    id: groupId,
    isGroup: true,
    initials: groupInitialsFromTitle(title),
    tint: "plum",
    avatarUrl: avatarUrl || undefined,
    name: title.trim(),
    pronouns: "",
    connectedSince: "",
    time: t("messages:time.justNow"),
    preview: "",
    unread: false,
    members: memberViews,
    memberCount: memberViews.length,
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
              actorName: myName,
              actorIsMe: true,
            },
          },
        ],
      },
    ],
  };
}

/**
 * Base history (mock groups in demo, fetched groups in live) merged with the
 * thread's optimistic (session) sends. Drops any optimistic bubble whose server
 * row has already landed in the base history — the socket `message:new` patch
 * (deduped by `clientMessageId`) can arrive a beat before the send mutation
 * removes the optimistic copy, so without this filter both would render for that
 * frame. The shared key is the client id (`localId` on the optimistic bubble,
 * carried onto the server bubble by `messageToChat`).
 */
export function mergeOptimisticGroups(
  active: Conversation,
  demoMode: boolean,
  threadGroups: MessageGroup[],
  sent: Record<string, ChatMessage[]>,
): MessageGroup[] {
  const base = demoMode ? active.messages : threadGroups;
  const optimistic = sent[active.id];
  if (!optimistic || optimistic.length === 0) return base;
  const settledIds = new Set<string>();
  for (const group of base) {
    for (const item of group.items) {
      if (item.localId) settledIds.add(item.localId);
    }
  }
  const extra = optimistic.filter(
    (message) => !(message.localId && settledIds.has(message.localId)),
  );
  if (extra.length === 0) return base;
  const groups = base.map((g) => ({ ...g, items: [...g.items] }));
  const today = groups.find((g) => g.day === "Today");
  if (today) {
    today.items = [...today.items, ...extra];
    return groups;
  }
  return [...groups, { day: "Today", items: extra }];
}
