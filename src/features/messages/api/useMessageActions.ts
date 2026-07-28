import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/DeletedConversationsProvider";
import type { MessageReactionKey } from "../../../shared/contracts/contracts";
import type { Conversation } from "../data";
import {
  addMessageReaction,
  deleteConversation,
  deleteMessage,
  editMessage,
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

export interface EditMessageInput {
  messageId: string;
  body: string;
}

/** PATCH /conversations/:id/messages/:messageId — edit own message (15-min window). */
export function useEditMessage(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, EditMessageInput>({
    mutationFn: async ({ messageId, body }) => {
      if (demoMode || !conversationId) return;
      await editMessage(conversationId, messageId, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** DELETE /conversations/:id — delete a conversation for my account only.
 *  Live: server sets my clearedAt; the thread drops out of my inbox (and
 *  reappears only if the other member writes again). Demo: recorded in the
 *  DeletedConversationsProvider store. Input is the conversation id. */
export function useDeleteConversation() {
  const { demoMode } = useDemoMode();
  const { markDeleted } = useDeletedConversations();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode) {
        markDeleted(conversationId);
        return;
      }
      await deleteConversation(conversationId);
    },
    onSuccess: (_result, conversationId) => {
      if (demoMode) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: ["conversations"] },
        (previous) =>
          previous?.filter(
            (conversation) => conversation.id !== conversationId,
          ),
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
