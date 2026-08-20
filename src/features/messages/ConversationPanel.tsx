import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useIsOnline } from "../../shared/api/realtime";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";
import { ConversationComposerDock } from "./ConversationComposerDock";
import { ConversationGroupModals } from "./ConversationGroupModals";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationOverlays } from "./ConversationOverlays";
import { ConversationPinnedBanner } from "./ConversationPinnedBanner";
import type { GroupMemberPick } from "./NewGroupModal";
import { MessageArea } from "./MessageArea";
import { ThreadSearchModal } from "./ThreadSearchModal";
import { useMessageActionMenu } from "./useMessageActionMenu";
import { useMessageLogState } from "./useMessageLogState";
import { useMessageReceipts } from "./useMessageReceipts";
import { useConversationPinStar } from "./useConversationPinStar";
import { type ChatMessage, type Conversation, type GroupMemberView } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import styles from "./MessagesPage.module.css";

interface ConversationPanelProps {
  active: Conversation;
  messageGroups: { day: string; items: ChatMessage[] }[];
  /** Sends `body` (the composer's own current text) as a new message. The
   *  panel no longer owns a draft — the `Composer` below does. */
  onSend: (body: string) => void;
  /** Sends a picked GIF as its own message (from the composer's GIF picker). */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Sends an uploaded image as its own message (from the composer's photo
   *  attach button). `localAttachment` is the upload's local blob preview,
   *  for the optimistic bubble to render instantly. */
  onSendImage?: (attachment: GifAttachment, localAttachment?: GifAttachment) => void;
  /** True when the counterpart is blocked — the composer is severed. */
  blocked?: boolean;
  /** Mobile only — returns to the conversation list. Absent on desktop. */
  onBack?: () => void;
  /** Retries a failed optimistic send. */
  onRetry: (message: ChatMessage) => void;
  /** Whether older history exists beyond what's loaded (always false in demo mode). */
  hasMoreOlder: boolean;
  /** True while an older-history page is in flight. */
  loadingOlder: boolean;
  /** Fetches the next (older) page of history. No-op in demo mode. */
  onLoadOlder: () => void;
  /** The message currently being quoted for a reply, or null. */
  replyDraft?: ChatMessage | null;
  /** Starts (or replaces) the reply draft with `message`. */
  onSetReply?: (message: ChatMessage) => void;
  /** Clears the reply draft. */
  onCancelReply?: () => void;
  /** Server id of a message to scroll to + highlight once this thread is open —
   *  set when a cross-inbox search result is picked. Null when nothing pending. */
  jumpToMessageId?: string | null;
  /** Called once the panel has jumped to `jumpToMessageId` (or given up after a
   *  brief retry), so the parent can clear it and not re-fire. */
  onJumpHandled?: () => void;
  /** Opens the forward recipient picker seeded with `message`. */
  onForwardMessage: (message: ChatMessage) => void;
  /** Opens the "Starred messages" view. */
  onOpenStarred: () => void;
  /** GROUP only — the signed-in member leaves the group. */
  onLeaveGroup?: (conversationId: string) => void;
  /** True while a leave is in flight. */
  leavePending?: boolean;
  /** The signed-in member's user id — excludes self from "Seen by N". */
  myUserId?: string | null;
  /** GROUP management (server re-checks the role on each) — add/remove/promote/
   *  demote members + edit title/avatar. Gated in the UI on `active`'s can-flags. */
  onAddGroupMembers?: (conversationId: string, picks: GroupMemberPick[]) => void;
  onRemoveGroupMember?: (conversationId: string, member: GroupMemberView) => void;
  onChangeGroupMemberRole?: (
    conversationId: string,
    member: GroupMemberView,
    role: "admin" | "member",
  ) => void;
  onUpdateGroupInfo?: (
    conversationId: string,
    changes: { title?: string; avatarUrl?: string },
  ) => void;
  /** True while any group-management mutation is in flight. */
  groupManaging?: boolean;
}

/** Right-hand conversation pane: header, scrolling message area, composer. Thin
 *  orchestrator — scroll/typing/divider logic live in colocated hooks and the
 *  header/log render in their own components. */
