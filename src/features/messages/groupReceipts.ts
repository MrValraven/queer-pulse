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
 * The signed-in member is always excluded. A message still in flight is never
 * "seen": an optimistic send (`!id && !!localId`) has no `at` of its own, so
 * without this guard every member who has EVER read anything in the thread
 * would satisfy the no-timestamp fallback below the instant the send fires,
 * a false "Seen by N" that flashes and then vanishes once the server row
 * (with a real `at`) lands. The one exception is the demo simulation, which
 * drives an optimistic message straight to `status: "seen"` on a timer and
 * never gives it a server `id`, so that message stays optimistic forever and
 * must still pass once the ladder reaches "seen". That demo-"seen" message is
 * itself a SIMULATED receipt, not a real one: its `at` is stamped from this
 * device's clock while the seeded member watermarks are fixed in the past, so
 * comparing them would never match. It takes the same no-timestamp branch as
 * seeded demo history below, which carries neither `id` nor `localId` and so
 * never trips the in-flight check at all.
 */
export function computeGroupSeenBy(
  members: GroupMemberView[] | undefined,
  lastOutbound: ChatMessage | undefined,
  self: { id: string | null; slug?: string },
): SeenByEntry[] {
  if (!members || !lastOutbound) return [];
  const isOptimistic = !lastOutbound.id && !!lastOutbound.localId;
  if (isOptimistic && lastOutbound.status !== "seen") return [];
  // A still-optimistic message the demo ladder has marked "seen" simulates a
  // receipt against a fixed-past seeded watermark, not a real clock reading:
  // take the no-timestamp branch for it, exactly as seeded demo history does.
  const messageAt = isOptimistic ? undefined : lastOutbound.at;
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
 * Overlays live per-member `read`-frame watermarks onto a group roster,
 * keeping whichever `lastReadAt` is newer per member (ENG-223). The roster's
 * own `lastReadAt` is only an inbox snapshot, so a member who reads the
 * thread while it's open would otherwise not show as having seen it until
 * the next refetch. Returns the original `members` reference unchanged when
 * there's nothing to overlay (no roster, no live watermarks for this
 * conversation, or every live watermark is already stale), so callers that
 * memoise on the result don't recompute for no reason.
 */
export function overlayLiveReadWatermarks(
  members: GroupMemberView[] | undefined,
  liveReadWatermarksByMemberId: Record<string, string> | undefined,
): GroupMemberView[] | undefined {
  if (!members || !liveReadWatermarksByMemberId) return members;
  let hasNewerWatermark = false;
  const overlaidMembers = members.map((member) => {
    const liveReadWatermark = member.id
      ? liveReadWatermarksByMemberId[member.id]
      : undefined;
    if (!liveReadWatermark) return member;
    if (member.lastReadAt && member.lastReadAt >= liveReadWatermark) {
      return member; // ISO strings compare lexicographically
    }
    hasNewerWatermark = true;
    return { ...member, lastReadAt: liveReadWatermark };
  });
  return hasNewerWatermark ? overlaidMembers : members;
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
