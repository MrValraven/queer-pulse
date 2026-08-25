import type { Formatters } from "../../shared/i18n/format";
import { ageLabelOf, oldestRowOf, type ModReportView } from "./moderationAge";
import type { FilterId } from "./moderationQueue.types";

export function matchesQueueFilter(
  report: ModReportView,
  filter: FilterId,
  currentUserId: string | undefined,
): boolean {
  if (filter === "emergencies") return report.severity === "emergency";
  if (filter === "mine")
    return (
      currentUserId != null && report.assignedModeratorId === currentUserId
    );
  return true;
}

export interface QueueView {
  visible: ModReportView[];
  emergencies: ModReportView[];
  others: ModReportView[];
  oldest: string;
}

/**
 * Derives the open queue's filtered/split view. FE-ADM-29: the queue is
 * fetched `sort: "priority"`, so the LAST row is the lowest-priority one and
 * reading its age as "the oldest" understated a three-day-old medium-severity
 * report sitting mid-list. Compare the real timestamps instead, then format
 * the winner the same localized way the cards do.
 */
export function deriveQueueView(
  open: ModReportView[],
  filter: FilterId,
  currentUserId: string | undefined,
  fmt: Formatters,
): QueueView {
  const visible = open.filter((report) =>
    matchesQueueFilter(report, filter, currentUserId),
  );
  const emergencies = visible.filter(
    (report) => report.severity === "emergency",
  );
  const others = visible.filter((report) => report.severity !== "emergency");
  const oldestReport = oldestRowOf(visible);
  const oldest = oldestReport ? ageLabelOf(oldestReport, fmt) : "";
  return { visible, emergencies, others, oldest };
}
