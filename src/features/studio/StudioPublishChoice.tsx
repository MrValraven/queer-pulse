import { useId, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioScheduleForm } from "./StudioScheduleForm";
import publishStyles from "./StudioUploadPublish.module.css";
import styles from "./StudioSchedule.module.css";

type PublishMode = "now" | "schedule";

const OPTIONS: { mode: PublishMode; labelKey: string; hintKey: string }[] = [
  {
    mode: "now",
    labelKey: "studio:schedule.choice.now",
    hintKey: "studio:schedule.choice.nowHint",
  },
  {
    mode: "schedule",
    labelKey: "studio:schedule.choice.schedule",
    hintKey: "studio:schedule.choice.scheduleHint",
  },
];

/** "Publish now" or "Schedule release". Each choice brings its own button:
 *  Publish release, or the schedule form's Schedule release. */
export function StudioPublishChoice({
  isBlocked,
  isWorking,
  checklistId,
  onBack,
  onPublishNow,
  onSchedule,
}: {
  isBlocked: boolean;
  isWorking: boolean;
  checklistId: string;
  onBack: () => void;
  onPublishNow: () => void;
  onSchedule: (publishAt: string) => void;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  const [mode, setMode] = useState<PublishMode>("now");
  return (
    <>
      <fieldset className={styles.choice} aria-labelledby={legendId}>
        <legend id={legendId} className={styles.legend}>
          {t("studio:schedule.choice.legend")}
        </legend>
        <div className={styles.options}>
          {/* The label names the radio by its title; the hint describes it.
              The label's ::after covers the whole card as the tap target. */}
          {OPTIONS.map((option) => (
            <div key={option.mode} className={styles.option}>
              <label
                htmlFor={`${legendId}-${option.mode}`}
                className={styles.optionLabel}
              >
                <input
                  id={`${legendId}-${option.mode}`}
                  type="radio"
                  name={legendId}
                  value={option.mode}
                  checked={mode === option.mode}
                  aria-describedby={`${legendId}-${option.mode}-hint`}
                  onChange={() => setMode(option.mode)}
                />
                <span className={styles.optionTitle}>{t(option.labelKey)}</span>
              </label>
              <span
                id={`${legendId}-${option.mode}-hint`}
                className={styles.optionHint}
              >
                {t(option.hintKey)}
              </span>
            </div>
          ))}
        </div>
      </fieldset>
      <Collapse isOpen={mode === "schedule"}>
        <StudioScheduleForm
          submitLabelKey="studio:schedule.form.scheduleCta"
          isWorking={isWorking}
          isBlocked={isBlocked}
          blockedDescriptionId={checklistId}
          onSubmit={onSchedule}
        />
      </Collapse>
      <div className={publishStyles.stepNav}>
        <Button variant="ghost" onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("studio:uploadFlow.backToTracks")}
        </Button>
        <Collapse isOpen={mode === "now"} className={publishStyles.publishSlot}>
          <Button
            onClick={onPublishNow}
            aria-disabled={isBlocked || isWorking || undefined}
            aria-describedby={isBlocked ? checklistId : undefined}
          >
            {isWorking
              ? t("studio:uploadFlow.publish.publishing")
              : t("studio:uploadFlow.publish.publishCta")}
          </Button>
        </Collapse>
      </div>
    </>
  );
}
