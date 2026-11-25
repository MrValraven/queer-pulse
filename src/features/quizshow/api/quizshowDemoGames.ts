import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  QUIZSHOW_LIMITS,
  type QuizshowCreateGameInput,
  type QuizshowGameInput,
  type QuizshowGameListResponse,
  type QuizshowGameResponse,
  type QuizshowGameSummary,
  type QuizshowImportInput,
  type QuizshowImportSource,
  type QuizshowJoinPreview,
  type QuizshowJoinResponse,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSessionResponse,
  type QuizshowOpenSettingsMemory,
  type QuizshowQuiz,
  type QuizshowResultsResponse,
  type QuizshowSourceTemplateRef,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import {
  QUIZSHOW_DEMO_GAME_JOIN_CODE,
  QUIZSHOW_DEMO_GAME_SESSION_PREFIX,
  QUIZSHOW_DEMO_JOIN_CODE,
} from "../quizshow.constants";
import {
  normaliseStoredQuiz,
  type QuizshowStoredQuizShape,
} from "../quizshowNormalise";
import { playableRoundCount } from "../quizshowWheel";
import { emitDemoRematch } from "./quizshowDemoBus";
import {
  QUIZSHOW_DEMO_GAME_HOST,
  QUIZSHOW_DEMO_GAME_IDS,
  QUIZSHOW_DEMO_GAME_SEEDS,
  type QuizshowDemoGameSeed,
} from "./quizshowDemoGames.data";
import {
  demoAssertRematch,
  demoAssertShape,
  demoClearSessionEnd,
  demoBadRequest,
  demoBodyOf,
  demoCompletenessProblems,
  demoDefaultQuizShape,
  demoEventImportSources,
  demoEventSourceCopy,
  demoImportResultOf,
  demoImportRoundRefs,
  demoJoinCodeFor,
  demoLiveSessionRefOf,
  demoOpenSettingsOf,
  demoQuizChangedRefusal,
  demoRecordCodeEnd,
  demoRefreshSession,
  demoRefusal,
  hasAdultsRound,
  quizFromInput,
  type DemoLiveSession,
  type DemoQuizBody,
  type DemoQuizCopy,
} from "./quizshowDemoQuizzes";
import { QUIZSHOW_DEMO_RESULTS } from "./quizshowDemoStore.data";
import {
  demoGetTemplate,
  demoTemplateCopy,
  onDemoTemplateDeleted,
} from "./quizshowDemoTemplates";

interface DemoGame {
  gameId: string;
  quiz: QuizshowQuiz;
  isAdultsOnly: boolean;
  liveSession: DemoLiveSession | null;
  hasResults: boolean;
  /** C6.25: when a template import named the source; null without one. */
  sourceTemplateCopiedAt: string | null;
  /** Item 52. */
  lastOpenSettings: QuizshowOpenSettingsMemory | null;
}

const RESERVED_JOIN_CODES = new Set([
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_GAME_JOIN_CODE,
]);
const GAME_ADULTS_CODE = "quizshow_game_adults_rounds_need_switch";

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
const gamesById = new Map<string, DemoGame>();
let hasSeededGames = false;
let gameCounter = 0;
let saveCounter = 0;
let rematchCounter = 0;

export function resetQuizshowDemoGames(): void {
  gamesById.clear();
  hasSeededGames = false;
  gameCounter = 0;
  saveCounter = 0;
  rematchCounter = 0;
}

/** The after-dark seed keeps the fixed demo code; every other game gets a stable code from its id. */
function joinCodeFor(gameId: string): string {
  if (gameId === QUIZSHOW_DEMO_GAME_IDS.afterDark) {
    return QUIZSHOW_DEMO_GAME_JOIN_CODE;
  }
  return demoJoinCodeFor(gameId, RESERVED_JOIN_CODES);
}

function sessionIdFor(gameId: string): string {
  return QUIZSHOW_DEMO_GAME_SESSION_PREFIX + gameId;
}

