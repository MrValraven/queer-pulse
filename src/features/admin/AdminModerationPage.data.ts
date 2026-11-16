import type { FilterId } from "./useModerationQueue";

/**
 * The open queue's severity filters, in toolbar order. TS-06 adds the last
 * two: the reports whose response window has already closed, and the subjects
 * several different people are reporting at once.
 */
export const MODERATION_FILTERS: readonly {
  id: FilterId;
  labelKey: string;
}[] = [
  { id: "all", labelKey: "admin:moderation.filters.all" },
  { id: "emergencies", labelKey: "admin:moderation.filters.emergencies" },
  { id: "mine", labelKey: "admin:moderation.filters.mine" },
  { id: "overdue", labelKey: "admin:moderation.filters.overdue" },
  { id: "surge", labelKey: "admin:moderation.filters.surge" },
];
