import { useContext, useId, useState, type MouseEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { SegmentedControl } from "../../../shared/components/ui/Controls";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowQuizResponse,
  QuizshowRecap as QuizshowRecapData,
  QuizshowRecapQuestion,
  QuizshowRecapStanding,
} from "../../../shared/contracts/quizshow";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { useQuizshowGameResultsActions } from "../games/useQuizshowGameActions";
import { QuizshowShape } from "../QuizshowShape";
import { quizshowStudioFocusPath } from "../quizshowPaths";
import type { QuizshowSessionScope } from "../quizshowScope";
import { quizshowPlaceOf } from "../stage/quizshowOrdinal";
import { QuizshowStudioContext } from "../studio/QuizshowStudioContext";
import {
  QUIZSHOW_RECAP_SORT_LABEL_KEYS,
  QUIZSHOW_RECAP_SORTS,
  isQuizshowRecapSort,
  sortRecapQuestions,
  type QuizshowRecapSort,
} from "./quizshowRecapSort";
import styles from "./QuizshowEvent.module.css";

interface QuizshowRecapProps {
  recap: QuizshowRecapData;
  language: QuizshowLanguage;
  /** The quiz the results came from; "Edit this question" opens its studio. */
  scope: QuizshowSessionScope;
}

function promptFor(
  question: QuizshowRecapQuestion,
  language: QuizshowLanguage,
): string {
  const otherLanguage = language === "en" ? "pt" : "en";
  return question.prompt[language] || question.prompt[otherLanguage];
}

/**
 * True while the saved quiz still holds a question at the recap's indices with
 * the same prompt in both languages (C6.24), so the link never opens a
 * different question. A prompt empty in both (a picture-only question) still
 * matches on its indices; a PT-only quiz compares its PT prompts, since an
 * empty EN on both sides says nothing.
 */
function isQuestionStillThere(
  quizResponse: QuizshowQuizResponse | undefined,
  question: QuizshowRecapQuestion,
): boolean {
  const savedQuestion =
    quizResponse?.quiz?.rounds[question.roundIndex]?.questions[
      question.questionIndex
    ];
  return (
    savedQuestion !== undefined &&
    savedQuestion.prompt.en === question.prompt.en &&
    savedQuestion.prompt.pt === question.prompt.pt
  );
}

/**
 * The tag that says why a question shows no right-answer share: a poll has
 * no right answer, a party round scores by vote or by the host. A warm-up
 * already wears its own pill, and a quiz question nobody could score keeps
 * only its figures.
 */
function recapKindTagKeyOf(question: QuizshowRecapQuestion): string | null {
  if (question.type === "poll") return "quizshow:type.poll";
  if (question.isWarmUp) return null;
  if (question.roundKind !== "quiz") return "quizshow:results.recap.party";
  return null;
}

/**
 * "Edit this question": the studio opened on that question. Inside the
 * studio already (the game's results panel), it selects the question there
 * and closes the panel, since the studio reads the focus link only on load.
 */
function EditQuestionLink({
  question,
  scope,
  promptId,
}: {
  question: QuizshowRecapQuestion;
  scope: QuizshowSessionScope;
  /** The row's prompt, so the link says which question it edits. */
  promptId: string;
}) {
  const { t } = useTranslation();
  const studio = useContext(QuizshowStudioContext);
  const gameResults = useQuizshowGameResultsActions();
  const { roundIndex, questionIndex } = question;
  const selectInStudio = (event: MouseEvent) => {
    if (
      studio === null ||
      studio.controller.draft.rounds[roundIndex]?.questions[questionIndex] ===
        undefined
    ) {
      return;
    }
    event.preventDefault();
    studio.select({ kind: "question", roundIndex, questionIndex });
    gameResults?.closeResults();
  };
  return (
    <Button
      variant="quiet"
      size="sm"
      className={styles.recapEdit}
      aria-describedby={promptId}
      // The studio selects the question only while both its prompts still match.
      to={quizshowStudioFocusPath(
        scope,
        roundIndex,
        questionIndex,
        question.prompt,
      )}
      onClick={selectInStudio}
    >
      {t("quizshow:results.editQuestion")}
    </Button>
  );
}

