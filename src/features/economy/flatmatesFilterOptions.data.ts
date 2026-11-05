import type { ListingType } from "./flatmates.data";

/** One pick-one option in the flatmates sidebar. `"all"` is the "any" row
 *  that clears the group. */
export interface FlatmatesFilterOption<Value extends string> {
  value: Value;
  labelKey: string;
}

/** Profile type: everyone, people seeking a room, people offering one. */
export const FLATMATES_TYPE_OPTIONS: readonly FlatmatesFilterOption<
  ListingType | "all"
>[] = [
  { value: "all", labelKey: "economy:flatmates.filter.all" },
  { value: "seeking", labelKey: "economy:flatmates.filter.seeking" },
  { value: "offering", labelKey: "economy:flatmates.filter.offering" },
];

/** Budget bands. The values are the directory's `budgetBand` ids
 *  (`FlatmateBudgetBand` in `flatmatesFacets`). */
export const FLATMATES_BUDGET_OPTIONS: readonly FlatmatesFilterOption<string>[] =
  [
    { value: "all", labelKey: "economy:flatmates.filter.anyBudget" },
    { value: "upTo700", labelKey: "economy:flatmates.filter.budget.upTo700" },
    { value: "700to900", labelKey: "economy:flatmates.filter.budget.700to900" },
    {
      value: "900to1100",
      labelKey: "economy:flatmates.filter.budget.900to1100",
    },
    { value: "1100plus", labelKey: "economy:flatmates.filter.budget.1100plus" },
  ];

/** Move-in windows, the directory's `moveIn` ids, matched against each
 *  profile's `moveinKey`. */
export const FLATMATES_MOVE_IN_OPTIONS: readonly FlatmatesFilterOption<string>[] =
  [
    { value: "all", labelKey: "economy:flatmates.filter.anyMoveIn" },
    { value: "now", labelKey: "economy:flatmates.filter.moveIn.now" },
    { value: "jul", labelKey: "economy:flatmates.filter.moveIn.jul" },
    { value: "aug", labelKey: "economy:flatmates.filter.moveIn.aug" },
    { value: "flex", labelKey: "economy:flatmates.filter.moveIn.flex" },
  ];

/** The label key for a chosen option, for its applied chip. */
export function flatmatesOptionLabelKey<Value extends string>(
  options: readonly FlatmatesFilterOption<Value>[],
  value: Value,
): string | undefined {
  return options.find((option) => option.value === value)?.labelKey;
}
