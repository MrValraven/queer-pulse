import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DeckPage.module.css";

interface DeckControlsProps {
  current: number;
  total: number;
  onGo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function DeckControls({ current, total, onGo, onPrev, onNext }: DeckControlsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.arrow} onClick={onPrev}
        disabled={current === 0} aria-label={t("magazine:deck.prev")}><FiChevronLeft aria-hidden /></button>
      <div className={styles.dots} role="tablist">
        {Array.from({ length: total }, (_, index) => (
          <button key={index} type="button" role="tab"
            aria-selected={index === current}
            aria-label={t("magazine:deck.goToSlide", { n: index + 1 })}
            className={`${styles.dot} ${index === current ? styles.dotOn : ""}`}
            onClick={() => onGo(index)} />
        ))}
      </div>
      <span className={styles.counter}>
        {t("magazine:deck.slideCounter", { current: current + 1, total })}
      </span>
      <button type="button" className={styles.arrow} onClick={onNext}
        disabled={current === total - 1} aria-label={t("magazine:deck.next")}><FiChevronRight aria-hidden /></button>
    </div>
  );
}
