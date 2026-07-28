// src/features/messages/ConversationOverlays.tsx
import type { Dispatch, SetStateAction } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { MessageActionOverlay } from "./MessageActionOverlay";
import { MessageReportModal } from "./MessageReportModal";
import type { ChatMessage } from "./data";

type ActionTarget = { message: ChatMessage; rect: DOMRect; isSent: boolean } | null;

export interface ConversationOverlaysProps {
  /** Message the long-press/right-click action overlay is open for. */
  actionTarget: ActionTarget;
  /** Message the delete-confirm dialog is open for. */
  deleteTarget: ChatMessage | null;
  /** Message the report modal is open for (its server id is the report subject). */
  reportTarget: ChatMessage | null;
  viewerIsStaff: boolean;
  /** Own messages remain editable for this long after they were sent (client
   *  gate; the server is the authority and rejects edits past its own window). */
  editWindowMs: number;
  onReactionToggle: (message: ChatMessage, key: MessageReactionKey, mine: boolean) => void;
  /** Starts (or replaces) the reply draft with `message`. */
  onSetReply?: (message: ChatMessage) => void;
  onBeginEdit: (message: ChatMessage) => void;
  onCopyMessage: (message: ChatMessage) => void;
  /** Opens/closes the action overlay — passed straight through from `useState`. */
  setActionTarget: Dispatch<SetStateAction<ActionTarget>>;
  /** Opens/closes the delete-confirm dialog — passed straight through from `useState`. */
  setDeleteTarget: Dispatch<SetStateAction<ChatMessage | null>>;
  /** Opens/closes the report modal — passed straight through from `useState`. */
  setReportTarget: Dispatch<SetStateAction<ChatMessage | null>>;
  /** Confirms the pending delete. */
  onConfirmDelete: () => void;
  /** True while the delete request is in flight. */
  deletePending: boolean;
}

/** Presentational: the three modal/overlay surfaces a conversation can have
 *  open at once (message action overlay, delete-confirm dialog, report
 *  modal). All state and handlers are owned by `ConversationPanel` — this
 *  component only renders what's currently open. */
export function ConversationOverlays({
  actionTarget,
  deleteTarget,
  reportTarget,
  viewerIsStaff,
  editWindowMs,
  onReactionToggle,
  onSetReply,
  onBeginEdit,
  onCopyMessage,
  setActionTarget,
  setDeleteTarget,
  setReportTarget,
  onConfirmDelete,
  deletePending,
}: ConversationOverlaysProps) {
  return (
    <>
      {deleteTarget && (
        <DeleteMessageDialog
          onConfirm={onConfirmDelete}
          onClose={() => setDeleteTarget(null)}
          pending={deletePending}
        />
      )}
      {reportTarget?.id && (
        <MessageReportModal
          messageId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
      {actionTarget && (
        <MessageActionOverlay
          text={actionTarget.message.text}
          isSent={actionTarget.isSent}
          anchorRect={actionTarget.rect}
          canEdit={
            actionTarget.isSent &&
            !!actionTarget.message.at &&
            Date.now() - new Date(actionTarget.message.at).getTime() < editWindowMs
          }
          canDelete={actionTarget.isSent || viewerIsStaff}
          canReport={!actionTarget.isSent}
          onReact={(key) => onReactionToggle(actionTarget.message, key, false)}
          onReply={() => onSetReply?.(actionTarget.message)}
          onEdit={() => onBeginEdit(actionTarget.message)}
          onCopy={() => onCopyMessage(actionTarget.message)}
          onDelete={() => setDeleteTarget(actionTarget.message)}
          onReport={() => setReportTarget(actionTarget.message)}
          onClose={() => setActionTarget(null)}
        />
      )}
    </>
  );
}
