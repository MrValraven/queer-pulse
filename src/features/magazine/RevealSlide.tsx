import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import styles from "./DeckSlides.module.css";

type RevealModel = Extract<Slide, { layout: "interactive"; kind: "reveal" }>;

export function RevealSlide({ slide }: { slide: RevealModel }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const tintClass = slide.tint ? styles[`tint-${slide.tint}`] ?? "" : "";
  return (
    <div className={`${styles.slide} ${styles.revealSlide} ${tintClass}`}>
      <div className={styles.revealPrompt}>{slide.prompt}</div>
      {revealed ? (
        <p className={styles.revealAnswer}>{slide.hidden}</p>
      ) : (
        <button
          type="button"
          className={styles.revealBtn}
          onClick={() => setRevealed(true)}
        >
          {t("magazine:deck.tapToReveal")}
        </button>
      )}
    </div>
  );
}
