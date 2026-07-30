import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ChatMessage, Conversation } from "./data";
import { realConversationId } from "./useMessagesController.helpers";
import type { useMarkRead } from "./api/useMessageMutations";
import type { useDeleteConversation } from "./api/useMessageActions";

interface ThreadNavDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  /** The fetched inbox — watched to lift suppression once a deleted thread
   *  re-surfaces server-side. */
  baseThreads: Conversation[];
  activeId: string;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  setReplyDraft: Dispatch<SetStateAction<ChatMessage | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  markRead: ReturnType<typeof useMarkRead>;
  deleteConversationMutation: ReturnType<typeof useDeleteConversation>;
}

export interface ThreadNav {
  openThread: (id: string) => void;
  openThreadAtMessage: (conversationId: string, messageId?: string) => void;
  jumpMessageId: string | null;
  clearJumpMessage: () => void;
  deleteThread: (conversationId: string) => void;
  deletePending: boolean;
}

/**
 * Open-thread selection, cross-inbox jump-to-message, and per-user thread
 * deletion. Extracted from `useMessagesController`; behaviour is unchanged.
 */
export function useMessageThreadNav({
  demoMode,
  allThreads,
  baseThreads,
  activeId,
  setActiveId,
  setReadIds,
  setView,
  setReplyDraft,
  setQuery,
  setLocallyDeletedIds,
  setExtraThreads,
  markRead,
  deleteConversationMutation,
}: ThreadNavDeps): ThreadNav {
  /** Server message id to scroll to + highlight once its thread is open — set
   *  when a cross-inbox search result is picked, cleared by the panel once it
   *  has jumped (or given up). Null when no jump is pending. */
  const [jumpMessageId, setJumpMessageId] = useState<string | null>(null);

  // Once the server re-surfaces a locally-deleted thread (the other member
  // messaged again, so it's back in the fetched inbox), stop suppressing it —
  // otherwise it would stay hidden until this page remounts. Skip while a
  // delete is in flight: an unrelated ["conversations"] refetch could resolve
  // before the server stamps clearedAt and momentarily re-include the thread.
  useEffect(() => {
    if (deleteConversationMutation.isPending) return;
    // Stops suppressing a thread once the fetched inbox re-surfaces it server-side.
    setLocallyDeletedIds((previous) => {
      if (previous.size === 0) return previous;
      let changed = false;
      const next = new Set(previous);
      for (const thread of baseThreads) {
        if (next.delete(thread.id)) changed = true;
      }
      return changed ? next : previous;
    });
  }, [baseThreads, deleteConversationMutation.isPending, setLocallyDeletedIds]);

  function openThread(id: string) {
    // Drop any armed reply when moving to a *different* conversation — otherwise
    // a reply-in-progress carries over and would quote a message from the thread
    // we just left. Re-opening the same thread keeps the reply intact.
    if (activeId !== id) setReplyDraft(null);
    setActiveId(id);
    setReadIds((current) => new Set(current).add(id));
    // The composer (keyed on the open thread's id) seeds its own persisted
    // draft on mount — nothing to restore here.
    setView("thread");
    // Mark the thread we're *opening* read — not the render-time `active`,
    // which is still the previously open thread this synchronous frame. Resolve
    // the id to its real conversation UUID (skipping just-picked placeholders,
    // whose id is still the slug) so we never POST /read against a slug.
    if (demoMode) return;
    const opened = allThreads.find((thread) => thread.id === id) ?? null;
    const realId = realConversationId(opened);
    if (realId) markRead.mutate(realId);
  }

  /** Open a conversation from a cross-inbox search result and, when the hit
   *  carries a server message id, arm the jump-to + highlight of that bubble.
   *  Clears the search so the opened thread is fully in view (on mobile the
   *  thread pane replaces the list). Demo hits carry no id — the thread still
   *  opens, it just can't scroll to the exact message. */
  function openThreadAtMessage(conversationId: string, messageId?: string) {
    openThread(conversationId);
    setJumpMessageId(messageId ?? null);
    setQuery("");
  }

  // Stable identity: the conversation panel's jump effect depends on this, and a
  // fresh function each render would restart its retry loop (resetting the
  // attempt count) on unrelated re-renders (typing/presence frames).
  const clearJumpMessage = useCallback(() => setJumpMessageId(null), []);

  function deleteThread(conversationId: string) {
    // Optimistically prune from `allThreads` right away — otherwise the
    // deleted thread stays visible (and can even get re-selected) until the
    // mutation's async cache invalidation lands.
    setLocallyDeletedIds((previous) => {
      const next = new Set(previous);
      next.add(conversationId);
      return next;
    });
    // Drop any optimistic placeholder row immediately.
    setExtraThreads((previous) =>
      previous.filter((thread) => thread.id !== conversationId),
    );
    if (activeId === conversationId) {
      setView("list");
    }
    deleteConversationMutation.mutate(conversationId);
  }

  return {
    openThread,
    openThreadAtMessage,
    jumpMessageId,
    clearJumpMessage,
    deleteThread,
    deletePending: deleteConversationMutation.isPending,
  };
}
