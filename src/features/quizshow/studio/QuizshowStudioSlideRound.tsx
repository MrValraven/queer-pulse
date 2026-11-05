import { FiAlertTriangle, FiStar, FiZap } from "react-icons/fi";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import stageStyles from "../stage/QuizshowStage.module.css";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioSlideField } from "./QuizshowStudioSlideParts";
import { withLanguageText } from "./quizshowStudioSlideText";
import styles from "./QuizshowStudioSlide.module.css";

/**
 * A round header: the stage's round intro card, held still, with the round
 * title typed straight into it. The kind, the huge number and the notes read
 * the round as the TV shows it; the inspector changes them.
 */
export function QuizshowStudioSlideRound({
  roundIndex,
}: {
  roundIndex: number;
}) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const round = controller.draft.rounds[roundIndex];
  if (round === undefined) return null;
  const roundNumber = roundIndex + 1;
  const { isJokerAllowed, isSpeedBonusOn } = round.settings;
  const hasSpeedNote = round.kind === "quiz" && isSpeedBonusOn;
  const hasNotes =
    round.contentLabel !== "none" || isJokerAllowed || hasSpeedNote;
  return (
    <div className={styles.slide}>
      <div className={styles.centred}>
        <section
          className={`${stageStyles.roundCard} ${stageStyles.screen} ${styles.roundCard}`}
        >
          <span className={stageStyles.roundKind}>
            {t(`quizshow:kind.${round.kind}.name`)}
          </span>
          <span className={stageStyles.roundNumber} aria-hidden="true">
            {roundNumber}
          </span>
          <div className={stageStyles.roundHeading}>
            <p className={stageStyles.roundEyebrow}>
              {t("quizshow:stage.roundOf", {
                number: roundNumber,
                total: controller.draft.rounds.length,
              })}
            </p>
            <QuizshowStudioSlideField
              label={t("quizshow:rounds.title.label")}
              value={round.title[viewLanguage]}
              placeholder={t("quizshow:rounds.untitled", {
                number: roundNumber,
              })}
              maxLength={QUIZSHOW_LIMITS.roundTitleMax}
              className={styles.roundTitleField}
              onChange={(value) =>
                controller.updateRound(roundIndex, {
                  title: withLanguageText(round.title, viewLanguage, value),
                })
              }
            />
          </div>
          <Collapse isOpen={hasNotes}>
            <ul className={stageStyles.roundNotes}>
              {round.contentLabel !== "none" && (
                <li className={stageStyles.roundNote}>
                  <FiAlertTriangle aria-hidden="true" fill="none" />
                  {t(`quizshow:contentLabel.${round.contentLabel}`)}
                </li>
              )}
              {isJokerAllowed && (
                <li className={stageStyles.roundNote}>
                  <FiStar aria-hidden="true" fill="none" />
                  {t("quizshow:stage.jokerAllowed")}
                </li>
              )}
              {hasSpeedNote && (
                <li className={stageStyles.roundNote}>
                  <FiZap aria-hidden="true" fill="none" />
                  {t("quizshow:stage.speedBonus")}
                </li>
              )}
            </ul>
          </Collapse>
        </section>
      </div>
    </div>
  );
}
