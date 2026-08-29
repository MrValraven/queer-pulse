import type { FilterKey, Pill } from "./myEvents.types";

/** The bucket the agenda is showing, in the order the pills read. */
export const DEFAULT_PILL: Pill = "upcoming";

/**
 * The primary bucket pills, in the order they read in the drawer.
 *
 * Shared by the band that renders them and the chip row that names the one
 * currently showing, so a bucket can never be selectable and unnamed.
 */
export const MY_EVENTS_PILLS: { key: Pill; labelKey: string }[] = [
  { key: "upcoming", labelKey: "myevents:pills.upcoming" },
  { key: "going", labelKey: "myevents:pills.going" },
  { key: "hosting", labelKey: "myevents:pills.hosting" },
  { key: "waitlisted", labelKey: "myevents:pills.waitlisted" },
  { key: "past", labelKey: "myevents:pills.past" },
  { key: "saved", labelKey: "myevents:pills.saved" },
];

/**
 * The secondary filter chips, in the order they read in the drawer.
 *
 * Shared by the drawer that renders them and the chip row that says which are
 * on, so a filter can never appear in one place and be unnamed in the other.
 */
export const TOOLBAR_FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: "inperson", labelKey: "myevents:toolbar.filter.inperson" },
  { key: "online", labelKey: "myevents:toolbar.filter.online" },
  { key: "free", labelKey: "myevents:toolbar.filter.free" },
  { key: "paid", labelKey: "myevents:toolbar.filter.paid" },
  { key: "month", labelKey: "myevents:toolbar.filter.month" },
];
