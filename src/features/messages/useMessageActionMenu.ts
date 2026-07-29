import { useCallback, useState } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import {
  useToggleReaction,
  useDeleteMessage,
  useEditMessage,
} from "./api/useMessageActions";
import { type LongPressOrigin } from "./useLongPress";
import { type ChatMessage } from "./data";

/** Own messages remain editable for 15 minutes after they were sent (client
 *  gate; the server is the authority and rejects edits past its own window). */
const EDIT_WINDOW_MS = 15 * 60 * 1000;

/** The message the long-press/right-click action menu is open for. `source`
 *  decides the surface — touch long-press → full-screen overlay; desktop
 *  right-click/keyboard → compact context menu at `point`. */
export type ActionOverlayTarget =
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

export interface MessageActionMenu {
  actionTarget: ActionOverlayTarget;
  setActionTarget: React.Dispatch<React.SetStateAction<ActionOverlayTarget>>;
  deleteTarget: ChatMessage | null;
  setDeleteTarget: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
  reportTarget: ChatMessage | null;
  setReportTarget: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
  editingMessageId: string | null;
  confirmDelete: () => void;
  beginEdit: (message: ChatMessage) => void;
  submitEdit: (message: ChatMessage, nextBody: string) => void;
  cancelEdit: () => void;
  openActions: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
  copyMessage: (message: ChatMessage) => void;
  handleReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  deletePending: boolean;
}

/**
 * The long-press/right-click action menu for the open conversation — action
 * overlay + delete-confirm + report-modal state, inline-edit state, and the
 * reaction toggle — extracted from `ConversationPanel` to keep it under the
 * component-size cap (mirrors `useConversationPinStar`). Edit/delete/report/
 * reaction only ever fire on a message with a server id (demo mock/optimistic
 * messages have none), so every handler no-ops without one.
 */
export function useMessageActionMenu(conversationId: string): MessageActionMenu {
  const toggleReaction = useToggleReaction(conversationId);
  const deleteMessage = useDeleteMessage(conversationId);
  const editMessage = useEditMessage(conversationId);

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

  const beginEdit = useCallback((message: ChatMessage) => {
    if (message.id) setEditingMessageId(message.id);
  }, []);
  const submitEdit = useCallback(
    (message: ChatMessage, nextBody: string) => {
      const trimmed = nextBody.trim();
      if (message.id && trimmed && trimmed !== message.text) {
        editMessage.mutate({ messageId: message.id, body: trimmed });
      }
      setEditingMessageId(null);
    },
    [editMessage],
  );
  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
  }, []);

  // optimistic/failed messages have no server id yet, so the menu can't open
  const openActions = useCallback(
    (message: ChatMessage, origin: LongPressOrigin, isSent: boolean) => {
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
    },
    [],
  );

  const copyMessage = useCallback((message: ChatMessage) => {
    void navigator.clipboard?.writeText(message.text);
  }, []);

  /** Adds/removes a reaction. Live-only: `message.id` is the server id the
   *  mutation needs; demo messages have none, so this is a no-op there. */
  const handleReactionToggle = useCallback(
    (message: ChatMessage, key: MessageReactionKey, mine: boolean) => {
      if (!message.id) return;
      toggleReaction.mutate({ messageId: message.id, key, mine });
    },
    [toggleReaction],
  );

  return {
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
    deletePending: deleteMessage.isPending,
  };
}
