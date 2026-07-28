import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  useJoinConversation,
  useReadFrames,
  useRealtimeConnection,
} from "../../shared/api/realtime";
import { type ChatMessage, type Conversation } from "./data";
import { buildRecipientConversation } from "./recipient";
import { useConversations, useUnreadMessages } from "./api/useConversations";
import { useMessageThread } from "./api/useMessageThread";
import { useDeleteConversation } from "./api/useMessageActions";
import {
  useMarkRead,
  useSendMessage,
  useStartConversation,
} from "./api/useMessageMutations";

let localIdSequence = 0;
/** Monotonic client id for optimistic messages (module-scoped; survives re-renders). */
export function nextLocalId(): string {
  localIdSequence += 1;
  return `local-${localIdSequence}`;
}

/**
 * The real server conversation id for `active`, or null while it's still a
 * just-picked placeholder. A picked-but-not-yet-created recipient uses the
 * member's slug as its `id` (see `buildRecipientConversation` /
 * `connectionToRecipient`); a real conversation's id is a server UUID, always
 * distinct from the counterpart's handle. Live conversation-scoped requests
 * (message history, realtime join, mark-read) must NOT fire against the
 * placeholder — the backend validates `/conversations/:id` with `ParseUUIDPipe`,
 * so a slug returns `400 "Validation failed (uuid is expected)"`. Returning null
 * keeps those hooks inert until `startConversation` reconciles the real UUID.
 */
function realConversationId(conversation: Conversation | null): string | null {
  if (!conversation) return null;
  return conversation.id === conversation.slug ? null : conversation.id;
}

/**
 * All Messages page state, data wiring, and handlers — extracted from
 * `MessagesPage` so the component stays a thin render. Behaviour is unchanged:
 * demo/live dual-mode, realtime join, optimistic send, live conversation
 * reconciliation, deep-link "Message <member>", and the mobile list↔thread
 * `view` toggle all live here.
 */
