import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowLeaderboardEntry,
  QuizshowMyReveal,
  QuizshowPhase,
  QuizshowPlayerState,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPlayerStage } from "./QuizshowPlayerStage";

vi.mock("./QuizshowJokerButton", () => ({
  QuizshowJokerButton: () => <button type="button">Joker</button>,
}));

const QUESTION: QuizshowQuestionView = {
  questionId: "question-1",
  roundIndex: 0,
  questionIndex: 0,
  roundKind: "quiz",
  type: "multiple_choice",
  prompt: { en: "Which flag?", pt: "Que bandeira?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 20,
  options: [
    { id: "a", text: { en: "Rainbow", pt: "Arco-iris" } },
    { id: "b", text: { en: "Trans", pt: "Trans" } },
  ],
};

function cursorIn(phase: QuizshowPhase, phaseId: string): QuizshowCursor {
  return {
    phaseId,
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
  };
}

const MY_REVEAL: QuizshowMyReveal = {
  phaseId: "20",
  questionId: "question-1",
  hasAnswered: true,
  isCorrect: true,
  correctPositions: null,
  pointsAwarded: 1200,
  streakBonus: 200,
  isJokerActive: false,
  streak: 3,
  score: 3400,
  teamScore: null,
  rank: 2,
  ownAnswerId: "answer-1",
};

function stateIn(
  phase: QuizshowPhase,
  phaseId: string,
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
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
    isScreenMuted: false,
    cursor: cursorIn(phase, phaseId),
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "player",
    lobby: { players: [], teams: [], playerCount: 5 },
    question: QUESTION,
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
    ...overrides,
  };
}

function controllerOf(session: QuizshowPlayerState): QuizshowSessionController {
  const state: QuizshowClientState = {
    role: "player",
    status: "attached",
    refusalCode: null,
    session,
    sessionEnd: null,
    isRemoved: false,
    pendingAnswer: null,
  };
  return {
    state,
    clockOffsetMs: 0,
    isDemo: true,
    send: vi.fn(),
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function stageOf(session: QuizshowPlayerState, isReducedMotion = false) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <QuizshowPlayerStage controller={controllerOf(session)} />
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

const REVEAL_STATE = stateIn("reveal", "20", {
  myReveal: MY_REVEAL,
  reveal: {
    phaseId: "20",
    questionId: "question-1",
    correct: { type: "multiple_choice", correctIndex: 0 },
    answeredCount: 4,
    eligibleCount: 5,
    distribution: { kind: "options", counts: [3, 1] },
  },
});

describe("QuizshowPlayerStage", () => {
  const vibrate = vi.fn();

  beforeEach(() => {
    vibrate.mockClear();
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrate,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "vibrate");
  });

  it("announces each new phase in a live region", async () => {
    const { rerender } = render(stageOf(stateIn("read", "18")));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent?.includes("New question")),
      ).toBe(true),
    );
    rerender(stageOf(stateIn("open", "19")));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent?.includes("Answer now")),
      ).toBe(true),
    );
  });

  it("shows right, points, streak and place at the reveal", async () => {
    render(stageOf(REVEAL_STATE));
    expect(await screen.findByText("Right")).toBeInTheDocument();
    expect(screen.getByText("+1,200 points")).toBeInTheDocument();
    expect(screen.getByText("Streak of 3")).toBeInTheDocument();
    expect(screen.getByText("You're 2 of 5")).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Correct answer, Answer A, Triangle: Rainbow",
      }),
    ).toBeInTheDocument();
  });

  it("vibrates once on a reveal where vibration exists", async () => {
    const { rerender } = render(stageOf(REVEAL_STATE));
    await screen.findByText("Right");
    act(() => {
      rerender(stageOf(REVEAL_STATE));
    });
    expect(vibrate).toHaveBeenCalledTimes(1);
    rerender(
      stageOf(
        stateIn("reveal", "30", {
          myReveal: { ...MY_REVEAL, phaseId: "30", isCorrect: false },
        }),
      ),
    );
    await waitFor(() => expect(vibrate).toHaveBeenCalledTimes(2));
  });

  it("stays still under reduced motion", async () => {
    render(stageOf(REVEAL_STATE, true));
    await screen.findByText("Right");
    expect(vibrate).not.toHaveBeenCalled();
  });
});

const ORDER_QUESTION: QuizshowQuestionView = {
  ...QUESTION,
  questionId: "question-order",
  type: "order",
  prompt: { en: "Put these in order", pt: "Põe por ordem" },
  options: [
    { id: "first", text: { en: "Stonewall", pt: "Stonewall" } },
    { id: "second", text: { en: "First march", pt: "Primeira marcha" } },
    { id: "third", text: { en: "EuroPride", pt: "EuroPride" } },
    { id: "fourth", text: { en: "WorldPride", pt: "WorldPride" } },
  ],
};

