import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { FormField, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_STEP_DAYS_MAX,
  CULTURAL_STEP_DAYS_MIN,
} from "./api/culturalProduction.types";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  stepControlId,
  type GuideField,
  type GuideMoveDirection,
  type GuideStepDraft,
} from "./guideEditor.model";
import styles from "./GuideEditor.module.css";

const KEY = "admin:culturalProduction.guides.editor";

/** The ids a control names in `aria-describedby`, or none. */
function describedByOf(...ids: (string | null)[]): string | undefined {
  const present = ids.filter((id) => id !== null);
  return present.length > 0 ? present.join(" ") : undefined;
}

/**
 * One checklist step: its text, the days before the event (the hint sits
 * once above the checklist, at `daysHintId`), and move up, move down and
 * remove. A refusal that names this step shows under the field it names.
 */
export function GuideStepEditor({
  idPrefix,
  step,
  stepIndex,
  stepCount,
  daysHintId,
  refusal,
  refusalField,
  isDisabled,
  onChange,
  onMove,
  onRemove,
}: {
  idPrefix: string;
  step: GuideStepDraft;
  stepIndex: number;
  stepCount: number;
  daysHintId: string;
  /** The refusal that names this step, or null. */
  refusal: unknown;
  refusalField: GuideField | null;
  isDisabled: boolean;
  onChange: (
    changes: Partial<Pick<GuideStepDraft, "text" | "daysText">>,
  ) => void;
  onMove: (direction: GuideMoveDirection) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const stepLabel = t(`${KEY}.stepTextLabel`, { number: stepIndex + 1 });
  const textId = stepControlId(idPrefix, step.key, "text");
  const daysId = stepControlId(idPrefix, step.key, "days");
  const isTextRefused = refusal !== null && refusalField === "stepText";
  const isDaysRefused = refusal !== null && refusalField === "stepDays";
  const textRefusalId = `${textId}-refusal`;
  const daysRefusalId = `${daysId}-refusal`;

  return (
    <div className={styles.step} role="group" aria-label={stepLabel}>
      <div className={styles.stepFields}>
        <div className={styles.fieldBlock}>
          <FormField label={stepLabel} required className={styles.field}>
            <input
              id={textId}
              type="text"
              value={step.text}
              disabled={isDisabled}
              aria-invalid={isTextRefused || undefined}
              aria-describedby={isTextRefused ? textRefusalId : undefined}
              onChange={(event) => onChange({ text: event.target.value })}
            />
          </FormField>
          <CulturalRefusalLine
            error={isTextRefused ? refusal : null}
            id={textRefusalId}
          />
        </div>
        <div className={styles.fieldBlock}>
          <FormField label={t(`${KEY}.stepDaysLabel`)} className={styles.field}>
            <input
              id={daysId}
              type="number"
              inputMode="numeric"
              step={1}
              min={CULTURAL_STEP_DAYS_MIN}
              max={CULTURAL_STEP_DAYS_MAX}
              className={styles.daysInput}
              value={step.daysText}
              disabled={isDisabled}
              aria-invalid={isDaysRefused || undefined}
              aria-describedby={describedByOf(
                daysHintId,
                isDaysRefused ? daysRefusalId : null,
              )}
              onChange={(event) => onChange({ daysText: event.target.value })}
            />
          </FormField>
          <CulturalRefusalLine
            error={isDaysRefused ? refusal : null}
            id={daysRefusalId}
          />
        </div>
      </div>
      <div className={styles.rowActions}>
        <IconButton
          id={stepControlId(idPrefix, step.key, "moveUp")}
          size="sm"
          aria-label={t(`${KEY}.moveStepUpCta`)}
          tooltip
          disabled={isDisabled || stepIndex === 0}
          onClick={() => onMove("up")}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          id={stepControlId(idPrefix, step.key, "moveDown")}
          size="sm"
          aria-label={t(`${KEY}.moveStepDownCta`)}
          tooltip
          disabled={isDisabled || stepIndex === stepCount - 1}
          onClick={() => onMove("down")}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          id={stepControlId(idPrefix, step.key, "remove")}
          size="sm"
          aria-label={t(`${KEY}.removeStepCta`)}
          tooltip
          disabled={isDisabled}
          onClick={onRemove}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}
