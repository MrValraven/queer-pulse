// src/features/messages/ConversationOverlays.tsx
import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { ChatImageViewer } from "./ChatImageViewer";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { MessageActionOverlay } from "./MessageActionOverlay";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageInfoSurface } from "./MessageInfoSheet";
import { MessageReportModal } from "./MessageReportModal";
import { findReactionMine, myReactionKeys } from "./reactionKeys";
import { canCopyMessage } from "./messageCopy";
import { canShowMessageInfo } from "./messageInfo";
import { useMessageReceipts } from "./useMessageReceipts";
import { realConversationId } from "./useMessagesController.helpers";
import { WhoReactedSurface } from "./WhoReactedSheet";
import { canShowMessageReactors } from "./whoReacted";
import { useConversationSheetTargets } from "./useConversationSheetTargets";
import type { SeenByEntry } from "./groupReceipts";
import type { ChatMessage, Conversation } from "./data";
import type { ViewerPhoto } from "./useThreadImageGallery";

type ActionTarget = {
  message: ChatMessage;
  rect: DOMRect;
  isSent: boolean;
  /** Snapshotted at open time (see ConversationPanel). */
  canEdit: boolean;
  /** touch long-press → full-screen overlay; pointer → cursor context menu. */
  source: "touch" | "pointer";
  point?: { x: number; y: number };
} | null;

export interface ConversationOverlaysProps {
  /** Message the long-press/right-click action overlay is open for. */
  actionTarget: ActionTarget;
  /** Message the "delete for everyone" confirm dialog is open for. */
  deleteTarget: ChatMessage | null;
  /** Message the "delete for me" (PRD-227) confirm dialog is open for —
   *  distinct state, its own dialog instance. */
  deleteForMeTarget: ChatMessage | null;
  /** Message the report modal is open for (its server id is the report subject). */
  reportTarget: ChatMessage | null;
  onReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
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
  /** Opens/closes the "delete for me" confirm dialog (PRD-227). */
  setDeleteForMeTarget: Dispatch<SetStateAction<ChatMessage | null>>;
  /** Opens/closes the report modal — passed straight through from `useState`. */
  setReportTarget: Dispatch<SetStateAction<ChatMessage | null>>;
  /** The open conversation. It and the roster below feed the "Info" surface
   *  (PRD-351), re-read on every render so receipts that land while it is
   *  open show up. */
  active: Conversation;
  /** The signed-in member's user id, excluded from a group's "Seen by". */
  myUserId?: string | null;
  /** The live "Seen by" receipt for the latest own group message. */
  groupSeenBy: SeenByEntry[];
  /** Confirms the pending "delete for everyone". */
  onConfirmDelete: () => void;
  /** Confirms the pending "delete for me" (PRD-227). */
  onConfirmDeleteForMe: () => void;
  /** True while the delete request is in flight. */
  deletePending: boolean;
  /** True while the "delete for me" request is in flight. */
  deleteForMePending: boolean;
  /** The open thread's photo sequence, for the full screen viewer. */
  photos: ViewerPhoto[];
  /** Index into `photos` the viewer is open on, or null when it is closed. */
  photoIndex: number | null;
  /** The bubble thumbnail the viewer was opened from, for its open/close
   *  animation. See `useChatImageViewerState`. */
  photoOrigin: RefObject<HTMLElement | null>;
  /** Closes the full screen viewer. */
  onClosePhoto: () => void;
  /** Opens the forward picker for the photo being viewed. */
  onForwardPhoto: (message: ChatMessage) => void;
}

/** Presentational: the three modal/overlay surfaces a conversation can have
 *  open at once (message action overlay, delete-confirm dialog, report
 *  modal). All state and handlers are owned by `ConversationPanel` — this
 *  component only renders what's currently open. */