function RecapFigures({ question }: { question: QuizshowRecapQuestion }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { percentCorrect, averageAnswerMs, wasSkipped } = question;
  if (wasSkipped) {
    return (
      <span className={styles.recapTag}>
        {t("quizshow:results.recap.skipped")}
      </span>
    );
  }
  const kindTagKey = recapKindTagKeyOf(question);
  const figureLines = [
    percentCorrect === null
      ? null
      : t("quizshow:results.recap.correct", { percent: percentCorrect }),
    averageAnswerMs === null
      ? null
      : t("quizshow:results.recap.averageTime", {
          seconds: format.number(averageAnswerMs / 1000, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        }),
  ].filter((line): line is string => line !== null);
  return (
    <>
      {kindTagKey !== null && (
        <span className={styles.recapTag}>{t(kindTagKey)}</span>
      )}
      {percentCorrect !== null && (
        <span className={styles.recapBar} aria-hidden="true">
          <span
            className={styles.recapBarFill}
            style={{ width: `${percentCorrect}%` }}
          />
        </span>
      )}
      {figureLines.length > 0 && (
        <span className={styles.recapFigures}>{figureLines.join(" · ")}</span>
      )}
    </>
  );
}

function RecapRow({
  question,
  language,
  scope,
  isEditable,
}: {
  question: QuizshowRecapQuestion;
  language: QuizshowLanguage;
  scope: QuizshowSessionScope;
  isEditable: boolean;
}) {
  const { t } = useTranslation();
  const promptId = useId();
  const hasTags = question.isWarmUp || question.wasCorrected;
  return (
    <li className={styles.recapRow}>
      <span id={promptId} className={styles.recapPrompt}>
        {promptFor(question, language)}
      </span>
      {hasTags && (
        <span className={styles.recapTags}>
          {question.isWarmUp && (
            <span className={styles.recapPill}>
              {t("quizshow:results.tag.warmUp")}
            </span>
          )}
          {question.wasCorrected && (
            <span className={styles.recapPill}>
              {t("quizshow:results.tag.corrected")}
            </span>
          )}
        </span>
      )}
      <RecapFigures question={question} />
      {/* The link waits for the saved quiz, so it folds in once the prompt is confirmed. */}
      <Collapse isOpen={isEditable}>
        <EditQuestionLink
          question={question}
          scope={scope}
          promptId={promptId}
        />
      </Collapse>
    </li>
  );
}

function StandingRow({
  standing,
  total,
  language,
}: {
  standing: QuizshowRecapStanding;
  total: number;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <li className={styles.standingRow}>
      <span className={styles.standingPlace}>
        {quizshowPlaceOf(standing.rank, total, language, t)}
      </span>
      {/* The team's shape and the name share the middle column, so every row keeps three cells. */}
      <span className={styles.standingName}>
        {standing.kind === "team" && standing.colorKey !== null && (
          <QuizshowShape
            colorKey={standing.colorKey}
            size="small"
            label={null}
          />
        )}
        <span className={styles.podiumName}>{standing.name}</span>
      </span>
      <span className={styles.podiumScore}>
        {t("quizshow:common.points", { points: format.number(standing.score) })}
      </span>
    </li>
  );
}

/** Every entrant of the night behind its own toggle (C6.24). */
function RecapStandings({
  standings,
  language,
}: {
  standings: readonly QuizshowRecapStanding[];
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);
  if (standings.length === 0) return null;
  return (
    <div className={styles.standings}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.standingsToggle}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {t(
          isOpen
            ? "quizshow:results.standingsHide"
            : "quizshow:results.standingsShow",
        )}
        <FiChevronDown
          aria-hidden="true"
          fill="none"
          className={styles.toggleChevron}
          data-is-open={isOpen}
        />
      </Button>
      <div id={listId}>
        <Collapse isOpen={isOpen}>
          <ol
            className={styles.standingsList}
            aria-label={t("quizshow:results.standings")}
          >
            {standings.map((standing) => (
              <StandingRow
                key={`${standing.rank}-${standing.kind}-${standing.name}`}
                standing={standing}
                total={standings.length}
                language={language}
              />
            ))}
          </ol>
        </Collapse>
      </div>
    </div>
  );
}

/** Totals for hosts, the full standings, and how each question went. */
export function QuizshowRecap({ recap, language, scope }: QuizshowRecapProps) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<QuizshowRecapSort>("playOrder");
  const quizQuery = useQuizshowQuiz(scope, { isEnabled: true });
  const questions = sortRecapQuestions(recap.questions, sort);
  return (
    <div className={styles.recap}>
      <h3 className={styles.recapTitle}>{t("quizshow:results.recap.title")}</h3>
      <p className={styles.recapSub}>
        {t(
          recap.standings.length > 0
            ? "quizshow:results.recap.subWithStandings"
            : "quizshow:results.recap.sub",
        )}
      </p>
      <p className={styles.recapTotals}>
        {t("quizshow:results.recap.questions", {
          count: recap.questionsPlayed,
        })}
        {" · "}
        {t("quizshow:results.recap.answers", { count: recap.answersGiven })}
      </p>
      <RecapStandings standings={recap.standings} language={language} />
      <SegmentedControl
        className={styles.recapSort}
        label={t("quizshow:results.sort.label")}
        options={QUIZSHOW_RECAP_SORTS.map((value) => ({
          value,
          label: t(QUIZSHOW_RECAP_SORT_LABEL_KEYS[value]),
        }))}
        value={sort}
        onChange={(value) => {
          if (isQuizshowRecapSort(value)) setSort(value);
        }}
      />
      <ol className={styles.recapList}>
        {questions.map((question) => (
          <RecapRow
            key={`${question.roundIndex}-${question.questionIndex}`}
            question={question}
            language={language}
            scope={scope}
            isEditable={isQuestionStillThere(quizQuery.data, question)}
          />
        ))}
      </ol>
    </div>
  );
}
