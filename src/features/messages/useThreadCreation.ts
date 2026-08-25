import type { Dispatch, SetStateAction } from "react";
import type { Conversation } from "./data";
import { clearDraft, loadDraft, saveDraft } from "./drafts";
import type { useStartConversation } from "./api/useMessageMutations";

interface ThreadCreationDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  /** The currently open thread's id, so a failed `startThread` can restore
   *  whatever was open before the optimistic placeholder took over. */
  activeId: string;
  setComposing: Dispatch<SetStateAction<boolean>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  startConversation: ReturnType<typeof useStartConversation>;
  /** From the sending sub-hook — re-keys and re-drives any outbox entries
   *  queued under a placeholder id once its real conversation exists. */
  migrateOutboxConversation: (oldConvId: string, newConvId: string) => void;
}

export interface ThreadCreation {
  startThread: (recipient: Conversation) => void;
}

/**
 * Find-or-create a DM thread and open it. Extracted from `useMessageCreation`;
 * behaviour is unchanged.
 */
export function useThreadCreation({
  demoMode,
  allThreads,
  activeId,
  setComposing,
  setQuery,
  setExtraThreads,
  setActiveId,
  setReadIds,
  setView,
  setLocallyDeletedIds,
  startConversation,
  migrateOutboxConversation,
}: ThreadCreationDeps): ThreadCreation {
  function startThread(recipient: Conversation) {
    setComposing(false);
    setQuery("");
    // The picker lists connections, some of whom you already have a thread with.
    // Reuse that thread rather than stacking an empty placeholder over its real
    // history (in demo the dedupe in `allThreads` would otherwise keep the empty
    // one; in live it saves a redundant POST /conversations).
    const existingThread = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existingThread) {
      setActiveId(existingThread.id);
      setReadIds((current) => new Set(current).add(existingThread.id));
      // The composer (keyed on the open thread's id) seeds its own persisted
      // draft on mount — nothing to restore here.
      setView("thread");
      return;
    }
    // Optimistic placeholder (keyed on the recipient's id from the picker) so the
    // thread opens instantly. In demo mode that's the whole story. In live mode
    // the picker id is NOT the conversation's id, so we must reconcile once the
    // server returns the real conversation — otherwise history fetch, sending,
    // and the realtime room-join all target an id no conversation has, and the
    // thread only works after a reload.
    // Captured BEFORE the optimistic switch below, so a failed
    // `startConversation` can restore whatever was open beforehand.
    const previousActiveId = activeId;
    setExtraThreads((prev) =>
      prev.some((existing) => existing.id === recipient.id)
        ? prev
        : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setView("thread");
    if (demoMode || !recipient.slug) return;
    startConversation.mutate(recipient.slug, {
      onError: () => {
        // The conversation never materialized server-side: drop the dead
        // placeholder (its live composer would fail every send), restore
        // whatever thread was open before, and reopen the picker so the
        // member can retry or pick someone else. The global mutation-error
        // toast already told them it failed. The draft they typed is left in
        // place under `recipient.id` (== the member's slug — see
        // `recipient.ts`) — picking the SAME member again mints the identical
        // placeholder id and the composer restores it on mount.
        setExtraThreads((prev) =>
          prev.filter((thread) => thread.id !== recipient.id),
        );
        setReadIds((current) => {
          if (!current.has(recipient.id)) return current;
          const next = new Set(current);
          next.delete(recipient.id);
          return next;
        });
        setActiveId((current) =>
          current === recipient.id ? previousActiveId : current,
        );
        setView(previousActiveId ? "thread" : "list");
        setComposing(true);
      },
      onSuccess: (conversation) => {
        if (!conversation) return;
        // The Composer remounts on `activeId` change (it's keyed by conversation
        // id), so whatever was typed into the placeholder — including text
        // seeded by an invite/share deep-link — is stored under the
        // placeholder's id. Re-key it to the real id the server just assigned
        // before that remount happens, or it's silently dropped on this swap.
        const pendingDraft = loadDraft(recipient.id);
        if (pendingDraft) {
          saveDraft(conversation.id, pendingDraft);
          clearDraft(recipient.id);
        }
        // Swap the placeholder for the real conversation row and repoint the
        // open thread at its UUID. Keeping the real row in `extraThreads`
        // bridges the gap until the inbox refetch surfaces it (dedupe in
        // `allThreads` collapses the overlap); if the member already had a
        // thread, this simply reuses the returned existing one.
        setExtraThreads((prev) => [
          conversation,
          ...prev.filter(
            (existing) =>
              existing.id !== recipient.id && existing.id !== conversation.id,
          ),
        ]);
        // Re-adding a previously deleted thread: the server hands back the SAME
        // conversation id (delete is just a `clearedAt` floor, not a destroy),
        // so it's still in `locallyDeletedIds` and `allThreads` would keep
        // suppressing it — the row would render only after a reload clears the
        // in-memory set. Lift the suppression now that the member re-opened it.
        setLocallyDeletedIds((previous) => {
          if (!previous.has(conversation.id)) return previous;
          const next = new Set(previous);
          next.delete(conversation.id);
          return next;
        });
        setActiveId((current) =>
          current === recipient.id ? conversation.id : current,
        );
        setReadIds((current) => new Set(current).add(conversation.id));
        // Anything typed and sent while the thread was still this placeholder
        // (the composer is live the instant it opens, well before this
        // resolves) was queued, not actually delivered — `deliver`'s UUID
        // guard skips a placeholder id. Re-key that outbox entry to the real
        // conversation and re-drive it now that a server row exists for it —
        // otherwise it would vanish from the view the moment `activeId` above
        // flips (mergeOptimisticGroups reads `sent[active.id]`) and never
        // actually reach the server.
        migrateOutboxConversation(recipient.id, conversation.id);
      },
    });
  }

  return { startThread };
}
