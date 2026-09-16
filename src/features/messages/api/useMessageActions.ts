import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import {
  patchMessageDelete,
  patchMessageEdit,
  patchMessageReaction,
  removeMessageFromThread,
} from "../../../shared/api/messageCache";
import type { MessageReactionKey } from "../../../shared/contracts/contracts";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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
import {
  assertDemoActionAllowed,
  DemoActionRefusedError,
} from "./demoActionGuards";
import { ensureDemoThreadStore } from "./demoThreadCache";
import { messageReactorsQueryKey } from "./useMessageReactors";

/**
 * Each mutation branches on `demoMode`. Live mode calls the API, then patches
 * the thread cache in place. Demo mode has no server: it makes sure the demo
 * session store exists (`demoThreadCache.ts`) and then applies the SAME cache
 * patch, so a demo reaction, edit or delete renders exactly like a live one and
 * lasts for the page session, with no HTTP. Mirrors the dual-mode shape of
 * `useSendMessage` (useMessageMutations.ts).
 */

export interface ToggleReactionInput {
  messageId: string;
  key: MessageReactionKey;
  /** Whether the signed-in member already has this reaction on the message —
   *  decides add vs. remove. */
  mine: boolean;
}

/** Carried by every reaction toggle, so a surface can read which toggles are
 *  still in flight (see `useReactionKeysInFlight`). */
const TOGGLE_REACTION_MUTATION_KEY = "toggleReaction";

/** POST/DELETE /conversations/:id/messages/:messageId/reactions[/:key]. */
export function useToggleReaction(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ToggleReactionInput>({
    mutationKey: [TOGGLE_REACTION_MUTATION_KEY, conversationId],
    mutationFn: async ({ messageId, key, mine }) => {
      if (!conversationId) return;
      if (demoMode) {
        ensureDemoThreadStore(queryClient, conversationId);
        return;
      }
      if (mine) {
        await removeMessageReaction(conversationId, messageId, key);
      } else {
        await addMessageReaction(conversationId, messageId, key);
      }
    },
    // Patch the single chip in place — we know the delta (`mine` is the prior
    // state, so the new state is its inverse) — instead of refetching the page.
    onSuccess: (_result, { messageId, key, mine }) => {
      if (!conversationId) return;
      patchMessageReaction(queryClient, conversationId, messageId, key, !mine);
      if (demoMode) return;
      // PRD-352: an open "who reacted" sheet refetches its list.
      void queryClient.invalidateQueries({
        queryKey: messageReactorsQueryKey(messageId),
      });
    },
  });
}

/** Reaction keys with a toggle still in flight on `messageId` (PRD-352). The
 *  "who reacted" sheet keeps its remove button inert for them: the toggle's
 *  `onSuccess` patches a DELTA, so a double tap sending two DELETEs would
 *  decrement the cached count twice, and the own-echo skip in the socket
 *  handler means nothing would correct it. */
export function useReactionKeysInFlight(
  messageId: string,
): MessageReactionKey[] {
  const pendingToggles = useMutationState({
    filters: { mutationKey: [TOGGLE_REACTION_MUTATION_KEY], status: "pending" },
    select: (mutation) =>
      mutation.state.variables as ToggleReactionInput | undefined,
  });
  return pendingToggles.flatMap((toggle) =>
    toggle && toggle.messageId === messageId ? [toggle.key] : [],
  );
}

