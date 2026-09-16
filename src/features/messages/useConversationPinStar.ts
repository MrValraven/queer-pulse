import { useCallback } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  usePinnedMessages,
  useTogglePin,
  useToggleStar,
} from "./api/useMessagePinStar";
import type { ChatMessage, Conversation } from "./data";
import type { MessageResponse } from "../../shared/contracts/contracts";

/**
 * Pin (SHARED) + star (PRIVATE) wiring for the open conversation, extracted from
 * `ConversationPanel` to keep it under the component-size cap. In live mode a
 * just-picked recipient's placeholder carries the counterpart's slug as its id
 * (no server conversation yet), so the conversation-scoped hooks are gated off
 * it: that id would 400 the UUID-validated routes. Demo ids are stable registry
 * ids even when they equal the slug (anika, jordan, kai, maria), so demo passes
 * `active.id` through. Pin/star only ever fire on a message with a stable id
 * (live server messages and demo seed messages carry one; optimistic sends have
 * none), exactly like reactions.
 */
export function useConversationPinStar(active: Conversation): {
  pinnedMessages: MessageResponse[];
  onTogglePin: (message: ChatMessage) => void;
  onToggleStar: (message: ChatMessage) => void;
} {
  const { demoMode } = useDemoMode();
  const conversationId =
    demoMode || active.id !== active.slug ? active.id : null;
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
        toggleStar.mutate({
          messageId: message.id,
          starred: !!message.starred,
        });
      }
    },
    [toggleStar],
  );

  return { pinnedMessages: pinnedQuery.data ?? [], onTogglePin, onToggleStar };
}
