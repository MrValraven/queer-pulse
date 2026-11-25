import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_QUESTION_TYPES,
  type QuizshowLanguageMode,
  type QuizshowQuestionBase,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { isWheelRoundKind } from "../quizshowWheel";
import { correctIndexesOf, type QuizshowDraft } from "./quizshowDraft";
import {
  closestAnswerOf,
  closestAnswerTextOf,
  correctMarksIssueOf,
  emptyOptionIssueOf,
  escapedBarsOf,
  firstIssueOf,
  importIssue,
  importedOptionsOf,
  importedTextOf,
  optionCountIssueOf,
  roundIssuesOf,
  textLengthIssueOf,
  type QuizshowImportedRound,
  type QuizshowImportIssue,
  type QuizshowImportResult,
} from "./quizshowPasteFormat";

/**
 * CSV import and export (contract 9.2 item 22), all in the browser. The
 * columns are `QUIZSHOW_CSV_COLUMNS`; text cells take `EN | PT`. The `correct`
 * cell holds 1-based option numbers joined by `;` (multiple choice), `true` or
 * `false`, the typed answer, `value ~amount` or `value ~amount%` (closest),
 * the option numbers in order (order), and stays empty for poll and prompt.
 * A round cell of digits only ("1", "2") is an untitled round. Prompt rows
 * make a Drag Name Generator round, the party round that needs nothing more
 * than a prompt. A text cell that would start with = + - @, a tab or a
 * carriage return gets a leading ' so a spreadsheet app never runs it as a
 * formula; the import takes that ' off again.
 */

export const QUIZSHOW_CSV_COLUMNS = [
  "round",
  "type",
  "prompt_en",
  "prompt_pt",
  "option_1",
  "option_2",
  "option_3",
  "option_4",
  "correct",
  "points",
  "time_limit",
] as const;

/** Extra columns for an order question with five or six items; written only when one needs them. */
const EXTRA_OPTION_COLUMNS = ["option_5", "option_6"] as const;
const OPTION_COLUMNS = [
  "option_1",
  "option_2",
  "option_3",
  "option_4",
  ...EXTRA_OPTION_COLUMNS,
] as const;

type CsvColumn =
  (typeof QUIZSHOW_CSV_COLUMNS)[number] | (typeof EXTRA_OPTION_COLUMNS)[number];

interface CsvRecord {
  /** The line the record starts on (a quoted cell may hold line breaks). */
  line: number;
  cells: string[];
}

interface CsvReading {
  records: CsvRecord[];
  /** The line of a record whose quoted cell never closes; null when every quote closes. */
  unclosedQuoteLine: number | null;
}

export type QuizshowCsvSeparator = "," | ";";

function withoutByteOrderMark(text: string): string {
  return text.startsWith("\uFEFF") ? text.slice(1) : text;
}

/**
 * The separator of a file: a spreadsheet app set to Portuguese saves with
 * `;`, so a header line with more semicolons than commas reads as `;`.
 */
export function csvSeparatorOf(text: string): QuizshowCsvSeparator {
  const source = withoutByteOrderMark(text);
  const firstLine =
    source.split(/\r\n|\r|\n/).find((line) => line.trim() !== "") ?? "";
  const semicolonCount = firstLine.split(";").length - 1;
  const commaCount = firstLine.split(",").length - 1;
  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * The text of a chosen file: UTF-8 when the bytes are valid UTF-8, else
 * Windows-1252, the encoding a spreadsheet app on Windows saves CSV in.
 */
export function decodeCsvBytes(bytes: ArrayBuffer | Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const hasUtf8Mark =
      view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf;
    return new TextDecoder("windows-1252").decode(
      hasUtf8Mark ? view.subarray(3) : view,
    );
  }
}

/**
 * RFC 4180 reading: a quote opens a quoted cell only at the start of a cell
 * (spaces before it allowed), `""` inside it is a quote, and CRLF, LF or CR
 * end a line. A quote anywhere else is a plain character.
 */
