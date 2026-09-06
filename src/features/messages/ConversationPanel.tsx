import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useIsOnline } from "../../shared/api/realtime";
import { ConversationComposerDock } from "./ConversationComposerDock";
import { ConversationPanelOverlays } from "./ConversationPanelOverlays";
import { ConversationTopSection } from "./ConversationTopSection";
import type { GroupMemberPick } from "./NewGroupModal";
import { MessageArea } from "./MessageArea";
import { useMessageActionMenu } from "./useMessageActionMenu";
import { useMessageLogState } from "./useMessageLogState";
import { useMessageReceipts } from "./useMessageReceipts";
import { useConversationPinStar } from "./useConversationPinStar";
import {
  type ChatMessage,
  type Conversation,
  type GroupMemberView,
} from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
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
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** Sends an uploaded document as its own message (PRD-226, from the
   *  composer's document attach button). `localAttachment` is the upload's
   *  local blob preview, for the optimistic bubble to render instantly. */
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
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
  onAddGroupMembers?: (
    conversationId: string,
    picks: GroupMemberPick[],
  ) => void;
  onRemoveGroupMember?: (
    conversationId: string,
    member: GroupMemberView,
  ) => void;
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
  /** Acks the thread read against the server (`POST /conversations/:id/read`).
   *  Called on thread-open by the parent already; also invoked here as new
   *  inbound messages arrive while the thread stays open (see
   *  `useMarkReadOnInbound`). */
  onMarkThreadRead: (conversationId: string) => void;
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
  onSendDocument,
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
  onMarkThreadRead,
}: ConversationPanelProps) {
  const { user } = useAuth();
  /** Whether the group-info / management view is open (groups only). */
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  /** Whether the "Seen by" sheet is open (groups only). */
  const [seenBySheetOpen, setSeenBySheetOpen] = useState(false);

  // Pin (shared) + star (private) wiring — its own hook, see useConversationPinStar.
  const { pinnedMessages, onTogglePin, onToggleStar } =
    useConversationPinStar(active);

  // Long-press/right-click action menu state (overlay, delete/report/edit) —
  // its own hook, see useMessageActionMenu.
  const {
    actionTarget,
    setActionTarget,
    deleteTarget,
    setDeleteTarget,
    deleteForMeTarget,
    setDeleteForMeTarget,
    reportTarget,
    setReportTarget,
    editingMessageId,
    confirmDelete,
    confirmDeleteForMe,
    beginEdit,
    submitEdit,
    cancelEdit,
    openActions,
    copyMessage,
    handleReactionToggle,
    deletePending,
    deleteForMePending,
  } = useMessageActionMenu(active.id);

  // Presence for JUST this counterpart — re-renders only on THEIR status flip,
  // not every presence frame for every other member (see `useIsOnline`).
  const counterpartOnline = useIsOnline(active.otherParticipantId);
  const isCounterpartOnline =
    (!!active.otherParticipantId && counterpartOnline) ||
    (!active.otherParticipantId && !!active.online);

  // Live "Seen"/delivered watermarks — computed HERE (not the controller) so a
  // receipt frame re-renders only this panel, never the thread list beside it.
  const { counterpartLastReadAt, counterpartDeliveredAt } = useMessageReceipts(
    myUserId ?? null,
    active,
  );

  // Every value the scrolling message log is derived from — one cohesive
  // hook, see useMessageLogState's own file comment for why.
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
    onMarkThreadRead,
  );

  // Stable identity — passed to `MessageArea`, which isn't itself memoized.
  const onOpenSeenBy = useCallback(() => setSeenBySheetOpen(true), []);

  return (
    <div className={styles.convoPanel}>
      <ConversationTopSection
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
        onOpenStarred={onOpenStarred}
        onOpenGroupInfo={() => setGroupInfoOpen(true)}
        pinnedMessages={pinnedMessages}
        onJumpToMessage={jumpToMessageVirtualized}
      />

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
        onSendDocument={onSendDocument}
        blocked={blocked}
        replyDraft={replyDraft}
        onCancelReply={onCancelReply}
        showJumpPill={showJumpPill}
        newMessagesCount={newMessagesCount}
        onJumpToLatest={jumpToLatest}
      />
      <ConversationPanelOverlays
        overlays={{
          actionTarget,
          deleteTarget,
          deleteForMeTarget,
          reportTarget,
          onReactionToggle: handleReactionToggle,
          onSetReply,
          onBeginEdit: beginEdit,
          onCopyMessage: copyMessage,
          onForward: onForwardMessage,
          onTogglePin,
          onToggleStar,
          setActionTarget,
          setDeleteTarget,
          setDeleteForMeTarget,
          setReportTarget,
          onConfirmDelete: confirmDelete,
          onConfirmDeleteForMe: confirmDeleteForMe,
          deletePending,
          deleteForMePending,
        }}
        groupModals={{
          active,
          groupInfoOpen,
          seenBySheetOpen,
          onCloseGroupInfo: () => setGroupInfoOpen(false),
          onCloseSeenBy: () => setSeenBySheetOpen(false),
          myUserId,
          groupSeenBy,
          onLeaveGroup,
          leavePending,
          groupManaging,
          onAddGroupMembers,
          onRemoveGroupMember,
          onChangeGroupMemberRole,
          onUpdateGroupInfo,
        }}
      />
    </div>
  );
}
