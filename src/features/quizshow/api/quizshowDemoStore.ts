import {
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowImportInput,
  type QuizshowImportSource,
  type QuizshowJoinInput,
  type QuizshowJoinPreview,
  type QuizshowJoinResponse,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSessionResponse,
  type QuizshowPlayMode,
  type QuizshowQuiz,
  type QuizshowQuizInput,
  type QuizshowQuizResponse,
  type QuizshowResultsResponse,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_SESSION_ID,
} from "../quizshow.constants";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import { normaliseStoredQuiz } from "../quizshowNormalise";
import { demoResultsWinBadges } from "../winBadges/quizWinBadgesDemoStore";
import { emitDemoRematch } from "./quizshowDemoBus";
import {
  demoEndGameSession,
  demoGameIdForSession,
  demoGameJoinPreview,
  demoGameLiveSession,
  demoGameSourceCopy,
  demoGameSourcesForEvent,
  demoJoinGame,
  demoSourceTemplateRef,
  resetQuizshowDemoGames,
} from "./quizshowDemoGames";
import {
  demoAssertRematch,
  demoAssertShape,
  demoClearSessionEnd,
  demoCompletenessProblems,
  demoDefaultQuizShape,
  demoEventImportSources,
  demoEventQuizzes,
  demoEndedCodeRefusal,
  demoEventSourceCopy,
  demoImportResultOf,
  demoJoinCodeFor,
  demoLiveSessionRefOf,
  demoOpenSettingsOf,
  demoQuizChangedRefusal,
  demoRecordCodeEnd,
  demoRecordSessionEnd,
  demoRefreshSession,
  demoRefusal,
  hasAdultsRound,
  quizFromInput,
  resetDemoEventQuizzes,
  resetDemoSessionEnds,
  type DemoLiveSession,
  type DemoQuizBody,
  type DemoQuizCopy,
} from "./quizshowDemoQuizzes";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";
import {
  demoTemplateCopy,
  onDemoTemplateDeleted,
  resetQuizshowDemoTemplates,
} from "./quizshowDemoTemplates";

// Moved to quizshowDemoQuizzes.ts; re-exported so QuizshowDryRun keeps its import.
export { quizFromInput };

const DEMO_EVENT_TITLE = "Pride brunch";
const DEFAULT_QUIZ_UPDATED_AT = "2026-10-01T10:00:00.000Z";
const EVENT_ADULTS_CODE = "quizshow_adults_round_needs_adults_event";

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
// The event quizzes live in quizshowDemoQuizzes.ts so the games store can copy them.
const liveSessionsBySlug = new Map<string, DemoLiveSession>();
const deletedResultsSlugs = new Set<string>();
let saveCounter = 0;
let rematchCounter = 0;

// A deleted template leaves its event copies intact and clears their source id, as the live foreign key does.
onDemoTemplateDeleted((templateId) => {
  for (const record of demoEventQuizzes().values()) {
    if (record.quiz.sourceTemplateId === templateId) {
      record.quiz = { ...record.quiz, sourceTemplateId: null };
    }
  }
});

export function resetQuizshowDemoStore(): void {
  resetDemoEventQuizzes();
  resetDemoSessionEnds();
  liveSessionsBySlug.clear();
  deletedResultsSlugs.clear();
  saveCounter = 0;
  rematchCounter = 0;
  resetQuizshowDemoGames();
  resetQuizshowDemoTemplates();
}

function hasKeptResults(slug: string): boolean {
  return slug === QUIZSHOW_DEMO_RESULTS_SLUG && !deletedResultsSlugs.has(slug);
}

function responseFor(slug: string): QuizshowQuizResponse {
  const record = demoEventQuizzes().get(slug) ?? null;
  const liveSession = liveSessionsBySlug.get(slug) ?? null;
  const quiz = record
    ? normaliseStoredQuiz(structuredClone(record.quiz))
    : null;
  return {
    quiz: quiz
      ? {
          ...quiz,
          sourceTemplate: demoSourceTemplateRef(
            quiz.sourceTemplateId,
            record?.sourceTemplateCopiedAt ?? null,
          ),
        }
      : null,
    problems: quiz ? demoCompletenessProblems(quiz) : [],
    isAdultsEvent: false,
    liveSession: liveSession
      ? demoLiveSessionRefOf(liveSession, quiz?.updatedAt ?? null)
      : null,
    hasResults: hasKeptResults(slug),
    lastOpenSettings: record?.lastOpenSettings
      ? { ...record.lastOpenSettings }
      : null,
  };
}

function nextIdPrefix(slug: string): string {
  saveCounter += 1;
  return `demo-${slug}-${saveCounter}`;
}

