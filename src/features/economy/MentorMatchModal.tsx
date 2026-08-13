import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiClock } from "react-icons/fi";
import { Button, Stepper } from "../../shared/components/ui";
import { useScrollLock, useWizardForm } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MATCH_FLOWS, type Mode } from "./mentorship.data";
import { MentorMatchStep, MentorMatchSuccess } from "./MentorMatchSteps";
import styles from "./MentorshipPage.module.css";

export function MentorMatchModal({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const flow = MATCH_FLOWS[mode];
  const wizard = useWizardForm({ stepCount: flow.steps.length });
  const stepLabel = t("economy:mentorship.match.stepOf", {
    step: wizard.currentStepIndex + 1,
    total: flow.steps.length,
  });

  return createPortal(
    <div
      className={styles.overlay}
      // Backdrop click is a mouse-only shortcut; Esc and the close button
      // already provide the keyboard path, so this div is not interactive.
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={
          mode === "mentee"
            ? t("economy:mentorship.match.findMentorAria")
            : t("economy:mentorship.match.becomeMentorAria")
        }
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label={t("economy:mentorship.match.closeAria")}
        >
          ×
        </button>
        {!demoMode ? (
          // No mentor-matching endpoint yet — an honest coming-soon rather than
          // walking the member through a wizard that fakes a match on submit.
          <div className={styles.mmSuccess}>
            <div className={styles.mmSuccessIcon}>
              <FiClock />
            </div>
            <div className={styles.mmTitle} style={{ fontSize: 24 }}>
              {t("economy:comingSoon.title")} {t("economy:comingSoon.em")}
            </div>
            <p className={styles.mmDesc}>{t("economy:comingSoon.body")}</p>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("economy:comingSoon.close")}
            </Button>
          </div>
        ) : wizard.isDone ? (
          <MentorMatchSuccess mode={mode} onClose={onClose} />
        ) : (
          <>
            <Stepper
              steps={flow.steps.map((step) => ({
                key: step.eyebrowKey,
                ariaLabel: t(step.eyebrowKey),
              }))}
              current={wizard.currentStepIndex}
              size="sm"
              marker="number"
              ariaLabel={stepLabel}
            />
            <div className={styles.mmLabel}>{stepLabel}</div>

            <MentorMatchStep
              mode={mode}
              stepIndex={wizard.currentStepIndex}
              isFirstStep={wizard.isFirstStep}
              isLastStep={wizard.isLastStep}
              isSending={wizard.isSending}
              onBack={wizard.goToPreviousStep}
              onContinue={wizard.goToNextStep}
              onSubmit={() =>
                wizard.submit(() => showToast(t(flow.toastKey), "success"))
              }
            />
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
