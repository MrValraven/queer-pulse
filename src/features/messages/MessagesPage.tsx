import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
import { AttachmentQueueProvider } from "./AttachmentQueueContext";
import { ConversationPanel } from "./ConversationPanel";
import { MessagesEmptyPanel } from "./MessagesEmptyPanel";
import { MessagesPageModals } from "./MessagesPageModals";
import { MessagesThreadList } from "./MessagesThreadList";
import { useForwardPicker } from "./useForwardPicker";
import { useHideBottomTabBarInThread } from "./useHideBottomTabBarInThread";
import { useIsDesktopMessagesChrome } from "./useIsDesktopMessagesChrome";
import { useMessagesController } from "./useMessagesController";
import { useMobileThreadHistoryEntry } from "./useMobileThreadHistoryEntry";
import styles from "./MessagesPage.module.css";
// Chat-wallpaper tokens (grounds + the doodle tile). Imported HERE rather than
// from styles/index.css, mirroring persona-skins.css: this route is the only
// consumer, so Vite folds the ~8KB tile into the Messages chunk instead of
// shipping it on every other route.
import "./chat-wallpaper.css";

export function MessagesPage() {
  const {
    isMobile,
    view,
    setView,
    loading,
    inboxLoadError,
    refetchInbox,
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
    threadHistory,
    openThread,
    openThreadAtMessage,
    jumpMessageId,
    clearJumpMessage,
    startThread,
    pendingRequestTarget,
    clearPendingRequestTarget,
    startGroup,
    leaveGroupThread,
    leavePending,
    myUserId,
    addGroupMembers,
    removeGroupMember,
    changeGroupMemberRole,
    updateGroupInfo,
    groupManaging,
    transferGroupOwnership,
    transferOwnershipPending,
    dissolveGroupThread,
    dissolvePending,
    createGroupInviteLink,
    disableGroupInviteLink,
    inviteLinkPending,
    revokeGroupInvite,
    busyInviteId,
    deleteThread,
    deletePending,
    send,
    sendGif,
    sendImage,
    sendDocument,
    retrySend,
    forwardMessage,
    markThreadRead,
    markThreadUnread,
    hasMoreThreads,
    isLoadingMoreThreads,
    loadMoreThreads,
  } = useMessagesController();

  // See useIsDesktopMessagesChrome's own doc for why this reads a different
  // breakpoint than the controller's own `isMobile`.
  const isDesktopChrome = useIsDesktopMessagesChrome();

  // Whether the "Starred messages" view is open, and whether the create-group
  // picker is open. Page-level so their modals sit beside NewMessageModal.
  // The forward picker's own open state lives in `useForwardPicker` below.
  const [starredOpen, setStarredOpen] = useState(false);
  const [groupComposing, setGroupComposing] = useState(false);
  const { openForward, forwardPickerNode } = useForwardPicker(
    forwardableGroups,
    forwardMessage,
  );

  const showList = !isMobile || view === "list";
  const showThread = !isMobile || view === "thread";

  // See useHideBottomTabBarInThread's own doc.
  useHideBottomTabBarInThread(isMobile, view);
  // See useMobileThreadHistoryEntry's own doc.
  useMobileThreadHistoryEntry(isMobile, view, setView);

  return (
    <AppShell fullHeight chromeless>
      <MentionNamesProvider>
        {/* Page-level owner of staged and uploading attachments, so a mobile
            back-to-list or a breakpoint flip keeps in-flight sends alive. */}
        <AttachmentQueueProvider
          onSendGif={sendGif}
          onSendImage={sendImage}
          onSendDocument={sendDocument}
        >
          <div className={styles.app}>
            {showList && (
              <MessagesThreadList
                loading={loading}
                isError={inboxLoadError}
                onRetry={refetchInbox}
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
                onMarkThreadRead={markThreadRead}
                onMarkThreadUnread={markThreadUnread}
                showRailChrome={isDesktopChrome}
                hasMoreThreads={hasMoreThreads}
                isLoadingMoreThreads={isLoadingMoreThreads}
                onLoadMoreThreads={loadMoreThreads}
              />
            )}

            {showThread &&
              (active ? (
                <ConversationPanel
                  active={active}
                  messageGroups={messageGroups}
                  onSend={send}
                  onSendGif={sendGif}
                  onSendImage={sendImage}
                  onSendDocument={sendDocument}
                  blocked={activeBlocked}
                  onBack={isMobile ? () => setView("list") : undefined}
                  onRetry={retrySend}
                  history={threadHistory}
                  replyDraft={replyDraft}
                  onSetReply={setReplyDraft}
                  onCancelReply={() => setReplyDraft(null)}
                  jumpToMessageId={jumpMessageId}
                  onJumpHandled={clearJumpMessage}
                  onForwardMessage={openForward}
                  onOpenStarred={() => setStarredOpen(true)}
                  myUserId={myUserId}
                  groupManagement={{
                    onLeaveGroup: leaveGroupThread,
                    leavePending,
                    onAddGroupMembers: addGroupMembers,
                    onRemoveGroupMember: removeGroupMember,
                    onChangeGroupMemberRole: changeGroupMemberRole,
                    onUpdateGroupInfo: updateGroupInfo,
                    groupManaging,
                    onTransferGroupOwnership: transferGroupOwnership,
                    transferOwnershipPending,
                    onDissolveGroup: dissolveGroupThread,
                    dissolvePending,
                    onCreateGroupInviteLink: createGroupInviteLink,
                    onDisableGroupInviteLink: disableGroupInviteLink,
                    inviteLinkPending,
                    onRevokeGroupInvite: revokeGroupInvite,
                    busyInviteId,
                  }}
                  onMarkThreadRead={markThreadRead}
                />
              ) : (
                <MessagesEmptyPanel />
              ))}
          </div>
        </AttachmentQueueProvider>
      </MentionNamesProvider>
      <MessagesPageModals
        composing={composing}
        onCloseComposing={() => {
          setComposing(false);
          clearPendingRequestTarget();
        }}
        onPickNewMessage={startThread}
        pendingRequestTarget={pendingRequestTarget}
        groupComposing={groupComposing}
        onCloseGroupComposing={() => setGroupComposing(false)}
        onCreateGroup={startGroup}
        forwardPickerNode={forwardPickerNode}
        starredOpen={starredOpen}
        onCloseStarred={() => setStarredOpen(false)}
        onPickStarred={openThreadAtMessage}
      />
    </AppShell>
  );
}
