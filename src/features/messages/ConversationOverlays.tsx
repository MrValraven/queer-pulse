// src/features/messages/ConversationOverlays.tsx
import type { Dispatch, SetStateAction } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { MessageActionOverlay } from "./MessageActionOverlay";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageReportModal } from "./MessageReportModal";
import { findReactionMine } from "./reactionKeys";
import type { ChatMessage } from "./data";

type ActionTarget =
  | {
      message: ChatMessage;
      rect: DOMRect;
      isSent: boolean;
      /** Snapshotted at open time (see ConversationPanel). */
      canEdit: boolean;
      /** touch long-press → full-screen overlay; pointer → cursor context menu. */
      source: "touch" | "pointer";
      point?: { x: number; y: number };
    }
  | null;

export interface ConversationOverlaysProps {
  /** Message the long-press/right-click action overlay is open for. */
  actionTarget: ActionTarget;
  /** Message the delete-confirm dialog is open for. */
  deleteTarget: ChatMessage | null;
  /** Message the report modal is open for (its server id is the report subject). */
  reportTarget: ChatMessage | null;
  viewerIsStaff: boolean;
  onReactionToggle: (message: ChatMessage, key: MessageReactionKey, mine: boolean) => void;
  /** Starts (or replaces) the reply draft with `message`. */
  onSetReply?: (message: ChatMessage) => void;
  onBeginEdit: (message: ChatMessage) => void;
  onCopyMessage: (message: ChatMessage) => void;
  /** Opens the forward recipient picker seeded with `message`. */
  onForward: (message: ChatMessage) => void;
  /** Pins/unpins `message` (SHARED). */
  onTogglePin: (message: ChatMessage) => void;
  /** Stars/unstars `message` (PRIVATE). */
  onToggleStar: (message: ChatMessage) => void;
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
  onReactionToggle,
  onSetReply,
  onBeginEdit,
  onCopyMessage,
  onForward,
  onTogglePin,
  onToggleStar,
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
      {actionTarget &&
        (() => {
          const { message, isSent, rect, canEdit, source, point } = actionTarget;
          // Same permission gating and handlers feed both surfaces — only the
          // presentation differs (touch overlay vs. desktop context menu).
          const shared = {
            canEdit,
            canDelete: isSent || viewerIsStaff,
            canReport: !isSent,
            // Pin is server-gated via the DTO `canPin`; pinned/starred reflect
            // the message's current SHARED/PRIVATE state.
            canPin: !!message.canPin,
            pinned: !!message.pinnedAt,
            starred: !!message.starred,
            // Read the member's actual prior reaction state for this key —
            // never hardcode `false`, or re-picking a reaction you already
            // have would "add" it again instead of toggling it off (see
            // findReactionMine).
            onReact: (key: MessageReactionKey) =>
              onReactionToggle(message, key, findReactionMine(message.reactions, key)),
            onReply: () => onSetReply?.(message),
            onForward: () => onForward(message),
            onTogglePin: () => onTogglePin(message),
            onToggleStar: () => onToggleStar(message),
            onEdit: () => onBeginEdit(message),
            onCopy: () => onCopyMessage(message),
            onDelete: () => setDeleteTarget(message),
            onReport: () => setReportTarget(message),
            onClose: () => setActionTarget(null),
          };
          return source === "touch" ? (
            <MessageActionOverlay text={message.text} isSent={isSent} anchorRect={rect} {...shared} />
          ) : (
            <MessageContextMenu
              anchor={point ?? { x: isSent ? rect.right : rect.left, y: rect.top }}
              {...shared}
            />
          );
        })()}
    </>
  );
}
