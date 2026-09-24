import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinItemFieldDescriptor,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { MoneyInput } from "./SkinNumberControls";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRemoveButton,
  SkinListRow,
} from "./SkinListParts";
import { useSkinListRows } from "./useSkinListRows";
import styles from "./SkinListControls.module.css";

type PairEntry = Record<string, string>;

/** One cell of a pair row: a compact input (a euro amount for `isMoney`),
 *  plus the column label as a caption once the row stacks on a phone. */
function SkinPairCell({
  field,
  value,
  rowNumber,
  className,
  onChange,
}: {
  field: SkinItemFieldDescriptor;
  value: string;
  rowNumber: number;
  className?: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const columnLabel = t(field.labelKey);
  const ariaLabel = t("subprofiles:skinBlock.lineLabel", {
    label: columnLabel,
    index: rowNumber,
  });
  const placeholder = field.placeholderKey
    ? t(field.placeholderKey)
    : undefined;

  return (
    <div className={`${styles.pairCell} ${className}`}>
      <span className={styles.pairCaption} aria-hidden>
        {columnLabel}
      </span>
      {field.isMoney ? (
        <MoneyInput
          className={styles.pairMoney}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={onChange}
        />
      ) : (
        <input
          className={styles.pairInput}
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

/**
 * A `pairs` list (session lengths, reimbursement, hours) as a compact table:
 * the two column labels once in a header, then one row per entry with a drag
 * grip, the two inputs and a remove button. Rows reorder by drag, or with Alt
 * and an arrow key from either input. On a phone each row stacks its inputs.
 */
export function SkinPairsControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const [firstField, secondField] = control.itemFields ?? [];
  const rows = useSkinListRows<PairEntry>({
    editor,
    path: control.path,
    createItem: () => ({
      [firstField?.key ?? "first"]: "",
      [secondField?.key ?? "second"]: "",
    }),
  });
  if (!firstField || !secondField) return null;

  const header = (
    <div className={styles.pairsHead} aria-hidden>
      <span />
      <span className={styles.columnLabel}>{t(firstField.labelKey)}</span>
      <span className={styles.columnLabel}>{t(secondField.labelKey)}</span>
      <span />
    </div>
  );

  return (
    <SkinListFrame
      control={control}
      isLabelHidden={isLabelHidden}
      itemCount={rows.items.length}
      containerRef={rows.containerRef}
      addButtonRef={rows.addButtonRef}
      onAdd={rows.add}
      header={header}
    >
      {rows.items.map((entry, index) => (
        <SkinListRow
          key={rows.rowKeys[index]}
          className={styles.pairRow}
          isDragging={rows.draggingIndex === index}
        >
          <SkinListGrip
            className={styles.pairGrip}
            {...rows.gripHandlers(index)}
          />
          {[firstField, secondField].map((field, fieldIndex) => (
            <SkinPairCell
              key={field.key}
              field={field}
              value={entry[field.key] ?? ""}
              rowNumber={index + 1}
              className={
                fieldIndex === 0 ? styles.pairFirst : styles.pairSecond
              }
              onChange={(value) =>
                rows.update(index, { ...entry, [field.key]: value })
              }
            />
          ))}
          <SkinListRemoveButton
            className={styles.pairRemove}
            rowLabel={t(control.labelKey)}
            rowNumber={index + 1}
            onRemove={() => rows.remove(index)}
          />
        </SkinListRow>
      ))}
    </SkinListFrame>
  );
}
