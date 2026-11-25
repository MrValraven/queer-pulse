import { ApiError } from "../../../shared/api/client";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";
import {
  QUIZ_BADGE_CATEGORY,
  QUIZ_BADGE_KEY_PREFIX,
  QUIZ_BADGE_WINS_PER_BADGE_MAX,
  QUIZ_BADGES_PER_GAME_MAX,
  QUIZ_EVENT_GAME_SLOTS_MAX,
  QUIZ_EVENT_SEARCH_MAX_LENGTH,
  type QuizBadgeDefinitionDTO,
  type QuizBadgeLibraryResponse,
  type QuizBadgeWinDTO,
  type QuizEventBadgeSetupDTO,
  type QuizEventBadgeSetupSaveResponse,
  type QuizEventSearchRowDTO,
  type QuizFinishedGameDTO,
  type QuizGameWinnerDTO,
  type QuizGameWinRevokeResponse,
  type QuizshowResultsWinBadges,
  type QuizshowResultsWinnerBadges,
  type QuizshowWinBadgesPreviewResponse,
  type QuizWinBadgeChip,
} from "../../../shared/contracts/quizWinBadges";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { gatheringDetails } from "../../gatherings/data";
import type { BadgeDTO } from "../../members/api/recognition.api";
import {
  currentUserSlug,
  getMember,
  memberAvatar,
} from "../../members/data/members";
import { quizWinBadgeRefusal } from "./quizWinBadgeErrors";
import {
  demoQuizEventIdOf,
  QUIZ_WIN_BADGES_DEMO_DEFINITIONS,
  QUIZ_WIN_BADGES_DEMO_EVENTS,
  QUIZ_WIN_BADGES_DEMO_GAMES,
  QUIZ_WIN_BADGES_DEMO_SEED_WINS,
  QUIZ_WIN_BADGES_DEMO_SLOTS,
  IS_QUIZ_WIN_BADGES_DEMO_VIEWER_IN_RESULTS,
  resolveQuizWinBadgesDemoInstant,
  type QuizWinBadgesDemoEvent,
} from "./quizWinBadgesDemo.data";
import {
  parseQuizBadgeInput,
  parseQuizEventSetupBody,
  parseRevokeReason,
  type StoredQuizBadgeDefinition,
} from "./quizWinBadgesDemoRules";

// The quiz win badges demo: one lazily seeded in-memory record that the
// admin pages, the preview hook, the results demo and the recognition demo
// all read (contract section 14). It answers the server's shapes, order and
// refusals (sections 3 to 5 and 8). Every read hands back a deep copy and
// every write bumps the version that `useSyncExternalStore` readers follow.

const LIBRARY_LIMIT = 200;
const SEARCH_PAGE_SIZE = 20;

interface StoredSlot {
  eventId: string;
  gameNumber: number;
  definitionId: string;
  order: number;
}

interface StoredGame {
  eventId: string;
  gameNumber: number;
  sessionId: string;
  finishedAt: string;
  playMode: "solo" | "teams";
}

interface StoredWinner {
  winnerId: string;
  eventId: string;
  sessionId: string;
  gameNumber: number;
  userSlug: string;
  screenName: string;
  teamName: string | null;
  revokedAt: string | null;
  revokedBySlug: string | null;
  revokeReason: string | null;
}

interface StoredWin {
  winId: string;
  definitionId: string;
  userSlug: string;
  eventId: string | null;
  sessionId: string | null;
  gameNumber: number;
  eventName: string;
  eventWasPublic: boolean;
  eventWasAdultsOnly: boolean;
  wonAt: string;
}

interface StoredAward {
  userSlug: string;
  definitionId: string;
  awardedAt: string;
  hiddenFromProfile: boolean;
}

interface QuizWinBadgesDemoState {
  definitions: StoredQuizBadgeDefinition[];
  events: QuizWinBadgesDemoEvent[];
  slots: StoredSlot[];
  games: StoredGame[];
  winners: StoredWinner[];
  wins: StoredWin[];
  awards: StoredAward[];
  nextDefinitionNumber: number;
  nextWinNumber: number;
  nextSlotOrder: number;
}

