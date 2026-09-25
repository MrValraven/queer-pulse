import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { statTarget, type Slide } from "./data/decks";
import styles from "./DeckSlides.module.css";

type StatSlideModel = Extract<Slide, { layout: "stat" }>;

export function StatSlide({
  slide,
  active,
}: {
  slide: StatSlideModel;
  active: boolean;
}) {
  const target = statTarget(slide.value);
  // The reveal starts from the authored value with its number at zero, so any
  // non-numeric adornment (e.g. "×3", "1.2k") stays put while the digits roll.
  const startValue = slide.value.replace(String(target), "0");
  const tintClass = styles[`tint-${slide.tint}`] ?? "";
  return (
    <div className={`${styles.slide} ${styles.statSlide} ${tintClass}`}>
      <div className={styles.statValue} aria-hidden>
        <RollingNumber
          value={slide.value}
          numericValue={target}
          revealFrom={{ value: startValue, numericValue: 0 }}
          isRevealed={active}
        />
        {slide.unit && <span className={styles.statUnit}>{slide.unit}</span>}
      </div>
      <div className={styles.statLabel}>{slide.label}</div>
      {slide.source && <div className={styles.statSource}>{slide.source}</div>}
    </div>
  );
}
