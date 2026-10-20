import type {
  QuizshowJoinHost,
  QuizshowStarterPackKey,
} from "../../../shared/contracts/quizshow";

export const QUIZSHOW_DEMO_GAME_IDS = {
  flatQuiz: "demo-game-flat-quiz",
  afterDark: "demo-game-after-dark",
} as const;

/** The demo member who owns every demo game, shown to players on a game join.
 *  Name and photo match the demo profile `rui` in features/members/data/members.ts. */
export const QUIZSHOW_DEMO_GAME_HOST: QuizshowJoinHost = {
  name: "Rui Marçal",
  avatarUrl:
    "https://plus.unsplash.com/premium_photo-1682144187125-b55e638cf286?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  memberSlug: "rui",
};

export interface QuizshowDemoGameSeed {
  gameId: string;
  title: string;
  packKey: QuizshowStarterPackKey;
  /** The round that carries the `adults` label, or null for none. */
  adultsRoundIndex: number | null;
  isAdultsOnly: boolean;
  hasResults: boolean;
  isLobbyOpen: boolean;
  updatedAt: string;
}

export const QUIZSHOW_DEMO_GAME_SEEDS: readonly QuizshowDemoGameSeed[] = [
  {
    gameId: QUIZSHOW_DEMO_GAME_IDS.flatQuiz,
    title: "Friday flat quiz",
    packKey: "eurovision",
    adultsRoundIndex: null,
    isAdultsOnly: false,
    hasResults: true,
    isLobbyOpen: false,
    updatedAt: "2026-10-17T21:30:00.000Z",
  },
  {
    gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
    title: "After dark trivia",
    packKey: "drag_herstory",
    adultsRoundIndex: 1,
    isAdultsOnly: true,
    hasResults: false,
    isLobbyOpen: true,
    updatedAt: "2026-10-19T20:00:00.000Z",
  },
];
