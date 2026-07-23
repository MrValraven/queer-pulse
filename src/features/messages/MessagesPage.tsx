import { AppShell } from "../../shared/components/layout";
import { ConversationPanel } from "./ConversationPanel";
import { MessagesEmptyPanel } from "./MessagesEmptyPanel";
import { MessagesThreadList } from "./MessagesThreadList";
import { NewMessageModal } from "./NewMessageModal";
import { useMessagesController } from "./useMessagesController";
import styles from "./MessagesPage.module.css";

export function MessagesPage() {
  const {
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
  } = useMessagesController();

  const showList = !isMobile || view === "list";
  const showThread = !isMobile || view === "thread";

  return (
    <AppShell unreadCount={unread}>
      <div className={styles.app}>
        {showList && (
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
        )}

        {showThread &&
          (active ? (
            <ConversationPanel
              active={active}
              messageGroups={messageGroups}
              draft={draft}
              onDraftChange={setDraft}
              onSend={send}
              blocked={activeBlocked}
              onBack={isMobile ? () => setView("list") : undefined}
            />
          ) : (
            <MessagesEmptyPanel />
          ))}
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
