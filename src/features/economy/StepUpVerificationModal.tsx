import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { ModalShell, Sending } from "./ModalKit";
import {
  useStartIdentityVerification,
  useStartPhoneVerification,
  useVerifyPhone,
  useVerificationStatus,
} from "./api/useVerification";
import type { VerificationLevel } from "./api/verification.api";
import styles from "./StepUpVerificationModal.module.css";

type Step = "phone" | "code" | "identity";

/**
 * Reusable step-up prompt shown when a gated action returns
 * `VERIFICATION_REQUIRED`. Walks the member through a phone OTP and, when the
 * action needs it, an external ID check (provider redirect placeholder). Calls
 * `onVerified` the moment the required level is reached so the caller can retry
 * the action. Dual-mode: demo simulates each step with no network.
 */
export function StepUpVerificationModal({
  requiredLevel,
  onVerified,
  onClose,
}: {
  requiredLevel: VerificationLevel;
  onVerified: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: status } = useVerificationStatus();
  const startPhone = useStartPhoneVerification();
  const verifyPhone = useVerifyPhone();
  const startIdentity = useStartIdentityVerification();

  const needsId = requiredLevel === "id_verified";
  const [step, setStep] = useState<Step>(
    needsId && status?.phoneVerified ? "identity" : "phone",
  );
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const sendCode = () => {
    if (phone.trim().length < 6) return;
    startPhone.mutate(phone.trim(), {
      onSuccess: () => setStep("code"),
      onError: () =>
        showToast(t("economy:verification.step.sendError"), "error"),
    });
  };

  const confirmCode = () => {
    if (code.trim().length < 4) return;
    verifyPhone.mutate(code.trim(), {
      onSuccess: () => {
        if (needsId) setStep("identity");
        else onVerified();
      },
      onError: () =>
        showToast(t("economy:verification.step.codeError"), "error"),
    });
  };

  const goIdentity = () => {
    startIdentity.mutate(undefined, {
      onSuccess: ({ redirectUrl }) => {
        // Demo has no provider — simulate completion inline. Live sends the
        // member to the provider's hosted flow; the success callback (webhook)
        // elevates them, so we close and let them re-open when they return.
        if (!redirectUrl) {
          onVerified();
          return;
        }
        window.location.href = redirectUrl;
      },
      onError: () =>
        showToast(t("economy:verification.step.identityError"), "error"),
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:verification.step.ariaLabel")}
    >
      <div className={styles.head}>
        <span className={styles.icon}>
          <FiShield aria-hidden />
        </span>
        <h2 className={styles.title}>
          {t("economy:verification.step.title")}
        </h2>
        <p className={styles.sub}>
          {needsId
            ? t("economy:verification.step.subId")
            : t("economy:verification.step.subPhone")}
        </p>
      </div>

      {step === "phone" && (
        <div className={styles.body}>
          <label className={styles.label} htmlFor="stepup-phone">
            {t("economy:verification.step.phoneLabel")}
          </label>
          <input
            id="stepup-phone"
            type="tel"
            className={styles.input}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("economy:verification.step.phonePlaceholder")}
            autoComplete="tel"
          />
          <p className={styles.note}>{t("economy:verification.step.privacy")}</p>
          <div className={styles.foot}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:verification.step.cancel")}
            </button>
            <Button
              variant="primary"
              disabled={phone.trim().length < 6 || startPhone.isPending}
              onClick={sendCode}
            >
              {startPhone.isPending ? (
                <Sending label={t("economy:verification.step.sending")} />
              ) : (
                t("economy:verification.step.sendCta")
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "code" && (
        <div className={styles.body}>
          <label className={styles.label} htmlFor="stepup-code">
            {t("economy:verification.step.codeLabel")}
          </label>
          <input
            id="stepup-code"
            inputMode="numeric"
            className={styles.input}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("economy:verification.step.codePlaceholder")}
            autoComplete="one-time-code"
          />
          <p className={styles.note}>{t("economy:verification.step.codeHint")}</p>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={() => setStep("phone")}
            >
              {t("economy:verification.step.backCta")}
            </button>
            <Button
              variant="primary"
              disabled={code.trim().length < 4 || verifyPhone.isPending}
              onClick={confirmCode}
            >
              {verifyPhone.isPending ? (
                <Sending label={t("economy:verification.step.confirming")} />
              ) : (
                t("economy:verification.step.confirmCta")
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "identity" && (
        <div className={styles.body}>
          <p className={styles.note}>
            {t("economy:verification.step.identityBody")}
          </p>
          <div className={styles.foot}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:verification.step.later")}
            </button>
            <Button
              variant="primary"
              disabled={startIdentity.isPending}
              onClick={goIdentity}
            >
              {startIdentity.isPending ? (
                <Sending label={t("economy:verification.step.opening")} />
              ) : (
                t("economy:verification.step.identityCta")
              )}
            </Button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
