import { computeGroupSeenBy, type SeenByEntry } from "./groupReceipts";
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
  if (!active.isGroup) return { groupSeenBy: [] };
  return { groupSeenBy: computeGroupSeenBy(active.members, lastOutbound, self) };
}
