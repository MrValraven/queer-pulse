import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { usePresenceOnline } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { Composer } from "./Composer";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationOverlays } from "./ConversationOverlays";
import { MessageArea } from "./MessageArea";
import { type RunParticipant } from "./MessageRun";
import { useMessageScroll } from "./useMessageScroll";
import { useTypingIndicator } from "./useTypingIndicator";
import { useUnreadDivider } from "./useUnreadDivider";
import {
  useToggleReaction,
  useDeleteMessage,
  useEditMessage,
} from "./api/useMessageActions";
import { me, type ChatMessage, type Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Own messages remain editable for 15 minutes after they were sent (client
 *  gate; the server is the authority and rejects edits past its own window). */
const EDIT_WINDOW_MS = 15 * 60 * 1000;

/** The message the long-press/right-click action overlay is open for. */
type ActionOverlayTarget = { message: ChatMessage; rect: DOMRect; isSent: boolean } | null;

interface ConversationPanelProps {
  active: Conversation;
  /** Max lastReadAt the counterpart has acknowledged for this thread, from a
   *  live `read` frame or the conversation's `otherLastReadAt`; null when
   *  unknown (always null in demo mode) — "Seen" then never renders. */
  counterpartLastReadAt: string | null;
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
}

/** Right-hand conversation pane: header, scrolling message area, composer. Thin
 *  orchestrator — scroll/typing/divider logic live in colocated hooks and the
 *  header/log render in their own components. */
export function ConversationPanel({
  active,
  counterpartLastReadAt,
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
}: ConversationPanelProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const viewerIsStaff = user?.role === "admin" || user?.role === "moderator";

  const toggleReaction = useToggleReaction(active.id);
  const deleteMessage = useDeleteMessage(active.id);
  const editMessage = useEditMessage(active.id);
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

  // optimistic/failed messages have no server id yet, so the overlay can't open
  function openActions(message: ChatMessage, origin: { rect: DOMRect }, isSent: boolean) {
    if (!message.id) return;
    setActionTarget({ message, rect: origin.rect, isSent });
  }

  function copyMessage(message: ChatMessage) {
    void navigator.clipboard?.writeText(message.text);
  }

  /** Scrolls to a message by server id (the bubble carries `message-<id>` as
   *  its DOM id — see `MessageBubble`) and briefly highlights it. No-op if the
   *  message isn't in the currently loaded/rendered page. */
  function jumpToMessage(messageId: string) {
    const node = document.getElementById(`message-${messageId}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const highlightClass = styles.messageHighlight;
    if (!highlightClass) return;
    node.classList.add(highlightClass);
    window.setTimeout(() => node.classList.remove(highlightClass), 1200);
  }
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

  const { areaRef, showJumpPill, handleAreaScroll, jumpToLatest } = useMessageScroll(
    messageCount,
    active.id,
    hasMoreOlder,
    loadingOlder,
    onLoadOlder,
  );
  const counterpartTyping = useTypingIndicator(active.id);

  const counterpart: RunParticipant = {
    initials: active.initials,
    tint: active.tint,
    src: active.avatarUrl,
  };
  // The signed-in member's sent-bubble avatar. `useAuth().user` is the real
  // member in live mode and the mock member in demo mode, so this works in both;
  // `me` is only a fallback for the brief pre-auth / logged-out window.
  const self: RunParticipant = user
    ? {
        initials: initialsOf(user.profile.firstName, user.profile.lastName),
        tint: tintForSlug(user.profile.slug),
        src: user.profile.avatarUrl ?? undefined,
      }
    : me;

  return (
    <div className={styles.convoPanel}>
      <ConversationHeader
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
      />

      <MessageArea
        areaRef={areaRef}
        messageGroups={messageGroups}
        loadingOlder={loadingOlder}
        onScroll={handleAreaScroll}
        dividerAnchorMessage={dividerAnchorMessage}
        counterpart={counterpart}
        self={self}
        counterpartName={active.name}
        onRetry={onRetry}
        seenActive={seenActive}
        lastOutbound={lastOutbound}
        onReactionToggle={handleReactionToggle}
        onOpenActions={openActions}
        editingMessageId={editingMessageId}
        onBeginEdit={beginEdit}
        onSubmitEdit={submitEdit}
        onCancelEdit={cancelEdit}
        onJumpToMessage={jumpToMessage}
      />

      {showJumpPill && (
        <button type="button" className={styles.jumpPill} onClick={jumpToLatest}>
          {t("messages:conversation.newMessages")} ↓
        </button>
      )}

      {counterpartTyping && (
        <div className={styles.typingRow} aria-live="polite">
          {t("messages:conversation.typing", { name: active.name.split(" ")[0] })}
        </div>
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
        editWindowMs={EDIT_WINDOW_MS}
        onReactionToggle={handleReactionToggle}
        onSetReply={onSetReply}
        onBeginEdit={beginEdit}
        onCopyMessage={copyMessage}
        setActionTarget={setActionTarget}
        setDeleteTarget={setDeleteTarget}
        setReportTarget={setReportTarget}
        onConfirmDelete={confirmDelete}
        deletePending={deleteMessage.isPending}
      />
    </div>
  );
}