let demoState: QuizWinBadgesDemoState | null = null;
let demoVersion = 0;
const listeners = new Set<() => void>();

function bumpVersion(): void {
  demoVersion += 1;
  for (const listener of listeners) listener();
}

function eventIdOfSlug(slug: string): string {
  return demoQuizEventIdOf(slug);
}

function seedState(): QuizWinBadgesDemoState {
  const seedTime = Date.now();
  const state: QuizWinBadgesDemoState = {
    definitions: structuredClone([...QUIZ_WIN_BADGES_DEMO_DEFINITIONS]),
    events: structuredClone([...QUIZ_WIN_BADGES_DEMO_EVENTS]),
    slots: [],
    games: [],
    winners: [],
    wins: [],
    awards: [],
    nextDefinitionNumber: 1,
    nextWinNumber: 1,
    nextSlotOrder: 1,
  };
  for (const slot of QUIZ_WIN_BADGES_DEMO_SLOTS) {
    for (const definitionId of slot.definitionIds) {
      state.slots.push({
        eventId: eventIdOfSlug(slot.eventSlug),
        gameNumber: slot.gameNumber,
        definitionId,
        order: state.nextSlotOrder++,
      });
    }
  }
  for (const game of QUIZ_WIN_BADGES_DEMO_GAMES) {
    const eventId = eventIdOfSlug(game.eventSlug);
    state.games.push({
      eventId,
      gameNumber: game.gameNumber,
      sessionId: game.sessionId,
      finishedAt: resolveQuizWinBadgesDemoInstant(game.finishedAt, seedTime),
      playMode: game.playMode,
    });
    for (const winner of game.winners) {
      state.winners.push({
        winnerId: winner.winnerId,
        eventId,
        sessionId: game.sessionId,
        gameNumber: game.gameNumber,
        userSlug: winner.userSlug,
        screenName: winner.screenName,
        teamName: winner.teamName,
        revokedAt: winner.revoked
          ? resolveQuizWinBadgesDemoInstant(winner.revoked.at, seedTime)
          : null,
        revokedBySlug: winner.revoked?.bySlug ?? null,
        revokeReason: winner.revoked?.reason ?? null,
      });
    }
  }
  for (const seedWin of QUIZ_WIN_BADGES_DEMO_SEED_WINS) {
    if (seedWin.source === "snapshot") {
      insertWin(state, {
        definitionId: seedWin.definitionId,
        userSlug: seedWin.userSlug,
        eventId: seedWin.eventId,
        sessionId: seedWin.sessionId,
        gameNumber: seedWin.gameNumber,
        eventName: seedWin.eventName,
        eventWasPublic: seedWin.eventWasPublic,
        eventWasAdultsOnly: seedWin.eventWasAdultsOnly,
        wonAt: seedWin.wonAt,
      });
      continue;
    }
    const eventId = eventIdOfSlug(seedWin.eventSlug);
    const game = state.games.find(
      (candidate) =>
        candidate.eventId === eventId &&
        candidate.gameNumber === seedWin.gameNumber,
    );
    const event = state.events.find(
      (candidate) => candidate.eventId === eventId,
    );
    if (!game || !event) continue;
    insertWin(state, {
      definitionId: seedWin.definitionId,
      userSlug: seedWin.userSlug,
      eventId,
      sessionId: game.sessionId,
      gameNumber: game.gameNumber,
      eventName: event.title,
      eventWasPublic: event.isPublic,
      eventWasAdultsOnly: event.isAdultsOnly,
      wonAt: game.finishedAt,
    });
  }
  return state;
}

function current(): QuizWinBadgesDemoState {
  if (demoState === null) demoState = seedState();
  return demoState;
}

/** C5.3 steps 1 to 3: the win row (once per session, badge and member), the
 *  award row when new (hidden for an 18+ win), then the award date synced to
 *  the first live win. Answers whether a new win was written. */
