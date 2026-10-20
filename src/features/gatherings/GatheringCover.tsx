import { useState } from "react";
import {
  isPosterShaped,
  PosterAwareImageSlot,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringCover.module.css";

/** The banner box every cover reserves first: 2:1 against the column width. */
const BANNER_HEIGHT = "50cqi";

/**
 * A poster's frame: tall enough to show it whole at the column's full width,
 * capped so it never pushes the title and the RSVP below the fold.
 */
function posterHeight(posterAspect: number): string {
  const heightAtFullWidth = (100 / posterAspect).toFixed(3);
  return `min(${heightAtFullWidth}cqi, 560px, 75svh)`;
}

/**
 * The cover the host uploaded, at the top of the main column.
 *
 * A landscape cover fills a 2:1 banner the width of the column. A poster
 * (portrait or near-square) is never cropped: once the file loads and
 * measures as one, the frame grows to show it whole and large, up to the
 * smaller of 560px and three quarters of the viewport, with a blurred copy of
 * the poster filling the sides. The box reserves the banner height first and
 * animates to the poster's height, so the content below slides down smoothly;
 * a poster already in the browser's cache opens at its own height. The cover
 * loads eagerly at high priority because it is the page's above-the-fold hero
 * and the likely LCP element. A gathering with no cover renders nothing, and
 * the type row and title open the column. The radius rides in `style` because
 * `ImageSlot` writes its numeric `radius` inline and spreads `style` after it.
 */
export function GatheringCover({ gathering }: { gathering: GatheringDetail }) {
  const { t } = useTranslation();
  const [measuredPoster, setMeasuredPoster] = useState<{
    src: string;
    aspect: number;
  } | null>(null);
  const coverSrc = gathering.coverImageUrl;
  if (!coverSrc) return null;

  const posterAspect =
    measuredPoster?.src === coverSrc ? measuredPoster.aspect : null;

  return (
    <div className={styles.frame}>
      <PosterAwareImageSlot
        src={coverSrc}
        alt={t("gatherings:gathering.coverAlt", { title: gathering.title })}
        tint="plum"
        width="100%"
        height={
          posterAspect === null ? BANNER_HEIGHT : posterHeight(posterAspect)
        }
        className={styles.cover}
        style={{ borderRadius: "var(--radius-card)" }}
        loading="eager"
        fetchPriority="high"
        onNaturalSize={({ width, height }) => {
          if (isPosterShaped(width, height)) {
            setMeasuredPoster({ src: coverSrc, aspect: width / height });
          }
        }}
      />
    </div>
  );
}
