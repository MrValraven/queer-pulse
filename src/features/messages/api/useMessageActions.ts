import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import {
  patchMessageDelete,
  patchMessageEdit,
  patchMessageReaction,
  removeMessageFromThread,
} from "../../../shared/api/messageCache";
import type { MessageReactionKey } from "../../../shared/contracts/contracts";
import type { Conversation } from "../data";
import {
  addMessageReaction,
  deleteConversation,
  deleteMessage,
  deleteMessageForMe,
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

/**
 * DELETE /conversations/:id/messages/:messageId/for-me — hide ONE message
 * from the caller's own view ("delete for me", PRD-227). SITS BESIDE
 * `useDeleteMessage` above (the "for everyone" tombstone) without touching
 * it: any participant may call this, not just the author. The message is
 * removed from the thread cache OUTRIGHT (`removeMessageFromThread`) rather
 * than tombstoned in place — unlike a shared delete, there is no "This
 * message was deleted" slot to keep, because no other participant is ever
 * meant to see this happened. Still invalidates the inbox: if the hidden
 * message was this caller's own newest one, their preview falls back to
 * their own next-newest visible message (the server already computes that
 * per-viewer — see `MessagingCoreService.lastMessagesByConversation`).
 */
export function useDeleteMessageForMe(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (messageId) => {
      if (demoMode || !conversationId) return;
      await deleteMessageForMe(conversationId, messageId);
    },
    onSuccess: (_result, messageId) => {
      if (demoMode || !conversationId) return;
      removeMessageFromThread(queryClient, conversationId, messageId);
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
