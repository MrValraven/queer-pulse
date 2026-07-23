import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery, useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import {
  useJoinConversation,
  useRealtimeConnection,
} from "../../shared/api/realtime";
import { type ChatMessage, type Conversation } from "./data";
import { buildRecipientConversation } from "./recipient";
import { useConversations, useUnreadMessages } from "./api/useConversations";
import { useMessageThread } from "./api/useMessageThread";
import {
  useMarkRead,
  useSendMessage,
  useStartConversation,
} from "./api/useMessageMutations";

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
  const [activeId, setActiveId] = useState<string>("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  /** Per-thread optimistic messages sent this session, keyed by conversation id. */
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [composing, setComposing] = useState(false);

  // Session-started threads first, then the fetched inbox — deduped by id. A
  // just-started conversation lives in `extraThreads` until the inbox refetch
  // catches up, at which point the same row arrives from `baseThreads` too;
  // without this dedupe it would render (and key) twice.
  const allThreads = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: Conversation[] = [];
    for (const thread of [...extraThreads, ...baseThreads]) {
      if (seenIds.has(thread.id)) continue;
      seenIds.add(thread.id);
      merged.push(thread);
    }
    return merged;
  }, [extraThreads, baseThreads]);

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  if (!activeId && allThreads.length > 0) setActiveId(allThreads[0]!.id);

  const active = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0] ?? null,
    [allThreads, activeId],
  );

  // Join the open thread's realtime room so the gateway's per-conversation
  // frames (a new message from either side, read receipts) stream in live
  // instead of only appearing after a refresh. Inert in demo mode.
  useJoinConversation(demoMode ? null : (active?.id ?? null));

  // Live message history for the open thread (inert in demo mode).
  const thread = useMessageThread(demoMode ? null : (active?.id ?? null));
  const sendMessage = useSendMessage(active?.id ?? null);
  const markRead = useMarkRead(active?.id ?? null);
  const startConversation = useStartConversation();

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
    if (!demoMode) markRead.mutate();
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

  function send() {
    const body = draft.trim();
    if (!body || activeBlocked || !active) return;
    const convId = active.id;
    // Optimistic append — instant feedback in both modes. In live mode the
    // server refetch is authoritative, so clear the optimistic copy on success.
    setSent((prev) => ({
      ...prev,
      [convId]: [
        ...(prev[convId] ?? []),
        { from: "me", text: body, time: t("messages:time.justNow") },
      ],
    }));
    setDraft("");
    if (!demoMode) {
      sendMessage.mutate(body, {
        onSuccess: () =>
          setSent((prev) => {
            const next = { ...prev };
            delete next[convId];
            return next;
          }),
      });
    }
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
    active,
    activeBlocked,
    messageGroups,
    openThread,
    startThread,
    send,
  };
}
