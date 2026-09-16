import { routes } from "../../app/routeMap";

/**
 * Pure answers the page gives the service worker over the C3 bridge
 * (`src/pushBridge.ts`). Kept free of React and browser globals so both the
 * bridge hook and the in-app message banner share ONE definition of "the member
 * is looking at this conversation", and so the rules are unit-testable.
 */

/** Whether `pathname` is the messages surface (the inbox or a thread in it). */
export function isMessagesRoute(pathname: string): boolean {
  return (
    pathname === routes.messages || pathname.startsWith(`${routes.messages}/`)
  );
}

export interface ViewingConversationInput {
  /** The conversation the question is about. */
  conversationId: string;
  /**
   * `getActiveConversationId()` from the realtime layer. It is the thread the
   * UI last REQUESTED, which can outlive the Messages page itself, so it only
   * counts together with the route check below.
   */
  activeConversationId: string | null;
  /** The router's current pathname. */
  pathname: string;
  /** `document.visibilityState` at the moment of the question. */
  visibilityState: DocumentVisibilityState;
}

/**
 * True only when the tab is visible, the member is on the messages route, and
 * the thread they have open is this conversation. A hidden tab is never
 * viewing: nobody can read a message there, and `useMarkReadOnInbound` leaves
 * it unread for the same reason.
 */
export function isViewingConversation(
  input: ViewingConversationInput,
): boolean {
  return (
    input.visibilityState === "visible" &&
    input.activeConversationId !== null &&
    input.activeConversationId === input.conversationId &&
    isMessagesRoute(input.pathname)
  );
}

/**
 * The router target for a worker `NavigateRequest` url, or `null` when the url
 * is not same-origin. The worker already passed it through its own
 * `safeNotificationPath`; this is a second check at the page, so a malformed or
 * protocol-relative value (`//elsewhere.example`) is refused and the worker
 * falls back to its full-document `navigate()`.
 */
export function toInAppNavigationTarget(
  url: string,
  origin: string,
): string | null {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url, origin);
  } catch {
    return null;
  }
  if (parsedUrl.origin !== origin) return null;
  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}
