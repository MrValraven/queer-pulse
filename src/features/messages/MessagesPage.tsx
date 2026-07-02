import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { conversations, type ChatMessage, type Conversation } from "./data";
import { ConversationPanel } from "./ConversationPanel";
import { MessagesThreadList } from "./MessagesThreadList";
import { NewMessageModal } from "./NewMessageModal";
import styles from "./MessagesPage.module.css";

export function MessagesPage() {
  const loading = useSimulatedLoad();
  const [extraThreads, setExtraThreads] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState(conversations[0]!.id);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  /** Per-thread appended messages, keyed by conversation id. */
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [composing, setComposing] = useState(false);

  const allThreads = useMemo(
    () => [...extraThreads, ...conversations],
    [extraThreads],
  );

  const active = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0]!,
    [allThreads, activeId],
  );

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? allThreads.filter((c) => c.name.toLowerCase().includes(q))
      : allThreads;
  }, [allThreads, query]);

  /** Static message groups plus any messages sent this session. */
  const messageGroups = useMemo(() => {
    const extra = sent[active.id];
    if (!extra || extra.length === 0) return active.messages;
    const groups = active.messages.map((g) => ({ ...g, items: [...g.items] }));
    const today = groups.find((g) => g.day === "Today");
    if (today) {
      today.items = [...today.items, ...extra];
      return groups;
    }
    return [...groups, { day: "Today", items: extra }];
  }, [active, sent]);

  function openThread(id: string) {
    setActiveId(id);
    setReadIds((current) => new Set(current).add(id));
    setDraft("");
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
  }

  function send() {
    const body = draft.trim();
    if (!body) return;
    setSent((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] ?? []),
        { from: "me", text: body, time: "Just now" },
      ],
    }));
    setDraft("");
  }

  return (
    <AppShell unreadCount={3}>
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

        <ConversationPanel
          active={active}
          messageGroups={messageGroups}
          draft={draft}
          onDraftChange={setDraft}
          onSend={send}
        />
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
