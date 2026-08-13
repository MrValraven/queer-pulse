import type { MouseEvent as ReactMouseEvent } from "react";
import type { ArticleImageBlock, ArticleImageCrop, ArticleImageTint } from "../../api/pieces.api";
import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { RichText } from "./RichText";
import styles from "./ImageBlockControls.module.css";

export interface ImageBlockControlsProps {
  block: ArticleImageBlock;
  /** Always the FULL next block — every handler below spreads `block`. */
  onChange: (next: ArticleImageBlock) => void;
}

// Rights values, translated at render via `magazine:write.image.rights.<value>`.
const RIGHTS_VALUES: Array<ArticleImageBlock["rights"]> = [
  "commissioned",
  "licensed",
  "courtesy",
  "cc",
];

const TINTS: ArticleImageTint[] = ["coral", "jade", "plum", "violet"];
const CROPS: ArticleImageCrop[] = ["16:9", "4:5", "1:1"];

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Every image-specific control for an `ArticleImageBlock`: alt text and
 * credit (both REQUIRED — publishing gates on them, see the Task 8 publish
 * checklist), caption, rights, a tint swatch row, a crop segmented control,
 * and a click-to-set focal-point picker. Ported from the design prototype's
 * `.row2`/`.cropbar`/`.focal`. Every handler patches the block immutably.
 */
export function ImageBlockControls({ block, onChange }: ImageBlockControlsProps) {
  const { t } = useTranslation();
  const altMissing = block.alt.trim() === "";
  const creditMissing = block.credit.trim() === "";

  function handleFocalClick(event: ReactMouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    // A keyboard-triggered click carries no real pointer position
    // (`detail` is 0 for those) — fall back to the centre point instead of
    // pinning the focal point to the top-left corner.
    const isKeyboardActivation = event.detail === 0;
    const x = isKeyboardActivation
      ? 0.5
      : clampFraction((event.clientX - rect.left) / rect.width);
    const y = isKeyboardActivation
      ? 0.5
      : clampFraction((event.clientY - rect.top) / rect.height);
    onChange({ ...block, focal: { x, y } });
  }

  return (
    <div className={styles.controls}>
      <div className={styles.row2}>
        <FormField
          label={t("magazine:write.image.altLabel")}
          required
          error={altMissing ? t("magazine:write.image.altError") : undefined}
        >
          <input
            type="text"
            value={block.alt}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
          />
        </FormField>

        <div className={styles.field}>
          <span className={styles.label}>{t("magazine:write.image.tintLabel")}</span>
          <div className={styles.swatches}>
            {TINTS.map((tint) => (
              <button
                key={tint}
                type="button"
                className={`${styles.swatch} ${styles[`swatch${capitalize(tint)}`]}`}
                aria-pressed={block.tint === tint}
                aria-label={t("magazine:write.image.tintAria", {
                  tint: t(`magazine:write.image.tint.${tint}`),
                })}
                onClick={() => onChange({ ...block, tint })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row2}>
        <FormField
          label={t("magazine:write.image.creditLabel")}
          required
          error={creditMissing ? t("magazine:write.image.creditError") : undefined}
        >
          <input
            type="text"
            value={block.credit}
            onChange={(event) => onChange({ ...block, credit: event.target.value })}
          />
        </FormField>

        <FormField label={t("magazine:write.image.rightsLabel")}>
          <Select
            value={block.rights}
            onChange={(value) =>
              onChange({ ...block, rights: value as ArticleImageBlock["rights"] })
            }
            options={RIGHTS_VALUES.map((value) => ({
              value,
              label: t(`magazine:write.image.rights.${value}`),
            }))}
          />
        </FormField>
      </div>

      <div className={styles.cropbar}>
        <div className={styles.crop} role="group" aria-label={t("magazine:write.image.cropAria")}>
          {CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              className={styles.cropBtn}
              aria-pressed={block.crop === crop}
              onClick={() => onChange({ ...block, crop })}
            >
              {crop}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.focal}
          onClick={handleFocalClick}
          aria-label={t("magazine:write.image.focalAria", {
            x: Math.round(block.focal.x * 100),
            y: Math.round(block.focal.y * 100),
          })}
        >
          <i
            className={styles.focalDot}
            style={{ left: `${block.focal.x * 100}%`, top: `${block.focal.y * 100}%` }}
            aria-hidden="true"
          />
        </button>
      </div>

      <RichText
        html={block.caption}
        placeholder={t("magazine:write.image.captionPlaceholder")}
        className={styles.caption}
        onChange={(caption) => onChange({ ...block, caption })}
      />
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
