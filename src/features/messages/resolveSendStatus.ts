import type { ChatMessage } from "./data";
import type { MetaStatus } from "./MessageSendStatus";

/** Resolve the honest send-status tick for an OWN outgoing message. Precedence,
 *  highest first: failed (→ null; its own retry row renders) > sending > seen >
 *  delivered > sent. Every server-acked own message is compared against the
 *  counterpart's two watermarks (ISO timestamps), WhatsApp-style: `at` at or
 *  before the READ watermark is "seen", at or before the DELIVERED watermark is
 *  "delivered", so a burst of messages ticks together rather than only the last
 *  one. A message's own `deliveredAt` stamp still reads "delivered" on load; the
 *  demo simulation drives the same rungs via `status` ("delivered"/"seen") and
 *  carries null watermarks. An optimistic message (no server `id`) never
 *  compares against a watermark, because it has no confirmed server time. */
export function resolveSendStatus(
  message: ChatMessage,
  counterpartLastReadAt: string | null | undefined,
  counterpartDeliveredAt: string | null | undefined,
): MetaStatus {
  if (message.status === "failed") return null;
  if (message.status === "sending") return "sending";
  const isAcked = !!message.id;
  const sentAt = message.at;
  const isReadByWatermark =
    isAcked &&
    !!sentAt &&
    !!counterpartLastReadAt &&
    sentAt <= counterpartLastReadAt;
  const isDeliveredByWatermark =
    isAcked &&
    !!sentAt &&
    !!counterpartDeliveredAt &&
    sentAt <= counterpartDeliveredAt;
  if (message.status === "seen" || isReadByWatermark) return "seen";
  if (
    message.status === "delivered" ||
    isDeliveredByWatermark ||
    message.deliveredAt
  ) {
    return "delivered";
  }
  // Acked: a demo "sent", or any server message (has an id) → single check.
  if (message.status === "sent" || isAcked) return "sent";
  return null;
}
