import { Fragment, type ReactNode } from "react";
import { FiAlertCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import {
  Button,
  Stepper,
  type StepperStep,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PANELS } from "./startCommunity.data";
import styles from "./StartCommunityPage.module.css";

/** The "founding thread" rail (Stepper); done nodes jump back to their step.
 *  `hiddenStep` drops one chapter from the rail entirely (and from the "step X
 *  of Y" count), for a chapter the current mode doesn't run — see the invites
 *  chapter in `StartCommunityPage`. */
export function FoundingThread({
  step,
  onJump,
  hiddenStep,
}: {
  step: number;
  onJump: (n: number) => void;
  hiddenStep?: number;
}) {
  const { t } = useTranslation();
  const current = PANELS[step];
  const currentThread = current ? t(current.threadKey) : "";
  // Rail positions vs. real chapter indices: with a chapter hidden the two
  // stop matching, so every index crossing the Stepper boundary is mapped.
  const visibleIndices = PANELS.map((_, index) => index).filter(
    (index) => index !== hiddenStep,
  );
  const steps: StepperStep[] = visibleIndices.map((index) => {
    const panel = PANELS[index]!;
    const threadLabel = t(panel.threadKey);
    return {
      key: panel.key,
      label: threadLabel,
      ariaLabel: t("communities:start.thread.backTo", { thread: threadLabel }),
    };
  });
  const railPosition = Math.max(visibleIndices.indexOf(step), 0);
  const total = visibleIndices.length;
  return (
    <div className={styles.threadWrap}>
      <div className={styles.threadRail}>
        <Stepper
          steps={steps}
          current={railPosition}
          size="sm"
          marker="check"
          onStepClick={(index) => onJump(visibleIndices[index] ?? 0)}
          ariaLabel={t("communities:start.thread.stepOf", {
            step: railPosition + 1,
            total,
            thread: currentThread,
          }).replace(/<[^>]*>/g, "")}
        />
      </div>
      <div className={styles.threadMobile}>
        <Translation
          i18nKey="communities:start.thread.stepOf"
          components={{ b: <b /> }}
          values={{
            step: railPosition + 1,
            total,
            thread: currentThread,
          }}
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
  backLabel?: ReactNode;
  onNext: () => void;
  nextLabel: string;
  missing: string[];
  flush?: boolean;
}) {
  const { t } = useTranslation();
  const isBlocked = missing.length > 0;
  return (
    <div
      className={[styles.paneFooter, flush && styles.paneFooterFlush]
        .filter(Boolean)
        .join(" ")}
    >
      {isBlocked && (
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
          {backLabel ?? (
            <>
              <FiArrowLeft aria-hidden /> {t("communities:start.back")}
            </>
          )}
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={isBlocked}
          title={
            isBlocked ? t("communities:start.actions.blockedTitle") : undefined
          }
        >
          {nextLabel} <FiArrowRight aria-hidden />
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
