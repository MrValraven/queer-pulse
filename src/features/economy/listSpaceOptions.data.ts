/**
 * The curated chip sets on the "list a space" form.
 *
 * `value` is the canonical ENGLISH string that gets stored and rendered on the
 * listing, matching the rest of the housing board's member-authored content
 * (see the scope note at the top of `catalogs/en/economy.ts`: platform chrome
 * translates, listing content stays as written). `labelKey` is the chip a
 * lister actually reads while filling the form, so the picker speaks their
 * language even though the stored value stays stable.
 *
 * Curated rather than free text on purpose. "Ideal for" is the field where an
 * exclusion ("straight couples only") gets typed, which the backend's risk
 * assessment scans for; offering practical fits keeps the field describing the
 * home. Nothing here gates a home on anyone's identity, and being LGBTQ+
 * affirming is the baseline every listing pledges to rather than an option
 * anyone ticks.
 */
export interface ListSpaceChipOption {
  value: string;
  labelKey: string;
}

/** What the home has. Stored in `features`. */
export const LIST_SPACE_FEATURE_OPTIONS: ListSpaceChipOption[] = [
  { value: "Furnished", labelKey: "economy:listSpace.feature.furnished" },
  { value: "Natural light", labelKey: "economy:listSpace.feature.light" },
  { value: "Balcony", labelKey: "economy:listSpace.feature.balcony" },
  { value: "Outdoor space", labelKey: "economy:listSpace.feature.outdoor" },
  { value: "Lift", labelKey: "economy:listSpace.feature.lift" },
  { value: "Washing machine", labelKey: "economy:listSpace.feature.washing" },
  { value: "Dishwasher", labelKey: "economy:listSpace.feature.dishwasher" },
  { value: "Heating", labelKey: "economy:listSpace.feature.heating" },
  { value: "Air conditioning", labelKey: "economy:listSpace.feature.cooling" },
  { value: "Desk space", labelKey: "economy:listSpace.feature.desk" },
  { value: "Private bathroom", labelKey: "economy:listSpace.feature.bathroom" },
  { value: "Shared kitchen", labelKey: "economy:listSpace.feature.kitchen" },
  { value: "Bike storage", labelKey: "economy:listSpace.feature.bike" },
  { value: "Pets welcome", labelKey: "economy:listSpace.feature.pets" },
  { value: "Quiet street", labelKey: "economy:listSpace.feature.quiet" },
];

/** Who the home suits, in practical terms. Stored in `idealFor`. */
export const LIST_SPACE_IDEAL_FOR_OPTIONS: ListSpaceChipOption[] = [
  { value: "Someone new to Lisbon", labelKey: "economy:listSpace.ideal.new" },
  { value: "Long stays", labelKey: "economy:listSpace.ideal.longStay" },
  { value: "Short stays", labelKey: "economy:listSpace.ideal.shortStay" },
  { value: "Working from home", labelKey: "economy:listSpace.ideal.wfh" },
  { value: "Students", labelKey: "economy:listSpace.ideal.students" },
  { value: "Couples", labelKey: "economy:listSpace.ideal.couples" },
  { value: "Someone with a pet", labelKey: "economy:listSpace.ideal.pet" },
  { value: "A quiet household", labelKey: "economy:listSpace.ideal.quiet" },
  { value: "A sociable household", labelKey: "economy:listSpace.ideal.social" },
  { value: "Cyclists", labelKey: "economy:listSpace.ideal.cyclists" },
];
