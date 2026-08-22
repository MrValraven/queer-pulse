import { FiArrowLeft, FiArrowRight, FiSun } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STEP_LABEL_KEYS, TOTAL_STEPS } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

/** Step dots plus the "step N of M" label above the grant wizard body. */
export function GrantApplicationProgress({ step }: { step: number }) {
  const { t } = useTranslation();

  return (
    <div className={styles.progress}>
      <div className={styles.stepsRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map(
          (dotStep) => (
            <div
              key={dotStep}
              className={[
                styles.stepDot,
                dotStep < step && styles.stepDotDone,
                dotStep === step && styles.stepDotActive,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ),
        )}
      </div>
      <div className={styles.stepLabel}>
        {t("resources:microGrants.apply.stepIndicator", {
          step,
          total: TOTAL_STEPS,
          stepLabel: t(STEP_LABEL_KEYS[step - 1]!),
        })}
      </div>
    </div>
  );
}

/** The final screen of the grant wizard, shown once the application is in. */
export function GrantApplicationSuccess({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiSun />
      </div>
      <div className={styles.successTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.success.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.successSub}>
        {t("resources:microGrants.apply.success.sub")}
      </p>
      <button type="button" className={styles.next} onClick={onClose}>
        {t("resources:microGrants.apply.success.closeCta")}
      </button>
    </div>
  );
}

/** Back / continue (or submit) controls at the foot of the grant wizard. */
export function GrantApplicationFooter({
  step,
  isSending,
  onBack,
  onAdvance,
}: {
  step: number;
  isSending: boolean;
  onBack: () => void;
  onAdvance: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.footer}>
      <button type="button" className={styles.back} onClick={onBack}>
        {step === 1 ? (
          t("resources:microGrants.apply.cancelCta")
        ) : (
          <>
            <FiArrowLeft aria-hidden />{" "}
            {t("resources:microGrants.apply.backCta")}
          </>
        )}
      </button>
      <button
        type="button"
        className={styles.next}
        onClick={onAdvance}
        disabled={isSending}
      >
        {step === TOTAL_STEPS
          ? t("resources:microGrants.apply.submitCta")
          : t("resources:microGrants.apply.continueCta")}{" "}
        <FiArrowRight aria-hidden />
      </button>
    </div>
  );
}
