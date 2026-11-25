import { useId, useRef, useState, type RefObject } from "react";
import type { IconType } from "react-icons";
import {
  FiCheck,
  FiChevronDown,
  FiDownload,
  FiMinus,
  FiX,
} from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  summariseNight,
  type QuizshowNightEntry,
  type QuizshowNightSummary,
} from "../realtime/quizshowNightLog";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { quizshowPlaceOf } from "../stage/quizshowOrdinal";
import {
  pickQuizshowText,
  pickQuizshowTextWithLanguage,
  quizshowAnswerNumberFormatter,
} from "../stage/quizshowText";
import styles from "./QuizshowPlayerEnd.module.css";
import {
  drawYourNightImage,
  QuizshowNightImageError,
  shareOrDownloadNightImage,
  type QuizshowNightImageContent,
  type QuizshowNightImageFailure,
} from "./quizshowYourNightImage";
import type { QuizshowFinalPlace } from "./usePlayJoin";

/** The card's facts as sentences: the same lines the saved image prints. */
function nightFactsOf(
  summary: QuizshowNightSummary,
  finalPlace: QuizshowFinalPlace | null,
  {
    t,
    language,
    isTeams,
    formatNumber,
  }: {
    t: TFunction;
    language: QuizshowLanguage;
    isTeams: boolean;
    /** The locale's number format, so 2300 reads "2,300" or "2 300". */
    formatNumber: (value: number) => string;
  },
): string[] {
  const facts: string[] = [];
  if (summary.answeredCount > 0) {
    facts.push(
      t("quizshow:player.night.right", {
        right: summary.rightCount,
        answered: summary.answeredCount,
      }),
    );
  }
  facts.push(
    t("quizshow:player.night.bestStreak", { streak: summary.bestStreak }),
  );
  if (summary.jokerPoints > 0) {
    facts.push(
      t("quizshow:player.night.jokerPoints", {
        points: formatNumber(summary.jokerPoints),
      }),
    );
  }
  if (summary.finalPlace !== null && finalPlace !== null) {
    facts.push(
      t(
        isTeams
          ? "quizshow:player.night.teamPlace"
          : "quizshow:player.night.place",
        {
          place: quizshowPlaceOf(
            summary.finalPlace,
            finalPlace.total,
            language,
            t,
          ),
        },
      ),
    );
  }
  return facts;
}

/** The player's own answer as words, with the language of quiz text when it fell back. */
function answerTextOf(
  entry: QuizshowNightEntry,
  language: QuizshowLanguage,
  t: TFunction,
  formatAnswerNumber: (value: number) => string,
): { text: string; language?: QuizshowLanguage } | null {
  const payload = entry.myAnswer?.payload;
  if (payload === undefined) return null;
  const options = entry.question.options ?? [];
  switch (payload.type) {
    case "multiple_choice":
    case "poll": {
      const option = options[payload.optionIndex];
      return option === undefined
        ? null
        : pickQuizshowTextWithLanguage(option.text, language);
    }
    case "true_false":
      return {
        text: t(
          payload.isTrue
            ? "quizshow:questions.trueFalse.true"
            : "quizshow:questions.trueFalse.false",
        ),
      };
    case "type_answer":
    case "prompt":
      return { text: payload.text };
    case "order":
      return {
        text: payload.orderedIds
          .map((optionId) => options.find((option) => option.id === optionId))
          .filter((option) => option !== undefined)
          .map((option) => pickQuizshowText(option.text, language))
          .join(", "),
      };
    case "closest_number": {
      const unit = pickQuizshowText(entry.question.numberUnit, language).trim();
      const number = formatAnswerNumber(payload.value);
      return { text: unit === "" ? number : `${number} ${unit}` };
    }
  }
}

interface AnswerMark {
  kind: "right" | "wrong" | "none";
  Icon: IconType;
  /** Spoken beside the icon; null when the answer line already says it. */
  labelKey: string | null;
}

/**
 * Right, wrong or unanswered from the reveal. A poll scores nothing and a
 * question without its reveal has no verdict yet, so both get no mark. An
 * unanswered row's answer line says "No answer this time", so its mark stays
 * silent and the row is read once.
 */
function markOf(entry: QuizshowNightEntry): AnswerMark | null {
  const reveal = entry.myReveal;
  if (reveal === null || entry.question.type === "poll") return null;
  if (!reveal.hasAnswered) {
    return { kind: "none", Icon: FiMinus, labelKey: null };
  }
  if (reveal.isCorrect === true) {
    return { kind: "right", Icon: FiCheck, labelKey: "quizshow:player.right" };
  }
  if (reveal.isCorrect === false) {
    return { kind: "wrong", Icon: FiX, labelKey: "quizshow:player.wrong" };
  }
  return null;
}

function hasText(text: QuizshowText | null): text is QuizshowText {
  return text !== null && (text.en.trim() !== "" || text.pt.trim() !== "");
}

