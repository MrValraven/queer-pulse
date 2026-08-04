import type { Slide } from "./data/decks";
import styles from "./DeckSlides.module.css";

type TextSlideModel = Extract<Slide, { layout: "text" }>;

export function TextSlide({ slide }: { slide: TextSlideModel }) {
  const align = slide.align ?? "left";
  if (slide.pull) {
    return (
      <div className={`${styles.slide} ${styles.textSlide} ${styles.center}`}>
        <blockquote className={styles.pull}>{slide.pull}</blockquote>
      </div>
    );
  }
  return (
    <div className={`${styles.slide} ${styles.textSlide} ${styles[align]}`}>
      {slide.eyebrow && <div className={styles.eyebrow}>{slide.eyebrow}</div>}
      {slide.heading && <h2 className={styles.heading}>{slide.heading}</h2>}
      {slide.body && <p className={styles.body}>{slide.body}</p>}
    </div>
  );
}
