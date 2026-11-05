import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MadeTogetherScrollDirection } from "./useMadeTogetherScroll";
import styles from "./MadeTogetherStripControls.module.css";

interface MadeTogetherArrowsProps {
  canScrollPrevious: boolean;
  canScrollNext: boolean;
  onScrollPage: (direction: MadeTogetherScrollDirection) => void;
}

/** Previous and next buttons, 48px circles. Shown from --lg-up; below it the
 *  strip scrolls by touch and the dots show the position. */
export function MadeTogetherArrows({
  canScrollPrevious,
  canScrollNext,
  onScrollPage,
}: MadeTogetherArrowsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.arrows}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrevious}`}
        aria-label={t("subprofiles:directory.madeTogether.previous")}
        aria-disabled={!canScrollPrevious}
        onClick={() => {
          if (canScrollPrevious) onScrollPage("previous");
        }}
      >
        <FiChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        aria-label={t("subprofiles:directory.madeTogether.next")}
        aria-disabled={!canScrollNext}
        onClick={() => {
          if (canScrollNext) onScrollPage("next");
        }}
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}

interface MadeTogetherDotsProps {
  count: number;
  activeIndex: number;
}

/** Position dots under the phone strip. Decorative (`aria-hidden`): the
 *  cards stay reachable in order by touch and keyboard. Hidden from --lg-up,
 *  where the arrows take over. */
export function MadeTogetherDots({
  count,
  activeIndex,
}: MadeTogetherDotsProps) {
  if (count < 2) return null;
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={index === activeIndex ? styles.dotActive : styles.dot}
        />
      ))}
    </div>
  );
}
