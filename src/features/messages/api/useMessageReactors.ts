// src/features/messages/api/useMessageReactors.ts
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MessageReactor } from "../../../shared/contracts/contracts";
import { getMessageReactors } from "./messages.api";

/** The react-query key for one message's "who reacted" list (PRD-352). The
 *  reaction toggle (`useToggleReaction`) and the socket `reaction` handler in
 *  `shared/api/realtime.ts` (which spells the same literal, since the shared
 *  layer does not import feature code) invalidate it, so an open sheet
 *  refetches whenever the counts move. */
export function messageReactorsQueryKey(messageId: string | null) {
  return ["messageReactors", messageId] as const;
}

/**
 * The members who reacted to one message, fetched lazily for the reactions
 * sheet so `MessageResponse` never carries them. Live only: demo messages
 * have no server id and there is no endpoint to call, so demo mode keeps the
 * query disabled (and the sheet never opens there to begin with).
 * `conversationId` is the thread's real server id, which the route is nested
 * under.
 */
export function useMessageReactors(
  messageId: string | null,
  isEnabled: boolean,
  conversationId: string | null,
) {
  const { demoMode } = useDemoMode();
  const canFetch = isEnabled && !demoMode && !!messageId && !!conversationId;
  return useQuery<MessageReactor[]>({
    queryKey: messageReactorsQueryKey(messageId),
    queryFn: async ({ signal }) => {
      if (!conversationId || !messageId) return [];
      const response = await getMessageReactors(
        conversationId,
        messageId,
        signal,
      );
      return response.reactors;
    },
    enabled: canFetch,
  });
}
