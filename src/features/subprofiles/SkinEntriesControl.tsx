import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinItemFieldDescriptor,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinRefinedItemFieldInput } from "./SkinRefinedSelectFields";
import {
  SkinListFrame,
  SkinListGrip,
  SkinListRowTools,
  SkinListRow,
} from "./SkinListParts";
import { SkinEntryTitle } from "./SkinEntryTitle";
import { useSkinListRows } from "./useSkinListRows";
import { refinedExample } from "./refinedFieldSurface";
import styles from "./SkinListControls.module.css";

type Entry = Record<string, string>;

/** One numbered entry: the numeral, grip and tools on one line, the first
 *  item field as the entry's title at full width below them, and the
 *  remaining fields labelled under the title. */
function SkinEntryRow({
  entry,
  index,
  count,
  titleField,
  detailFields,
  isDragging,
  onGripPointerDown,
  onChange,
  onMove,
  onRemove,
}: {
  entry: Entry;
  index: number;
  count: number;
  titleField: SkinItemFieldDescriptor;
  detailFields: SkinItemFieldDescriptor[];
  isDragging: boolean;
  onGripPointerDown: Parameters<typeof SkinListGrip>[0]["onPointerDown"];
  onChange: (entry: Entry) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const titleLabel = t(titleField.labelKey);
  // An example gets the "e.g." prefix; the label fallback stays plain, since
  // it names the field.
  const titlePlaceholder = titleField.placeholderKey
    ? refinedExample(t, t(titleField.placeholderKey))
    : titleLabel;
  const fieldsRef = useRef<HTMLDivElement | null>(null);
  const focusFirstDetailField = () =>
    fieldsRef.current
      ?.querySelector<HTMLElement>("input, textarea, button")
      ?.focus();

  return (
    <SkinListRow className={styles.entryRow} isDragging={isDragging}>
      <div className={styles.entryLead}>
        <span className={styles.numeral} aria-hidden>
          {index + 1}
        </span>
        <SkinListGrip onPointerDown={onGripPointerDown} />
      </div>
      <SkinEntryTitle
        value={entry[titleField.key] ?? ""}
        label={t("subprofiles:skinBlock.lineLabel", {
          label: titleLabel,
          index: index + 1,
        })}
        placeholder={titlePlaceholder}
        onChange={(value) => onChange({ ...entry, [titleField.key]: value })}
        onEnter={focusFirstDetailField}
      />
      {detailFields.length > 0 && (
        <div ref={fieldsRef} className={styles.entryFields}>
          {detailFields.map((field) => (
            <SkinRefinedItemFieldInput
              key={field.key}
              field={field}
              value={entry[field.key] ?? ""}
              onChange={(value) => onChange({ ...entry, [field.key]: value })}
            />
          ))}
        </div>
      )}
      <SkinListRowTools
        className={styles.entryTools}
        index={index}
        count={count}
        onMove={onMove}
        onRemove={onRemove}
        rowLabel={titleLabel}
      />
    </SkinListRow>
  );
}

/**
 * An `entries` list (FAQ, first-session steps, referrals) as a numbered
 * list inside the group card, entries split by hairlines. The first item
 * field reads as each entry's title; the rest sit below with small labels.
 */
export function SkinEntriesControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const itemFields = control.itemFields ?? [];
  const [titleField, ...detailFields] = itemFields;
  const rows = useSkinListRows<Entry>({
    editor,
    path: control.path,
    createItem: () =>
      Object.fromEntries(itemFields.map((field) => [field.key, ""])),
  });
  if (!titleField) return null;

  return (
    <SkinListFrame
      control={control}
      isLabelHidden={isLabelHidden}
      itemCount={rows.items.length}
      containerRef={rows.containerRef}
      addButtonRef={rows.addButtonRef}
      onAdd={rows.add}
    >
      {rows.items.map((entry, index) => (
        <SkinEntryRow
          key={rows.rowKeys[index]}
          entry={entry}
          index={index}
          count={rows.items.length}
          titleField={titleField}
          detailFields={detailFields}
          isDragging={rows.draggingIndex === index}
          onGripPointerDown={rows.gripHandlers(index).onPointerDown}
          onChange={(next) => rows.update(index, next)}
          onMove={rows.move}
          onRemove={() => rows.remove(index)}
        />
      ))}
    </SkinListFrame>
  );
}
