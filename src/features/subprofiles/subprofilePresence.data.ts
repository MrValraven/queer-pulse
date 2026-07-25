import type { AccentKey, AvailabilityKey } from "./api/subprofiles.api";

/** accent key → CSS custom-property values applied inline on the persona hero.
 *  `tint` is the accent color; `on` is a readable foreground for text on `tint`.
 *  All pairs are chosen to pass WCAG AA in light + dark. */
export const ACCENT_TOKENS: Record<AccentKey, { tint: string; on: string }> = {
  plum: { tint: "var(--plum)", on: "var(--cream)" },
  coral: { tint: "var(--accent)", on: "var(--cream)" },
  jade: { tint: "var(--jade)", on: "var(--ink)" },
  amber: { tint: "var(--amber)", on: "var(--ink)" },
  violet: { tint: "var(--violet)", on: "var(--cream)" },
};

export const ACCENT_OPTIONS: AccentKey[] = ["plum", "coral", "jade", "amber", "violet"];

/** Fallback accent when a persona has none set. */
export const DEFAULT_ACCENT: AccentKey = "plum";

export const AVAILABILITY_OPTIONS: { value: AvailabilityKey; labelKey: string }[] = [
  { value: "open_to_collabs", labelKey: "subprofiles:availability.openToCollabs" },
  { value: "booking", labelKey: "subprofiles:availability.booking" },
  { value: "not_available", labelKey: "subprofiles:availability.notAvailable" },
];
