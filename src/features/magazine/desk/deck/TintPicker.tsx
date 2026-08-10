import type { AvatarTint } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./TintPicker.module.css";

/**
 * The 4 "identity" tints a slide's swatch picker offers — the design's
 * plum/coral/jade/violet row. The repo's `AvatarTint` vocabulary (which the
 * reader's `DeckSlides.module.css` `tint-${slide.tint}` backdrops are keyed
 * on) has no `"violet"` member; `"auth"` — labelled "Solid" — is its closest
 * distinct option, so it fills the 4th swatch (styled with the local
 * `--desk-violet` accent). The neutral `"default"` wash from the old
 * `<select>` is intentionally dropped from the picker, matching the design's
 * 4-swatch row; a slide already set to `"default"` just shows no swatch
 * pressed until a new one is picked (existing behaviour is unaffected —
 * `"default"` is still a valid, renderable `AvatarTint`).
 */
const TINT_SWATCHES = ["plum", "coral", "jade", "auth"] as const satisfies readonly AvatarTint[];

const SWATCH_CLASS: Record<(typeof TINT_SWATCHES)[number], string> = {
  plum: styles.swPlum!,
  coral: styles.swCoral!,
  jade: styles.swJade!,
  auth: styles.swViolet!,
};

interface TintPickerProps {
  value: AvatarTint;
  onChange: (tint: AvatarTint) => void;
}

/** Shared swatch-button tint picker, appended to every layout whose `Slide`
 * member carries a `tint` field (image, stat, reveal). Patches immutably via
 * the caller's `onChange` — this component holds no state of its own. */
export function TintPicker({ value, onChange }: TintPickerProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.field}>
      <span className={styles.label}>{t("magazine:deck.editor.field.tint")}</span>
      <div
        className={styles.tints}
        role="group"
        aria-label={t("magazine:deck.editor.field.tint")}
      >
        {TINT_SWATCHES.map((tint) => (
          <button
            key={tint}
            type="button"
            className={`${styles.swatch} ${SWATCH_CLASS[tint]}`}
            aria-pressed={value === tint}
            aria-label={t(`magazine:deck.editor.tint.${tint}`)}
            onClick={() => onChange(tint)}
          />
        ))}
      </div>
    </div>
  );
}
