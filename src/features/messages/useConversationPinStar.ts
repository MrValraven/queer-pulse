import { useCallback } from "react";
import {
  usePinnedMessages,
  useTogglePin,
  useToggleStar,
} from "./api/useMessagePinStar";
import type { ChatMessage, Conversation } from "./data";
import type { MessageResponse } from "../../shared/contracts/contracts";

/**
 * Pin (SHARED) + star (PRIVATE) wiring for the open conversation, extracted from
 * `ConversationPanel` to keep it under the component-size cap. A just-picked
 * recipient's placeholder carries the counterpart's slug as its id (no server
 * conversation yet), so gate the conversation-scoped hooks off it — the id would
 * 400 the UUID-validated routes. Pin/star only ever fire on a message with a
 * server id (demo mock/optimistic messages have none), exactly like reactions.
 */
export function useConversationPinStar(active: Conversation): {
  pinnedMessages: MessageResponse[];
  onTogglePin: (message: ChatMessage) => void;
  onToggleStar: (message: ChatMessage) => void;
} {
  const conversationId = active.id === active.slug ? null : active.id;
  const togglePin = useTogglePin(conversationId);
  const toggleStar = useToggleStar(conversationId);
  const pinnedQuery = usePinnedMessages(conversationId);

  const onTogglePin = useCallback(
    (message: ChatMessage) => {
      if (message.id) {
        togglePin.mutate({ messageId: message.id, pinned: !!message.pinnedAt });
      }
    },
    [togglePin],
  );
  const onToggleStar = useCallback(
    (message: ChatMessage) => {
      if (message.id) {
        toggleStar.mutate({ messageId: message.id, starred: !!message.starred });
      }
    },
    [toggleStar],
  );

  return { pinnedMessages: pinnedQuery.data ?? [], onTogglePin, onToggleStar };
}