function storeQuiz(
  slug: string,
  body: DemoQuizBody,
  source: { sourceTemplateId: string | null; copiedAt: string | null },
  updatedAt: string,
): void {
  const stored = demoEventQuizzes().get(slug);
  demoEventQuizzes().set(slug, {
    quiz: quizFromInput(body, {
      idPrefix: nextIdPrefix(slug),
      updatedAt,
      sourceTemplateId: source.sourceTemplateId,
    }),
    sourceTemplateCopiedAt:
      source.sourceTemplateId === null ? null : source.copiedAt,
    lastOpenSettings: stored?.lastOpenSettings ?? null,
  });
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
  const stored = demoEventQuizzes().get(slug);
  const { expectedUpdatedAt, ...quizBody } = body;
  // The shape is checked before the token, as the backend validates the body first.
  assertNoStructuralProblems(quizBody);
  const storedUpdatedAt = stored?.quiz.updatedAt ?? null;
  if (expectedUpdatedAt !== storedUpdatedAt) {
    throw demoQuizChangedRefusal(storedUpdatedAt);
  }
  storeQuiz(
    slug,
    quizBody,
    {
      sourceTemplateId: stored?.quiz.sourceTemplateId ?? null,
      copiedAt: stored?.sourceTemplateCopiedAt ?? null,
    },
    new Date().toISOString(),
  );
  return responseFor(slug);
}

/** C6.28: replace (the default) swaps the event's quiz; append adds the chosen rows. */
export function demoImportQuiz(
  slug: string,
  body: QuizshowImportInput,
): QuizshowQuizResponse {
  const copy = eventImportCopyOf(slug, body);
  const stored = demoEventQuizzes().get(slug) ?? null;
  const now = new Date().toISOString();
  const imported = demoImportResultOf(
    body,
    copy,
    { stored, keptTitle: null, assertAllowed: assertNoStructuralProblems },
    now,
  );
  storeQuiz(
    slug,
    imported.body,
    {
      sourceTemplateId: imported.sourceTemplateId,
      copiedAt: imported.sourceTemplateCopiedAt,
    },
    now,
  );
  return responseFor(slug);
}

function eventImportCopyOf(
  slug: string,
  body: QuizshowImportInput,
): DemoQuizCopy {
  if (body.from === "template") return demoTemplateCopy(body.templateId);
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
      ...demoEventImportSources().filter((source) => source.eventSlug !== slug),
      ...demoGameSourcesForEvent(),
    ],
  };
}

/** A new event code for a rematch lobby: never a fixed demo code or the one it replaces. */
function rematchJoinCodeOf(previousCode: string | null): string {
  rematchCounter += 1;
  const takenCodes = new Set([QUIZSHOW_DEMO_JOIN_CODE]);
  if (previousCode !== null) takenCodes.add(previousCode);
  return demoJoinCodeFor(
    `${QUIZSHOW_DEMO_SESSION_ID}:rematch:${rematchCounter}`,
    takenCodes,
  );
}

/**
 * Item 17: a practice lobby skips the kept-results replace and never notifies
 * guests; the demo has no draft events to refuse. Item 38: a rematch keeps the
 * demo session id, gets a new code and reaches a running demo engine through
 * the demo bus. Item 52: the dialog's choices are kept on the quiz.
 */
export function demoOpenSession(
  slug: string,
  body: QuizshowOpenSessionInput,
): QuizshowOpenSessionResponse {
  const record = demoEventQuizzes().get(slug);
  if (!record) throw demoRefusal(404, "quizshow_quiz_not_found");
  const problems = demoCompletenessProblems(record.quiz);
  if (problems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_incomplete", { problems });
  }
  const rematchOfSessionId = body.rematchOfSessionId;
  const openSession = liveSessionsBySlug.get(slug);
  // Backend order: the open slot, then the rematch source, then kept results.
  // The finished session a rematch replays no longer holds the open slot.
  if (openSession && openSession.sessionId !== rematchOfSessionId) {
    throw demoRefusal(409, "quizshow_session_already_open", {
      sessionId: openSession.sessionId,
      joinCode: openSession.joinCode,
    });
  }
  if (rematchOfSessionId !== null) {
    demoAssertRematch(rematchOfSessionId, QUIZSHOW_DEMO_SESSION_ID, Date.now());
  }
  if (!body.isPractice && hasKeptResults(slug)) {
    if (!body.shouldReplaceResults)
      throw demoRefusal(409, "quizshow_results_exist");
    deletedResultsSlugs.add(slug);
  }
  const joinCode =
    rematchOfSessionId === null
      ? QUIZSHOW_DEMO_JOIN_CODE
      : rematchJoinCodeOf(openSession?.joinCode ?? null);
  liveSessionsBySlug.set(slug, {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode,
    status: "lobby",
    playMode: body.playMode,
    playerCount: 0,
    startedAt: new Date().toISOString(),
    isPractice: body.isPractice,
    sourceUpdatedAt: record.quiz.updatedAt,
    isAdultsOnly: false,
    quizTitle: record.quiz.title,
  });
  record.lastOpenSettings = demoOpenSettingsOf(body);
  if (rematchOfSessionId !== null) {
    demoClearSessionEnd(rematchOfSessionId);
    emitDemoRematch({
      fromSessionId: rematchOfSessionId,
      sessionId: QUIZSHOW_DEMO_SESSION_ID,
      joinCode,
      playMode: body.playMode,
    });
  }
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode,
    isGuestPushSent: body.notifyGuests && !body.isPractice,
  };
}

