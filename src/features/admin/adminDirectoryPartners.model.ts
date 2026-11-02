import {
  DIRECTORY_PARTNER_LIMIT,
  DIRECTORY_PARTNER_NOTE_MAX,
  directoryPartnerRefusalOf,
  type DirectoryPartnerPublicState,
  type DirectoryPartnerRefusalReason,
} from "../marketing/api/directoryPartners.api";
import {
  studioReasonOf,
  type StudioFailureReason,
} from "../studio/studioReason";

/** The line each partner refusal shows, one per reason code the server
 *  sends (contract section 4). */
export const DIRECTORY_PARTNER_REFUSAL_KEY: Record<
  DirectoryPartnerRefusalReason,
  string
> = {
  listing_not_found: "admin:directoryPartners.error.listing_not_found",
  partner_not_found: "admin:directoryPartners.error.partner_not_found",
  listing_not_live: "admin:directoryPartners.error.listing_not_live",
  listing_adult_only: "admin:directoryPartners.error.listing_adult_only",
  already_partner: "admin:directoryPartners.error.already_partner",
  partner_limit_reached: "admin:directoryPartners.error.partner_limit_reached",
  note_too_long: "admin:directoryPartners.error.note_too_long",
  order_mismatch: "admin:directoryPartners.error.order_mismatch",
};

/** The line for a failure that carries no partner reason: the connection,
 *  the server, or the account's access. */
export const DIRECTORY_PARTNER_FAILURE_KEY: Record<
  StudioFailureReason,
  string
> = {
  offline: "admin:directoryPartners.failure.offline",
  timeout: "admin:directoryPartners.failure.timeout",
  rateLimited: "admin:directoryPartners.failure.rateLimited",
  server: "admin:directoryPartners.failure.server",
  unreachable: "admin:directoryPartners.failure.unreachable",
  forbidden: "admin:directoryPartners.failure.forbidden",
  notFound: "admin:directoryPartners.failure.notFound",
  restricted: "admin:directoryPartners.failure.restricted",
  unknown: "admin:directoryPartners.failure.unknown",
};

/**
 * The catalog key that names why a partner read or write failed. The body's
 * `reason` wins when it is a known partner code; anything else is named by
 * how the request failed. Pass {@link DIRECTORY_PARTNER_ERROR_VALUES} as the
 * interpolation values.
 */
export function directoryPartnerErrorKeyOf(cause: unknown): string {
  const refusalReason = directoryPartnerRefusalOf(cause);
  if (refusalReason !== null) {
    return DIRECTORY_PARTNER_REFUSAL_KEY[refusalReason];
  }
  return DIRECTORY_PARTNER_FAILURE_KEY[studioReasonOf(cause)];
}

/** The numbers the refusal lines quote (`{max}`, `{noteMax}`). */
export const DIRECTORY_PARTNER_ERROR_VALUES = {
  max: DIRECTORY_PARTNER_LIMIT,
  noteMax: DIRECTORY_PARTNER_NOTE_MAX,
} as const;

/** The "Not showing" line for each state that keeps a pick off the public
 *  row. */
export const DIRECTORY_PARTNER_PUBLIC_STATE_KEY: Record<
  Exclude<DirectoryPartnerPublicState, "showing">,
  string
> = {
  not_live: "admin:directoryPartners.publicState.not_live",
  closed_for_good: "admin:directoryPartners.publicState.closed_for_good",
  hidden_by_owner: "admin:directoryPartners.publicState.hidden_by_owner",
  moderated: "admin:directoryPartners.publicState.moderated",
  adult_only: "admin:directoryPartners.publicState.adult_only",
};

/** The drag payload type for moving a partner row. */
export const DIRECTORY_PARTNER_DRAG_TYPE =
  "application/x-admin-directory-partner";
