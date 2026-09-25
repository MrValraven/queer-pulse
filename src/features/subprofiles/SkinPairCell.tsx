import type { RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinItemFieldDescriptor } from "./skinBlockFields.data";
import { MoneyInput } from "./SkinNumberControls";
import { SkinSuggestInput } from "./SkinSuggestInput";
import type { SkinSuggest } from "./useSkinSuggestInput";
import { refinedExample, refinedSurfaceClassName } from "./refinedFieldSurface";
import { pairCellLabel } from "./skinPairCellLabel";
import styles from "./SkinListControls.module.css";
import refinedStyles from "./SkinRefinedList.module.css";

/** One cell of a pair row: a compact input (a euro amount for `isMoney`, a
 *  type-ahead with `suggest`), plus the column label as a caption once the
 *  row stacks (on a phone, or in a card too narrow for two values side by
 *  side). */
export function SkinPairCell({
  field,
  value,
  rowNumber,
  isExampleShown,
  className,
  suggest,
  suggestFieldRef,
  onChange,
}: {
  field: SkinItemFieldDescriptor;
  value: string;
  rowNumber: number;
  /** Whether the field's example shows as its placeholder: on the first row
   *  only, while no row has text in this column. */
  isExampleShown: boolean;
  className?: string;
  /** The row's type-ahead and its field ref, when this cell is the field
   *  with `suggestions`. */
  suggest?: SkinSuggest;
  suggestFieldRef?: RefObject<HTMLDivElement | null>;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const isEmpty = value.trim() === "";
  const columnLabel = t(field.labelKey);
  const ariaLabel = pairCellLabel(t, field, rowNumber);
  const placeholder =
    isExampleShown && field.placeholderKey
      ? refinedExample(t, t(field.placeholderKey))
      : undefined;
  const surfaceClassName = refinedSurfaceClassName({ isEmpty });

  return (
    <div className={`${styles.pairCell} ${className}`}>
      <span
        className={`${styles.pairCaption} ${refinedStyles.columnLabel} ${refinedStyles.pairCaption}`}
        aria-hidden
        data-pair-caption=""
      >
        {columnLabel}
      </span>
      {field.isMoney ? (
        <MoneyInput
          className={`${styles.pairMoney} ${refinedStyles.money}`}
          inputClassName={`${surfaceClassName} ${refinedStyles.moneyInput}`}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={onChange}
        />
      ) : suggest && suggestFieldRef ? (
        <SkinSuggestInput
          suggest={suggest}
          fieldRef={suggestFieldRef}
          className={surfaceClassName}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        />
      ) : (
        <input
          className={surfaceClassName}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
