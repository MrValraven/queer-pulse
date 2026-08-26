import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  sendMessage,
  startConversation,
} from "../../messages/api/messages.api";

/**
 * "Tell someone where I'm going" (LOC-08).
 *
 * Sends the plan as an ordinary direct message to one connection the member
 * chose: open (or reuse) the DM thread, then post the text. Nothing new is
 * stored about the member's whereabouts, nobody is tracked, and the recipient
 * gets a message they can read, keep and reply to like any other.
 *
 * This matters as much for a viewing at a stranger's flat as for a house
 * party, which is why the composed text always carries the time and the most
 * precise place the sender actually holds.
 *
 * Demo mode never touches the network: the modal keeps its own optimistic
 * confirmation, exactly like every other demo write.
 */
export function useSharePlans() {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, { recipientSlug: string; body: string }>({
    mutationFn: async ({ recipientSlug, body }) => {
      if (demoMode) return;
      const conversation = await startConversation(recipientSlug);
      await sendMessage(conversation.id, body);
    },
  });
}