export function readCsvRecords(
  text: string,
  separator: QuizshowCsvSeparator = ",",
): CsvReading {
  const source = withoutByteOrderMark(text);
  const records: CsvRecord[] = [];
  let cells: string[] = [];
  let cell = "";
  let isQuoted = false;
  let isCellStart = true;
  let line = 1;
  let recordLine = 1;
  let index = 0;
  const endCell = () => {
    cells.push(cell);
    cell = "";
    isCellStart = true;
  };
  while (index < source.length) {
    const character = source.charAt(index);
    const nextCharacter = source.charAt(index + 1);
    const isLineBreak = character === "\r" || character === "\n";
    const lineBreakLength =
      character === "\r" && nextCharacter === "\n" ? 2 : 1;
    if (isLineBreak) {
      line += 1;
      index += lineBreakLength;
      if (isQuoted) {
        cell += "\n";
      } else {
        endCell();
        records.push({ line: recordLine, cells });
        cells = [];
        recordLine = line;
      }
    } else if (isQuoted && character === '"') {
      if (nextCharacter === '"') cell += '"';
      else isQuoted = false;
      index += nextCharacter === '"' ? 2 : 1;
    } else if (!isQuoted && character === '"' && isCellStart) {
      isQuoted = true;
      isCellStart = false;
      cell = "";
      index += 1;
    } else if (!isQuoted && character === separator) {
      endCell();
      index += 1;
    } else {
      cell += character;
      if (character !== " " && character !== "\t") isCellStart = false;
      index += 1;
    }
  }
  if (cell !== "" || cells.length > 0) {
    endCell();
    records.push({ line: recordLine, cells });
  }
  return { records, unclosedQuoteLine: isQuoted ? recordLine : null };
}

/**
 * A cell a spreadsheet app would read as a formula, or one that already
 * starts with guard quotes before such a character. Guarding the second kind
 * too keeps the round trip lossless: `'=x` exports as `''=x` and reads back
 * as `'=x`.
 */
const FORMULA_START_PATTERN = /^'*[=+\-@\t\r]/;

/** The cell with a leading ' when a spreadsheet app would run it as a formula. */
export function formulaSafeCellOf(value: string): string {
  return FORMULA_START_PATTERN.test(value) ? `'${value}` : value;
}

/** The cell with the ' that `formulaSafeCellOf` added taken off. */
function withoutFormulaGuard(cell: string): string {
  return cell.startsWith("'") && FORMULA_START_PATTERN.test(cell.slice(1))
    ? cell.slice(1)
    : cell;
}

