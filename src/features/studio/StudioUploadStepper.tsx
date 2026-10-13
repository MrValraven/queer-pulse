import { useTranslation } from "../../shared/i18n/useTranslation";
import { UPLOAD_STEPS } from "./studioUpload.data";
import type { UploadStepId } from "./studioUploadDraft.data";
import s from "./creator.module.css";

/** Release, Tracks, Publish, driven by real state. A step the draft has not
 *  reached yet is disabled; the current one carries aria-current="step". */
export function StudioUploadStepper({
  step,
  canReach,
  onSelect,
}: {
  step: UploadStepId;
  canReach: (step: UploadStepId) => boolean;
  onSelect: (step: UploadStepId) => void;
}) {
  const { t } = useTranslation();
  return (
    <ol className={s.stepper} aria-label={t("studio:uploadFlow.steps.label")}>
      {UPLOAD_STEPS.map((stepItem) => {
        const isCurrent = stepItem.id === step;
        return (
          <li
            key={stepItem.id}
            className={[s.step, isCurrent && s.stepOn]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className={s.stepButton}
              aria-current={isCurrent ? "step" : undefined}
              disabled={!canReach(stepItem.id)}
              onClick={() => onSelect(stepItem.id)}
            >
              <span className={s.stepNum}>{stepItem.num}</span>
              <span className={s.stepNm}>
                {t(stepItem.nmKey)}
                <small>{t(stepItem.subKey)}</small>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
