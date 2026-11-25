import type { QuizEventSearchRowDTO } from "../../../shared/contracts/quizWinBadges";
import { gatheringDetails } from "../../gatherings/data";
import { currentUserSlug } from "../../members/data/members";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "../api/quizshowDemoStore.data";
import type { StoredQuizBadgeDefinition } from "./quizWinBadgesDemoRules";

// The seed of the quiz win badges demo store (contract section 14). Times
// that read "before seed time" count back from the moment the store seeds,
// so a demo game always reads as played a few minutes ago.

/** An instant in the seed: an ISO string, or minutes before seed time. */
export type QuizWinBadgesDemoInstant = string | { minutesBeforeSeed: number };

/** Turns a seed instant into an ISO string against the seed time. */
export function resolveQuizWinBadgesDemoInstant(
  instant: QuizWinBadgesDemoInstant,
  seedTime: number,
): string {
  if (typeof instant === "string") return instant;
  return new Date(seedTime - instant.minutesBeforeSeed * 60_000).toISOString();
}

/** Demo events carry no ids, so a demo event id is built from its slug. */
export function demoQuizEventIdOf(slug: string): string {
  return `demo-event-${slug}`;
}

export const QUIZ_WIN_BADGES_DEMO_CHAMPION_ID = "demo-quiz-badge-champion";
export const QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID =
  "demo-quiz-badge-sharpshooter";
export const QUIZ_WIN_BADGES_DEMO_PRIDE_ID = "demo-quiz-badge-pride-2026";

export const QUIZ_WIN_BADGES_DEMO_DEFINITIONS: readonly StoredQuizBadgeDefinition[] =
  [
    {
      id: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      badgeKey: `quiz:${QUIZ_WIN_BADGES_DEMO_CHAMPION_ID}`,
      name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
      description: {
        en: "Won a game at an official QueerPulse quiz night",
        pt: "Venceu um jogo numa noite de quiz oficial da QueerPulse",
      },
      iconKey: "star",
      tint: "plum",
      rarity: "legendary",
      archivedAt: null,
      createdAt: "2026-05-04T10:00:00.000Z",
      updatedAt: "2026-05-04T10:00:00.000Z",
    },
    {
      id: QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
      badgeKey: `quiz:${QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID}`,
      name: { en: "Trivia Sharpshooter", pt: null },
      description: {
        en: "Topped a game where every second counted",
        pt: null,
      },
      iconKey: "zap",
      tint: "accent",
      rarity: "rare",
      archivedAt: null,
      createdAt: "2026-05-04T10:05:00.000Z",
      updatedAt: "2026-05-04T10:05:00.000Z",
    },
    {
      id: QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
      badgeKey: `quiz:${QUIZ_WIN_BADGES_DEMO_PRIDE_ID}`,
      name: { en: "Pride Quiz 2026", pt: "Quiz do Orgulho 2026" },
      description: {
        en: "Won a game at the 2026 Pride quiz",
        pt: "Venceu um jogo no quiz do Orgulho de 2026",
      },
      iconKey: "flag",
      tint: "jade",
      rarity: "common",
      archivedAt: "2026-10-01T10:00:00.000Z",
      createdAt: "2026-05-04T10:10:00.000Z",
      updatedAt: "2026-10-01T10:00:00.000Z",
    },
  ];

/** A demo event that holds a demo quiz, as the setup page reads it. */
export interface QuizWinBadgesDemoEvent {
  eventId: string;
  slug: string;
  title: string;
  startAt: string;
  status: QuizEventSearchRowDTO["status"];
  isAdultsOnly: boolean;
  isPublic: boolean;
}

function demoQuizEventOf(slug: string): QuizWinBadgesDemoEvent {
  const detail = gatheringDetails[slug];
  return {
    eventId: demoQuizEventIdOf(slug),
    slug,
    title: detail?.title ?? slug,
    startAt: (detail?.date ?? new Date(0)).toISOString(),
    status: "published",
    isAdultsOnly: detail?.formatDetails?.isAdultsOnly === true,
    isPublic: true,
  };
}

export const QUIZ_WIN_BADGES_DEMO_EVENTS: readonly QuizWinBadgesDemoEvent[] = [
  demoQuizEventOf(QUIZSHOW_DEMO_LIVE_SLUG),
  demoQuizEventOf(QUIZSHOW_DEMO_RESULTS_SLUG),
  demoQuizEventOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
];

/** The badges one game of a demo event gives, in slot order. */
export interface QuizWinBadgesDemoSlot {
  eventSlug: string;
  gameNumber: number;
  definitionIds: readonly string[];
}

export const QUIZ_WIN_BADGES_DEMO_SLOTS: readonly QuizWinBadgesDemoSlot[] = [
  {
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    gameNumber: 1,
    definitionIds: [
      QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
    ],
  },
  {
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    gameNumber: 2,
    definitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
  },
  {
    eventSlug: QUIZSHOW_DEMO_RESULTS_SLUG,
    gameNumber: 1,
    definitionIds: [QUIZ_WIN_BADGES_DEMO_PRIDE_ID],
  },
];

/** A recorded winner of a finished demo game. */
export interface QuizWinBadgesDemoWinner {
  winnerId: string;
  userSlug: string;
  screenName: string;
  teamName: string | null;
  revoked: {
    at: QuizWinBadgesDemoInstant;
    bySlug: string;
    reason: string;
  } | null;
}

