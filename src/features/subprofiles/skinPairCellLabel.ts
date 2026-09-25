import type { TFunction } from "../../shared/i18n/types";
import type { SkinItemFieldDescriptor } from "./skinBlockFields.data";

/** A cell input's label ("Insurer, line 2"), also the name of its
 *  type-ahead list. */
export function pairCellLabel(
  t: TFunction,
  field: SkinItemFieldDescriptor,
  rowNumber: number,
): string {
  return t("subprofiles:skinBlock.lineLabel", {
    label: t(field.labelKey),
    index: rowNumber,
  });
}
