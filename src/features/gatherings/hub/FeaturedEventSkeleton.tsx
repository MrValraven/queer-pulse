import { SkeletonLine } from "../../../shared/components/ui";
import styles from "./FeaturedEventCard.module.css";

/** The shimmer blocks fill their box edge to edge, like the cover they hold. */
const FILL_STYLE = { position: "absolute", inset: 0, borderRadius: 0 } as const;

/** A title bar about as tall as the poster title's capitals and descenders. */
const TITLE_BAR_HEIGHT = "calc(var(--hero-title-size) * 0.8)";

/** The printed hero stamp: month and weekday at 12px, the numeral at 46px and
 *  two 5px gaps, every part at a line height of 1. */
const PAPER_STAMP_HEIGHT = 80;

/** The price pill, the tallest item on the facts row. */
const FACTS_ROW_HEIGHT = 28;

/** A `size="lg"` button: 15px padding above and below a 16px label. */
const BUTTON_HEIGHT = 46;

/**
 * Holds the "Next up" hero's place while the events list loads. It wears the
 * hero's own stage, card, media and body classes, so the cover follows the
 * same per-width height (or its height floor side by side), and each line
 * sits in a slot as tall as the copy it stands in for (see the skeleton slots
 * in the stylesheet), so the view below does not jump when the real hero
 * lands. The shimmer comes from `SkeletonLine`, which already honours reduced
 * motion. Hidden from assistive tech: it carries no content.
 */
export function FeaturedEventSkeleton() {
  return (
    <div className={styles.stage} aria-hidden>
      <div className="wrap">
        <div className={styles.card}>
          <div className={styles.media}>
            <SkeletonLine width="100%" height="100%" style={FILL_STYLE} />
          </div>
          <div className={styles.body}>
            <div className={styles.paperStamp}>
              <SkeletonLine width={52} height={PAPER_STAMP_HEIGHT} />
            </div>
            <div className={`${styles.heading} ${styles.skeletonHeading}`}>
              <div className={styles.skeletonEyebrow}>
                <SkeletonLine width={72} height={12} />
              </div>
              <div className={styles.skeletonTitle}>
                <SkeletonLine width="92%" height={TITLE_BAR_HEIGHT} />
                <div className={styles.skeletonTitleWrap}>
                  <SkeletonLine width="64%" height={TITLE_BAR_HEIGHT} />
                </div>
              </div>
            </div>
            <div className={styles.skeletonWhen}>
              <SkeletonLine width="78%" height={14} />
            </div>
            <div className={styles.skeletonGoing}>
              <SkeletonLine width={84} height={13} />
            </div>
            <SkeletonLine width="58%" height={FACTS_ROW_HEIGHT} />
            <div className={styles.actions}>
              <SkeletonLine width={148} height={BUTTON_HEIGHT} />
              <SkeletonLine width={120} height={BUTTON_HEIGHT} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
