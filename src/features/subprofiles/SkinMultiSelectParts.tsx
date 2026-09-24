import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { FiCheckSquare, FiPlus, FiSquare, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { MultiSelectEntry } from "./skinMultiSelectValue";
import type { SkinMultiSelect } from "./useSkinMultiSelect";
import styles from "./SkinMultiSelectControl.module.css";

const REMOVE_KEY = "subprofiles:skinControl.multiSelect.remove";
const ADD_OWN_KEY = "subprofiles:skinControl.multiSelect.addOwn";
const ADD_KEY = "subprofiles:skinControl.multiSelect.add";
const DONE_KEY = "subprofiles:skinControl.multiSelect.done";

const classNames = (...names: (string | false | undefined)[]): string =>
  names.filter(Boolean).join(" ");

/**
 * The chosen entries under the trigger, in stored order, each a plum chip
 * with a remove button (the owner's own words dashed and italic). Removing
 * one moves focus to the next chip's remove button, else the previous one,
 * else the trigger, so keyboard focus never drops to the page.
 */
export function MultiSelectChips({
  select,
  labelId,
  triggerRef,
}: {
  select: SkinMultiSelect;
  labelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLUListElement>(null);
  if (select.entries.length === 0) return null;

  function removeAt(index: number, value: string): void {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    const nextFocus =
      buttons[index + 1] ?? buttons[index - 1] ?? triggerRef.current;
    select.removeChip(value);
    nextFocus?.focus();
  }

  return (
    <ul ref={listRef} className={styles.chips} aria-labelledby={labelId}>
      {select.entries.map((entry, index) => (
        <li
          key={entry.value}
          className={classNames(styles.chip, entry.isCustom && styles.custom)}
        >
          <span className={styles.chipText}>{entry.label}</span>
          <button
            type="button"
            className={styles.chipRemove}
            aria-label={t(REMOVE_KEY, { label: entry.label })}
            onClick={() => removeAt(index, entry.value)}
          >
            <FiX size={14} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** One checkbox row: a visually hidden native checkbox inside its label, so
 *  Space and the screen-reader state come from the input. The square
 *  indicator carries the state beside the colour. */
function OptionRow({
  row,
  isChecked,
  onToggle,
}: {
  row: MultiSelectEntry;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const Indicator = isChecked ? FiCheckSquare : FiSquare;
  return (
    <label
      className={classNames(
        styles.option,
        isChecked && styles.optionChecked,
        row.isCustom && styles.custom,
      )}
    >
      <input
        type="checkbox"
        value={row.value}
        checked={isChecked}
        className="visuallyHidden"
        onChange={onToggle}
      />
      <Indicator aria-hidden className={styles.indicator} />
      <span className={styles.optionText}>{row.label}</span>
    </label>
  );
}

/** The owner's own entries shown in the panel: every one chosen when it
 *  opened plus any added since. One unticked while open keeps its row
 *  (unchecked), so focus stays on it and it can be ticked back. */
function useShownCustomRows(select: SkinMultiSelect): MultiSelectEntry[] {
  const chosenCustom = select.entries.filter((entry) => entry.isCustom);
  const [shownRows, setShownRows] = useState(chosenCustom);
  const newRows = chosenCustom.filter(
    (entry) => !shownRows.some((shown) => shown.value === entry.value),
  );
  if (newRows.length > 0) setShownRows([...shownRows, ...newRows]);
  return [...shownRows, ...newRows];
}

/**
 * The open panel, in flow under the trigger: the owner's own entries, then
 * the options in list order, as a checkbox group named by the field label;
 * with `allowsCustom`, an "Add your own" input and Add button (Enter adds
 * too); then Done, which adds any typed text, closes and returns focus to
 * the trigger.
 */
export function MultiSelectPanel({
  select,
  control,
  panelRef,
  panelId,
  labelId,
}: {
  select: SkinMultiSelect;
  control: SkinBlockControl;
  panelRef: RefObject<HTMLDivElement | null>;
  panelId: string;
  labelId: string;
}) {
  const { t } = useTranslation();
  const customInputId = useId();
  const customRows = useShownCustomRows(select);
  const rows: MultiSelectEntry[] = [
    ...customRows,
    ...select.options.map((option) => ({ ...option, isCustom: false })),
  ];

  function onCustomKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      select.addDraft();
    }
  }

  return (
    <div ref={panelRef} id={panelId} className={styles.panel}>
      <div role="group" aria-labelledby={labelId} className={styles.options}>
        {rows.map((row) => (
          <OptionRow
            key={row.value}
            row={row}
            isChecked={select.isChosen(row.value)}
            onToggle={() => select.toggle(row.value)}
          />
        ))}
      </div>
      {control.allowsCustom && (
        <div className={styles.customRow}>
          <label htmlFor={customInputId} className={styles.customLabel}>
            {t(ADD_OWN_KEY)}
          </label>
          <div className={styles.customControls}>
            <input
              id={customInputId}
              type="text"
              className={styles.customInput}
              value={select.draft}
              placeholder={
                control.customPlaceholderKey
                  ? t(control.customPlaceholderKey)
                  : undefined
              }
              autoComplete="off"
              onChange={(event) => select.setDraft(event.target.value)}
              onKeyDown={onCustomKeyDown}
            />
            <Button
              variant="ghost"
              className={styles.addButton}
              onClick={select.addDraft}
            >
              <FiPlus size={15} aria-hidden />
              {t(ADD_KEY)}
            </Button>
          </div>
        </div>
      )}
      <div className={styles.panelFooter}>
        <Button
          variant="ghost"
          className={styles.doneButton}
          onClick={select.finish}
        >
          {t(DONE_KEY)}
        </Button>
      </div>
    </div>
  );
}
