import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_JOIN_CODE_ALPHABET,
  QUIZSHOW_LIMITS,
  type QuizshowContentLabel,
  type QuizshowErrorCode,
  type QuizshowImportInput,
  type QuizshowImportRoundRef,
  type QuizshowImportSource,
  type QuizshowLanguageMode,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSettingsMemory,
  type QuizshowQuestion,
  type QuizshowQuestionInput,
  type QuizshowQuiz,
  type QuizshowQuizInput,
  type QuizshowQuizProblem,
  type QuizshowQuizShape,
  type QuizshowRound,
  type QuizshowRoundInput,
  type QuizshowScreenLanguage,
} from "../../../shared/contracts/quizshow";
import { detectLanguage } from "../../../shared/i18n/locale";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import {
  normaliseStoredQuiz,
  normaliseStoredQuizShape,
  type QuizshowStoredQuizShape,
} from "../quizshowNormalise";
import {
  isWheelRoundKind,
  normaliseWheelRounds,
  playableRoundCount,
  wheelRoundIndexOfRange,
  wheelSliceRoundIndexes,
  withWheelSettingsDefaults,
} from "../quizshowWheel";
import { emitDemoLobbyRefreshed } from "./quizshowDemoBus";
import {
  QUIZSHOW_DEMO_EVENT_QUIZ_SEEDS,
  QUIZSHOW_DEMO_IMPORT_SOURCES,
} from "./quizshowDemoStore.data";

/**
 * What both demo stores share: refusals, quiz building, the shape checks, the
 * demo events' saved quizzes, imports, lobby refreshes and rematch checks. The
 * event store and the games store both import this module, so the games store
 * reads event quizzes from here and keeps the import graph one way.
 */

export type DemoQuizBody = Omit<QuizshowQuizInput, "expectedUpdatedAt">;

/** A quiz picked as an import source, ready to be stored under a new owner. */
export interface DemoQuizCopy {
  body: DemoQuizBody;
  sourceTemplateId: string | null;
  /** When the source copied its template (C6.25). Left out by a template copy, which is copied now. */
  sourceTemplateCopiedAt?: string | null;
}

/** A demo event's saved quiz with what the live quiz row keeps beside it. */
export interface DemoQuizRecord {
  quiz: QuizshowQuiz;
  /** Set when a template import names the source (C6.25); null without one. */
  sourceTemplateCopiedAt: string | null;
  /** Item 52: what the open dialog last used on this quiz. */
  lastOpenSettings: QuizshowOpenSettingsMemory | null;
}

/** A demo lobby as a store holds it: the wire ref plus the snapshot facts a refresh reads. */
export interface DemoLiveSession extends Omit<
  QuizshowLiveSessionRef,
  "isBehindQuiz"
> {
  /** The quiz updatedAt this lobby's snapshot was built from (C6.10). */
  sourceUpdatedAt: string;
  /** Whether the lobby's snapshot is 18+: the scope's switch or an adults round in it. */
  isAdultsOnly: boolean;
  /** The quiz title of the snapshot taken at open or at the last refresh (C5.1 join preview). */
  quizTitle: string;
}

/** Refusal statuses that differ from the 422 the event adults code uses. */
const ADULTS_REFUSAL_STATUS: Partial<Record<QuizshowErrorCode, number>> = {
  quizshow_game_adults_rounds_need_switch: 403,
};
const DEFAULT_ADULTS_REFUSAL_STATUS = 422;
const JOIN_CODE_LENGTH = 6;
/** The append limits (C6.28): the problem code a merged quiz breaks and the refusal it answers. */
const IMPORT_LIMIT_CODES: ReadonlyArray<
  readonly [QuizshowLocalProblem["code"], QuizshowErrorCode]
> = [
  ["too_many_rounds", "quizshow_import_too_many_rounds"],
  ["too_many_questions", "quizshow_import_too_many_questions"],
  ["too_many_wheels", "quizshow_import_too_many_wheels"],
];
/** The demo member saves every demo quiz, so a conflict names them in the app's language. */
const DEMO_EDITOR_NAMES = { en: "You", pt: "Tu" } as const;

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
const eventQuizzesBySlug = new Map<string, DemoQuizRecord>();
let hasSeededEventQuizzes = false;
/** Ends a store saw, by session id, in epoch ms (item 38). */
const sessionEndedAtById = new Map<string, number>();
/** Ends a store saw, by join code, in epoch ms: a recent one answers the join preview 410 (C5.1). */
const codeEndedAtByJoinCode = new Map<string, number>();
const MILLISECONDS_PER_HOUR = 3_600_000;

