import { ApiError } from "../../../../shared/api/client";

// The Cultural Production contract
// (QUEERPULSE-CULTURAL-PRODUCTION-CONTRACT-2026-11-20, sections 2, 5, 6 and
// 12.1), mirrored from the backend's
// `src/cultural-production/cultural-production.constants.ts` and
// `src/cultural-production/cultural-response.ts`. The live api module and the
// demo store both answer with these shapes.

export const CULTURAL_EVENT_TYPES = [
  "board_game_night",
  "quiz_night",
  "music_night",
  "film_night",
  "workshop",
  "talk",
  "party",
  "other",
] as const;
export type CulturalEventType = (typeof CULTURAL_EVENT_TYPES)[number];

export const CULTURAL_IDEA_STATUSES = [
  "new",
  "exploring",
  "planned",
  "parked",
] as const;
export type CulturalIdeaStatus = (typeof CULTURAL_IDEA_STATUSES)[number];
export const DEFAULT_CULTURAL_IDEA_STATUS: CulturalIdeaStatus = "new";

export const CULTURAL_TASK_STATUSES = ["todo", "doing", "done"] as const;
export type CulturalTaskStatus = (typeof CULTURAL_TASK_STATUSES)[number];
export const DEFAULT_CULTURAL_TASK_STATUS: CulturalTaskStatus = "todo";
/** The statuses the badge and the Open filter count. */
export const OPEN_CULTURAL_TASK_STATUSES = ["todo", "doing"] as const;

/** The task list `status` filter. Absent means every status. */
export const CULTURAL_TASK_STATUS_FILTERS = [
  "open",
  "todo",
  "doing",
  "done",
] as const;
export type CulturalTaskStatusFilter =
  (typeof CULTURAL_TASK_STATUS_FILTERS)[number];

/** The task list `assignedTo` filter. Absent means everyone. */
export const CULTURAL_ASSIGNED_TO_FILTERS = ["me", "unassigned"] as const;
export type CulturalAssignedToFilter =
  (typeof CULTURAL_ASSIGNED_TO_FILTERS)[number];

export const CULTURAL_GUIDE_LOCALES = ["en", "pt"] as const;
export type CulturalGuideLocale = (typeof CULTURAL_GUIDE_LOCALES)[number];

/** Why CULTURAL_ASSIGNEE_NOT_STAFF refused, in check order. */
export const CULTURAL_ASSIGNEE_REFUSAL_REASONS = [
  "no_access",
  "suspended",
  "deactivated",
] as const;
export type CulturalAssigneeRefusalReason =
  (typeof CULTURAL_ASSIGNEE_REFUSAL_REASONS)[number];

// Limits, in code points after trim.
/** Idea, task and guide titles, and checklist step text. */
export const CULTURAL_TITLE_MAX = 160;
export const CULTURAL_IDEA_DESCRIPTION_MAX = 4000;
export const CULTURAL_COMMENT_MAX = 2000;
export const CULTURAL_TASK_NOTES_MAX = 4000;
export const CULTURAL_GUIDE_SUMMARY_MAX = 500;
export const CULTURAL_GUIDE_SECTIONS_MAX = 30;
export const CULTURAL_GUIDE_HEADING_MAX = 120;
export const CULTURAL_GUIDE_BODY_MAX = 10000;
export const CULTURAL_GUIDE_SECTION_STEPS_MAX = 40;
/** Across the whole guide. */
export const CULTURAL_GUIDE_STEPS_MAX = 100;
/** 60 days after the event. */
export const CULTURAL_STEP_DAYS_MIN = -60;
export const CULTURAL_STEP_DAYS_MAX = 365;
export const CULTURAL_MAX_ASSIGNEES = 10;
export const CULTURAL_STAFF_PREVIEW_LIMIT = 5;
export const CULTURAL_STAFF_SEARCH_LIMIT = 20;
export const CULTURAL_SEARCH_QUERY_MAX = 100;
/** Ideas and tasks per list read. */
export const CULTURAL_LIST_LIMIT = 500;
/** Backer summaries on an idea list item. */
export const CULTURAL_IDEA_BACKERS_SHOWN = 5;
export const CULTURAL_DATE_MIN = "2000-01-01";
export const CULTURAL_DATE_MAX = "2100-12-31";
/** The calendar day of a due date and of the badge is read in this zone. */
export const CULTURAL_TIME_ZONE = "Europe/Lisbon";

function isMemberOf<Value extends string>(
  list: readonly Value[],
  value: unknown,
): value is Value {
  return (
    typeof value === "string" && (list as readonly string[]).includes(value)
  );
}

export function isCulturalEventType(
  value: unknown,
): value is CulturalEventType {
  return isMemberOf(CULTURAL_EVENT_TYPES, value);
}

export function isCulturalIdeaStatus(
  value: unknown,
): value is CulturalIdeaStatus {
  return isMemberOf(CULTURAL_IDEA_STATUSES, value);
}

export function isCulturalTaskStatus(
  value: unknown,
): value is CulturalTaskStatus {
  return isMemberOf(CULTURAL_TASK_STATUSES, value);
}

