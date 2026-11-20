import { ApiError } from "../../../shared/api/client";
import { sanitizeLeadText } from "../leads/leadsDemoRules";
import {
  CULTURAL_COMMENT_MAX,
  CULTURAL_DATE_MAX,
  CULTURAL_DATE_MIN,
  CULTURAL_GUIDE_BODY_MAX,
  CULTURAL_GUIDE_HEADING_MAX,
  CULTURAL_GUIDE_SECTION_STEPS_MAX,
  CULTURAL_GUIDE_SECTIONS_MAX,
  CULTURAL_GUIDE_STEPS_MAX,
  CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_MAX_ASSIGNEES,
  CULTURAL_SEARCH_QUERY_MAX,
  CULTURAL_STEP_DAYS_MAX,
  CULTURAL_STEP_DAYS_MIN,
  CULTURAL_TASK_NOTES_MAX,
  CULTURAL_TITLE_MAX,
  isCulturalAssignedToFilter,
  isCulturalEventType,
  isCulturalGuideLocale,
  isCulturalIdeaStatus,
  isCulturalTaskStatus,
  isCulturalTaskStatusFilter,
  type CulturalAssignedToFilter,
  type CulturalEventType,
  type CulturalGuideSectionDTO,
  type CulturalGuideStepDTO,
  type CulturalIdeaStatus,
  type CulturalReasonCode,
  type CulturalRefusalDetail,
  type CulturalTaskFilters,
  type CulturalTaskStatus,
  type CulturalTaskStatusFilter,
} from "./api/culturalProduction.types";

// The demo store's checks, in the server's order (contract sections 7.2 and
// 8.1), so demo answers each bad value with the code live answers. Demo ids
// are no uuids, so an id "shape" here is any text that is not blank.

const STATUS_TEXT = {
  400: "Bad Request",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
} as const;

/** The refusal the server answers with, as the API client raises it:
 *  `{ statusCode, message, code }` plus the extras of that code. */
export function culturalRefusal(
  code: CulturalReasonCode,
  status: 400 | 403 | 404 | 409,
  extra?: Partial<CulturalRefusalDetail>,
): ApiError {
  return new ApiError(status, STATUS_TEXT[status], {
    statusCode: status,
    message: STATUS_TEXT[status],
    code,
    ...extra,
  });
}

/** Character limits count code points, as the server does. */
const codePointLength = (text: string): number => Array.from(text).length;

/** A sent property; `undefined` reads as absent, as JSON drops it. */
export const fieldOf = (body: object, field: string): unknown =>
  Reflect.get(body, field);

const isSent = (body: object, field: string): boolean =>
  fieldOf(body, field) !== undefined;

/** Sanitized, line ends made LF, then trimmed: the text every check reads. */
const cleanText = (value: string): string =>
  sanitizeLeadText(value).replace(/\r\n?/g, "\n").trim();

/** Required text of 1 to `max` code points. */
function requiredText(
  value: unknown,
  max: number,
  blankCode: CulturalReasonCode,
  longCode: CulturalReasonCode,
  extra?: Partial<CulturalRefusalDetail>,
): string {
  const text = typeof value === "string" ? cleanText(value) : "";
  if (text === "") throw culturalRefusal(blankCode, 400, extra);
  if (codePointLength(text) > max) throw culturalRefusal(longCode, 400, extra);
  return text;
}

/** Optional text of 0 to `max` code points; absent or null reads "". */
function optionalText(
  value: unknown,
  max: number,
  code: CulturalReasonCode,
  extra?: Partial<CulturalRefusalDetail>,
): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw culturalRefusal(code, 400, extra);
  const text = cleanText(value);
  if (codePointLength(text) > max) throw culturalRefusal(code, 400, extra);
  return text;
}

/** A list item that passed its check, or the refusal for it. */
function oneOf<Value>(
  value: unknown,
  guard: (candidate: unknown) => candidate is Value,
  code: CulturalReasonCode,
): Value {
  if (!guard(value)) throw culturalRefusal(code, 400);
  return value;
}