export function ConversationPanel({
  active,
  messageGroups,
  onSend,
  onSendGif,
  onSendImage,
  blocked = false,
  onBack,
  onRetry,
  hasMoreOlder,
  loadingOlder,
  onLoadOlder,
  replyDraft,
  onSetReply,
  onCancelReply,
  jumpToMessageId,
  onJumpHandled,
  onForwardMessage,
  onOpenStarred,
  onLeaveGroup,
  leavePending = false,
  myUserId,
  onAddGroupMembers,
  onRemoveGroupMember,
  onChangeGroupMemberRole,
  onUpdateGroupInfo,
  groupManaging = false,
}: ConversationPanelProps) {
  const { user } = useAuth();
  /** Whether the group-info / management view is open (groups only). */
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  /** Whether the "Seen by" sheet is open (groups only). */
  const [seenBySheetOpen, setSeenBySheetOpen] = useState(false);
  /** Whether the "search in this chat" modal is open. */
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);

  // Pin (shared) + star (private) wiring lives in its own hook to keep this
  // component under the size cap.
  const { pinnedMessages, onTogglePin, onToggleStar } =
    useConversationPinStar(active);

  // The long-press/right-click action menu — action overlay + delete-confirm +
  // report-modal + inline-edit state and the reaction toggle — lives in its own
  // hook to keep this component under the size cap.
  const {
    actionTarget,
    setActionTarget,
    deleteTarget,
    setDeleteTarget,
    reportTarget,
    setReportTarget,
    editingMessageId,
    confirmDelete,
    beginEdit,
    submitEdit,
    cancelEdit,
    openActions,
    copyMessage,
    handleReactionToggle,
    deletePending,
  } = useMessageActionMenu(active.id);

  // Presence for JUST this counterpart — a selector hook that only re-renders
  // this panel when THEIR own online status flips, not on every presence frame
  // for every other member (see `useIsOnline`).
  const counterpartOnline = useIsOnline(active.otherParticipantId);
  const isCounterpartOnline =
    (!!active.otherParticipantId && counterpartOnline) ||
    (!active.otherParticipantId && !!active.online);

  // Live read-receipt ("Seen") + delivered watermarks for the open thread —
  // computed HERE rather than in the controller, so a receipt frame re-renders
  // only this panel (and its children), never the page's thread list beside it.
  const { counterpartLastReadAt, counterpartDeliveredAt } = useMessageReceipts(
    myUserId ?? null,
    active,
  );

  // Every value the scrolling message log is derived from (flattened
  // messages, receipts, virtualized rows, scroll/jump state) lives in one
  // cohesive hook — see its own file comment for why.
  const {
    areaRef,
    contentRef,
    rows,
    rowVirtualizer,
    showJumpPill,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
    jumpToMessageVirtualized,
    counterpart,
    groupSeenBy,
    lastOutbound,
    seenActive,
    deliveredActive,
  } = useMessageLogState(
    active,
    messageGroups,
    myUserId,
    user?.profile?.slug,
    counterpartLastReadAt,
    counterpartDeliveredAt,
    hasMoreOlder,
    loadingOlder,
    onLoadOlder,
    jumpToMessageId,
    onJumpHandled,
  );

  // Stable identity — passed to `MessageArea`, which isn't itself memoized.
  const onOpenSeenBy = useCallback(() => setSeenBySheetOpen(true), []);

  return (
    <div className={styles.convoPanel}>
      <ConversationHeader
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
        onOpenStarred={onOpenStarred}
        onOpenSearch={() => setThreadSearchOpen(true)}
        onOpenGroupInfo={() => setGroupInfoOpen(true)}
      />
      {threadSearchOpen && (
        <ThreadSearchModal
          conversation={active}
          onClose={() => setThreadSearchOpen(false)}
          onJumpToMessage={jumpToMessageVirtualized}
        />
      )}

      <ConnectionStatusBanner />

      <ConversationPinnedBanner pinned={pinnedMessages} onJump={jumpToMessageVirtualized} />

      <MessageArea
        areaRef={areaRef}
        contentRef={contentRef}
        messageGroups={messageGroups}
        rows={rows}
        rowVirtualizer={rowVirtualizer}
        loadingOlder={loadingOlder}
        onScroll={handleAreaScroll}
        counterpart={counterpart}
        counterpartName={active.name}
        isGroup={active.isGroup}
        conversationId={active.id}
        groupMembers={active.members}
        groupSeenBy={groupSeenBy}
        onOpenSeenBy={onOpenSeenBy}
        onRetry={onRetry}
        seenActive={seenActive}
        deliveredActive={deliveredActive}
        lastOutbound={lastOutbound}
        onReactionToggle={handleReactionToggle}
        onReply={onSetReply}
        onOpenActions={openActions}
        editingMessageId={editingMessageId}
        onBeginEdit={beginEdit}
        onSubmitEdit={submitEdit}
        onCancelEdit={cancelEdit}
        onJumpToMessage={jumpToMessageVirtualized}
      />

      <ConversationComposerDock
        active={active}
        onSend={onSend}
        onSendGif={onSendGif}
        onSendImage={onSendImage}
        blocked={blocked}
        replyDraft={replyDraft}
        onCancelReply={onCancelReply}
        showJumpPill={showJumpPill}
        newMessagesCount={newMessagesCount}
        onJumpToLatest={jumpToLatest}
      />
      <ConversationOverlays
        actionTarget={actionTarget}
        deleteTarget={deleteTarget}
        reportTarget={reportTarget}
        onReactionToggle={handleReactionToggle}
        onSetReply={onSetReply}
        onBeginEdit={beginEdit}
        onCopyMessage={copyMessage}
        onForward={onForwardMessage}
        onTogglePin={onTogglePin}
        onToggleStar={onToggleStar}
        setActionTarget={setActionTarget}
        setDeleteTarget={setDeleteTarget}
        setReportTarget={setReportTarget}
        onConfirmDelete={confirmDelete}
        deletePending={deletePending}
      />
      <ConversationGroupModals
        active={active}
        groupInfoOpen={groupInfoOpen}
        seenBySheetOpen={seenBySheetOpen}
        onCloseGroupInfo={() => setGroupInfoOpen(false)}
        onCloseSeenBy={() => setSeenBySheetOpen(false)}
        myUserId={myUserId}
        groupSeenBy={groupSeenBy}
        onLeaveGroup={onLeaveGroup}
        leavePending={leavePending}
        groupManaging={groupManaging}
        onAddGroupMembers={onAddGroupMembers}
        onRemoveGroupMember={onRemoveGroupMember}
        onChangeGroupMemberRole={onChangeGroupMemberRole}
        onUpdateGroupInfo={onUpdateGroupInfo}
      />
    </div>
  );
}
