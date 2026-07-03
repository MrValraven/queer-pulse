import { FiCheck, FiInstagram, FiLink, FiShare2 } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import styles from "./sustainer.module.css";

export interface Receipt {
  welcomeName: string;
  text: string;
  tier: string;
  billing: string;
  solid: string | null;
  ref: string;
  charged: string;
}

/** The animated "welcome aboard" success view with receipt + share. */
export function PaymentSuccess({
  receipt,
  onClose,
}: {
  receipt: Receipt;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const share = (kind: string) =>
    showToast(
      `Shared to ${kind} — thank you for spreading the word!`,
      "success",
    );

  return (
    <div className={styles.paySuccess}>
      <div className={styles.psCheck}>
        <FiCheck size={30} aria-hidden />
      </div>
      <div className={styles.psTitle}>
        Welcome, <em>{receipt.welcomeName}</em>
      </div>
      <div className={styles.psText}>{receipt.text}</div>

      <div className={styles.psShare}>
        <div className={styles.psShareLabel}>Help us grow — tell people</div>
        <div className={styles.psShareRow}>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label="Share your story"
            onClick={() => share("your story")}
          >
            <FiShare2 size={17} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label="Copy a link"
            onClick={() => share("a copied link")}
          >
            <FiLink size={17} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label="Post to your feed"
            onClick={() => share("your feed")}
          >
            <FiInstagram size={17} aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.psReceipt}>
        <div className={styles.psRrow}>
          <span>Membership</span>
          <strong>{receipt.tier}</strong>
        </div>
        <div className={styles.psRrow}>
          <span>Billing</span>
          <strong>{receipt.billing}</strong>
        </div>
        {receipt.solid && (
          <div className={styles.psRrow}>
            <span>Sponsored membership</span>
            <strong>+ {receipt.solid}</strong>
          </div>
        )}
        <div className={styles.psRrow}>
          <span>Reference</span>
          <strong>{receipt.ref}</strong>
        </div>
        <div className={`${styles.psRrow} ${styles.tot}`}>
          <span>Charged today</span>
          <strong>{receipt.charged}</strong>
        </div>
      </div>

      <div className={styles.psActions}>
        <Button
          variant="primary"
          onClick={() => showToast("Receipt downloaded (PDF).", "success")}
        >
          Download receipt
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Back to QueerPulse
        </Button>
      </div>
    </div>
  );
}