const title = (value: unknown): string =>
  requiredText(
    value,
    CULTURAL_TITLE_MAX,
    "CULTURAL_TITLE_REQUIRED",
    "CULTURAL_TITLE_TOO_LONG",
  );

/** A real `YYYY-MM-DD` day inside the range the server accepts. */
export function isCulturalDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  const isRealDay =
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  return isRealDay && value >= CULTURAL_DATE_MIN && value <= CULTURAL_DATE_MAX;
}

/** A linked id: null clears, any other text is looked up by the store. */
function linkedId(value: unknown, code: CulturalReasonCode): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim() === "") {
    throw culturalRefusal(code, 400);
  }
  return value.trim();
}

export interface IdeaFields {
  title?: string;
  description?: string;
  eventType?: CulturalEventType;
  status?: CulturalIdeaStatus;
}

/** Idea fields in the create order: title, description, eventType, status.
 *  An update reads only the sent fields; create defaults stay with the store. */
export function normalizeIdeaFields(
  body: object,
  isCreate: boolean,
): IdeaFields {
  const fields: IdeaFields = {};
  const reads = (field: string) => isCreate || isSent(body, field);
  if (reads("title")) fields.title = title(fieldOf(body, "title"));
  if (reads("description")) {
    fields.description = optionalText(
      fieldOf(body, "description"),
      CULTURAL_IDEA_DESCRIPTION_MAX,
      "CULTURAL_DESCRIPTION_TOO_LONG",
    );
  }
  if (reads("eventType")) {
    fields.eventType = oneOf(
      fieldOf(body, "eventType"),
      isCulturalEventType,
      "CULTURAL_EVENT_TYPE_INVALID",
    );
  }
  if (isSent(body, "status")) {
    fields.status = oneOf(
      fieldOf(body, "status"),
      isCulturalIdeaStatus,
      "CULTURAL_IDEA_STATUS_INVALID",
    );
  }
  return fields;
}

export const normalizeComment = (value: unknown): string =>
  requiredText(
    value,
    CULTURAL_COMMENT_MAX,
    "CULTURAL_COMMENT_EMPTY",
    "CULTURAL_COMMENT_TOO_LONG",
  );

export interface TaskFields {
  title?: string;
  notes?: string;
  status?: CulturalTaskStatus;
  dueOn?: string | null;
  ideaId?: string | null;
  guideId?: string | null;
}

/** Task fields in the create order: title, notes, status, dueOn, ideaId,
 *  guideId. An update reads only the sent fields. */
export function normalizeTaskFields(
  body: object,
  isCreate: boolean,
): TaskFields {
  const fields: TaskFields = {};
  const reads = (field: string) => isCreate || isSent(body, field);
  if (reads("title")) fields.title = title(fieldOf(body, "title"));
  if (reads("notes")) {
    fields.notes = optionalText(
      fieldOf(body, "notes"),
      CULTURAL_TASK_NOTES_MAX,
      "CULTURAL_NOTES_TOO_LONG",
    );
  }
  if (isSent(body, "status")) {
    fields.status = oneOf(
      fieldOf(body, "status"),
      isCulturalTaskStatus,
      "CULTURAL_TASK_STATUS_INVALID",
    );
  }
  if (isSent(body, "dueOn")) {
    const dueOn = fieldOf(body, "dueOn");
    if (dueOn !== null && !isCulturalDay(dueOn)) {
      throw culturalRefusal("CULTURAL_DUE_DATE_INVALID", 400);
    }
    fields.dueOn = isCulturalDay(dueOn) ? dueOn : null;
  }
  if (isSent(body, "ideaId")) {
    fields.ideaId = linkedId(
      fieldOf(body, "ideaId"),
      "CULTURAL_LINKED_IDEA_NOT_FOUND",
    );
  }
  if (isSent(body, "guideId")) {
    fields.guideId = linkedId(
      fieldOf(body, "guideId"),
      "CULTURAL_LINKED_GUIDE_NOT_FOUND",
    );
  }
  return fields;
}

