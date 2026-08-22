import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import {
  patchMessageDelete,
  patchMessageEdit,
  patchMessageReaction,
} from "../../../shared/api/messageCache";
import type { MessageReactionKey } from "../../../shared/contracts/contracts";
import type { Conversation } from "../data";
import {
  addMessageReaction,
  deleteConversation,
  deleteMessage,
  editMessage,
  removeMessageReaction,
  type MessageResponse,
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
    // Patch the single chip in place — we know the delta (`mine` is the prior
    // state, so the new state is its inverse) — instead of refetching the page.
    onSuccess: (_result, { messageId, key, mine }) => {
      if (demoMode || !conversationId) return;
      patchMessageReaction(queryClient, conversationId, messageId, key, !mine);
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
    // Patch the tombstone in place (keeps the slot, blanks body/reactions);
    // still invalidate the inbox, whose last-message preview may now change.
    onSuccess: (_result, messageId) => {
      if (demoMode || !conversationId) return;
      patchMessageDelete(
        queryClient,
        conversationId,
        messageId,
        new Date().toISOString(),
      );
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
  return useMutation<MessageResponse | void, Error, EditMessageInput>({
    mutationFn: async ({ messageId, body }) => {
      if (demoMode || !conversationId) return;
      return editMessage(conversationId, messageId, body);
    },
    // Patch the new body + edited stamp in place; still invalidate the inbox,
    // whose last-message preview may now show the edited text. Prefer the
    // server's own `editedAt` (the response already carries it) over the
    // client clock, which can be skewed — fall back to it only if the
    // response is ever missing the field.
    onSuccess: (updated, { messageId, body }) => {
      if (demoMode || !conversationId) return;
      patchMessageEdit(
        queryClient,
        conversationId,
        messageId,
        body,
        updated?.editedAt ?? new Date().toISOString(),
      );
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }
      // Patch the row out in place — no invalidate needed, the deletion is a
      // pure client-side removal with no new server state to fetch.
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: ["conversations"] },
        (previous) =>
          previous?.filter(
            (conversation) => conversation.id !== conversationId,
          ),
      );
    },
  });
}
