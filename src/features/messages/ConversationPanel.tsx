import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { usePresenceOnline } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { Composer } from "./Composer";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationOverlays } from "./ConversationOverlays";
import { ConversationPinnedBanner } from "./ConversationPinnedBanner";
import { GroupInfoModal } from "./GroupInfoModal";
import { GroupSeenBySheet } from "./GroupSeenBySheet";
import type { GroupMemberPick } from "./NewGroupModal";
import { useGroupIndicators } from "./useGroupIndicators";
import { MessageArea } from "./MessageArea";
import { type RunParticipant } from "./MessageRun";
import { useJumpToMessage } from "./useJumpToMessage";
import { useSearchJump } from "./useSearchJump";
import { useMessageScroll } from "./useMessageScroll";
import { useTypingIndicator } from "./useTypingIndicator";
import { useUnreadDivider } from "./useUnreadDivider";
import {
  useToggleReaction,
  useDeleteMessage,
  useEditMessage,
} from "./api/useMessageActions";
import { useConversationPinStar } from "./useConversationPinStar";
import { type LongPressOrigin } from "./useLongPress";
import { type ChatMessage, type Conversation, type GroupMemberView } from "./data";
import styles from "./MessagesPage.module.css";

/** Own messages remain editable for 15 minutes after they were sent (client
 *  gate; the server is the authority and rejects edits past its own window). */
const EDIT_WINDOW_MS = 15 * 60 * 1000;

/** The message the long-press/right-click action menu is open for. `source`
 *  decides the surface — touch long-press → full-screen overlay; desktop
 *  right-click/keyboard → compact context menu at `point`. */
type ActionOverlayTarget =
  | {
      message: ChatMessage;
      rect: DOMRect;
      isSent: boolean;
      /** Snapshotted at open time (the edit window is time-relative — computing
       *  it during render would be an impure, drifting value). */
      canEdit: boolean;
      source: "touch" | "pointer";
      point?: { x: number; y: number };
    }
  | null;

interface ConversationPanelProps {
  active: Conversation;
  /** Max lastReadAt the counterpart has acknowledged for this thread, from a
   *  live `read` frame or the conversation's `otherLastReadAt`; null when
   *  unknown (always null in demo mode) — "Seen" then never renders. */
  counterpartLastReadAt: string | null;
  /** Max deliveredAt the counterpart's device has acked for this thread (live
   *  frame or `otherDeliveredAt`); null when unknown / demo. Drives the "double
   *  check" one rung below "Seen". */
  counterpartDeliveredAt: string | null;
  messageGroups: { day: string; items: ChatMessage[] }[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
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
  counterpartLastReadAt,
  counterpartDeliveredAt,
  messageGroups,
  draft,
  onDraftChange,
  onSend,
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const viewerIsStaff = user?.role === "admin" || user?.role === "moderator";
  /** Whether the group-info / management view is open (groups only). */
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  /** Whether the "Seen by" sheet is open (groups only). */
  const [seenBySheetOpen, setSeenBySheetOpen] = useState(false);

  const toggleReaction = useToggleReaction(active.id);
  const deleteMessage = useDeleteMessage(active.id);
  const editMessage = useEditMessage(active.id);
  // Pin (shared) + star (private) wiring lives in its own hook to keep this
  // component under the size cap.
  const { pinnedMessages, onTogglePin, onToggleStar } =
    useConversationPinStar(active);
  /** Message the report modal is open for (its server id is the report subject). */
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);
  /** Message the delete-confirm dialog is open for. */
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const confirmDelete = useCallback(() => {
    if (deleteTarget?.id) deleteMessage.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMessage]);
  const [actionTarget, setActionTarget] = useState<ActionOverlayTarget>(null);
  /** Server id of the message the inline editor is currently open for. */
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  function beginEdit(message: ChatMessage) {
    if (message.id) setEditingMessageId(message.id);
  }
  function submitEdit(message: ChatMessage, nextBody: string) {
    const trimmed = nextBody.trim();
    if (message.id && trimmed && trimmed !== message.text) {
      editMessage.mutate({ messageId: message.id, body: trimmed });
    }
    setEditingMessageId(null);
  }
  function cancelEdit() {
    setEditingMessageId(null);
  }

  // optimistic/failed messages have no server id yet, so the menu can't open
  function openActions(message: ChatMessage, origin: LongPressOrigin, isSent: boolean) {
    if (!message.id) return;
    const canEdit =
      isSent &&
      !!message.at &&
      Date.now() - new Date(message.at).getTime() < EDIT_WINDOW_MS;
    setActionTarget({
      message,
      rect: origin.rect,
      isSent,
      canEdit,
      source: origin.source,
      point: origin.point,
    });
  }

