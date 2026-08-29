import { useCallback } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Builds the count half of a `ChipOption` — the trailing availability badge and
 * the accessible name that carries it — for one filter group.
 *
 * Shared by every chip group in the directory sidebar that shows counts
 * (languages, fields, professions) so their treatment cannot drift; the
 * checkbox groups get the same behaviour from `FilterCheckboxSection`.
 *
 * Returns an EMPTY object when this option has no count, so the chip renders
 * exactly as it did before badges existed. A missing count must never be shown
 * as a zero: "not counted" and "nobody is here" are different answers, and only
 * one of them should grey the chip out.
 */
export function useChipCount(counts: Record<string, number> | undefined) {
  const { t } = useTranslation();
  return useCallback(
    (id: string, label: string) => {
      const count = counts?.[id];
      if (count === undefined) return {};
      return {
        count,
        // The badge itself is aria-hidden, so the chip carries the whole
        // phrase: "Design, 12 members", never "Design 12".
        ariaLabel: t("members:directory.filter.optionWithCount", {
          label,
          count,
        }),
      };
    },
    [counts, t],
  );
}
