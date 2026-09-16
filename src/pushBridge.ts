/**
 * The page and service-worker bridge (contract C3 of the section 4 push plan).
 *
 * The service worker cannot see React state: it does not know which
 * conversation a window has open, and its only way to move a window is a full
 * `WindowClient.navigate()` document load. This module is the shared vocabulary
 * both sides speak instead. The worker posts a request to a window client with a
 * dedicated `MessageChannel` port attached (`postMessage(request, [port2])`),
 * and the page answers on `event.ports[0].postMessage(reply)`.
 *
 * Silence is always the safe answer. A window running an older build, a tab
 * busy on the main thread, or a page that never mounted the listener simply does
 * not reply, and after `PUSH_BRIDGE_REPLY_TIMEOUT_MS` the worker reads that as
 * `isViewing: false` / `isHandled: false` and takes its pre-bridge path.
 *
 * Imported by both `sw.ts` (webworker lib) and the app (DOM lib), so everything
 * here is plain data plus `MessageChannel` and `setTimeout`, which both have.
 */

/** Messages the service worker sends to a window client over a MessageChannel. */
export const PUSH_BRIDGE_IS_VIEWING_CONVERSATION = "qp:is-viewing-conversation";
export const PUSH_BRIDGE_NAVIGATE = "qp:navigate";
/** How long the worker waits for a window to answer before assuming "no". */
export const PUSH_BRIDGE_REPLY_TIMEOUT_MS = 300;

export interface IsViewingConversationRequest {
  type: typeof PUSH_BRIDGE_IS_VIEWING_CONVERSATION;
  conversationId: string;
}
export interface IsViewingConversationReply {
  isViewing: boolean;
}
export interface NavigateRequest {
  type: typeof PUSH_BRIDGE_NAVIGATE;
  /** Already passed through the worker's safeNotificationPath. */
  url: string;
}
export interface NavigateReply {
  isHandled: boolean;
}

/** Every request the worker can send over the bridge. */
export type PushBridgeRequest = IsViewingConversationRequest | NavigateRequest;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isIsViewingConversationRequest(
  value: unknown,
): value is IsViewingConversationRequest {
  return (
    isRecord(value) &&
    value.type === PUSH_BRIDGE_IS_VIEWING_CONVERSATION &&
    isNonEmptyString(value.conversationId)
  );
}

export function isNavigateRequest(value: unknown): value is NavigateRequest {
  return (
    isRecord(value) &&
    value.type === PUSH_BRIDGE_NAVIGATE &&
    isNonEmptyString(value.url)
  );
}

export function isIsViewingConversationReply(
  value: unknown,
): value is IsViewingConversationReply {
  return isRecord(value) && typeof value.isViewing === "boolean";
}

export function isNavigateReply(value: unknown): value is NavigateReply {
  return isRecord(value) && typeof value.isHandled === "boolean";
}

/**
 * The one method the worker needs from a client. A `WindowClient` satisfies
 * it, and so does a plain test double.
 */
export interface PushBridgeMessageTarget {
  postMessage(message: unknown, transfer: Transferable[]): void;
}

/**
 * Send `request` to `target` over a fresh `MessageChannel` and resolve with the
 * reply once it passes `isReply`.
 *
 * Resolves `null`, and never rejects, when the target does not answer within
 * `timeoutMs`, answers with something `isReply` refuses, or `postMessage`
 * itself throws (a client that closed between `matchAll()` and here). Callers
 * treat `null` exactly like a "no" answer. The port is closed once the request
 * settles either way, so a late reply is dropped instead of leaking a listener.
 */
export function requestPushBridgeReply<Reply>(
  target: PushBridgeMessageTarget,
  request: PushBridgeRequest,
  isReply: (value: unknown) => value is Reply,
  timeoutMs: number = PUSH_BRIDGE_REPLY_TIMEOUT_MS,
): Promise<Reply | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let hasSettled = false;
    const settle = (reply: Reply | null) => {
      if (hasSettled) return;
      hasSettled = true;
      clearTimeout(timeoutHandle);
      channel.port1.onmessage = null;
      channel.port1.close();
      resolve(reply);
    };
    const timeoutHandle = setTimeout(() => settle(null), timeoutMs);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      settle(isReply(event.data) ? event.data : null);
    };
    try {
      target.postMessage(request, [channel.port2]);
    } catch {
      settle(null);
    }
  });
}
