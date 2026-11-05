import {
  studioReasonOf,
  type StudioFailureReason,
} from "../../studio/studioReason";
import {
  LEAD_LINK_MAX,
  LEAD_LINKS_MAX,
  LEAD_LOCATION_MAX,
  LEAD_NAME_MAX,
  LEAD_NOTE_MAX,
  LEAD_PHONE_MAX,
  leadReasonOf,
  leadRefusalDetailOf,
  type HiddenLeadPersonaState,
  type LeadReasonCode,
} from "./api/leads.types";

/** The line each lead refusal shows, one per reason code the server sends
 *  (contract 10.4). A not-listed refusal that names its state reads
 *  {@link LEAD_NOT_LISTED_KEY} first; this line names all four causes for a
 *  body that carries none. */
export const LEAD_REASON_KEY: Record<LeadReasonCode, string> = {
  LEAD_NOT_FOUND: "admin:leads.error.notFound",
  LEAD_NAME_REQUIRED: "admin:leads.error.nameRequired",
  LEAD_NAME_TOO_LONG: "admin:leads.error.nameTooLong",
  LEAD_TYPE_INVALID: "admin:leads.error.typeInvalid",
  LEAD_STAGE_INVALID: "admin:leads.error.stageInvalid",
  LEAD_LOCATION_TOO_LONG: "admin:leads.error.locationTooLong",
  LEAD_EMAIL_INVALID: "admin:leads.error.emailInvalid",
  LEAD_EMAIL_TAKEN: "admin:leads.error.emailTaken",
  LEAD_PHONE_TOO_LONG: "admin:leads.error.phoneTooLong",
  LEAD_LINK_INVALID: "admin:leads.error.linkInvalid",
  LEAD_LINK_TOO_LONG: "admin:leads.error.linkTooLong",
  LEAD_TOO_MANY_LINKS: "admin:leads.error.tooManyLinks",
  LEAD_LINK_TAKEN: "admin:leads.error.linkTaken",
  LEAD_FOLLOW_UP_INVALID: "admin:leads.error.followUpInvalid",
  LEAD_PERSONA_NOT_FOUND: "admin:leads.error.personaNotFound",
  LEAD_PERSONA_NOT_LISTED: "admin:leads.error.personaNotListed.unknownState",
  LEAD_PERSONA_TAKEN: "admin:leads.error.personaTaken",
  LEAD_NOTE_EMPTY: "admin:leads.error.noteEmpty",
  LEAD_NOTE_TOO_LONG: "admin:leads.error.noteTooLong",
  LEAD_NOTE_NOT_FOUND: "admin:leads.error.noteNotFound",
  LEAD_NOTE_NOT_YOURS: "admin:leads.error.noteNotYours",
  LEAD_ENTRY_NOT_EDITABLE: "admin:leads.error.entryNotEditable",
  LEAD_CURSOR_INVALID: "admin:leads.error.cursorInvalid",
};

/** The link refusal's line for each state a not-listed body can name. */
export const LEAD_NOT_LISTED_KEY: Record<HiddenLeadPersonaState, string> = {
  draft: "admin:leads.error.personaNotListed.draft",
  not_open: "admin:leads.error.personaNotListed.not_open",
  removed: "admin:leads.error.personaNotListed.removed",
  taken_down: "admin:leads.error.personaNotListed.taken_down",
};

/** The line for a failure that carries no lead reason: the connection, the
 *  server, or the account's access. */
export const LEAD_FAILURE_KEY: Record<StudioFailureReason, string> = {
  offline: "admin:leads.failure.offline",
  timeout: "admin:leads.failure.timeout",
  rateLimited: "admin:leads.failure.rateLimited",
  server: "admin:leads.failure.server",
  unreachable: "admin:leads.failure.unreachable",
  forbidden: "admin:leads.failure.forbidden",
  notFound: "admin:leads.failure.notFound",
  restricted: "admin:leads.failure.restricted",
  unknown: "admin:leads.failure.unknown",
};

/** The limit a too-long or too-many refusal quotes as `{max}`. */
export const LEAD_ERROR_MAX: Partial<Record<LeadReasonCode, number>> = {
  LEAD_NAME_TOO_LONG: LEAD_NAME_MAX,
  LEAD_LOCATION_TOO_LONG: LEAD_LOCATION_MAX,
  LEAD_PHONE_TOO_LONG: LEAD_PHONE_MAX,
  LEAD_LINK_TOO_LONG: LEAD_LINK_MAX,
  LEAD_TOO_MANY_LINKS: LEAD_LINKS_MAX,
  LEAD_NOTE_TOO_LONG: LEAD_NOTE_MAX,
};

/**
 * The catalog key that names why a lead read or write failed. A not-listed
 * refusal with a known `publicState` names that state; any other known code
 * reads its own line; a failure with no lead code names the connection,
 * server or access cause.
 */
export function leadErrorKeyOf(cause: unknown): string {
  const reasonCode = leadReasonOf(cause);
  if (reasonCode === "LEAD_PERSONA_NOT_LISTED") {
    const { publicState } = leadRefusalDetailOf(cause);
    if (publicState !== null) return LEAD_NOT_LISTED_KEY[publicState];
  }
  if (reasonCode !== null) return LEAD_REASON_KEY[reasonCode];
  return LEAD_FAILURE_KEY[studioReasonOf(cause)];
}

/** The values a refusal line interpolates: the other lead's name on a taken
 *  refusal, the limit on a too-long one. */
export function leadErrorValuesOf(cause: unknown): {
  name?: string;
  max?: number;
} {
  const values: { name?: string; max?: number } = {};
  const { leadName } = leadRefusalDetailOf(cause);
  if (leadName !== null) values.name = leadName;
  const reasonCode = leadReasonOf(cause);
  const max = reasonCode === null ? undefined : LEAD_ERROR_MAX[reasonCode];
  if (max !== undefined) values.max = max;
  return values;
}