export function ConversationOverlays({
  actionTarget,
  deleteTarget,
  deleteForMeTarget,
  reportTarget,
  onReactionToggle,
  onSetReply,
  onBeginEdit,
  onCopyMessage,
  onForward,
  onTogglePin,
  onToggleStar,
  setActionTarget,
  setDeleteTarget,
  setDeleteForMeTarget,
  setReportTarget,
  active,
  myUserId,
  groupSeenBy,
  onConfirmDelete,
  onConfirmDeleteForMe,
  deletePending,
  deleteForMePending,
  photos,
  photoIndex,
  photoOrigin,
  onClosePhoto,
  onForwardPhoto,
}: ConversationOverlaysProps) {
  // Stable identity across renders (setActionTarget is the useState setter,
  // itself stable). The focus-trap hook no longer depends on onClose's
  // identity, but there's no reason to hand it a fresh closure every render.
  const closeActionTarget = useCallback(
    () => setActionTarget(null),
    [setActionTarget],
  );
  // Local: only this component opens and renders the "Info" and "who reacted"
  // sheets. Both close on a thread switch.
  const {
    infoTargetId,
    setInfoTargetId,
    reactionsTargetId,
    setReactionsTargetId,
  } = useConversationSheetTargets(active.id);
  // The counterpart's live read/delivered watermarks for the "Info" rows. This
  // component mounts and unmounts with `ConversationPanel`, whose own instance
  // drives the tick, so both have seen the same frames since mount.
  const { counterpartLastReadAt, counterpartDeliveredAt } = useMessageReceipts(
    myUserId ?? null,
    active,
  );
  return (
    <>
      {photoIndex !== null && (
        <ChatImageViewer
          photos={photos}
          startIndex={photoIndex}
          originRef={photoOrigin}
          onClose={onClosePhoto}
          onReply={onSetReply}
          onForward={onForwardPhoto}
          onToggleStar={onToggleStar}
        />
      )}
      {deleteTarget && (
        <DeleteMessageDialog
          onConfirm={onConfirmDelete}
          onClose={() => setDeleteTarget(null)}
          pending={deletePending}
        />
      )}
      {deleteForMeTarget && (
        <DeleteMessageDialog
          scope="me"
          onConfirm={onConfirmDeleteForMe}
          onClose={() => setDeleteForMeTarget(null)}
          pending={deleteForMePending}
        />
      )}
      {reportTarget?.id && (
        <MessageReportModal
          messageId={reportTarget.id}
          onClose={() => setReportTarget(null)}
          // PRD-368 "also block": a group message's own sender for a group
          // thread (each message can carry a different author), else the
          // DM's one counterpart. Both are absent for an official thread —
          // there is no member behind it to block.
          counterpartSlug={
            active.isGroup ? reportTarget.senderHandle : active.slug
          }
          counterpartName={
            active.isGroup ? reportTarget.senderName : active.name
          }
          isOfficial={active.official}
        />
      )}
      {infoTargetId && (
        <MessageInfoSurface
          messageId={infoTargetId}
          context={{
            active,
            myUserId,
            counterpartLastReadAt,
            counterpartDeliveredAt,
            groupSeenBy,
          }}
          onClose={() => setInfoTargetId(null)}
        />
      )}
      {reactionsTargetId && (
        <WhoReactedSurface
          messageId={reactionsTargetId}
          conversationId={realConversationId(active)}
          onReactionToggle={onReactionToggle}
          onClose={() => setReactionsTargetId(null)}
        />
      )}
      {actionTarget &&
        (() => {
          const { message, isSent, rect, canEdit, source, point } =
            actionTarget;
          // Same permission gating and handlers feed both surfaces — only the
          // presentation differs (touch overlay vs. desktop context menu).
          const shared = {
            // A reportable tombstone (server evidence hold, `canReport`) —
            // both surfaces render `TombstoneReportMenu` for it instead of
            // the full menu, so Reply/React/Forward/Star/Copy/Pin/Edit/
            // Delete/Info never appear (see `MessageActionOverlay`'s doc).
            isTombstone: !!message.deletedAt,
            canEdit,
            // Server-authoritative (`MessageResponse.canDelete`/`canReport`) —
            // mirrors exactly what the delete/report endpoints would accept
            // (author-or-staff; not-own-message), never recomputed client-side.
            canDelete: !!message.canDelete,
            canReport: !!message.canReport,
            // Pin is server-gated via the DTO `canPin`; pinned/starred reflect
            // the message's current SHARED/PRIVATE state. Both also require a
            // stable id: live server messages and demo seed messages carry
            // one, an optimistic send has none, so Pin/Star hide for it
            // instead of silently no-op-ing (see `useConversationPinStar`,
            // which already guards the mutations the same way).
            canPin: !!message.canPin && !!message.id,
            pinned: !!message.pinnedAt,
            canStar: !!message.id,
            starred: !!message.starred,
            // Feeds `MessageContextMenu`'s `ReactionPicker` so its pressed
            // state (and roving-focus start) reflects the viewer's actual
            // held reactions, keeping a genuinely pressed reaction shown as
            // pressed instead of always reading unpressed.
            myReactionKeys: myReactionKeys(message.reactions),
            // Read the member's actual prior reaction state for this key —
            // never hardcode `false`, or re-picking a reaction you already
            // have would "add" it again instead of toggling it off (see
            // findReactionMine).
            onReact: (key: MessageReactionKey) =>
              onReactionToggle(
                message,
                key,
                findReactionMine(message.reactions, key),
              ),
            onReply: () => onSetReply?.(message),
            onForward: () => onForward(message),
            onTogglePin: () => onTogglePin(message),
            onToggleStar: () => onToggleStar(message),
            onEdit: () => onBeginEdit(message),
            onCopy: () => onCopyMessage(message),
            // DES-203: hides Copy for a captionless media message (nothing
            // meaningful to copy; its `text` is only the send-time fallback
            // word). Both surfaces read this now: `MessageActionOverlay`
            // (touch) and `MessageContextMenu` (desktop) each declare and
            // forward `canCopy` to the shared `MessageActionMenu`.
            canCopy: canCopyMessage(message),
            // PRD-351: own, server-confirmed, not-deleted messages only (a
            // display gate, not a permission). A DM opens the info sheet, a
            // group the existing "Seen by" sheet for this message.
            canShowInfo: canShowMessageInfo(message),
            onInfo: () => setInfoTargetId(message.id ?? null),
            // PRD-352: a server-confirmed message with a reaction (a display
            // gate; the endpoint re-checks visibility).
            canShowReactions: canShowMessageReactors(message),
            onReactions: () => setReactionsTargetId(message.id ?? null),
            onDelete: () => setDeleteTarget(message),
            // "Delete for me" (PRD-227) is unconditional — every participant
            // may hide a message from their own view, so this never checks
            // `canDelete` (that flag governs the "for everyone" tombstone
            // above only).
            onDeleteForMe: () => setDeleteForMeTarget(message),
            onReport: () => setReportTarget(message),
            onClose: closeActionTarget,
          };
          return source === "touch" ? (
            <MessageActionOverlay
              message={message}
              isSent={isSent}
              anchorRect={rect}
              {...shared}
            />
          ) : (
            <MessageContextMenu
              anchor={
                point ?? { x: isSent ? rect.right : rect.left, y: rect.top }
              }
              {...shared}
            />
          );
        })()}
    </>
  );
}
