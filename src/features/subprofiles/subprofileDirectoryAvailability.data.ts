/** The stored availability keys the directory can narrow to. Both are
 *  accepted by `GET /subprofiles/directory?availability=` and counted in its
 *  `facets.availability` block. */
export type DirectoryAvailability = "open_to_collabs" | "booking";

/** One pick in the Availability section's radio group. */
export interface DirectoryAvailabilityOption {
  value: DirectoryAvailability;
  labelKey: string;
}

/** The narrowing options, in display order. "Any availability" is the radio
 *  group's own first row (it clears the choice), so it is not listed here. */
export const DIRECTORY_AVAILABILITY_OPTIONS: readonly DirectoryAvailabilityOption[] =
  [
    {
      value: "open_to_collabs",
      labelKey: "subprofiles:directory.openToCollabsChip",
    },
    { value: "booking", labelKey: "subprofiles:availability.booking" },
  ];

/** The label key for the "no availability filter" row. */
export const DIRECTORY_AVAILABILITY_ANY_LABEL_KEY =
  "subprofiles:directory.refine.availabilityAny";

/** Label key per stored availability value, for the applied-filter chip. */
export const DIRECTORY_AVAILABILITY_LABEL_KEY: Record<
  DirectoryAvailability,
  string
> = {
  open_to_collabs: "subprofiles:directory.openToCollabsChip",
  booking: "subprofiles:availability.booking",
};
