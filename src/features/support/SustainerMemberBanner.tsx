import { FiStar } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FREQS, TIER_LABEL_KEYS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** Next monthly payment date, one month out. */
function nextPaymentDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

/** Green "you're a supporting member" banner, shown once someone has joined. */
export function SustainerMemberBanner({
  store,
  onChangeAmount,
}: {
  store: SustainerStore;
  onChangeAmount: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const m = store.supporter;
  if (!m) return null;

  const tierLabel = t(
    TIER_LABEL_KEYS[m.tier as keyof typeof TIER_LABEL_KEYS] ?? m.tier,
  );

  return (
    <div className={styles.memberBanner}>
      <div className={styles.mbIcon}>
        <FiStar size={26} aria-hidden />
      </div>
      <div className={styles.mbBody}>
        <div className={styles.mbLabel}>{t("support:memberBanner.label")}</div>
        <div className={styles.mbTitle}>
          {tierLabel} · {m.price} {t(FREQS[m.freq].perKey)}
        </div>
        <div className={styles.mbMeta}>
          {t("support:memberBanner.nextPayment", {
            date: fmt.date(nextPaymentDate(), {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </div>
      </div>
      <div className={styles.mbActions}>
        <button
          type="button"
          className={`${styles.mbBtn} ${styles.solid}`}
          onClick={onChangeAmount}
        >
          {t("support:memberBanner.changeAmountCta")}
        </button>
        <button
          type="button"
          className={styles.mbBtn}
          onClick={() =>
            showToast(t("support:memberBanner.receiptsToast"), "info")
          }
        >
          {t("support:memberBanner.receiptsCta")}
        </button>
        <button
          type="button"
          className={styles.mbBtn}
          onClick={() => {
            store.cancelMembership();
            showToast(t("support:memberBanner.cancelToast"), "info");
          }}
        >
          {t("support:memberBanner.cancelCta")}
        </button>
      </div>
    </div>
  );
}
