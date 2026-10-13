import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { StudioCountView } from "./api/studio.adapters";

/** A count as the page shows it: 0 and 5 or more as numbers, anything the
 *  server withheld (1 to 4) as "Fewer than 5". */
export function formatStudioCount(
  count: StudioCountView,
  t: TFunction,
  formatters: Formatters,
): string {
  return count.isBelowThreshold || count.value === null
    ? t("studio:numbers.fewerThanFive")
    : formatters.number(count.value);
}