export function demoBadRequest(message: string): ApiError {
  return new ApiError(400, "Bad Request", {
    statusCode: 400,
    error: "Bad Request",
    message: [message],
  });
}

export function demoRefusal(
  status: number,
  code: string,
  details: Record<string, unknown> = {},
): ApiError {
  return new ApiError(status, code, {
    statusCode: status,
    code,
    message: code,
    ...details,
  });
}

/** C6.26: 'both' needs both languages; any other pair falls back to the quiz's languages. */
function normalisedScreenLanguage(
  languages: QuizshowLanguageMode,
  screenLanguage: QuizshowScreenLanguage,
): QuizshowScreenLanguage {
  return screenLanguage === "both" && languages !== "both"
    ? languages
    : screenLanguage;
}

/** Item 57: a save stores the correct options ascending, as the backend does. */
function withSortedCorrectIndexes(
  question: QuizshowQuestionInput,
): QuizshowQuestionInput {
  if (question.type !== "multiple_choice" || question.answer === null) {
    return question;
  }
  return {
    ...question,
    answer: {
      ...question.answer,
      correctIndexes: [...question.answer.correctIndexes].sort(
        (first, second) => first - second,
      ),
    },
  };
}

/** Builds a stored demo quiz; the body passes the C2.4 read normaliser first, so legacy demo data reads as v2. */
export function quizFromInput(
  input: QuizshowStoredQuizShape,
  options: {
    idPrefix: string;
    updatedAt: string;
    sourceTemplateId: string | null;
  },
): QuizshowQuiz {
  const shape = normaliseStoredQuizShape(input);
  const rounds: QuizshowRound[] = normaliseWheelRounds(shape.rounds).map(
    (round, roundIndex) => {
      const roundId = `${options.idPrefix}-r${roundIndex}`;
      const questions: QuizshowQuestion[] = round.questions.map(
        (question, questionIndex) => ({
          ...withSortedCorrectIndexes(question),
          id: `${roundId}-q${questionIndex}`,
          mediaUrl: question.mediaRef,
        }),
      );
      return {
        ...round,
        settings: withWheelSettingsDefaults(round.settings),
        id: roundId,
        questions,
      };
    },
  );
  return {
    title: shape.title,
    languages: shape.languages,
    screenLanguage: normalisedScreenLanguage(
      shape.languages,
      shape.screenLanguage,
    ),
    sourceTemplateId: options.sourceTemplateId,
    // The stores resolve the template line when they answer (C6.25).
    sourceTemplate: null,
    updatedAt: options.updatedAt,
    rounds,
  };
}

/** The Pride seed's quiz, read from the static seeds so a demo template delete never reaches it. Shown in both languages on the screen (C10 row 64). */
export function demoDefaultQuizShape(): QuizshowQuizShape {
  const shape = normaliseStoredQuizShape(
    templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory).quiz,
  );
  return {
    ...shape,
    screenLanguage: normalisedScreenLanguage(shape.languages, "both"),
  };
}

/** The demo events' saved quizzes, seeded on first use after a reset: one event holds a template copy that has an update. */
export function demoEventQuizzes(): Map<string, DemoQuizRecord> {
  if (!hasSeededEventQuizzes) {
    hasSeededEventQuizzes = true;
    for (const seed of QUIZSHOW_DEMO_EVENT_QUIZ_SEEDS) {
      const templateQuiz = templateSeedById(seed.templateId).quiz;
      eventQuizzesBySlug.set(seed.eventSlug, {
        quiz: quizFromInput(
          { ...templateQuiz, title: seed.title },
          {
            idPrefix: `demo-${seed.eventSlug}-seed`,
            updatedAt: seed.updatedAt,
            sourceTemplateId: seed.templateId,
          },
        ),
        sourceTemplateCopiedAt: seed.copiedAt,
        lastOpenSettings: null,
      });
    }
  }
  return eventQuizzesBySlug;
}

export function resetDemoEventQuizzes(): void {
  eventQuizzesBySlug.clear();
  hasSeededEventQuizzes = false;
}

function isServerProblem(
  problem: QuizshowLocalProblem,
): problem is QuizshowQuizProblem {
  return problem.code !== "adults_round_needs_adults_event";
}

