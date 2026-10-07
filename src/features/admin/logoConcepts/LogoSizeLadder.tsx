import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  logoAssetPath,
  type LogoColorway,
  type LogoConceptId,
} from "./logoConcepts.data";
import styles from "./LogoConcepts.module.css";

/** The avatar sizes a mark has to survive, largest first: a profile header,
 *  a feed avatar, a comment avatar and a favicon. */
const LADDER_SIZES = [96, 48, 32, 24] as const;

/** Crops at or below this edge use the small cut when the concept has one. */
const SMALL_CUT_MAX_SIZE = 32;

/**
 * One concept in one colourway as the circle crops social platforms and
 * browser tabs will show, each labelled with its pixel size. A concept with a
 * small cut shows it at 32px and 24px, the sizes it was drawn for. The crops
 * repeat the hero image, so they are decorative (`alt=""`).
 */
export function LogoSizeLadder({
  conceptId,
  colorway,
  hasSmallCut,
}: {
  conceptId: LogoConceptId;
  colorway: LogoColorway;
  hasSmallCut: boolean;
}) {
  const { t } = useTranslation();
  const labelId = useId();

  function assetPathFor(size: number): string {
    const shouldUseSmallCut = hasSmallCut && size <= SMALL_CUT_MAX_SIZE;
    return logoAssetPath(
      conceptId,
      colorway,
      shouldUseSmallCut ? "small" : "full",
    );
  }

  return (
    <div className={styles.ladder}>
      <p id={labelId} className={styles.sectionLabel}>
        {t("admin:logoConcepts.card.sizesLabel")}
      </p>
      <ul className={styles.ladderList} aria-labelledby={labelId}>
        {LADDER_SIZES.map((size) => (
          <li key={size} className={styles.ladderItem}>
            <img
              className={styles.ladderCrop}
              data-colorway={colorway}
              src={assetPathFor(size)}
              width={size}
              height={size}
              alt=""
              decoding="async"
            />
            <span className={styles.ladderSize}>
              {t("admin:logoConcepts.card.sizePx", { size })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