/** DELETE /conversations/:id/messages/:messageId — soft-delete a message. */
export function useDeleteMessage(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  return useMutation<void, Error, string>({
    mutationFn: async (messageId) => {
      if (!conversationId) return;
      if (demoMode) {
        // Refuses where the delete endpoint would (`demoActionGuards.ts`).
        assertDemoActionAllowed(
          queryClient,
          conversationId,
          messageId,
          "delete",
        );
        return;
      }
      await deleteMessage(conversationId, messageId);
    },
    // The app-wide mutation error toast is silent in demo mode, so a demo
    // refusal surfaces the same forbidden copy here.
    onError: (error) => {
      if (error instanceof DemoActionRefusedError) {
        showToast(t("shared:apiError.forbidden"), "error");
      }
    },
    // Patch the tombstone in place (keeps the slot, blanks body/reactions);
    // live still invalidates the inbox, whose last-message preview may change.
    onSuccess: (_result, messageId) => {
      if (!conversationId) return;
      patchMessageDelete(
        queryClient,
        conversationId,
        messageId,
        new Date().toISOString(),
      );
      if (demoMode) return;
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
      if (!conversationId) return;
      if (demoMode) {
        ensureDemoThreadStore(queryClient, conversationId);
        return;
      }
      await deleteMessageForMe(conversationId, messageId);
    },
    onSuccess: (_result, messageId) => {
      if (!conversationId) return;
      removeMessageFromThread(queryClient, conversationId, messageId);
      if (demoMode) return;
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
  const { showToast } = useToast();
  const { t } = useTranslation();
  return useMutation<MessageResponse | void, Error, EditMessageInput>({
    mutationFn: async ({ messageId, body }) => {
      if (!conversationId) return;
      if (demoMode) {
        // Refuses where the edit endpoint would, the 15-minute window
        // included (`demoActionGuards.ts`).
        assertDemoActionAllowed(queryClient, conversationId, messageId, "edit");
        return;
      }
      return editMessage(conversationId, messageId, body);
    },
    // The app-wide mutation error toast is silent in demo mode, so a demo
    // refusal surfaces the same forbidden copy here.
    onError: (error) => {
      if (error instanceof DemoActionRefusedError) {
        showToast(t("shared:apiError.forbidden"), "error");
      }
    },
    // Patch the new body + edited stamp in place; still invalidate the inbox,
    // whose last-message preview may now show the edited text. Prefer the
    // server's own `editedAt` (the response already carries it) over the
    // client clock, which can be skewed — fall back to it only if the
    // response is ever missing the field.
    onSuccess: (updated, { messageId, body }) => {
      if (!conversationId) return;
      patchMessageEdit(
        queryClient,
        conversationId,
        messageId,
        body,
        updated?.editedAt ?? new Date().toISOString(),
      );
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** How long a "delete for me" stays undoable before it commits (PRD-345):
 *  the same window the block-undo toast uses (`useConversationBlockAction.ts`). */
const DELETE_UNDO_WINDOW_MS = 6000;

/**
 * DELETE /conversations/:id, delete a conversation for my account only, with
 * an undo window (PRD-345). Live: server sets my clearedAt; the thread drops
 * out of my inbox (and reappears only if the other member writes again).
 * Demo: recorded in the DeletedConversationsProvider store. Input is the
 * conversation id.
 *
 * The row's OPTIMISTIC hide is the caller's own (`useMessageThreadNav.
 * deleteThread`'s `locallyDeletedIds`) and fires the instant `mutate` is
 * called, as before; this hook does not touch that. What changed: the
 * actual destructive call (`deleteConversation`/`markDeleted`, `commit`
 * below) no longer fires immediately. It's deferred `DELETE_UNDO_WINDOW_MS`
 * behind an "Undo" toast, mirroring the block-undo pattern
 * (`useConversationBlockAction.ts`). Pressing Undo cancels the deferred call
 * without ever touching the `["conversations"]` cache, so the conversation
 * was never removed from `baseThreads`; `isPending` only flips back to
 * `false` at that exact moment, which is what lets `useMessageThreadNav`'s
 * own cleanup effect (gated on `!deleteConversationMutation.isPending`) lift
 * `locallyDeletedIds`' suppression and let the row reappear, with no
 * additional wiring needed there. If this hook unmounts mid-window (the
 * member navigates away before the toast would have expired), the delete
 * commits immediately rather than silently being dropped.
 */
export function useDeleteConversation() {
  const { demoMode } = useDemoMode();
  const { markDeleted } = useDeletedConversations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const commit = useMutation<void, Error, string>({
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

  const [isUndoWindowOpen, setIsUndoWindowOpen] = useState(false);
  const pending = useRef<{
    conversationId: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const commitNow = useCallback(
    (conversationId: string) => {
      pending.current = null;
      setIsUndoWindowOpen(false);
      commit.mutate(conversationId);
    },
    [commit],
  );

  // Unmounting mid-window (the member navigated away) commits rather than
  // silently dropping the delete. A `mutate()` fired from an effect cleanup
  // outlives the unmounting component fine, since it only touches the query
  // client and the demo store, neither of which is torn down with this hook.
  useEffect(
    () => () => {
      const current = pending.current;
      if (current) commitNow(current.conversationId);
    },
    [commitNow],
  );

  const mutate = useCallback(
    (conversationId: string) => {
      const timeoutId = setTimeout(
        () => commitNow(conversationId),
        DELETE_UNDO_WINDOW_MS,
      );
      pending.current = { conversationId, timeoutId };
      setIsUndoWindowOpen(true);
      showToast(
        t("messages:deleteChat.deletedToast"),
        "success",
        DELETE_UNDO_WINDOW_MS,
        {
          label: t("messages:deleteChat.undoCta"),
          onClick: () => {
            const current = pending.current;
            if (!current || current.conversationId !== conversationId) return;
            clearTimeout(current.timeoutId);
            pending.current = null;
            setIsUndoWindowOpen(false);
          },
        },
      );
    },
    [commitNow, showToast, t],
  );

  return {
    mutate,
    // Covers both phases so a consumer gating on "is a delete in flight or
    // scheduled" (`useMessageThreadNav`'s cleanup effect) sees ONE continuous
    // `true` from the moment `mutate` is called until the delete either
    // commits or is undone, never a false gap while `commitNow` hands off
    // from the timer to the real mutation.
    isPending: isUndoWindowOpen || commit.isPending,
  };
}
