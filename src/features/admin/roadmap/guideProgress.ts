import type {
  AdminRoadmapItemDTO,
  RoadmapGuideStep,
} from "../api/roadmapAdmin.types";

/**
 * Pure helpers for the Guides view (`views/GuidesView.tsx`) — checklist
 * completion and re-verify-by date math. Kept side-effect-free and free of
 * `new Date()` calls of their own so callers (and their tests) control the
 * clock explicitly via a `today` parameter, rather than the helpers reading
 * the ambient system clock.
 */

/** The 6 guide checklist steps, in the fixed order the prototype's
 *  `qp-roadmap-views.js` `guides()` renders them — mirrors
 *  `RoadmapGuideDTO.steps`'s key order. */
export const GUIDE_STEPS: RoadmapGuideStep[] = [
  "research",
  "draft",
  "lived",
  "expert",
  "translate",
  "publish",
];

/** How many of the 6 checklist steps are marked done. `0` for an item with
 *  no `guide` (rather than throwing), so callers can call it unconditionally
 *  before checking `item.guide !== null` themselves. */
export function guideStepsDone(item: AdminRoadmapItemDTO): number {
  if (!item.guide) return 0;
  const steps = item.guide.steps;
  return GUIDE_STEPS.reduce((done, step) => done + (steps[step] ? 1 : 0), 0);
}

/** Checklist completion as a whole-number 0–100 percentage across the 6
 *  steps. `0` for an item with no `guide`. */
export function guidePct(item: AdminRoadmapItemDTO): number {
  return Math.round((guideStepsDone(item) / GUIDE_STEPS.length) * 100);
}

/** Midnight UTC for `date`, so day-count math never drifts from a
 *  time-of-day component or DST — only the calendar date matters here. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days from `today` to the guide's `reVerifyBy` date — negative once
 *  the date has passed (overdue), `0` if it is today, `null` when the item
 *  has no guide or the guide has no `reVerifyBy` set. `today` is always
 *  supplied by the caller (e.g. `new Date()` from the component render) —
 *  never read internally — so this stays pure and testable. */
export function reVerifyDueDays(
  item: AdminRoadmapItemDTO,
  today: Date,
): number | null {
  const reVerifyBy = item.guide?.reVerifyBy;
  if (!reVerifyBy) return null;
  const dueDate = new Date(reVerifyBy);
  if (Number.isNaN(dueDate.getTime())) return null;
  return Math.round((startOfUtcDay(dueDate) - startOfUtcDay(today)) / MS_PER_DAY);
}

/** True once a guide's re-verify date is within 90 days out or already
 *  overdue — the threshold the re-verify banner and the row's danger tone
 *  both key off. `false` for items with no `guide`/no `reVerifyBy`. */
export function isReviewSoon(item: AdminRoadmapItemDTO, today: Date): boolean {
  const days = reVerifyDueDays(item, today);
  return days !== null && days <= 90;
}
