import {
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowImportInput,
  type QuizshowImportSource,
  type QuizshowJoinInput,
  type QuizshowJoinResponse,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSessionResponse,
  type QuizshowPlayMode,
  type QuizshowQuiz,
  type QuizshowQuizInput,
  type QuizshowQuizResponse,
  type QuizshowResultsResponse,
  type QuizshowStarterPackCard,
  type QuizshowStarterPackKey,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_SESSION_ID,
} from "../quizshow.constants";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import {
  demoGameIdForSession,
  demoGameLiveSession,
  demoGameSourceCopy,
  demoGameSourcesForEvent,
  demoJoinGame,
  resetQuizshowDemoGames,
} from "./quizshowDemoGames";
import {
  demoAssertShape,
  demoCompletenessProblems,
  demoDefaultPack,
  demoEventQuizzesBySlug,
  demoEventSourceCopy,
  demoPackCopy,
  demoRefusal,
  hasAdultsRound,
  quizFromInput,
  type DemoQuizBody,
  type DemoQuizCopy,
} from "./quizshowDemoQuizzes";
import {
  QUIZSHOW_DEMO_IMPORT_SOURCES,
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";

// Moved to quizshowDemoQuizzes.ts; re-exported so QuizshowDryRun keeps its import.
export { quizFromInput };

const DEMO_EVENT_TITLE = "Pride brunch";
const DEFAULT_QUIZ_UPDATED_AT = "2026-10-01T10:00:00.000Z";
const EVENT_ADULTS_CODE = "quizshow_adults_round_needs_adults_event";

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
// The event quizzes live in quizshowDemoQuizzes.ts so the games store can copy them.
const quizzesBySlug = demoEventQuizzesBySlug;
const liveSessionsBySlug = new Map<string, QuizshowLiveSessionRef>();
const deletedResultsSlugs = new Set<string>();
let saveCounter = 0;

export function resetQuizshowDemoStore(): void {
  quizzesBySlug.clear();
  liveSessionsBySlug.clear();
  deletedResultsSlugs.clear();
  saveCounter = 0;
  resetQuizshowDemoGames();
}

function hasKeptResults(slug: string): boolean {
  return slug === QUIZSHOW_DEMO_RESULTS_SLUG && !deletedResultsSlugs.has(slug);
}

function responseFor(slug: string): QuizshowQuizResponse {
  const quiz = quizzesBySlug.get(slug) ?? null;
  return {
    quiz,
    problems: quiz ? demoCompletenessProblems(quiz) : [],
    isAdultsEvent: false,
    liveSession: liveSessionsBySlug.get(slug) ?? null,
    hasResults: hasKeptResults(slug),
  };
}

function nextIdPrefix(slug: string): string {
  saveCounter += 1;
  return `demo-${slug}-${saveCounter}`;
}

function storeQuiz(
  slug: string,
  body: DemoQuizBody,
  starterPackKey: QuizshowStarterPackKey | null,
): void {
  quizzesBySlug.set(
    slug,
    quizFromInput(body, {
      idPrefix: nextIdPrefix(slug),
      updatedAt: new Date().toISOString(),
      starterPackKey,
    }),
  );
}

function assertNoStructuralProblems(body: DemoQuizBody): void {
  demoAssertShape(body, {
    isAdultsAllowed: false,
    adultsCode: EVENT_ADULTS_CODE,
  });
}

export function demoGetQuiz(slug: string): QuizshowQuizResponse {
  return responseFor(slug);
}

export function demoPutQuiz(
  slug: string,
  body: QuizshowQuizInput,
): QuizshowQuizResponse {
  const stored = quizzesBySlug.get(slug);
  if (body.expectedUpdatedAt !== (stored?.updatedAt ?? null)) {
    throw demoRefusal(409, "quizshow_quiz_changed", {
      updatedAt: stored?.updatedAt ?? null,
    });
  }
  const { expectedUpdatedAt: unusedExpectedUpdatedAt, ...quizBody } = body;
  void unusedExpectedUpdatedAt;
  assertNoStructuralProblems(quizBody);
  storeQuiz(slug, quizBody, stored?.starterPackKey ?? null);
  return responseFor(slug);
}

export function demoImportQuiz(
  slug: string,
  body: QuizshowImportInput,
): QuizshowQuizResponse {
  const copy = eventImportCopyOf(slug, body);
  assertNoStructuralProblems(copy.body);
  storeQuiz(slug, copy.body, copy.starterPackKey);
  return responseFor(slug);
}

function eventImportCopyOf(
  slug: string,
  body: QuizshowImportInput,
): DemoQuizCopy {
  if (body.from === "pack") return demoPackCopy(body.packKey);
  if (body.from === "game") return demoGameSourceCopy(body.gameId);
  if (body.eventSlug === slug) {
    throw demoRefusal(422, "quizshow_import_same_event");
  }
  return demoEventSourceCopy(body.eventSlug);
}

/** The other demo events first, then the member's games. */
export function demoImportSources(slug: string): {
  items: QuizshowImportSource[];
} {
  return {
    items: [
      ...QUIZSHOW_DEMO_IMPORT_SOURCES.filter(
        (source) => source.eventSlug !== slug,
      ),
      ...demoGameSourcesForEvent(),
    ],
  };
}

export function demoPacks(): { items: QuizshowStarterPackCard[] } {
  return {
    items: QUIZSHOW_STARTER_PACKS.map((pack) => ({
      key: pack.key,
      title: pack.title,
      description: pack.description,
      languages: pack.quiz.languages,
      roundCount: pack.quiz.rounds.length,
      questionCount: pack.quiz.rounds.reduce(
        (total, round) => total + round.questions.length,
        0,
      ),
      hasAdultsRounds: pack.quiz.rounds.some(
        (round) => round.contentLabel === "adults",
      ),
    })),
  };
}

export function demoOpenSession(
  slug: string,
  body: QuizshowOpenSessionInput,
): QuizshowOpenSessionResponse {
  const quiz = quizzesBySlug.get(slug);
  if (!quiz) throw demoRefusal(404, "quizshow_quiz_not_found");
  const problems = demoCompletenessProblems(quiz);
  if (problems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_incomplete", { problems });
  }
  if (liveSessionsBySlug.has(slug)) {
    throw demoRefusal(409, "quizshow_session_already_open", {
      sessionId: QUIZSHOW_DEMO_SESSION_ID,
      joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    });
  }
  if (hasKeptResults(slug)) {
    if (!body.shouldReplaceResults)
      throw demoRefusal(409, "quizshow_results_exist");
    deletedResultsSlugs.add(slug);
  }
  liveSessionsBySlug.set(slug, {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    status: "lobby",
    playMode: body.playMode,
    playerCount: 0,
    startedAt: new Date().toISOString(),
  });
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    isGuestPushSent: body.notifyGuests,
  };
}

