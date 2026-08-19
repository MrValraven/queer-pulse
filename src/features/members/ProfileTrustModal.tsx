import { FiCheckCircle, FiShield, FiHeart } from "react-icons/fi";
import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileTrustSignals.module.css";

/**
 * Explainer for {@link ProfileTrustSignals}' three rows, opened from its
 * info-icon trigger. Deliberately shares the terms' i18n keys
 * (`members:profile.trust.verified`/`.staff`) with the row labels rather than
 * writing new copy for them here — one catalog entry per term, so a future
 * wording change can't drift between the compact row and this explainer.
 * Only the definition bodies (`*Description`) are unique to this modal.
 */
export function ProfileTrustModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal title={t("members:profile.trust.modalTitle")} onClose={onClose}>
      <p className={styles.modalIntro}>
        {t("members:profile.trust.modalIntro")}
      </p>
      <dl className={styles.deflist}>
        <div className={styles.def}>
          <dt className={styles.defTerm}>
            <FiCheckCircle aria-hidden />
            {t("members:profile.trust.verified")}
          </dt>
          <dd className={styles.defBody}>
            {t("members:profile.trust.verifiedDescription")}
          </dd>
        </div>
        <div className={styles.def}>
          <dt className={styles.defTerm}>
            <FiShield aria-hidden />
            {t("members:profile.trust.staff")}
          </dt>
          <dd className={styles.defBody}>
            {t("members:profile.trust.staffDescription")}
          </dd>
        </div>
        <div className={styles.def}>
          <dt className={styles.defTerm}>
            <FiHeart aria-hidden />
            {t("members:profile.trust.vouchesTerm")}
          </dt>
          <dd className={styles.defBody}>
            {t("members:profile.trust.vouchesDescription")}
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
