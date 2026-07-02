import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { CancelConfirmModal } from "./CancelConfirmModal";
import { ALT_CONFIRM, type Alt, type Step } from "./cancelMembership.data";
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
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState<Alt | null>(null);

  function goStep(n: Step) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function doCancel() {
    goStep("done");
    showToast("Membership cancelled · email sent", "success");
  }

  const isWizard = step === 1 || step === 2 || step === 3;
  const isFunnel = isWizard || step === "done";
  const stepNum = step === "done" ? 3 : isWizard ? step : 1;

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.membership} className={styles.back}>
          ← Membership
        </Link>
        {isWizard && (
          <>
            <div className={styles.eyebrow}>Cancel · Sustainer (annual)</div>
            <h1 className={styles.h1}>
              Sorry to see you <em>thinking about it.</em>
            </h1>
            <p className={styles.lead}>
              No dark patterns — three quick steps and you're out, or you can
              pause or downshift instead. Either way, no shame. Your community
              access remains.
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
          eyebrow={ALT_CONFIRM[pending].eyebrow}
          title={ALT_CONFIRM[pending].title}
          body={ALT_CONFIRM[pending].body}
          confirmLabel={ALT_CONFIRM[pending].confirmLabel}
          icon={ALT_CONFIRM[pending].icon}
          tone={ALT_CONFIRM[pending].tone}
          onConfirm={() => {
            goStep(ALT_CONFIRM[pending].next);
            setPending(null);
          }}
          onClose={() => setPending(null)}
        />
      )}
    </AppShell>
  );
}