export function demoBodyOf(quiz: QuizshowQuiz): DemoQuizBody {
  return {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds,
  };
}

export function demoCompletenessProblems(
  quiz: QuizshowQuiz,
): QuizshowQuizProblem[] {
  return quizshowProblemsFor(demoBodyOf(quiz), { isAdultsEvent: false })
    .filter((problem) => !isStructuralProblem(problem.code))
    .filter(isServerProblem);
}

/** Refuses a body the server would refuse: shape problems first, then an adults round where none is allowed. */
export function demoAssertShape(
  body: DemoQuizBody,
  options: { isAdultsAllowed: boolean; adultsCode: QuizshowErrorCode },
): void {
  const structuralProblems = quizshowProblemsFor(body, {
    isAdultsEvent: options.isAdultsAllowed,
  }).filter((problem) => isStructuralProblem(problem.code));
  const shapeProblems = structuralProblems.filter(isServerProblem);
  if (shapeProblems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_invalid", {
      problems: shapeProblems,
    });
  }
  if (structuralProblems.length > 0) {
    throw demoRefusal(
      ADULTS_REFUSAL_STATUS[options.adultsCode] ??
        DEFAULT_ADULTS_REFUSAL_STATUS,
      options.adultsCode,
    );
  }
}

export function hasAdultsRound(quiz: {
  rounds: readonly { contentLabel: QuizshowContentLabel }[];
}): boolean {
  return quiz.rounds.some((round) => round.contentLabel === "adults");
}

/** "You" or "Tu": the demo member is the only one who saves a demo quiz (item 54). */
export function demoEditorName(): string {
  return DEMO_EDITOR_NAMES[detectLanguage()];
}

/** 409 quizshow_quiz_changed with C2.5 details; no stored quiz names nobody. */
export function demoQuizChangedRefusal(
  storedUpdatedAt: string | null,
): ApiError {
  return demoRefusal(409, "quizshow_quiz_changed", {
    updatedAt: storedUpdatedAt,
    updatedByName: storedUpdatedAt === null ? null : demoEditorName(),
  });
}

/** The quiz a demo event offers as a source: the one saved in this tab, else the Pride seed's quiz under the source's title. */
export function demoEventSourceCopy(eventSlug: string): DemoQuizCopy {
  const source = QUIZSHOW_DEMO_IMPORT_SOURCES.find(
    (candidate) => candidate.eventSlug === eventSlug,
  );
  if (!source) throw demoRefusal(404, "quizshow_import_source_not_found");
  const copiedRecord = demoEventQuizzes().get(eventSlug);
  if (copiedRecord) {
    return {
      body: demoBodyOf(copiedRecord.quiz),
      sourceTemplateId: copiedRecord.quiz.sourceTemplateId,
      sourceTemplateCopiedAt: copiedRecord.sourceTemplateCopiedAt,
    };
  }
  return {
    body: { ...demoDefaultQuizShape(), title: source.quizTitle },
    sourceTemplateId: null,
    sourceTemplateCopiedAt: null,
  };
}

/** Every row of a source quiz, wheel rows included, as the import checklist lists it (C2.5). */
export function demoImportRoundRefs(
  rounds: readonly QuizshowRoundInput[],
): QuizshowImportRoundRef[] {
  return rounds.map((round, roundIndex) => ({
    roundIndex,
    kind: round.kind,
    title: { ...round.title },
    questionCount: round.questions.length,
    // A wheel row's stored slice count (null for Auto), as the BE SQL reads it; null on every other row.
    sliceCount: isWheelRoundKind(round.kind)
      ? withWheelSettingsDefaults(round.settings).sliceCount
      : null,
    contentLabel: round.contentLabel,
  }));
}

function questionCountOf(body: DemoQuizBody): number {
  return body.rounds.reduce(
    (total, round) => total + round.questions.length,
    0,
  );
}

/** The demo events as import sources, counted from the quiz each would copy. */
export function demoEventImportSources(): QuizshowImportSource[] {
  return QUIZSHOW_DEMO_IMPORT_SOURCES.map((source): QuizshowImportSource => {
    const body = demoEventSourceCopy(source.eventSlug).body;
    return {
      ...source,
      kind: "event",
      gameId: null,
      quizTitle: body.title,
      roundCount: playableRoundCount(body.rounds),
      questionCount: questionCountOf(body),
      hasAdultsRounds: hasAdultsRound(body),
      rounds: demoImportRoundRefs(body.rounds),
    };
  });
}

