import type { AdminTone } from "../ui";
import {
  QUIZ_EVENT_GAME_SLOTS_MAX,
  type QuizBadgeDefinitionDTO,
  type QuizEventBadgeSetupDTO,
  type QuizEventSearchRowDTO,
  type QuizWinBadgeChip,
} from "../../../shared/contracts/quizWinBadges";
import type { QuizEventBadgeSetupBody } from "./api/quizBadgesAdmin.api";

/** Game number 1 to 5, each with its badge definition ids in slot order. */
export type QuizEventSetupDraft = Readonly<Record<number, readonly string[]>>;

/** The games an event can give badges for, in order. */
export const QUIZ_EVENT_GAME_NUMBERS: readonly number[] = Array.from(
  { length: QUIZ_EVENT_GAME_SLOTS_MAX },
  (_unused, index) => index + 1,
);

/** How an event start or a game finish reads on the admin pages. */
export const QUIZ_EVENT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export const QUIZ_EVENT_STATUS_LABEL_KEYS: Record<
  QuizEventSearchRowDTO["status"],
  string
> = {
  draft: "quizshow:winBadges.admin.events.status.draft",
  published: "quizshow:winBadges.admin.events.status.published",
  cancelled: "quizshow:winBadges.admin.events.status.cancelled",
};

export const QUIZ_EVENT_STATUS_TONES: Record<
  QuizEventSearchRowDTO["status"],
  AdminTone
> = {
  draft: "ghost",
  published: "jade",
  cancelled: "danger",
};

/** The id of the events page heading, so focus can land on it in code. */
export const QUIZ_EVENTS_HEADING_ID = "admin-quiz-events-heading";

function idsOfGame(draft: QuizEventSetupDraft, gameNumber: number) {
  return draft[gameNumber] ?? [];
}

/** All five games of the setup, each with its badges in slot order. */
export function draftFromSetup(
  setup: QuizEventBadgeSetupDTO,
): QuizEventSetupDraft {
  const draft: Record<number, readonly string[]> = {};
  for (const gameNumber of QUIZ_EVENT_GAME_NUMBERS) {
    const game = setup.games.find(
      (candidate) => candidate.gameNumber === gameNumber,
    );
    draft[gameNumber] = (game?.badges ?? []).map((badge) => badge.definitionId);
  }
  return draft;
}

/**
 * The save body: all five games, game number ascending. Given the ids the
 * setup or the library still knows, it leaves out a badge deleted elsewhere
 * since the draft took it, which the page no longer shows.
 */
export function saveBodyFromDraft(
  draft: QuizEventSetupDraft,
  knownDefinitionIds?: ReadonlySet<string>,
): QuizEventBadgeSetupBody {
  return {
    games: QUIZ_EVENT_GAME_NUMBERS.map((gameNumber) => ({
      gameNumber,
      badgeDefinitionIds: idsOfGame(draft, gameNumber).filter(
        (definitionId) =>
          knownDefinitionIds === undefined ||
          knownDefinitionIds.has(definitionId),
      ),
    })),
  };
}

/** Every badge id the setup gives or the library holds. */
export function knownDefinitionIdsOf(
  setup: QuizEventBadgeSetupDTO,
  library: readonly QuizBadgeDefinitionDTO[],
): Set<string> {
  return new Set([
    ...setup.games.flatMap((game) =>
      game.badges.map((badge) => badge.definitionId),
    ),
    ...library.map((definition) => definition.id),
  ]);
}

/** True once any game lists other badges, or the same ones in another order. */
export function isDraftChanged(
  draft: QuizEventSetupDraft,
  setup: QuizEventBadgeSetupDTO,
): boolean {
  const saved = draftFromSetup(setup);
  return QUIZ_EVENT_GAME_NUMBERS.some((gameNumber) => {
    const draftIds = idsOfGame(draft, gameNumber);
    const savedIds = idsOfGame(saved, gameNumber);
    return (
      draftIds.length !== savedIds.length ||
      draftIds.some((id, index) => id !== savedIds[index])
    );
  });
}

/** True when the draft takes a badge off a game that has already been played. */
export function hasRemovedFromPlayedGame(
  draft: QuizEventSetupDraft,
  setup: QuizEventBadgeSetupDTO,
): boolean {
  return setup.games.some((game) =>
    hasRemovedFromPlayedGameNumber(draft, setup, game.gameNumber),
  );
}

/** True when the draft takes a badge off this game and the game has been played. */
export function hasRemovedFromPlayedGameNumber(
  draft: QuizEventSetupDraft,
  setup: QuizEventBadgeSetupDTO,
  gameNumber: number,
): boolean {
  const game = setup.games.find(
    (candidate) => candidate.gameNumber === gameNumber,
  );
  if (game === undefined || !game.isFinished) return false;
  const draftIds = idsOfGame(draft, gameNumber);
  return game.badges.some((badge) => !draftIds.includes(badge.definitionId));
}

/** Live badges the game does not give yet, by English name. */
export function attachableBadges(
  library: readonly QuizBadgeDefinitionDTO[],
  draft: QuizEventSetupDraft,
  gameNumber: number,
): QuizBadgeDefinitionDTO[] {
  const attachedIds = idsOfGame(draft, gameNumber);
  return library
    .filter(
      (definition) =>
        !definition.isArchived && !attachedIds.includes(definition.id),
    )
    .sort((first, second) => first.name.en.localeCompare(second.name.en));
}

export function chipOfDefinition(
  definition: QuizBadgeDefinitionDTO,
): QuizWinBadgeChip {
  return {
    definitionId: definition.id,
    badgeKey: definition.badgeKey,
    name: definition.name,
    iconKey: definition.iconKey,
    tint: definition.tint,
    rarity: definition.rarity,
    isArchived: definition.isArchived,
  };
}

/**
 * The chips of one draft game in slot order. A badge the setup already gives
 * keeps its chip (an archived one included); a badge attached in this draft
 * reads its chip from the library. An id neither knows is left out.
 */
export function draftChipsOfGame(
  draft: QuizEventSetupDraft,
  gameNumber: number,
  setup: QuizEventBadgeSetupDTO,
  library: readonly QuizBadgeDefinitionDTO[],
): QuizWinBadgeChip[] {
  return idsOfGame(draft, gameNumber).flatMap((definitionId) => {
    const savedChip = setup.games
      .flatMap((game) => game.badges)
      .find((badge) => badge.definitionId === definitionId);
    if (savedChip) return [savedChip];
    const definition = library.find(
      (candidate) => candidate.id === definitionId,
    );
    return definition ? [chipOfDefinition(definition)] : [];
  });
}
