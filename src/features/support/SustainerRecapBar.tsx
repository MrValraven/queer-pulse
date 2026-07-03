import { FiArrowRight } from "react-icons/fi";
import { FREQS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** Sticky bottom recap that follows the current selection while the tiers are
 * in view (hidden once someone is already a supporter or the modal is open). */
export function SustainerRecapBar({
  store,
  visible,
  onContinue,
}: {
  store: SustainerStore;
  visible: boolean;
  onContinue: () => void;
}) {
  const name =
    store.selectedName === "Custom" ? "Your contribution" : store.selectedName;
  const price = store.money(store.baseAmount) + FREQS[store.freq].short;

  return (
    <div className={`${styles.recapBar} ${visible ? styles.show : ""}`}>
      <div className={styles.recapInfo}>
        <strong>{name}</strong> · {price}
      </div>
      <button type="button" className={styles.recapBtn} onClick={onContinue}>
        Continue <FiArrowRight aria-hidden />
      </button>
    </div>
  );
}
