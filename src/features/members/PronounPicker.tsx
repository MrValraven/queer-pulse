import { useLayoutEffect, useRef } from "react";
import { TagPicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUN_PRESETS } from "../../shared/identity/pronouns";
import styles from "./ProfileEdit.module.css";

/**
 * Pronouns: the presets as toggle chips, then the member's own pronouns as
 * removable chips with a free-text add (the shared `TagPicker`). Typing a
 * preset's words selects the preset, and a repeat is ignored.
 */
export function PronounPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const presets = PRONOUN_PRESETS as readonly string[];
  const customPronouns = value.filter((entry) => !presets.includes(entry));

  // A pasted "he, she, they" commits each piece through `onAdd` inside one
  // event, and `value` stays stale for the whole event, so `addCustom` reads
  // and advances this ref and builds each next list from it.
  const latestValueRef = useRef(value);
  useLayoutEffect(() => {
    latestValueRef.current = value;
  });

  function toggle(pronoun: string) {
    onChange(
      value.includes(pronoun)
        ? value.filter((entry) => entry !== pronoun)
        : [...value, pronoun],
    );
  }

  function addCustom(typed: string) {
    const current = latestValueRef.current;
    const preset = presets.find(
      (option) => option.toLowerCase() === typed.toLowerCase(),
    );
    if (preset) {
      if (!current.includes(preset)) {
        const next = [...current, preset];
        latestValueRef.current = next;
        onChange(next);
      }
      return;
    }
    const isRepeat = current.some(
      (entry) => entry.toLowerCase() === typed.toLowerCase(),
    );
    if (!isRepeat) {
      const next = [...current, typed];
      latestValueRef.current = next;
      onChange(next);
    }
  }

  return (
    <div className={styles.pronounPicker}>
      <div className={styles.chips}>
        {PRONOUN_PRESETS.map((pronoun) => (
          <button
            key={pronoun}
            type="button"
            className={`${styles.chip} ${value.includes(pronoun) ? styles.chipSelected : ""}`}
            aria-pressed={value.includes(pronoun)}
            onClick={() => toggle(pronoun)}
          >
            {pronoun}
          </button>
        ))}
      </div>
      <TagPicker
        tags={customPronouns}
        onAdd={addCustom}
        onRemove={(pronoun) =>
          onChange(value.filter((entry) => entry !== pronoun))
        }
        labels={{
          input: t("members:profileEdit.customPronounsLabel"),
          placeholder: t("members:profileEdit.customPronounPlaceholder"),
          remove: (tag) => t("members:profileEdit.removeTagLabel", { tag }),
        }}
      />
    </div>
  );
}
