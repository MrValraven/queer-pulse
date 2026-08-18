import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { GroupMemberPick } from "./NewGroupModal";
import { buildRecipientConversation } from "./recipient";
import { clearDraft, loadDraft, saveDraft } from "./drafts";
import {
  buildDemoGroupConversation,
  nextLocalId,
} from "./useMessagesController.helpers";
import type { useCreateGroup, useStartConversation } from "./api/useMessageMutations";

interface CreationDeps {
  demoMode: boolean;
  allThreads: Conversation[];
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  t: TFunction;
  setComposing: Dispatch<SetStateAction<boolean>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  setLocallyDeletedIds: Dispatch<SetStateAction<Set<string>>>;
  startConversation: ReturnType<typeof useStartConversation>;
  createGroupMutation: ReturnType<typeof useCreateGroup>;
  /** From the navigation sub-hook — opens (and marks read) an existing thread. */
  openThread: (id: string) => void;
  /** From the sending sub-hook — appends an optimistic bubble to a conversation. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  /** From the sending sub-hook — drives a message down the send ladder. */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment,
  ) => void;
}

export interface MessageCreation {
  startThread: (recipient: Conversation) => void;
  startGroup: (
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
  ) => void;
  forwardMessage: (
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment,
  ) => void;
}

/**
 * Thread + group creation and forwarding — plus the two deep-link effects
 * ("Message <member>" and the notification-tap `?c=<id>`). All materialize or
 * open a thread, so they live together. Extracted from `useMessagesController`;
 * behaviour is unchanged.
 */
