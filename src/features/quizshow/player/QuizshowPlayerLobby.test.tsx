import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
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

function soloLobbySession(): QuizshowPlayerState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
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
    isPractice: false,
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

function renderLobby(send: QuizshowSessionController["send"]) {
  const state: QuizshowClientState = {
    ...createQuizshowClientState("player"),
    status: "attached",
    session: soloLobbySession(),
    hasAttached: true,
  };
  const controller: QuizshowSessionController = {
    state,
    clockOffsetMs: 0,
    isDemo: true,
    send,
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

async function renameTo(
  user: ReturnType<typeof userEvent.setup>,
  screenName: string,
) {
  await user.click(screen.getByRole("button", { name: "Change name" }));
  const nameField = screen.getByLabelText("Screen name");
  await user.clear(nameField);
  await user.type(nameField, screenName);
  await user.click(screen.getByRole("button", { name: "Save name" }));
}

describe("QuizshowPlayerLobby rename", () => {
  it("names the free suggestion in the taken-name error and fills it on tap", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_screen_name_taken",
      message: "taken",
      suggestedScreenName: "Alex 2",
    });
    renderLobby(send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    await renameTo(user, "Alex");

    const nameForm = screen.getByLabelText("Screen name").closest("form");
    if (nameForm === null) throw new Error("The name field has no form");
    expect(
      await within(nameForm).findByText(
        "Someone here already uses that name. Try Alex 2",
      ),
    ).toBeInTheDocument();
    expect(within(nameForm).queryByText(/\{suggestion\}/)).toBeNull();

    await user.click(within(nameForm).getByRole("button", { name: /Alex 2/ }));
    expect(screen.getByLabelText("Screen name")).toHaveValue("Alex 2");
    expect(screen.getByRole("button", { name: "Save name" })).toHaveFocus();
  });

  it("says to pick another name when no suggestion is free", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_screen_name_taken",
      message: "taken",
    });
    renderLobby(send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    await renameTo(user, "Alex");

    expect(
      await screen.findByText(
        "Someone here already uses that name. Pick another one",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Try/)).toBeNull();
  });
});

describe("QuizshowPlayerLobby focus", () => {
  it("moves focus to the lobby heading when the phone arrives from the join form", async () => {
    renderLobby(vi.fn() as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "You're in",
    });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute("tabindex", "-1");
  });
});
