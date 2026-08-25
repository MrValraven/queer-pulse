import { useRef, type KeyboardEvent } from "react";
import {
  getPersonas,
  getDeckCards,
  type PersonaKey,
} from "./personasShowcase.data";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PersonasShowcase.module.css";

const avTintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

const visClass: Record<string, string | undefined> = {
  open: styles.visOpen,
  net: styles.visNet,
  priv: styles.visPriv,
};

/** Three fanned persona cards. Click, or arrow-left/right while one is
 * focused, brings a card upright and to the front. */
export function PersonaDeck({
  selectedKey,
  onSelect,
}: {
  selectedKey: PersonaKey;
  onSelect: (key: PersonaKey) => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { t } = useTranslation();
  const personas = getPersonas(t);
  const deckCards = getDeckCards(t);

  const onCardKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + delta + deckCards.length) % deckCards.length;
    const nextCard = deckCards[nextIndex]!;
    onSelect(nextCard.key);
    cardRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={
        reduceMotion ? `${styles.deck} ${styles.deckStill}` : styles.deck
      }
    >
      {deckCards.map((card, index) => {
        const persona = personas[card.key];
        const isSelected = card.key === selectedKey;
        return (
          <button
            key={card.key}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            type="button"
            className={
              isSelected ? `${styles.pcard} ${styles.pcardOn}` : styles.pcard
            }
            aria-pressed={isSelected}
            onClick={() => onSelect(card.key)}
            onKeyDown={(event) => onCardKeyDown(event, index)}
          >
            <span className={styles.pcSkin}>{card.skinLabel}</span>
            <span className={`${styles.pcAv} ${avTintClass[persona.tint]}`}>
              {persona.initials}
            </span>
            <span
              className={
                persona.nameCaps
                  ? `${styles.pcName} ${styles.pcNameCaps}`
                  : styles.pcName
              }
            >
              {persona.name}
            </span>
            <span className={styles.pcTag}>{card.tag}</span>
            <span className={styles.pcFoot}>
              <span className={`${styles.vis} ${visClass[card.visVariant]}`}>
                {card.visLabel}
              </span>
              <span className={styles.pcShows}>{card.showsLine}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
