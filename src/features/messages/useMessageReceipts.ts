import { useCallback, useState } from "react";
import { useDeliveredFrames, useReadFrames } from "../../shared/api/realtime";
import type { Conversation } from "./data";

export interface MessageReceipts {
  /** Effective "Seen" watermark for the open thread (null in demo mode). */
  counterpartLastReadAt: string | null;
  /** Effective "delivered" watermark for the open thread (null in demo mode). */
  counterpartDeliveredAt: string | null;
}

/**
 * Live read-receipt ("Seen") + delivered ("double check") watermarks for the
 * open thread, driven by the counterpart's realtime frames. Extracted from
 * `useMessagesController`; behaviour is unchanged.
 */
export function useMessageReceipts(
  myUserId: string | null,
  active: Conversation | null,
): MessageReceipts {
  /** Live "Seen" watermark per conversation, from the counterpart's `read`
   *  frames — the max lastReadAt observed so far, keyed by conversation id. */
  const [readWatermarks, setReadWatermarks] = useState<Record<string, string>>({});
  /** Live "delivered" (double-check) watermark per conversation, from the
   *  counterpart's `message:delivered` frames — the max deliveredAt observed so
   *  far, keyed by conversation id. One rung below `readWatermarks`. */
  const [deliveredWatermarks, setDeliveredWatermarks] = useState<
    Record<string, string>
  >({});

  // Read receipts ("Seen"): the counterpart's `read` frame reports THEIR
  // lastReadAt, which advances the watermark for the message they've now read
  // up to. Ignore frames carrying my OWN userId — those are my own read
  // (drives the unread badge elsewhere), not a receipt on my sent messages.
  const onRead = useCallback(
    (frame: { conversationId: string; userId: string; lastReadAt: string }) => {
      if (myUserId && frame.userId === myUserId) return;
      setReadWatermarks((prev) => {
        const existing = prev[frame.conversationId];
        if (existing && existing >= frame.lastReadAt) return prev; // ISO strings compare lexicographically
        return { ...prev, [frame.conversationId]: frame.lastReadAt };
      });
    },
    [myUserId],
  );
  useReadFrames(onRead);

  // Delivered ("double check"): the counterpart's `message:delivered` frame
  // reports THEIR delivered watermark. Ignore frames carrying my OWN userId —
  // that's my own device acking receipt of the counterpart's messages, which
  // renders against THEIR bubbles for them, not mine.
  const onDelivered = useCallback(
    (frame: { conversationId: string; userId: string; deliveredAt: string }) => {
      if (myUserId && frame.userId === myUserId) return;
      setDeliveredWatermarks((prev) => {
        const existing = prev[frame.conversationId];
        if (existing && existing >= frame.deliveredAt) return prev; // ISO lexicographic
        return { ...prev, [frame.conversationId]: frame.deliveredAt };
      });
    },
    [myUserId],
  );
  useDeliveredFrames(onDelivered);

  /** Effective "Seen" watermark for the open thread: a live `read` frame wins
   *  once one has arrived, otherwise fall back to the conversation's last
   *  known `otherLastReadAt` from the inbox fetch. Null in demo mode (no read
   *  frames, no `otherLastReadAt` on mock threads) — "Seen" simply never shows. */
  const counterpartLastReadAt = active
    ? (readWatermarks[active.id] ?? active.otherLastReadAt ?? null)
    : null;

  /** Effective "delivered" watermark for the open thread: a live
   *  `message:delivered` frame wins, else the inbox's `otherDeliveredAt`. Null in
   *  demo mode — the demo ladder is simulated on the optimistic message instead. */
  const counterpartDeliveredAt = active
    ? (deliveredWatermarks[active.id] ?? active.otherDeliveredAt ?? null)
    : null;

  return { counterpartLastReadAt, counterpartDeliveredAt };
}
