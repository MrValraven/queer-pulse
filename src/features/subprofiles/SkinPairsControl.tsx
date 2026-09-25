import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRemoveButton,
} from "./SkinListParts";
import { SkinPairRow, type PairEntry } from "./SkinPairRow";
import { useSkinListRows } from "./useSkinListRows";
import styles from "./SkinListControls.module.css";
import refinedStyles from "./SkinRefinedList.module.css";

/**
 * A `pairs` list (session lengths, reimbursement, hours) as a compact table:
 * the two column labels once in a header, then one row per entry with a drag
 * grip, the two inputs and a remove button. Rows reorder by drag, by the
 * grip's move menu, or with Alt and an arrow key from either input. A
 * column's example shows on the first row only, while no row has text in
 * that column. Each row stacks its inputs on a phone, and in a card too
 * narrow for two values side by side. When the second field is a euro
 * amount (reimbursement), it takes a narrow fixed column, so the row stays
 * on one line in any card wider than 20.5rem.
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

  // Each part pairs its layout class with the one that stacks the row in a
  // narrow card (SkinRefinedList.module.css). A money pair adds the class
  // that sizes its amount column, on the header and on every row alike.
  const isMoneyPair = secondField.isMoney === true;
  const moneyPairClassName = isMoneyPair && refinedStyles.pairsMoney;
  const rowLabel = t(control.labelKey);
  const exampleKeys = [firstField.key, secondField.key].filter(
    (key) =>
      !rows.items.some((entry) => String(entry[key] ?? "").trim() !== ""),
  );
  const header = (
    <div
      className={cx(
        styles.pairsHead,
        refinedStyles.pairsHead,
        moneyPairClassName,
      )}
      aria-hidden
    >
      <span />
      <span className={refinedStyles.columnLabel}>
        {t(firstField.labelKey)}
      </span>
      <span className={refinedStyles.columnLabel}>
        {t(secondField.labelKey)}
      </span>
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
        <SkinPairRow
          key={rows.rowKeys[index]}
          className={cx(
            styles.pairRow,
            refinedStyles.pairRow,
            moneyPairClassName,
          )}
          isDragging={rows.draggingIndex === index}
          isEntering={rows.isInsertedRow(index)}
          shouldGlide={rows.shouldRowsGlide}
          fields={[firstField, secondField]}
          entry={entry}
          rowNumber={index + 1}
          exampleKeys={index === 0 ? exampleKeys : []}
          grip={
            <SkinListGrip
              className={cx(styles.pairGrip, refinedStyles.pairGrip)}
              {...rows.gripHandlers(index)}
              reorder={rows.reorderFor(index, rowLabel)}
            />
          }
          removeButton={
            <SkinListRemoveButton
              className={cx(styles.pairRemove, refinedStyles.pairRemove)}
              rowLabel={rowLabel}
              rowNumber={index + 1}
              onRemove={() => rows.remove(index)}
            />
          }
          onChange={(key, value) =>
            rows.update(index, { ...entry, [key]: value })
          }
        />
      ))}
    </SkinListFrame>
  );
}
