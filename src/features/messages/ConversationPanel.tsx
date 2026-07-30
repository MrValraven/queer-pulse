import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useIsOnline } from "../../shared/api/realtime";
import { ConversationComposerDock } from "./ConversationComposerDock";
import { ConversationGroupModals } from "./ConversationGroupModals";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationOverlays } from "./ConversationOverlays";
import { ConversationPinnedBanner } from "./ConversationPinnedBanner";
import type { GroupMemberPick } from "./NewGroupModal";
import { useGroupIndicators } from "./useGroupIndicators";
import { MessageArea } from "./MessageArea";
import { type RunParticipant } from "./MessageRun";
import { useJumpToMessage } from "./useJumpToMessage";
import { useMessageActionMenu } from "./useMessageActionMenu";
import { useSearchJump } from "./useSearchJump";
import { useMessageScroll } from "./useMessageScroll";
import { useMessageReceipts } from "./useMessageReceipts";
import { useUnreadDivider } from "./useUnreadDivider";
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
  const viewerIsStaff = user?.role === "admin" || user?.role === "moderator";
  /** Whether the group-info / management view is open (groups only). */
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  /** Whether the "Seen by" sheet is open (groups only). */
  const [seenBySheetOpen, setSeenBySheetOpen] = useState(false);

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

  // The single scroll-to + highlight mechanism, reused by the reply-quote jump
  // below AND the cross-inbox-search jump effect — no second scroll/highlight
  // system. Returns whether the target bubble was in the rendered DOM.
  const jumpToMessage = useJumpToMessage();

  // A search/starred result was picked: scroll to + highlight the target bubble
  // once its thread is open (retry-until-rendered, then give up). Extracted to a
  // hook to keep this component under the line cap.
  useSearchJump(jumpToMessageId, jumpToMessage, onJumpHandled);

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

  const flatMessages = useMemo(
    () => messageGroups.flatMap((group) => group.items),
    [messageGroups],
  );
  const messageCount = flatMessages.length;
  // Inbound-only tally for the jump-pill count — a reader's own sends never count as "new".
  const inboundCount = useMemo(
    () => flatMessages.filter((message) => message.from === "them").length,
    [flatMessages],
  );
  const dividerAnchorMessage = useUnreadDivider(flatMessages, active.id, active.unreadCount ?? 0);

  // "Seen": the last message I sent, and whether the counterpart's read
  // watermark has caught up to it — only that message's run shows the label. A
  // single backward walk (not a copy+reverse of the whole history, which grows
  // unbounded as the thread does) finds it in the fewest steps.
  const lastOutbound = useMemo(() => {
    for (let index = flatMessages.length - 1; index >= 0; index -= 1) {
      const candidate = flatMessages[index]!;
      if (candidate.from === "me") return candidate;
    }
    return undefined;
  }, [flatMessages]);
  const seenActive =
    !!lastOutbound?.at &&
    !!counterpartLastReadAt &&
    lastOutbound.at <= counterpartLastReadAt;
  // "Delivered" (double check): the counterpart's delivered watermark has caught
  // the last outbound message. One rung below seen — resolved with lower
  // precedence in the run view, so a seen message never regresses to delivered.
  const deliveredActive =
    !!lastOutbound?.at &&
    !!counterpartDeliveredAt &&
    lastOutbound.at <= counterpartDeliveredAt;

  const {
    areaRef,
    contentRef,
    showJumpPill,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
  } = useMessageScroll(
      messageCount,
      inboundCount,
      active.id,
      hasMoreOlder,
      loadingOlder,
      onLoadOlder,
    );

  // GROUP-only "Seen by N" (the aggregated typing label lives inside
  // `TypingIndicatorRow` now — mounted by `MessageArea` itself, driven by its
  // own `useTypingIndicator` subscription — so a typing frame never reaches
  // this panel at all).
  const { groupSeenBy } = useGroupIndicators(active, lastOutbound, {
    id: myUserId ?? null,
    slug: user?.profile?.slug,
  });

  // Memoized on the counterpart's actual identity fields (not `active` itself,
  // which also carries fast-changing bits like `hasLeft`) so this object's
  // reference stays stable across unrelated re-renders — `MessageRunView` and
  // `MessageBubble` are `React.memo`'d, and an unstable object prop here would
  // defeat that on every panel render.
  const counterpart: RunParticipant = useMemo(
    () => ({
      initials: active.initials,
      tint: active.tint,
      src: active.avatarUrl,
    }),
    [active.initials, active.tint, active.avatarUrl],
  );

  // Stable identity for the same reason as `counterpart` above — passed to
  // `MessageArea`, which isn't itself memoized, but keeping every callback
  // prop stable is cheap and consistent with the rest of this panel.
  const onOpenSeenBy = useCallback(() => setSeenBySheetOpen(true), []);

  return (
    <div className={styles.convoPanel}>
      <ConversationHeader
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
        onOpenStarred={onOpenStarred}
        onOpenGroupInfo={() => setGroupInfoOpen(true)}
      />

      <ConversationPinnedBanner pinned={pinnedMessages} onJump={jumpToMessage} />

      <MessageArea
        areaRef={areaRef}
        contentRef={contentRef}
        messageGroups={messageGroups}
        loadingOlder={loadingOlder}
        onScroll={handleAreaScroll}
        dividerAnchorMessage={dividerAnchorMessage}
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
        onJumpToMessage={jumpToMessage}
      />

      <ConversationComposerDock
        active={active}
        onSend={onSend}
        onSendGif={onSendGif}
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
        viewerIsStaff={viewerIsStaff}
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
