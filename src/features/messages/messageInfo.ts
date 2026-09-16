// src/features/messages/messageInfo.ts
import { activeLocale } from "../../shared/i18n/locale";
import type { TFunction } from "../../shared/i18n/types";
import { clockLabel } from "./api/messages.adapters";
import {
  computeGroupSeenBy,
  overlayLiveReadWatermarks,
  type SeenByEntry,
} from "./groupReceipts";
import type { ChatMessage, GroupMemberView } from "./data";

/** PRD-351: whether "Info" is offered for `message`. Only the viewer's OWN,
 *  server-confirmed (has an id), not-deleted, non-system message has delivery
 *  and read details worth showing. Demo and optimistic messages carry no id,
 *  so the item simply never appears for them. */
export function canShowMessageInfo(message: ChatMessage): boolean {
  return (
    message.from === "me" &&
    !!message.id &&
    !message.deletedAt &&
    message.kind !== "system"
  );
}

/** "9:14 PM" for today, otherwise the date with the time ("12 Sep, 9:14 PM",
 *  with the year once it differs), in the active locale. Empty when absent. */
export function infoTimeLabel(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return clockLabel(iso);
  return date.toLocaleString(activeLocale(), {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** One rung of the DM info ladder: reached or not, and the moment it was
 *  reached when (and only when) the backend actually recorded that moment. */
export interface MessageInfoStep {
  isReached: boolean;
  at?: string;
}

export interface MessageInfoSteps {
  sentAt?: string;
  delivered: MessageInfoStep;
  read: MessageInfoStep;
}

/** The later of two optional ISO stamps (ISO strings compare lexicographically). */
function laterOf(first?: string | null, second?: string | null) {
  if (!first) return second ?? undefined;
  if (!second) return first;
  return first >= second ? first : second;
}

/**
 * The Sent / Delivered / Read ladder for an own DM message, derived from the
 * counterpart's LIVE watermarks each render (so a `read` or `delivered` frame
 * landing while the sheet is open shows up at once).
 *
 * What the backend watermarks hold (queerpulse-backend `ConversationsService`):
 * - `last_read_at` is written by `markRead` from `upToMessageId`, which both
 *   the web client and the socket `read` handler send: it is the `created_at`
 *   of the newest message the reader was shown, not the moment they read it.
 *   It decides WHETHER a message is read (`isRead` below), never when.
 * - `last_read_instant` (PRD-351) is the server clock's own timestamp at the
 *   moment the counterpart's `markRead` last ran: the actual read moment,
 *   read straight off `ConversationParticipant.lastReadInstant`. It lives on
 *   the PARTICIPANT, one value per counterpart rather than one per message:
 *   re-opening the thread later (even with nothing new to read) re-stamps it,
 *   so for a message read in an earlier sitting than the counterpart's most
 *   recent open, what shows is that latest open's time, which can be later
 *   than the moment THIS message was actually first seen. Shown as-is
 *   regardless, the same trade-off WhatsApp/Signal make by only ever exposing
 *   one read moment per batch.
 * - `delivered_at` is written by `markDelivered` as `now()` when the
 *   counterpart's device acks an inbound frame: the moment it acted. It only
 *   moves forward, so it names THIS message's arrival only when no newer
 *   message sits inside it. `markRead` also raises it to the `created_at` of
 *   the message it read up to, so a stamp equal to the `at` of ANY thread
 *   message (this one included) is that message's timestamp, never an ack
 *   moment. This is checked against the thread itself, not the read
 *   watermark: on the client the read watermark (live `read` frames) and the
 *   delivered one (live frames, inbox or thread fetch) come from different
 *   moments and drift apart. The time is shown only when both checks pass;
 *   otherwise Delivered is reached without a time.
 *
 * Residual case: a `markRead` with no `upToMessageId` (the legacy form, sent
 * only when the reader's tab had nothing cached yet) stamps both columns with
 * the moment of reading. That stamp matches no message `at`, so it can pass
 * the checks and show as the Delivered time: then it is an upper bound on
 * delivery (the message had arrived by then) rather than the arrival moment.
 *
 * Read row null handling: `counterpartLastReadInstant` is `null` in two
 * unrelated cases that must both render the SAME way (reached, no time,
 * never a leaked or bogus time): a withheld instant (the counterpart turned
 * read receipts off, gated server-side alongside `otherLastReadAt`) and a
 * read that happened before the `lastReadInstant` column existed (backfill:
 * `isRead` is true off the watermark, but no instant was ever recorded for
 * it). Neither is distinguishable from the other here, and neither needs to
 * be; both simply omit `read.at`.
 */
export function resolveMessageInfoSteps(
  message: ChatMessage,
  threadMessages: ChatMessage[],
  counterpartLastReadAt: string | null,
  counterpartDeliveredAt: string | null,
  counterpartLastReadInstant: string | null,
): MessageInfoSteps {
  const messageAt = message.at;
  const readWatermark = counterpartLastReadAt ?? undefined;
  const deliveredWatermark = laterOf(
    counterpartDeliveredAt,
    message.deliveredAt,
  );
  const isRead = !!messageAt && !!readWatermark && messageAt <= readWatermark;
  const isDeliveredByWatermark =
    !!messageAt && !!deliveredWatermark && messageAt <= deliveredWatermark;
  const isDelivered = isRead || isDeliveredByWatermark;
  const hasNewerMessageInsideWatermark =
    !!messageAt &&
    !!deliveredWatermark &&
    threadMessages.some(
      (threadMessage) =>
        !!threadMessage.at &&
        threadMessage.at > messageAt &&
        threadMessage.at <= deliveredWatermark,
    );
  const isDeliveredStampAMessageTimestamp = threadMessages.some(
    (threadMessage) => threadMessage.at === deliveredWatermark,
  );
  const isDeliveredStampAnAckMoment =
    isDeliveredByWatermark &&
    deliveredWatermark !== messageAt &&
    !isDeliveredStampAMessageTimestamp &&
    !hasNewerMessageInsideWatermark;
  return {
    sentAt: messageAt,
    delivered: {
      isReached: isDelivered,
      at: isDeliveredStampAnAckMoment ? deliveredWatermark : undefined,
    },
    read: {
      isReached: isRead,
      at: isRead ? (counterpartLastReadInstant ?? undefined) : undefined,
    },
  };
}

/**
 * "Seen by" entries for ANY own group message (the thread's receipt only
 * covers the latest one). `latestSeenBy` is that live receipt: every member in
 * it has a read watermark at or past the latest own message, so its `at` is
 * overlaid onto the inbox-snapshot roster before the usual comparison. That
 * keeps a member who read while the thread was open counted here too.
 */
export function groupSeenByForMessage(
  members: GroupMemberView[] | undefined,
  message: ChatMessage,
  self: { id: string | null; slug?: string },
  latestSeenBy: SeenByEntry[],
): SeenByEntry[] {
  const liveReadWatermarksByMemberId: Record<string, string> = {};
  for (const entry of latestSeenBy) {
    if (entry.id && entry.at) liveReadWatermarksByMemberId[entry.id] = entry.at;
  }
  return computeGroupSeenBy(
    overlayLiveReadWatermarks(members, liveReadWatermarksByMemberId),
    message,
    self,
  );
}

/** The localized kind word for a media message in the READER's language (its
 *  raw `text` fallback is in the sender's). Undefined for a text message.
 *  Same keys `useNewIncomingAnnouncement` announces media with. */
export function messageKindLabel(
  message: ChatMessage,
  t: TFunction,
): string | undefined {
  switch (message.kind) {
    case "image":
      return t("messages:attachments.fallbackText");
    case "gif":
      return t("messages:viewer.gifBadge");
    case "document":
      return t("messages:attachments.documentFallbackText");
    default:
      return undefined;
  }
}
