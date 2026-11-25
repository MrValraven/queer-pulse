import { useId, useMemo } from "react";
import { FiClock, FiDisc, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowAdultsSwitch } from "../builder/QuizshowAdultsSwitch";
import { QuizshowQuizSettings } from "../builder/QuizshowQuizSettings";
import { estimateRunningMinutes } from "../builder/quizshowRunningTime";
import { QuizshowTemplateDetails } from "../templates/QuizshowTemplateDetails";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import { isWheelRoundKind, playableRoundCount } from "../quizshowWheel";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import styles from "./QuizshowStudioInspector.module.css";

/** Add round and Add wheel, each with its count and, when blocked, the limit that blocks it, then about how long the game runs (item 56). */
function QuizshowInspectorRounds() {
  const { t } = useTranslation();
  const { controller, actions } = useQuizshowStudio();
  const countId = useId();
  const wheelCountId = useId();
  const roundCount = playableRoundCount(controller.draft.rounds);
  const wheelCount = controller.draft.rounds.filter((round) =>
    isWheelRoundKind(round.kind),
  ).length;
  const runningMinutes = useMemo(
    () => estimateRunningMinutes(controller.draft),
    [controller.draft],
  );
  const isAllowed = actions.isAddRoundAllowed;
  const isWheelAllowed = actions.isAddWheelAllowed;
  // Ten rounds is the round limit; short of it, the quiz-wide question limit is what blocks.
  const isRoundLimit = roundCount >= QUIZSHOW_LIMITS.roundsMax;
  return (
    <QuizshowInspectorSection title={t("quizshow:rounds.heading")}>
      <div className={styles.addRow}>
        <Button
          variant="stage-ghost"
          size="sm"
          type="button"
          aria-disabled={!isAllowed}
          aria-describedby={countId}
          onClick={() => {
            if (isAllowed) actions.addRound("quiz");
          }}
        >
          <FiPlus aria-hidden /> {t("quizshow:rounds.add")}
        </Button>
        <p id={countId} className={styles.countLine} role="status">
          {isAllowed || isRoundLimit
            ? t("quizshow:rounds.count", {
                count: roundCount,
                max: QUIZSHOW_LIMITS.roundsMax,
              })
            : t("quizshow:problems.too_many_questions", {
                max: QUIZSHOW_LIMITS.questionsPerQuizMax,
              })}
        </p>
      </div>
      <div className={styles.addRow}>
        <Button
          variant="stage-ghost"
          size="sm"
          type="button"
          aria-disabled={!isWheelAllowed}
          aria-describedby={wheelCountId}
          onClick={() => {
            if (isWheelAllowed) actions.addWheel();
          }}
        >
          <FiDisc aria-hidden /> {t("quizshow:rounds.addWheel")}
        </Button>
        <p id={wheelCountId} className={styles.countLine} role="status">
          {isWheelAllowed
            ? t("quizshow:rounds.wheelCount", {
                count: wheelCount,
                max: QUIZSHOW_LIMITS.wheelStepsMax,
              })
            : t("quizshow:rounds.wheelsFull", {
                max: QUIZSHOW_LIMITS.wheelStepsMax,
              })}
        </p>
      </div>
      <p className={styles.runningTime}>
        <FiClock aria-hidden fill="none" className={styles.runningTimeIcon} />
        <span className={styles.runningTimeLabel}>
          {t("quizshow:studio.runningTimeLabel")}
          {/* Read as a pair: "Running time: About 15 minutes". */}
          <span className={styles.visuallyHidden}>: </span>
        </span>
        <span>
          {t("quizshow:studio.runningTime", { minutes: runningMinutes })}
        </span>
      </p>
    </QuizshowInspectorSection>
  );
}

/**
 * C6.25: "Based on {title}" for a quiz copied from a published template, in
 * the studio's view language, and "Updated since you copied it" after a newer
 * publish. The top bar's "See what changed" opens what changed.
 */
function QuizshowInspectorTemplateSource() {
  const { t } = useTranslation();
  const { data, start, viewLanguage } = useQuizshowStudio();
  const sourceTemplate =
    start.sessionScope !== null ? (data.quiz?.sourceTemplate ?? null) : null;
  if (sourceTemplate === null) return null;
  return (
    <p className={styles.templateSource}>
      <span className={styles.templateSourceTitle}>
        {t("quizshow:studio.basedOn", {
          title: templateCardTitleOf(sourceTemplate.title, viewLanguage),
        })}
      </span>
      {sourceTemplate.hasUpdate && (
        <span className={styles.templateSourceUpdated}>
          {t("quizshow:studio.templateUpdated")}
        </span>
      )}
    </p>
  );
}

/** The quiz state: the template it is based on, title, languages, 18+ (game), rounds, running time, the Template section (template), and the quiz's problems. */
export function QuizshowInspectorQuiz() {
  const { t } = useTranslation();
  const {
    controller,
    adults,
    template,
    templateMeta,
    publishing,
    scope,
    isTitleRequired,
    problems,
  } = useQuizshowStudio();
  return (
    <>
      <QuizshowInspectorSection
        title={t("quizshow:studio.inspector.quiz.title")}
      >
        <QuizshowInspectorTemplateSource />
        <QuizshowQuizSettings
          controller={controller}
          titleLabelKey={
            scope.kind === "game" ? "quizshow:games.new.titleLabel" : undefined
          }
          isTitleRequired={isTitleRequired}
        />
      </QuizshowInspectorSection>
      {adults && (
        <QuizshowInspectorSection
          title={t("quizshow:studio.inspector.quiz.audience")}
        >
          <QuizshowAdultsSwitch
            isOn={adults.isAdultsEvent}
            adultsRoundNumbers={adults.adultsRoundNumbers}
            onChange={adults.setIsAdultsOnly}
          />
        </QuizshowInspectorSection>
      )}
      {template && templateMeta && publishing && (
        <QuizshowInspectorSection
          title={t("quizshow:templates.details.heading")}
          lead={t("quizshow:templates.details.sub")}
        >
          <QuizshowTemplateDetails
            isFlat
            templateDraft={template}
            meta={templateMeta}
            languages={controller.draft.languages}
            publishing={publishing}
          />
        </QuizshowInspectorSection>
      )}
      <QuizshowInspectorRounds />
      <QuizshowInspectorProblems problems={problems} />
    </>
  );
}