export function useMessageCreation({
  demoMode,
  allThreads,
  myProfile,
  t,
  setComposing,
  setQuery,
  setExtraThreads,
  setActiveId,
  setReadIds,
  setView,
  setLocallyDeletedIds,
  startConversation,
  createGroupMutation,
  openThread,
  appendOptimistic,
  deliver,
}: CreationDeps): MessageCreation {
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
      },
    });
  }

  /**
   * Create a group from the picked members + name and open its thread. Live mode
   * POSTs /conversations/group and opens the returned thread; demo mode builds a
   * local mock group (owner = the signed-in member) with a `group_created`
   * system message so the prototype shows a working group with no network.
   */
  function startGroup(
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
  ) {
    if (!title.trim() || members.length === 0) return;
    if (demoMode) {
      const conversation = buildDemoGroupConversation(
        title,
        members,
        avatarUrl,
        myProfile,
        t,
      );
      setExtraThreads((previous) => [conversation, ...previous]);
      setActiveId(conversation.id);
      setReadIds((current) => new Set(current).add(conversation.id));
      setView("thread");
      return;
    }
    createGroupMutation.mutate(
      {
        title: title.trim(),
        memberHandles: members.map((member) => member.slug),
        avatarUrl: avatarUrl?.trim() || undefined,
      },
      {
        onSuccess: (conversation) => {
          if (!conversation) return;
          setExtraThreads((previous) => [
            conversation,
            ...previous.filter((existing) => existing.id !== conversation.id),
          ]);
          setActiveId(conversation.id);
          setReadIds((current) => new Set(current).add(conversation.id));
          setView("thread");
        },
      },
    );
  }

  /**
   * Forward a message's content to `recipient` as a NEW message, through the
   * ordinary idempotent send path (a fresh `clientMessageId`, the outbox, cache
   * patching) — never a bypass. Only the body is carried; reactions/receipts are
   * not copied. An existing thread receives the forward instantly; a brand-new
   * live thread is created first (POST /conversations), then the forward is sent
   * on its real UUID. Demo mode is local-only (optimistic bubble, no network).
   */
  function forwardMessage(
    recipient: Conversation,
    text: string,
    attachment?: GifAttachment,
  ) {
    const localId = nextLocalId();
    const optimistic: ChatMessage = {
      from: "me",
      text,
      // Forwarding a GIF carries its attachment so it renders (and re-sends) as a
      // GIF, not as bare "GIF" text.
      kind: attachment ? "gif" : undefined,
      attachment,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      forwarded: true,
    };
    // Group target: the conversation already exists (real UUID in live, mock id
    // in demo), so there is nothing to materialize — append + deliver on the
    // group's own id, exactly like an existing DM thread. `deliver` no-ops the
    // network in demo and rides the normal idempotent outbox in live.
    if (recipient.isGroup) {
      appendOptimistic(recipient.id, optimistic);
      openThread(recipient.id);
      deliver(recipient.id, text, localId, undefined, true, attachment);
      return;
    }
    const existing = allThreads.find(
      (thread) => thread.slug && thread.slug === recipient.slug,
    );
    if (existing) {
      appendOptimistic(existing.id, optimistic);
      openThread(existing.id);
      deliver(existing.id, text, localId, undefined, true, attachment);
      return;
    }
    // New thread. Open the placeholder immediately; in demo (or an official/
    // no-slug target) that's the whole story — no network.
    setExtraThreads((prev) =>
      prev.some((thread) => thread.id === recipient.id) ? prev : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setView("thread");
    if (demoMode || !recipient.slug) {
      appendOptimistic(recipient.id, optimistic);
      return;
    }
    // Live: materialize the conversation, then append + deliver on the real id
    // (optimistic is keyed by conversation id, so it must wait for the UUID).
    startConversation.mutate(recipient.slug, {
      onSuccess: (conversation) => {
        if (!conversation) return;
        setExtraThreads((prev) => [
          conversation,
          ...prev.filter(
            (existingThread) =>
              existingThread.id !== recipient.id &&
              existingThread.id !== conversation.id,
          ),
        ]);
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
        appendOptimistic(conversation.id, optimistic);
        deliver(conversation.id, text, localId, undefined, true, attachment);
      },
    });
  }

  const location = useLocation();
  const navigate = useNavigate();
  const pendingRecipient = (
    location.state as
      | { to?: { slug: string; name: string; text?: string } }
      | null
  )?.to;

  // One-shot: honor a "Message <member>" deep-link. Open the existing thread for
  // that slug, or seed+start a new one. Clear the state so back/refresh doesn't
  // re-fire. Works in both modes; live also find-or-creates via startThread.
  // An optional `text` (e.g. "invite a friend to this gathering") seeds the
  // composer's draft rather than sending automatically, so the inviter can
  // still edit or add a note before hitting send.
  useEffect(() => {
    if (!pendingRecipient) return;
    const existingThread = allThreads.find(
      (thread) => thread.slug === pendingRecipient.slug,
    );
    if (existingThread) {
      // One-shot "Message <member>" deep-link; cleared via navigate replace below.
      openThread(existingThread.id);
      if (pendingRecipient.text)
        saveDraft(existingThread.id, pendingRecipient.text);
    } else {
      const recipient = buildRecipientConversation(
        pendingRecipient.slug,
        pendingRecipient.name,
      );
      startThread(recipient);
      if (pendingRecipient.text) saveDraft(recipient.id, pendingRecipient.text);
    }
    void navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRecipient?.slug]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Notification tap deep-link: the service worker's notificationclick opens
  // `/messages?c=<conversationId>`. Wait until the inbox actually contains
  // that conversation (it may still be loading), then open it the same way a
  // normal thread-row tap does — on mobile the thread pane is gated on
  // `view === "thread"`, so just setting `activeId` selects the conversation
  // without ever showing it — and clear the param so it can't re-fire on a
  // later manual thread switch. Coexists with the pendingRecipient effect
  // above: that one deep-links to a person (existing-or-new thread via slug),
  // this one deep-links to an existing conversation by id.
  useEffect(() => {
    const conversationId = searchParams.get("c");
    if (!conversationId) return;
    const exists = allThreads.some((thread) => thread.id === conversationId);
    if (!exists) return;
    // One-shot notification-tap deep-link; the `c` param is cleared right after.
    openThread(conversationId);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allThreads, setSearchParams]);

  return { startThread, startGroup, forwardMessage };
}
