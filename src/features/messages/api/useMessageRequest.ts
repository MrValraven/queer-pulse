import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/useConnections";
import type { MessageRequestResponse } from "../../../shared/contracts/contracts";
import { nextLocalId } from "../useMessagesController.helpers";
import { sendMessageRequest } from "./messages.api";

/**
 * ENG-407: the idempotency key for a first-contact compose, shared by every
 * surface that sends through `useSendMessageRequest`. `keyFor(body)` returns
 * the key paired with that exact text, minting a new one (`nextLocalId`, the
 * thread composer's generator) when the text changed. A retry of the same
 * text after a timeout reuses the key, so the server stores one message; an
 * edited draft is a new message and gets a new key, because a replayed key
 * answers with the stored message and its original text. `clear()` after a
 * confirmed send.
 */
export function useComposeIdempotencyKey() {
  const pendingSendRef = useRef<{ body: string; clientMessageId: string }>(
    null,
  );
  const keyFor = useCallback((body: string): string => {
    let pendingSend = pendingSendRef.current;
    if (!pendingSend || pendingSend.body !== body) {
      pendingSend = { body, clientMessageId: nextLocalId() };
      pendingSendRef.current = pendingSend;
    }
    return pendingSend.clientMessageId;
  }, []);
  const clear = useCallback(() => {
    pendingSendRef.current = null;
  }, []);
  return { keyFor, clear };
}

export interface SendMessageRequestInput {
  toSlug: string;
  body: string;
  /** ENG-407: one id per compose, reused on every retry of that same text,
   *  so a timed-out send the member retries lands once (see
   *  `sendMessageRequest`). */
  clientMessageId?: string;
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
    mutationFn: async ({ toSlug, body, clientMessageId }) => {
      if (demoMode) {
        sendRequest(toSlug);
        return { conversationId: null, connectionRequestId: `demo-${toSlug}` };
      }
      return sendMessageRequest(toSlug, body, clientMessageId);
    },
    onSuccess: (result) => {
      if (demoMode) return;
      // A request that landed as an ordinary message (already connected) puts
      // a new/updated row straight in the inbox; a seeded connection request
      // shows up under Connections > Sent. Either way, refresh both — cheap,
      // and this mutation fires rarely (once per new first-contact attempt).
      if (result.conversationId) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        // That thread may already be open by id (past the loaded inbox
        // pages), reading its gate from the detail entry.
        void queryClient.invalidateQueries({
          queryKey: ["conversation-detail", result.conversationId],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
