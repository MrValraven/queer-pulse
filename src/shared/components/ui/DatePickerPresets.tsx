/**
 * Quick-pick preset row for `DatePicker`'s popover/sheet (Task 8). Renders
 * nothing when `presets` is empty/absent, so callers who never pass `presets`
 * see no change. Each button's accessible name comes from its own text
 * content (the translated label), so no extra `aria-label` wiring is needed
 * here. Clicking a preset hands its raw `value` straight to `DatePicker`'s
 * `onChange` (the caller decides the ISO shape) and closes the picker — see
 * `handlePresetSelect` in `DatePicker.tsx`.
 */

import { useTranslation } from "../../i18n/useTranslation";
import styles from "./Calendar.module.css";

export interface DatePickerPreset {
  labelKey: string;
  value: string;
}

export interface DatePickerPresetsProps {
  presets: DatePickerPreset[];
  onSelect: (value: string) => void;
}

export function DatePickerPresets({ presets, onSelect }: DatePickerPresetsProps) {
  const { t } = useTranslation();
  if (presets.length === 0) return null;
  return (
    <div className={styles.presets}>
      {presets.map((preset) => (
        <button
          key={preset.labelKey}
          type="button"
          className={styles.presetButton}
          onClick={() => onSelect(preset.value)}
        >
          {t(`shared:${preset.labelKey}`)}
        </button>
      ))}
    </div>
  );
}
