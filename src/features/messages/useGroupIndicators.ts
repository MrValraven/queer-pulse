import { useTranslation } from "../../shared/i18n/useTranslation";
import { computeGroupSeenBy, resolveTyperNames, type SeenByEntry } from "./groupReceipts";
import type { ChatMessage, Conversation } from "./data";

export interface GroupIndicators {
  /** GROUP "Seen by N": members whose read watermark caught the caller's latest
   *  message (self excluded). Empty for DMs (they use the single jade tick). */
  groupSeenBy: SeenByEntry[];
  /** GROUP typing label ("Ana is typing…" / "Ana and Bea are typing…" /
   *  "Several people are typing…"), else undefined (DM falls back to its own). */
  typingLabel: string | undefined;
}

/**
 * Derives the group-only chat indicators — "Seen by N" and the aggregated typing
 * label — from the conversation roster + live signals. Kept out of
 * `ConversationPanel` (a pre-existing oversized orchestrator) so its body doesn't
 * grow. A DM returns an empty receipt list + no label, leaving the existing DM
 * receipt/typing paths byte-identical.
 */
export function useGroupIndicators(
  active: Conversation,
  lastOutbound: ChatMessage | undefined,
  typingUserIds: string[],
  anyTyping: boolean,
  self: { id: string | null; slug?: string },
): GroupIndicators {
  const { t } = useTranslation();
  if (!active.isGroup) return { groupSeenBy: [], typingLabel: undefined };

  const groupSeenBy = computeGroupSeenBy(active.members, lastOutbound, self);

  const typerNames = resolveTyperNames(typingUserIds, active.members);
  let typingLabel: string | undefined;
  if (anyTyping) {
    if (typerNames.length >= 3) typingLabel = t("messages:group.typingMany");
    else if (typerNames.length === 2)
      typingLabel = t("messages:group.typingTwo", {
        first: typerNames[0]!,
        second: typerNames[1]!,
      });
    else if (typerNames.length === 1)
      typingLabel = t("messages:conversation.typing", { name: typerNames[0]! });
    else typingLabel = t("messages:group.typingSomeone");
  }
  return { groupSeenBy, typingLabel };
}
