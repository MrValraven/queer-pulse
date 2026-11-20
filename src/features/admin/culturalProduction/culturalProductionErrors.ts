import {
  studioReasonOf,
  type StudioFailureReason,
} from "../../studio/studioReason";
import {
  CULTURAL_COMMENT_MAX,
  CULTURAL_GUIDE_BODY_MAX,
  CULTURAL_GUIDE_HEADING_MAX,
  CULTURAL_GUIDE_SECTION_STEPS_MAX,
  CULTURAL_GUIDE_SECTIONS_MAX,
  CULTURAL_GUIDE_STEPS_MAX,
  CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_MAX_ASSIGNEES,
  CULTURAL_STEP_DAYS_MAX,
  CULTURAL_STEP_DAYS_MIN,
  CULTURAL_TASK_NOTES_MAX,
  CULTURAL_TITLE_MAX,
  culturalReasonOf,
  culturalRefusalDetailOf,
  type CulturalAssigneeRefusalReason,
  type CulturalReasonCode,
} from "./api/culturalProduction.types";

const ERROR_PREFIX = "admin:culturalProduction.error";

/** The line each cultural refusal shows, one per reason code the server
 *  sends (contract section 5). A not-staff refusal that names its reason
 *  reads {@link CULTURAL_ASSIGNEE_NOT_STAFF_KEY} first; this line says the
 *  account or its access changed for a body that carries none. A too-many
 *  steps refusal reads the section line when the body names a section; this
 *  is the whole guide line. */
export const CULTURAL_REASON_KEY: Record<CulturalReasonCode, string> = {
  CULTURAL_IDEA_NOT_FOUND: `${ERROR_PREFIX}.ideaNotFound`,
  CULTURAL_TASK_NOT_FOUND: `${ERROR_PREFIX}.taskNotFound`,
  CULTURAL_GUIDE_NOT_FOUND: `${ERROR_PREFIX}.guideNotFound`,
  CULTURAL_COMMENT_NOT_FOUND: `${ERROR_PREFIX}.commentNotFound`,
  CULTURAL_TITLE_REQUIRED: `${ERROR_PREFIX}.titleRequired`,
  CULTURAL_TITLE_TOO_LONG: `${ERROR_PREFIX}.titleTooLong`,
  CULTURAL_DESCRIPTION_TOO_LONG: `${ERROR_PREFIX}.descriptionTooLong`,
  CULTURAL_NOTES_TOO_LONG: `${ERROR_PREFIX}.notesTooLong`,
  CULTURAL_EVENT_TYPE_INVALID: `${ERROR_PREFIX}.eventTypeInvalid`,
  CULTURAL_IDEA_STATUS_INVALID: `${ERROR_PREFIX}.ideaStatusInvalid`,
  CULTURAL_TASK_STATUS_INVALID: `${ERROR_PREFIX}.taskStatusInvalid`,
  CULTURAL_ASSIGNED_TO_INVALID: `${ERROR_PREFIX}.assignedToInvalid`,
  CULTURAL_DUE_DATE_INVALID: `${ERROR_PREFIX}.dueDateInvalid`,
  CULTURAL_EVENT_DATE_INVALID: `${ERROR_PREFIX}.eventDateInvalid`,
  CULTURAL_LINKED_IDEA_NOT_FOUND: `${ERROR_PREFIX}.linkedIdeaNotFound`,
  CULTURAL_LINKED_GUIDE_NOT_FOUND: `${ERROR_PREFIX}.linkedGuideNotFound`,
  CULTURAL_COMMENT_EMPTY: `${ERROR_PREFIX}.commentEmpty`,
  CULTURAL_COMMENT_TOO_LONG: `${ERROR_PREFIX}.commentTooLong`,
  CULTURAL_COMMENT_NOT_YOURS: `${ERROR_PREFIX}.commentNotYours`,
  CULTURAL_IDEA_NOT_YOURS: `${ERROR_PREFIX}.ideaNotYours`,
  CULTURAL_TASK_NOT_YOURS: `${ERROR_PREFIX}.taskNotYours`,
  CULTURAL_GUIDE_NOT_YOURS: `${ERROR_PREFIX}.guideNotYours`,
  CULTURAL_ASSIGNEE_NOT_FOUND: `${ERROR_PREFIX}.assigneeNotFound`,
  CULTURAL_ASSIGNEE_NOT_STAFF: `${ERROR_PREFIX}.assigneeNotStaff.unknownReason`,
  CULTURAL_TOO_MANY_ASSIGNEES: `${ERROR_PREFIX}.tooManyAssignees`,
  CULTURAL_GUIDE_LOCALE_INVALID: `${ERROR_PREFIX}.guideLocaleInvalid`,
  CULTURAL_GUIDE_SUMMARY_TOO_LONG: `${ERROR_PREFIX}.guideSummaryTooLong`,
  CULTURAL_GUIDE_SECTIONS_INVALID: `${ERROR_PREFIX}.guideSectionsInvalid`,
  CULTURAL_GUIDE_TOO_MANY_SECTIONS: `${ERROR_PREFIX}.guideTooManySections`,
  CULTURAL_GUIDE_HEADING_REQUIRED: `${ERROR_PREFIX}.guideHeadingRequired`,
  CULTURAL_GUIDE_HEADING_TOO_LONG: `${ERROR_PREFIX}.guideHeadingTooLong`,
  CULTURAL_GUIDE_BODY_TOO_LONG: `${ERROR_PREFIX}.guideBodyTooLong`,
  CULTURAL_GUIDE_TOO_MANY_STEPS: `${ERROR_PREFIX}.guideTooManySteps.total`,
  CULTURAL_GUIDE_STEP_TEXT_REQUIRED: `${ERROR_PREFIX}.guideStepTextRequired`,
  CULTURAL_GUIDE_STEP_TEXT_TOO_LONG: `${ERROR_PREFIX}.guideStepTextTooLong`,
  CULTURAL_GUIDE_STEP_DAYS_INVALID: `${ERROR_PREFIX}.guideStepDaysInvalid`,
  CULTURAL_GUIDE_REVISION_INVALID: `${ERROR_PREFIX}.guideRevisionInvalid`,
  CULTURAL_GUIDE_EDIT_CONFLICT: `${ERROR_PREFIX}.guideEditConflict`,
  CULTURAL_GUIDE_HAS_NO_STEPS: `${ERROR_PREFIX}.guideHasNoSteps`,
};

