import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TagPicker } from "../../shared/components/ui";
import {
  OPEN_TO_PRESETS,
  isPreset,
  type OpenToEntry,
  type OpenToId,
} from "./openTo.data";
import styles from "./ProfileEdit.module.css";

/**
 * Picker for the "Open to" chips under the Now status: the shared presets as
 * toggles, plus a free-text field for the long tail the taxonomy deliberately
 * doesn't cover (see `openTo.data.ts`). Presets stay filterable in the
 * directory; customs are removable chips from the shared `TagPicker`, stored
 * verbatim in the member's own words.
 */
export function OpenToEditor({
  entries,
  onChange,
}: {
  entries: OpenToEntry[];
  onChange: (next: OpenToEntry[]) => void;
}) {
  const { t } = useTranslation();

  const selectedIds = new Set(
    entries.filter(isPreset).map((entry) => entry.id),
  );
  const customLabels = entries.flatMap((entry) =>
    entry.kind === "custom" ? [entry.label] : [],
  );

  // A pasted "coffee, walks, gigs," commits each piece through `onAdd` inside
  // one event, and `entries` stays stale for the whole event, so
  // `togglePreset` and `addCustom` read and advance this ref and build each
  // next list from it.
  const latestEntriesRef = useRef(entries);
  useLayoutEffect(() => {
    latestEntriesRef.current = entries;
  });

  function togglePreset(id: OpenToId) {
    const current = latestEntriesRef.current;
    const isSelected = current.some(
      (entry) => isPreset(entry) && entry.id === id,
    );
    const next: OpenToEntry[] = isSelected
      ? current.filter((entry) => !(isPreset(entry) && entry.id === id))
      : [...current, { kind: "preset", id }];
    latestEntriesRef.current = next;
    onChange(next);
  }

  function addCustom(label: string) {
    // Don't let someone re-type a preset's words as a custom: the preset is the
    // filterable one, so the duplicate would only ever lose them reach.
    const asPreset = OPEN_TO_PRESETS.find(
      (preset) => t(preset.labelKey).toLowerCase() === label.toLowerCase(),
    );
    if (asPreset) {
      const current = latestEntriesRef.current;
      const isSelected = current.some(
        (entry) => isPreset(entry) && entry.id === asPreset.id,
      );
      if (!isSelected) togglePreset(asPreset.id);
      return;
    }
    const current = latestEntriesRef.current;
    const exists = current.some(
      (entry) =>
        entry.kind === "custom" &&
        entry.label.toLowerCase() === label.toLowerCase(),
    );
    if (!exists) {
      const next: OpenToEntry[] = [...current, { kind: "custom", label }];
      latestEntriesRef.current = next;
      onChange(next);
    }
  }

  function removeCustom(label: string) {
    onChange(
      entries.filter(
        (entry) => !(entry.kind === "custom" && entry.label === label),
      ),
    );
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

      <TagPicker
        tags={customLabels}
        onAdd={addCustom}
        onRemove={removeCustom}
        labels={{
          input: t("members:profileEdit.openTo.addLabel"),
          placeholder: t("members:profileEdit.openTo.addPlaceholder"),
          remove: (label) =>
            t("members:profileEdit.openTo.removeLabel", { label }),
        }}
      />
    </div>
  );
}
