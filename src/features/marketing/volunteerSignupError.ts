import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";

/** The backend's `code` for a sign-up refused because the opportunity has
 *  closed. Mirrors `OPPORTUNITY_CLOSED_CODE` in `volunteering.service.ts`. */
const OPPORTUNITY_CLOSED_CODE = "OPPORTUNITY_CLOSED";

function isOpportunityClosedError(error: ApiError): boolean {
  return (
    (error.data as { code?: string } | null | undefined)?.code ===
    OPPORTUNITY_CLOSED_CODE
  );
}

/** Map a failed signup to member-facing copy. A 409 is one of three cases: the
 *  opportunity has closed (read from the structured `code`), the member is
 *  already signed up, or every spot is taken (both read from the message). */
export function signupErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError && error.status === 409) {
    if (isOpportunityClosedError(error)) {
      return t("marketing:volunteerDetail.error.closed");
    }
    if (/already/i.test(error.message)) {
      return t("marketing:volunteerDetail.error.alreadySignedUp");
    }
    if (/full/i.test(error.message)) {
      return t("marketing:volunteerDetail.error.full");
    }
    return t("marketing:volunteerDetail.error.alreadyOrFull");
  }
  return t("marketing:volunteerDetail.error.generic");
}