function NightAnswerRow({ entry }: { entry: QuizshowNightEntry }) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const mark = markOf(entry);
  // A reveal that says "not answered" wins over a stored answer that arrived too late.
  const answer =
    mark?.kind === "none"
      ? null
      : answerTextOf(
          entry,
          language,
          t,
          quizshowAnswerNumberFormatter(format.number),
        );
  return (
    <li className={styles.answerRow}>
      <span className={styles.answerMark} data-mark={mark?.kind ?? "empty"}>
        {mark !== null && (
          <>
            <mark.Icon aria-hidden="true" focusable="false" fill="none" />
            {mark.labelKey !== null && (
              <span className="visuallyHidden">{t(mark.labelKey)}</span>
            )}
          </>
        )}
      </span>
      <div className={styles.answerBody}>
        <QuizshowStageText
          as="p"
          className={styles.answerPrompt}
          text={entry.question.prompt}
          language={language}
        />
        <p className={styles.answerMine} lang={answer?.language}>
          {answer === null ? t("quizshow:player.noAnswer") : answer.text}
        </p>
        {hasText(entry.note) && (
          <QuizshowStageText
            as="p"
            className={styles.answerNote}
            text={entry.note}
            language={language}
          />
        )}
      </div>
    </li>
  );
}

/** "Answers": the night's questions, folded away until the player opens them. */
function NightAnswers({
  nightLog,
}: {
  nightLog: readonly QuizshowNightEntry[];
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.answers}>
      <Button
        variant="stage-ghost"
        className={styles.answersToggle}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {t("quizshow:player.night.answers")}
        <FiChevronDown
          aria-hidden="true"
          focusable="false"
          fill="none"
          className={styles.answersChevron}
          data-open={isOpen}
        />
      </Button>
      <Collapse isOpen={isOpen}>
        <ol className={styles.answerList}>
          {nightLog.map((entry) => (
            <NightAnswerRow key={entry.questionId} entry={entry} />
          ))}
        </ol>
      </Collapse>
    </div>
  );
}

const NIGHT_IMAGE_FAILURE_KEYS: Record<QuizshowNightImageFailure, string> = {
  styles_missing: "quizshow:player.night.imageStylesFailed",
  canvas_unavailable: "quizshow:player.night.imageCanvasFailed",
  png_unavailable: "quizshow:player.night.imagePngFailed",
};

function failureKeyOf(error: unknown): string {
  if (error instanceof QuizshowNightImageError) {
    return NIGHT_IMAGE_FAILURE_KEYS[error.failure];
  }
  return "quizshow:player.night.imageSaveFailed";
}

/** Draws the card and shares or downloads it, all on this device. */
function useSaveNightImage(
  cardRef: RefObject<HTMLElement | null>,
  content: QuizshowNightImageContent,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const save = async () => {
    const card = cardRef.current;
    if (card === null || isSaving) return;
    setIsSaving(true);
    try {
      const image = await drawYourNightImage(card, content);
      await shareOrDownloadNightImage(image, content.heading);
    } catch (error) {
      showToast(t(failureKeyOf(error)), "error");
    } finally {
      setIsSaving(false);
    }
  };
  return { isSaving, save };
}

interface QuizshowYourNightProps {
  /** The store's memory-only log of this player's questions. */
  nightLog: readonly QuizshowNightEntry[];
  /** The place and the entrant count it is out of; null when unknown. */
  finalPlace: QuizshowFinalPlace | null;
  quizTitle: string;
  /** Teams play: the place is the team's. */
  isTeams: boolean;
}

/**
 * "Your night" (item 15): how the player did, read only from frames this phone
 * already holds. Nothing here is sent or stored; "Save image" draws locally.
 */
export function QuizshowYourNight({
  nightLog,
  finalPlace,
  quizTitle,
  isTeams,
}: QuizshowYourNightProps) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const summary = summariseNight(nightLog, finalPlace?.place ?? null);
  const facts = nightFactsOf(summary, finalPlace, {
    t,
    language,
    isTeams,
    formatNumber: format.number,
  });
  const heading = t("quizshow:player.night.title");
  const { isSaving, save } = useSaveNightImage(cardRef, {
    heading,
    quizTitle,
    facts,
  });
  return (
    <section ref={cardRef} className={styles.night} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.nightTitle}>
        {heading}
      </h2>
      <ul className={styles.nightFacts}>
        {facts.map((fact) => (
          <li key={fact} className={styles.nightFact}>
            {fact}
          </li>
        ))}
      </ul>
      <Button
        variant="stage-ghost"
        className={styles.saveImage}
        disabled={isSaving}
        onClick={() => void save()}
      >
        <FiDownload aria-hidden="true" focusable="false" fill="none" />
        {t("quizshow:player.night.saveImage")}
      </Button>
      <NightAnswers nightLog={nightLog} />
    </section>
  );
}
