import { act, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowCursor,
  QuizshowPhase,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { createQuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowReactionBar } from "./QuizshowReactionBar";

function cursorIn(phase: QuizshowPhase): QuizshowCursor {
  return {
    phaseId: `phase-${phase}`,
    status: "running",
    phase,
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 1,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
  };
}

/** The bar keeps its bucket per session and player for the page's life, so
 *  each test takes a session of its own unless it shares one on purpose. */
let sessionCount = 0;

function nextSessionId(): string {
  sessionCount += 1;
  return `session-${sessionCount}`;
}

function playerIn(
  phase: QuizshowPhase,
  sessionId = nextSessionId(),
): QuizshowPlayerState {
  return {
    sessionId,
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
    cursor: cursorIn(phase),
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    wheel: null,
    wheelBonus: null,
    role: "player",
    lobby: { teams: [], playerCount: 5 },
    answerCount: null,
    question: null,
    voteOptions: null,
    me: {
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
    },
    suggestedScreenName: "Sam",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
  };
}

function controllerOf(
  session: QuizshowPlayerState,
  send: QuizshowSessionController["send"],
): QuizshowSessionController {
  return {
    state: {
      ...createQuizshowClientState("player"),
      status: "attached",
      hasAttached: true,
      session,
    },
    clockOffsetMs: 0,
    isDemo: true,
    send,
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function barOf(controller: QuizshowSessionController) {
  return (
    <TestProviders>
      <QuizshowReactionBar controller={controller} />
    </TestProviders>
  );
}

function okSend(): QuizshowSessionController["send"] {
  return vi.fn().mockResolvedValue({ ok: true });
}

const SHOWN_PHASES: readonly QuizshowPhase[] = [
  "lobby",
  "round_intro",
  "reveal",
  "scores",
  "leaderboard",
  "wheel",
  "podium",
];

const HIDDEN_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
];

describe("QuizshowReactionBar", () => {
  it.each(SHOWN_PHASES)("shows six named reactions in %s", async (phase) => {
    render(barOf(controllerOf(playerIn(phase), okSend())));
    await awaitCatalog("quizshow");
    const bar = screen.getByRole("group", { name: "Send a reaction" });
    const buttons = within(bar).getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Heart",
      "Fire",
      "Applause",
      "Laughing",
      "Wow",
      "Party",
    ]);
  });

  it.each(HIDDEN_PHASES)("never renders in %s", async (phase) => {
    render(barOf(controllerOf(playerIn(phase), okSend())));
    await awaitCatalog("quizshow");
    expect(screen.queryByRole("button", { name: "Heart" })).toBeNull();
  });

  it("sends the tapped reaction", async () => {
    const send = okSend();
    render(barOf(controllerOf(playerIn("reveal"), send)));
    await awaitCatalog("quizshow");
    act(() => {
      screen.getByRole("button", { name: "Fire" }).click();
    });
    expect(send).toHaveBeenCalledWith("reaction:send", { reactionId: "fire" });
  });

  it("takes three quick taps, then rests the bar and sends no more", async () => {
    const send = okSend();
    render(barOf(controllerOf(playerIn("scores"), send)));
    await awaitCatalog("quizshow");
    const heart = screen.getByRole("button", { name: "Heart" });
    act(() => {
      heart.click();
      heart.click();
      heart.click();
    });
    await waitFor(() => expect(heart).toHaveAttribute("aria-disabled", "true"));
    act(() => {
      heart.click();
    });
    expect(send).toHaveBeenCalledTimes(3);
  });

  it("says Sent after the server accepts a tap and stays silent after a refusal", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, code: "quizshow_rate_limited" });
    render(barOf(controllerOf(playerIn("reveal"), send)));
    await awaitCatalog("quizshow");
    await act(async () => {
      screen.getByRole("button", { name: "Heart" }).click();
      await Promise.resolve();
    });
    const sentStatus = within(
      screen.getByRole("group", { name: "Send a reaction" }),
    ).getByRole("status");
    expect(sentStatus).toHaveTextContent("Sent");
    await act(async () => {
      screen.getByRole("button", { name: "Fire" }).click();
      await Promise.resolve();
    });
    expect(sentStatus.textContent).toBe("");
  });

  it("says nothing when the server refuses a reaction", async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ ok: false, code: "quizshow_rate_limited" });
    render(barOf(controllerOf(playerIn("leaderboard"), send)));
    await awaitCatalog("quizshow");
    await act(async () => {
      screen.getByRole("button", { name: "Party" }).click();
      await Promise.resolve();
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/too many|between questions/i)).toBeNull();
  });

  it("leaves the bar awake after a refusal", async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ ok: false, code: "quizshow_reaction_not_now" });
    render(barOf(controllerOf(playerIn("reveal"), send)));
    await awaitCatalog("quizshow");
    const wow = screen.getByRole("button", { name: "Wow" });
    await act(async () => {
      wow.click();
      await Promise.resolve();
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(wow).not.toHaveAttribute("aria-disabled");
  });

  it("keeps a spent burst from the lobby's bar on the stage's bar", async () => {
    const sessionId = nextSessionId();
    const send = okSend();
    const { unmount } = render(
      barOf(controllerOf(playerIn("lobby", sessionId), send)),
    );
    await awaitCatalog("quizshow");
    const lobbyHeart = screen.getByRole("button", { name: "Heart" });
    act(() => {
      lobbyHeart.click();
      lobbyHeart.click();
      lobbyHeart.click();
    });
    unmount();

    render(barOf(controllerOf(playerIn("round_intro", sessionId), send)));
    await awaitCatalog("quizshow");
    const stageHeart = screen.getByRole("button", { name: "Heart" });
    expect(stageHeart).toHaveAttribute("aria-disabled", "true");
    act(() => {
      stageHeart.click();
    });
    expect(send).toHaveBeenCalledTimes(3);
  });
});