/**
 * A chosen wheel keeps the slices it brought (BE `withChosenWheelPinned`):
 * its slice count is pinned to the size of its source range, so an Auto wheel
 * never takes a chosen row that follows it in the append as one more slice.
 * A wheel that brought fewer than `wheelSlicesMin` is left as it is.
 */
function withChosenWheelPinned(
  sourceRounds: readonly QuizshowRoundInput[],
  round: QuizshowRoundInput,
  roundIndex: number,
): QuizshowRoundInput {
  if (!isWheelRoundKind(round.kind)) return round;
  const sliceCount = wheelSliceRoundIndexes(sourceRounds, roundIndex).length;
  if (sliceCount < QUIZSHOW_LIMITS.wheelSlicesMin) return round;
  return { ...round, settings: { ...round.settings, sliceCount } };
}

/**
 * The chosen source rows of an append in source order (C6.28); null takes
 * every row as it is. A chosen wheel row brings its slice range and keeps
 * that many slices (`withChosenWheelPinned`).
 */
function chosenSourceRounds(
  sourceRounds: readonly QuizshowRoundInput[],
  roundIndexes: readonly number[] | null | undefined,
): QuizshowRoundInput[] {
  if (roundIndexes === null || roundIndexes === undefined) {
    return [...sourceRounds];
  }
  // An empty choice names no row, so nothing is appended and nothing is written.
  if (roundIndexes.length === 0) {
    throw demoRefusal(422, "quizshow_import_round_not_found");
  }
  const chosenIndexes = new Set<number>();
  for (const roundIndex of roundIndexes) {
    if (
      !Number.isInteger(roundIndex) ||
      roundIndex < 0 ||
      roundIndex >= sourceRounds.length
    ) {
      throw demoRefusal(422, "quizshow_import_round_not_found");
    }
    chosenIndexes.add(roundIndex);
    for (const sliceRoundIndex of wheelSliceRoundIndexes(
      sourceRounds,
      roundIndex,
    )) {
      chosenIndexes.add(sliceRoundIndex);
    }
  }
  return sourceRounds.flatMap((round, roundIndex) =>
    chosenIndexes.has(roundIndex)
      ? [withChosenWheelPinned(sourceRounds, round, roundIndex)]
      : [],
  );
}

/**
 * Pins the target's trailing wheel to the slices it has now, so appended rows
 * land after its range (BE `withTrailingWheelPinned`):
 * only when the last row is a wheel or sits in a wheel's range, and only for
 * a wheel with at least `wheelSlicesMin` slices.
 */
