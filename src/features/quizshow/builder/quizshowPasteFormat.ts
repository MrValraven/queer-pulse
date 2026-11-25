import {
  QUIZSHOW_LIMITS,
  type QuizshowClosestTolerance,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowPlayableRoundKind,
  type QuizshowQuestionInput,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  isWheelRoundKind,
  playableRoundCount,
  wheelRoundIndexOfRange,
  wheelSliceRoundIndexes,
} from "../quizshowWheel";
import {
  defaultRoundSettings,
  newQuestion,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "./quizshowDraft";

/**
 * Paste questions (contract 9.2 item 22). The browser reads the host's text
 * and adds it to the draft; nothing is uploaded. Every parser here is pure and
 * never throws: a line it cannot read becomes an issue with its line number.
 */

/** One line the host has to fix. `values` fill the catalog sentence of `reasonKey`. */
export interface QuizshowImportIssue {
  line: number;
  reasonKey: string;
  values?: Record<string, string | number>;
}

export interface QuizshowImportedQuestion {
  /** The line the question starts on (its `Q:` line, or its CSV row). */
  line: number;
  question: QuizshowQuestionInput;
}

export interface QuizshowImportedRound {
  /** The line the round starts on. */
  line: number;
  kind: QuizshowPlayableRoundKind;
  title: QuizshowText;
  questions: QuizshowImportedQuestion[];
}

export interface QuizshowImportResult {
  rounds: QuizshowImportedRound[];
  issues: QuizshowImportIssue[];
}

const ISSUE_KEY_PREFIX = "quizshow:studio.paste.issue.";

/**
 * The most text the paste box takes: a full quiz of `questionsPerQuizMax`
 * questions with every text at its limit fits with room to spare.
 */
export const QUIZSHOW_PASTE_TEXT_MAX = 100_000;

export function importIssue(
  line: number,
  reason: string,
  values?: Record<string, string | number>,
): QuizshowImportIssue {
  return values === undefined
    ? { line, reasonKey: `${ISSUE_KEY_PREFIX}${reason}` }
    : { line, reasonKey: `${ISSUE_KEY_PREFIX}${reason}`, values };
}

/** The index of the first bar that is not written `\|`; -1 when there is none. */
function separatorIndexOf(raw: string): number {
  for (let index = 0; index < raw.length; index += 1) {
    const character = raw.charAt(index);
    if (character === "\\" && raw.charAt(index + 1) === "|") {
      index += 1;
    } else if (character === "|") {
      return index;
    }
  }
  return -1;
}

function unescapedBarsOf(text: string): string {
  return text.trim().replaceAll("\\|", "|");
}

/** A text with each bar written `\|`, so `importedTextOf` reads it back as text. */
export function escapedBarsOf(text: string): string {
  return text.replaceAll("|", "\\|");
}

/**
 * A text cell or line as both languages: `EN | PT` splits at the first bar,
 * and `\|` is a bar inside the text. Without a bar the text goes to the
 * quiz's language (English for a quiz in both languages, so the studio marks
 * the Portuguese side as missing).
 */
export function importedTextOf(
  raw: string,
  languages: QuizshowLanguageMode,
): QuizshowText {
  const separatorIndex = separatorIndexOf(raw);
  if (separatorIndex === -1) {
    const text = unescapedBarsOf(raw);
    return languages === "pt" ? { en: "", pt: text } : { en: text, pt: "" };
  }
  return {
    en: unescapedBarsOf(raw.slice(0, separatorIndex)),
    pt: unescapedBarsOf(raw.slice(separatorIndex + 1)),
  };
}

/** `tooLong` when either language of `text` runs past `max` characters; null when both fit. */
export function textLengthIssueOf(
  line: number,
  text: QuizshowText,
  max: number,
): QuizshowImportIssue | null {
  return text.en.length > max || text.pt.length > max
    ? importIssue(line, "tooLong", { max })
    : null;
}

/** `emptyOption` for the first option with no text in either language; null when every option has text. */
export function emptyOptionIssueOf(
  line: number,
  options: readonly QuizshowText[],
): QuizshowImportIssue | null {
  const emptyIndex = options.findIndex(
    (text) => text.en === "" && text.pt === "",
  );
  return emptyIndex === -1
    ? null
    : importIssue(line, "emptyOption", { number: emptyIndex + 1 });
}

/** The first issue of `checks` (in order); null when every check passes. */
export function firstIssueOf(
  checks: ReadonlyArray<() => QuizshowImportIssue | null>,
): QuizshowImportIssue | null {
  for (const check of checks) {
    const issue = check();
    if (issue !== null) return issue;
  }
  return null;
}

const CLOSEST_ANSWER_PATTERN =
  /^(-?\d+(?:\.\d+)?)(?:\s*~\s*(\d+(?:\.\d+)?)\s*(%)?)?$/;
/** A number followed by a margin sign: meant as a closest answer even when the margin is wrong. */
const CLOSEST_ATTEMPT_PATTERN = /^-?\d+(?:\.\d+)?\s*~/;

export type QuizshowClosestAnswer = {
  value: number;
  tolerance: QuizshowClosestTolerance;
};

function toleranceOf(
  amountText: string | undefined,
  isPercent: boolean,
): QuizshowClosestTolerance | null {
  if (amountText === undefined) return { mode: "exact", amount: 0 };
  const amount = Number(amountText);
  if (amount === 0) return { mode: "exact", amount: 0 };
  if (isPercent) {
    const isInRange =
      Number.isInteger(amount) &&
      amount >= QUIZSHOW_LIMITS.closestPercentMin &&
      amount <= QUIZSHOW_LIMITS.closestPercentMax;
    return isInRange ? { mode: "percent", amount } : null;
  }
  return amount <= QUIZSHOW_LIMITS.numberAbsMax
    ? { mode: "absolute", amount }
    : null;
}

/**
 * `1969` (exact), `1969 ~10` (within 10) or `1969 ~10%` (within 10 percent).
 * "invalid" when the text is a number with a margin that does not fit;
 * null when the text is no number at all (a typed answer).
 */
export function closestAnswerOf(
  text: string,
): QuizshowClosestAnswer | "invalid" | null {
  const trimmed = text.trim();
  const match = CLOSEST_ANSWER_PATTERN.exec(trimmed);
  if (match === null) {
    return CLOSEST_ATTEMPT_PATTERN.test(trimmed) ? "invalid" : null;
  }
  const value = Number(match[1]);
  const tolerance = toleranceOf(match[2], match[3] === "%");
  if (tolerance === null || Math.abs(value) > QUIZSHOW_LIMITS.numberAbsMax) {
    return "invalid";
  }
  return { value, tolerance };
}

const EXPONENT_PATTERN = /^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/;

/**
 * A number in plain digits, the shortest text that reads back as the same
 * number: `String` writes 1e-7 for 0.0000001, which `closestAnswerOf` refuses.
 */
export function plainNumberTextOf(value: number): string {
  const text = String(value);
  const match = EXPONENT_PATTERN.exec(text);
  if (match === null) return text;
  const [, sign = "", leadDigit = "", fraction = "", exponentText = "0"] =
    match;
  const digits = `${leadDigit}${fraction}`;
  const exponent = Number(exponentText);
  if (exponent < 0) return `${sign}0.${"0".repeat(-exponent - 1)}${digits}`;
  return `${sign}${digits}${"0".repeat(Math.max(exponent - fraction.length, 0))}`;
}

/** The closest answer as a cell or an `A:` line: the inverse of `closestAnswerOf`. */
export function closestAnswerTextOf(answer: QuizshowClosestAnswer): string {
  const { tolerance } = answer;
  const value = plainNumberTextOf(answer.value);
  const amount = plainNumberTextOf(tolerance.amount);
  if (tolerance.mode === "absolute") return `${value} ~${amount}`;
  if (tolerance.mode === "percent") return `${value} ~${amount}%`;
  return value;
}

/** Option ids in order: a, b, c, and so on. */
export function importedOptionsOf(
  texts: readonly QuizshowText[],
): QuizshowOption[] {
  return texts.map((text, optionIndex) => ({
    id: String.fromCharCode("a".charCodeAt(0) + optionIndex),
    text,
  }));
}

/** The option count issue for a type that holds `min` to `max` options; null when it fits. */
export function optionCountIssueOf(
  line: number,
  optionCount: number,
  min: number,
  max: number,
): QuizshowImportIssue | null {
  if (optionCount < min) return importIssue(line, "tooFewOptions", { min });
  if (optionCount > max) return importIssue(line, "tooManyOptions", { max });
  return null;
}

/** Marks that leave no option wrong break contract 6.22. */
export function correctMarksIssueOf(
  line: number,
  correctIndexes: readonly number[],
  optionCount: number,
): QuizshowImportIssue | null {
  if (correctIndexes.length === 0) return importIssue(line, "noCorrect");
  if (correctIndexes.length >= optionCount) {
    return importIssue(line, "allCorrect");
  }
  return null;
}

interface PastedOption {
  line: number;
  text: string;
  isCorrect: boolean;
}

interface PendingQuestion {
  line: number;
  prompt: string;
  options: PastedOption[];
  answer: { text: string; line: number } | null;
}

type BuiltQuestion =
  { question: QuizshowQuestionInput } | { issue: QuizshowImportIssue };

function multipleChoiceOf(
  pending: PendingQuestion,
  languages: QuizshowLanguageMode,
): BuiltQuestion {
  const correctIndexes = pending.options.flatMap((option, optionIndex) =>
    option.isCorrect ? [optionIndex] : [],
  );
  const prompt = importedTextOf(pending.prompt, languages);
  const optionTexts = pending.options.map((option) =>
    importedTextOf(option.text, languages),
  );
  // The count comes first: one option is too few, whatever its mark says.
  const issue = firstIssueOf([
    () =>
      optionCountIssueOf(
        pending.line,
        pending.options.length,
        QUIZSHOW_LIMITS.multipleChoiceOptionsMin,
        QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
      ),
    () =>
      correctMarksIssueOf(pending.line, correctIndexes, pending.options.length),
    () => textLengthIssueOf(pending.line, prompt, QUIZSHOW_LIMITS.promptMax),
    () => emptyOptionIssueOf(pending.line, optionTexts),
    ...pending.options.map(
      (option, optionIndex) => () =>
        textLengthIssueOf(
          option.line,
          optionTexts[optionIndex] ?? { en: "", pt: "" },
          QUIZSHOW_LIMITS.optionTextMax,
        ),
    ),
  ]);
  if (issue !== null) return { issue };
  return {
    question: {
      ...newQuestion("multiple_choice", "quiz"),
      prompt,
      options: importedOptionsOf(optionTexts),
      answer: { correctIndexes },
    },
  };
}

function answeredQuestionOf(
  pending: PendingQuestion,
  answer: { text: string; line: number },
  languages: QuizshowLanguageMode,
): BuiltQuestion {
  const prompt = importedTextOf(pending.prompt, languages);
  if (answer.text.trim() === "") {
    return { issue: importIssue(answer.line, "emptyAnswer") };
  }
  const promptIssue = textLengthIssueOf(
    pending.line,
    prompt,
    QUIZSHOW_LIMITS.promptMax,
  );
  if (promptIssue !== null) return { issue: promptIssue };
  const closest = closestAnswerOf(answer.text);
  if (closest === "invalid") {
    return {
      issue: importIssue(answer.line, "badClosest", {
        min: QUIZSHOW_LIMITS.closestPercentMin,
        max: QUIZSHOW_LIMITS.closestPercentMax,
      }),
    };
  }
  if (closest !== null) {
    return {
      question: {
        ...newQuestion("closest_number", "quiz"),
        prompt,
        answer: closest,
      },
    };
  }
  const answerText = importedTextOf(answer.text, languages);
  const answerIssue = textLengthIssueOf(
    answer.line,
    answerText,
    QUIZSHOW_LIMITS.answerTextMax,
  );
  if (answerIssue !== null) return { issue: answerIssue };
  return {
    question: {
      ...newQuestion("type_answer", "quiz"),
      prompt,
      answer: { text: answerText },
    },
  };
}

function pastedQuestionOf(
  pending: PendingQuestion,
  languages: QuizshowLanguageMode,
): BuiltQuestion {
  const hasOptions = pending.options.length > 0;
  if (hasOptions && pending.answer !== null) {
    return { issue: importIssue(pending.line, "mixedAnswer") };
  }
  if (hasOptions) return multipleChoiceOf(pending, languages);
  if (pending.answer !== null) {
    return answeredQuestionOf(pending, pending.answer, languages);
  }
  return { issue: importIssue(pending.line, "noAnswer") };
}

/** Round-level checks: a round with no questions, and one past `questionsPerRoundMax`. */
export function roundIssuesOf(
  rounds: readonly QuizshowImportedRound[],
): QuizshowImportIssue[] {
  const issues: QuizshowImportIssue[] = [];
  for (const round of rounds) {
    const firstOverQuestion =
      round.questions[QUIZSHOW_LIMITS.questionsPerRoundMax];
    if (firstOverQuestion !== undefined) {
      issues.push(
        importIssue(firstOverQuestion.line, "roundTooLong", {
          max: QUIZSHOW_LIMITS.questionsPerRoundMax,
        }),
      );
    }
  }
  return issues;
}

// Anchored, with no two parts that can match the same characters, so a long
// line never backtracks; the s flag lets a pasted U+2028 sit inside a text.
const OPTION_LINE_PATTERN = /^([-*])\s+(\S.*)$/s;
const PREFIXED_LINE_PATTERN = /^([QqAa]):(.*)$/s;

interface PasteState {
  rounds: QuizshowImportedRound[];
  issues: QuizshowImportIssue[];
  pending: PendingQuestion | null;
  /** True after a stray option or A: line, so the lines after it raise one issue in all until a blank, # or Q: line. */
  isSkippingQuestion: boolean;
  /** Rounds with at least one Q: line, read or refused; only the others are empty. */
  roundsWithQuestions: Set<QuizshowImportedRound>;
}

function finishQuestion(
  state: PasteState,
  languages: QuizshowLanguageMode,
): void {
  const { pending } = state;
  state.pending = null;
  state.isSkippingQuestion = false;
  if (pending === null) return;
  const currentRound = state.rounds.at(-1);
  if (currentRound !== undefined) state.roundsWithQuestions.add(currentRound);
  const built = pastedQuestionOf(pending, languages);
  if ("issue" in built) {
    state.issues.push(built.issue);
    return;
  }
  let round = state.rounds.at(-1);
  if (round === undefined) {
    // An untitled first block: the studio shows it as the next round number.
    round = {
      line: pending.line,
      kind: "quiz",
      title: { en: "", pt: "" },
      questions: [],
    };
    state.rounds.push(round);
  }
  round.questions.push({ line: pending.line, question: built.question });
}

function readPastedLine(
  state: PasteState,
  rawLine: string,
  line: number,
  languages: QuizshowLanguageMode,
): void {
  const text = rawLine.trim();
  if (text === "") {
    finishQuestion(state, languages);
    return;
  }
  if (text.startsWith("#")) {
    finishQuestion(state, languages);
    const title = importedTextOf(text.replace(/^#+/, ""), languages);
    const titleIssue = textLengthIssueOf(
      line,
      title,
      QUIZSHOW_LIMITS.roundTitleMax,
    );
    if (titleIssue !== null) state.issues.push(titleIssue);
    state.rounds.push({ line, kind: "quiz", title, questions: [] });
    return;
  }
  const prefixed = PREFIXED_LINE_PATTERN.exec(text);
  if (prefixed !== null && prefixed[1]?.toUpperCase() === "Q") {
    finishQuestion(state, languages);
    state.pending = {
      line,
      prompt: prefixed[2] ?? "",
      options: [],
      answer: null,
    };
    return;
  }
  const optionLine = OPTION_LINE_PATTERN.exec(text);
  if (prefixed === null && optionLine === null) {
    state.issues.push(importIssue(line, "unknownLine"));
    return;
  }
  const { pending } = state;
  if (pending === null) {
    if (!state.isSkippingQuestion)
      state.issues.push(importIssue(line, "noQuestion"));
    state.isSkippingQuestion = true;
    return;
  }
  if (optionLine !== null) {
    pending.options.push({
      line,
      text: optionLine[2] ?? "",
      isCorrect: optionLine[1] === "*",
    });
    return;
  }
  if (pending.answer !== null) {
    state.issues.push(importIssue(line, "twoAnswers"));
    return;
  }
  pending.answer = { text: prefixed?.[2] ?? "", line };
}

/**
 * The paste grammar (contract 9.2 item 22): `# Round title` starts a quiz
 * round; `Q: EN text | PT text` a question; `- text` an option and `* text` a
 * correct option (several allowed); `A: answer` a typed answer, or a closest
 * number when it is a number (`A: 1969 ~10`, `A: 1969 ~10%`, bare = exact);
 * a blank line ends a question. Polls come in through CSV only.
 */
export function parsePastedQuestions(
  text: string,
  languages: QuizshowLanguageMode,
): QuizshowImportResult {
  const state: PasteState = {
    rounds: [],
    issues: [],
    pending: null,
    isSkippingQuestion: false,
    roundsWithQuestions: new Set(),
  };
  const lines = String(text).split(/\r\n|\r|\n/);
  lines.forEach((rawLine, lineIndex) =>
    readPastedLine(state, rawLine, lineIndex + 1, languages),
  );
  finishQuestion(state, languages);
  const emptyRoundIssues = state.rounds
    .filter(
      (round) =>
        round.questions.length === 0 && !state.roundsWithQuestions.has(round),
    )
    .map((round) => importIssue(round.line, "emptyRound"));
  return {
    rounds: state.rounds.filter((round) => round.questions.length > 0),
    issues: [
      ...state.issues,
      ...emptyRoundIssues,
      ...roundIssuesOf(state.rounds),
    ],
  };
}

/** Every question the import adds. */
export function importedQuestionCountOf(
  rounds: readonly QuizshowImportedRound[],
): number {
  return rounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
}

/** The same data whatever the key order, so a reloaded quiz compares equal. */
function stableJsonOf(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJsonOf).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJsonOf(entry)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/**
 * The quiz round a blank quiz starts with, still as it came: no title, the
 * default settings and one blank multiple choice question.
 */
function isUntouchedStarterRound(round: QuizshowDraftRound): boolean {
  const [onlyQuestion, ...otherQuestions] = round.questions;
  return (
    round.kind === "quiz" &&
    otherQuestions.length === 0 &&
    onlyQuestion !== undefined &&
    onlyQuestion.mediaUrl === null &&
    round.title.en === "" &&
    round.title.pt === "" &&
    round.contentLabel === "none" &&
    stableJsonOf(round.settings) === stableJsonOf(defaultRoundSettings()) &&
    stableJsonOf(onlyQuestion.question) ===
      stableJsonOf(newQuestion("multiple_choice", "quiz"))
  );
}

/** The rows the import goes after: a quiz holding only its untouched starter round gives that round up. */
function importBaseRoundsOf(draft: QuizshowDraft): QuizshowDraftRound[] {
  const [onlyRound, ...otherRounds] = draft.rounds;
  const isStarterOnly =
    onlyRound !== undefined &&
    otherRounds.length === 0 &&
    isUntouchedStarterRound(onlyRound);
  return isStarterOnly ? [] : [...draft.rounds];
}

/**
 * The quiz-wide limits once the rounds join `draft`: `roundsMax` playable
 * rounds and `questionsPerQuizMax` questions. Over a limit, nothing is added.
 */
export function importLimitIssuesOf(
  draft: QuizshowDraft,
  rounds: readonly QuizshowImportedRound[],
): QuizshowImportIssue[] {
  const issues: QuizshowImportIssue[] = [];
  const baseRounds = importBaseRoundsOf(draft);
  const roomForRounds =
    QUIZSHOW_LIMITS.roundsMax - playableRoundCount(baseRounds);
  const firstOverRound = rounds[Math.max(roomForRounds, 0)];
  if (firstOverRound !== undefined) {
    issues.push(
      importIssue(firstOverRound.line, "tooManyRounds", {
        max: QUIZSHOW_LIMITS.roundsMax,
      }),
    );
  }
  const existingQuestionCount = baseRounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
  const roomForQuestions =
    QUIZSHOW_LIMITS.questionsPerQuizMax - existingQuestionCount;
  const firstOverQuestion = rounds.flatMap((round) => round.questions)[
    Math.max(roomForQuestions, 0)
  ];
  if (firstOverQuestion !== undefined) {
    issues.push(
      importIssue(firstOverQuestion.line, "overLimit", {
        max: QUIZSHOW_LIMITS.questionsPerQuizMax,
      }),
    );
  }
  return issues;
}

/**
 * Pins a trailing wheel to the slices it has now, so the added rounds land
 * after its range (the twin of the server's append import, contract 13):
 * only when the last row is a wheel or sits in a wheel's range, and only for
 * a wheel with at least `wheelSlicesMin` slices.
 */
function withTrailingWheelPinned(
  rounds: readonly QuizshowDraftRound[],
): QuizshowDraftRound[] {
  const lastRowIndex = rounds.length - 1;
  const lastRow = rounds[lastRowIndex];
  if (!lastRow) return [...rounds];
  const wheelRowIndex = isWheelRoundKind(lastRow.kind)
    ? lastRowIndex
    : wheelRoundIndexOfRange(rounds, lastRowIndex);
  if (wheelRowIndex === null) return [...rounds];
  const sliceCount = wheelSliceRoundIndexes(rounds, wheelRowIndex).length;
  if (sliceCount < QUIZSHOW_LIMITS.wheelSlicesMin) return [...rounds];
  return rounds.map((round, roundIndex) =>
    roundIndex === wheelRowIndex
      ? { ...round, settings: { ...round.settings, sliceCount } }
      : round,
  );
}

/** The imported rounds as draft rows, each with fresh draft keys. */
export function draftRoundsOf(
  rounds: readonly QuizshowImportedRound[],
): QuizshowDraftRound[] {
  return rounds.map((round) => {
    const roundKey = `import-${crypto.randomUUID()}`;
    return {
      draftKey: roundKey,
      kind: round.kind,
      title: round.title,
      contentLabel: "none",
      settings: defaultRoundSettings(),
      questions: round.questions.map((imported, questionIndex) => ({
        draftKey: `${roundKey}-question-${questionIndex}`,
        question: imported.question,
        mediaUrl: null,
      })),
    };
  });
}

/**
 * `draft` with the imported rounds added at the end. A quiz that holds only
 * its untouched starter round (a blank start) has that round replaced.
 */
export function withImportedRounds(
  draft: QuizshowDraft,
  rounds: readonly QuizshowImportedRound[],
): QuizshowDraft {
  return {
    ...draft,
    rounds: [
      ...withTrailingWheelPinned(importBaseRoundsOf(draft)),
      ...draftRoundsOf(rounds),
    ],
  };
}
