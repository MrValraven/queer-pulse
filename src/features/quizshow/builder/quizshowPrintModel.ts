import type {
  QuizshowClosestTolerance,
  QuizshowLanguageMode,
  QuizshowPlayableRoundKind,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { readPhaseMsFor } from "../engine/quizshowEngineSetup";
import type { QuizshowPrintSheet } from "../quizshowPaths";
import {
  displayRoundNumber,
  isQuizRoundKind,
  isWheelRoundKind,
} from "../quizshowWheel";
import { optionLetter } from "../stage/quizshowText";

const MS_PER_SECOND = 1_000;
/** The engine's read phase never runs under this, so the printed time keeps it too. */
const MIN_PRINTED_READ_SECONDS = 3;

/** One option as the host sheet lists it: its letter on the screen and its text. */
export interface QuizshowPrintOption {
  letter: string;
  text: QuizshowText;
  /** MC only: one of the right options. */
  isCorrect: boolean;
}

/** What the host reads out at the reveal. `none` covers a poll, a party prompt with no truth and an answer not set yet. */
export type QuizshowPrintAnswer =
  /** MC: the letters of every correct option, as the option list above them names them. */
  | { kind: "options"; letters: string[] }
  | { kind: "trueFalse"; isTrue: boolean }
  | { kind: "typed"; text: QuizshowText; acceptedAnswers: string[] }
  | {
      kind: "closest";
      value: number;
      tolerance: QuizshowClosestTolerance;
      unit: QuizshowText;
    }
  /** Order: the option letters in the right sequence. */
  | { kind: "order"; letters: string[] }
  | { kind: "truth"; text: QuizshowText }
  | { kind: "poll" }
  | { kind: "none"; isMissing: boolean };

/** Quiz rounds: the read phase, then the limit (and the talk time in teams play). Party rounds: write, then vote. */
export type QuizshowPrintTiming =
  | {
      kind: "quiz";
      readSeconds: number;
      limitSeconds: number;
      talkSeconds: number;
    }
  | { kind: "party"; writeSeconds: number; voteSeconds: number };

export interface QuizshowPrintHostRow {
  questionId: string;
  /** 1-based within its round. */
  questionNumber: number;
  type: QuizshowQuestion["type"];
  prompt: QuizshowText;
  /** A question with a picture: its description, or null when none was written. Null without a picture. */
  picture: { alt: QuizshowText | null } | null;
  /** MC, poll and order options in authored order with their screen letters; [] on every other type. */
  options: QuizshowPrintOption[];
  answer: QuizshowPrintAnswer;
  /** The reveal note; null when blank in both languages. */
  note: QuizshowText | null;
  timing: QuizshowPrintTiming;
}

interface QuizshowPrintRoundBase {
  /** The row's index in `quiz.rounds`. */
  roundIndex: number;
  /** "Round 3": wheel rows are not counted. */
  roundNumber: number;
  kind: QuizshowPlayableRoundKind;
  title: QuizshowText;
  isWarmUp: boolean;
}

export interface QuizshowPrintHostRound extends QuizshowPrintRoundBase {
  rows: QuizshowPrintHostRow[];
}

/** One numbered line of an answer sheet: letter boxes for MC and poll, True and False boxes, or a written line. */
export type QuizshowPrintAnswerLine = { questionNumber: number } & (
  | { kind: "letters"; letters: string[] }
  | { kind: "trueFalse" }
  | { kind: "write" }
);

export interface QuizshowPrintAnswerRound extends QuizshowPrintRoundBase {
  lines: QuizshowPrintAnswerLine[];
}

/** `?sheet=answers` picks the answer sheets; anything else (or nothing) the host sheet. */
export function printSheetOf(param: string | null): QuizshowPrintSheet {
  return param === "answers" ? "answers" : "host";
}

/** Blank in both languages reads as no text. */
export function isBlankText(text: QuizshowText): boolean {
  return text.en.trim() === "" && text.pt.trim() === "";
}

function optionsOf(question: QuizshowQuestion): QuizshowPrintOption[] {
  if (
    question.type !== "multiple_choice" &&
    question.type !== "poll" &&
    question.type !== "order"
  ) {
    return [];
  }
  const correctIndexes =
    question.type === "multiple_choice" && question.answer !== null
      ? question.answer.correctIndexes
      : [];
  return question.options.map((option, optionIndex) => ({
    letter: optionLetter(optionIndex),
    text: option.text,
    isCorrect: correctIndexes.includes(optionIndex),
  }));
}

/** The authored letters of the order options, in the right sequence. */
function orderedLettersOf(
  question: Extract<QuizshowQuestion, { type: "order" }>,
  orderedIds: readonly string[],
): string[] {
  const letterById = new Map(
    question.options.map((option, optionIndex) => [
      option.id,
      optionLetter(optionIndex),
    ]),
  );
  return orderedIds.flatMap((optionId) => {
    const letter = letterById.get(optionId);
    return letter === undefined ? [] : [letter];
  });
}

function answerOf(question: QuizshowQuestion): QuizshowPrintAnswer {
  switch (question.type) {
    case "multiple_choice":
      return question.answer === null
        ? { kind: "none", isMissing: true }
        : {
            kind: "options",
            // Ascending, so the letters read in the order the option list prints them.
            letters: [...question.answer.correctIndexes]
              .sort((left, right) => left - right)
              .map(optionLetter),
          };
    case "true_false":
      return question.answer === null
        ? { kind: "none", isMissing: true }
        : { kind: "trueFalse", isTrue: question.answer.isTrue };
    case "type_answer":
      return question.answer === null
        ? { kind: "none", isMissing: true }
        : {
            kind: "typed",
            text: question.answer.text,
            acceptedAnswers: question.acceptedAnswers,
          };
    case "closest_number":
      return question.answer === null
        ? { kind: "none", isMissing: true }
        : {
            kind: "closest",
            value: question.answer.value,
            tolerance: question.answer.tolerance,
            unit: question.numberUnit,
          };
    case "order":
      return question.answer === null
        ? { kind: "none", isMissing: true }
        : {
            kind: "order",
            letters: orderedLettersOf(question, question.answer.orderedIds),
          };
    case "prompt":
      // Lie Detector keeps a truth; Caption This and Drag Name have no answer to read out.
      return question.answer === null || isBlankText(question.answer.truth)
        ? { kind: "none", isMissing: false }
        : { kind: "truth", text: question.answer.truth };
    case "poll":
      return { kind: "poll" };
    default: {
      const unknownQuestion: never = question;
      return unknownQuestion;
    }
  }
}

function timingOf(
  round: QuizshowRound,
  question: QuizshowQuestion,
  languages: QuizshowLanguageMode,
): QuizshowPrintTiming {
  if (!isQuizRoundKind(round.kind)) {
    return {
      kind: "party",
      writeSeconds: round.settings.writeSeconds,
      voteSeconds: round.settings.voteSeconds,
    };
  }
  const readMs = readPhaseMsFor(question, languages);
  return {
    kind: "quiz",
    // Whole seconds with the 3 s minimum kept: "3.8s to read" is no number a
    // host can time, and the read phase moves in 25 ms steps.
    readSeconds: Math.max(
      MIN_PRINTED_READ_SECONDS,
      Math.round(readMs / MS_PER_SECOND),
    ),
    limitSeconds: question.timeLimitSeconds ?? round.settings.timeLimitSeconds,
    talkSeconds: round.settings.talkSeconds,
  };
}

function hostRowOf(
  round: QuizshowRound,
  question: QuizshowQuestion,
  questionIndex: number,
  languages: QuizshowLanguageMode,
): QuizshowPrintHostRow {
  return {
    questionId: question.id,
    questionNumber: questionIndex + 1,
    type: question.type,
    prompt: question.prompt,
    picture:
      question.mediaRef === null
        ? null
        : { alt: isBlankText(question.mediaAlt) ? null : question.mediaAlt },
    options: optionsOf(question),
    answer: answerOf(question),
    note:
      question.type === "prompt" || isBlankText(question.revealNote)
        ? null
        : question.revealNote,
    timing: timingOf(round, question, languages),
  };
}

/** Every row that holds questions, with its index and its "Round N" number; wheel rows and empty rounds are left out. */
function playableRoundsOf(
  quiz: QuizshowQuiz,
): Array<{ round: QuizshowRound; base: QuizshowPrintRoundBase }> {
  return quiz.rounds.flatMap((round, roundIndex) => {
    if (isWheelRoundKind(round.kind) || round.questions.length === 0) {
      return [];
    }
    const kind: QuizshowPlayableRoundKind = round.kind;
    return [
      {
        round,
        base: {
          roundIndex,
          roundNumber: displayRoundNumber(quiz.rounds, roundIndex),
          kind,
          title: round.title,
          isWarmUp: round.settings.isWarmUp,
        },
      },
    ];
  });
}

/**
 * The host sheet (item 62): every playable question in authored order, with
 * its round and number, the prompt, the options with their letters, the
 * answer, the reveal note and the timing (the read phase from
 * `readPhaseMsFor` plus the limit). Rounds in a wheel's range keep their
 * authored order: the wheel picks among them live. Pure.
 */
export function buildHostSheet(quiz: QuizshowQuiz): QuizshowPrintHostRound[] {
  return playableRoundsOf(quiz).map(({ round, base }) => ({
    ...base,
    rows: round.questions.map((question, questionIndex) =>
      hostRowOf(round, question, questionIndex, quiz.languages),
    ),
  }));
}

function answerLineOf(
  question: QuizshowQuestion,
  questionIndex: number,
): QuizshowPrintAnswerLine {
  const questionNumber = questionIndex + 1;
  if (question.type === "multiple_choice" || question.type === "poll") {
    return {
      questionNumber,
      kind: "letters",
      letters: question.options.map((_option, optionIndex) =>
        optionLetter(optionIndex),
      ),
    };
  }
  if (question.type === "true_false")
    return { questionNumber, kind: "trueFalse" };
  return { questionNumber, kind: "write" };
}

/**
 * The team answer sheets (item 62): one page per round with a numbered line
 * per question; MC and poll lines carry a letter box per option, true or
 * false lines a True and a False box. Pure.
 */
export function buildAnswerSheets(
  quiz: QuizshowQuiz,
): QuizshowPrintAnswerRound[] {
  return playableRoundsOf(quiz).map(({ round, base }) => ({
    ...base,
    lines: round.questions.map(answerLineOf),
  }));
}
