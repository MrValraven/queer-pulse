import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { ConversationPanel } from "./ConversationPanel";
import { MessagesEmptyPanel } from "./MessagesEmptyPanel";
import { MessagesThreadList } from "./MessagesThreadList";
import { NewGroupModal } from "./NewGroupModal";
import { NewMessageModal } from "./NewMessageModal";
import { StarredMessagesModal } from "./StarredMessagesModal";
import { useMessagesController } from "./useMessagesController";
import type { ChatMessage, Conversation } from "./data";
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
    replyDraft,
    setReplyDraft,
    active,
    activeBlocked,
    counterpartLastReadAt,
    counterpartDeliveredAt,
    messageGroups,
    hasMoreOlder,
    loadingOlder,
    loadOlder,
    openThread,
    openThreadAtMessage,
    jumpMessageId,
    clearJumpMessage,
    startThread,
    startGroup,
    leaveGroupThread,
    leavePending,
    myUserId,
    addGroupMembers,
    removeGroupMember,
    changeGroupMemberRole,
    updateGroupInfo,
    groupManaging,
    deleteThread,
    deletePending,
    send,
    retrySend,
    forwardMessage,
  } = useMessagesController();

  // The message being forwarded (its recipient is picked in NewMessageModal's
  // forward mode), whether the "Starred messages" view is open, and whether the
  // create-group picker is open. Page-level so their modals sit beside NewMessageModal.
  const [forwardSource, setForwardSource] = useState<ChatMessage | null>(null);
  const [starredOpen, setStarredOpen] = useState(false);
  const [groupComposing, setGroupComposing] = useState(false);

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
            onComposeGroup={() => setGroupComposing(true)}
            onDelete={deleteThread}
            onSelectResult={openThreadAtMessage}
            deletePending={deletePending}
          />
        )}

        {showThread &&
          (active ? (
            <ConversationPanel
              active={active}
              counterpartLastReadAt={counterpartLastReadAt}
              counterpartDeliveredAt={counterpartDeliveredAt}
              messageGroups={messageGroups}
              draft={draft}
              onDraftChange={setDraft}
              onSend={send}
              blocked={activeBlocked}
              onBack={isMobile ? () => setView("list") : undefined}
              onRetry={retrySend}
              hasMoreOlder={hasMoreOlder}
              loadingOlder={loadingOlder}
              onLoadOlder={loadOlder}
              replyDraft={replyDraft}
              onSetReply={setReplyDraft}
              onCancelReply={() => setReplyDraft(null)}
              jumpToMessageId={jumpMessageId}
              onJumpHandled={clearJumpMessage}
              onForwardMessage={setForwardSource}
              onOpenStarred={() => setStarredOpen(true)}
              onLeaveGroup={leaveGroupThread}
              leavePending={leavePending}
              myUserId={myUserId}
              onAddGroupMembers={addGroupMembers}
              onRemoveGroupMember={removeGroupMember}
              onChangeGroupMemberRole={changeGroupMemberRole}
              onUpdateGroupInfo={updateGroupInfo}
              groupManaging={groupManaging}
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
      {groupComposing && (
        <NewGroupModal
          onClose={() => setGroupComposing(false)}
          onCreate={(title, members) => {
            startGroup(title, members);
            setGroupComposing(false);
          }}
        />
      )}
      {forwardSource && (
        <NewMessageModal
          mode="forward"
          onClose={() => setForwardSource(null)}
          onPick={(recipient: Conversation) => {
            forwardMessage(recipient, forwardSource.text);
            setForwardSource(null);
          }}
        />
      )}
      {starredOpen && (
        <StarredMessagesModal
          onClose={() => setStarredOpen(false)}
          onPick={(conversationId, messageId) => {
            openThreadAtMessage(conversationId, messageId);
            setStarredOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}
