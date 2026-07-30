import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, GroupMemberView } from "./data";

/** One "seen by" entry — a member whose read watermark has caught a message. */
export interface SeenByEntry {
  /** User id (live) — correlates the row; absent in demo. */
  id?: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
  /** ISO of this member's read watermark, for the "· 9:14 PM" time on the row. */
  at?: string;
}

/**
 * Members who have SEEN the caller's given (last outbound) group message —
 * computed client-side from each member's read watermark (surfaced per-member on
 * the group DTO), so there's no N+1 per-message receipts endpoint. A member has
 * seen the message when their `lastReadAt` is at-or-after the message's `at`.
 * The signed-in member is always excluded. Demo has no timestamps, so any member
 * with a seeded watermark counts (a simulated receipt).
 */
export function computeGroupSeenBy(
  members: GroupMemberView[] | undefined,
  lastOutbound: ChatMessage | undefined,
  self: { id: string | null; slug?: string },
): SeenByEntry[] {
  if (!members || !lastOutbound) return [];
  const messageAt = lastOutbound.at;
  return members
    .filter((member) => {
      const isSelf =
        (!!self.id && member.id === self.id) ||
        (!!self.slug && member.slug === self.slug);
      if (isSelf || !member.lastReadAt) return false;
      return messageAt ? member.lastReadAt >= messageAt : true;
    })
    .map((member) => ({
      id: member.id,
      name: member.name,
      initials: member.initials,
      tint: member.tint,
      avatarUrl: member.avatarUrl,
      at: member.lastReadAt,
    }));
}

/**
 * First names of the members currently typing, resolved from the live typing
 * user ids against the roster (unknown ids — e.g. a just-added member not yet in
 * the fetched roster — are dropped). Drives the group typing label
 * ("Ana is typing" / "Ana and Bea are typing" / "Several people are typing…").
 */
export function resolveTyperNames(
  typingUserIds: string[],
  members: GroupMemberView[] | undefined,
): string[] {
  if (!members) return [];
  return typingUserIds
    .map((id) => members.find((member) => member.id === id))
    .filter((member): member is GroupMemberView => !!member)
    .map((member) => member.name.split(" ")[0] ?? member.name);
}

/**
 * The GROUP typing label ("Ana is typing…" / "Ana and Bea are typing…" /
 * "Several people are typing…"), resolved from the live typing user ids
 * against the roster; `undefined` when no one is typing (DM callers fall back
 * to their own single-name label instead of calling this at all).
 */
export function resolveGroupTypingLabel(
  typingUserIds: string[],
  anyTyping: boolean,
  members: GroupMemberView[] | undefined,
  t: TFunction,
): string | undefined {
  if (!anyTyping) return undefined;
  const typerNames = resolveTyperNames(typingUserIds, members);
  if (typerNames.length >= 3) return t("messages:group.typingMany");
  if (typerNames.length === 2) {
    return t("messages:group.typingTwo", {
      first: typerNames[0]!,
      second: typerNames[1]!,
    });
  }
  if (typerNames.length === 1) {
    return t("messages:conversation.typing", { name: typerNames[0]! });
  }
  return t("messages:group.typingSomeone");
}