/** The too-many steps line for one section, when the body names it. */
const GUIDE_TOO_MANY_STEPS_SECTION_KEY = `${ERROR_PREFIX}.guideTooManySteps.section`;

/** The assign refusal's line for each reason a not-staff body can name. */
export const CULTURAL_ASSIGNEE_NOT_STAFF_KEY: Record<
  CulturalAssigneeRefusalReason,
  string
> = {
  no_access: `${ERROR_PREFIX}.assigneeNotStaff.no_access`,
  suspended: `${ERROR_PREFIX}.assigneeNotStaff.suspended`,
  deactivated: `${ERROR_PREFIX}.assigneeNotStaff.deactivated`,
};

/** The line for a failure that carries no cultural reason: the connection,
 *  the server, or the account's access. */
export const CULTURAL_FAILURE_KEY: Record<StudioFailureReason, string> = {
  offline: "admin:culturalProduction.failure.offline",
  timeout: "admin:culturalProduction.failure.timeout",
  rateLimited: "admin:culturalProduction.failure.rateLimited",
  server: "admin:culturalProduction.failure.server",
  unreachable: "admin:culturalProduction.failure.unreachable",
  forbidden: "admin:culturalProduction.failure.forbidden",
  notFound: "admin:culturalProduction.failure.notFound",
  restricted: "admin:culturalProduction.failure.restricted",
  unknown: "admin:culturalProduction.failure.unknown",
};

/** The codes whose line names a section: with no `sectionIndex` on the body
 *  they read the sections line. */
const SECTION_CODES: readonly CulturalReasonCode[] = [
  "CULTURAL_GUIDE_HEADING_REQUIRED",
  "CULTURAL_GUIDE_HEADING_TOO_LONG",
  "CULTURAL_GUIDE_BODY_TOO_LONG",
];

/** The codes whose line names a step in a section: they need both indexes. */
const STEP_CODES: readonly CulturalReasonCode[] = [
  "CULTURAL_GUIDE_STEP_TEXT_REQUIRED",
  "CULTURAL_GUIDE_STEP_TEXT_TOO_LONG",
  "CULTURAL_GUIDE_STEP_DAYS_INVALID",
];

