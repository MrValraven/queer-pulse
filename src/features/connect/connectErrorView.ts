import { ApiError } from "../../shared/api/client";

/**
 * Which calm mark the terminal notice panel shows. `reached` = the message
 * already exists / you're already linked; `held` = this connection isn't open
 * to you right now.
 */
export type ConnectNoticeIcon = "reached" | "held";

/**
 * How the Connect modal should react to a failed reach-out.
 *
 * - `inline` — a retryable/transient failure: keep the form mounted and show
 *   this message under it.
 * - `panel` — a terminal outcome where retrying can't help: replace the form
 *   with a notice panel (no Send button), titled/bodied by these keys.
 */
export type ConnectErrorView =
  | { mode: "inline"; messageKey: string }
  | {
      mode: "panel";
      titleKey: string;
      bodyKey: string;
      icon: ConnectNoticeIcon;
    };

/**
 * Exact messages thrown by the backend for `POST /connections`
 * (queerpulse-backend `src/connections/connections.service.ts`). There is no
 * machine-readable `code` field on the error body, so status + message is the
 * only signal we can switch on — keep these strings in sync with the service.
 */
const MESSAGE = {
  alreadyPending: "A request is already pending",
  alreadyConnected: "You are already connected",
  youBlocked: "Unblock this member before sending a request",
  notAccepting: "This member is not accepting connections",
  needsIntro: "This member requires an introduction from a mutual connection",
  cannotConnect: "You cannot connect with this member",
} as const;

const GENERIC_INLINE: ConnectErrorView = {
  mode: "inline",
  messageKey: "connect:form.sendError",
};

/**
 * Map a rejected reach-out to the experience the user should see. Anything we
 * don't explicitly recognise — a non-`ApiError` network drop, a 5xx, a 403 that
 * isn't one of the business cases below (e.g. a CSRF/active-member guard, or a
 * lockdown the client already handles) — falls through to the generic inline
 * error, which is never worse than today's behaviour.
 *
 * Note on privacy: the backend deliberately reports a block *by the other
 * party* as `alreadyPending`, so that case renders "you've already reached out"
 * and never reveals the block. `cannotConnect` (a block in either direction)
 * stays intentionally vague for the same reason.
 */
export function describeConnectError(error: unknown): ConnectErrorView {
  if (!(error instanceof ApiError)) return GENERIC_INLINE;

  if (error.status === 429) {
    return { mode: "inline", messageKey: "connect:form.rateLimitError" };
  }

  if (error.status === 409) {
    if (error.message === MESSAGE.alreadyConnected) {
      return {
        mode: "panel",
        titleKey: "connect:notice.alreadyConnected.title",
        bodyKey: "connect:notice.alreadyConnected.body",
        icon: "reached",
      };
    }
    if (error.message === MESSAGE.youBlocked) {
      return {
        mode: "panel",
        titleKey: "connect:notice.youBlocked.title",
        bodyKey: "connect:notice.youBlocked.body",
        icon: "held",
      };
    }
    // Everything else at 409 — a pending request, or a block by the other party
    // the backend masks as one — reads as "already reached out".
    return {
      mode: "panel",
      titleKey: "connect:notice.alreadyPending.title",
      bodyKey: "connect:notice.alreadyPending.body",
      icon: "reached",
    };
  }

  if (error.status === 403) {
    if (error.message === MESSAGE.notAccepting) {
      return {
        mode: "panel",
        titleKey: "connect:notice.notAccepting.title",
        bodyKey: "connect:notice.notAccepting.body",
        icon: "held",
      };
    }
    if (error.message === MESSAGE.needsIntro) {
      return {
        mode: "panel",
        titleKey: "connect:notice.needsIntro.title",
        bodyKey: "connect:notice.needsIntro.body",
        icon: "held",
      };
    }
    if (error.message === MESSAGE.cannotConnect) {
      return {
        mode: "panel",
        titleKey: "connect:notice.cannotConnect.title",
        bodyKey: "connect:notice.cannotConnect.body",
        icon: "held",
      };
    }
  }

  return GENERIC_INLINE;
}
