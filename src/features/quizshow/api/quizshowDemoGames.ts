import {
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  QUIZSHOW_JOIN_CODE_ALPHABET,
  QUIZSHOW_LIMITS,
  type QuizshowCreateGameInput,
  type QuizshowGameInput,
  type QuizshowGameListResponse,
  type QuizshowGameResponse,
  type QuizshowGameSummary,
  type QuizshowImportInput,
  type QuizshowImportSource,
  type QuizshowJoinResponse,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSessionResponse,
  type QuizshowQuiz,
  type QuizshowResultsResponse,
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
  QUIZSHOW_DEMO_GAME_HOST,
  QUIZSHOW_DEMO_GAME_IDS,
  QUIZSHOW_DEMO_GAME_SEEDS,
  type QuizshowDemoGameSeed,
} from "./quizshowDemoGames.data";
import {
  demoAssertShape,
  demoBadRequest,
  demoBodyOf,
  demoCompletenessProblems,
  demoDefaultQuizShape,
  demoEventSourceCopy,
  demoRefusal,
  hasAdultsRound,
  quizFromInput,
  type DemoQuizBody,
  type DemoQuizCopy,
} from "./quizshowDemoQuizzes";
import {
  QUIZSHOW_DEMO_IMPORT_SOURCES,
  QUIZSHOW_DEMO_RESULTS,
} from "./quizshowDemoStore.data";
import {
  demoTemplateCopy,
  onDemoTemplateDeleted,
} from "./quizshowDemoTemplates";

interface DemoGame {
  gameId: string;
  quiz: QuizshowQuiz;
  isAdultsOnly: boolean;
  liveSession: QuizshowLiveSessionRef | null;
  hasResults: boolean;
}

const JOIN_CODE_LENGTH = 6;
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

export function resetQuizshowDemoGames(): void {
  gamesById.clear();
  hasSeededGames = false;
  gameCounter = 0;
  saveCounter = 0;
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

/** The after-dark seed keeps the fixed demo code; every other game gets a stable code from its id. */
function joinCodeFor(gameId: string): string {
  if (gameId === QUIZSHOW_DEMO_GAME_IDS.afterDark) {
    return QUIZSHOW_DEMO_GAME_JOIN_CODE;
  }
  let attempt = 0;
  let code = hashedJoinCode(gameId);
  while (RESERVED_JOIN_CODES.has(code)) {
    attempt += 1;
    code = hashedJoinCode(`${gameId}:${attempt}`);
  }
  return code;
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
  body: DemoQuizBody,
  sourceTemplateId: string | null,
  updatedAt: string,
): QuizshowQuiz {
  return quizFromInput(body, {
    idPrefix: nextIdPrefix(gameId),
    updatedAt,
    sourceTemplateId,
  });
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
  const liveSession: QuizshowLiveSessionRef | null = seed.isLobbyOpen
    ? {
        sessionId: sessionIdFor(seed.gameId),
        joinCode: joinCodeFor(seed.gameId),
        status: "lobby",
        playMode: "solo",
        playerCount: 0,
        startedAt: new Date().toISOString(),
      }
    : null;
  return {
    gameId: seed.gameId,
    quiz,
    isAdultsOnly: seed.isAdultsOnly,
    liveSession,
    hasResults: seed.hasResults,
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

function responseFor(game: DemoGame): QuizshowGameResponse {
  return {
    gameId: game.gameId,
    quiz: structuredClone(game.quiz),
    problems: demoCompletenessProblems(game.quiz),
    isAdultsEvent: game.isAdultsOnly,
    isAdultsOnly: game.isAdultsOnly,
    liveSession: game.liveSession ? { ...game.liveSession } : null,
    hasResults: game.hasResults,
  };
}

function summaryOf(game: DemoGame): QuizshowGameSummary {
  return {
    id: game.gameId,
    title: game.quiz.title,
    roundCount: game.quiz.rounds.length,
    questionCount: questionCountOf(game.quiz),
    isAdultsOnly: game.isAdultsOnly,
    liveSession: game.liveSession ? { ...game.liveSession } : null,
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
    roundCount: game.quiz.rounds.length,
    questionCount: questionCountOf(game.quiz),
    hasAdultsRounds: hasAdultsRound(game.quiz),
    isSameSeries: false,
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
  sourceTemplateId: string | null,
  isAdultsOnly: boolean,
): DemoGame {
  gameCounter += 1;
  const gameId = `demo-game-new-${gameCounter}`;
  const game: DemoGame = {
    gameId,
    quiz: buildQuiz(gameId, body, sourceTemplateId, new Date().toISOString()),
    isAdultsOnly,
    liveSession: null,
    hasResults: false,
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
    return responseFor(addGame(blankBody, null, false));
  }
  const copy = sourceCopyOf(body.source, null);
  const copiedBody = { ...copy.body, title };
  return responseFor(
    addGame(copiedBody, copy.sourceTemplateId, hasAdultsRound(copiedBody)),
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
    throw demoRefusal(409, "quizshow_quiz_changed", {
      updatedAt: game.quiz.updatedAt,
    });
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
      game.quiz.sourceTemplateId,
      game.isAdultsOnly,
    ),
  );
}

export function demoImportGame(
  gameId: string,
  body: QuizshowImportInput,
): QuizshowGameResponse {
  const game = requireGame(gameId);
  const copy = sourceCopyOf(body, gameId);
  demoAssertShape(copy.body, {
    isAdultsAllowed: game.isAdultsOnly,
    adultsCode: GAME_ADULTS_CODE,
  });
  // The game keeps its own title: it is the member's name for it in My games.
  game.quiz = buildQuiz(
    gameId,
    { ...copy.body, title: game.quiz.title },
    copy.sourceTemplateId,
    new Date().toISOString(),
  );
  return responseFor(game);
}

/** Events first, then the member's other games, newest first. */
export function demoGameImportSources(gameId: string): {
  items: QuizshowImportSource[];
} {
  requireGame(gameId);
  const eventSources = QUIZSHOW_DEMO_IMPORT_SOURCES.map((source) => ({
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
  if (game.liveSession) {
    throw demoRefusal(409, "quizshow_session_already_open", {
      sessionId: game.liveSession.sessionId,
      joinCode: game.liveSession.joinCode,
    });
  }
  if (game.hasResults) {
    if (!body.shouldReplaceResults) {
      throw demoRefusal(409, "quizshow_results_exist");
    }
    game.hasResults = false;
  }
  game.liveSession = {
    sessionId: sessionIdFor(gameId),
    joinCode: joinCodeFor(gameId),
    status: "lobby",
    playMode: body.playMode,
    playerCount: 0,
    startedAt: new Date().toISOString(),
  };
  return {
    sessionId: game.liveSession.sessionId,
    joinCode: game.liveSession.joinCode,
    isGuestPushSent: false,
  };
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
  if (game) return structuredClone(game.quiz);
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
  return games().get(gameId)?.liveSession ?? null;
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

/** Answers a join for a demo game whose lobby holds this normalized code, else null. */
export function demoJoinGame(code: string): QuizshowJoinResponse | null {
  const game = [...games().values()].find(
    (candidate) => candidate.liveSession?.joinCode === code,
  );
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
