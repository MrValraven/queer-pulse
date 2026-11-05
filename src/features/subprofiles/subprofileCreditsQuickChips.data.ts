import type { SubprofileKind } from "./api/subprofiles.api";
import type { DirectoryAvailability } from "./subprofileDirectoryAvailability.data";

/** What a quick chip narrows the directory by: the single availability
 *  choice, or one profession in the kinds filter. */
export type CreditsQuickChipFilter =
  | { type: "availability"; value: DirectoryAvailability }
  | { type: "kind"; value: SubprofileKind };

/** One quick filter chip under the hero search. */
export interface CreditsQuickChip {
  id: string;
  labelKey: string;
  filter: CreditsQuickChipFilter;
  /** Draws the small jade dot the portrait cards use for "open". */
  hasLiveDot?: boolean;
}

/** The hero's quick filters, in display order. They set the same filters as
 *  the sidebar, so a chip and its sidebar row always agree. */
export const CREDITS_QUICK_CHIPS: readonly CreditsQuickChip[] = [
  {
    id: "open-to-collabs",
    labelKey: "subprofiles:directory.openToCollabsChip",
    filter: { type: "availability", value: "open_to_collabs" },
    hasLiveDot: true,
  },
  {
    id: "taking-bookings",
    labelKey: "subprofiles:availability.booking",
    filter: { type: "availability", value: "booking" },
  },
  {
    id: "therapists",
    labelKey: "subprofiles:directory.hero.quick.therapists",
    filter: { type: "kind", value: "therapist" },
  },
  {
    id: "djs",
    labelKey: "subprofiles:directory.hero.quick.djs",
    filter: { type: "kind", value: "dj" },
  },
];
