import { ImageSlot } from "../../shared/components/ui";
import type { Slide } from "./data/decks";
import styles from "./DeckSlides.module.css";

type ImageSlideModel = Extract<Slide, { layout: "image" }>;

export function ImageSlide({ slide }: { slide: ImageSlideModel }) {
  return (
    <div className={`${styles.slide} ${styles.imageSlide}`}>
      <ImageSlot
        src={slide.src}
        alt={slide.alt}
        tint={slide.tint === "auth" ? "plum" : slide.tint}
        radius={0}
        height="100%"
        placeholder={slide.alt}
      />
      {slide.overlay && (
        <div className={styles.imageOverlay}>{slide.overlay}</div>
      )}
      {slide.caption && <div className={styles.caption}>{slide.caption}</div>}
    </div>
  );
}