function nextIdPrefix(gameId: string): string {
  saveCounter += 1;
  return `demo-${gameId}-${saveCounter}`;
}

function buildQuiz(
  gameId: string,
  body: QuizshowStoredQuizShape,
  sourceTemplateId: string | null,
  updatedAt: string,
): QuizshowQuiz {
  return quizFromInput(body, {
    idPrefix: nextIdPrefix(gameId),
    updatedAt,
    sourceTemplateId,
  });
}

function lobbyOf(
  gameId: string,
  options: {
    joinCode: string;
    playMode: DemoLiveSession["playMode"];
    isPractice: boolean;
    quiz: QuizshowQuiz;
    isAdultsOnly: boolean;
  },
): DemoLiveSession {
  return {
    sessionId: sessionIdFor(gameId),
    joinCode: options.joinCode,
    status: "lobby",
    playMode: options.playMode,
    playerCount: 0,
    startedAt: new Date().toISOString(),
    isPractice: options.isPractice,
    sourceUpdatedAt: options.quiz.updatedAt,
    isAdultsOnly: options.isAdultsOnly || hasAdultsRound(options.quiz),
    quizTitle: options.quiz.title,
  };
}

/** Reads the static template seed, so deleting a demo template never breaks a seeded game. */
function seededGame(seed: QuizshowDemoGameSeed): DemoGame {
  const templateSeed = templateSeedById(seed.templateId);
  const rounds = templateSeed.quiz.rounds.map((round, roundIndex) =>
    roundIndex === seed.adultsRoundIndex
      ? { ...round, contentLabel: "adults" as const }
      : round,
  );
  const quiz = buildQuiz(
    seed.gameId,
    { ...templateSeed.quiz, title: seed.title, rounds },
    templateSeed.id,
    seed.updatedAt,
  );
  const liveSession = seed.isLobbyOpen
    ? lobbyOf(seed.gameId, {
        joinCode: joinCodeFor(seed.gameId),
        playMode: "solo",
        isPractice: false,
        quiz,
        isAdultsOnly: seed.isAdultsOnly,
      })
    : null;
  return {
    gameId: seed.gameId,
    quiz,
    isAdultsOnly: seed.isAdultsOnly,
    liveSession,
    hasResults: seed.hasResults,
    sourceTemplateCopiedAt: seed.sourceTemplateCopiedAt,
    lastOpenSettings: null,
  };
}

/** Every demo game, seeded on first use after a reset. */
function games(): Map<string, DemoGame> {
  if (!hasSeededGames) {
    hasSeededGames = true;
    for (const seed of QUIZSHOW_DEMO_GAME_SEEDS) {
      gamesById.set(seed.gameId, seededGame(seed));
    }
  }
  return gamesById;
}

// A deleted template leaves its game copies intact and clears their source id, as the live foreign key does.
// Seeding first means a seeded game copied from that template is cleared too.
onDemoTemplateDeleted((templateId) => {
  for (const game of games().values()) {
    if (game.quiz.sourceTemplateId === templateId) {
      game.quiz = { ...game.quiz, sourceTemplateId: null };
    }
  }
});

/**
 * C6.25: the template line of a copy, read from the demo template store. Null
 * without a source or a copied stamp, and when the template is gone or
 * unpublished. The update flag compares the template's latest publish with
 * the copy time.
 */
