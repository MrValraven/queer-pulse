import { useRef, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { SkinItemFieldDescriptor } from "./skinBlockFields.data";
import { SkinListRow } from "./SkinListParts";
import { SkinPairCell } from "./SkinPairCell";
import { pairCellLabel } from "./skinPairCellLabel";
import { SkinSuggestList } from "./SkinSuggestInput";
import { useSkinSuggestInput } from "./useSkinSuggestInput";
import styles from "./SkinListControls.module.css";
import refinedStyles from "./SkinRefinedList.module.css";

/** One entry of a `pairs` list, keyed by the two item fields. */
export type PairEntry = Record<string, string>;

/** One pair row: grip, the two cells and the remove button. A text field
 *  with `suggestions` (the reimbursement insurer) gets a type-ahead whose
 *  list spans the whole row under the inputs (`pairSuggest` in
 *  SkinRefinedList.module.css), so a long name has room in a narrow card. */
export function SkinPairRow({
  className,
  isDragging,
  isEntering,
  shouldGlide,
  fields,
  entry,
  rowNumber,
  exampleKeys,
  grip,
  removeButton,
  onChange,
}: {
  className: string;
  isDragging: boolean;
  /** A row just added, which eases in (`SkinListRow`). */
  isEntering: boolean;
  /** Glide into a new slot (`SkinListRow`), true after a move. */
  shouldGlide: boolean;
  fields: [SkinItemFieldDescriptor, SkinItemFieldDescriptor];
  entry: PairEntry;
  rowNumber: number;
  /** The fields whose example shows as the placeholder in this row. */
  exampleKeys: readonly string[];
  grip: ReactNode;
  removeButton: ReactNode;
  onChange: (key: string, value: string) => void;
}) {
  const { t } = useTranslation();
  const suggestField = fields.find(
    (field) => field.suggestions && !field.isMoney,
  );
  const suggestFieldRef = useRef<HTMLDivElement>(null);
  const suggestListRef = useRef<HTMLDivElement>(null);
  const suggest = useSkinSuggestInput(
    {
      value: suggestField ? (entry[suggestField.key] ?? "") : "",
      onChange: (value) => {
        if (suggestField) onChange(suggestField.key, value);
      },
      suggestions: suggestField?.suggestions ?? [],
    },
    { fieldRef: suggestFieldRef, listboxRef: suggestListRef },
  );

  return (
    <SkinListRow
      className={className}
      isDragging={isDragging}
      isEntering={isEntering}
      shouldGlide={shouldGlide}
    >
      {grip}
      {fields.map((field, fieldIndex) => (
        <SkinPairCell
          key={field.key}
          field={field}
          value={entry[field.key] ?? ""}
          rowNumber={rowNumber}
          isExampleShown={exampleKeys.includes(field.key)}
          className={
            fieldIndex === 0
              ? cx(styles.pairFirst, refinedStyles.pairFirst)
              : cx(styles.pairSecond, refinedStyles.pairSecond)
          }
          suggest={field === suggestField ? suggest : undefined}
          suggestFieldRef={suggestFieldRef}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
      {removeButton}
      <SkinSuggestList
        suggest={suggest}
        listboxRef={suggestListRef}
        className={refinedStyles.pairSuggest}
        aria-label={
          suggestField ? pairCellLabel(t, suggestField, rowNumber) : undefined
        }
      />
    </SkinListRow>
  );
}
