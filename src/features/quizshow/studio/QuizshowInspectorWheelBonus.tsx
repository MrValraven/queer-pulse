import { useId } from "react";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "../builder/QuizshowRounds.module.css";
import {
  wheelRoundIndexOfRange,
  withWheelSettingsDefaults,
} from "../quizshowWheel";
import {
  WHEEL_BONUS_CHOICES,
  bonusOfChoice,
  type WheelBonusChoice,
} from "./quizshowInspectorWheelBonus.data";
import { useQuizshowStudio } from "./QuizshowStudioContext";

/**
 * The Wheel bonus field of a round inside a wheel's range. The value shown is
 * the stored one with defaults, so a bonus kept in the draft outside a range
 * shows again when the round moves back in.
 */
export function QuizshowInspectorWheelBonus({
  roundIndex,
}: {
  roundIndex: number;
}) {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const labelId = useId();
  const hintId = useId();
  const { rounds } = controller.draft;
  const round = rounds[roundIndex];
  if (!round) return null;
  const wheelRoundIndex = wheelRoundIndexOfRange(rounds, roundIndex);
  const wheelRow =
    wheelRoundIndex === null ? undefined : rounds[wheelRoundIndex];
  const wheelPick = wheelRow
    ? withWheelSettingsDefaults(wheelRow.settings).wheelPick
    : "round";
  const settings = withWheelSettingsDefaults(round.settings);
  const label = t("quizshow:studio.inspector.round.wheelBonusLabel");
  return (
    <div className={styles.fieldGroup}>
      <span id={labelId} className={styles.groupLabel}>
        {label}
      </span>
      <p id={hintId} className={styles.hint}>
        {t(
          wheelPick === "question"
            ? "quizshow:studio.inspector.round.wheelBonusHintQuestion"
            : "quizshow:studio.inspector.round.wheelBonusHintRound",
        )}
      </p>
      <RadioCardGroup<WheelBonusChoice>
        value={String(settings.wheelBonus) as WheelBonusChoice}
        ariaLabel={label}
        ariaLabelledBy={labelId}
        ariaDescribedBy={hintId}
        className={styles.optionGrid}
        optionClassName={styles.kindOption}
        checkedClassName={styles.kindChecked}
        onChange={(choice) =>
          controller.updateRound(roundIndex, {
            settings: { ...round.settings, wheelBonus: bonusOfChoice(choice) },
          })
        }
        options={WHEEL_BONUS_CHOICES.map((choice) => ({
          id: choice,
          render: (
            <span className={styles.kindName}>
              {choice === "0"
                ? t("quizshow:studio.inspector.round.wheelBonusNone")
                : t("quizshow:studio.inspector.round.wheelBonusValue", {
                    points: bonusOfChoice(choice),
                  })}
            </span>
          ),
        }))}
      />
    </div>
  );
}
