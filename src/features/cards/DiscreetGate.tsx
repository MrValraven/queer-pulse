import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FiEye, FiLock } from "react-icons/fi";
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
 * hidden by CSS: nothing renders at all.
 *
 * What this gate protects is the SCREEN. It no longer keeps the code out of
 * memory, because the code is a permanent property of the card and arrives
 * with it from `/me/cards` rather than being minted while the card is on
 * show. That is inherent to a code that also has to survive being printed on
 * a physical card, and it is why the card's real defence against being
 * copied is the name and face on it being checked at the door.
 *
 * `children` is a FUNCTION, handed the quick-hide. The gate used to draw that
 * control itself, as a button stacked under the card, which left the control
 * a holder reaches for most sitting a full row away from the object it acts
 * on. Handing it down instead lets the card mount it in its own corner
 * cluster beside the flip (see `MembershipCardFace`), where a thumb already
 * is. The gate still OWNS the covering and only delegates where the control
 * is drawn, so whatever renders the children owes its holder a way to invoke
 * this: Escape and a backgrounded tab are not reachable on a phone.
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
  children: (hide: () => void) => ReactNode;
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

  const cover = useCallback(() => setRevealed(false), [setRevealed]);

  useEffect(() => {
    if (!isRevealed) return;

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
  }, [isRevealed, cover]);

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

  return <div className={styles.revealed}>{children(cover)}</div>;
}
