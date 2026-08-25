import type { ChatMessage } from "./data";
import type { MetaStatus } from "./MessageSendStatus";

/** Resolve the honest send-status tick for an OWN outgoing message. Precedence,
 *  highest first: failed (→ null; its own retry row renders) > seen > delivered
 *  > sent > sending. `showSeen`/`showDelivered` are the live watermark flags for
 *  the thread's final outbound message; `message.deliveredAt` is the per-message
 *  stamp that lets earlier own bubbles read "delivered" on load; the demo
 *  simulation drives the same rungs via `status` ("delivered"/"seen"). */
export function resolveSendStatus(
  message: ChatMessage,
  showSeen: boolean,
  showDelivered: boolean,
): MetaStatus {
  if (message.status === "failed") return null;
  if (message.status === "sending") return "sending";
  if (message.status === "seen" || showSeen) return "seen";
  if (message.status === "delivered" || showDelivered || message.deliveredAt) {
    return "delivered";
  }
  // Acked: a demo "sent", or any server message (has an id) → single check.
  if (message.status === "sent" || message.id) return "sent";
  return null;
}
