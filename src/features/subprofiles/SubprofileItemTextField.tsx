import { useId } from "react";
import { DatePicker, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ItemFieldMeta } from "./subprofileEditor.data";
import { SkinAutoGrowTextarea } from "./SkinAutoGrowTextarea";
import styles from "./SubprofileEditor.module.css";

/** Seed value for a month picker (`yyyy-mm`). A bare `yyyy-mm` passes through;
 *  a legacy free-text date ("July 2025") is best-effort parsed so the picker
 *  opens on the stored month; anything unparseable ("Ongoing") shows empty and
 *  the stored value is left untouched until the user picks a month. */
function toMonthValue(raw: string): string {
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return "";
  const date = new Date(parsed);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Seed value for a day picker (`yyyy-mm-dd`), read the same way: a stored
 *  "17 Oct 2026" opens on that day, and unparseable text shows empty and
 *  stays stored until a day is picked. */
function toDayValue(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return "";
  const date = new Date(parsed);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whether `value` is exactly one of the quick answers (case aside). */
function isQuickPick(value: string, pickTexts: string[]): boolean {
  const current = value.trim().toLocaleLowerCase();
  return pickTexts.some((text) => text.toLocaleLowerCase() === current);
}

/** One-tap answers for a text field. The chip matching the value shows as
 *  picked; a tap writes the chip's text, a tap on the picked one clears. */
function QuickPicks({
  pickKeys,
  label,
  value,
  onPick,
}: {
  pickKeys: string[];
  label: string;
  value: string;
  onPick: (text: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      className={styles.quickPicks}
      aria-label={t("subprofiles:itemField.quickPicks", { label })}
    >
      {pickKeys.map((key) => {
        const text = t(key);
        const isPicked = isQuickPick(value, [text]);
        return (
          <button
            key={key}
            type="button"
            className={styles.quickPick}
            aria-pressed={isPicked}
            onClick={() => onPick(isPicked ? "" : text)}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A text field with common answers (a campaign's table status): the answers
 * ARE the control, as chips, with a small "or in your own words" input under
 * them for anything else. It used to be a full text input with the same
 * answers repeated as chips below it, so every pick showed up twice and the
 * field read as two competing controls. The input now holds only a value the
 * chips don't — picking a chip empties it, typing in it un-picks the chip.
 */
function QuickPickField({
  label,
  helper,
  pickKeys,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  pickKeys: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const isPicked = isQuickPick(
    value,
    pickKeys.map((key) => t(key)),
  );
  return (
    <div
      className={styles.fieldWithPicks}
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className={styles.pickLabel}>
        {label}
      </span>
      <QuickPicks
        pickKeys={pickKeys}
        label={label}
        value={value}
        onPick={onChange}
      />
      <FormField helper={helper}>
        <input
          value={isPicked ? "" : value}
          aria-label={t("subprofiles:itemField.ownWords", { label })}
          placeholder={t("subprofiles:itemField.ownWordsPlaceholder")}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>
    </div>
  );
}

/**
 * One base text field of the item drawer (`SECTION_META[section].fields`),
 * in the input its `meta` asks for: a growing textarea, a month or day
 * picker, a set of quick answers, or a plain input. The meta already carries
 * the kind's own wording (`itemFieldMeta`).
 */
export function SubprofileItemTextField({
  meta,
  value,
  isRequired,
  onChange,
}: {
  meta: ItemFieldMeta;
  value: string;
  isRequired: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { labelKey, placeholderKey, inputType } = meta;
  const helper = meta.helperKey ? t(meta.helperKey) : undefined;
  const isPlainText =
    !meta.multiline && inputType !== "month" && inputType !== "date";

  if (isPlainText && meta.quickPickKeys) {
    return (
      <QuickPickField
        label={t(labelKey)}
        helper={helper}
        pickKeys={meta.quickPickKeys}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <FormField label={t(labelKey)} required={isRequired} helper={helper}>
      {meta.multiline ? (
        // Grows with the text: a fixed-height box clipped a campaign's
        // pitch mid-line and hid most of what was being edited.
        <SkinAutoGrowTextarea
          className={styles.growTextarea}
          value={value}
          placeholder={t(placeholderKey)}
          onChange={onChange}
        />
      ) : inputType === "month" || inputType === "date" ? (
        <DatePicker
          mode={inputType}
          label={t(labelKey)}
          value={
            (inputType === "month" ? toMonthValue(value) : toDayValue(value)) ||
            null
          }
          onChange={(picked) => onChange(picked ?? "")}
        />
      ) : (
        <input
          value={value}
          placeholder={t(placeholderKey)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  );
}