const TOP_TEN_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function itemAt<Item>(items: readonly Item[], itemIndex: number): Item {
  const item = items[itemIndex];
  if (item === undefined) throw new Error(`No item at ${itemIndex}`);
  return item;
}

function leaderboardEntryOf(rank: number): QuizshowLeaderboardEntry {
  return {
    rank,
    kind: "player",
    entrantId: `player-top-${rank}`,
    name: `Player ${rank}`,
    colorKey: null,
    score: 5000 - rank * 100,
    previousScore: 4000 - rank * 100,
  };
}

describe("QuizshowPlayerStage outcomes and scores", () => {
  it("a partial order shows some in place", async () => {
    render(
      stageOf(
        stateIn("reveal", "50", {
          question: ORDER_QUESTION,
          myReveal: {
            ...MY_REVEAL,
            phaseId: "50",
            questionId: "question-order",
            isCorrect: false,
            correctPositions: 1,
            pointsAwarded: 250,
            streakBonus: 0,
            streak: 0,
          },
          reveal: {
            phaseId: "50",
            questionId: "question-order",
            correct: {
              type: "order",
              orderedIds: ["first", "second", "third", "fourth"],
            },
            answeredCount: 4,
            eligibleCount: 5,
            distribution: {
              kind: "order",
              exactCount: 1,
              partialCount: 2,
              noneCount: 1,
            },
          },
        }),
      ),
    );

    expect(await screen.findByText("Some in place")).toBeInTheDocument();
    expect(screen.getByText("1 of 4 in place")).toBeInTheDocument();
    expect(screen.queryByText("Not this time")).toBeNull();
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent?.includes("Some in place")),
      ).toBe(true),
    );
  });

  it("the phone scores add your own row outside the top ten", async () => {
    const topTen = TOP_TEN_RANKS.map((rank) => leaderboardEntryOf(rank));
    render(
      stageOf(
        stateIn("scores", "60", {
          scores: {
            phaseId: "60",
            scope: "question",
            entries: topTen,
            entrantCount: 14,
          },
          myScores: {
            phaseId: "60",
            rank: 13,
            score: 900,
            previousScore: 600,
            ownScore: 900,
          },
        }),
      ),
    );

    const leaderboard = await screen.findByRole("list", {
      name: "Leaderboard",
    });
    const rows = within(leaderboard).getAllByRole("listitem");
    expect(rows).toHaveLength(11);
    const ownRow = itemAt(rows, 10);
    expect(within(ownRow).getByText("13")).toBeInTheDocument();
    expect(within(ownRow).getByText("Sam")).toBeInTheDocument();
    expect(ownRow).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("You're 13 of 14")).toBeInTheDocument();
  });

  it("the phone scores keep the top ten alone when your row is in it", async () => {
    const topTen = TOP_TEN_RANKS.map((rank): QuizshowLeaderboardEntry =>
      rank === 3
        ? { ...leaderboardEntryOf(rank), entrantId: "player-1", name: "Sam" }
        : leaderboardEntryOf(rank),
    );
    render(
      stageOf(
        stateIn("scores", "61", {
          scores: {
            phaseId: "61",
            scope: "question",
            entries: topTen,
            entrantCount: 14,
          },
          myScores: {
            phaseId: "61",
            rank: 3,
            score: 4700,
            previousScore: 3700,
            ownScore: 4700,
          },
        }),
      ),
    );

    const leaderboard = await screen.findByRole("list", {
      name: "Leaderboard",
    });
    const rows = within(leaderboard).getAllByRole("listitem");
    expect(rows).toHaveLength(10);
    expect(itemAt(rows, 2)).toHaveAttribute("aria-current", "true");
  });

  it("hides the joker line when the joker doubled nothing", async () => {
    render(
      stageOf(
        stateIn("reveal", "70", {
          myReveal: {
            ...MY_REVEAL,
            phaseId: "70",
            isCorrect: false,
            pointsAwarded: 0,
            streakBonus: 0,
            streak: 0,
            isJokerActive: true,
          },
          reveal: {
            phaseId: "70",
            questionId: "question-1",
            correct: { type: "multiple_choice", correctIndex: 0 },
            answeredCount: 4,
            eligibleCount: 5,
            distribution: { kind: "options", counts: [3, 1] },
          },
        }),
      ),
    );

    expect(await screen.findByText("Not this time")).toBeInTheDocument();
    expect(screen.getByText("+0 points")).toBeInTheDocument();
    expect(screen.queryByText("Doubled by your joker")).toBeNull();
  });
});
