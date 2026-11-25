import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import type {
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { resetQuizWinBadgesDemoStore } from "../winBadges/quizWinBadgesDemoStore";
import { QuizshowPlayerLobby } from "./QuizshowPlayerLobby";

const ME: QuizshowMe = {
  playerId: "player-1",
  screenName: "Sam",
  isAvatarShown: false,
  hasExtraTime: false,
  teamId: null,
  isCohostPlayer: false,
  score: 0,
  streak: 0,
  hasUsedJoker: false,
  jokerRoundIndex: null,
};

function demoEventLobbySession(isPractice: boolean): QuizshowPlayerState {
  return {
    sessionId: "session-1",
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    eventTitle: "Quiz night",
    kind: "event",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Quiz",
    languages: "en",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isPractice,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: {
      phaseId: "1",
      status: "lobby",
      phase: "lobby",
      roundIndex: null,
      questionIndex: null,
      roundCount: 1,
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      roundNumber: 0,
      upNext: null,
      canSpinForNextRound: false,
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
    },
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    wheel: null,
    wheelBonus: null,
    role: "player",
    lobby: { teams: [], playerCount: 2 },
    answerCount: null,
    question: null,
    voteOptions: null,
    me: ME,
    suggestedScreenName: "Sam",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
  };
}

function renderLobby(isPractice: boolean) {
  resetQuizWinBadgesDemoStore();
  const state: QuizshowClientState = {
    ...createQuizshowClientState("player"),
    status: "attached",
    session: demoEventLobbySession(isPractice),
    hasAttached: true,
  };
  const controller: QuizshowSessionController = {
    state,
    clockOffsetMs: 0,
    isDemo: true,
    send: vi.fn(),
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
  render(
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowPlayerLobby controller={controller} />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

describe("QuizshowPlayerLobby win badges", () => {
  it("shows Win to earn in the demo event lobby", async () => {
    renderLobby(false);
    await awaitCatalog("quizshow");

    expect(await screen.findByText("Win to earn")).toBeInTheDocument();
    expect(screen.getByText("Game 2")).toBeInTheDocument();
  });

  it("shows nothing in a practice lobby", async () => {
    renderLobby(true);
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("heading", { level: 1, name: "You're in" }),
    ).toBeInTheDocument();
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.queryByText("Win to earn")).not.toBeInTheDocument();
    expect(screen.queryByText("Game 2")).not.toBeInTheDocument();
  });
});