function insertWin(
  state: QuizWinBadgesDemoState,
  win: Omit<StoredWin, "winId">,
): boolean {
  const isAlreadyWon =
    win.sessionId !== null &&
    state.wins.some(
      (existing) =>
        existing.sessionId === win.sessionId &&
        existing.definitionId === win.definitionId &&
        existing.userSlug === win.userSlug,
    );
  if (isAlreadyWon) return false;
  state.wins.push({ winId: `demo-quiz-win-${state.nextWinNumber++}`, ...win });
  const hasAward = state.awards.some(
    (award) =>
      award.userSlug === win.userSlug &&
      award.definitionId === win.definitionId,
  );
  if (!hasAward)
    state.awards.push({
      userSlug: win.userSlug,
      definitionId: win.definitionId,
      awardedAt: win.wonAt,
      hiddenFromProfile: win.eventWasAdultsOnly,
    });
  syncAward(state, win.userSlug, win.definitionId);
  return true;
}

function liveWinsOf(
  state: QuizWinBadgesDemoState,
  userSlug: string,
  definitionId: string,
): StoredWin[] {
  return state.wins.filter(
    (win) => win.userSlug === userSlug && win.definitionId === definitionId,
  );
}

/** Sets the award date to the member's first live win of the badge. */
function syncAward(
  state: QuizWinBadgesDemoState,
  userSlug: string,
  definitionId: string,
): void {
  const award = state.awards.find(
    (candidate) =>
      candidate.userSlug === userSlug &&
      candidate.definitionId === definitionId,
  );
  const firstWonAt = liveWinsOf(state, userSlug, definitionId)
    .map((win) => win.wonAt)
    .sort()[0];
  if (award && firstWonAt !== undefined) award.awardedAt = firstWonAt;
}

function findDefinition(definitionId: string): StoredQuizBadgeDefinition {
  const definition = current().definitions.find(
    (candidate) => candidate.id === definitionId,
  );
  if (!definition)
    throw quizWinBadgeRefusal("quiz_badge_not_found", { definitionId });
  return definition;
}

function chipOf(definition: StoredQuizBadgeDefinition): QuizWinBadgeChip {
  return {
    definitionId: definition.id,
    badgeKey: definition.badgeKey,
    name: { ...definition.name },
    iconKey: definition.iconKey,
    tint: definition.tint,
    rarity: definition.rarity,
    isArchived: definition.archivedAt !== null,
  };
}

function chipOfId(definitionId: string): QuizWinBadgeChip | null {
  const definition = current().definitions.find(
    (candidate) => candidate.id === definitionId,
  );
  return definition ? chipOf(definition) : null;
}

function definitionDtoOf(
  definition: StoredQuizBadgeDefinition,
): QuizBadgeDefinitionDTO {
  const state = current();
  const wins = state.wins.filter((win) => win.definitionId === definition.id);
  const eventIds = new Set(
    state.slots
      .filter((slot) => slot.definitionId === definition.id)
      .map((slot) => slot.eventId),
  );
  return structuredClone({
    id: definition.id,
    badgeKey: definition.badgeKey,
    name: definition.name,
    description: definition.description,
    iconKey: definition.iconKey,
    tint: definition.tint,
    rarity: definition.rarity,
    isArchived: definition.archivedAt !== null,
    archivedAt: definition.archivedAt,
    holderCount: new Set(wins.map((win) => win.userSlug)).size,
    winCount: wins.length,
    eventCount: eventIds.size,
    canDelete: wins.length === 0,
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
  });
}

function byEnglishName(
  first: StoredQuizBadgeDefinition,
  second: StoredQuizBadgeDefinition,
): number {
  return first.name.en.localeCompare(second.name.en, "en");
}

/** Route 1: live badges by English name, then archived ones by name. */
export function demoGetQuizBadgeLibrary(): QuizBadgeLibraryResponse {
  const definitions = current().definitions;
  const live = definitions.filter(
    (definition) => definition.archivedAt === null,
  );
  const archived = definitions.filter(
    (definition) => definition.archivedAt !== null,
  );
  return {
    items: [...live.sort(byEnglishName), ...archived.sort(byEnglishName)]
      .slice(0, LIBRARY_LIMIT)
      .map(definitionDtoOf),
  };
}