/**
 * The open lobby of a demo event, or null: the twin of `demoGameLiveSession`.
 * The demo engine reads `isPractice` and `joinCode` here, so a practice or
 * rematch lobby opened from the store plays as one.
 */
export function demoEventLiveSession(
  slug: string,
): QuizshowLiveSessionRef | null {
  const liveSession = liveSessionsBySlug.get(slug);
  if (!liveSession) return null;
  return demoLiveSessionRefOf(
    liveSession,
    demoEventQuizzes().get(slug)?.quiz.updatedAt ?? null,
  );
}

/** C6.10 for an event's lobby; a demo event is never 18+. */
export function demoRefreshLobby(slug: string): { isNoop: boolean } {
  return demoRefreshSession(
    liveSessionsBySlug.get(slug) ?? null,
    demoEventQuizzes().get(slug)?.quiz ?? null,
    false,
  );
}

/**
 * A demo session ended at `endedAtMs`: its open slot frees and a rematch can
 * check its window (item 38). For the demo engine to call when a game
 * finishes; the stores never see a demo game end on their own.
 */
export function demoEndSession(
  sessionId: string,
  endedAtMs: number = Date.now(),
): void {
  demoRecordSessionEnd(sessionId, endedAtMs);
  for (const [slug, liveSession] of liveSessionsBySlug) {
    if (liveSession.sessionId === sessionId) {
      demoRecordCodeEnd(liveSession.joinCode, endedAtMs);
      liveSessionsBySlug.delete(slug);
    }
  }
  demoEndGameSession(sessionId, endedAtMs);
}

function normalisedJoinCodeOf(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "");
}

export function demoJoin(body: QuizshowJoinInput): QuizshowJoinResponse {
  const normalizedCode = normalisedJoinCodeOf(body.code);
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

/**
 * C5.1 in demo, signed out: the quiz title of the lobby's snapshot and the
 * status only. An open event lobby's code first, then an open game lobby's;
 * a code whose lobby ended answers 410 inside `finishedCodeMemoryHours`; the
 * fixed demo code is the demo event's, as its event card shows; 404 otherwise.
 */
export function demoJoinPreview(code: string): QuizshowJoinPreview {
  const normalizedCode = normalisedJoinCodeOf(code);
  if (!QUIZSHOW_JOIN_CODE_PATTERN.test(normalizedCode)) {
    throw demoRefusal(404, "quizshow_join_code_not_found");
  }
  for (const liveSession of liveSessionsBySlug.values()) {
    if (liveSession.joinCode === normalizedCode) {
      return { quizTitle: liveSession.quizTitle, status: liveSession.status };
    }
  }
  const gamePreview = demoGameJoinPreview(normalizedCode);
  if (gamePreview) return gamePreview;
  const endedCodeRefusal = demoEndedCodeRefusal(normalizedCode, Date.now());
  if (endedCodeRefusal) throw endedCodeRefusal;
  if (normalizedCode === QUIZSHOW_DEMO_JOIN_CODE) {
    return {
      quizTitle: demoQuizFor(QUIZSHOW_DEMO_LIVE_SLUG).title,
      status: "lobby",
    };
  }
  throw demoRefusal(404, "quizshow_join_code_not_found");
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
  return {
    ...structuredClone(QUIZSHOW_DEMO_RESULTS),
    winBadges: demoResultsWinBadges(slug),
  };
}

export function demoDeleteResults(slug: string): void {
  if (!hasKeptResults(slug))
    throw demoRefusal(404, "quizshow_results_not_found");
  deletedResultsSlugs.add(slug);
}

/** The quiz a demo engine plays for this event: the one saved in this tab, else the Pride seed's quiz. */
export function demoQuizFor(slug: string): QuizshowQuiz {
  const stored = demoEventQuizzes().get(slug);
  if (stored) return normaliseStoredQuiz(structuredClone(stored.quiz));
  return quizFromInput(demoDefaultQuizShape(), {
    idPrefix: `demo-${QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory}`,
    updatedAt: DEFAULT_QUIZ_UPDATED_AT,
    sourceTemplateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
  });
}
