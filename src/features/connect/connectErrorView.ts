import { ApiError } from "../../shared/api/client";
import { causeErrorKey } from "../../shared/api/causeErrorKey";
import {
  firstContactErrorReason,
  UNBLOCK_TO_CONTACT_CODE,
  type FirstContactErrorReason,
} from "../messages/api/firstContactError";

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
  | {
      mode: "inline";
      messageKey: string;
      /** Values the message interpolates (the shared `refused` line names its
       *  status). */
      messageValues?: Record<string, string | number>;
    }
  | {
      mode: "panel";
      titleKey: string;
      bodyKey: string;
      icon: ConnectNoticeIcon;
    }
  /**
   * `incoming` (PRD-03) — they asked YOU first, so the answer is an accept
   * rather than a message. Its own mode instead of a third panel copy pair:
   * this outcome has real actions behind it, and the notice panel is by
   * definition the terminal one with nothing left to do.
   */
  | { mode: "incoming" };

/**
 * Exact messages thrown by the backend for `POST /connections`
 * (queerpulse-backend `src/connections/connections.service.ts`). Most of these
 * refusals carry no machine-readable `code`, so status + message is the signal
 * we switch on; keep these strings in sync with the service. The requester's
 * own block also carries `UNBLOCK_TO_CONTACT`, read first, with `youBlocked`
 * kept for a backend that sends the message alone.
 */
const MESSAGE = {
  alreadyPending: "A request is already pending",
  /** They asked you, so this member's own request cannot be sent (PRD-03). */
  theyAskedYou: "This member has already asked to connect with you",
  alreadyConnected: "You are already connected",
  youBlocked: "Unblock this member before sending a request",
  needsIntro: "This member requires an introduction from a mutual connection",
} as const;

/**
 * The inline line for a failure with no business view of its own: the shared
 * cause for whatever happened (a lost connection, a restriction, an inactive
 * membership, a signed-out session, a server fault), so the member learns why
 * the request did not go and what to do next.
 */
function causeInline(error: unknown): ConnectErrorView {
  const cause = causeErrorKey(error);
  return { mode: "inline", messageKey: cause.key, messageValues: cause.values };
}

/**
 * The views for the coded first-contact refusals. The two caps lift on their
 * own, so they stay inline with the draft in place; a paused account and a
 * recipient who only hears from connections cannot be retried past, so they
 * get the terminal notice panel.
 */
const FIRST_CONTACT_VIEW: Record<FirstContactErrorReason, ConnectErrorView> = {
  dailyLimit: { mode: "inline", messageKey: "connect:form.dailyLimitError" },
  pendingLimit: {
    mode: "inline",
    messageKey: "connect:form.pendingLimitError",
  },
  paused: {
    mode: "panel",
    titleKey: "connect:notice.requestsPaused.title",
    bodyKey: "connect:notice.requestsPaused.body",
    icon: "held",
  },
  recipientConnectionsOnly: {
    mode: "panel",
    titleKey: "connect:notice.connectionsOnly.title",
    bodyKey: "connect:notice.connectionsOnly.body",
    icon: "held",
  },
};

/**
 * Map a rejected reach-out to the experience the user should see. Anything we
 * don't explicitly recognise — a non-`ApiError` network drop, a 5xx, a 403 that
 * isn't one of the business cases below (e.g. a CSRF/active-member guard, or a
 * lockdown the client already handles) — falls through to an inline line that
 * names its cause through the shared classifier.
 *
 * Note on privacy (SEC-19): a block *by the other party*, a member hidden from
 * the requester, a live self-hide, a takedown and an inactive account all come
 * back as the same 404 "Member not found", which renders one "this member is
 * not available" panel, so none of them is distinguishable from the others. A
 * decline cooldown or cap (PRD-20) stays the masked 409 `alreadyPending`. Only
 * `theyAskedYou` was split out of that 409, and it discloses nothing: the
 * member is the addressee of that request, so it is already in their bell and
 * on their connections page. The requester's own block is theirs to know, so
 * it names itself (`UNBLOCK_TO_CONTACT`).
 */
export function describeConnectError(error: unknown): ConnectErrorView {
  if (!(error instanceof ApiError)) return causeInline(error);

  // PRD-365/366: coded refusals come first, so a daily or pending cap is not
  // mistaken for the per-minute throttle that shares its 429.
  const firstContactReason = firstContactErrorReason(error);
  if (firstContactReason) return FIRST_CONTACT_VIEW[firstContactReason];

  if (error.status === 429) {
    return { mode: "inline", messageKey: "connect:form.rateLimitError" };
  }

  if (error.status === 404) {
    return {
      mode: "panel",
      titleKey: "connect:notice.cannotConnect.title",
      bodyKey: "connect:notice.cannotConnect.body",
      icon: "held",
    };
  }

  if (error.status === 409) {
    // PRD-03. A pending request pointing the OTHER way is the one 409 whose
    // old copy said the opposite of what happened: "you have already reached
    // out" for a message this member never sent. It now hands the modal the
    // request waiting for THEM, with an accept and a decline on it.
    if (error.message === MESSAGE.theyAskedYou) {
      return { mode: "incoming" };
    }
    if (error.message === MESSAGE.alreadyConnected) {
      return {
        mode: "panel",
        titleKey: "connect:notice.alreadyConnected.title",
        bodyKey: "connect:notice.alreadyConnected.body",
        icon: "reached",
      };
    }
    const isOwnBlock =
      (error.data as { code?: unknown } | null | undefined)?.code ===
        UNBLOCK_TO_CONTACT_CODE || error.message === MESSAGE.youBlocked;
    if (isOwnBlock) {
      return {
        mode: "panel",
        titleKey: "connect:notice.youBlocked.title",
        bodyKey: "connect:notice.youBlocked.body",
        icon: "held",
      };
    }
    // Everything else at 409 (a pending request, or a decline hold the
    // backend masks as one) reads as "already reached out".
    return {
      mode: "panel",
      titleKey: "connect:notice.alreadyPending.title",
      bodyKey: "connect:notice.alreadyPending.body",
      icon: "reached",
    };
  }

  if (error.status === 403) {
    if (error.message === MESSAGE.needsIntro) {
      return {
        mode: "panel",
        titleKey: "connect:notice.needsIntro.title",
        bodyKey: "connect:notice.needsIntro.body",
        icon: "held",
      };
    }
  }

  return causeInline(error);
}
