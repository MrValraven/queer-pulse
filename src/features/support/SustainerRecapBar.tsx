import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FREQS, TIER_LABEL_KEYS } from "./sustainer.pricing";
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
  const { t } = useTranslation();
  const name =
    store.selectedName === "Custom"
      ? t("support:recap.customName")
      : t(TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS]);
  const short = FREQS[store.freq].short ?? t(FREQS[store.freq].shortKey!);
  const price = store.money(store.baseAmount) + short;

  return (
    <div className={`${styles.recapBar} ${visible ? styles.show : ""}`}>
      <div className={styles.recapInfo}>
        <strong>{name}</strong> · {price}
      </div>
      <button type="button" className={styles.recapBtn} onClick={onContinue}>
        {t("support:recap.continueCta")} <FiArrowRight aria-hidden />
      </button>
    </div>
  );
}
