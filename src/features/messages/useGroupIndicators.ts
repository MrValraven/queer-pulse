import { useCallback, useMemo, useState } from "react";
import { useReadFrames } from "../../shared/api/realtime";
import {
  computeGroupSeenBy,
  overlayLiveReadWatermarks,
  type SeenByEntry,
} from "./groupReceipts";
import type { ChatMessage, Conversation } from "./data";

export interface GroupIndicators {
  /** GROUP "Seen by N": members whose read watermark caught the caller's latest
   *  message (self excluded). Empty for DMs (they use the single jade tick). */
  groupSeenBy: SeenByEntry[];
}

/**
 * Derives the group-only "Seen by N" receipt from the conversation roster +
 * the last outbound message. Kept out of `ConversationPanel` (a pre-existing
 * oversized orchestrator) so its body doesn't grow. A DM returns an empty
 * receipt list, leaving the existing DM receipt path byte-identical.
 *
 * The roster's `lastReadAt` is an INBOX SNAPSHOT, so it's overlaid here with
 * live `read` frames (ENG-223), the same watermark-advancing pattern
 * `useMessageReceipts` uses for the DM tick, so "Seen by N" advances while
 * the thread stays open instead of waiting for the next inbox refetch. Demo
 * mode has no socket, so no frames ever arrive and the overlay is a no-op:
 * behaviour there stays byte-identical.
 *
 * The aggregated GROUP TYPING label is a sibling concern but lives inside
 * `TypingIndicatorRow` instead — it's driven by `useTypingIndicator`, a signal
 * that fires far more often than a read receipt, so it's kept out of this
 * hook (and out of `ConversationPanel`) to avoid re-rendering the whole panel
 * on every typing frame. See `groupReceipts.ts`'s `resolveTyperNames` +
 * `resolveGroupTypingLabel`, reused there.
 */
export function useGroupIndicators(
  active: Conversation,
  lastOutbound: ChatMessage | undefined,
  self: { id: string | null; slug?: string },
): GroupIndicators {
  /** Live per-member read watermarks from `read` frames, keyed by conversation
   *  id then member id: the max ISO `lastReadAt` observed so far for each
   *  member (ISO strings compare lexicographically, per `useMessageReceipts`). */
  const [
    liveReadWatermarksByConversation,
    setLiveReadWatermarksByConversation,
  ] = useState<Record<string, Record<string, string>>>({});

  // A member's own `read` frame reports THEIR lastReadAt. Ignore frames
  // carrying the signed-in member's own id: that's my own read advancing,
  // not a receipt on my sent messages.
  const onRead = useCallback(
    (frame: { conversationId: string; userId: string; lastReadAt: string }) => {
      if (self.id && frame.userId === self.id) return;
      setLiveReadWatermarksByConversation((previousByConversation) => {
        const previousForConversation =
          previousByConversation[frame.conversationId];
        const previousForMember = previousForConversation?.[frame.userId];
        if (previousForMember && previousForMember >= frame.lastReadAt) {
          return previousByConversation; // ISO strings compare lexicographically
        }
        return {
          ...previousByConversation,
          [frame.conversationId]: {
            ...previousForConversation,
            [frame.userId]: frame.lastReadAt,
          },
        };
      });
    },
    [self.id],
  );
  useReadFrames(onRead);

  const liveReadWatermarksForActiveConversation =
    liveReadWatermarksByConversation[active.id];

  /** `active.members` with any live watermark newer than the inbox-snapshot
   *  `lastReadAt` overlaid in, memoised so an unrelated re-render doesn't
   *  rebuild the roster (and so `computeGroupSeenBy`'s own memo-friendliness
   *  isn't defeated by a fresh array on every render). */
  const membersWithLiveReadWatermarks = useMemo(
    () =>
      overlayLiveReadWatermarks(
        active.members,
        liveReadWatermarksForActiveConversation,
      ),
    [active.members, liveReadWatermarksForActiveConversation],
  );

  if (!active.isGroup) return { groupSeenBy: [] };
  return {
    groupSeenBy: computeGroupSeenBy(
      membersWithLiveReadWatermarks,
      lastOutbound,
      self,
    ),
  };
}
