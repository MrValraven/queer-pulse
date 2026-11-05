import type { AppliedFilterChip } from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FLATMATES_BUDGET_OPTIONS,
  FLATMATES_MOVE_IN_OPTIONS,
  FLATMATES_TYPE_OPTIONS,
  flatmatesOptionLabelKey,
} from "./flatmatesFilterOptions.data";
import type {
  FlatmatesFilterActions,
  FlatmatesFilterState,
} from "./useFlatmatesFilters";

/** The flatmates sidebar's selections as removable chips, in sidebar order:
 *  profile type, neighbourhood, budget, move-in, then each lifestyle tag.
 *  Removing a chip resets only its own group. */
export function useFlatmatesActiveFilters(
  filters: FlatmatesFilterState,
  actions: FlatmatesFilterActions,
): AppliedFilterChip[] {
  const { t } = useTranslation();
  const { setType, setNeighbourhood, setBudget, setMoveIn, toggleTag } =
    actions;
  const { type, neighbourhood, budget, moveIn, tags } = filters;

  const chips: AppliedFilterChip[] = [];
  const typeLabelKey = flatmatesOptionLabelKey(FLATMATES_TYPE_OPTIONS, type);
  if (type !== "all" && typeLabelKey) {
    chips.push({
      key: `type:${type}`,
      label: t(typeLabelKey),
      onRemove: () => setType("all"),
    });
  }
  if (neighbourhood !== "all") {
    chips.push({
      key: `neighbourhood:${neighbourhood}`,
      label: neighbourhood,
      onRemove: () => setNeighbourhood("all"),
    });
  }
  const budgetLabelKey = flatmatesOptionLabelKey(
    FLATMATES_BUDGET_OPTIONS,
    budget,
  );
  if (budget !== "all" && budgetLabelKey) {
    chips.push({
      key: `budget:${budget}`,
      label: t(budgetLabelKey),
      onRemove: () => setBudget("all"),
    });
  }
  const moveInLabelKey = flatmatesOptionLabelKey(
    FLATMATES_MOVE_IN_OPTIONS,
    moveIn,
  );
  if (moveIn !== "all" && moveInLabelKey) {
    chips.push({
      key: `moveIn:${moveIn}`,
      label: t(moveInLabelKey),
      onRemove: () => setMoveIn("all"),
    });
  }
  for (const tag of tags) {
    chips.push({
      key: `tag:${tag}`,
      label: tag,
      onRemove: () => toggleTag(tag),
    });
  }
  return chips;
}