/** A finished demo game with a numbered slot and its winners. */
export interface QuizWinBadgesDemoGame {
  eventSlug: string;
  gameNumber: number;
  sessionId: string;
  finishedAt: QuizWinBadgesDemoInstant;
  playMode: "solo" | "teams";
  winners: readonly QuizWinBadgesDemoWinner[];
}

export const QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID = `demo-quiz-winner-${QUIZSHOW_DEMO_LIVE_SLUG}-1-viewer`;
export const QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID = `demo-quiz-winner-${QUIZSHOW_DEMO_LIVE_SLUG}-1-kai`;
export const QUIZ_WIN_BADGES_DEMO_RESULTS_RITA_WINNER_ID = `demo-quiz-winner-${QUIZSHOW_DEMO_RESULTS_SLUG}-1-rita`;

const LIVE_GAME_SESSION_ID = `demo-quiz-session-${QUIZSHOW_DEMO_LIVE_SLUG}-1`;
const LIVE_GAME_FINISHED_AT: QuizWinBadgesDemoInstant = {
  minutesBeforeSeed: 50,
};

function teamWinnerOf(
  userSlug: string,
  screenName: string,
): QuizWinBadgesDemoWinner {
  return {
    winnerId: `demo-quiz-winner-${QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG}-1-${userSlug}`,
    userSlug,
    screenName,
    teamName: "Glitter Owls",
    revoked: null,
  };
}

export const QUIZ_WIN_BADGES_DEMO_GAMES: readonly QuizWinBadgesDemoGame[] = [
  {
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    gameNumber: 1,
    sessionId: LIVE_GAME_SESSION_ID,
    finishedAt: LIVE_GAME_FINISHED_AT,
    playMode: "solo",
    winners: [
      {
        winnerId: QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
        userSlug: currentUserSlug,
        screenName: "Quiz Whiz",
        teamName: null,
        revoked: null,
      },
      {
        winnerId: QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
        userSlug: "kai",
        screenName: "Kai",
        teamName: null,
        revoked: {
          at: { minutesBeforeSeed: 30 },
          bySlug: "monica",
          reason: "Played from the host's laptop with the answers on screen",
        },
      },
    ],
  },
  {
    eventSlug: QUIZSHOW_DEMO_RESULTS_SLUG,
    gameNumber: 1,
    sessionId: QUIZSHOW_DEMO_RESULTS.sessionId,
    finishedAt: QUIZSHOW_DEMO_RESULTS.endedAt,
    playMode: "solo",
    winners: [
      {
        winnerId: QUIZ_WIN_BADGES_DEMO_RESULTS_RITA_WINNER_ID,
        userSlug: "rita",
        screenName: "Rita",
        teamName: null,
        revoked: null,
      },
    ],
  },
  {
    eventSlug: QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
    gameNumber: 1,
    sessionId: `demo-quiz-session-${QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG}-1`,
    finishedAt: "2026-06-12T21:10:00.000Z",
    playMode: "teams",
    winners: [
      teamWinnerOf("sofia", "Sofia"),
      teamWinnerOf("carla", "Carla"),
      teamWinnerOf("nuno", "Nuno"),
    ],
  },
];

/**
 * A seeded badge win. A game win reads its session, game number, finish time
 * and event from the finished game it names; a snapshot win carries every
 * value itself, as a win whose event is gone does.
 */
export type QuizWinBadgesDemoSeedWin =
  | {
      source: "game";
      definitionId: string;
      userSlug: string;
      eventSlug: string;
      gameNumber: number;
    }
  | {
      source: "snapshot";
      definitionId: string;
      userSlug: string;
      eventId: null;
      sessionId: null;
      gameNumber: number;
      eventName: string;
      eventWasPublic: boolean;
      eventWasAdultsOnly: boolean;
      wonAt: string;
    };

export const QUIZ_WIN_BADGES_DEMO_SEED_WINS: readonly QuizWinBadgesDemoSeedWin[] =
  [
    {
      source: "game",
      definitionId: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      userSlug: currentUserSlug,
      eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
      gameNumber: 1,
    },
    {
      source: "game",
      definitionId: QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
      userSlug: currentUserSlug,
      eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
      gameNumber: 1,
    },
    {
      source: "game",
      definitionId: QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
      userSlug: "rita",
      eventSlug: QUIZSHOW_DEMO_RESULTS_SLUG,
      gameNumber: 1,
    },
    // A members-only night whose event is gone: the owner sees its name,
    // another viewer sees the masked line (note 20).
    {
      source: "snapshot",
      definitionId: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      userSlug: currentUserSlug,
      eventId: null,
      sessionId: null,
      gameNumber: 1,
      eventName: "Members' Quiz Social",
      eventWasPublic: false,
      eventWasAdultsOnly: false,
      wonAt: "2026-08-29T21:30:00.000Z",
    },
  ];

/**
 * Whether the demo member counts among the results slug's winners (note 7).
 * The v2 results seed places the demo member 5th, so this stays false and the
 * results list Rita's win only. The design review flips it to true through a
 * Playwright module intercept (memory:
 * design-review-live-only-pages-via-module-intercept) to see "You earned".
 */
export const IS_QUIZ_WIN_BADGES_DEMO_VIEWER_IN_RESULTS = false;
