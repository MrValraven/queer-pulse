import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import { useRealtimeConnection } from "../../shared/api/realtime";
import { type ChatMessage, type Conversation } from "./data";
import { ConversationPanel } from "./ConversationPanel";
import { MessagesThreadList } from "./MessagesThreadList";
import { NewMessageModal } from "./NewMessageModal";
import { useConversations, useUnreadMessages } from "./api/useConversations";
import { useMessageThread } from "./api/useMessageThread";
import {
  useMarkRead,
  useSendMessage,
  useStartConversation,
} from "./api/useMessageMutations";
import styles from "./MessagesPage.module.css";

export function MessagesPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const simLoading = useSimulatedLoad();

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

  const allThreads = useMemo(
    () => [...extraThreads, ...baseThreads],
    [extraThreads, baseThreads],
  );

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  if (!activeId && allThreads.length > 0) setActiveId(allThreads[0]!.id);

  const active = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0] ?? null,
    [allThreads, activeId],
  );

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
    if (!demoMode) markRead.mutate();
  }

  function startThread(recipient: Conversation) {
    setComposing(false);
    setExtraThreads((prev) =>
      prev.some((t) => t.id === recipient.id) ? prev : [recipient, ...prev],
    );
    setActiveId(recipient.id);
    setReadIds((current) => new Set(current).add(recipient.id));
    setQuery("");
    setDraft("");
    if (!demoMode && recipient.slug) startConversation.mutate(recipient.slug);
  }

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

  return (
    <AppShell unreadCount={unread}>
      <div className={styles.app}>
        <MessagesThreadList
          loading={loading}
          threads={visibleThreads}
          activeId={activeId}
          readIds={readIds}
          query={query}
          onQueryChange={setQuery}
          onOpen={openThread}
          onCompose={() => setComposing(true)}
        />

        {active && (
          <ConversationPanel
            active={active}
            messageGroups={messageGroups}
            draft={draft}
            onDraftChange={setDraft}
            onSend={send}
            blocked={activeBlocked}
          />
        )}
      </div>
      {composing && (
        <NewMessageModal
          onClose={() => setComposing(false)}
          onPick={startThread}
        />
      )}
    </AppShell>
  );
}
