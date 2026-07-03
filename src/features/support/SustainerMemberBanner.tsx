import { FiStar } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** Next monthly payment date, one month out, formatted like "3 August 2026". */
function nextPaymentDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Green "you're a supporting member" banner, shown once someone has joined. */
export function SustainerMemberBanner({
  store,
  onChangeAmount,
}: {
  store: SustainerStore;
  onChangeAmount: () => void;
}) {
  const { showToast } = useToast();
  const m = store.supporter;
  if (!m) return null;

  return (
    <div className={styles.memberBanner}>
      <div className={styles.mbIcon}>
        <FiStar size={26} aria-hidden />
      </div>
      <div className={styles.mbBody}>
        <div className={styles.mbLabel}>You're a supporting member</div>
        <div className={styles.mbTitle}>
          {m.tier} · {m.price} {m.per}
        </div>
        <div className={styles.mbMeta}>
          Next payment {nextPaymentDate()} · Sustainer badge active
        </div>
      </div>
      <div className={styles.mbActions}>
        <button
          type="button"
          className={`${styles.mbBtn} ${styles.solid}`}
          onClick={onChangeAmount}
        >
          Change amount
        </button>
        <button
          type="button"
          className={styles.mbBtn}
          onClick={() => showToast("Receipts emailed to you.", "info")}
        >
          Receipts
        </button>
        <button
          type="button"
          className={styles.mbBtn}
          onClick={() => {
            store.cancelMembership();
            showToast(
              "Membership cancelled. Your badge stays until the period ends.",
              "info",
            );
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