  function copyMessage(message: ChatMessage) {
    void navigator.clipboard?.writeText(message.text);
  }

  // The single scroll-to + highlight mechanism, reused by the reply-quote jump
  // below AND the cross-inbox-search jump effect — no second scroll/highlight
  // system. Returns whether the target bubble was in the rendered DOM.
  const jumpToMessage = useJumpToMessage();

  // A search/starred result was picked: scroll to + highlight the target bubble
  // once its thread is open (retry-until-rendered, then give up). Extracted to a
  // hook to keep this component under the line cap.
  useSearchJump(jumpToMessageId, jumpToMessage, onJumpHandled);
  /** Adds/removes a reaction. Live-only: `message.id` is the server id the
   *  mutation needs; demo messages have none, so this is a no-op there. */
  const handleReactionToggle = useCallback(
    (message: ChatMessage, key: MessageReactionKey, mine: boolean) => {
      if (!message.id) return;
      toggleReaction.mutate({ messageId: message.id, key, mine });
    },
    [toggleReaction],
  );

  const online = usePresenceOnline();
  const isCounterpartOnline =
    (!!active.otherParticipantId && online.has(active.otherParticipantId)) ||
    (!active.otherParticipantId && !!active.online);

  const flatMessages = messageGroups.flatMap((group) => group.items);
  const messageCount = flatMessages.length;
  // Inbound-only tally for the jump-pill count — a reader's own sends never count as "new".
  const inboundCount = flatMessages.filter((message) => message.from === "them").length;
  const dividerAnchorMessage = useUnreadDivider(flatMessages, active.id, active.unreadCount ?? 0);

  // "Seen": the last message I sent, and whether the counterpart's read
  // watermark has caught up to it — only that message's run shows the label.
  const lastOutbound = [...flatMessages]
    .reverse()
    .find((message) => message.from === "me");
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

  const { areaRef, showJumpPill, newMessagesCount, handleAreaScroll, jumpToLatest } =
    useMessageScroll(
      messageCount,
      inboundCount,
      active.id,
      hasMoreOlder,
      loadingOlder,
      onLoadOlder,
    );
  const { typing: counterpartTyping, typingUserIds } = useTypingIndicator(
    active.id,
  );

  // GROUP-only "Seen by N" + aggregated typing label (DMs return empty/undefined
  // and keep their existing single-name typing + jade "Seen" tick paths).
  const { groupSeenBy, typingLabel } = useGroupIndicators(
    active,
    lastOutbound,
    typingUserIds,
    counterpartTyping,
    { id: myUserId ?? null, slug: user?.profile?.slug },
  );

  const counterpart: RunParticipant = {
    initials: active.initials,
    tint: active.tint,
    src: active.avatarUrl,
  };

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
        messageGroups={messageGroups}
        loadingOlder={loadingOlder}
        onScroll={handleAreaScroll}
        dividerAnchorMessage={dividerAnchorMessage}
        counterpart={counterpart}
        counterpartName={active.name}
        isGroup={active.isGroup}
        counterpartTyping={counterpartTyping}
        typingLabel={typingLabel}
        showTypingText={!!active.isGroup}
        groupSeenBy={groupSeenBy}
        onOpenSeenBy={() => setSeenBySheetOpen(true)}
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

      {showJumpPill && (
        <button type="button" className={styles.jumpPill} onClick={jumpToLatest}>
          {`${t("messages:conversation.newMessagesCount", { count: newMessagesCount })} ↓`}
        </button>
      )}

      <Composer
        active={active}
        conversationId={active.id}
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        blocked={blocked}
        replyDraft={replyDraft}
        onCancelReply={onCancelReply}
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
        deletePending={deleteMessage.isPending}
      />
      {groupInfoOpen && active.isGroup && (
        <GroupInfoModal
          active={active}
          myUserId={myUserId ?? null}
          onClose={() => setGroupInfoOpen(false)}
          onLeave={() => {
            onLeaveGroup?.(active.id);
            setGroupInfoOpen(false);
          }}
          leaving={leavePending}
          managing={groupManaging}
          onAddMembers={(picks) => onAddGroupMembers?.(active.id, picks)}
          onRemoveMember={(member) => onRemoveGroupMember?.(active.id, member)}
          onChangeMemberRole={(member, role) =>
            onChangeGroupMemberRole?.(active.id, member, role)
          }
          onUpdateInfo={(changes) => onUpdateGroupInfo?.(active.id, changes)}
        />
      )}
      {seenBySheetOpen && active.isGroup && (
        <GroupSeenBySheet
          entries={groupSeenBy}
          onClose={() => setSeenBySheetOpen(false)}
        />
      )}
    </div>
  );
}
