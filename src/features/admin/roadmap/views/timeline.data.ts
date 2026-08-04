import type {
  AdminRoadmapItemDTO,
  RoadmapConfidence,
  RoadmapPriority,
} from "../../api/roadmapAdmin.types";
import type { TFunction } from "../../../../shared/i18n/types";
import type { AdminTone } from "../../ui";

/**
 * Fixed, ordered quarter lanes for the Timeline view (Task C5) — matches the
 * prototype's `qp-roadmap-views.js` `timeline()` grouping. Any item whose
 * `targetQuarter` doesn't exactly match one of the first four (null, blank,
 * or a stray value) folds into "Unscheduled".
 *
 * The four real quarters ("Q3 2026" etc.) stay literal date-lane labels, not
 * sentences — same treatment this view gives `RoadmapPriority` codes ("P0"…)
 * and `RoadmapToolbar` gives free-text `category`. "Unscheduled" is a real
 * sentence and does need translation — see `quarterLabel()` below, which
 * callers use for display while this array itself stays the stable grouping
 * key (`admin:roadmap.timelineView.unscheduledLabel`).
 */
export const TIMELINE_QUARTERS = [
  "Q3 2026",
  "Q4 2026",
  "Q1 2027",
  "Q2 2027",
  "Unscheduled",
] as const;

export type TimelineQuarter = (typeof TIMELINE_QUARTERS)[number];

/** Display label for a lane header/aria-label — the four real quarters
 *  render as their literal date codes, "Unscheduled" is the one bucket that
 *  needs translation. */
export function quarterLabel(quarter: TimelineQuarter, t: TFunction): string {
  return quarter === "Unscheduled"
    ? t("admin:roadmap.timelineView.unscheduledLabel")
    : quarter;
}

/** Buckets `items` into the fixed quarter lanes above, in `TIMELINE_QUARTERS`
 *  order within each bucket preserved from the input array — callers apply
 *  `matchItem`/`sortItems` first, this only groups. */
export function groupByQuarter(
  items: AdminRoadmapItemDTO[],
): Record<TimelineQuarter, AdminRoadmapItemDTO[]> {
  const groups: Record<TimelineQuarter, AdminRoadmapItemDTO[]> = {
    "Q3 2026": [],
    "Q4 2026": [],
    "Q1 2027": [],
    "Q2 2027": [],
    Unscheduled: [],
  };
  const knownQuarters: readonly string[] = TIMELINE_QUARTERS;
  for (const item of items) {
    const quarter = item.targetQuarter;
    const bucket: TimelineQuarter =
      quarter && knownQuarters.includes(quarter)
        ? (quarter as TimelineQuarter)
        : "Unscheduled";
    groups[bucket].push(item);
  }
  return groups;
}

/** Status-chip tone by column — shipped=jade, building=coral, else ghost, per
 *  the C5 brief. */
export const COLUMN_STATUS_TONE: Record<
  AdminRoadmapItemDTO["column"],
  "jade" | "coral" | "ghost"
> = {
  shipped: "jade",
  building: "coral",
  planned: "ghost",
  backlog: "ghost",
};

export const PRIORITY_TONE: Record<RoadmapPriority, AdminTone> = {
  P0: "danger",
  P1: "coral",
  P2: "amber",
  P3: "ghost",
};

export const CONFIDENCE_TONE: Record<RoadmapConfidence, AdminTone> = {
  likely: "jade",
  maybe: "amber",
  hoping: "ghost",
};

/** Only these 9 categories have a `roadmap.categories.*` translation —
 *  `category` is admin free text (see `roadmapChrome.data.ts`'s
 *  `getUniqueCategories` note), so anything outside this set must render as
 *  raw text instead of being run through `t()` with a key that doesn't
 *  exist (the i18n layer shows a missing key raw, which would leak an ugly
 *  `admin:roadmap.categories.whatever` string onto a card). */
const KNOWN_CATEGORIES = new Set([
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
]);

/** Returns the `roadmap.categories.*` key for a known category, or `null`
 *  when `category` is free text the catalog doesn't cover — callers should
 *  fall back to the raw string in that case. */
export function categoryTranslationKey(category: string): string | null {
  return KNOWN_CATEGORIES.has(category)
    ? `admin:roadmap.categories.${category}`
    : null;
}
