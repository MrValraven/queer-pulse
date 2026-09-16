import { useSendMessage } from "../api/useMessageMutations";
import { nextLocalId } from "../useMessagesController.helpers";

export interface ShareSendResult {
  conversationId: string;
  ok: boolean;
}

/**
 * Fan a single share body out to several conversations, through the SAME
 * idempotent send path the composer uses (`useSendMessage`, one fresh
 * `clientMessageId` per conversation, since each is a distinct message to a
 * distinct thread, not a retry of the same one). Demo mode's mutation is
 * already a no-op that resolves (see `useSendMessage`), so every demo send
 * reports `ok: true` without touching the network, the same posture
 * `useSharePlans` takes for the gathering "Share plans" send. Each send
 * settles independently so one blocked or severed thread never stops the
 * rest from going out (PRD-347).
 */
export function useSendToConversations() {
  const sendMessage = useSendMessage();

  async function sendToMany(
    conversationIds: string[],
    body: string,
  ): Promise<ShareSendResult[]> {
    const outcomes = await Promise.allSettled(
      conversationIds.map((conversationId) =>
        sendMessage.mutateAsync({
          conversationId,
          body,
          clientMessageId: nextLocalId(),
        }),
      ),
    );
    return conversationIds.map((conversationId, index) => ({
      conversationId,
      ok: outcomes[index]?.status === "fulfilled",
    }));
  }

  return { sendToMany };
}
