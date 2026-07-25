import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MessageReactionKey } from "../../../shared/contracts/contracts";
import {
  addMessageReaction,
  deleteMessage,
  removeMessageReaction,
} from "./messages.api";

/**
 * Each mutation branches on `demoMode`: in demo it's a no-op (the component
 * toggles its own local mock state, exactly as the prototype already does);
 * live mode calls the API then invalidates the affected keys. Mirrors the
 * dual-mode shape of `useSendMessage` (useMessageMutations.ts).
 */

export interface ToggleReactionInput {
  messageId: string;
  key: MessageReactionKey;
  /** Whether the signed-in member already has this reaction on the message —
   *  decides add vs. remove. */
  mine: boolean;
}

/** POST/DELETE /conversations/:id/messages/:messageId/reactions[/:key]. */
export function useToggleReaction(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ToggleReactionInput>({
    mutationFn: async ({ messageId, key, mine }) => {
      if (demoMode || !conversationId) return;
      if (mine) {
        await removeMessageReaction(conversationId, messageId, key);
      } else {
        await addMessageReaction(conversationId, messageId, key);
      }
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}

/** DELETE /conversations/:id/messages/:messageId — soft-delete a message. */
export function useDeleteMessage(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (messageId) => {
      if (demoMode || !conversationId) return;
      await deleteMessage(conversationId, messageId);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
