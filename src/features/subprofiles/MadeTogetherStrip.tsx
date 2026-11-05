import { useId, useState } from "react";
import { Collapse } from "../../shared/components/ui/Collapse";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMadeTogether } from "./api/useMadeTogether";
import { MadeTogetherCard } from "./MadeTogetherCard";
import {
  MadeTogetherArrows,
  MadeTogetherDots,
} from "./MadeTogetherStripControls";
import { useMadeTogetherScroll } from "./useMadeTogetherScroll";
import styles from "./MadeTogetherStrip.module.css";

/** How many placeholder cards the loading state draws. */
const SKELETON_CARD_COUNT = 3;

/** The loading state: the heading, lead and cards as grey shapes at the real
 *  sizes, so the strip arriving shifts nothing. */
function MadeTogetherSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.section}
      role="status"
      aria-busy="true"
      aria-label={t("subprofiles:directory.madeTogether.loading")}
    >
      <div className={styles.header}>
        <div className={styles.heading}>
          <SkeletonLine width="min(16rem, 70%)" height={36} />
          <SkeletonLine width="min(36rem, 100%)" height={16} />
        </div>
      </div>
      <div className={styles.skeletonTrack} aria-hidden="true">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <SkeletonLine width="70%" height={40} />
            <SkeletonLine width="100%" height={132} />
            <SkeletonLine width="60%" height={20} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The directory's "Made together" strip: a horizontally scrolling row of
 * recent work where two personas credited each other. It has no required
 * props and renders nothing on a failure or when nobody has credited anyone.
 * While loading it shows a skeleton, and the real strip folds open in its
 * place. Scrolls by touch (snap + dots) and by the arrows from --lg-up.
 */
export function MadeTogetherStrip() {
  const { t } = useTranslation();
  const headingId = useId();
  const { cards, isLoading } = useMadeTogether();
  const {
    trackRef,
    activeIndex,
    canScrollPrevious,
    canScrollNext,
    scrollPage,
  } = useMadeTogetherScroll(cards.length);
  // Stays mounted until the skeleton has finished folding away, so an empty
  // or failed load closes smoothly instead of vanishing.
  const [isSkeletonSettled, setIsSkeletonSettled] = useState(!isLoading);
  const hasCards = cards.length > 0;
  if (!isLoading && !hasCards && isSkeletonSettled) return null;

  return (
    <div className={styles.root}>
      <Collapse
        isOpen={isLoading}
        onExitComplete={() => setIsSkeletonSettled(true)}
      >
        <MadeTogetherSkeleton />
      </Collapse>
      <Collapse isOpen={hasCards && !isLoading}>
        <section className={styles.section} aria-labelledby={headingId}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <h2 id={headingId} className={styles.title}>
                {t("subprofiles:directory.madeTogether.title")}
              </h2>
              <p className={styles.lead}>
                {t("subprofiles:directory.madeTogether.lead")}
              </p>
            </div>
            <MadeTogetherArrows
              canScrollPrevious={canScrollPrevious}
              canScrollNext={canScrollNext}
              onScrollPage={scrollPage}
            />
          </div>
          <ul ref={trackRef} className={styles.track}>
            {cards.map((card) => (
              <li key={card.key} className={styles.item}>
                <MadeTogetherCard card={card} />
              </li>
            ))}
          </ul>
          <MadeTogetherDots count={cards.length} activeIndex={activeIndex} />
        </section>
      </Collapse>
    </div>
  );
}
