import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DiscreetGate.module.css";

/**
 * Keeps a membership card covered until its holder deliberately reveals it.
 *
 * A card names an LGBTQ+ community, so someone glancing at a phone should see
 * a neutral panel rather than an affiliation. Three things re-cover it: the
 * quick-hide control, Escape, and the tab losing visibility. That last one
 * matters most, since a phone handed over or set down is the realistic case.
 *
 * The children are UNMOUNTED while covered, so the card's QR is not merely
 * hidden by CSS: nothing renders, and `useCardToken` stops minting.
 *
 * `isRevealed` is optionally CONTROLLED: pass it when several gates on the
 * same screen must be mutually exclusive (see `MyCardsPage`, which lifts one
 * `revealedCardId` above all its gates so revealing card B genuinely
 * re-covers card A, rather than each gate tracking its own flag and going
 * out of sync with the parent's). Omit it and the gate manages its own
 * state, unchanged from before.
 */
export function DiscreetGate({
  children,
  isRevealed: controlledIsRevealed,
  onVisibilityChange,
}: {
  children: ReactNode;
  isRevealed?: boolean;
  onVisibilityChange?: (isRevealed: boolean) => void;
}) {
  const { t } = useTranslation();
  const [uncontrolledIsRevealed, setUncontrolledIsRevealed] = useState(false);
  const isRevealed = controlledIsRevealed ?? uncontrolledIsRevealed;

  const setRevealed = useCallback(
    (next: boolean) => {
      setUncontrolledIsRevealed(next);
      onVisibilityChange?.(next);
    },
    [onVisibilityChange],
  );

  useEffect(() => {
    if (!isRevealed) return;

    const cover = () => setRevealed(false);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") cover();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cover();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isRevealed, setRevealed]);

  if (!isRevealed) {
    return (
      <div className={styles.cover}>
        <FiLock className={styles.coverIcon} aria-hidden="true" />
        <p className={styles.coverTitle}>{t("cards:discreet.title")}</p>
        <p className={styles.coverBody}>{t("cards:discreet.body")}</p>
        <Button
          variant="primary"
          onClick={() => setRevealed(true)}
          aria-label={t("cards:discreet.showAria")}
        >
          <FiEye aria-hidden="true" /> {t("cards:discreet.show")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.revealed}>
      {children}
      <Button
        variant="ghost"
        onClick={() => setRevealed(false)}
        aria-label={t("cards:discreet.hideAria")}
      >
        <FiEyeOff aria-hidden="true" /> {t("cards:discreet.hide")}
      </Button>
    </div>
  );
}
