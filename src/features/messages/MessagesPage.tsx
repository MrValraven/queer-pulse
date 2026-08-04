import { useEffect, useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
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
    visibleThreads,
    forwardableGroups,
    activeId,
    readIds,
    query,
    setQuery,
    composing,
    setComposing,
    replyDraft,
    setReplyDraft,
    active,
    activeBlocked,
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
    sendGif,
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

  // Inside a conversation on a phone, hide the global bottom tab bar (like
  // WhatsApp/Telegram) so two bottom bars don't stack. The html signal also
  // collapses `--bottom-inset` to just the home-indicator inset (standalone.css)
  // so the composer doesn't reserve space for a bar that's no longer there.
  useEffect(() => {
    const inMobileThread = isMobile && view === "thread";
    const root = document.documentElement;
    if (inMobileThread) root.setAttribute("data-messages-thread", "true");
    else root.removeAttribute("data-messages-thread");
    return () => root.removeAttribute("data-messages-thread");
  }, [isMobile, view]);

  return (
    <AppShell fullHeight>
      <MentionNamesProvider>
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
              messageGroups={messageGroups}
              onSend={send}
              onSendGif={sendGif}
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
      </MentionNamesProvider>
      {composing && (
        <NewMessageModal
          onClose={() => setComposing(false)}
          onPick={startThread}
        />
      )}
      {groupComposing && (
        <NewGroupModal
          onClose={() => setGroupComposing(false)}
          onCreate={(title, members, avatarUrl) => {
            startGroup(title, members, avatarUrl);
            setGroupComposing(false);
          }}
        />
      )}
      {forwardSource && (
        <NewMessageModal
          mode="forward"
          groups={forwardableGroups}
          onClose={() => setForwardSource(null)}
          onPick={(recipient: Conversation) => {
            forwardMessage(recipient, forwardSource.text, forwardSource.attachment);
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