export function useMessagesController() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const { user } = useAuth();
  const myUserId = user?.id ?? null;
  const simLoading = useSimulatedLoad();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [view, setView] = useState<"list" | "thread">("list");

  // Open the realtime socket only while this page is mounted — live DMs/read
  // receipts should stream here, not app-wide. Inert in demo/logged-out.
  useRealtimeConnection();

  // Source of truth for the inbox: demo returns the scripted mock, live calls
  // GET /conversations. Either way the page renders the same view-model.
  const convosQuery = useConversations();
  const baseThreads = useMemo(() => convosQuery.data ?? [], [convosQuery.data]);
  const loading = demoMode ? simLoading : convosQuery.isLoading;
  const unread = useUnreadMessages();

  const [extraThreads, setExtraThreads] = useState<Conversation[]>([]);
  /** Conversation ids deleted this session, ahead of the async cache prune —
   *  filtered out of `allThreads` immediately so the deleted thread can't
   *  flicker back into view (default-select, `active`, `visibleThreads`) while
   *  the delete mutation is still in flight. */
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<Set<string>>(
    new Set(),
  );

  const [activeId, setActiveId] = useState<string>("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  /** Live "Seen" watermark per conversation, from the counterpart's `read`
   *  frames — the max lastReadAt observed so far, keyed by conversation id. */
  const [readWatermarks, setReadWatermarks] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  /** Per-thread optimistic messages sent this session, keyed by conversation id. */
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [composing, setComposing] = useState(false);
  /** The message currently being quoted for a reply, or null. Only a message
   *  with a stable server `id` can be replied to (optimistic messages can't). */
  const [replyDraft, setReplyDraft] = useState<ChatMessage | null>(null);

  // Session-started threads first, then the fetched inbox — deduped by id. A
  // just-started conversation lives in `extraThreads` until the inbox refetch
  // catches up, at which point the same row arrives from `baseThreads` too;
  // without this dedupe it would render (and key) twice.
  const allThreads = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: Conversation[] = [];
    for (const thread of [...extraThreads, ...baseThreads]) {
      if (seenIds.has(thread.id) || locallyDeletedIds.has(thread.id)) continue;
      seenIds.add(thread.id);
      merged.push(thread);
    }
    return merged;
  }, [extraThreads, baseThreads, locallyDeletedIds]);

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  if (!activeId && allThreads.length > 0) setActiveId(allThreads[0]!.id);

  const active = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0] ?? null,
    [allThreads, activeId],
  );

  // Read receipts ("Seen"): the counterpart's `read` frame reports THEIR
  // lastReadAt, which advances the watermark for the message they've now read
  // up to. Ignore frames carrying my OWN userId — those are my own read
  // (drives the unread badge elsewhere), not a receipt on my sent messages.
  const onRead = useCallback(
    (frame: { conversationId: string; userId: string; lastReadAt: string }) => {
      if (myUserId && frame.userId === myUserId) return;
      setReadWatermarks((prev) => {
        const existing = prev[frame.conversationId];
        if (existing && existing >= frame.lastReadAt) return prev; // ISO strings compare lexicographically
        return { ...prev, [frame.conversationId]: frame.lastReadAt };
      });
    },
    [myUserId],
  );
  useReadFrames(onRead);

  /** Effective "Seen" watermark for the open thread: a live `read` frame wins
   *  once one has arrived, otherwise fall back to the conversation's last
   *  known `otherLastReadAt` from the inbox fetch. Null in demo mode (no read
   *  frames, no `otherLastReadAt` on mock threads) — "Seen" simply never shows. */
  const counterpartLastReadAt = active
    ? (readWatermarks[active.id] ?? active.otherLastReadAt ?? null)
    : null;

  // Real conversation UUID for the open thread, or null while it's still a
  // just-picked placeholder (id === slug). The live conversation-scoped hooks
  // below key off this, not `active.id`, so they never fire against a slug and
  // trip the backend's `ParseUUIDPipe` before reconciliation lands the UUID.
  const liveConversationId = demoMode ? null : realConversationId(active);

  // Join the open thread's realtime room so the gateway's per-conversation
  // frames (a new message from either side, read receipts) stream in live
  // instead of only appearing after a refresh. Inert in demo mode.
  useJoinConversation(liveConversationId);

  // Live message history for the open thread (inert in demo mode).
  const thread = useMessageThread(liveConversationId);
  const hasMoreOlder = demoMode ? false : (thread.hasNextPage ?? false);
  const loadingOlder = demoMode ? false : thread.isFetchingNextPage;
  function loadOlder() {
    if (!demoMode && thread.hasNextPage && !thread.isFetchingNextPage) {
      thread.fetchNextPage();
    }
  }
  const sendMessage = useSendMessage(active?.id ?? null);
  const markRead = useMarkRead();
  const startConversation = useStartConversation();
  const deleteConversationMutation = useDeleteConversation();

  // Once the server re-surfaces a locally-deleted thread (the other member
  // messaged again, so it's back in the fetched inbox), stop suppressing it —
  // otherwise it would stay hidden until this page remounts. Skip while a
  // delete is in flight: an unrelated ["conversations"] refetch could resolve
  // before the server stamps clearedAt and momentarily re-include the thread.
  useEffect(() => {
    if (deleteConversationMutation.isPending) return;
    setLocallyDeletedIds((previous) => {
      if (previous.size === 0) return previous;
      let changed = false;
      const next = new Set(previous);
      for (const thread of baseThreads) {
        if (next.delete(thread.id)) changed = true;
      }
      return changed ? next : previous;
    });
  }, [baseThreads, deleteConversationMutation.isPending]);

  // DM severance (spec 03): a blocked counterpart's thread is hidden. Their
  // history stays server-side for moderation; here we just stop surfacing it.
  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allThreads.filter(
      (c) =>
        !(c.slug && isBlocked(c.slug)) &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  }, [allThreads, query, isBlocked]);

  const activeBlocked = active?.slug ? isBlocked(active.slug) : false;

  /** Base history (mock groups in demo, fetched groups in live) + session sends. */
  const messageGroups = useMemo(() => {
    if (!active) return [];
    const base = demoMode ? active.messages : thread.groups;
    const extra = sent[active.id];
    if (!extra || extra.length === 0) return base;
    const groups = base.map((g) => ({ ...g, items: [...g.items] }));
    const today = groups.find((g) => g.day === "Today");
    if (today) {
      today.items = [...today.items, ...extra];
      return groups;
    }
    return [...groups, { day: "Today", items: extra }];
  }, [active, demoMode, thread.groups, sent]);

  function openThread(id: string) {
    setActiveId(id);
    setReadIds((current) => new Set(current).add(id));
    setDraft("");
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

  function startThread(recipient: Conversation) {
    setComposing(false);
    setQuery("");
    setDraft("");
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
        setActiveId((current) =>
          current === recipient.id ? conversation.id : current,
        );
        setReadIds((current) => new Set(current).add(conversation.id));
      },
    });
  }

  const location = useLocation();
  const navigate = useNavigate();
  const pendingRecipient = (
    location.state as { to?: { slug: string; name: string } } | null
  )?.to;

  // One-shot: honor a "Message <member>" deep-link. Open the existing thread for
  // that slug, or seed+start a new one. Clear the state so back/refresh doesn't
  // re-fire. Works in both modes; live also find-or-creates via startThread.
  useEffect(() => {
    if (!pendingRecipient) return;
    const existingThread = allThreads.find(
      (thread) => thread.slug === pendingRecipient.slug,
    );
    if (existingThread) {
      openThread(existingThread.id);
    } else {
      startThread(
        buildRecipientConversation(pendingRecipient.slug, pendingRecipient.name),
      );
    }
    navigate(location.pathname, { replace: true, state: null });
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
    openThread(conversationId);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allThreads, setSearchParams]);

  function appendOptimistic(convId: string, message: ChatMessage) {
    setSent((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), message] }));
  }

  function setStatus(convId: string, localId: string, status: ChatMessage["status"]) {
    setSent((prev) => ({
      ...prev,
      [convId]: (prev[convId] ?? []).map((item) =>
        item.localId === localId ? { ...item, status } : item,
      ),
    }));
  }

  function deliver(
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
  ) {
    if (demoMode) {
      setStatus(convId, localId, "sent");
      return;
    }
    sendMessage.mutate({ body, replyToId }, {
      // Drop only THIS optimistic message (matched by localId) — a concurrent
      // second send in the same thread must survive. The mutation invalidates
      // ["messages", convId], so the authoritative server copy backfills it.
      onSuccess: () =>
        setSent((prev) => {
          const remaining = (prev[convId] ?? []).filter(
            (item) => item.localId !== localId,
          );
          const next = { ...prev };
          if (remaining.length > 0) next[convId] = remaining;
          else delete next[convId];
          return next;
        }),
      onError: () => setStatus(convId, localId, "failed"),
    });
  }

  function send() {
    const body = draft.trim();
    if (!body || activeBlocked || !active) return;
    const convId = active.id;
    const localId = nextLocalId();
    const replyTo = replyDraft
      ? {
          id: replyDraft.id!,
          snippet: replyDraft.text.slice(0, 120),
          senderName:
            replyDraft.from === "me"
              ? t("messages:conversation.you")
              : active.name,
          deleted: false,
        }
      : undefined;
    // Optimistic append — instant feedback in both modes. In live mode the
    // server refetch is authoritative, so clear the optimistic copy on success.
    appendOptimistic(convId, {
      from: "me",
      text: body,
      time: t("messages:time.justNow"),
      status: "sending",
      localId,
      replyTo,
    });
    setDraft("");
    const replyToId = replyDraft?.id;
    setReplyDraft(null);
    deliver(convId, body, localId, replyToId);
  }

  function retrySend(message: ChatMessage) {
    if (!active || !message.localId) return;
    setStatus(active.id, message.localId, "sending");
    deliver(active.id, message.text, message.localId);
  }

  return {
    isMobile,
    view,
    setView,
    loading,
    unread,
    visibleThreads,
    activeId,
    readIds,
    query,
    setQuery,
    draft,
    setDraft,
    composing,
    setComposing,
    replyDraft,
    setReplyDraft,
    active,
    activeBlocked,
    counterpartLastReadAt,
    messageGroups,
    hasMoreOlder,
    loadingOlder,
    loadOlder,
    openThread,
    startThread,
    deleteThread,
    deletePending: deleteConversationMutation.isPending,
    send,
    retrySend,
  };
}