export function isCulturalTaskStatusFilter(
  value: unknown,
): value is CulturalTaskStatusFilter {
  return isMemberOf(CULTURAL_TASK_STATUS_FILTERS, value);
}

export function isCulturalAssignedToFilter(
  value: unknown,
): value is CulturalAssignedToFilter {
  return isMemberOf(CULTURAL_ASSIGNED_TO_FILTERS, value);
}

export function isCulturalGuideLocale(
  value: unknown,
): value is CulturalGuideLocale {
  return isMemberOf(CULTURAL_GUIDE_LOCALES, value);
}

/** Every reason code a cultural refusal carries (contract section 5, table
 *  order). */
export const CULTURAL_REASON_CODES = [
  "CULTURAL_IDEA_NOT_FOUND",
  "CULTURAL_TASK_NOT_FOUND",
  "CULTURAL_GUIDE_NOT_FOUND",
  "CULTURAL_COMMENT_NOT_FOUND",
  "CULTURAL_TITLE_REQUIRED",
  "CULTURAL_TITLE_TOO_LONG",
  "CULTURAL_DESCRIPTION_TOO_LONG",
  "CULTURAL_NOTES_TOO_LONG",
  "CULTURAL_EVENT_TYPE_INVALID",
  "CULTURAL_IDEA_STATUS_INVALID",
  "CULTURAL_TASK_STATUS_INVALID",
  "CULTURAL_ASSIGNED_TO_INVALID",
  "CULTURAL_DUE_DATE_INVALID",
  "CULTURAL_EVENT_DATE_INVALID",
  "CULTURAL_LINKED_IDEA_NOT_FOUND",
  "CULTURAL_LINKED_GUIDE_NOT_FOUND",
  "CULTURAL_COMMENT_EMPTY",
  "CULTURAL_COMMENT_TOO_LONG",
  "CULTURAL_COMMENT_NOT_YOURS",
  "CULTURAL_IDEA_NOT_YOURS",
  "CULTURAL_TASK_NOT_YOURS",
  "CULTURAL_GUIDE_NOT_YOURS",
  "CULTURAL_ASSIGNEE_NOT_FOUND",
  "CULTURAL_ASSIGNEE_NOT_STAFF",
  "CULTURAL_TOO_MANY_ASSIGNEES",
  "CULTURAL_GUIDE_LOCALE_INVALID",
  "CULTURAL_GUIDE_SUMMARY_TOO_LONG",
  "CULTURAL_GUIDE_SECTIONS_INVALID",
  "CULTURAL_GUIDE_TOO_MANY_SECTIONS",
  "CULTURAL_GUIDE_HEADING_REQUIRED",
  "CULTURAL_GUIDE_HEADING_TOO_LONG",
  "CULTURAL_GUIDE_BODY_TOO_LONG",
  "CULTURAL_GUIDE_TOO_MANY_STEPS",
  "CULTURAL_GUIDE_STEP_TEXT_REQUIRED",
  "CULTURAL_GUIDE_STEP_TEXT_TOO_LONG",
  "CULTURAL_GUIDE_STEP_DAYS_INVALID",
  "CULTURAL_GUIDE_REVISION_INVALID",
  "CULTURAL_GUIDE_EDIT_CONFLICT",
  "CULTURAL_GUIDE_HAS_NO_STEPS",
] as const;
export type CulturalReasonCode = (typeof CULTURAL_REASON_CODES)[number];

/** A staff member: an author, an assignee, a backer or a picker row. */
export interface CulturalStaffSummaryDTO {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  /** A crop rect, read with `personaWallCropOf`. */
  avatarCrop: unknown | null;
}

/** A linked idea or guide. */
export interface CulturalRefDTO {
  id: string;
  title: string;
}

export interface CulturalIdeaListItemDTO {
  id: string;
  title: string;
  description: string;
  eventType: CulturalEventType;
  status: CulturalIdeaStatus;
  /** Null once the account is gone. */
  author: CulturalStaffSummaryDTO | null;
  /** ISO. */
  createdAt: string;
  updatedAt: string;
  /** The first 5 by created_at ASC, user_id ASC. */
  backers: CulturalStaffSummaryDTO[];
  backerCount: number;
  isBackedByMe: boolean;
  commentCount: number;
  linkedTaskCount: number;
  /** Todo or doing. */
  openLinkedTaskCount: number;
  /** Author, or the caller is in the staff tier. */
  canDelete: boolean;
}

export interface CulturalIdeaCommentDTO {
  id: string;
  body: string;
  author: CulturalStaffSummaryDTO | null;
  createdAt: string;
  canDelete: boolean;
}

export interface CulturalIdeaDTO extends CulturalIdeaListItemDTO {
  /** Every backer, same order. */
  backers: CulturalStaffSummaryDTO[];
  /** Oldest first. */
  comments: CulturalIdeaCommentDTO[];
  /** The task list order of contract section 7.3. */
  linkedTasks: CulturalTaskListItemDTO[];
}

