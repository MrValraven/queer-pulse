import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for turning phone push on and for sending a test push.
 *
 * Turning push on has two halves. The browser creates the subscription (it can
 * refuse with a `DOMException`: a blocked origin, no push service reachable),
 * then `POST /push/subscriptions` registers it (an `ApiError`: signed out, not
 * an active member, the 20-per-minute throttle, a server fault). Only the
 * `ApiError` half has a status to classify; a failure from the browser half is
 * not a lost connection to our servers unless the browser reports it is
 * offline, so it gets its own line.
 */
export function pushEnableErrorCopy(error: unknown): CauseErrorCopy {
  if (error instanceof ApiError) return causeErrorKey(error);
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { key: SHARED_CAUSE_KEY.noConnection };
  }
  return { key: "settings:notifications.phonePush.error.browser" };
}

/** `POST /push/test`: an `ApiError` names its cause; anything else never
 *  reached our servers. */
export function pushTestErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error);
}
