import { ApiError } from "../../../shared/api/client";
import {
  DEFAULT_CULTURAL_TASK_STATUS,
  culturalReasonOf,
  culturalRefusalDetailOf,
  type CreateCulturalTaskBody,
  type CulturalReasonCode,
  type CulturalRefDTO,
  type CulturalTaskDTO,
  type CulturalTaskStatus,
  type UpdateCulturalTaskBody,
} from "./api/culturalProduction.types";

/** What the task fields hold while someone edits them. */
export interface TaskFormValues {
  title: string;
  notes: string;
  /** YYYY-MM-DD, or null for no due date. */
  dueOn: string | null;
  status: CulturalTaskStatus;
  ideaId: string | null;
  guideId: string | null;
}

/** Where a refusal line goes: under one field, or above the buttons. */
export type TaskFormField =
  "title" | "notes" | "dueOn" | "status" | "ideaId" | "guideId" | "assignees";

/** A refusal with the field it belongs under; a null field is the form's. */
export interface TaskFieldError {
  field: TaskFormField | null;
  cause: unknown;
}

const FIELD_OF_REASON: Partial<Record<CulturalReasonCode, TaskFormField>> = {
  CULTURAL_TITLE_REQUIRED: "title",
  CULTURAL_TITLE_TOO_LONG: "title",
  CULTURAL_NOTES_TOO_LONG: "notes",
  CULTURAL_DUE_DATE_INVALID: "dueOn",
  CULTURAL_TASK_STATUS_INVALID: "status",
  CULTURAL_LINKED_IDEA_NOT_FOUND: "ideaId",
  CULTURAL_LINKED_GUIDE_NOT_FOUND: "guideId",
  CULTURAL_ASSIGNEE_NOT_FOUND: "assignees",
  CULTURAL_ASSIGNEE_NOT_STAFF: "assignees",
  CULTURAL_TOO_MANY_ASSIGNEES: "assignees",
};

/** The fields of a new task, linked to the idea or guide it was opened
 *  from. */
export function emptyTaskFormValues(
  initialIdea: CulturalRefDTO | null = null,
  initialGuide: CulturalRefDTO | null = null,
): TaskFormValues {
  return {
    title: "",
    notes: "",
    dueOn: null,
    status: DEFAULT_CULTURAL_TASK_STATUS,
    ideaId: initialIdea?.id ?? null,
    guideId: initialGuide?.id ?? null,
  };
}

/** The fields of a saved task, as the drawer opens them. */
export function taskFormValuesOf(task: CulturalTaskDTO): TaskFormValues {
  return {
    title: task.title,
    notes: task.notes,
    dueOn: task.dueOn,
    status: task.status,
    ideaId: task.idea?.id ?? null,
    guideId: task.guide?.id ?? null,
  };
}

/** The create body: trimmed text, the links, and every picked person. */
export function createTaskBodyOf(
  values: TaskFormValues,
  assigneeIds: readonly string[],
): CreateCulturalTaskBody {
  return {
    title: values.title.trim(),
    notes: values.notes.trim(),
    dueOn: values.dueOn,
    ideaId: values.ideaId,
    guideId: values.guideId,
    assigneeIds: [...assigneeIds],
  };
}

/** The PATCH body: only the fields that differ from the saved task. Text
 *  compares trimmed, as the server stores it; a cleared due date or link is
 *  sent as null. */
export function changedTaskFieldsOf(
  saved: TaskFormValues,
  edited: TaskFormValues,
): UpdateCulturalTaskBody {
  const changes: UpdateCulturalTaskBody = {};
  const title = edited.title.trim();
  const notes = edited.notes.trim();
  if (title !== saved.title.trim()) changes.title = title;
  if (notes !== saved.notes.trim()) changes.notes = notes;
  if (edited.dueOn !== saved.dueOn) changes.dueOn = edited.dueOn;
  if (edited.status !== saved.status) changes.status = edited.status;
  if (edited.ideaId !== saved.ideaId) changes.ideaId = edited.ideaId;
  if (edited.guideId !== saved.guideId) changes.guideId = edited.guideId;
  return changes;
}

/** The touched fields after an edit: the ones touched before, plus every
 *  field the edit changed. A field nobody touched keeps reading the saved
 *  task, so a teammate's change to it is never sent back. */
export function touchedFieldsOf(
  current: TaskFormValues,
  next: TaskFormValues,
  touched: Partial<TaskFormValues>,
): Partial<TaskFormValues> {
  const nextTouched: Partial<TaskFormValues> = { ...touched };
  for (const field of Object.keys(next) as (keyof TaskFormValues)[]) {
    if (next[field] !== current[field] || field in touched)
      Object.assign(nextTouched, { [field]: next[field] });
  }
  return nextTouched;
}

/** Whether the edited fields would send anything. */
export function hasTaskFormChanges(
  saved: TaskFormValues,
  edited: TaskFormValues,
): boolean {
  return Object.keys(changedTaskFieldsOf(saved, edited)).length > 0;
}

/** The refusal a blank title gets before anything is sent, shaped like the
 *  server's so the same line names it. */
export function localTaskRefusalOf(values: TaskFormValues): ApiError | null {
  if (values.title.trim() !== "") return null;
  return new ApiError(400, "Bad Request", {
    statusCode: 400,
    code: "CULTURAL_TITLE_REQUIRED",
  });
}

/** Places a refusal under the field its reason code names. */
export function taskFieldErrorOf(cause: unknown): TaskFieldError {
  const reasonCode = culturalReasonOf(cause);
  const field = reasonCode === null ? null : FIELD_OF_REASON[reasonCode];
  return { field: field ?? null, cause };
}

/** The person an assignee refusal names, so their chip can be marked. */
export function refusedAssigneeIdOf(cause: unknown): string | null {
  const reasonCode = culturalReasonOf(cause);
  if (
    reasonCode !== "CULTURAL_ASSIGNEE_NOT_FOUND" &&
    reasonCode !== "CULTURAL_ASSIGNEE_NOT_STAFF"
  )
    return null;
  return culturalRefusalDetailOf(cause).userId;
}

/** Focuses the Assign staff button (the picker trigger) inside
 *  `container`, once the last assignee pill is gone. */
export function focusAssignTrigger(container: HTMLElement | null): void {
  container?.querySelector<HTMLElement>('[aria-haspopup="dialog"]')?.focus();
}
