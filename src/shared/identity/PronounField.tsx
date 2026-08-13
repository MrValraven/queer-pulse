// src/shared/identity/PronounField.tsx
import { useId, useState, type ReactNode } from "react";
import { PRONOUN_PRESETS } from "./pronouns";
import styles from "./PronounField.module.css";

interface PronounFieldLabels {
  field: ReactNode;
  helper?: ReactNode;
  writeOwn: string;
  placeholder: string;
  add: string;
  removeAria: (pronoun: string) => string;
}

interface PronounFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  labels: PronounFieldLabels;
}

/**
 * Boxed pronoun picker: preset chips (multi-select) + a write-your-own list.
 * Namespace-agnostic — callers pass already-translated `labels`. The value is a
 * list of pronoun sets; a member may hold more than one. Inside a
 * `<fieldset disabled>` the native controls disable themselves.
 */
export function PronounField({ value, onChange, labels }: PronounFieldProps) {
  const fieldId = useId();
  const [customInput, setCustomInput] = useState("");
  const presets = PRONOUN_PRESETS as readonly string[];
  const custom = value.filter((entry) => !presets.includes(entry));

  function toggle(preset: string) {
    onChange(
      value.includes(preset)
        ? value.filter((entry) => entry !== preset)
        : [...value, preset],
    );
  }

  function addCustom() {
    const trimmed = customInput.trim();
    setCustomInput("");
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  }

  return (
    <div className={styles.field}>
      <div className={styles.label}>{labels.field}</div>
      {labels.helper && <p className={styles.helper}>{labels.helper}</p>}
      <div className={styles.chips}>
        {PRONOUN_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={[styles.chip, value.includes(preset) && styles.chipSelected]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={value.includes(preset)}
            onClick={() => toggle(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
      <label className={styles.writeOwn} htmlFor={`${fieldId}-custom`}>
        {labels.writeOwn}
      </label>
      {custom.length > 0 && (
        <div className={styles.customList}>
          {custom.map((entry) => (
            <span key={entry} className={styles.customTag}>
              {entry}
              <button
                type="button"
                className={styles.customRemove}
                aria-label={labels.removeAria(entry)}
                onClick={() => onChange(value.filter((item) => item !== entry))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={styles.inputRow}>
        <input
          id={`${fieldId}-custom`}
          className={styles.input}
          type="text"
          placeholder={labels.placeholder}
          value={customInput}
          onChange={(event) => setCustomInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className={styles.chip} onClick={addCustom}>
          {labels.add}
        </button>
      </div>
    </div>
  );
}