/** The `assigneeIds` shape and count; repeats collapse in sent order. */
export function normalizeAssigneeIds(value: unknown): string[] {
  if (value === undefined) return [];
  const isIdList =
    Array.isArray(value) &&
    value.every((id) => typeof id === "string" && id.trim() !== "");
  if (!isIdList) throw culturalRefusal("CULTURAL_ASSIGNEE_NOT_FOUND", 400);
  const ids = [...new Set(value.map((id: string) => id.trim()))];
  if (ids.length > CULTURAL_MAX_ASSIGNEES) {
    throw culturalRefusal("CULTURAL_TOO_MANY_ASSIGNEES", 400);
  }
  return ids;
}

export function normalizeEventOn(value: unknown): string {
  if (!isCulturalDay(value)) {
    throw culturalRefusal("CULTURAL_EVENT_DATE_INVALID", 400);
  }
  return value;
}

/** Blank text and null read as no filter. */
const filterValueOf = (value: unknown): unknown =>
  (typeof value === "string" ? value.trim() : value) || null;

/** The list filters, assignedTo checked first, then status. */
export function normalizeTaskFilters(filters: CulturalTaskFilters): {
  assignedTo: CulturalAssignedToFilter | null;
  status: CulturalTaskStatusFilter | null;
} {
  const assignedTo = filterValueOf(fieldOf(filters, "assignedTo"));
  const status = filterValueOf(fieldOf(filters, "status"));
  if (assignedTo !== null && !isCulturalAssignedToFilter(assignedTo)) {
    throw culturalRefusal("CULTURAL_ASSIGNED_TO_INVALID", 400);
  }
  if (status !== null && !isCulturalTaskStatusFilter(status)) {
    throw culturalRefusal("CULTURAL_TASK_STATUS_INVALID", 400);
  }
  return { assignedTo, status };
}

/** The staff picker term: sanitized, trimmed and cut to 100 code points. */
export const normalizeSearchTerm = (value: string): string =>
  Array.from(cleanText(value)).slice(0, CULTURAL_SEARCH_QUERY_MAX).join("");

/** Guide fields in the server's order: revision (a replace only), title,
 *  eventType, locale, summary, sections. Sections are optional on create. */
export function normalizeGuideFields(
  body: object,
  isReplace: boolean,
  makeId: () => string,
) {
  const revision = fieldOf(body, "revision");
  const isRevision =
    typeof revision === "number" && Number.isInteger(revision) && revision >= 1;
  if (isReplace && !isRevision) {
    throw culturalRefusal("CULTURAL_GUIDE_REVISION_INVALID", 400);
  }
  return {
    revision: isRevision ? Number(revision) : null,
    title: title(fieldOf(body, "title")),
    eventType: oneOf(
      fieldOf(body, "eventType"),
      isCulturalEventType,
      "CULTURAL_EVENT_TYPE_INVALID",
    ),
    locale: oneOf(
      fieldOf(body, "locale"),
      isCulturalGuideLocale,
      "CULTURAL_GUIDE_LOCALE_INVALID",
    ),
    summary: optionalText(
      fieldOf(body, "summary"),
      CULTURAL_GUIDE_SUMMARY_MAX,
      "CULTURAL_GUIDE_SUMMARY_TOO_LONG",
    ),
    sections: normalizeCulturalGuideSections(
      isReplace ? fieldOf(body, "sections") : (fieldOf(body, "sections") ?? []),
      makeId,
    ),
  };
}

const isPlainObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null && !Array.isArray(value);

type KeepId = (candidate: unknown) => string;

