import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { loadDraftOrServerFallback } from "./drafts";
import type { MetaStatus } from "./MessageSendStatus";
import type { Conversation } from "./data";
import type { ConversationWithPreview } from "./api/messages.adapters";

/** Honest DM delivery status for the row's OWN last message, mirroring the
 *  in-bubble ladder (`resolveSendStatus`) but from conversation-level
 *  watermarks rather than a `ChatMessage`: the row has no per-message
 *  `deliveredAt`/`status` to read, only the thread's own `otherLastReadAt`/
 *  `otherDeliveredAt` plus `updatedAt` as the last message's timestamp
 *  (`useMessageLogState`'s `seenActive`/`deliveredActive` compare the same
 *  way: `lastOutbound.at <= watermark`). With no ISO `updatedAt` (a row a
 *  cache patch built before the field existed), the message still exists
 *  in the DTO, so it is at least "sent"; there's simply nothing to compare
 *  against yet. */
function resolveThreadDeliveryStatus(thread: Conversation): MetaStatus {
  if (!thread.updatedAt) return "sent";
  if (thread.otherLastReadAt && thread.updatedAt <= thread.otherLastReadAt) {
    return "seen";
  }
  if (thread.otherDeliveredAt && thread.updatedAt <= thread.otherDeliveredAt) {
    return "delivered";
  }
  return "sent";
}

export interface ThreadRowPreviewResult {
  /** Text to show in the "Draft:" slot instead of the last message, or ""
   *  when there is no draft to show (including: this row IS the currently
   *  open thread, per DES-189's "except for the currently open thread"). */
  draftText: string;
  /** The (possibly "You: "-prefixed) text for the preview slot when there is
   *  no draft to show instead. */
  previewText: string;
  /** The delivery-status tick to render before `previewText`, or `null` for
   *  no tick (a received message, a group, a system event, or no message
   *  yet). DM-only per DES-190. */
  metaStatus: MetaStatus;
}

/**
 * DES-189/190: the inbox row's preview-slot decision (draft, then "You: ",
 * then the plain last message), kept out of `MessagesThreadRow` itself to
 * stay under the 200-line cap. `isCurrentlyOpen` is the row's own
 * `thread.id === activeId`, computed by the caller so this hook doesn't need
 * to know about `activeId` as a concept.
 *
 * `thread` is typed as `ConversationWithPreview` purely for the cross-device
 * draft fallback below: every LIVE row (`conversationToView`, both the list
 * and the detail fetch) always sets `hasDraft`/`draftPreview`, so this reads
 * them there; a DEMO row is still assignable here (every added field is
 * optional) and simply reads them back `undefined`, taking the legacy
 * `thread.draft` branch instead. See that branch's own comment.
 */
export function useThreadRowPreview(
  thread: ConversationWithPreview,
  isCurrentlyOpen: boolean,
): ThreadRowPreviewResult {
  const { t } = useTranslation();
  const { user } = useAuth();
  const myHandle = user?.profile.slug ?? null;

  // ENG-253: a LIVE list row no longer carries the full `draft` string, only
  // the trimmed `draftPreview`, gated by `hasDraft` (which is distinct from an
  // empty string) so an empty draft and no draft at all are told apart.
  // `conversationToView` always sets both fields on every live row.
  // `hasDraft` being `undefined` (never `false`) is what marks a row that
  // never went through that adapter at all, i.e. a DEMO row, which is the one
  // case where falling back to the legacy `thread.draft` field is still
  // correct: demo conversations are seeded plain `Conversation` mocks that
  // carry a real `draft` string directly, with no `hasDraft`/`draftPreview`
  // to read instead.
  const serverDraftFallback =
    thread.hasDraft === undefined
      ? thread.draft
      : thread.hasDraft
        ? thread.draftPreview
        : null;
  const draftText = isCurrentlyOpen
    ? ""
    : loadDraftOrServerFallback(thread.id, serverDraftFallback).trim();

  const isLastMessageMine =
    !!myHandle &&
    !!thread.lastMessageSenderHandle &&
    thread.lastMessageSenderHandle === myHandle &&
    !thread.lastMessageIsSystem;
  // A reply sent as the business this member answers for on this thread.
  // The server's `isSentByViewer` says who typed it; staff always receive
  // the writer's first name inside their own mailbox, so a row without the
  // flag still reads by name.
  const isLastMessageBusinessReply =
    !!thread.lastMessageSenderIdentityId &&
    thread.lastMessageSenderIdentityId === thread.mailboxSeatIdentityId &&
    !thread.lastMessageIsSystem;
  const isLastMessageTypedByViewer =
    isLastMessageMine ||
    (isLastMessageBusinessReply && thread.lastMessageIsSentByViewer === true);
  const colleagueFirstName =
    isLastMessageBusinessReply && !isLastMessageTypedByViewer
      ? thread.lastMessageStaffFirstName
      : undefined;

  // A DM's `preview` is already the bare body (never name-prefixed); a
  // group's bakes the REAL sender's first name in, so the "You: " swap needs
  // the raw body behind it instead. See the matching comment in
  // `messages.adapters.ts`.
  const bodyForOwnPreview = thread.isGroup
    ? (thread.lastMessageBody ?? thread.preview)
    : thread.preview;
  const previewText = isLastMessageTypedByViewer
    ? `${t("messages:thread.previewYou")} ${bodyForOwnPreview}`
    : colleagueFirstName
      ? `${colleagueFirstName}: ${bodyForOwnPreview}`
      : thread.preview;

  // The tick follows our side's reply, whichever staff member typed it.
  const metaStatus: MetaStatus =
    !thread.isGroup && (isLastMessageMine || isLastMessageBusinessReply)
      ? resolveThreadDeliveryStatus(thread)
      : null;

  return { draftText, previewText, metaStatus };
}
