import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ChatImageViewerProvider } from "./ChatImageViewerContext";
import { ConversationComposerDock } from "./ConversationComposerDock";
import { ConversationPanelSurfaces } from "./ConversationPanelSurfaces";
import { ConversationTopSection } from "./ConversationTopSection";
import type { ConversationGroupModalsProps } from "./ConversationGroupModals";
import { MessageArea } from "./MessageArea";
import { MessageSafetyProvider } from "./MessageSafetyContext";
import { useConversationMediaGallery } from "./useConversationMediaGallery";
import { useConversationOverlays } from "./useConversationOverlays";
import { useConversationSheets } from "./useConversationSheets";
import { useCounterpartStatus } from "./useCounterpartStatus";
import { useGalleryPhotoJumpHandoff } from "./useGalleryPhotoJumpHandoff";
import { useIsThreadUnsavedOfflineState } from "./useIsThreadUnsavedOfflineState";
import { useMessageLogState } from "./useMessageLogState";
import { realConversationId } from "./useMessagesController.helpers";
import type { ThreadHistory } from "./useOlderPageAnchor";
import { useWallpaper } from "./wallpaper";
import { type ChatMessage, type Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import styles from "./MessagesPage.module.css";

/** The GROUP-management callbacks/pending-flags a conversation panel passes
 *  straight through to `ConversationGroupModals`: everything that props
 *  interface needs except the panel-owned sheet state (`active`,
 *  `groupInfoOpen`, `seenBySheetOpen`, the two close handlers, `myUserId`
 *  (also used outside group management), `groupSeenBy` and
 *  `onOpenMediaGallery`, all built by `ConversationPanel` itself). Bundled
 *  into one prop so this component's own signature doesn't have to spell out
 *  16 individually-named group props. */
export type GroupManagementProps = Omit<
  ConversationGroupModalsProps,
  | "active"
  | "groupInfoOpen"
  | "seenBySheetOpen"
  | "onCloseGroupInfo"
  | "onCloseSeenBy"
  | "myUserId"
  | "groupSeenBy"
  | "onOpenMediaGallery"
>;

interface ConversationPanelProps {
  active: Conversation;
  messageGroups: { day: string; items: ChatMessage[] }[];
  /** Sends `body` (the composer's own current text) as a new message. The
   *  panel no longer owns a draft; the `Composer` below does. */
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
  /** True when the counterpart is blocked; the composer is severed. */
  blocked?: boolean;
  /** Mobile only: returns to the conversation list. Absent on desktop. */
  onBack?: () => void;
  /** Retries a failed optimistic send. */
  onRetry: (message: ChatMessage) => void;
  /** The open thread's history (see `ThreadHistory`): whether older pages
   *  exist and one is in flight, the load-older trigger, and whether page 0 is
   *  current or its last fetch failed. Demo mode pages older history the same
   *  way live does. */
  history: ThreadHistory;
  /** The message currently being quoted for a reply, or null. */
  replyDraft?: ChatMessage | null;
  /** Starts (or replaces) the reply draft with `message`. */
  onSetReply?: (message: ChatMessage) => void;
  /** Clears the reply draft. */
  onCancelReply?: () => void;
  /** Server id of a message to scroll to + highlight once this thread is open,
   *  set when a cross-inbox search result is picked. Null when nothing pending. */
  jumpToMessageId?: string | null;
  /** Called once the panel has started the jump to `jumpToMessageId` (the jump
   *  itself reports its outcome), so the parent can clear it and not re-fire. */
  onJumpHandled?: () => void;
  /** Opens the forward recipient picker seeded with `message`. */
  onForwardMessage: (message: ChatMessage) => void;
  /** Opens the "Starred messages" view. */
  onOpenStarred: () => void;
  /** The signed-in member's user id; excludes self from "Seen by N". */
  myUserId?: string | null;
  /** Every GROUP-management callback/pending-flag (leave, add/remove/promote/
   *  demote members, edit title/avatar, ownership transfer, dissolve, invite
   *  links), bundled into one prop; see `GroupManagementProps`'s own doc.
   *  Gated in the UI on `active`'s can-flags; the server re-checks the role
   *  on each. */
  groupManagement: GroupManagementProps;
  /** Acks the thread read against the server (`POST /conversations/:id/read`).
   *  Called on thread-open by the parent already; also invoked here as new
   *  inbound messages arrive while the thread stays open (see
   *  `useMarkReadOnInbound`). */
  onMarkThreadRead: (conversationId: string) => void;
}

/** Right-hand conversation pane: header, scrolling message area, composer. Thin
 *  orchestrator: scroll/typing/divider logic live in colocated hooks and the
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
  history,
  replyDraft,
  onSetReply,
  onCancelReply,
  jumpToMessageId,
  onJumpHandled,
  onForwardMessage,
  onOpenStarred,
  myUserId,
  groupManagement,
  onMarkThreadRead,
}: ConversationPanelProps) {
  const { user } = useAuth();

  // Group-info / management view + "Seen by" sheet open state (groups only):
  // its own hook, see useConversationSheets.
  const { groupInfo, seenBy } = useConversationSheets();
  // "Media, links and docs" (PRD-373), opened from the header menu or group info.
  const { demoMode } = useDemoMode();
  const mediaGallery = useConversationMediaGallery();

  // Action menu, pin/star and photo viewer state, plus the overlay props they
  // feed: one hook, see useConversationOverlays.
  const { actionMenu, pinnedMessages, openImage, overlays } =
    useConversationOverlays(active, messageGroups, {
      youAvatar: user?.profile.avatarUrl ?? undefined,
      onSetReply,
      onForwardMessage,
    });

  // The counterpart's live presence + read/delivered watermarks: its own
  // hook, see useCounterpartStatus.
  const { isCounterpartOnline, counterpartLastReadAt, counterpartDeliveredAt } =
    useCounterpartStatus(active, myUserId);

  // Every value the scrolling message log is derived from: one cohesive
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
    history,
    jumpToMessageId,
    onJumpHandled,
    onMarkThreadRead,
  );

  // This chat's wallpaper, or the base one if it has no pick of its own.
  const wallpaper = useWallpaper(active.id);

  // See useIsThreadUnsavedOfflineState's own doc for the PRD-375 gap 6 this
  // guards (an offline stand-in session opening a thread the device never
  // saved, stuck pending with no network to fetch it with).
  const isThreadUnsavedOffline = useIsThreadUnsavedOfflineState(
    rows.length,
    history,
  );

  // Gallery photo taps outside the loaded thread land here once the jump settles.
  const openGalleryPhotoAfterJump = useGalleryPhotoJumpHandoff(
    active.id,
    messageGroups,
    openImage,
    jumpToMessageVirtualized,
  );

  return (
    // The data attribute drives `.convoPanel::after` (the pattern layer). It
    // sits on the PANEL rather than on `.area` so the wallpaper stays put
    // while the log scrolls. Wrapped in `MessageSafetyProvider` (PRD-367/369)
    // so both the message log and the media gallery below can read the
    // thread's connection state without threading a new prop through every
    // layer in between; see that context's own doc.
    <MessageSafetyProvider active={active}>
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
          onOpenMediaGallery={mediaGallery.open}
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
            loadingOlder={history.loadingOlder}
            isThreadUnsavedOffline={isThreadUnsavedOffline}
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
            onReactionToggle={actionMenu.handleReactionToggle}
            onReply={onSetReply}
            onOpenActions={actionMenu.openActions}
            editingMessageId={actionMenu.editingMessageId}
            onBeginEdit={actionMenu.beginEdit}
            onSubmitEdit={actionMenu.submitEdit}
            onCancelEdit={actionMenu.cancelEdit}
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
        <ConversationPanelSurfaces
          overlays={overlays}
          groupModals={{
            active,
            groupInfoOpen: groupInfo.isOpen,
            seenBySheetOpen: seenBy.isOpen,
            onCloseGroupInfo: groupInfo.close,
            onCloseSeenBy: seenBy.close,
            myUserId,
            groupSeenBy,
            onOpenMediaGallery: mediaGallery.open,
            ...groupManagement,
          }}
          media={{
            conversationId: demoMode ? active.id : realConversationId(active),
            isOpen: mediaGallery.isOpen,
            onClose: mediaGallery.close,
            // Handing over to the viewer or the thread also closes group info.
            onNavigateAway: () => {
              mediaGallery.closeForNavigation();
              groupInfo.close();
            },
            counterpartName: active.name,
            onOpenPhoto: openImage,
            onShowInChat: jumpToMessageVirtualized,
            onShowPhotoInChat: openGalleryPhotoAfterJump,
            messageGroups,
          }}
        />
      </div>
    </MessageSafetyProvider>
  );
}
