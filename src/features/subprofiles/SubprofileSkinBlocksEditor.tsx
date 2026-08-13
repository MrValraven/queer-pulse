import {
  FiArrowDown,
  FiArrowUp,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { DatePicker, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRowDragReorder } from "./useRowDragReorder";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import type {
  SkinBlockControl,
  SkinBlockDescriptor,
  SkinItemFieldDescriptor,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { deriveCalendar } from "./skins/practiceAvailability";
import type { PracticeAvailState } from "./api/subprofiles.api";
import styles from "./SubprofileEditor.module.css";

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const AVAIL_CYCLE: PracticeAvailState[] = ["off", "open", "full"];

/** A single-line / multi-line text sub-field of an object block. */
function SkinTextControl({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const raw = editor.getValue(control.path);
  const value = typeof raw === "string" ? raw : "";
  const placeholder = control.placeholderKey ? t(control.placeholderKey) : undefined;

  return (
    <FormField label={t(control.labelKey)}>
      {control.kind === "textarea" ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => editor.setValue(control.path, event.target.value)}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => editor.setValue(control.path, event.target.value)}
        />
      )}
    </FormField>
  );
}

/** An ordered `string[]` list: add / remove / reorder single-line entries. */
function SkinStringListControl({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const lines = (editor.getValue(control.path) as string[] | undefined) ?? [];
  const label = t(control.labelKey);

  const commit = (next: string[]) => editor.setValue(control.path, next);
  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= lines.length) return;
    const next = [...lines];
    [next[from], next[to]] = [next[to]!, next[from]!];
    commit(next);
  };
  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(reorder);

  return (
    <div className={styles.itemsWrap}>
      <span className={styles.itemNum}>{label}</span>
      <div className={styles.lineList} ref={containerRef}>
        {lines.map((line, index) => (
          <div
            key={index}
            className={
              draggingIndex === index
                ? `${styles.lineRow} ${styles.lineRowDragging}`
                : styles.lineRow
            }
          >
            <span
              className={styles.lineGrip}
              aria-hidden
              title={t("subprofiles:skinBlock.dragToReorder")}
              {...gripHandlers(index)}
            >
              <FiMoreVertical size={16} />
            </span>
            <input
              className={styles.lineInput}
              value={line}
              aria-label={t("subprofiles:skinBlock.lineLabel", {
                label,
                index: index + 1,
              })}
              onChange={(event) =>
                commit(lines.map((entry, entryIndex) =>
                  entryIndex === index ? event.target.value : entry,
                ))
              }
            />
            <div className={styles.lineOps}>
              <button
                type="button"
                disabled={index === 0}
                aria-label={t("subprofiles:skinBlock.moveUp")}
                onClick={() => reorder(index, index - 1)}
              >
                <FiArrowUp size={15} aria-hidden />
              </button>
              <button
                type="button"
                disabled={index === lines.length - 1}
                aria-label={t("subprofiles:skinBlock.moveDown")}
                onClick={() => reorder(index, index + 1)}
              >
                <FiArrowDown size={15} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={t("subprofiles:skinBlock.removeItem")}
                onClick={() =>
                  commit(lines.filter((_, entryIndex) => entryIndex !== index))
                }
              >
                <FiTrash2 size={15} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.lineAddBar}>
        <button
          type="button"
          onClick={() => commit([...lines, ""])}
        >
          <FiPlus size={15} aria-hidden />
          {t("subprofiles:skinBlock.addItem")}
        </button>
      </div>
    </div>
  );
}

/** An ordered array of small objects (e.g. first-session steps, referrals),
 *  each editing its own `itemFields`. */
function SkinObjectListControl({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const itemFields = control.itemFields ?? [];
  const entries =
    (editor.getValue(control.path) as Record<string, string>[] | undefined) ?? [];
  const label = t(control.labelKey);

  const commit = (next: Record<string, string>[]) =>
    editor.setValue(control.path, next);
  const emptyEntry = (): Record<string, string> =>
    Object.fromEntries(itemFields.map((field) => [field.key, ""]));
  const swap = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target]!, next[index]!];
    commit(next);
  };
  const patchField = (index: number, key: string, value: string) =>
    commit(
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry,
      ),
    );

  return (
    <div className={styles.itemsWrap}>
      <span className={styles.itemNum}>{label}</span>
      {entries.map((entry, index) => (
        <div key={index} className={styles.itemCard}>
          <div className={styles.itemHead}>
            <span className={styles.itemNum}>
              {t("subprofiles:skinBlock.entryLabel", { index: index + 1 })}
            </span>
            <div className={styles.itemTools}>
              <button
                type="button"
                className={styles.toolBtn}
                disabled={index === 0}
                aria-label={t("subprofiles:skinBlock.moveUp")}
                onClick={() => swap(index, -1)}
              >
                <FiArrowUp size={15} />
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                disabled={index === entries.length - 1}
                aria-label={t("subprofiles:skinBlock.moveDown")}
                onClick={() => swap(index, 1)}
              >
                <FiArrowDown size={15} />
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                aria-label={t("subprofiles:skinBlock.removeItem")}
                onClick={() =>
                  commit(entries.filter((_, entryIndex) => entryIndex !== index))
                }
              >
                <FiX size={15} />
              </button>
            </div>
          </div>
          {itemFields.map((field: SkinItemFieldDescriptor) => (
            <FormField key={field.key} label={t(field.labelKey)}>
              {field.multiline ? (
                <textarea
                  value={entry[field.key] ?? ""}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                  onChange={(event) => patchField(index, field.key, event.target.value)}
                />
              ) : (
                <input
                  value={entry[field.key] ?? ""}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                  onChange={(event) => patchField(index, field.key, event.target.value)}
                />
              )}
            </FormField>
          ))}
        </div>
      ))}
      <div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => commit([...entries, emptyEntry()])}
        >
          <FiPlus size={15} aria-hidden />
          {t("subprofiles:skinBlock.addItem")}
        </button>
      </div>
    </div>
  );
}

