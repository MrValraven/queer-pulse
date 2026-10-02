import { DatePicker, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ItemFieldMeta } from "./subprofileEditor.data";
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

/** One-tap answers under a text field. The chip matching the value shows
 *  as picked; a tap writes the chip's text, a tap on the picked one clears. */
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
  const current = value.trim().toLocaleLowerCase();
  return (
    <div
      role="group"
      className={styles.quickPicks}
      aria-label={t("subprofiles:itemField.quickPicks", { label })}
    >
      {pickKeys.map((key) => {
        const text = t(key);
        const isPicked = text.toLocaleLowerCase() === current;
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
 * One base text field of the item drawer (`SECTION_META[section].fields`),
 * in the input its `meta` asks for: a textarea, a month or day picker, or a
 * plain input, with any quick picks under it. The meta already carries the
 * kind's own wording (`itemFieldMeta`).
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
  const quickPickKeys = isPlainText ? meta.quickPickKeys : undefined;

  const field = (
    <FormField label={t(labelKey)} required={isRequired} helper={helper}>
      {meta.multiline ? (
        <textarea
          value={value}
          placeholder={t(placeholderKey)}
          onChange={(event) => onChange(event.target.value)}
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
  // `FormField` wires one control child, so the picks sit beside it.
  if (!quickPickKeys) return field;
  return (
    <div className={styles.fieldWithPicks}>
      {field}
      <QuickPicks
        pickKeys={quickPickKeys}
        label={t(labelKey)}
        value={value}
        onPick={onChange}
      />
    </div>
  );
}