export interface CulturalIdeaListDTO {
  items: CulturalIdeaListItemDTO[];
  isTruncated: boolean;
}

export interface CulturalTaskListItemDTO {
  id: string;
  title: string;
  status: CulturalTaskStatus;
  /** YYYY-MM-DD. */
  dueOn: string | null;
  /** YYYY-MM-DD, set by a guide batch. */
  eventOn: string | null;
  hasNotes: boolean;
  /** Every assignee, assigned_at ASC, user_id ASC. */
  assignees: CulturalStaffSummaryDTO[];
  idea: CulturalRefDTO | null;
  guide: CulturalRefDTO | null;
  author: CulturalStaffSummaryDTO | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  canDelete: boolean;
}

export interface CulturalTaskDTO extends CulturalTaskListItemDTO {
  notes: string;
}

export interface CulturalTaskListDTO {
  items: CulturalTaskListItemDTO[];
  /** Under assignedTo, ignoring status. */
  counts: { todo: number; doing: number; done: number };
  isTruncated: boolean;
}

export interface CulturalGuideStepDTO {
  id: string;
  text: string;
  daysBefore: number | null;
}

export interface CulturalGuideSectionDTO {
  id: string;
  heading: string;
  body: string;
  steps: CulturalGuideStepDTO[];
}

export interface CulturalGuideListItemDTO {
  id: string;
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary: string;
  sectionCount: number;
  stepCount: number;
  /** Null for the seeded guides. */
  author: CulturalStaffSummaryDTO | null;
  /** Null until a person saves it. */
  updatedBy: CulturalStaffSummaryDTO | null;
  createdAt: string;
  updatedAt: string;
  canDelete: boolean;
}

export interface CulturalGuideDTO extends CulturalGuideListItemDTO {
  sections: CulturalGuideSectionDTO[];
  revision: number;
}

export interface CulturalGuideListDTO {
  items: CulturalGuideListItemDTO[];
}

/** In creation order. */
export interface CulturalTaskBatchDTO {
  items: CulturalTaskListItemDTO[];
}

export interface CulturalStaffSearchDTO {
  items: CulturalStaffSummaryDTO[];
}

export interface CulturalTaskFilters {
  /** Null is Everyone. */
  assignedTo: CulturalAssignedToFilter | null;
  /** Null sends no status (All). */
  status: CulturalTaskStatusFilter | null;
}

export interface CreateCulturalIdeaBody {
  title: string;
  description?: string;
  eventType: CulturalEventType;
  status?: CulturalIdeaStatus;
}
export type UpdateCulturalIdeaBody = Partial<CreateCulturalIdeaBody>;

export interface CreateCulturalTaskBody {
  title: string;
  notes?: string;
  status?: CulturalTaskStatus;
  dueOn?: string | null;
  ideaId?: string | null;
  guideId?: string | null;
  assigneeIds?: string[];
}
export type UpdateCulturalTaskBody = Partial<
  Omit<CreateCulturalTaskBody, "assigneeIds">
>;

export interface CulturalGuideSectionInput {
  id?: string;
  heading: string;
  body: string;
  steps: { id?: string; text: string; daysBefore: number | null }[];
}

export interface CreateCulturalGuideBody {
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary?: string;
  sections?: CulturalGuideSectionInput[];
}

export interface ReplaceCulturalGuideBody {
  revision: number;
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary: string;
  sections: CulturalGuideSectionInput[];
}

export interface CreateCulturalTaskBatchBody {
  eventOn: string;
  assigneeIds?: string[];
}

/** The extra fields a refusal body carries (contract section 5). */
export interface CulturalRefusalDetail {
  reason: CulturalAssigneeRefusalReason | null;
  userId: string | null;
  /** Zero based. */
  sectionIndex: number | null;
  /** Zero based. */
  stepIndex: number | null;
  /** The guide's current revision, on an edit conflict. */
  revision: number | null;
}

/** The parsed refusal body, when the failure is an `ApiError` that has one. */
function refusalBodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  return typeof body === "object" && body !== null
    ? (body as Record<string, unknown>)
    : null;
}

/** The cultural reason code off a refused call, or null when the body names
 *  none of the contract's codes. */
export function culturalReasonOf(error: unknown): CulturalReasonCode | null {
  const code = refusalBodyOf(error)?.code;
  return isMemberOf(CULTURAL_REASON_CODES, code) ? code : null;
}

function integerOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

/** Reads each extra field off a refusal body; a field that is missing or of
 *  the wrong shape reads null. */
export function culturalRefusalDetailOf(error: unknown): CulturalRefusalDetail {
  const body = refusalBodyOf(error);
  const reason = body?.reason;
  const userId = body?.userId;
  return {
    reason: isMemberOf(CULTURAL_ASSIGNEE_REFUSAL_REASONS, reason)
      ? reason
      : null,
    userId: typeof userId === "string" ? userId : null,
    sectionIndex: integerOrNull(body?.sectionIndex),
    stepIndex: integerOrNull(body?.stepIndex),
    revision: integerOrNull(body?.revision),
  };
}
