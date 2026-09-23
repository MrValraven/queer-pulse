import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishMode } from "./stickerBuilder.types";
import styles from "./StickerPublishModeControl.module.css";

const PUBLISH_MODE_OPTIONS: ReadonlyArray<{
  mode: PublishMode;
  labelKey: string;
}> = [
  {
    mode: "add-missing",
    labelKey: "admin:stickerPacks.publish.mode.addMissing",
  },
  { mode: "replace", labelKey: "admin:stickerPacks.publish.mode.replace" },
];

/**
 * The "Add missing only / Replace existing" choice, as a segmented radio
 * group. The publish bar only mounts it when the selection overlaps the pack,
 * so the legend can name how many selected flags are already in it: that is
 * the one fact the admin needs to pick a mode.
 *
 * Native radios on purpose: arrow keys move between the two options and the
 * group reads as one choice to a screen reader, with no roving tabindex to
 * maintain by hand. The inputs are visually hidden and the pill beside each
 * one carries the checked and focus styles.
 *
 * Phones get a short legend ("3 already in pack") that fits on one line, so
 * the control stays short in the dock; CSS shows one legend text per width.
 */
export function StickerPublishModeControl({
  mode,
  onModeChange,
  inPackCount,
}: {
  mode: PublishMode;
  onModeChange: (mode: PublishMode) => void;
  /** How many selected flags already have a sticker in the pack. */
  inPackCount: number;
}) {
  const { t } = useTranslation();
  const groupName = useId();

  return (
    <fieldset className={styles.control}>
      <legend className={styles.legend}>
        <span className={styles.legendFull}>
          {t("admin:stickerPacks.publish.mode.legend", { count: inPackCount })}
        </span>
        <span className={styles.legendShort}>
          {t("admin:stickerPacks.publish.mode.legendShort", {
            count: inPackCount,
          })}
        </span>
      </legend>
      <div className={styles.segments}>
        {PUBLISH_MODE_OPTIONS.map((option) => (
          <label key={option.mode} className={styles.segment}>
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={option.mode}
              checked={mode === option.mode}
              onChange={() => onModeChange(option.mode)}
            />
            <span className={styles.pill}>{t(option.labelKey)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
