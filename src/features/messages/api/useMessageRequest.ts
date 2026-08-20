import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/useConnections";
import type { MessageRequestResponse } from "../../../shared/contracts/contracts";
import { sendMessageRequest } from "./messages.api";

export interface SendMessageRequestInput {
  toSlug: string;
  body: string;
}

/**
 * POST /messages/request — the "message someone you're not connected with
 * yet" entry point `NewMessageModal` falls through to when the picked member
 * isn't an accepted connection. The backend endpoint is a single smart send:
 * if the two are already connected it delivers `body` as an ordinary message
 * (`conversationId` comes back set); otherwise it seeds a connection request
 * with `body` as the intro message (`connectionRequestId` comes back set —
 * the conversation itself only materializes once the recipient accepts, from
 * the "Requests" inbox tab or the Connections page).
 *
 * Demo mode has no real message-request state to materialize, so it mirrors
 * the SAME local "sent" simulation `ConnectModal`'s demo path already writes
 * (`useConnections().sendRequest`) — a demo request shows up under
 * Connections > Sent exactly as a live one would appear pending there.
 */
export function useSendMessageRequest() {
  const { demoMode } = useDemoMode();
  const { sendRequest } = useConnections();
  const queryClient = useQueryClient();

  return useMutation<MessageRequestResponse, Error, SendMessageRequestInput>({
    mutationFn: async ({ toSlug, body }) => {
      if (demoMode) {
        sendRequest(toSlug);
        return { conversationId: null, connectionRequestId: `demo-${toSlug}` };
      }
      return sendMessageRequest(toSlug, body);
    },
    onSuccess: (result) => {
      if (demoMode) return;
      // A request that landed as an ordinary message (already connected) puts
      // a new/updated row straight in the inbox; a seeded connection request
      // shows up under Connections > Sent. Either way, refresh both — cheap,
      // and this mutation fires rarely (once per new first-contact attempt).
      if (result.conversationId) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
