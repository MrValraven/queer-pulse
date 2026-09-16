/**
 * Focus-aware push suppression. A push notification for a conversation the
 * recipient is *already looking at, in a focused window* is noise — Signal,
 * WhatsApp and Telegram all suppress it. This module holds the pure decision
 * so `sw.ts`'s push handler (which has to call `clients.matchAll()`, an
 * unmockable browser API) can stay a thin wrapper around a testable predicate.
 *
 * Deliberately conservative per the design doc: only the exact-match,
 * currently-focused case suppresses. Anything else (no focused client, a
 * focused client on a different conversation/page, a background/unfocused
 * client on the same conversation) must still show the notification.
 */

import {
  PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
  PUSH_BRIDGE_REPLY_TIMEOUT_MS,
  type PushBridgeMessageTarget,
  isIsViewingConversationReply,
  requestPushBridgeReply,
} from "./pushBridge";

/**
 * True when `clientUrl` (an open window's current URL, e.g. from
 * `WindowClient.url`) is already showing the push's target (`dataUrl`, e.g.
 * `payload.data.url` — typically a same-origin relative path like
 * `"/messages?c=conv-1"`). Compares origin + pathname + search exactly, so a
 * different conversation (`?c=conv-2`) or the bare list view (no `?c=`) is
 * correctly treated as "not viewing it" and never suppresses.
 *
 * Resolves `dataUrl` against `clientUrl` as its base, so both an absolute
 * https URL and a relative path work. Never throws: a malformed URL on
 * either side returns `false` (never suppress on uncertainty).
 */
export function isViewingTarget(clientUrl: string, dataUrl: string): boolean {
  if (!clientUrl || !dataUrl) return false;
  try {
    const client = new URL(clientUrl);
    const target = new URL(dataUrl, clientUrl);
    return (
      client.origin === target.origin &&
      client.pathname === target.pathname &&
      client.search === target.search
    );
  } catch {
    return false;
  }
}

/**
 * ENG-226: ask every focused window, over the page bridge (pushBridge.ts),
 * whether it has `conversationId` open right now.
 *
 * `isViewingTarget` alone can rarely match, because the inbox strips `?c=`
 * from the URL once a deep link is consumed and opening a thread in-app never
 * writes it back. Only the running page knows which thread is on screen, so
 * the worker asks it. All windows are asked in parallel, each bounded by the
 * bridge timeout, so the push is delayed by at most one timeout. A window that
 * does not answer (an older build, a busy main thread) counts as not viewing:
 * on uncertainty the notification still shows.
 */
export async function isAnyWindowViewingConversation(
  focusedWindows: readonly PushBridgeMessageTarget[],
  conversationId: string,
  timeoutMs: number = PUSH_BRIDGE_REPLY_TIMEOUT_MS,
): Promise<boolean> {
  if (focusedWindows.length === 0 || !conversationId) return false;
  const replies = await Promise.all(
    focusedWindows.map((focusedWindow) =>
      requestPushBridgeReply(
        focusedWindow,
        { type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION, conversationId },
        isIsViewingConversationReply,
        timeoutMs,
      ),
    ),
  );
  return replies.some((reply) => reply?.isViewing === true);
}
