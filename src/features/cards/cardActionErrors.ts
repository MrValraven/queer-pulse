import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { RenewCardReasonCode } from "./api/cards.api";

/**
 * The cause lines for a failed membership-card write (queerpulse-backend
 * `membership-cards/*`): the designer save, issuing cards, a holder's status,
 * and the member's own wallet (consents, removal, renewal). Each action hands
 * `causeErrorKey` the lines only cards can say; everything else (no
 * connection, signed out, restricted account, inactive membership, throttle,
 * server fault, timeout) is a shared `shared:apiError.*` cause.
 */

/** `SUBCOMMUNITY_FEATURE_UNAVAILABLE`: a space (sub-community) asked to run a
 *  card programme, which only a main community can. */
const PROGRAMME_OVERRIDES: CauseErrorOverrides = {
  SUBCOMMUNITY_FEATURE_UNAVAILABLE: "cards:error.spaceNoCards",
};

/** `PUT /communities/:slug/cards` and `POST .../issue-all`. */
export function cardProgrammeErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, PROGRAMME_OVERRIDES);
}

/** `PATCH .../cards/holders/:cardId`: the service answers 400 when a suspend
 *  or revoke carries no reason. */
export function cardHolderStatusErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    ...PROGRAMME_OVERRIDES,
    400: "cards:error.reasonRequired",
  });
}

/** `PATCH`/`DELETE /me/cards/:cardId`: 404 when the card has left the wallet. */
export function myCardWriteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, { 404: "cards:error.cardGone" });
}

/** The `reasonCode` the backend puts on a refused renewal (not a `code`, so
 *  the shared classifier cannot read it). */
const RENEW_REASON_KEY: Readonly<Record<RenewCardReasonCode, string>> = {
  self_renew_not_allowed: "cards:renew.error.notAllowed",
  card_withdrawn: "cards:renew.error.withdrawn",
  not_a_member: "cards:renew.error.notAMember",
  programme_paused: "cards:renew.error.paused",
  no_expiry: "cards:renew.error.noExpiry",
  not_due: "cards:renew.error.notDue",
};

/** `POST /me/cards/:cardId/renew`: the coded refusals first, then the shared
 *  causes (404 the card is gone). */
export function cardRenewErrorCopy(error: unknown): CauseErrorCopy {
  if (error instanceof ApiError) {
    const reasonCode = (error.data as { reasonCode?: unknown } | null)
      ?.reasonCode;
    if (
      typeof reasonCode === "string" &&
      Object.hasOwn(RENEW_REASON_KEY, reasonCode)
    ) {
      return { key: RENEW_REASON_KEY[reasonCode as RenewCardReasonCode] };
    }
  }
  return causeErrorKey(error, { 404: "cards:error.cardGone" });
}
