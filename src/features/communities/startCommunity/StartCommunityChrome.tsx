import { Fragment } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, Stepper, type StepperStep } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PANELS, TOTAL_STEPS } from "./startCommunity.data";
import styles from "./StartCommunityPage.module.css";

/** The "founding thread" rail (Stepper); done nodes jump back to their step. */
export function FoundingThread({
  step,
  onJump,
}: {
  step: number;
  onJump: (n: number) => void;
}) {
  const { t } = useTranslation();
  const current = PANELS[step];
  const currentThread = current ? t(current.threadKey) : "";
  const steps: StepperStep[] = PANELS.map((panel) => {
    const threadLabel = t(panel.threadKey);
    return {
      key: panel.key,
      label: threadLabel,
      ariaLabel: t("communities:start.thread.backTo", { thread: threadLabel }),
    };
  });
  return (
    <div className={styles.threadWrap}>
      <div className={styles.threadRail}>
        <Stepper
          steps={steps}
          current={step}
          size="sm"
          marker="check"
          onStepClick={onJump}
          ariaLabel={t("communities:start.thread.stepOf", {
            step: step + 1,
            total: TOTAL_STEPS,
            thread: currentThread,
          }).replace(/<[^>]*>/g, "")}
        />
      </div>
      <div className={styles.threadMobile}>
        <Translation
          i18nKey="communities:start.thread.stepOf"
          components={{ b: <b /> }}
          values={{ step: step + 1, total: TOTAL_STEPS, thread: currentThread }}
        />
      </div>
    </div>
  );
}

/** Back / next footer with the "what's still needed" hint. */
export function PanelActions({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  missing,
  flush,
}: {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  missing: string[];
  flush?: boolean;
}) {
  const { t } = useTranslation();
  const blocked = missing.length > 0;
  return (
    <div
      className={[styles.paneFooter, flush && styles.paneFooterFlush]
        .filter(Boolean)
        .join(" ")}
    >
      {blocked && (
        <div className={styles.neededBar}>
          <FiAlertCircle size={15} aria-hidden />
          <span>{t("communities:start.actions.stillNeeded")}</span>
          <span className={styles.neededChips}>
            {missing.map((m) => (
              <span key={m} className={styles.neededChip}>
                {t(m)}
              </span>
            ))}
          </span>
        </div>
      )}
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onBack}>
          {backLabel ?? t("communities:start.back")}
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={blocked}
          title={
            blocked ? t("communities:start.actions.blockedTitle") : undefined
          }
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/** Serif chapter header (with coral `<em>` where the title marks ⟪ ⟫). */
export function ChapterHead({ index }: { index: number }) {
  const { t } = useTranslation();
  const panel = PANELS[index];
  if (!panel) return null;
  return (
    <>
      <div className={styles.chEyebrow}>{t(panel.eyebrowKey)}</div>
      <h2 className={styles.chH}>{renderTitle(t(panel.titleKey))}</h2>
      <p className={styles.chLead}>{t(panel.leadKey)}</p>
    </>
  );
}

/** Split a title on the ⟪ ⟫ markers into text + coral `<em>` segments. */
function renderTitle(title: string) {
  const parts = title.split(/⟪|⟫/);
  return parts.map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}
