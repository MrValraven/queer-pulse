import { useId, useRef } from "react";
import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { CapacityStepper } from "./fields/CapacityStepper";
import {
  editCapacityProblem,
  isEditCapacityLowered,
} from "./manageGatheringState";
import { MAX_CAPACITY, MIN_CAPACITY } from "./steps/whoChapter.data";
import styles from "./FieldEditor.module.css";

/**
 * The capacity editor's body: a "No limit" switch first, then, while it is
 * off, the wizard's own `CapacityStepper` with the same range error and hints
 * `EditDetailsAudience` gives it.
 *
 * An empty stepper already means no limit, but nothing on screen said so, and
 * clearing a number field is a guess. The switch says it out loud, and while
 * it is on the stepper steps out of sight: a live-looking number field
 * reading "Max attendees" under an on switch asked for a number the host had
 * just said they did not want. One quiet line stands in its place, in the
 * same slot, so the dialog keeps its height.
 *
 * The switch is its own state, held by `GatheringFieldEditor` beside the save
 * gate. Deriving it from an empty draft flipped it on, and took the stepper
 * away, the moment a host backspaced their number to type a new one.
 */
export function FieldEditorCapacity({
  draft,
  openedWithCapacity,
  onChange,
  isUnlimited,
  onUnlimitedChange,
}: {
  draft: GatheringDetailsDraft;
  /** The saved capacity. A lower number gets the "keeps their spot" hint,
   *  and a legacy number outside the range still saves while unchanged. */
  openedWithCapacity: string;
  onChange: (capacity: string) => void;
  /** Whether the No limit switch is on. */
  isUnlimited: boolean;
  onUnlimitedChange: (isUnlimited: boolean) => void;
}) {
  const { t } = useTranslation();
  const switchId = useId();
  // The last number the host had, so turning No limit off returns it. Seeded
  // with the number the editor opened on and kept current on every change,
  // so it is right however the host got to the switch. Falls back to the
  // saved number, then to the stepper's own starting point.
  const lastNumberRef = useRef(draft.capacity.trim());
  const isOutOfRange =
    editCapacityProblem(draft, openedWithCapacity) === "outOfRange";
  // Same lines, in the same order, as the full modal's capacity field: what a
  // lower number means for people already going, then that the host holds a
  // spot. An out-of-range number shows its error alone.
  const hintLines = isOutOfRange
    ? []
    : [
        isEditCapacityLowered(draft, openedWithCapacity)
          ? t("gatherings:manage.editModal.capacityLowerHint")
          : null,
        t("gatherings:create.step3.capIncludesHostHint"),
      ].filter(Boolean);

  const changeNumber = (capacity: string) => {
    if (capacity.trim() !== "") lastNumberRef.current = capacity.trim();
    onChange(capacity);
  };

  const setUnlimited = (isNextUnlimited: boolean) => {
    onUnlimitedChange(isNextUnlimited);
    onChange(
      isNextUnlimited
        ? ""
        : lastNumberRef.current ||
            openedWithCapacity.trim() ||
            String(MIN_CAPACITY),
    );
  };

  return (
    <>
      <div className={styles.switchRow}>
        <label htmlFor={switchId} className={styles.switchLabel}>
          {t("gatherings:manage.details.capacityUnlimited")}
        </label>
        <Toggle
          id={switchId}
          checked={isUnlimited}
          onChange={setUnlimited}
          label={t("gatherings:manage.details.capacityUnlimited")}
        />
      </div>
      {/* Both stay mounted in one grid cell, so the cell is always as tall
          as the stepper and the dialog holds still when the switch flips.
          The one that is off is `inert` (out of the tab order and the
          accessibility tree) and hidden on screen by the CSS that keys off
          that attribute. Focus sits on the switch while it flips, and the
          switch never moves, so focus has nowhere to fall. */}
      <div className={styles.capacitySlot}>
        <p
          className={styles.unlimitedHint}
          inert={!isUnlimited}
          aria-hidden={!isUnlimited || undefined}
        >
          {t("gatherings:manage.fieldEditor.capacityUnlimitedHint")}
        </p>
        <div inert={isUnlimited} aria-hidden={isUnlimited || undefined}>
          <CapacityStepper
            className={styles.capacityField}
            label={t("gatherings:create.step3.capLabel")}
            value={draft.capacity}
            onChange={changeNumber}
            hint={hintLines.length > 0 ? hintLines.join(" ") : undefined}
            error={
              isOutOfRange
                ? t("gatherings:manage.editModal.capacityRangeError", {
                    min: MIN_CAPACITY,
                    max: MAX_CAPACITY,
                  })
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