function withTrailingWheelPinned(
  rounds: readonly QuizshowRoundInput[],
): QuizshowRoundInput[] {
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

/** A merged quiz over a limit answers its own 422; any other shape problem is quizshow_quiz_invalid. */
function assertAppendWithinLimits(body: DemoQuizBody): void {
  const structuralProblems = quizshowProblemsFor(body, {
    isAdultsEvent: true,
  }).filter((problem) => isStructuralProblem(problem.code));
  if (structuralProblems.length === 0) return;
  const problemCodes = new Set(
    structuralProblems.map((problem) => problem.code),
  );
  for (const [problemCode, errorCode] of IMPORT_LIMIT_CODES) {
    if (problemCodes.has(problemCode)) throw demoRefusal(422, errorCode);
  }
  throw demoRefusal(422, "quizshow_quiz_invalid", {
    problems: structuralProblems.filter(isServerProblem),
  });
}

/** Where an import writes: the target's stored quiz, the title it keeps and its 18+ rule. */
export interface DemoImportTarget {
  stored: { quiz: QuizshowQuiz; sourceTemplateCopiedAt: string | null } | null;
  /** A game keeps its own title; an event takes the source's. */
  keptTitle: string | null;
  assertAllowed: (body: DemoQuizBody) => void;
}

export interface DemoImportResult {
  body: DemoQuizBody;
  sourceTemplateId: string | null;
  sourceTemplateCopiedAt: string | null;
}

/** A template copy is as new as this import; an event or game copy keeps its source's stamp (C6.25). */
function copiedAtOf(copy: DemoQuizCopy, now: string): string | null {
  if (copy.sourceTemplateId === null) return null;
  return copy.sourceTemplateCopiedAt === undefined
    ? now
    : copy.sourceTemplateCopiedAt;
}

/** C6.28: replace swaps the quiz; append checks the token and the rows, adds them with fresh ids and runs the limits. */
export function demoImportResultOf(
  input: QuizshowImportInput,
  copy: DemoQuizCopy,
  target: DemoImportTarget,
  now: string,
): DemoImportResult {
  // A template copy may still hold legacy demo data, so it is read through C2.4 before any check.
  const sourceBody: DemoQuizBody = normaliseStoredQuizShape(copy.body);
  if ((input.mode ?? "replace") === "replace") {
    const body =
      target.keptTitle === null
        ? sourceBody
        : { ...sourceBody, title: target.keptTitle };
    target.assertAllowed(body);
    return {
      body,
      sourceTemplateId: copy.sourceTemplateId,
      sourceTemplateCopiedAt: copiedAtOf(copy, now),
    };
  }
  const storedUpdatedAt = target.stored?.quiz.updatedAt ?? null;
  if (
    input.expectedUpdatedAt === undefined ||
    input.expectedUpdatedAt !== storedUpdatedAt
  ) {
    throw demoQuizChangedRefusal(storedUpdatedAt);
  }
  const chosenRounds = chosenSourceRounds(
    sourceBody.rounds,
    input.roundIndexes,
  );
  const baseBody: DemoQuizBody = target.stored
    ? demoBodyOf(target.stored.quiz)
    : {
        ...sourceBody,
        title: target.keptTitle ?? sourceBody.title,
        rounds: [],
      };
  // Only a stored quiz has a trailing wheel to pin; a fresh base has no rows.
  const baseRounds = target.stored
    ? withTrailingWheelPinned(baseBody.rounds)
    : baseBody.rounds;
  const body: DemoQuizBody = {
    ...baseBody,
    rounds: [...baseRounds, ...chosenRounds],
  };
  assertAppendWithinLimits(body);
  target.assertAllowed(body);
  const storedSourceTemplateId = target.stored?.quiz.sourceTemplateId ?? null;
  // A template append names the source only on a quiz with none; one with a source keeps its id.
  const isNewTemplateSource =
    input.from === "template" && storedSourceTemplateId === null;
  // An append from the quiz's own template brings its latest rows, so the copy is as new as this append (BE twin, C13).
  const isOwnTemplateSource =
    input.from === "template" &&
    storedSourceTemplateId !== null &&
    copy.sourceTemplateId === storedSourceTemplateId;
  return {
    body,
    sourceTemplateId: isNewTemplateSource
      ? copy.sourceTemplateId
      : storedSourceTemplateId,
    sourceTemplateCopiedAt:
      isNewTemplateSource || isOwnTemplateSource
        ? copiedAtOf(copy, now)
        : (target.stored?.sourceTemplateCopiedAt ?? null),
  };
}

export function demoOpenSettingsOf(
  body: QuizshowOpenSessionInput,
): QuizshowOpenSettingsMemory {
  return {
    playMode: body.playMode,
    // A team cap means nothing in solo play, as the backend stores it.
    maxTeamSize: body.playMode === "teams" ? body.maxTeamSize : null,
    isReviewOn: body.isReviewOn,
  };
}

/** The wire ref of a demo lobby: behind when the quiz was saved after its snapshot, and only in the lobby (C6.10). */
export function demoLiveSessionRefOf(
  session: DemoLiveSession,
  quizUpdatedAt: string | null,
): QuizshowLiveSessionRef {
  return {
    sessionId: session.sessionId,
    joinCode: session.joinCode,
    status: session.status,
    playMode: session.playMode,
    playerCount: session.playerCount,
    startedAt: session.startedAt,
    isPractice: session.isPractice,
    isBehindQuiz:
      session.status === "lobby" &&
      quizUpdatedAt !== null &&
      session.sourceUpdatedAt !== quizUpdatedAt,
  };
}

/**
 * C6.10 in demo: refusals with the demo's open lobby, a no-op on an equal
 * stamp, else the new snapshot facts and a bus event for the running demo
 * engine. `isScopeAdultsOnly` is the event's or game's own 18+ flag. A lobby
 * with players joined is the demo engine's refusal: the store cannot see them.
 */
export function demoRefreshSession(
  session: DemoLiveSession | null,
  quiz: QuizshowQuiz | null,
  isScopeAdultsOnly: boolean,
): { isNoop: boolean } {
  if (!session) throw demoRefusal(404, "quizshow_session_not_found");
  if (session.status !== "lobby") {
    throw demoRefusal(409, "quizshow_not_in_lobby");
  }
  if (!quiz) throw demoRefusal(404, "quizshow_refresh_quiz_gone");
  const problems = demoCompletenessProblems(quiz);
  if (problems.length > 0) {
    throw demoRefusal(422, "quizshow_refresh_quiz_incomplete", { problems });
  }
  if (!isScopeAdultsOnly && hasAdultsRound(quiz)) {
    throw demoRefusal(422, "quizshow_refresh_adults_mismatch");
  }
  if (session.sourceUpdatedAt === quiz.updatedAt) return { isNoop: true };
  session.sourceUpdatedAt = quiz.updatedAt;
  session.isAdultsOnly = isScopeAdultsOnly || hasAdultsRound(quiz);
  session.quizTitle = quiz.title;
  emitDemoLobbyRefreshed({
    sessionId: session.sessionId,
    quiz: normaliseStoredQuiz(structuredClone(quiz)),
    sourceUpdatedAt: quiz.updatedAt,
  });
  return { isNoop: false };
}

function stableHashOf(text: string): number {
  let hash = 2166136261;
  for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
    hash ^= text.charCodeAt(charIndex);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hashedJoinCode(seedText: string): string {
  let remainder = stableHashOf(seedText);
  let code = "";
  for (let charIndex = 0; charIndex < JOIN_CODE_LENGTH; charIndex += 1) {
    const alphabetLength = QUIZSHOW_JOIN_CODE_ALPHABET.length;
    code += QUIZSHOW_JOIN_CODE_ALPHABET.charAt(remainder % alphabetLength);
    remainder = Math.floor(remainder / alphabetLength);
  }
  return code;
}

/** A stable join code from `seedText` that no code in `reservedCodes` holds. */
export function demoJoinCodeFor(
  seedText: string,
  reservedCodes: ReadonlySet<string>,
): string {
  let attempt = 0;
  let code = hashedJoinCode(seedText);
  while (reservedCodes.has(code)) {
    attempt += 1;
    code = hashedJoinCode(`${seedText}:${attempt}`);
  }
  return code;
}

/** Records when a demo session ended, so a rematch can tell whether its window is still open. */
export function demoRecordSessionEnd(
  sessionId: string,
  endedAtMs: number,
): void {
  sessionEndedAtById.set(sessionId, endedAtMs);
}

/** Records when a lobby holding `joinCode` ended, for the join preview's 410. */
export function demoRecordCodeEnd(joinCode: string, endedAtMs: number): void {
  codeEndedAtByJoinCode.set(joinCode, endedAtMs);
}

/** C5.1: a code whose lobby ended inside `finishedCodeMemoryHours` answers 410 quizshow_session_finished; an older one is unknown. */
export function demoEndedCodeRefusal(
  joinCode: string,
  nowMs: number,
): ApiError | null {
  const endedAtMs = codeEndedAtByJoinCode.get(joinCode);
  if (endedAtMs === undefined) return null;
  const memoryMs =
    QUIZSHOW_LIMITS.finishedCodeMemoryHours * MILLISECONDS_PER_HOUR;
  return nowMs - endedAtMs <= memoryMs
    ? demoRefusal(410, "quizshow_session_finished")
    : demoRefusal(404, "quizshow_join_code_not_found");
}

export function resetDemoSessionEnds(): void {
  sessionEndedAtById.clear();
  codeEndedAtByJoinCode.clear();
}

/**
 * C6.17 in demo: `rematchOfSessionId` must be the scope's demo session (else
 * 404) and ended within `rematchWindowMs` (else 409). The demo engine runs in
 * the page, so a session whose end no store recorded counts as just ended.
 * Leaves the recorded end in place: the caller clears it with
 * `demoClearSessionEnd` once the new lobby is stored.
 */
export function demoAssertRematch(
  rematchOfSessionId: string,
  scopeSessionId: string,
  nowMs: number,
): void {
  if (rematchOfSessionId !== scopeSessionId) {
    throw demoRefusal(404, "quizshow_rematch_not_found");
  }
  const endedAtMs = sessionEndedAtById.get(rematchOfSessionId) ?? nowMs;
  if (nowMs - endedAtMs > QUIZSHOW_LIMITS.rematchWindowMs) {
    throw demoRefusal(409, "quizshow_rematch_expired");
  }
}

/** A rematch reopened this session id, so its old end no longer applies. */
export function demoClearSessionEnd(sessionId: string): void {
  sessionEndedAtById.delete(sessionId);
}
