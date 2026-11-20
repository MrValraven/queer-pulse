import type { CulturalGuideDTO } from "./api/culturalProduction.types";
import {
  CULTURAL_MY_TASKS_HREF,
  culturalTabHref,
} from "./culturalProductionPaths";
import { dueOnForStep } from "./guideTaskDates";

/** One task a guide batch would create: its step, its text and its due day. */
export interface GuideBatchPreviewRow {
  stepId: string;
  text: string;
  /** `YYYY-MM-DD`, or null for a step with no day. */
  dueOn: string | null;
  /** The due day falls before today. */
  isPast: boolean;
}

export interface GuideBatchPreviewResult {
  rows: GuideBatchPreviewRow[];
  pastCount: number;
}

/** Every checklist step of a guide, sections then steps in order. */
export function guideStepsOf(
  guide: Pick<CulturalGuideDTO, "sections">,
): CulturalGuideDTO["sections"][number]["steps"] {
  return guide.sections.flatMap((section) => section.steps);
}

/**
 * The tasks a batch from `guide` would create for an event on `eventOn`,
 * one row per step in the order the server creates them, each due on the
 * day `dueOnForStep` answers (the same arithmetic the store and the server
 * use). `today` is the Lisbon day; a row due before it counts as past.
 */
export function previewGuideBatch(
  guide: Pick<CulturalGuideDTO, "sections">,
  eventOn: string,
  today: string,
): GuideBatchPreviewResult {
  const rows = guideStepsOf(guide).map((step): GuideBatchPreviewRow => {
    const dueOn = dueOnForStep(eventOn, step.daysBefore);
    return {
      stepId: step.id,
      text: step.text,
      dueOn,
      isPast: dueOn !== null && dueOn < today,
    };
  });
  return { rows, pastCount: rows.filter((row) => row.isPast).length };
}

/** Where "Open the tasks" leads after a batch: the viewer's own tasks when
 *  they are among the assignees, else the whole Tasks tab. */
export function createdTasksHrefOf(
  assigneeIds: readonly string[],
  viewerId: string | null,
): string {
  return viewerId !== null && assigneeIds.includes(viewerId)
    ? CULTURAL_MY_TASKS_HREF
    : culturalTabHref("tasks");
}
