import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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
 * distinct thread). Each live send settles independently so one blocked or
 * severed thread never stops the rest from going out (PRD-347).
 *
 * Demo mode's mutation is a no-op, so a demo share lands in its thread here
 * (`landDemoShare`): the toast's "Open" then shows the message that was sent.
 * It loads on demand, since it reaches the scripted demo inbox and every page
 * with a share menu mounts this hook (ENG-504).
 */
export function useSendToConversations() {
  const sendMessage = useSendMessage();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  async function sendToMany(
    conversationIds: string[],
    body: string,
  ): Promise<ShareSendResult[]> {
    if (demoMode) {
      // A chunk that fails to load (offline, a stale deploy) settles every
      // share as failed, so the modal's Send returns from "Sending" and the
      // error toast says it did not go out.
      const demoShareModule = await import("./demoShareSend").catch(() => null);
      if (!demoShareModule) {
        return conversationIds.map((conversationId) => ({
          conversationId,
          ok: false,
        }));
      }
      const { landDemoShare } = demoShareModule;
      return conversationIds.map((conversationId) => {
        landDemoShare(queryClient, conversationId, body, nextLocalId());
        return { conversationId, ok: true };
      });
    }
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