export function demoJoin(body: QuizshowJoinInput): QuizshowJoinResponse {
  const normalizedCode = body.code.toUpperCase().replace(/[\s-]/g, "");
  if (!QUIZSHOW_JOIN_CODE_PATTERN.test(normalizedCode)) {
    throw demoRefusal(404, "quizshow_join_code_not_found");
  }
  const gameJoin = demoJoinGame(normalizedCode);
  if (gameJoin) return gameJoin;
  const eventQuiz = demoQuizFor(QUIZSHOW_DEMO_LIVE_SLUG);
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    kind: "event",
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    eventTitle: DEMO_EVENT_TITLE,
    quizTitle: eventQuiz.title,
    isAdultsOnly: hasAdultsRound(eventQuiz),
    host: null,
    status: "lobby",
    isRejoin: false,
  };
}

/** The play mode of the lobby a demo join landed in: the game's own lobby, else the event's. */
export function demoJoinPlayMode(join: QuizshowJoinResponse): QuizshowPlayMode {
  const gameId = demoGameIdForSession(join.sessionId);
  if (gameId !== null) return demoGameLiveSession(gameId)?.playMode ?? "solo";
  return liveSessionsBySlug.get(join.eventSlug ?? "")?.playMode ?? "solo";
}

export function demoResults(slug: string): QuizshowResultsResponse {
  if (!hasKeptResults(slug))
    throw demoRefusal(404, "quizshow_results_not_found");
  return structuredClone(QUIZSHOW_DEMO_RESULTS);
}

export function demoDeleteResults(slug: string): void {
  if (!hasKeptResults(slug))
    throw demoRefusal(404, "quizshow_results_not_found");
  deletedResultsSlugs.add(slug);
}

/** The quiz a demo engine plays for this event: the one saved in this tab, else the Pride history pack. */
export function demoQuizFor(slug: string): QuizshowQuiz {
  const stored = quizzesBySlug.get(slug);
  if (stored) return structuredClone(stored);
  const pack = demoDefaultPack();
  return quizFromInput(pack.quiz, {
    idPrefix: `demo-${pack.key}`,
    updatedAt: DEFAULT_QUIZ_UPDATED_AT,
    starterPackKey: pack.key,
  });
}