/** The Practice skin's 4×7 availability calendar: a start date + slot time
 *  plus 28 tap-to-cycle day cells (free → full → no sessions). */
function SkinGridControl({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const raw = editor.getValue(control.path);
  const availability = (raw && typeof raw === "object" ? raw : {}) as {
    startDate?: string;
    slotTime?: string;
    cells?: PracticeAvailState[];
  };
  const startDate = availability.startDate ?? "";
  const slotTime = availability.slotTime ?? "";
  const cells: PracticeAvailState[] =
    Array.isArray(availability.cells) && availability.cells.length === 28
      ? availability.cells
      : Array.from({ length: 28 }, () => "off" as PracticeAvailState);

  const commit = (next: { startDate: string; slotTime: string; cells: PracticeAvailState[] }) =>
    editor.setValue(control.path, next);

  const cal = deriveCalendar({ startDate, slotTime, cells }); // null when startDate blank/invalid
  const stateLabel = (state: PracticeAvailState) =>
    t(`subprofiles:skinBlock.practice.availability.state_${state}`);

  return (
    <div className={styles.availEditor}>
      <h3 className={styles.cardTitle}>{t(control.labelKey)}</h3>
      <FormField label={t("subprofiles:skinBlock.practice.availability.startDate")}>
        <DatePicker
          mode="date"
          label={t("subprofiles:skinBlock.practice.availability.startDate")}
          value={startDate || null}
          onChange={(value) => commit({ startDate: value ?? "", slotTime, cells })}
        />
      </FormField>
      <FormField label={t("subprofiles:skinBlock.practice.availability.slotTime")}>
        <input
          value={slotTime}
          placeholder="18:00"
          onChange={(event) => commit({ startDate, slotTime: event.target.value, cells })}
        />
      </FormField>
      <p className={styles.availHelp}>{t("subprofiles:skinBlock.practice.availability.help")}</p>
      <div className={styles.availHead} aria-hidden="true">
        {WEEKDAY_LETTERS.map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div className={styles.availGrid}>
        {cells.map((state, index) => {
          const dayNumber = cal?.weeks[Math.floor(index / 7)]?.[index % 7]?.day;
          const next = AVAIL_CYCLE[(AVAIL_CYCLE.indexOf(state) + 1) % AVAIL_CYCLE.length]!;
          return (
            <button
              type="button"
              key={index}
              className={`${styles.availCell} ${styles[`avail_${state}`] ?? ""}`}
              aria-label={t("subprofiles:skinBlock.practice.availability.cellLabel", {
                slot: index + 1,
                state: stateLabel(state),
              })}
              onClick={() =>
                commit({
                  startDate,
                  slotTime,
                  cells: cells.map((cellState, cellIndex) =>
                    cellIndex === index ? next : cellState,
                  ),
                })
              }
            >
              {dayNumber ?? ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkinBlockControlField({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  if (control.kind === "stringList") {
    return <SkinStringListControl control={control} editor={editor} />;
  }
  if (control.kind === "objectList") {
    return <SkinObjectListControl control={control} editor={editor} />;
  }
  if (control.kind === "grid") {
    return <SkinGridControl control={control} editor={editor} />;
  }
  return <SkinTextControl control={control} editor={editor} />;
}

/** One `SkinData` block as a card: its heading (only when it groups more than
 *  one control) plus each labelled control. */
function SkinBlockCard({
  block,
  editor,
}: {
  block: SkinBlockDescriptor;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const showHeading = block.controls.length > 1;

  return (
    <section className={styles.card}>
      {showHeading && <h3 className={styles.cardTitle}>{t(block.titleKey)}</h3>}
      {block.helperKey && <p className={styles.cardNote}>{t(block.helperKey)}</p>}
      {block.controls.map((control) => (
        <SkinBlockControlField key={control.path} control={control} editor={editor} />
      ))}
    </section>
  );
}

/**
 * The "Page blocks" pane: renders the persona's editable `SkinData` blocks (its
 * derived skin family only) as labelled inputs / list editors. Controlled by
 * `useSubprofileSkinBlocksEditor` off the shared editor context — no local save;
 * edits ride the single global "Save all" (folded into the meta `skinData`
 * PATCH). Only mounted for families that have editable blocks (rail-gated), but
 * renders nothing gracefully if it ever mounts for one that doesn't.
 */
export function SubprofileSkinBlocksEditor() {
  const { skinBlocks } = useSubprofileEditorContext();
  if (!skinBlocks.hasBlocks) return null;

  return (
    <div className="ed-grid">
      {skinBlocks.descriptors.map((block) => (
        <SkinBlockCard key={block.blockKey} block={block} editor={skinBlocks} />
      ))}
    </div>
  );
}
