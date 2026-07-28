import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  markConversationRead,
  sendMessage,
  startConversation,
  type ConversationResponse,
} from "./messages.api";
import { conversationToView } from "./messages.adapters";
import type { Conversation } from "../data";

/**
 * Each mutation branches on `demoMode`: in demo it's a no-op (the page keeps its
 * optimistic local state, exactly as the prototype already does); live mode calls
 * the API then invalidates the affected keys. The realtime layer additionally
 * reconciles other sessions. A blocked pair is rejected server-side with a typed
 * 403 — the composer is already severed client-side (SocialProvider.isBlocked).
 */

/** POST /conversations/:id/messages. */
export function useSendMessage(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { body: string; replyToId?: string }>({
    mutationFn: async ({ body, replyToId }) => {
      if (demoMode || !conversationId) return;
      await sendMessage(conversationId, body, replyToId);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** POST /conversations — New Message modal. Returns the opened thread view. */
export function useStartConversation() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (recipientHandle) => {
      if (demoMode) return null;
      const dto: ConversationResponse =
        await startConversation(recipientHandle);
      return conversationToView(dto);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** POST /conversations/:id/read — clear the unread badge for a thread. */
export function useMarkRead(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (demoMode || !conversationId) return;
      await markConversationRead(conversationId, new Date().toISOString());
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