/** The limit a too-long or too-many refusal quotes as `{max}`. The too-many
 *  steps code reads its limit from whether the body names a section. */
const CULTURAL_ERROR_MAX: Partial<Record<CulturalReasonCode, number>> = {
  CULTURAL_TITLE_TOO_LONG: CULTURAL_TITLE_MAX,
  CULTURAL_DESCRIPTION_TOO_LONG: CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_NOTES_TOO_LONG: CULTURAL_TASK_NOTES_MAX,
  CULTURAL_COMMENT_TOO_LONG: CULTURAL_COMMENT_MAX,
  CULTURAL_TOO_MANY_ASSIGNEES: CULTURAL_MAX_ASSIGNEES,
  CULTURAL_GUIDE_SUMMARY_TOO_LONG: CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_GUIDE_TOO_MANY_SECTIONS: CULTURAL_GUIDE_SECTIONS_MAX,
  CULTURAL_GUIDE_HEADING_TOO_LONG: CULTURAL_GUIDE_HEADING_MAX,
  CULTURAL_GUIDE_BODY_TOO_LONG: CULTURAL_GUIDE_BODY_MAX,
  CULTURAL_GUIDE_STEP_TEXT_TOO_LONG: CULTURAL_TITLE_MAX,
  CULTURAL_GUIDE_STEP_DAYS_INVALID: CULTURAL_STEP_DAYS_MAX,
};

/**
 * The catalog key that names why a cultural read or write failed. A
 * not-staff refusal with a known `reason` names that reason; a too-many
 * steps refusal reads the section line with a `sectionIndex` and the whole
 * guide line without; a section or step code that arrives without the index
 * its line names reads the sections line; any other known code reads its own
 * line; a failure with no cultural code names the connection, server or
 * access cause.
 */
export function culturalErrorKeyOf(cause: unknown): string {
  const reasonCode = culturalReasonOf(cause);
  if (reasonCode === null) return CULTURAL_FAILURE_KEY[studioReasonOf(cause)];
  const { reason, sectionIndex, stepIndex } = culturalRefusalDetailOf(cause);
  if (reasonCode === "CULTURAL_ASSIGNEE_NOT_STAFF" && reason !== null)
    return CULTURAL_ASSIGNEE_NOT_STAFF_KEY[reason];
  if (reasonCode === "CULTURAL_GUIDE_TOO_MANY_STEPS")
    return sectionIndex === null
      ? CULTURAL_REASON_KEY.CULTURAL_GUIDE_TOO_MANY_STEPS
      : GUIDE_TOO_MANY_STEPS_SECTION_KEY;
  const isMissingSection =
    (SECTION_CODES.includes(reasonCode) || STEP_CODES.includes(reasonCode)) &&
    sectionIndex === null;
  const isMissingStep = STEP_CODES.includes(reasonCode) && stepIndex === null;
  if (isMissingSection || isMissingStep)
    return CULTURAL_REASON_KEY.CULTURAL_GUIDE_SECTIONS_INVALID;
  return CULTURAL_REASON_KEY[reasonCode];
}

/** The values a refusal line interpolates: the limit, the lowest day count
 *  on the days line, and the section and step numbered from one. */
export function culturalErrorValuesOf(cause: unknown): {
  max?: number;
  min?: number;
  section?: number;
  step?: number;
} {
  const values: {
    max?: number;
    min?: number;
    section?: number;
    step?: number;
  } = {};
  const reasonCode = culturalReasonOf(cause);
  if (reasonCode === null) return values;
  const { sectionIndex, stepIndex } = culturalRefusalDetailOf(cause);
  const max =
    reasonCode === "CULTURAL_GUIDE_TOO_MANY_STEPS"
      ? sectionIndex === null
        ? CULTURAL_GUIDE_STEPS_MAX
        : CULTURAL_GUIDE_SECTION_STEPS_MAX
      : CULTURAL_ERROR_MAX[reasonCode];
  if (max !== undefined) values.max = max;
  if (reasonCode === "CULTURAL_GUIDE_STEP_DAYS_INVALID")
    values.min = CULTURAL_STEP_DAYS_MIN;
  if (sectionIndex !== null) values.section = sectionIndex + 1;
  if (stepIndex !== null) values.step = stepIndex + 1;
  return values;
}