export function demoSourceTemplateRef(
  sourceTemplateId: string | null,
  copiedAt: string | null,
): QuizshowSourceTemplateRef | null {
  if (sourceTemplateId === null || copiedAt === null) return null;
  let detail: ReturnType<typeof demoGetTemplate>;
  try {
    detail = demoGetTemplate(sourceTemplateId);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
  if (detail.status !== "published") return null;
  const { lastPublishedAt } = detail;
  if (lastPublishedAt === null) return null;
  return {
    templateId: sourceTemplateId,
    title: { ...detail.card.title },
    copiedAt,
    lastPublishedAt,
    hasUpdate: Date.parse(lastPublishedAt) > Date.parse(copiedAt),
    changeNote: { ...detail.changeNote },
  };
}

/** Newest updatedAt first; among equal times the game added last comes first. */
function gamesNewestFirst(): DemoGame[] {
  return [...games().values()]
    .reverse()
    .sort((first, second) =>
      second.quiz.updatedAt.localeCompare(first.quiz.updatedAt),
    );
}

function requireGame(gameId: string): DemoGame {
  const game = games().get(gameId);
  if (!game) throw demoRefusal(404, "quizshow_game_not_found");
  return game;
}

function questionCountOf(quiz: QuizshowQuiz): number {
  return quiz.rounds.reduce(
    (total, round) => total + round.questions.length,
    0,
  );
}

function liveSessionRefOf(game: DemoGame): QuizshowLiveSessionRef | null {
  return game.liveSession
    ? demoLiveSessionRefOf(game.liveSession, game.quiz.updatedAt)
    : null;
}

function responseFor(game: DemoGame): QuizshowGameResponse {
  const quiz = normaliseStoredQuiz(structuredClone(game.quiz));
  return {
    gameId: game.gameId,
    quiz: {
      ...quiz,
      sourceTemplate: demoSourceTemplateRef(
        quiz.sourceTemplateId,
        game.sourceTemplateCopiedAt,
      ),
    },
    problems: demoCompletenessProblems(game.quiz),
    isAdultsEvent: game.isAdultsOnly,
    isAdultsOnly: game.isAdultsOnly,
    liveSession: liveSessionRefOf(game),
    hasResults: game.hasResults,
    lastOpenSettings: game.lastOpenSettings
      ? { ...game.lastOpenSettings }
      : null,
  };
}

function summaryOf(game: DemoGame): QuizshowGameSummary {
  return {
    id: game.gameId,
    title: game.quiz.title,
    roundCount: playableRoundCount(game.quiz.rounds),
    questionCount: questionCountOf(game.quiz),
    isAdultsOnly: game.isAdultsOnly,
    liveSession: liveSessionRefOf(game),
    hasResults: game.hasResults,
    updatedAt: game.quiz.updatedAt,
  };
}

function gameSourceOf(game: DemoGame): QuizshowImportSource {
  return {
    kind: "game",
    eventSlug: null,
    eventTitle: null,
    startAt: null,
    gameId: game.gameId,
    quizTitle: game.quiz.title,
    roundCount: playableRoundCount(game.quiz.rounds),
    questionCount: questionCountOf(game.quiz),
    hasAdultsRounds: hasAdultsRound(game.quiz),
    isSameSeries: false,
    rounds: demoImportRoundRefs(game.quiz.rounds),
  };
}

/** A game's quiz as an import source; the excluded game (the import target) or an unknown id is refused. */
export function demoGameSourceCopy(
  gameId: string,
  excludedGameId: string | null = null,
): DemoQuizCopy {
  const game = gameId === excludedGameId ? undefined : games().get(gameId);
  if (!game) throw demoRefusal(404, "quizshow_import_source_not_found");
  return {
    body: demoBodyOf(game.quiz),
    sourceTemplateId: game.quiz.sourceTemplateId,
    sourceTemplateCopiedAt: game.sourceTemplateCopiedAt,
  };
}

function sourceCopyOf(
  source: QuizshowImportInput,
  excludedGameId: string | null,
): DemoQuizCopy {
  if (source.from === "template") return demoTemplateCopy(source.templateId);
  if (source.from === "event") return demoEventSourceCopy(source.eventSlug);
  return demoGameSourceCopy(source.gameId, excludedGameId);
}

function assertBelowGameLimit(): void {
  if (games().size >= QUIZSHOW_GAMES_PER_MEMBER_MAX) {
    throw demoRefusal(403, "quizshow_game_limit_reached");
  }
}

function trimmedTitleOf(title: string): string {
  const trimmedTitle = title.trim();
  if (
    trimmedTitle.length === 0 ||
    trimmedTitle.length > QUIZSHOW_LIMITS.quizTitleMax
  ) {
    throw demoBadRequest("title must be 1 to 120 characters");
  }
  return trimmedTitle;
}

function addGame(
  body: DemoQuizBody,
  source: { sourceTemplateId: string | null; copiedAt: string | null },
  isAdultsOnly: boolean,
): DemoGame {
  gameCounter += 1;
  const gameId = `demo-game-new-${gameCounter}`;
  const game: DemoGame = {
    gameId,
    quiz: buildQuiz(
      gameId,
      body,
      source.sourceTemplateId,
      new Date().toISOString(),
    ),
    isAdultsOnly,
    liveSession: null,
    hasResults: false,
    sourceTemplateCopiedAt:
      source.sourceTemplateId === null ? null : source.copiedAt,
    lastOpenSettings: null,
  };
  games().set(gameId, game);
  return game;
}

export function demoListGames(): QuizshowGameListResponse {
  return {
    games: gamesNewestFirst().map(summaryOf),
    limit: QUIZSHOW_GAMES_PER_MEMBER_MAX,
  };
}

export function demoCreateGame(
  body: QuizshowCreateGameInput,
): QuizshowGameResponse {
  const title = trimmedTitleOf(body.title);
  assertBelowGameLimit();
  if (body.source === null) {
    const blankBody: DemoQuizBody = {
      title,
      languages: "both",
      screenLanguage: "en",
      rounds: [],
    };
    return responseFor(
      addGame(blankBody, { sourceTemplateId: null, copiedAt: null }, false),
    );
  }
  const copy = sourceCopyOf(body.source, null);
  const copiedBody = { ...copy.body, title };
  const copiedAt =
    copy.sourceTemplateCopiedAt === undefined
      ? new Date().toISOString()
      : copy.sourceTemplateCopiedAt;
  return responseFor(
    addGame(
      copiedBody,
      { sourceTemplateId: copy.sourceTemplateId, copiedAt },
      hasAdultsRound(copiedBody),
    ),
  );
}

export function demoGetGame(gameId: string): QuizshowGameResponse {
  return responseFor(requireGame(gameId));
}

export function demoPutGame(
  gameId: string,
  body: QuizshowGameInput,
): QuizshowGameResponse {
  const { expectedUpdatedAt, isAdultsOnly, ...quizBody }: QuizshowGameInput =
    body;
  const title = trimmedTitleOf(quizBody.title);
  const game = requireGame(gameId);
  demoAssertShape(quizBody, {
    isAdultsAllowed: isAdultsOnly,
    adultsCode: GAME_ADULTS_CODE,
  });
  if (expectedUpdatedAt !== game.quiz.updatedAt) {
    throw demoQuizChangedRefusal(game.quiz.updatedAt);
  }
  game.quiz = buildQuiz(
    gameId,
    { ...quizBody, title },
    game.quiz.sourceTemplateId,
    new Date().toISOString(),
  );
  game.isAdultsOnly = isAdultsOnly;
  return responseFor(game);
}

/** Ends an open lobby with the game, so its code stops joining. */
export function demoDeleteGame(gameId: string): void {
  const game = requireGame(gameId);
  game.liveSession = null;
  games().delete(gameId);
}

export function demoDuplicateGame(gameId: string): QuizshowGameResponse {
  const game = requireGame(gameId);
  assertBelowGameLimit();
  return responseFor(
    addGame(
      demoBodyOf(game.quiz),
      {
        sourceTemplateId: game.quiz.sourceTemplateId,
        copiedAt: game.sourceTemplateCopiedAt,
      },
      game.isAdultsOnly,
    ),
  );
}

/** C6.28: replace swaps the quiz and keeps the game's title (its name in My games); append adds the chosen rows. */
export function demoImportGame(
  gameId: string,
  body: QuizshowImportInput,
): QuizshowGameResponse {
  const game = requireGame(gameId);
  const copy = sourceCopyOf(body, gameId);
  const now = new Date().toISOString();
  const imported = demoImportResultOf(
    body,
    copy,
    {
      stored: {
        quiz: game.quiz,
        sourceTemplateCopiedAt: game.sourceTemplateCopiedAt,
      },
      keptTitle: game.quiz.title,
      assertAllowed: (quizBody) =>
        demoAssertShape(quizBody, {
          isAdultsAllowed: game.isAdultsOnly,
          adultsCode: GAME_ADULTS_CODE,
        }),
    },
    now,
  );
  game.quiz = buildQuiz(gameId, imported.body, imported.sourceTemplateId, now);
  game.sourceTemplateCopiedAt = imported.sourceTemplateCopiedAt;
  return responseFor(game);
}

/** Events first, then the member's other games, newest first. */
export function demoGameImportSources(gameId: string): {
  items: QuizshowImportSource[];
} {
  requireGame(gameId);
  const eventSources = demoEventImportSources().map((source) => ({
    ...source,
    isSameSeries: false,
  }));
  const gameSources = gamesNewestFirst()
    .filter((game) => game.gameId !== gameId)
    .map(gameSourceOf);
  return { items: [...eventSources, ...gameSources] };
}

/** The member's games as sources on an event's import list. */
export function demoGameSourcesForEvent(): QuizshowImportSource[] {
  return gamesNewestFirst().map(gameSourceOf);
}

/** A new code for a rematch lobby: never a fixed demo code, the old code or another open lobby's. */
function rematchJoinCodeOf(game: DemoGame): string {
  rematchCounter += 1;
  const takenCodes = new Set(RESERVED_JOIN_CODES);
  takenCodes.add(joinCodeFor(game.gameId));
  for (const other of games().values()) {
    if (other.liveSession) takenCodes.add(other.liveSession.joinCode);
  }
  return demoJoinCodeFor(
    `${sessionIdFor(game.gameId)}:rematch:${rematchCounter}`,
    takenCodes,
  );
}

/**
 * Item 17: a practice lobby skips the kept-results replace. Item 38: a
 * rematch keeps the game's demo session id, gets a new code and reaches a
 * running demo engine through the demo bus. Games never notify guests.
 */
export function demoOpenGameSession(
  gameId: string,
  body: QuizshowOpenSessionInput,
): QuizshowOpenSessionResponse {
  if (body.notifyGuests) {
    throw demoBadRequest("notifyGuests must be equal to false");
  }
  const game = requireGame(gameId);
  const problems = demoCompletenessProblems(game.quiz);
  if (problems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_incomplete", { problems });
  }
  const sessionId = sessionIdFor(gameId);
  const rematchOfSessionId = body.rematchOfSessionId;
  // Backend order: the open slot, then the rematch source, then kept results.
  // The finished session a rematch replays no longer holds the open slot.
  if (game.liveSession && game.liveSession.sessionId !== rematchOfSessionId) {
    throw demoRefusal(409, "quizshow_session_already_open", {
      sessionId: game.liveSession.sessionId,
      joinCode: game.liveSession.joinCode,
    });
  }
  if (rematchOfSessionId !== null) {
    demoAssertRematch(rematchOfSessionId, sessionId, Date.now());
  }
  if (game.hasResults && !body.isPractice) {
    if (!body.shouldReplaceResults) {
      throw demoRefusal(409, "quizshow_results_exist");
    }
    game.hasResults = false;
  }
  const joinCode =
    rematchOfSessionId === null ? joinCodeFor(gameId) : rematchJoinCodeOf(game);
  game.liveSession = lobbyOf(gameId, {
    joinCode,
    playMode: body.playMode,
    isPractice: body.isPractice,
    quiz: game.quiz,
    isAdultsOnly: game.isAdultsOnly,
  });
  game.lastOpenSettings = demoOpenSettingsOf(body);
  if (rematchOfSessionId !== null) {
    demoClearSessionEnd(rematchOfSessionId);
    emitDemoRematch({
      fromSessionId: rematchOfSessionId,
      sessionId,
      joinCode,
      playMode: body.playMode,
    });
  }
  return { sessionId, joinCode, isGuestPushSent: false };
}

/** C6.10 for a game's lobby; the mismatch check reads the game's own 18+ switch. */
export function demoRefreshGameLobby(gameId: string): { isNoop: boolean } {
  const game = requireGame(gameId);
  return demoRefreshSession(game.liveSession, game.quiz, game.isAdultsOnly);
}

/** A store saw this game's session end: the open slot frees (item 38) and its code is remembered for the join preview (C5.1). */
export function demoEndGameSession(sessionId: string, endedAtMs: number): void {
  const gameId = demoGameIdForSession(sessionId);
  const game = gameId === null ? undefined : games().get(gameId);
  if (game?.liveSession?.sessionId !== sessionId) return;
  demoRecordCodeEnd(game.liveSession.joinCode, endedAtMs);
  game.liveSession = null;
}

export function demoGameResults(gameId: string): QuizshowResultsResponse {
  const game = requireGame(gameId);
  if (!game.hasResults) throw demoRefusal(404, "quizshow_results_not_found");
  return structuredClone(QUIZSHOW_DEMO_RESULTS);
}

export function demoDeleteGameResults(gameId: string): void {
  const game = requireGame(gameId);
  if (!game.hasResults) throw demoRefusal(404, "quizshow_results_not_found");
  game.hasResults = false;
}

/** The quiz a demo engine plays for this game: the one saved in this tab, else the Pride seed's quiz. */
export function demoGameQuizFor(gameId: string): QuizshowQuiz {
  const game = games().get(gameId);
  if (game) return normaliseStoredQuiz(structuredClone(game.quiz));
  return quizFromInput(demoDefaultQuizShape(), {
    idPrefix: `demo-${QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory}`,
    updatedAt: new Date(0).toISOString(),
    sourceTemplateId: QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
  });
}

/** The open lobby of a demo game, or null when it has none or is gone. */
export function demoGameLiveSession(
  gameId: string,
): QuizshowLiveSessionRef | null {
  const game = games().get(gameId);
  return game ? liveSessionRefOf(game) : null;
}

/** The session id and join code a demo engine plays this game under: its open lobby's, else the ones a lobby would get. */
export function demoGameSessionRef(gameId: string): {
  sessionId: string;
  joinCode: string;
} {
  const liveSession = demoGameLiveSession(gameId);
  if (liveSession !== null) {
    return {
      sessionId: liveSession.sessionId,
      joinCode: liveSession.joinCode,
    };
  }
  return { sessionId: sessionIdFor(gameId), joinCode: joinCodeFor(gameId) };
}

export function demoGameIdForSession(sessionId: string): string | null {
  if (!sessionId.startsWith(QUIZSHOW_DEMO_GAME_SESSION_PREFIX)) return null;
  const gameId = sessionId.slice(QUIZSHOW_DEMO_GAME_SESSION_PREFIX.length);
  return gameId.length > 0 ? gameId : null;
}

function gameWithLobbyCode(code: string): DemoGame | undefined {
  return [...games().values()].find(
    (candidate) => candidate.liveSession?.joinCode === code,
  );
}

/** Answers a join for a demo game whose lobby holds this normalized code, else null. */
export function demoJoinGame(code: string): QuizshowJoinResponse | null {
  const game = gameWithLobbyCode(code);
  if (!game?.liveSession) return null;
  return {
    sessionId: game.liveSession.sessionId,
    kind: "game",
    eventSlug: null,
    eventTitle: null,
    quizTitle: game.quiz.title,
    isAdultsOnly: game.isAdultsOnly || hasAdultsRound(game.quiz),
    host: { ...QUIZSHOW_DEMO_GAME_HOST },
    status: game.liveSession.status,
    isRejoin: false,
  };
}

/** C5.1 for a demo game's lobby code: the quiz title and status only; null when no lobby holds it. */
export function demoGameJoinPreview(code: string): QuizshowJoinPreview | null {
  const game = gameWithLobbyCode(code);
  if (!game?.liveSession) return null;
  return {
    quizTitle: game.liveSession.quizTitle,
    status: game.liveSession.status,
  };
}
