import { FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MembershipCardFace.module.css";

/**
 * The disc cluster in a card's bottom-right corner: turn it over, and — where
 * the card sits behind a discreet gate — put it away again.
 *
 * It is mounted OUTSIDE the flipper on purpose, which is what lets one cluster
 * serve both faces: inside, the discs would rotate with the card and land
 * mirrored on the back. That is also why each disc carries its own fixed
 * plate rather than inheriting either face's ink.
 *
 * Hide first, flip last. The flip stays in the corner a holder already knows
 * it by, and the control that puts an LGBTQ+ affiliation away is the one
 * nearer the middle of the card, where a thumb reaching in a hurry is least
 * likely to miss it.
 */
export function CardFaceControls({
  flipperId,
  isFlipped,
  onFlip,
  onHide,
}: {
  flipperId: string;
  isFlipped: boolean;
  onFlip: () => void;
  /** Omitted by the designer preview and the issuer's read-only view, which
      have no gate to close. */
  onHide?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      {onHide && (
        <IconButton
          className={styles.cardControl}
          tone="dark"
          size="sm"
          aria-label={t("cards:discreet.hideAria")}
          onClick={onHide}
        >
          <FiEyeOff aria-hidden="true" />
        </IconButton>
      )}
      <IconButton
        className={styles.cardControl}
        tone="dark"
        size="sm"
        aria-controls={flipperId}
        // The name carries the state, rather than `aria-pressed`: this is a
        // toggle between two equal sides, not a control that is on or off.
        aria-label={t(
          isFlipped ? "cards:face.flipToFront" : "cards:face.flipToBack",
        )}
        onClick={onFlip}
      >
        <FiRefreshCw aria-hidden="true" />
      </IconButton>
    </div>
  );
}
