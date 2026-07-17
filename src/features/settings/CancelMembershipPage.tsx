import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { CancelConfirmModal } from "./CancelConfirmModal";
import { buildAltConfirm, type Alt, type Step } from "./cancelMembership.data";
import {
  CancelStepper,
  CancelStepOptions,
  CancelStepReasons,
  CancelStepConfirm,
  CancelDone,
  CancelPaused,
  CancelDownshifted,
  CancelSolidarity,
} from "./CancelMembershipSteps";
import styles from "./CancelMembershipPage.module.css";

export function CancelMembershipPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const altConfirm = useMemo(() => buildAltConfirm(t, fmt), [t, fmt]);
  const [step, setStep] = useState<Step>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState<Alt | null>(null);

  function goStep(nextStep: Step) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function doCancel() {
    goStep("done");
    showToast(t("settings:cancelMembership.page.cancelledToast"), "success");
  }

  const isWizard = step === 1 || step === 2 || step === 3;
  const isFunnel = isWizard || step === "done";
  const stepNum = step === "done" ? 3 : isWizard ? step : 1;

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.membership} className={styles.back}>
          {t("settings:cancelMembership.page.backLink")}
        </Link>
        {isWizard && (
          <>
            <div className={styles.eyebrow}>
              {t("settings:cancelMembership.page.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="settings:cancelMembership.page.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.lead}>
              {t("settings:cancelMembership.page.lead")}
            </p>
          </>
        )}

        {isFunnel && <CancelStepper step={step} stepNum={stepNum} />}

        {step === 1 && (
          <CancelStepOptions
            onPickAlt={setPending}
            onContinue={() => goStep(2)}
          />
        )}
        {step === 2 && (
          <CancelStepReasons
            checked={checked}
            setChecked={setChecked}
            onBack={() => goStep(1)}
            onContinue={() => goStep(3)}
          />
        )}
        {step === 3 && (
          <CancelStepConfirm
            confirmed={confirmed}
            setConfirmed={setConfirmed}
            onBack={() => goStep(2)}
            onCancel={doCancel}
          />
        )}
        {step === "done" && <CancelDone />}
        {step === "paused" && <CancelPaused onUndo={() => goStep(1)} />}
        {step === "downshifted" && (
          <CancelDownshifted onUndo={() => goStep(1)} />
        )}
        {step === "solidarity" && <CancelSolidarity onUndo={() => goStep(1)} />}
      </div>

      {pending && (
        <CancelConfirmModal
          eyebrow={altConfirm[pending].eyebrow}
          title={altConfirm[pending].title}
          body={altConfirm[pending].body}
          confirmLabel={altConfirm[pending].confirmLabel}
          icon={altConfirm[pending].icon}
          tone={altConfirm[pending].tone}
          onConfirm={() => {
            goStep(altConfirm[pending].next);
            setPending(null);
          }}
          onClose={() => setPending(null)}
        />
      )}
    </AppShell>
  );
}
