/**
 * Quiz win badges wire contract, frontend mirror. Source of truth:
 * QUEERPULSE-QUIZ-WIN-BADGES-CONTRACT-2026-11-24.md (sections 2 and 3) and its backend twin
 * `queerpulse-backend/src/quiz-win-badges/quiz-win-badges.contract.ts`. Names, members and
 * string values match it; edit both together. Dates are ISO strings.
 */
import type { MemberRefDTO } from "../api/refs";

export const QUIZ_BADGE_KEY_PREFIX = "quiz:";
/** `BadgeDTO.cat` for every admin quiz badge. */
export const QUIZ_BADGE_CATEGORY = "Quiz nights";
export const QUIZ_BADGE_NAME_MAX_LENGTH = 40; // code points
export const QUIZ_BADGE_DESCRIPTION_MAX_LENGTH = 140; // code points
export const QUIZ_EVENT_GAME_SLOTS_MAX = 5;
export const QUIZ_BADGES_PER_GAME_MAX = 3;
export const QUIZ_REVOKE_REASON_MAX_LENGTH = 300; // code points
/** A longer `q` is cut to this length and served. */
export const QUIZ_EVENT_SEARCH_MAX_LENGTH = 100;
/** Wins listed per badge in a recognition read. */
export const QUIZ_BADGE_WINS_PER_BADGE_MAX = 100;
/** Equals `BadgeTint`. */
export const QUIZ_BADGE_TINTS = ["jade", "accent", "plum"] as const;
export type QuizBadgeTint = (typeof QUIZ_BADGE_TINTS)[number];
/** Equals `BadgeRarity`. */
export const QUIZ_BADGE_RARITIES = ["common", "rare", "legendary"] as const;
export type QuizBadgeRarity = (typeof QUIZ_BADGE_RARITIES)[number];

export function isQuizBadgeKey(key: string): boolean {
  return key.startsWith(QUIZ_BADGE_KEY_PREFIX);
}

/** `pt` null reads as `en`. */
export interface QuizBadgeText {
  en: string;
  pt: string | null;
}

/** The compact badge every member-facing and admin surface draws. */
export interface QuizWinBadgeChip {
  definitionId: string;
  badgeKey: string; // "quiz:<definitionId>"
  name: QuizBadgeText;
  iconKey: string;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
  isArchived: boolean;
}

/** Admin library row and create/edit echo. */
export interface QuizBadgeDefinitionDTO {
  id: string;
  badgeKey: string;
  name: QuizBadgeText;
  description: QuizBadgeText;
  iconKey: string;
  tint: QuizBadgeTint;
  rarity: QuizBadgeRarity;
  isArchived: boolean;
  archivedAt: string | null;
  holderCount: number; // distinct members with at least one live win
  winCount: number; // live win rows
  eventCount: number; // distinct events whose slots use it
  canDelete: boolean; // winCount === 0
  createdAt: string;
  updatedAt: string;
}
/** Live first by name_en ASC, then archived by name_en ASC. */
export interface QuizBadgeLibraryResponse {
  items: QuizBadgeDefinitionDTO[];
}

export interface QuizEventSearchRowDTO {
  eventId: string;
  slug: string;
  title: string;
  startAt: string;
  status: "draft" | "published" | "cancelled";
  isAdultsOnly: boolean; // formatDetails.isAdultsOnly
  configuredGameCount: number; // distinct game numbers with at least one slot
  finishedGameCount: number; // sessions with event_game_number set
}

export interface QuizEventGameSlotDTO {
  gameNumber: number; // 1..5, all five always present
  badges: QuizWinBadgeChip[]; // slot order: created_at ASC
  isFinished: boolean; // a session of this event carries this number
}
export interface QuizBadgeWinRefDTO {
  winId: string;
  badge: QuizWinBadgeChip;
  wonAt: string;
}
export interface QuizGameWinnerDTO {
  winnerId: string; // quiz_game_winners.id
  screenName: string;
  teamName: string | null;
  /** Staff view; null when the account is gone. */
  member: MemberRefDTO | null;
  /** Live wins of this member in this game; [] once revoked. */
  wins: QuizBadgeWinRefDTO[];
  isRevoked: boolean;
  revokedAt: string | null;
  revokeReason: string | null;
  /** Null when unrevoked or the account is gone. */
  revokedBy: MemberRefDTO | null;
}
export interface QuizFinishedGameDTO {
  gameNumber: number;
  sessionId: string;
  finishedAt: string;
  playMode: "solo" | "teams";
  /** Live and revoked; [] means "No winner recorded"; team ASC then screen name ASC. */
  winners: QuizGameWinnerDTO[];
}
export interface QuizEventBadgeSetupDTO {
  event: {
    id: string;
    slug: string;
    title: string;
    startAt: string;
    status: "draft" | "published" | "cancelled";
    isAdultsOnly: boolean;
    isPublic: boolean;
  };
  nextGameNumber: number; // max(event_game_number) + 1, 1 when none
  limits: { gameSlotsMax: number; badgesPerGameMax: number };
  games: QuizEventGameSlotDTO[];
  /** gameNumber ASC, every numbered game, also beyond 5. */
  finishedGames: QuizFinishedGameDTO[];
}
export interface QuizEventBadgeSetupSaveResponse {
  setup: QuizEventBadgeSetupDTO;
  awardedWinCount: number; // win rows written after the fact by this save
}
export interface QuizGameWinRevokeResponse {
  winnerId: string;
  revokedBadgeKeys: string[]; // every badge key whose win row this revoke deleted
  removedAwardKeys: string[]; // the subset whose recognition_awards row went too
}

/** "Win to earn": the next game's badges. */
export interface QuizshowWinBadgesPreview {
  gameNumber: number;
  badges: QuizWinBadgeChip[];
}
/** Route 11 response (note 16 of the frontend plan). */
export interface QuizshowWinBadgesPreviewResponse {
  preview: QuizshowWinBadgesPreview | null;
}

/** Results card addition. */
export interface QuizshowResultsWinnerBadges {
  kind: "player" | "team";
  name: string; // screen name or team name
  badges: QuizWinBadgeChip[];
}
export interface QuizshowResultsWinBadges {
  gameNumber: number;
  /** Entries with at least one live badge, name ASC. */
  winners: QuizshowResultsWinnerBadges[];
  /** The viewer's own live wins in this session. */
  myBadges: QuizWinBadgeChip[];
}

/** Recognition read addition. */
export interface QuizBadgeWinDTO {
  wonAt: string;
  gameNumber: number;
  /** Null = masked, the client shows "QueerPulse quiz night". */
  eventName: string | null;
  /** Null when masked or the event is gone. */
  eventSlug: string | null;
  /** Owner read: event_was_adults_only; other viewers: always false. */
  isAdultsOnlyEvent: boolean;
}
export interface QuizBadgeDetailsDTO {
  definitionId: string;
  name: QuizBadgeText;
  description: QuizBadgeText;
  iconKey: string;
  winCount: number; // every live win, masked ones included
  /** won_at DESC, at most QUIZ_BADGE_WINS_PER_BADGE_MAX. */
  wins: QuizBadgeWinDTO[];
}
