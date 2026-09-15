import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ChatImageViewerProvider } from "./ChatImageViewerContext";
import { ConversationComposerDock } from "./ConversationComposerDock";
import { ConversationPanelOverlays } from "./ConversationPanelOverlays";
import { ConversationTopSection } from "./ConversationTopSection";
import type { GroupMemberPick } from "./NewGroupModal";
import { MessageArea } from "./MessageArea";
import { useChatImageViewerState } from "./useChatImageViewerState";
import { useConversationSheets } from "./useConversationSheets";
import { useCounterpartStatus } from "./useCounterpartStatus";
import { useMessageActionMenu } from "./useMessageActionMenu";
import { useMessageLogState } from "./useMessageLogState";
import { useConversationPinStar } from "./useConversationPinStar";
import { useWallpaper } from "./wallpaper";
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
  const { t } = useTranslation();

  // Group-info / management view + "Seen by" sheet open state (groups only):
  // its own hook, see useConversationSheets.
  const { groupInfo, seenBy } = useConversationSheets();

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

  // The thread's photo sequence and which one the full screen viewer is on.
  const { photos, openIndex, openOriginRef, openImage, closeViewer } =
    useChatImageViewerState(messageGroups, {
      counterpartName: active.name,
      youLabel: t("messages:viewer.you"),
      /* Excluded for a group, where `avatarUrl` is the GROUP's picture, not a
         person's. The gallery falls back to this whenever a message carries no
         `senderAvatar` of its own, so passing it here painted the group's
         image as the face of every member who has no profile photo. Undefined
         lets the viewer's initials avatar do the right thing instead.
         Deliberately NOT mirrored onto `counterpartName` above, which has the
         same shape: a group message with no `senderName` already falls back to
         the group's name today, and changing that is a separate call. */
      counterpartAvatar: active.isGroup ? undefined : active.avatarUrl,
      youAvatar: user?.profile.avatarUrl ?? undefined,
    });

  // The counterpart's live presence + read/delivered watermarks: its own
  // hook, see useCounterpartStatus.
  const { isCounterpartOnline, counterpartLastReadAt, counterpartDeliveredAt } =
    useCounterpartStatus(active, myUserId);

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

  // This chat's wallpaper, or the base one if it has no pick of its own.
  const wallpaper = useWallpaper(active.id);

  return (
    // The data attribute drives `.convoPanel::after` (the pattern layer). It
    // sits on the PANEL rather than on `.area` so the wallpaper stays put
    // while the log scrolls.
    <div
      className={styles.convoPanel}
      data-wallpaper-pattern={wallpaper.pattern}
    >
      <ConversationTopSection
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
        onOpenStarred={onOpenStarred}
        onOpenGroupInfo={groupInfo.open}
        pinnedMessages={pinnedMessages}
        onJumpToMessage={jumpToMessageVirtualized}
      />

      <ChatImageViewerProvider openImage={openImage}>
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
          onOpenSeenBy={seenBy.open}
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
      </ChatImageViewerProvider>

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
          photos,
          photoIndex: openIndex,
          photoOrigin: openOriginRef,
          onClosePhoto: closeViewer,
          onForwardPhoto: onForwardMessage,
        }}
        groupModals={{
          active,
          groupInfoOpen: groupInfo.isOpen,
          seenBySheetOpen: seenBy.isOpen,
          onCloseGroupInfo: groupInfo.close,
          onCloseSeenBy: seenBy.close,
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