function normalizeStep(
  step: unknown,
  at: { sectionIndex: number; stepIndex: number },
  keepId: KeepId,
): CulturalGuideStepDTO {
  if (!isPlainObject(step)) {
    throw culturalRefusal("CULTURAL_GUIDE_SECTIONS_INVALID", 400, at);
  }
  const text = requiredText(
    fieldOf(step, "text"),
    CULTURAL_TITLE_MAX,
    "CULTURAL_GUIDE_STEP_TEXT_REQUIRED",
    "CULTURAL_GUIDE_STEP_TEXT_TOO_LONG",
    at,
  );
  const days = fieldOf(step, "daysBefore") ?? null;
  const isDays =
    typeof days === "number" &&
    Number.isInteger(days) &&
    days >= CULTURAL_STEP_DAYS_MIN &&
    days <= CULTURAL_STEP_DAYS_MAX;
  if (days !== null && !isDays) {
    throw culturalRefusal("CULTURAL_GUIDE_STEP_DAYS_INVALID", 400, at);
  }
  return { id: keepId(fieldOf(step, "id")), text, daysBefore: days };
}

function normalizeSection(
  section: unknown,
  sectionIndex: number,
  keepId: KeepId,
): CulturalGuideSectionDTO {
  const at = { sectionIndex };
  if (!isPlainObject(section)) {
    throw culturalRefusal("CULTURAL_GUIDE_SECTIONS_INVALID", 400, at);
  }
  const heading = requiredText(
    fieldOf(section, "heading"),
    CULTURAL_GUIDE_HEADING_MAX,
    "CULTURAL_GUIDE_HEADING_REQUIRED",
    "CULTURAL_GUIDE_HEADING_TOO_LONG",
    at,
  );
  const body = optionalText(
    fieldOf(section, "body"),
    CULTURAL_GUIDE_BODY_MAX,
    "CULTURAL_GUIDE_BODY_TOO_LONG",
    at,
  );
  const steps = fieldOf(section, "steps") ?? [];
  if (!Array.isArray(steps)) {
    throw culturalRefusal("CULTURAL_GUIDE_SECTIONS_INVALID", 400, at);
  }
  if (steps.length > CULTURAL_GUIDE_SECTION_STEPS_MAX) {
    throw culturalRefusal("CULTURAL_GUIDE_TOO_MANY_STEPS", 400, at);
  }
  const id = keepId(fieldOf(section, "id"));
  return {
    id,
    heading,
    body,
    steps: steps.map((step: unknown, stepIndex) =>
      normalizeStep(step, { sectionIndex, stepIndex }, keepId),
    ),
  };
}

/** Contract 8.1 in order. A sent section or step id is kept while it is
 *  text not yet used in this guide; any other gets `makeId()`. */
export function normalizeCulturalGuideSections(
  value: unknown,
  makeId: () => string,
): CulturalGuideSectionDTO[] {
  if (!Array.isArray(value)) {
    throw culturalRefusal("CULTURAL_GUIDE_SECTIONS_INVALID", 400);
  }
  if (value.length > CULTURAL_GUIDE_SECTIONS_MAX) {
    throw culturalRefusal("CULTURAL_GUIDE_TOO_MANY_SECTIONS", 400);
  }
  const usedIds = new Set<string>();
  const keepId: KeepId = (candidate) => {
    const isFree =
      typeof candidate === "string" &&
      candidate.trim() !== "" &&
      !usedIds.has(candidate);
    const id = isFree ? candidate : makeId();
    usedIds.add(id);
    return id;
  };
  const sections = value.map((section: unknown, sectionIndex) =>
    normalizeSection(section, sectionIndex, keepId),
  );
  const stepTotal = sections.reduce(
    (total, section) => total + section.steps.length,
    0,
  );
  if (stepTotal > CULTURAL_GUIDE_STEPS_MAX) {
    throw culturalRefusal("CULTURAL_GUIDE_TOO_MANY_STEPS", 400);
  }
  return sections;
}