const CELL_NEEDS_QUOTES_PATTERN = /[",\r\n]|^\s|\s$/;
const SEMICOLON_CELL_NEEDS_QUOTES_PATTERN = /[";\r\n]|^\s|\s$/;

/**
 * One cell, quoted when it holds the separator (a comma, or a semicolon in a
 * `;` file), a quote, a line break or edge spaces.
 */
export function csvCellOf(
  value: string,
  separator: QuizshowCsvSeparator = ",",
): string {
  const needsQuotes =
    separator === ";"
      ? SEMICOLON_CELL_NEEDS_QUOTES_PATTERN
      : CELL_NEEDS_QUOTES_PATTERN;
  return needsQuotes.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function isBlankRecord(record: CsvRecord): boolean {
  return record.cells.every((cell) => cell.trim() === "");
}

type ColumnIndexes = Partial<Record<CsvColumn, number>>;

function columnIndexesOf(header: CsvRecord): ColumnIndexes | null {
  const names = header.cells.map((cell) => cell.trim().toLowerCase());
  const indexes: ColumnIndexes = {};
  for (const column of [...QUIZSHOW_CSV_COLUMNS, ...EXTRA_OPTION_COLUMNS]) {
    const columnIndex = names.indexOf(column);
    if (columnIndex !== -1) indexes[column] = columnIndex;
  }
  const hasEveryColumn = QUIZSHOW_CSV_COLUMNS.every(
    (column) => indexes[column] !== undefined,
  );
  return hasEveryColumn ? indexes : null;
}

interface CsvRow {
  line: number;
  cellOf: (column: CsvColumn) => string;
  /** A `;` file comes from a spreadsheet app that writes decimals with a comma. */
  isDecimalComma: boolean;
}

const DIGITS_ONLY_PATTERN = /^\d+$/;

function roundTitleOf(
  cell: string,
  languages: QuizshowLanguageMode,
): QuizshowText {
  return DIGITS_ONLY_PATTERN.test(cell)
    ? { en: "", pt: "" }
    : importedTextOf(cell, languages);
}

function isQuestionType(value: string): value is QuizshowQuestionType {
  return (QUIZSHOW_QUESTION_TYPES as readonly string[]).includes(value);
}

/** The option numbers of a `1;3` cell, 0-based; null when a number is not a whole number in range or repeats. */
function optionNumbersOf(cell: string, optionCount: number): number[] | null {
  const parts = cell.split(";").map((part) => part.trim());
  const indexes = parts.map((part) =>
    DIGITS_ONLY_PATTERN.test(part) ? Number(part) - 1 : -1,
  );
  const isValid =
    parts.length > 0 &&
    indexes.every(
      (optionIndex) => optionIndex >= 0 && optionIndex < optionCount,
    ) &&
    new Set(indexes).size === indexes.length;
  return isValid ? indexes : null;
}

type RowQuestion =
  { question: QuizshowQuestionInput } | { issue: QuizshowImportIssue };

function badCorrect(line: number, type: QuizshowQuestionType): RowQuestion {
  return { issue: importIssue(line, `badCorrect.${type}`) };
}

function optionTextsOf(
  row: CsvRow,
  languages: QuizshowLanguageMode,
): QuizshowText[] {
  const cells = OPTION_COLUMNS.map((column) => row.cellOf(column));
  const lastFilledIndex = cells.findLastIndex((cell) => cell !== "");
  return cells
    .slice(0, lastFilledIndex + 1)
    .map((cell) => importedTextOf(cell, languages));
}

/** Option count, a gap and option lengths, in that order; null when the options fit. */
function optionsIssueOf(
  line: number,
  options: readonly QuizshowText[],
  min: number,
  max: number,
): QuizshowImportIssue | null {
  return firstIssueOf([
    () => optionCountIssueOf(line, options.length, min, max),
    () => emptyOptionIssueOf(line, options),
    ...options.map(
      (option) => () =>
        textLengthIssueOf(line, option, QUIZSHOW_LIMITS.optionTextMax),
    ),
  ]);
}

function multipleChoiceRowOf(
  row: CsvRow,
  base: QuizshowQuestionBase,
  options: QuizshowText[],
): RowQuestion {
  const countIssue = optionsIssueOf(
    row.line,
    options,
    QUIZSHOW_LIMITS.multipleChoiceOptionsMin,
    QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
  );
  if (countIssue !== null) return { issue: countIssue };
  const marked = optionNumbersOf(row.cellOf("correct"), options.length);
  if (marked === null) return badCorrect(row.line, "multiple_choice");
  const correctIndexes = [...marked].sort((first, second) => first - second);
  const marksIssue = correctMarksIssueOf(
    row.line,
    correctIndexes,
    options.length,
  );
  if (marksIssue !== null) return { issue: marksIssue };
  return {
    question: {
      ...base,
      type: "multiple_choice",
      options: importedOptionsOf(options),
      answer: { correctIndexes },
      acceptedAnswers: [],
    },
  };
}

function orderRowOf(
  row: CsvRow,
  base: QuizshowQuestionBase,
  options: QuizshowText[],
): RowQuestion {
  const countIssue = optionsIssueOf(
    row.line,
    options,
    QUIZSHOW_LIMITS.orderItemsMin,
    QUIZSHOW_LIMITS.orderItemsMax,
  );
  if (countIssue !== null) return { issue: countIssue };
  const correctCell = row.cellOf("correct");
  // An empty cell means the options are already in the right order.
  const order =
    correctCell === ""
      ? options.map((_text, optionIndex) => optionIndex)
      : optionNumbersOf(correctCell, options.length);
  if (order === null || order.length !== options.length) {
    return badCorrect(row.line, "order");
  }
  // The draft keeps an order question's options in the right order.
  const listed = importedOptionsOf(options);
  const ordered = order.flatMap((optionIndex) => listed[optionIndex] ?? []);
  return {
    question: {
      ...base,
      type: "order",
      options: ordered,
      answer: { orderedIds: ordered.map((option) => option.id) },
      acceptedAnswers: [],
    },
  };
}

function answeredRowOf(
  row: CsvRow,
  type: "true_false" | "type_answer" | "closest_number",
  base: QuizshowQuestionBase,
  languages: QuizshowLanguageMode,
): RowQuestion {
  const correctCell = row.cellOf("correct");
  if (type === "true_false") {
    const answerWord = correctCell.toLowerCase();
    if (answerWord !== "true" && answerWord !== "false") {
      return badCorrect(row.line, type);
    }
    return {
      question: {
        ...base,
        type,
        options: [],
        answer: { isTrue: answerWord === "true" },
        acceptedAnswers: [],
      },
    };
  }
  if (type === "type_answer") {
    if (correctCell === "") return badCorrect(row.line, type);
    const answerText = importedTextOf(correctCell, languages);
    const lengthIssue = textLengthIssueOf(
      row.line,
      answerText,
      QUIZSHOW_LIMITS.answerTextMax,
    );
    if (lengthIssue !== null) return { issue: lengthIssue };
    return {
      question: {
        ...base,
        type,
        options: [],
        answer: { text: answerText },
        acceptedAnswers: [],
      },
    };
  }
  const closest = closestAnswerOf(
    row.isDecimalComma ? correctCell.replaceAll(",", ".") : correctCell,
  );
  if (closest === null || closest === "invalid")
    return badCorrect(row.line, type);
  return {
    question: {
      ...base,
      type,
      options: [],
      answer: closest,
      acceptedAnswers: [],
    },
  };
}

/** Points and time limit; an issue when either does not fit. */
function scoringOf(
  row: CsvRow,
  isPrompt: boolean,
): { points: number; timeLimitSeconds: number | null } | QuizshowImportIssue {
  const pointsCell = row.cellOf("points");
  const points =
    pointsCell === "" ? QUIZSHOW_LIMITS.pointsDefault : Number(pointsCell);
  if (!(QUIZSHOW_LIMITS.pointsValues as readonly number[]).includes(points)) {
    return importIssue(row.line, "badPoints", {
      values: QUIZSHOW_LIMITS.pointsValues.join(", "),
    });
  }
  const timeCell = row.cellOf("time_limit");
  if (timeCell === "" || isPrompt) return { points, timeLimitSeconds: null };
  const timeLimitSeconds = Number(timeCell);
  const isTimeValid =
    DIGITS_ONLY_PATTERN.test(timeCell) &&
    timeLimitSeconds >= QUIZSHOW_LIMITS.timeLimitSecondsMin &&
    timeLimitSeconds <= QUIZSHOW_LIMITS.timeLimitSecondsMax;
  if (!isTimeValid) {
    return importIssue(row.line, "badTimeLimit", {
      min: QUIZSHOW_LIMITS.timeLimitSecondsMin,
      max: QUIZSHOW_LIMITS.timeLimitSecondsMax,
    });
  }
  return { points, timeLimitSeconds };
}

function rowQuestionOf(
  row: CsvRow,
  languages: QuizshowLanguageMode,
): RowQuestion {
  const type = row.cellOf("type").toLowerCase();
  if (!isQuestionType(type)) {
    return {
      issue: importIssue(row.line, "unknownType", {
        types: QUIZSHOW_QUESTION_TYPES.join(", "),
      }),
    };
  }
  const scoring = scoringOf(row, type === "prompt");
  if ("reasonKey" in scoring) return { issue: scoring };
  const base: QuizshowQuestionBase = {
    prompt: { en: row.cellOf("prompt_en"), pt: row.cellOf("prompt_pt") },
    mediaRef: null,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    revealNote: { en: "", pt: "" },
    numberUnit: { en: "", pt: "" },
    ...scoring,
  };
  const promptIssue = textLengthIssueOf(
    row.line,
    base.prompt,
    QUIZSHOW_LIMITS.promptMax,
  );
  if (promptIssue !== null) return { issue: promptIssue };
  const options = optionTextsOf(row, languages);
  switch (type) {
    case "multiple_choice":
      return multipleChoiceRowOf(row, base, options);
    case "order":
      return orderRowOf(row, base, options);
    case "poll": {
      const countIssue = optionsIssueOf(
        row.line,
        options,
        QUIZSHOW_LIMITS.multipleChoiceOptionsMin,
        QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
      );
      if (countIssue !== null) return { issue: countIssue };
      return {
        question: {
          ...base,
          type,
          options: importedOptionsOf(options),
          answer: null,
          acceptedAnswers: [],
        },
      };
    }
    case "true_false":
    case "type_answer":
    case "closest_number":
      return answeredRowOf(row, type, base, languages);
    case "prompt":
      return {
        question: {
          ...base,
          type,
          options: [],
          answer: null,
          acceptedAnswers: [],
        },
      };
  }
}

/** Prompt rows make a party round; a round that mixes them with quiz rows is an issue. */
function withRoundKinds(rounds: QuizshowImportedRound[]): {
  rounds: QuizshowImportedRound[];
  issues: QuizshowImportIssue[];
} {
  const issues: QuizshowImportIssue[] = [];
  const kept: QuizshowImportedRound[] = [];
  for (const round of rounds) {
    const promptRows = round.questions.filter(
      (imported) => imported.question.type === "prompt",
    );
    if (promptRows.length === 0) {
      kept.push(round);
    } else if (promptRows.length === round.questions.length) {
      kept.push({ ...round, kind: "drag_name" });
    } else {
      issues.push(importIssue(promptRows[0]?.line ?? round.line, "mixedRound"));
    }
  }
  return { rounds: kept, issues };
}

/**
 * Reads a CSV file into rounds. The first row that is not blank must name
 * every column of `QUIZSHOW_CSV_COLUMNS` (in any order), separated by commas
 * or (as a Portuguese spreadsheet app saves) semicolons; rows next to each
 * other with the same round cell make one round.
 */
export function parseQuizCsv(
  text: string,
  languages: QuizshowLanguageMode,
): QuizshowImportResult {
  const source = String(text);
  const separator = csvSeparatorOf(source);
  const { records, unclosedQuoteLine } = readCsvRecords(source, separator);
  const filled = records.filter((record) => !isBlankRecord(record));
  const [header, ...dataRecords] = filled;
  const columnIndexes = header === undefined ? null : columnIndexesOf(header);
  if (header === undefined || columnIndexes === null) {
    return {
      rounds: [],
      issues: [
        importIssue(header?.line ?? 1, "missingHeader", {
          columns: QUIZSHOW_CSV_COLUMNS.join(","),
        }),
      ],
    };
  }
  const issues: QuizshowImportIssue[] =
    unclosedQuoteLine === null
      ? []
      : [importIssue(unclosedQuoteLine, "unclosedQuote")];
  const rounds: QuizshowImportedRound[] = [];
  let currentRoundCell: string | null = null;
  for (const record of dataRecords) {
    const row: CsvRow = {
      line: record.line,
      isDecimalComma: separator === ";",
      cellOf: (column) => {
        const columnIndex = columnIndexes[column];
        return columnIndex === undefined
          ? ""
          : withoutFormulaGuard((record.cells[columnIndex] ?? "").trim());
      },
    };
    const roundCell = row.cellOf("round");
    if (roundCell !== currentRoundCell || rounds.length === 0) {
      currentRoundCell = roundCell;
      const title = roundTitleOf(roundCell, languages);
      const titleIssue = textLengthIssueOf(
        row.line,
        title,
        QUIZSHOW_LIMITS.roundTitleMax,
      );
      if (titleIssue !== null) issues.push(titleIssue);
      rounds.push({ line: row.line, kind: "quiz", title, questions: [] });
    }
    const built = rowQuestionOf(row, languages);
    if ("issue" in built) {
      issues.push(built.issue);
    } else {
      rounds
        .at(-1)
        ?.questions.push({ line: row.line, question: built.question });
    }
  }
  const kinded = withRoundKinds(
    rounds.filter((round) => round.questions.length > 0),
  );
  return {
    rounds: kinded.rounds,
    issues: [...issues, ...kinded.issues, ...roundIssuesOf(kinded.rounds)],
  };
}

/** A text as one cell: `EN | PT`, or the one language the quiz is written in; a bar inside the text is written `\|`. */
function textCellOf(
  text: QuizshowText,
  languages: QuizshowLanguageMode,
): string {
  const english = escapedBarsOf(text.en.trim());
  const portuguese = escapedBarsOf(text.pt.trim());
  if (english === "" && portuguese === "") return "";
  if (portuguese === "") return languages === "pt" ? `${english} |` : english;
  if (english === "")
    return languages === "pt" ? portuguese : `| ${portuguese}`;
  return `${english} | ${portuguese}`;
}

/**
 * The round cell of a titled round. Rows next to each other with the same
 * round cell make one round, and a digits-only cell is an untitled round, so
 * a title that would read either way is spelled another way around its bar:
 * `Music`, `Music |`, `Music|` and `Music  |` all read back as "Music".
 */
function roundCellOf(
  title: QuizshowText,
  languages: QuizshowLanguageMode,
  previousCell: string | null,
): string {
  const english = escapedBarsOf(title.en.trim());
  const portuguese = escapedBarsOf(title.pt.trim());
  const standard = textCellOf(title, languages);
  const spellings = [
    standard,
    `${english} | ${portuguese}`.trim(),
    `${english}|${portuguese}`,
    `${english}  |  ${portuguese}`.trim(),
  ];
  return (
    spellings.find(
      (spelling) =>
        !DIGITS_ONLY_PATTERN.test(spelling) && spelling !== previousCell,
    ) ?? standard
  );
}

function correctCellOf(
  question: QuizshowQuestionInput,
  languages: QuizshowLanguageMode,
): string {
  switch (question.type) {
    case "multiple_choice":
      return correctIndexesOf(question)
        .map((optionIndex) => optionIndex + 1)
        .join(";");
    case "true_false":
      return question.answer === null ? "" : String(question.answer.isTrue);
    case "type_answer":
      return question.answer === null
        ? ""
        : textCellOf(question.answer.text, languages);
    case "closest_number":
      return question.answer === null
        ? ""
        : closestAnswerTextOf(question.answer);
    case "order":
      // The draft keeps an order question's options in the right order.
      return question.options
        .map((_option, optionIndex) => optionIndex + 1)
        .join(";");
    case "poll":
    case "prompt":
      return "";
  }
}

/**
 * The separator an export uses: a spreadsheet app set to Portuguese opens a
 * `;` file in columns and a `,` file in one, so Portuguese gets `;`. The
 * import reads either (`csvSeparatorOf`).
 */
export function csvSeparatorForLanguage(
  language: string,
): QuizshowCsvSeparator {
  return language === "pt" ? ";" : ",";
}

/**
 * The draft as CSV text (CRLF line ends, a header row first, cells joined by
 * `separator`, a comma unless the caller asks for `;`). Wheel rows hold no
 * questions and are left out. `parseQuizCsv` reads it back.
 */
export function exportQuizCsv(
  draft: QuizshowDraft,
  separator: QuizshowCsvSeparator = ",",
): string {
  const hasLongOrder = draft.rounds.some((round) =>
    round.questions.some(
      ({ question }) =>
        question.type === "order" &&
        question.options.length > QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
    ),
  );
  const optionColumnCount = hasLongOrder ? OPTION_COLUMNS.length : 4;
  const header = [
    ...QUIZSHOW_CSV_COLUMNS.slice(0, 4),
    ...OPTION_COLUMNS.slice(0, optionColumnCount),
    ...QUIZSHOW_CSV_COLUMNS.slice(8),
  ];
  const lines = [header.join(separator)];
  const playableRounds = draft.rounds.filter(
    (round) => !isWheelRoundKind(round.kind),
  );
  let previousRoundCell: string | null = null;
  playableRounds.forEach((round, roundIndex) => {
    const titleCell = textCellOf(round.title, draft.languages);
    // An untitled round writes its number, so two untitled rounds stay apart.
    const roundCell =
      titleCell === ""
        ? String(roundIndex + 1)
        : roundCellOf(round.title, draft.languages, previousRoundCell);
    previousRoundCell = roundCell;
    for (const { question } of round.questions) {
      const optionCells = Array.from(
        { length: optionColumnCount },
        (_unused, optionIndex) => {
          const option = question.options[optionIndex];
          return option === undefined
            ? ""
            : textCellOf(option.text, draft.languages);
        },
      );
      const cells = [
        roundCell,
        question.type,
        question.prompt.en,
        question.prompt.pt,
        ...optionCells,
        correctCellOf(question, draft.languages),
        String(question.points),
        question.timeLimitSeconds === null
          ? ""
          : String(question.timeLimitSeconds),
      ];
      // A closest answer stays a plain number ("-5 ~2"): no formula can hide in it.
      const correctColumnIndex = cells.length - 3;
      const guardedCells = cells.map((cell, cellIndex) =>
        cellIndex === correctColumnIndex && question.type === "closest_number"
          ? cell
          : formulaSafeCellOf(cell),
      );
      lines.push(
        guardedCells.map((cell) => csvCellOf(cell, separator)).join(separator),
      );
    }
  });
  return `${lines.join("\r\n")}\r\n`;
}

const FILE_NAME_MAX = 100;
const FILE_NAME_FORBIDDEN = new Set([
  "\\",
  "/",
  ":",
  "*",
  "?",
  '"',
  "<",
  ">",
  "|",
]);

/** `<quiz title>.csv` with the characters a file system refuses taken out; `fallback` for a blank title. */
export function quizCsvFileName(title: string, fallback: string): string {
  const cleaned = [...title]
    .map((character) =>
      FILE_NAME_FORBIDDEN.has(character) || character.charCodeAt(0) < 32
        ? " "
        : character,
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, FILE_NAME_MAX)
    .trim();
  return `${cleaned === "" ? fallback : cleaned}.csv`;
}
