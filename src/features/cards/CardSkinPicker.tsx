import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CardSkin } from "./api/cards.api";
import { CARD_SKIN_OPTIONS } from "./cardDesigner.data";
import styles from "./CardDesignerModal.module.css";

// Depends on the CSS module import, so it stays in this file rather than a
// colocated .data.ts (see the repo's decomposition rule).
const SKIN_CLASS: Record<CardSkin, string | undefined> = {
  plum: styles.chipPlum,
  cream: styles.chipCream,
  jade: styles.chipJade,
  coral: styles.chipCoral,
  ink: styles.chipInk,
};

/**
 * The card style picker, as five miniature cards rather than five radio dots.
 *
 * A skin is a design decision about a physical-looking object, and a 20px
 * swatch cannot show how the chosen accent sits on it. Each chip renders the
 * real skin surface with the currently-chosen accent bar on it, so the
 * pairing an owner is about to commit to is visible before they commit.
 *
 * Semantics come from the shared `RadioCardGroup` primitive (radiogroup role,
 * roving tabindex, arrow-key selection); the look is entirely ours.
 */
export function CardSkinPicker({
  value,
  accentToken,
  onChange,
  labelledBy,
}: {
  value: CardSkin;
  /** Drawn onto every chip so the skin/accent pairing is visible in the picker. */
  accentToken: string;
  onChange: (skin: CardSkin) => void;
  /** id of the visible group label this picker sits under. */
  labelledBy: string;
}) {
  const { t } = useTranslation();

  return (
    <RadioCardGroup<CardSkin>
      value={value}
      onChange={onChange}
      ariaLabel={t("cards:designer.skinLabel")}
      ariaLabelledBy={labelledBy}
      className={styles.skins}
      optionClassName={styles.skinChip}
      checkedClassName={styles.skinChipOn}
      options={CARD_SKIN_OPTIONS.map((option) => ({
        id: option.value,
        render: (
          <>
            <span
              className={`${styles.chipFace} ${SKIN_CLASS[option.value]}`}
              style={{ ["--card-accent" as string]: `var(--${accentToken})` }}
              aria-hidden="true"
            >
              <span className={styles.chipBar} />
              <span className={styles.chipLines}>
                <span className={styles.chipLineWide} />
                <span className={styles.chipLineThin} />
              </span>
            </span>
            <span className={styles.chipLabel}>{t(option.labelKey)}</span>
          </>
        ),
      }))}
    />
  );
}
