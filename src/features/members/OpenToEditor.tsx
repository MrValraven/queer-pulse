import { useState, type KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  OPEN_TO_PRESETS,
  isPreset,
  openToLabel,
  reasonValue,
  type OpenToEntry,
  type OpenToId,
} from "./openTo.data";
import styles from "./ProfileEdit.module.css";

/**
 * Picker for the "Open to" chips under the Now status: the shared presets as
 * toggles, plus a free-text input for the long tail the taxonomy deliberately
 * doesn't cover (see `openTo.data.ts`). Presets stay filterable in the
 * directory; customs are stored verbatim in the member's own words.
 */
export function OpenToEditor({
  entries,
  onChange,
}: {
  entries: OpenToEntry[];
  onChange: (next: OpenToEntry[]) => void;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  const selectedIds = new Set(
    entries.filter(isPreset).map((entry) => entry.id as OpenToId),
  );
  const customs = entries.filter((entry) => entry.kind === "custom");

  function togglePreset(id: OpenToId) {
    onChange(
      selectedIds.has(id)
        ? entries.filter((entry) => !(isPreset(entry) && entry.id === id))
        : [...entries, { kind: "preset", id }],
    );
  }

  function addCustom() {
    const label = input.trim();
    setInput("");
    if (!label) return;
    // Don't let someone re-type a preset's words as a custom — the preset is the
    // filterable one, so the duplicate would only ever lose them reach.
    const asPreset = OPEN_TO_PRESETS.find(
      (preset) => t(preset.labelKey).toLowerCase() === label.toLowerCase(),
    );
    if (asPreset) {
      if (!selectedIds.has(asPreset.id)) togglePreset(asPreset.id);
      return;
    }
    const exists = customs.some(
      (entry) =>
        entry.kind === "custom" &&
        entry.label.toLowerCase() === label.toLowerCase(),
    );
    if (!exists) onChange([...entries, { kind: "custom", label }]);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustom();
    } else if (event.key === "Backspace" && !input && customs.length) {
      const last = customs[customs.length - 1];
      onChange(entries.filter((entry) => entry !== last));
    }
  }

  return (
    <div>
      <div
        className={styles.openToPresets}
        role="group"
        aria-label={t("members:profileEdit.openTo.presetsLabel")}
      >
        {OPEN_TO_PRESETS.map((preset) => {
          const selected = selectedIds.has(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              className={`${styles.openToChip} ${selected ? styles.openToChipOn : ""}`}
              onClick={() => togglePreset(preset.id)}
            >
              {t(preset.labelKey)}
            </button>
          );
        })}
      </div>

      <div className={styles.tagEditor}>
        {customs.map((entry) => (
          <span key={reasonValue(entry)} className={styles.tag}>
            {openToLabel(entry, t)}
            <button
              type="button"
              className={styles.tagRemove}
              aria-label={t("members:profileEdit.openTo.removeLabel", {
                label: openToLabel(entry, t),
              })}
              onClick={() => onChange(entries.filter((x) => x !== entry))}
            >
              <FiX size={13} />
            </button>
          </span>
        ))}
        <input
          className={`${styles.inlineInput} ${styles.openToInput}`}
          value={input}
          placeholder={t("members:profileEdit.openTo.addPlaceholder")}
          aria-label={t("members:profileEdit.openTo.addLabel")}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKey}
          onBlur={addCustom}
        />
      </div>
    </div>
  );
}
