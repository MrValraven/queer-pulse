import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishMode } from "./stickerBuilder.types";
import styles from "./StickerPublishModeControl.module.css";

const PUBLISH_MODE_OPTIONS: ReadonlyArray<{
  mode: PublishMode;
  labelKey: string;
  shortLabelKey: string;
}> = [
  {
    mode: "add-missing",
    labelKey: "admin:stickerPacks.publish.mode.addMissing",
    shortLabelKey: "admin:stickerPacks.publish.mode.addMissingShort",
  },
  {
    mode: "replace",
    labelKey: "admin:stickerPacks.publish.mode.replace",
    shortLabelKey: "admin:stickerPacks.publish.mode.replaceShort",
  },
];

/**
 * The "Add missing only / Replace existing" choice, as a segmented radio
 * group. The publish bar only mounts it when the selection overlaps the pack,
 * so the legend can name how many selected items are already in it: that is
 * the one fact the admin needs to pick a mode.
 *
 * Native radios on purpose: arrow keys move between the two options and the
 * group reads as one choice to a screen reader, with no roving tabindex to
 * maintain by hand. The inputs are visually hidden and each label is the
 * pill, carrying the checked and focus styles.
 *
 * The control keeps to one row in the dock at every width, so the dock stays
 * short. The visible legend is the short one ("3 already in pack"), and the
 * full sentence names the group for screen readers. Phones also show short
 * option labels ("Replace"), with the full label read out beside them. The
 * `data-publish-mode-control` hook tells the publish bar's stylesheet that
 * the legend already says why the CTA may be off.
 */
export function StickerPublishModeControl({
  mode,
  onModeChange,
  inPackCount,
}: {
  mode: PublishMode;
  onModeChange: (mode: PublishMode) => void;
  /** How many selected items already have a sticker in the pack. */
  inPackCount: number;
}) {
  const { t } = useTranslation();
  const groupName = useId();

  return (
    <fieldset className={styles.control} data-publish-mode-control>
      <legend className={styles.legend}>
        <span className="visuallyHidden">
          {t("admin:stickerPacks.publish.mode.itemsLegend", {
            count: inPackCount,
          })}
        </span>
        <span aria-hidden="true">
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
            <span className={styles.labelFull}>{t(option.labelKey)}</span>
            <span className={styles.labelShort} aria-hidden="true">
              {t(option.shortLabelKey)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
