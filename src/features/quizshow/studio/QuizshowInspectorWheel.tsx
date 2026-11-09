import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import {
  QUIZSHOW_LIMITS,
  type QuizshowWheelPick,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import roundStyles from "../builder/QuizshowRounds.module.css";
import {
  displayRoundNumber,
  isWheelRoundKind,
  wheelSliceRoundIndexes,
  withWheelSettingsDefaults,
} from "../quizshowWheel";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import { QuizshowInspectorRoundDelete } from "./QuizshowInspectorRound";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  WHEEL_SLICE_COUNT_CHOICES,
  choiceOfSliceCount,
  sliceCountOfChoice,
  type WheelSliceCountChoice,
} from "./quizshowInspectorWheel.data";
import styles from "./QuizshowStudioInspector.module.css";

const WHEEL_PICKS: readonly QuizshowWheelPick[] = ["round", "question"];

/** What the wheel picks, a round or a question from a category. */
function WheelPickField({ roundIndex }: { roundIndex: number }) {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const labelId = useId();
  const wheelRow = controller.draft.rounds[roundIndex];
  if (!wheelRow) return null;
  const settings = withWheelSettingsDefaults(wheelRow.settings);
  return (
    <div className={roundStyles.fieldGroup}>
      <span id={labelId} className={roundStyles.groupLabel}>
        {t("quizshow:studio.inspector.wheel.pickLabel")}
      </span>
      <RadioCardGroup
        value={settings.wheelPick}
        ariaLabel={t("quizshow:studio.inspector.wheel.pickLabel")}
        ariaLabelledBy={labelId}
        className={`${roundStyles.optionGrid} ${styles.wheelPickCards}`}
        optionClassName={roundStyles.kindOption}
        checkedClassName={roundStyles.kindChecked}
        onChange={(wheelPick) =>
          controller.updateRound(roundIndex, {
            settings: { ...settings, wheelPick },
          })
        }
        options={WHEEL_PICKS.map((wheelPick) => {
          const keyStem =
            wheelPick === "round"
              ? "quizshow:studio.inspector.wheel.pickRound"
              : "quizshow:studio.inspector.wheel.pickQuestion";
          return {
            id: wheelPick,
            render: (
              <>
                <span className={roundStyles.kindName}>{t(keyStem)}</span>
                <span className={roundStyles.kindHint}>
                  {t(`${keyStem}Hint`)}
                </span>
              </>
            ),
          };
        })}
      />
    </div>
  );
}

/** How many rounds after the wheel fill it: Auto or 2 to 8. */
function WheelSliceCountField({ roundIndex }: { roundIndex: number }) {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const labelId = useId();
  const hintId = useId();
  const wheelRow = controller.draft.rounds[roundIndex];
  if (!wheelRow) return null;
  const settings = withWheelSettingsDefaults(wheelRow.settings);
  const choice = choiceOfSliceCount(settings.sliceCount);
  const isAuto = choice === "auto";
  return (
    <div className={roundStyles.fieldGroup}>
      <span id={labelId} className={roundStyles.groupLabel}>
        {t("quizshow:studio.inspector.wheel.sliceCountLabel")}
      </span>
      <RadioCardGroup<WheelSliceCountChoice>
        value={choice}
        ariaLabel={t("quizshow:studio.inspector.wheel.sliceCountLabel")}
        ariaLabelledBy={labelId}
        ariaDescribedBy={isAuto ? hintId : undefined}
        className={roundStyles.optionGrid}
        optionClassName={roundStyles.kindOption}
        checkedClassName={roundStyles.kindChecked}
        onChange={(nextChoice) =>
          controller.updateRound(roundIndex, {
            settings: {
              ...settings,
              sliceCount: sliceCountOfChoice(nextChoice),
            },
          })
        }
        options={WHEEL_SLICE_COUNT_CHOICES.map((sliceChoice) => ({
          id: sliceChoice,
          render: (
            <span className={roundStyles.kindName}>
              {sliceChoice === "auto"
                ? t("quizshow:studio.inspector.wheel.sliceCountAuto")
                : t("quizshow:studio.inspector.wheel.sliceCountOption", {
                    count: Number(sliceChoice),
                  })}
            </span>
          ),
        }))}
      />
      <Collapse isOpen={isAuto}>
        <p id={hintId} className={roundStyles.hint}>
          {t("quizshow:studio.inspector.wheel.sliceCountAutoHint")}
        </p>
      </Collapse>
    </div>
  );
}

/** The rounds on this wheel, each a button to its own state, and the hint while the wheel has too few. */
function WheelSlicesList({ roundIndex }: { roundIndex: number }) {
  const { t } = useTranslation();
  const { controller, select, viewLanguage } = useQuizshowStudio();
  const { rounds } = controller.draft;
  const sliceRoundIndexes = wheelSliceRoundIndexes(rounds, roundIndex);
  return (
    <>
      <ul className={styles.sliceList}>
        <AnimatePresence initial={false}>
          {sliceRoundIndexes.map((sliceRoundIndex) => {
            const sliceRound = rounds[sliceRoundIndex];
            if (!sliceRound) return null;
            const { wheelBonus } = withWheelSettingsDefaults(
              sliceRound.settings,
            );
            const sliceTitle =
              sliceRound.title[viewLanguage].trim() ||
              t("quizshow:rounds.untitled", {
                number: displayRoundNumber(rounds, sliceRoundIndex),
              });
            return (
              <CollapseListItem key={sliceRound.draftKey}>
                <button
                  type="button"
                  className={styles.sliceButton}
                  onClick={() =>
                    select({ kind: "round", roundIndex: sliceRoundIndex })
                  }
                >
                  <span className={styles.sliceTitle}>{sliceTitle}</span>
                  <span className={styles.sliceMeta}>
                    {t(`quizshow:kind.${sliceRound.kind}.name`)}
                    {wheelBonus > 0 && (
                      <span className={styles.sliceBonus}>
                        {t("quizshow:studio.inspector.round.wheelBonusValue", {
                          points: wheelBonus,
                        })}
                      </span>
                    )}
                  </span>
                </button>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <Collapse
        isOpen={sliceRoundIndexes.length < QUIZSHOW_LIMITS.wheelSlicesMin}
      >
        <p className={roundStyles.hint} role="status">
          {t("quizshow:studio.inspector.wheel.tooFew")}
        </p>
      </Collapse>
    </>
  );
}

/** The wheel state: what it picks, how many slices, the rounds on it, its problems, Delete wheel. */
export function QuizshowInspectorWheel({ roundIndex }: { roundIndex: number }) {
  const { t } = useTranslation();
  const { controller, problems } = useQuizshowStudio();
  const wheelRow = controller.draft.rounds[roundIndex];
  if (!wheelRow || !isWheelRoundKind(wheelRow.kind)) return null;
  return (
    <>
      <QuizshowInspectorSection
        title={t("quizshow:studio.inspector.wheel.settings")}
      >
        <WheelPickField roundIndex={roundIndex} />
        <WheelSliceCountField roundIndex={roundIndex} />
      </QuizshowInspectorSection>
      <QuizshowInspectorSection
        title={t("quizshow:studio.inspector.wheel.slicesTitle")}
      >
        <WheelSlicesList roundIndex={roundIndex} />
      </QuizshowInspectorSection>
      <QuizshowInspectorProblems
        problems={problems.filter(
          (problem) => problem.roundIndex === roundIndex,
        )}
      />
      <QuizshowInspectorRoundDelete roundIndex={roundIndex} />
    </>
  );
}
