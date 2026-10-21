import { useId, type Ref } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { UPLOAD_STEPS } from "./studioUpload.data";
import type { UploadStepId } from "./studioUploadDraft.data";
import s from "./creator.module.css";

/** One step's button. A step the draft has not reached stays focusable
 *  (aria-disabled) and names why through aria-describedby; a finished one
 *  trades its number for a check. */
function StepButton({
  stepItem,
  isCurrent,
  isDone,
  blockedReasonKey,
  onSelect,
}: {
  stepItem: (typeof UPLOAD_STEPS)[number];
  isCurrent: boolean;
  isDone: boolean;
  blockedReasonKey: string | null;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const reasonId = useId();
  const isBlocked = blockedReasonKey !== null;
  return (
    <Button
      variant="quiet"
      className={s.stepButton}
      aria-current={isCurrent ? "step" : undefined}
      aria-disabled={isBlocked || undefined}
      aria-describedby={isBlocked ? reasonId : undefined}
      onClick={() => {
        if (!isBlocked) onSelect();
      }}
    >
      <span className={s.stepNum} data-done={isDone || undefined}>
        {isDone ? <FiCheck aria-hidden /> : stepItem.num}
      </span>
      <span className={s.stepNm}>
        {t(stepItem.nmKey)}
        {isDone && (
          <span className="visuallyHidden">
            {` ${t("studio:uploadFlow.steps.doneLabel")}`}
          </span>
        )}
        <small id={reasonId}>
          {isBlocked ? t(blockedReasonKey) : t(stepItem.subKey)}
        </small>
      </span>
    </Button>
  );
}

/** Release, Tracks, Publish, driven by real state. The current step carries
 *  aria-current="step"; a finished one shows a check; a blocked one says
 *  why. Phones get a compact row of three. */
export function StudioUploadStepper({
  step,
  canReach,
  isDone,
  blockedReasonKeyOf,
  onSelect,
  ref,
}: {
  step: UploadStepId;
  canReach: (step: UploadStepId) => boolean;
  /** Steps whose work is in place (a draft exists, a track has audio). */
  isDone?: (step: UploadStepId) => boolean;
  /** Why an unreachable step is closed, as a catalog key. */
  blockedReasonKeyOf?: (step: UploadStepId) => string;
  onSelect: (step: UploadStepId) => void;
  /** The list itself; a step change scrolls it into view. */
  ref?: Ref<HTMLOListElement>;
}) {
  const { t } = useTranslation();
  return (
    <ol
      ref={ref}
      className={s.stepper}
      aria-label={t("studio:uploadFlow.steps.label")}
    >
      {UPLOAD_STEPS.map((stepItem) => {
        const isCurrent = stepItem.id === step;
        const isReachable = canReach(stepItem.id);
        return (
          <li
            key={stepItem.id}
            className={[s.step, isCurrent && s.stepOn]
              .filter(Boolean)
              .join(" ")}
          >
            <StepButton
              stepItem={stepItem}
              isCurrent={isCurrent}
              isDone={!isCurrent && (isDone?.(stepItem.id) ?? false)}
              blockedReasonKey={
                isReachable
                  ? null
                  : (blockedReasonKeyOf?.(stepItem.id) ??
                    "studio:uploadFlow.steps.blocked.needsDraft")
              }
              onSelect={() => onSelect(stepItem.id)}
            />
          </li>
        );
      })}
    </ol>
  );
}
