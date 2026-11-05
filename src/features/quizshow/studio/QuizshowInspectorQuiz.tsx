import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowAdultsSwitch } from "../builder/QuizshowAdultsSwitch";
import { QuizshowQuizSettings } from "../builder/QuizshowQuizSettings";
import { QuizshowTemplateDetails } from "../templates/QuizshowTemplateDetails";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import styles from "./QuizshowStudioInspector.module.css";

/** Add round, with the count and, when blocked, the limit that blocks it. */
function QuizshowInspectorRounds() {
  const { t } = useTranslation();
  const { controller, actions } = useQuizshowStudio();
  const countId = useId();
  const roundCount = controller.draft.rounds.length;
  const isAllowed = actions.isAddRoundAllowed;
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
    </QuizshowInspectorSection>
  );
}

/** The quiz state: title, languages, 18+ (game), rounds, the Template section (template), and the quiz's problems. */
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
