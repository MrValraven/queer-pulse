import { CAUSES } from "./causes.data";

export interface FilterChip {
  /** The chip id, which is also the board's filter state: "all", a commitment
   *  level, or a cause's wire value. `isCause()` tells the last apart from the
   *  first two. */
  f: string;
  labelKey: string;
}

/** Row one: everything, or by how much time it asks of you. */
export const COMMITMENT_FILTERS: readonly FilterChip[] = [
  { f: "all", labelKey: "marketing:volunteer.filter.all" },
  { f: "low", labelKey: "marketing:volunteer.filter.low" },
  { f: "medium", labelKey: "marketing:volunteer.filter.medium" },
];

/**
 * Row two: by cause, derived from `CAUSES` so a new cause appears here without
 * anyone remembering to add it.
 *
 * These used to share one row with the commitment chips, which worked at five
 * causes and stopped working at thirteen: sixteen chips in a single wrapping
 * row buried "Low commitment" somewhere in the middle of a three-line block.
 * Splitting them keeps each row answering one question.
 */
export const CAUSE_FILTERS: readonly FilterChip[] = CAUSES.map((cause) => ({
  f: cause.value,
  labelKey: cause.labelKey,
}));
