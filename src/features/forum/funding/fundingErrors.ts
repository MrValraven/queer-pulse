import { ApiError } from "../../../shared/api/client";
import { FUNDRAISING_HOSTS } from "./funding.data";
import type { FundingErrorCode } from "./funding.types";

export const FUNDING_ERROR_MESSAGE_KEYS: Record<FundingErrorCode, string> = {
  funding_kind_category_mismatch: "forum:funding.error.kindCategory",
  funding_details_required: "forum:funding.error.detailsRequired",
  funding_details_not_allowed: "forum:funding.error.detailsNotAllowed",
  funding_link_invalid: "forum:funding.error.linkInvalid",
  funding_link_host_not_allowed: "forum:funding.error.linkHostNotAllowed",
  funding_payment_details_in_body: "forum:funding.error.paymentDetails",
  funding_ask_not_anonymous: "forum:funding.error.askNotAnonymous",
  funding_ask_verification_required: "forum:funding.error.verificationRequired",
  funding_ask_limit_reached: "forum:funding.error.askLimit",
};

/** The tokens the refusal copy interpolates: the host refusal names the
 *  allowed fundraising sites from the same list the composer checks. Pass it
 *  wherever a refusal key is rendered. */
export const FUNDING_ERROR_MESSAGE_VALUES = {
  hosts: FUNDRAISING_HOSTS.join(", "),
};

/** Where a composer shows each refusal: under the link, at the top of the
 *  funding section, or as the verification gate. */
export type FundingErrorTarget = "link" | "section" | "gate";

export const FUNDING_ERROR_TARGET: Record<
  FundingErrorCode,
  FundingErrorTarget
> = {
  funding_kind_category_mismatch: "section",
  funding_details_required: "section",
  funding_details_not_allowed: "section",
  funding_link_invalid: "link",
  funding_link_host_not_allowed: "link",
  funding_payment_details_in_body: "section",
  funding_ask_not_anonymous: "section",
  funding_ask_verification_required: "gate",
  funding_ask_limit_reached: "section",
};

function isFundingErrorCode(code: string): code is FundingErrorCode {
  return Object.prototype.hasOwnProperty.call(FUNDING_ERROR_MESSAGE_KEYS, code);
}

/** The contract code on a refused write, read from the `{ code }` body the
 *  affirming-pledge errors already use. */
export function fundingErrorCode(error: unknown): FundingErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const code = (error.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" && isFundingErrorCode(code) ? code : null;
}

/** The toast key for a refused thread edit: the funding refusal's own copy
 *  when the server sent one, the caller's generic line otherwise. */
export function fundingAwareErrorKey(
  error: unknown,
  fallbackKey: string,
): string {
  const code = fundingErrorCode(error);
  return code ? FUNDING_ERROR_MESSAGE_KEYS[code] : fallbackKey;
}
