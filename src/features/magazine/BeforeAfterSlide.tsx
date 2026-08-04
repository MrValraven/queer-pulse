import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import styles from "./DeckSlides.module.css";

type BeforeAfterModel = Extract<Slide, { layout: "interactive"; kind: "before-after" }>;

export function BeforeAfterSlide({ slide }: { slide: BeforeAfterModel }) {
  const { t } = useTranslation();
  const [pct, setPct] = useState(50);
  return (
    <div className={`${styles.slide} ${styles.beforeAfter}`}>
      <div className={styles.baStage}>
        <img className={styles.baImg} src={slide.before.src} alt={slide.before.alt} />
        <div className={styles.baClip} style={{ width: `${pct}%` }}>
          <img className={styles.baImg} src={slide.after.src} alt={slide.after.alt} />
        </div>
        <span className={`${styles.baLabel} ${styles.baLabelLeft}`}>{slide.after.label}</span>
        <span className={`${styles.baLabel} ${styles.baLabelRight}`}>{slide.before.label}</span>
        <input
          className={styles.baRange}
          type="range"
          min={0}
          max={100}
          value={pct}
          aria-label={t("magazine:deck.beforeAfterHint")}
          onChange={(event) => setPct(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
