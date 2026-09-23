import { useId, useRef, useState, type KeyboardEvent } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StickerSliderField.module.css";

/** Clamp into [min, max] and snap to the nearest step counted from min. */
function clampToStep(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  const clamped = Math.min(max, Math.max(min, value));
  const snapped = min + Math.round((clamped - min) / step) * step;
  return Math.min(max, Number(snapped.toFixed(6)));
}

/**
 * One numeric style control: a label row carrying a per-field reset and an
 * exact-value box with its unit, over a full-width range slider. Every number
 * here is in DISPLAY units; a caller that stores another scale (the arrow
 * size is stored as a fraction and shown as a percent) converts at the edge.
 *
 * The number box keeps its own draft while focused, so a half-typed value
 * never fights the slider. A draft inside the range commits as it is typed;
 * anything else is clamped and snapped when the box loses focus or on Enter,
 * and Escape throws the draft away.
 */
export function StickerSliderField({
  label,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  /** Shown after the number box, e.g. `px`, `°` or `%`. */
  unit: string;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  const rangeId = useId();
  const rangeRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const isChanged = value !== defaultValue;
  const resetLabel = t("admin:stickerPacks.controls.resetField", {
    field: label,
  });

  function handleDraftChange(text: string) {
    setDraft(text);
    const parsed = Number(text);
    if (text.trim() !== "" && Number.isFinite(parsed)) {
      if (parsed >= min && parsed <= max) onChange(parsed);
    }
  }

  function commitDraft() {
    if (draft === null) return;
    const parsed = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(parsed)) {
      onChange(clampToStep(parsed, min, max, step));
    }
    setDraft(null);
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Escape" && draft !== null) {
      event.preventDefault();
      setDraft(null);
    }
  }

  function handleReset() {
    onChange(defaultValue);
    setDraft(null);
    // The reset button unmounts once the value matches the default, so hand
    // focus to the slider and keep the keyboard user inside this field.
    rangeRef.current?.focus();
  }

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={rangeId}>
          {label}
        </label>
        {isChanged && (
          <button
            type="button"
            data-tap-target
            className={styles.resetButton}
            aria-label={resetLabel}
            title={resetLabel}
            onClick={handleReset}
          >
            <FiRotateCcw aria-hidden />
          </button>
        )}
        <span className={styles.valueBox}>
          <input
            type="number"
            className={styles.numberInput}
            min={min}
            max={max}
            step={step}
            value={draft ?? String(value)}
            aria-label={t("admin:stickerPacks.controls.exactValue", {
              field: label,
            })}
            onChange={(event) => handleDraftChange(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={handleDraftKeyDown}
          />
          <span className={styles.unit} aria-hidden>
            {unit}
          </span>
        </span>
      </div>
      <input
        ref={rangeRef}
        id={rangeId}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