/** Route 2. */
export function demoCreateQuizBadge(body: unknown): QuizBadgeDefinitionDTO {
  const state = current();
  const input = parseQuizBadgeInput(body, {
    isCreate: true,
    editingId: null,
    definitions: state.definitions,
  });
  const id = `demo-quiz-badge-${state.nextDefinitionNumber++}`;
  const now = new Date().toISOString();
  const definition: StoredQuizBadgeDefinition = {
    id,
    badgeKey: `${QUIZ_BADGE_KEY_PREFIX}${id}`,
    ...input,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  state.definitions.push(definition);
  bumpVersion();
  return definitionDtoOf(definition);
}

/** Route 3: an empty edit answers the badge as it is. */
export function demoUpdateQuizBadge(
  definitionId: string,
  body: unknown,
): QuizBadgeDefinitionDTO {
  const definition = findDefinition(definitionId);
  const input = parseQuizBadgeInput(body, {
    isCreate: false,
    editingId: definitionId,
    definitions: current().definitions,
  });
  if (Object.keys(input).length === 0) return definitionDtoOf(definition);
  Object.assign(definition, input, { updatedAt: new Date().toISOString() });
  bumpVersion();
  return definitionDtoOf(definition);
}

/** Route 4: already archived is a no-op. */
export function demoArchiveQuizBadge(
  definitionId: string,
): QuizBadgeDefinitionDTO {
  const definition = findDefinition(definitionId);
  if (definition.archivedAt === null) {
    const now = new Date().toISOString();
    definition.archivedAt = now;
    definition.updatedAt = now;
    bumpVersion();
  }
  return definitionDtoOf(definition);
}

/** Route 5: a live badge is a no-op. */
export function demoRestoreQuizBadge(
  definitionId: string,
): QuizBadgeDefinitionDTO {
  const definition = findDefinition(definitionId);
  if (definition.archivedAt !== null) {
    definition.archivedAt = null;
    definition.updatedAt = new Date().toISOString();
    bumpVersion();
  }
  return definitionDtoOf(definition);
}

/** Route 6: refused while any win exists; otherwise it leaves every game. */
export function demoDeleteQuizBadge(definitionId: string): void {
  const state = current();
  const definition = findDefinition(definitionId);
  const wins = state.wins.filter((win) => win.definitionId === definition.id);
  if (wins.length > 0)
    throw quizWinBadgeRefusal("quiz_badge_in_use", {
      holderCount: new Set(wins.map((win) => win.userSlug)).size,
    });
  state.slots = state.slots.filter(
    (slot) => slot.definitionId !== definitionId,
  );
  state.definitions = state.definitions.filter(
    (candidate) => candidate.id !== definitionId,
  );
  bumpVersion();
}

function slotIdsOf(eventId: string, gameNumber: number): string[] {
  return current()
    .slots.filter(
      (slot) => slot.eventId === eventId && slot.gameNumber === gameNumber,
    )
    .sort((first, second) => first.order - second.order)
    .map((slot) => slot.definitionId);
}

function gamesOf(eventId: string): StoredGame[] {
  return current()
    .games.filter((game) => game.eventId === eventId)
    .sort((first, second) => first.gameNumber - second.gameNumber);
}

function nextGameNumberOf(eventId: string): number {
  return (
    gamesOf(eventId).reduce(
      (highest, game) => Math.max(highest, game.gameNumber),
      0,
    ) + 1
  );
}

function positivePageOf(page: unknown): number {
  const pageNumber = typeof page === "string" ? Number(page) : page;
  return typeof pageNumber === "number" &&
    Number.isInteger(pageNumber) &&
    pageNumber >= 1
    ? pageNumber
    : 1;
}

/** Route 7: demo events with a quiz, newest first, 20 a page. */
export function demoSearchQuizEvents(
  q: string,
  page: unknown,
): Paginated<QuizEventSearchRowDTO> {
  const state = current();
  const term = foldForSearch(q.trim().slice(0, QUIZ_EVENT_SEARCH_MAX_LENGTH));
  const matches = state.events
    .filter((event) => term === "" || foldForSearch(event.title).includes(term))
    .sort(
      (first, second) =>
        second.startAt.localeCompare(first.startAt) ||
        second.eventId.localeCompare(first.eventId),
    );
  const pageNumber = positivePageOf(page);
  const items = matches
    .slice((pageNumber - 1) * SEARCH_PAGE_SIZE, pageNumber * SEARCH_PAGE_SIZE)
    .map((event) => ({
      eventId: event.eventId,
      slug: event.slug,
      title: event.title,
      startAt: event.startAt,
      status: event.status,
      isAdultsOnly: event.isAdultsOnly,
      configuredGameCount: new Set(
        state.slots
          .filter((slot) => slot.eventId === event.eventId)
          .map((slot) => slot.gameNumber),
      ).size,
      finishedGameCount: gamesOf(event.eventId).length,
    }));
  return {
    items,
    total: matches.length,
    page: pageNumber,
    pageSize: SEARCH_PAGE_SIZE,
  };
}

/** An unknown id answers event_not_found; a demo event without a demo
 *  quiz answers event_has_no_quiz (note 19). */
function findQuizEvent(eventId: string): QuizWinBadgesDemoEvent {
  const event = current().events.find(
    (candidate) => candidate.eventId === eventId,
  );
  if (event) return event;
  const isDemoEventWithoutQuiz = Object.keys(gatheringDetails).some(
    (slug) => demoQuizEventIdOf(slug) === eventId,
  );
  throw quizWinBadgeRefusal(
    isDemoEventWithoutQuiz
      ? "quiz_badge_event_has_no_quiz"
      : "quiz_badge_event_not_found",
  );
}

function memberRefOf(userSlug: string | null): MemberRefDTO | null {
  if (userSlug === null) return null;
  const member = getMember(userSlug);
  if (!member) return null;
  return {
    slug: userSlug,
    firstName: member.first,
    lastName: member.last,
    avatarUrl: memberAvatar(userSlug)?.photo ?? null,
  };
}

function winnerDtoOf(winner: StoredWinner): QuizGameWinnerDTO {
  const wins = current()
    .wins.filter(
      (win) =>
        win.sessionId === winner.sessionId && win.userSlug === winner.userSlug,
    )
    .flatMap((win) => {
      const badge = chipOfId(win.definitionId);
      return badge ? [{ winId: win.winId, badge, wonAt: win.wonAt }] : [];
    });
  return {
    winnerId: winner.winnerId,
    screenName: winner.screenName,
    teamName: winner.teamName,
    member: memberRefOf(winner.userSlug),
    wins: winner.revokedAt === null ? wins : [],
    isRevoked: winner.revokedAt !== null,
    revokedAt: winner.revokedAt,
    revokeReason: winner.revokeReason,
    revokedBy: memberRefOf(winner.revokedBySlug),
  };
}

function finishedGameDtoOf(game: StoredGame): QuizFinishedGameDTO {
  const winners = current()
    .winners.filter((winner) => winner.sessionId === game.sessionId)
    .sort(
      (first, second) =>
        (first.teamName ?? "").localeCompare(second.teamName ?? "") ||
        first.screenName.localeCompare(second.screenName),
    );
  return {
    gameNumber: game.gameNumber,
    sessionId: game.sessionId,
    finishedAt: game.finishedAt,
    playMode: game.playMode,
    winners: winners.map(winnerDtoOf),
  };
}

function setupDtoOf(event: QuizWinBadgesDemoEvent): QuizEventBadgeSetupDTO {
  const finishedNumbers = new Set(
    gamesOf(event.eventId).map((game) => game.gameNumber),
  );
  const games = Array.from(
    { length: QUIZ_EVENT_GAME_SLOTS_MAX },
    (_unused, index) => index + 1,
  ).map((gameNumber) => ({
    gameNumber,
    badges: slotIdsOf(event.eventId, gameNumber).flatMap((id) => {
      const chip = chipOfId(id);
      return chip ? [chip] : [];
    }),
    isFinished: finishedNumbers.has(gameNumber),
  }));
  return structuredClone({
    event: {
      id: event.eventId,
      slug: event.slug,
      title: event.title,
      startAt: event.startAt,
      status: event.status,
      isAdultsOnly: event.isAdultsOnly,
      isPublic: event.isPublic,
    },
    nextGameNumber: nextGameNumberOf(event.eventId),
    limits: {
      gameSlotsMax: QUIZ_EVENT_GAME_SLOTS_MAX,
      badgesPerGameMax: QUIZ_BADGES_PER_GAME_MAX,
    },
    games,
    finishedGames: gamesOf(event.eventId).map(finishedGameDtoOf),
  });
}

/** Route 9. */
export function demoGetQuizEventBadgeSetup(
  eventId: string,
): QuizEventBadgeSetupDTO {
  return setupDtoOf(findQuizEvent(eventId));
}

/** Gives a badge just added to a finished game to its live winners (C5.3,
 *  after the fact); answers how many wins it wrote. */
function awardAddedBadge(
  event: QuizWinBadgesDemoEvent,
  gameNumber: number,
  definitionId: string,
): number {
  const state = current();
  const game = state.games.find(
    (candidate) =>
      candidate.eventId === event.eventId &&
      candidate.gameNumber === gameNumber,
  );
  if (!game) return 0;
  const liveWinners = state.winners.filter(
    (winner) =>
      winner.sessionId === game.sessionId && winner.revokedAt === null,
  );
  return liveWinners.filter((winner) =>
    insertWin(state, {
      definitionId,
      userSlug: winner.userSlug,
      eventId: event.eventId,
      sessionId: game.sessionId,
      gameNumber,
      eventName: event.title,
      eventWasPublic: event.isPublic,
      eventWasAdultsOnly: event.isAdultsOnly,
      wonAt: game.finishedAt,
    }),
  ).length;
}

/** Route 8: replaces the setup; a badge added to a finished game reaches
 *  its live winners, and a badge taken off a game keeps every win. */
export function demoPutQuizEventBadgeSetup(
  eventId: string,
  body: unknown,
): QuizEventBadgeSetupSaveResponse {
  const event = findQuizEvent(eventId);
  const state = current();
  const currentSlotsByGame = new Map<number, string[]>();
  for (
    let gameNumber = 1;
    gameNumber <= QUIZ_EVENT_GAME_SLOTS_MAX;
    gameNumber++
  )
    currentSlotsByGame.set(gameNumber, slotIdsOf(eventId, gameNumber));
  const setup = parseQuizEventSetupBody(body, {
    definitions: state.definitions,
    currentSlotsByGame,
  });

  let awardedWinCount = 0;
  for (
    let gameNumber = 1;
    gameNumber <= QUIZ_EVENT_GAME_SLOTS_MAX;
    gameNumber++
  ) {
    const nextIds = setup.get(gameNumber) ?? [];
    const currentIds = currentSlotsByGame.get(gameNumber) ?? [];
    state.slots = state.slots.filter(
      (slot) =>
        slot.eventId !== eventId ||
        slot.gameNumber !== gameNumber ||
        nextIds.includes(slot.definitionId),
    );
    for (const definitionId of nextIds) {
      if (currentIds.includes(definitionId)) continue;
      state.slots.push({
        eventId,
        gameNumber,
        definitionId,
        order: state.nextSlotOrder++,
      });
      awardedWinCount += awardAddedBadge(event, gameNumber, definitionId);
    }
  }
  bumpVersion();
  return { setup: setupDtoOf(event), awardedWinCount };
}

/** Route 10: the event, a winner of that event, still live, the reason, then
 *  C5.5: the winner is marked revoked and every badge that game gave the
 *  member goes, with the award row when no other live win holds it. */
export function demoRevokeQuizGameWin(
  eventId: string,
  winnerId: string,
  body: unknown,
): QuizGameWinRevokeResponse {
  const state = current();
  if (!state.events.some((event) => event.eventId === eventId))
    throw quizWinBadgeRefusal("quiz_badge_event_not_found");
  const winner = state.winners.find(
    (candidate) =>
      candidate.winnerId === winnerId && candidate.eventId === eventId,
  );
  if (!winner) throw quizWinBadgeRefusal("quiz_badge_winner_not_found");
  if (winner.revokedAt !== null)
    throw quizWinBadgeRefusal("quiz_badge_winner_already_revoked", {
      revokedAt: winner.revokedAt,
    });
  const reason = parseRevokeReason(body);

  winner.revokedAt = new Date().toISOString();
  winner.revokedBySlug = currentUserSlug;
  winner.revokeReason = reason;
  const revokedWins = state.wins.filter(
    (win) =>
      win.sessionId === winner.sessionId && win.userSlug === winner.userSlug,
  );
  state.wins = state.wins.filter((win) => !revokedWins.includes(win));
  const revokedBadgeKeys: string[] = [];
  const removedAwardKeys: string[] = [];
  for (const win of revokedWins) {
    const badgeKey = `${QUIZ_BADGE_KEY_PREFIX}${win.definitionId}`;
    if (revokedBadgeKeys.includes(badgeKey)) continue;
    revokedBadgeKeys.push(badgeKey);
    if (liveWinsOf(state, winner.userSlug, win.definitionId).length > 0) {
      syncAward(state, winner.userSlug, win.definitionId);
      continue;
    }
    state.awards = state.awards.filter(
      (award) =>
        award.userSlug !== winner.userSlug ||
        award.definitionId !== win.definitionId,
    );
    removedAwardKeys.push(badgeKey);
  }
  bumpVersion();
  return { winnerId, revokedBadgeKeys, removedAwardKeys };
}

function findEventBySlug(eventSlug: string): QuizWinBadgesDemoEvent | null {
  return (
    current().events.find((candidate) => candidate.slug === eventSlug) ?? null
  );
}

/** Route 11: the next game's badges, null above game 5 or for an empty slot.
 *  Archived badges still attached show. */
export function demoGetWinBadgesPreview(
  eventSlug: string,
): QuizshowWinBadgesPreviewResponse {
  const event = findEventBySlug(eventSlug);
  if (!event) return { preview: null };
  const gameNumber = nextGameNumberOf(event.eventId);
  if (gameNumber > QUIZ_EVENT_GAME_SLOTS_MAX) return { preview: null };
  const badges = slotIdsOf(event.eventId, gameNumber).flatMap((id) => {
    const chip = chipOfId(id);
    return chip ? [chip] : [];
  });
  return { preview: badges.length > 0 ? { gameNumber, badges } : null };
}

/** The badges (in first win order) held by some live win in a session. */
function wonChipsOf(wins: readonly StoredWin[]): QuizWinBadgeChip[] {
  const definitionIds = [...new Set(wins.map((win) => win.definitionId))];
  return definitionIds.flatMap((id) => {
    const chip = chipOfId(id);
    return chip ? [chip] : [];
  });
}

/** C6 results addition for the event's latest finished game: winners by team
 *  in teams play and by winner in solo play, screen names only. */
export function demoResultsWinBadges(
  eventSlug: string,
): QuizshowResultsWinBadges | null {
  const state = current();
  const event = findEventBySlug(eventSlug);
  if (!event) return null;
  const game = gamesOf(event.eventId).at(-1);
  if (!game) return null;
  const sessionWins = state.wins.filter(
    (win) => win.sessionId === game.sessionId,
  );
  if (sessionWins.length === 0) return null;
  const liveWinners = state.winners.filter(
    (winner) =>
      winner.sessionId === game.sessionId && winner.revokedAt === null,
  );
  type WinnerGroup = QuizshowResultsWinnerBadges & { slugs: string[] };
  const groups = new Map<string, WinnerGroup>();
  for (const winner of liveWinners) {
    const isTeam = game.playMode === "teams" && winner.teamName !== null;
    const groupKey = isTeam ? `team:${winner.teamName}` : winner.winnerId;
    const group: WinnerGroup = groups.get(groupKey) ?? {
      kind: isTeam ? "team" : "player",
      name: isTeam ? (winner.teamName ?? "") : winner.screenName,
      badges: [],
      slugs: [],
    };
    group.slugs.push(winner.userSlug);
    groups.set(groupKey, group);
  }
  const winners = [...groups.values()]
    .map(({ slugs, ...group }) => ({
      ...group,
      badges: wonChipsOf(
        sessionWins.filter((win) => slugs.includes(win.userSlug)),
      ),
    }))
    .filter((group) => group.badges.length > 0)
    .sort((first, second) => first.name.localeCompare(second.name));
  if (winners.length === 0) return null;
  const myBadges = IS_QUIZ_WIN_BADGES_DEMO_VIEWER_IN_RESULTS
    ? slotIdsOf(event.eventId, game.gameNumber).flatMap((id) => {
        const chip = chipOfId(id);
        return chip ? [chip] : [];
      })
    : wonChipsOf(sessionWins.filter((win) => win.userSlug === currentUserSlug));
  return structuredClone({ gameNumber: game.gameNumber, winners, myBadges });
}

function eventSlugOf(eventId: string | null): string | null {
  if (eventId === null) return null;
  return (
    current().events.find((event) => event.eventId === eventId)?.slug ?? null
  );
}

function winDtoOf(win: StoredWin, isOwnerView: boolean): QuizBadgeWinDTO {
  const isNamed =
    isOwnerView || (win.eventWasPublic && !win.eventWasAdultsOnly);
  return {
    wonAt: win.wonAt,
    gameNumber: win.gameNumber,
    eventName: isNamed ? win.eventName : null,
    eventSlug: isNamed ? eventSlugOf(win.eventId) : null,
    isAdultsOnlyEvent: isOwnerView ? win.eventWasAdultsOnly : false,
  };
}

/** C7: the demo member's quiz badges, award date order, each with its live
 *  wins newest first. Another viewer loses hidden badges and masked events. */
export function demoQuizBadgeDtos(options: {
  isOwnerView: boolean;
}): BadgeDTO[] {
  const state = current();
  const { isOwnerView } = options;
  return state.awards
    .filter((award) => award.userSlug === currentUserSlug)
    .filter((award) => isOwnerView || !award.hiddenFromProfile)
    .sort(
      (first, second) =>
        first.awardedAt.localeCompare(second.awardedAt) ||
        first.definitionId.localeCompare(second.definitionId),
    )
    .flatMap((award) => {
      const definition = state.definitions.find(
        (candidate) => candidate.id === award.definitionId,
      );
      const wins = liveWinsOf(state, award.userSlug, award.definitionId);
      if (!definition || wins.length === 0) return [];
      const badge: BadgeDTO = {
        key: definition.badgeKey,
        cat: QUIZ_BADGE_CATEGORY,
        name: definition.name.en,
        context: definition.description.en,
        rarity: definition.rarity,
        tint: definition.tint,
        quiz: {
          definitionId: definition.id,
          name: { ...definition.name },
          description: { ...definition.description },
          iconKey: definition.iconKey,
          winCount: wins.length,
          wins: [...wins]
            .sort((first, second) => second.wonAt.localeCompare(first.wonAt))
            .slice(0, QUIZ_BADGE_WINS_PER_BADGE_MAX)
            .map((win) => winDtoOf(win, isOwnerView)),
        },
      };
      if (isOwnerView && award.hiddenFromProfile)
        badge.hiddenFromProfile = true;
      return [badge];
    });
}

/** Route 12 for a quiz badge in demo: the demo member's hide switch. */
export function demoSetQuizBadgeHidden(
  badgeKey: string,
  isHidden: boolean,
): void {
  const state = current();
  const award = state.awards.find(
    (candidate) =>
      candidate.userSlug === currentUserSlug &&
      `${QUIZ_BADGE_KEY_PREFIX}${candidate.definitionId}` === badgeKey,
  );
  if (!award) throw new ApiError(404, "You have not earned that badge");
  if (award.hiddenFromProfile === isHidden) return;
  award.hiddenFromProfile = isHidden;
  bumpVersion();
}

export function subscribeQuizWinBadgesDemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getQuizWinBadgesDemoVersion(): number {
  return demoVersion;
}

/** Puts the demo back to its seed; the next read seeds it again. */
export function resetQuizWinBadgesDemoStore(): void {
  demoState = null;
  bumpVersion();
}
