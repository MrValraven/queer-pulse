import {
  isCommunityBadgeIconKey,
  type CommunityBadgeIconKey,
} from "../../communities/badges/communityBadges.catalog";
import {
  earnedBadges,
  lockedBadges,
  seasonalBadges,
} from "../../members/badges.data";
import {
  QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
  QUIZ_BADGE_NAME_MAX_LENGTH,
  QUIZ_BADGE_RARITIES,
  QUIZ_BADGE_TINTS,
  QUIZ_BADGES_PER_GAME_MAX,
  QUIZ_EVENT_GAME_SLOTS_MAX,
  QUIZ_REVOKE_REASON_MAX_LENGTH,
  type QuizBadgeRarity,
  type QuizBadgeText,
  type QuizBadgeTint,
} from "../../../shared/contracts/quizWinBadges";
import { quizWinBadgeRefusal } from "./quizWinBadgeErrors";
import { quizBadgeCodePointLength } from "./quizWinBadgeText";

// The demo store's checks, in the server's order (contract sections 4 and
// 8), so demo answers each bad value with the code and extras live answers.

/** A badge definition as the demo store keeps it. */
export interface StoredQuizBadgeDefinition {
  id: string;
  badgeKey: string;
  name: QuizBadgeText;
  description: QuizBadgeText;
  iconKey: string;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The fields a create or edit body set; an edit leaves out what it keeps. */
export interface QuizBadgeInputFields {
  name?: QuizBadgeText;
  description?: QuizBadgeText;
  iconKey?: CommunityBadgeIconKey;
  tint?: QuizBadgeTint;
  rarity?: QuizBadgeRarity;
}

export type CompleteQuizBadgeInput = Required<QuizBadgeInputFields>;

export interface QuizBadgeInputOptions {
  isCreate: boolean;
  editingId: string | null;
  definitions: readonly StoredQuizBadgeDefinition[];
}

type QuizBadgeTextGroup = "name" | "description";

const TEXT_GROUP_RULES = {
  name: {
    maxLength: QUIZ_BADGE_NAME_MAX_LENGTH,
    requiredCode: "quiz_badge_name_required",
    tooLongCode: "quiz_badge_name_too_long",
  },
  description: {
    maxLength: QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
    requiredCode: "quiz_badge_description_required",
    tooLongCode: "quiz_badge_description_too_long",
  },
} as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isQuizBadgeTint(value: unknown): value is QuizBadgeTint {
  return (
    typeof value === "string" &&
    (QUIZ_BADGE_TINTS as readonly string[]).includes(value)
  );
}

function isQuizBadgeRarity(value: unknown): value is QuizBadgeRarity {
  return (
    typeof value === "string" &&
    (QUIZ_BADGE_RARITIES as readonly string[]).includes(value)
  );
}

/** Reads one `{ en, pt? }` text object. An edit that leaves it out keeps the
 *  stored text (undefined); a create reads a missing one as `{}`. */
function parseTextGroup(
  body: Record<string, unknown>,
  group: QuizBadgeTextGroup,
  isCreate: boolean,
): QuizBadgeText | undefined {
  const rule = TEXT_GROUP_RULES[group];
  const container = body[group];
  if (container === undefined && !isCreate) return undefined;
  const source: unknown = container === undefined ? {} : container;
  if (!isPlainObject(source))
    throw quizWinBadgeRefusal("quiz_badge_text_invalid", {
      field: `${group}.en`,
    });

  const english = source.en;
  if (english !== undefined && typeof english !== "string")
    throw quizWinBadgeRefusal("quiz_badge_text_invalid", {
      field: `${group}.en`,
    });
  const englishText = (english ?? "").trim();
  if (englishText === "")
    throw quizWinBadgeRefusal(rule.requiredCode, { language: "en" });
  if (quizBadgeCodePointLength(englishText) > rule.maxLength)
    throw quizWinBadgeRefusal(rule.tooLongCode, {
      language: "en",
      maxLength: rule.maxLength,
    });

  const portuguese = source.pt;
  if (
    portuguese !== undefined &&
    portuguese !== null &&
    typeof portuguese !== "string"
  )
    throw quizWinBadgeRefusal("quiz_badge_text_invalid", {
      field: `${group}.pt`,
    });
  const portugueseText =
    typeof portuguese === "string" ? portuguese.trim() : "";
  if (quizBadgeCodePointLength(portugueseText) > rule.maxLength)
    throw quizWinBadgeRefusal(rule.tooLongCode, {
      language: "pt",
      maxLength: rule.maxLength,
    });

  return { en: englishText, pt: portugueseText === "" ? null : portugueseText };
}

function parseIconKey(
  value: unknown,
  isCreate: boolean,
): CommunityBadgeIconKey | undefined {
  if (value === undefined && !isCreate) return undefined;
  if (typeof value !== "string" || !isCommunityBadgeIconKey(value))
    throw quizWinBadgeRefusal("quiz_badge_icon_unknown");
  return value;
}

function parseTint(
  value: unknown,
  isCreate: boolean,
): QuizBadgeTint | undefined {
  if (value === undefined && !isCreate) return undefined;
  if (!isQuizBadgeTint(value))
    throw quizWinBadgeRefusal("quiz_badge_tint_unknown");
  return value;
}

function parseRarity(
  value: unknown,
  isCreate: boolean,
): QuizBadgeRarity | undefined {
  if (value === undefined && !isCreate) return undefined;
  if (!isQuizBadgeRarity(value))
    throw quizWinBadgeRefusal("quiz_badge_rarity_unknown");
  return value;
}

/** The lower-cased names of every platform badge, seasonal ones included. */
function platformBadgeNames(): Set<string> {
  return new Set(
    [...earnedBadges, ...lockedBadges, ...seasonalBadges].map((badge) =>
      badge.name.toLowerCase(),
    ),
  );
}

/** English names are unique across every definition (archived included) and
 *  the platform badges; Portuguese names across definitions. Case ignored. */
function assertNamesFree(
  name: QuizBadgeText,
  options: QuizBadgeInputOptions,
): void {
  const others = options.definitions.filter(
    (definition) => definition.id !== options.editingId,
  );
  const english = name.en.toLowerCase();
  const isEnglishTaken =
    platformBadgeNames().has(english) ||
    others.some((definition) => definition.name.en.toLowerCase() === english);
  if (isEnglishTaken)
    throw quizWinBadgeRefusal("quiz_badge_name_taken", { language: "en" });
  if (name.pt === null) return;
  const portuguese = name.pt.toLowerCase();
  const isPortugueseTaken = others.some(
    (definition) => definition.name.pt?.toLowerCase() === portuguese,
  );
  if (isPortugueseTaken)
    throw quizWinBadgeRefusal("quiz_badge_name_taken", { language: "pt" });
}

/**
 * Routes 2 and 3: `name.en`, `name.pt`, `description.en`, `description.pt`,
 * `iconKey`, `tint`, `rarity`, then name uniqueness. A create needs every
 * field; an edit sets only the ones it carries, and an edit that carries
 * `name` or `description` replaces both languages.
 */
export function parseQuizBadgeInput(
  body: unknown,
  options: QuizBadgeInputOptions & { isCreate: true },
): CompleteQuizBadgeInput;
export function parseQuizBadgeInput(
  body: unknown,
  options: QuizBadgeInputOptions,
): QuizBadgeInputFields;
export function parseQuizBadgeInput(
  body: unknown,
  options: QuizBadgeInputOptions,
): QuizBadgeInputFields {
  const source = isPlainObject(body) ? body : {};
  const { isCreate } = options;
  const name = parseTextGroup(source, "name", isCreate);
  const description = parseTextGroup(source, "description", isCreate);
  const iconKey = parseIconKey(source.iconKey, isCreate);
  const tint = parseTint(source.tint, isCreate);
  const rarity = parseRarity(source.rarity, isCreate);
  if (name) assertNamesFree(name, options);
  const fields: QuizBadgeInputFields = {};
  if (name) fields.name = name;
  if (description) fields.description = description;
  if (iconKey) fields.iconKey = iconKey;
  if (tint) fields.tint = tint;
  if (rarity) fields.rarity = rarity;
  return fields;
}

export interface QuizEventSetupContext {
  definitions: readonly StoredQuizBadgeDefinition[];
  currentSlotsByGame: ReadonlyMap<number, readonly string[]>;
}

/** The game number as the refusal extras carry it. */
function gameNumberExtraOf(value: unknown): string | number {
  return typeof value === "number" ? value : String(value);
}

/**
 * Route 8: body shape, each game number (a whole number from 1, then at most
 * 5), repeated game numbers merged, each id list (strings, each id once, at
 * most 3), every id a known badge, and an archived badge only on a game that
 * already gives it. Answers the whole setup by game number.
 */
export function parseQuizEventSetupBody(
  body: unknown,
  context: QuizEventSetupContext,
): Map<number, string[]> {
  if (!isPlainObject(body) || !Array.isArray(body.games))
    throw quizWinBadgeRefusal("quiz_badge_setup_invalid");
  const entries: unknown[] = body.games;
  if (!entries.every(isPlainObject))
    throw quizWinBadgeRefusal("quiz_badge_setup_invalid");
  const gameEntries = entries.filter(isPlainObject);

  for (const entry of gameEntries) {
    const gameNumber = entry.gameNumber;
    if (
      typeof gameNumber !== "number" ||
      !Number.isInteger(gameNumber) ||
      gameNumber < 1
    )
      throw quizWinBadgeRefusal("quiz_badge_game_number_invalid", {
        gameNumber: gameNumberExtraOf(gameNumber),
      });
    if (gameNumber > QUIZ_EVENT_GAME_SLOTS_MAX)
      throw quizWinBadgeRefusal("quiz_badge_game_limit_reached", {
        limit: QUIZ_EVENT_GAME_SLOTS_MAX,
      });
  }

  const listsByGame = new Map<number, unknown[]>();
  let hasUnreadableList = false;
  for (const entry of gameEntries) {
    const gameNumber = entry.gameNumber as number;
    const ids: unknown = entry.badgeDefinitionIds;
    const idList: unknown[] = Array.isArray(ids) ? ids : [];
    if (!Array.isArray(ids)) hasUnreadableList = true;
    const merged = listsByGame.get(gameNumber) ?? [];
    listsByGame.set(gameNumber, [...merged, ...idList]);
  }
  if (hasUnreadableList) throw quizWinBadgeRefusal("quiz_badge_setup_invalid");

  const setup = new Map<number, string[]>();
  for (const [gameNumber, ids] of listsByGame) {
    if (!ids.every((id): id is string => typeof id === "string"))
      throw quizWinBadgeRefusal("quiz_badge_setup_invalid");
    const textIds = ids.filter((id): id is string => typeof id === "string");
    const repeatedId = textIds.find(
      (id, index) => textIds.indexOf(id) !== index,
    );
    if (repeatedId !== undefined)
      throw quizWinBadgeRefusal("quiz_badge_slot_duplicate", {
        gameNumber,
        definitionId: repeatedId,
      });
    if (textIds.length > QUIZ_BADGES_PER_GAME_MAX)
      throw quizWinBadgeRefusal("quiz_badge_slot_limit_reached", {
        limit: QUIZ_BADGES_PER_GAME_MAX,
        gameNumber,
      });
    setup.set(gameNumber, textIds);
  }

  const allIds = [...setup.values()].flat();
  const unknownId = allIds.find(
    (id) => !context.definitions.some((definition) => definition.id === id),
  );
  if (unknownId !== undefined)
    throw quizWinBadgeRefusal("quiz_badge_not_found", {
      definitionId: unknownId,
    });
  for (const [gameNumber, ids] of setup) {
    const archivedNewId = ids.find((id) => {
      const isArchived = context.definitions.some(
        (definition) => definition.id === id && definition.archivedAt !== null,
      );
      const isAlreadyOnGame =
        context.currentSlotsByGame.get(gameNumber)?.includes(id) === true;
      return isArchived && !isAlreadyOnGame;
    });
    if (archivedNewId !== undefined)
      throw quizWinBadgeRefusal("quiz_badge_archived", {
        definitionId: archivedNewId,
      });
  }
  return setup;
}

/** Route 10's reason: trimmed text of 1 to 300 code points. */
export function parseRevokeReason(body: unknown): string {
  const reason = isPlainObject(body) ? body.reason : undefined;
  const reasonText = typeof reason === "string" ? reason.trim() : "";
  if (reasonText === "")
    throw quizWinBadgeRefusal("quiz_badge_revoke_reason_required");
  if (quizBadgeCodePointLength(reasonText) > QUIZ_REVOKE_REASON_MAX_LENGTH)
    throw quizWinBadgeRefusal("quiz_badge_revoke_reason_too_long", {
      maxLength: QUIZ_REVOKE_REASON_MAX_LENGTH,
    });
  return reasonText;
}
