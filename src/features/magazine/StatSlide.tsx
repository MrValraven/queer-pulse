import { useCountUp } from "../../shared/hooks";
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
  const count = useCountUp(target, { active });
  // Preserve any non-numeric adornment in the authored value (e.g. "×3", "1.2k").
  const rendered = slide.value.replace(
    String(target),
    String(Math.round(count)),
  );
  const tintClass = styles[`tint-${slide.tint}`] ?? "";
  return (
    <div className={`${styles.slide} ${styles.statSlide} ${tintClass}`}>
      <div className={styles.statValue} aria-hidden>
        {rendered}
        {slide.unit && <span className={styles.statUnit}>{slide.unit}</span>}
      </div>
      <div className={styles.statLabel}>{slide.label}</div>
      {slide.source && <div className={styles.statSource}>{slide.source}</div>}
    </div>
  );
}
