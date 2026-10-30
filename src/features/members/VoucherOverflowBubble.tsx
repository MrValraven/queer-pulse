import type { CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VoucherRoster.module.css";

/**
 * The final round bubble of the voucher face stack: "+7" for the vouchers that
 * did not fit. It has the diameter and ring of a face and toggles the full
 * roster, so it is a real `<button>` that names the whole count to a screen
 * reader ("Show all 12 vouchers").
 */
export function VoucherOverflowBubble({
  hiddenCount,
  totalCount,
  faceSize,
  faceOverlap,
  isOpen,
  rosterId,
  onToggle,
}: {
  /** Vouchers folded into the bubble. */
  hiddenCount: number;
  /** Every voucher, for the accessible name. */
  totalCount: number;
  /** Diameter of one face, in px. The bubble matches it. */
  faceSize: number;
  /** How far the bubble slides under the face before it, in px. */
  faceOverlap: number;
  isOpen: boolean;
  /** Id of the roster this button expands. */
  rosterId: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const bubbleStyle = {
    marginLeft: -faceOverlap,
    "--vouch-bubble-size": `${faceSize}px`,
  } as CSSProperties;
  return (
    <button
      type="button"
      className={styles.bubble}
      style={bubbleStyle}
      aria-expanded={isOpen}
      aria-controls={rosterId}
      aria-label={t("members:hero.vouch.showAll", { count: totalCount })}
      onClick={onToggle}
    >
      <span aria-hidden="true">+{hiddenCount}</span>
    </button>
  );
}
