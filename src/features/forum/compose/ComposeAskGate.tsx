import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StepUpVerificationModal } from "../../economy/StepUpVerificationModal";
import styles from "./ComposeFundingSection.module.css";

/** Below phone verification: the reason, and the way to fix it, in place of
 *  the fundraiser's fields. */
export function ComposeAskGate({ onVerified }: { onVerified: () => void }) {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);
  return (
    <div className={styles.gate}>
      <FiShield aria-hidden className={styles.gateIcon} />
      <p className={styles.gateTitle}>{t("forum:funding.gate.title")}</p>
      <p className={styles.gateBody}>{t("forum:funding.gate.body")}</p>
      <Button variant="primary" onClick={() => setIsVerifying(true)}>
        {t("forum:funding.gate.cta")}
      </Button>
      {isVerifying && (
        <StepUpVerificationModal
          requiredLevel="phone"
          onVerified={() => {
            setIsVerifying(false);
            onVerified();
          }}
          onClose={() => setIsVerifying(false)}
        />
      )}
    </div>
  );
}
