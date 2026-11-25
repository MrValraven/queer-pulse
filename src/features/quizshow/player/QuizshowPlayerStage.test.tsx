import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";
import {
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
  type QuizshowLeaderboardEntry,
  type QuizshowMyReveal,
  type QuizshowPhase,
  type QuizshowPlayerState,
  type QuizshowQuestionView,
  type QuizshowRoundCard,
  type QuizshowWheelBonusView,
  type QuizshowWheelSlice,
  type QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isPlayerState,
  type QuizshowClientAction,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPlayerStage } from "./QuizshowPlayerStage";
import { QUIZSHOW_VIBRATION_STORAGE_KEY } from "./quizshowVibrate";

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
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant",
  numberUnit: { en: "", pt: "" },
  readMs: 4000,
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
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
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
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: cursorIn(phase, phaseId),
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

function controllerOf(
  session: QuizshowPlayerState,
  clientOverrides: Partial<QuizshowClientState> = {},
): QuizshowSessionController {
  return {
    state: {
      ...createQuizshowClientState("player"),
      status: "attached",
      hasAttached: true,
      session,
      ...clientOverrides,
    },
    clockOffsetMs: 0,
    isDemo: true,
    send: vi.fn(),
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function stageOf(
  session: QuizshowPlayerState,
  isReducedMotion = false,
  clientOverrides: Partial<QuizshowClientState> = {},
) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <QuizshowPlayerStage
          controller={controllerOf(session, clientOverrides)}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

const REVEAL_STATE = stateIn("reveal", "20", {
  myReveal: MY_REVEAL,
  reveal: {
    phaseId: "20",
    questionId: "question-1",
    correct: { type: "multiple_choice", correctIndexes: [0] },
    answeredCount: 4,
    eligibleCount: 5,
    distribution: { kind: "options", counts: [3, 1] },
    note: null,
    wasCorrected: false,
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
    window.localStorage.removeItem(QUIZSHOW_VIBRATION_STORAGE_KEY);
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
    expect(screen.getByText("You're 2nd of 5")).toBeInTheDocument();
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

  it("vibrates under reduced motion too, since the switch is its own preference", async () => {
    render(stageOf(REVEAL_STATE, true));
    await screen.findByText("Right");
    await waitFor(() => expect(vibrate).toHaveBeenCalledTimes(1));
  });

  it("sends no vibration when this device switched vibration off", async () => {
    window.localStorage.setItem(QUIZSHOW_VIBRATION_STORAGE_KEY, "false");
    render(stageOf(REVEAL_STATE));
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
    streak: 0,
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
            note: null,
            wasCorrected: false,
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
    expect(screen.getByText("You're 13th of 14")).toBeInTheDocument();
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
            correct: { type: "multiple_choice", correctIndexes: [0] },
            answeredCount: 4,
            eligibleCount: 5,
            distribution: { kind: "options", counts: [3, 1] },
            note: null,
            wasCorrected: false,
          },
        }),
      ),
    );

    expect(await screen.findByText("Not this time")).toBeInTheDocument();
    expect(screen.getByText("+0 points")).toBeInTheDocument();
    expect(screen.queryByText("Doubled by your joker")).toBeNull();
  });
});

function wheelSliceOf(roundIndex: number, title: string): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: title, pt: title },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 8,
    isPlayed: false,
  };
}

function wheelViewOf(
  hasSpin: boolean,
  spinNumber: number,
  wheelRoundIndex: number | null = 0,
): QuizshowWheelView {
  return {
    wheelRoundIndex,
    pick: "round",
    slices: [wheelSliceOf(1, "Music"), wheelSliceOf(2, "Queer history")],
    spinNumber,
    spinTotal: 2,
    spin: hasSpin
      ? {
          landedSliceIndex: 0,
          startedAt: Date.now(),
          durationMs: QUIZSHOW_LIMITS.wheelSpinMs,
          turns: 5,
          jitterSeed: 500,
          startAngle: 0,
        }
      : null,
    playingRoundIndex: null,
  };
}

const WHEEL_BONUS_FOR_ME: QuizshowWheelBonusView = {
  points: 500,
  pick: "round",
  sliceRoundIndex: 1,
  sliceTitle: { en: "Music", pt: "Musica" },
  winners: [
    { entrantId: "player-1", kind: "player", name: "Sam", colorKey: null },
  ],
};

function roundCardOf(
  roundIndex: number,
  kind: QuizshowRoundCard["kind"],
): QuizshowRoundCard {
  return {
    roundIndex,
    kind,
    title: { en: "Warm up", pt: "Aquecimento" },
    contentLabel: "none",
    questionCount: kind === "wheel" ? 0 : 3,
    isJokerAllowed: kind !== "wheel",
    isSpeedBonusOn: false,
    isWarmUp: false,
    talkSeconds: 0,
  };
}

function wheelStageOf(session: QuizshowPlayerState) {
  return (
    <TestProviders>
      <MotionProvider>
        <QuizshowPlayerStage controller={controllerOf(session)} />
      </MotionProvider>
    </TestProviders>
  );
}

// The disc's pointer kicks call element.animate, which src/test/setup.ts
// stands in for on HTMLElement and SVGElement. A stub on Element.prototype
// would turn motion's heading fade onto WAAPI with no Animation behind it.
describe("QuizshowPlayerStage wheel", () => {
  it("announces wheel time", async () => {
    render(
      wheelStageOf(stateIn("wheel", "90", { wheel: wheelViewOf(false, 1) })),
    );
    await awaitCatalog("quizshow");

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent?.includes("Wheel time")),
      ).toBe(true),
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The wheel spins when the host is ready",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the wheel mounted between spins", async () => {
    const { rerender } = render(
      wheelStageOf(stateIn("wheel", "91", { wheel: wheelViewOf(false, 1) })),
    );
    await awaitCatalog("quizshow");
    const headingBefore = screen.getByRole("heading", { level: 1 });

    rerender(
      wheelStageOf(stateIn("wheel", "92", { wheel: wheelViewOf(true, 2) })),
    );

    expect(
      await screen.findByText("The wheel is spinning"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBe(headingBefore);
  });

  it("gives the winner their moment on the leaderboard", async () => {
    render(
      wheelStageOf(
        stateIn("leaderboard", "93", { wheelBonus: WHEEL_BONUS_FOR_ME }),
      ),
    );
    await awaitCatalog("quizshow");

    expect(
      await screen.findByText("You won the wheel bonus"),
    ).toBeInTheDocument();
  });

  it("offers the joker for the round up next on a leaderboard", async () => {
    render(
      wheelStageOf(
        stateIn("leaderboard", "94", {
          rounds: [roundCardOf(1, "quiz")],
          cursor: {
            ...cursorIn("leaderboard", "94"),
            upNext: { kind: "round", roundIndex: 1 },
          },
        }),
      ),
    );
    await awaitCatalog("quizshow");

    expect(await screen.findByRole("button", { name: "Joker" })).toBeVisible();
    expect(
      screen.queryByText("Play your joker on the round card"),
    ).not.toBeInTheDocument();
  });

  it("points the joker at the round card when the wheel is up next on a leaderboard", async () => {
    render(
      wheelStageOf(
        stateIn("leaderboard", "95", {
          rounds: [roundCardOf(0, "wheel")],
          cursor: {
            ...cursorIn("leaderboard", "95"),
            upNext: { kind: "wheel", wheelRoundIndex: 0 },
          },
        }),
      ),
    );
    await awaitCatalog("quizshow");

    expect(
      await screen.findByText("Play your joker on the round card"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Joker" }),
    ).not.toBeInTheDocument();
  });

  it("says the winner's bonus in the stage's own announcement", async () => {
    render(
      wheelStageOf(
        stateIn("leaderboard", "96", { wheelBonus: WHEEL_BONUS_FOR_ME }),
      ),
    );
    await awaitCatalog("quizshow");

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) =>
            region.textContent?.startsWith(
              "Leaderboard is up. You won the wheel bonus. +500 for Music",
            ),
          ),
      ).toBe(true),
    );
  });

  it("says who won the bonus to everyone else", async () => {
    render(
      wheelStageOf(
        stateIn("leaderboard", "97", {
          wheelBonus: {
            ...WHEEL_BONUS_FOR_ME,
            winners: [
              { entrantId: "ana", kind: "player", name: "Ana", colorKey: null },
            ],
          },
        }),
      ),
    );
    await awaitCatalog("quizshow");

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) =>
            region.textContent?.startsWith(
              "Leaderboard is up. +500 to Ana for Music",
            ),
          ),
      ).toBe(true),
    );
  });
});

const POLL_QUESTION: QuizshowQuestionView = {
  ...QUESTION,
  questionId: "question-poll",
  type: "poll",
  prompt: { en: "Best Pride?", pt: "Melhor Pride?" },
};

function talkStateOf(
  playMode: QuizshowPlayerState["playMode"],
): QuizshowPlayerState {
  const now = Date.now();
  return stateIn("read", "80", {
    playMode,
    cursor: {
      ...cursorIn("read", "80"),
      phaseStartedAt: now - 6_000,
      deadline: now + 14_000,
      talkStartsAt: now - 2_000,
    },
  });
}

describe("QuizshowPlayerStage reveal content and talk", () => {
  it("marks every correct option and keeps you right on either", async () => {
    render(
      stageOf(
        stateIn("reveal", "20", {
          myAnswer: {
            questionId: "question-1",
            phaseId: "19",
            payload: { type: "multiple_choice", optionIndex: 1 },
            receivedAt: 1,
          },
          myReveal: MY_REVEAL,
          reveal: {
            ...(REVEAL_STATE.reveal as NonNullable<
              QuizshowPlayerState["reveal"]
            >),
            correct: { type: "multiple_choice", correctIndexes: [0, 1] },
          },
        }),
      ),
    );
    expect(await screen.findByText("Right")).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Correct answer, Answer A, Triangle: Rainbow",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Correct answer, Answer B, Diamond: Trans",
      }),
    ).toBeInTheDocument();
  });

  it("shows the fun fact under the answer when the reveal has a note", async () => {
    render(
      stageOf(
        stateIn("reveal", "20", {
          myReveal: MY_REVEAL,
          reveal: {
            ...(REVEAL_STATE.reveal as NonNullable<
              QuizshowPlayerState["reveal"]
            >),
            note: {
              en: "It flew first in 1978",
              pt: "Voou pela primeira vez em 1978",
            },
          },
        }),
      ),
    );
    expect(await screen.findByText("Fun fact")).toBeInTheDocument();
    expect(screen.getByText("It flew first in 1978")).toHaveAttribute(
      "lang",
      "en",
    );
  });

  it("leaves the fun fact out without a note", async () => {
    render(stageOf(REVEAL_STATE));
    await screen.findByText("Right");
    expect(screen.queryByText("Fun fact")).toBeNull();
  });

  it("says the place as an ordinal of everyone playing", async () => {
    render(
      stageOf(
        stateIn("reveal", "20", {
          lobby: { teams: [], playerCount: 12 },
          myReveal: { ...MY_REVEAL, rank: 3 },
          reveal: REVEAL_STATE.reveal,
        }),
      ),
    );
    expect(await screen.findByText("You're 3rd of 12")).toBeInTheDocument();
  });

  it("shows a poll's shares and your pick with no right or wrong", async () => {
    render(
      stageOf(
        stateIn("reveal", "40", {
          question: POLL_QUESTION,
          myAnswer: {
            questionId: "question-poll",
            phaseId: "39",
            payload: { type: "poll", optionIndex: 1 },
            receivedAt: 1,
          },
          myReveal: {
            ...MY_REVEAL,
            phaseId: "40",
            questionId: "question-poll",
            isCorrect: null,
            pointsAwarded: 0,
            streakBonus: 0,
          },
          reveal: {
            phaseId: "40",
            questionId: "question-poll",
            correct: null,
            answeredCount: 4,
            eligibleCount: 5,
            distribution: { kind: "options", counts: [3, 1] },
            note: null,
            wasCorrected: false,
          },
        }),
      ),
    );
    expect(
      await screen.findByRole("group", {
        name: "Answer A, Triangle: Rainbow. 75% picked this",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Answer B, Diamond: Trans. 25% picked this. Your pick",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Right")).toBeNull();
    expect(screen.queryByText("Not this time")).toBeNull();
    expect(screen.queryByText("Correct answer")).toBeNull();
    expect(screen.queryByText(/points$/)).toBeNull();
  });

  it("asks a team to talk it over with the seconds left", async () => {
    render(stageOf(talkStateOf("teams")));
    expect(
      await screen.findByText("Talk it over with your team"),
    ).toBeInTheDocument();
    expect(screen.getByText(/seconds left$/)).toBeInTheDocument();
    // One ask at a time: the "Get ready" pill waits out the talk.
    expect(screen.queryByText("Get ready")).toBeNull();
  });

  it("never asks a solo player to talk it over", async () => {
    render(stageOf(talkStateOf("solo")));
    await screen.findByRole("heading", { level: 1, name: "Which flag?" });
    expect(screen.queryByText("Talk it over with your team")).toBeNull();
    expect(await screen.findByText("Get ready")).toBeInTheDocument();
  });

  it("keeps the podium mounted from one podium step to the next", async () => {
    const bronze = {
      place: 3 as const,
      kind: "player" as const,
      entrantId: "player-bronze",
      name: "Bronze",
      colorKey: null,
      score: 1000,
    };
    const silver = {
      ...bronze,
      place: 2 as const,
      entrantId: "player-silver",
      name: "Silver",
      score: 2000,
    };
    const { container, rerender } = render(
      stageOf(stateIn("podium", "70", { question: null, podium: [bronze] })),
    );
    await screen.findByText("Bronze");
    const podiumList = container
      .querySelector<HTMLElement>('[data-place="3"]')
      ?.closest("ol");
    expect(podiumList).not.toBeNull();

    // The next step is a new phase id (C6.7): the same podium takes it.
    rerender(
      stageOf(
        stateIn("podium", "71", { question: null, podium: [silver, bronze] }),
      ),
    );
    const silverName = await screen.findByText("Silver");
    expect(podiumList?.isConnected).toBe(true);
    expect(podiumList?.contains(silverName)).toBe(true);
  });

  it("shows the question picture in read, blurred on the slow reveal", async () => {
    const now = Date.now();
    render(
      stageOf(
        stateIn("read", "81", {
          question: {
            ...QUESTION,
            mediaUrl: "https://cdn.example.test/flag.jpg",
            mediaAlt: { en: "A striped flag", pt: "Uma bandeira às riscas" },
            mediaReveal: "slow",
          },
          cursor: {
            ...cursorIn("read", "81"),
            phaseStartedAt: now - 1_000,
            deadline: now + 3_000,
          },
        }),
      ),
    );
    const picture = await screen.findByRole("img", { name: "A striped flag" });
    expect(picture.style.filter).toContain("blur");
  });
});

describe("QuizshowPlayerStage movement, gap and podium", () => {
  it("says how many places the player went up at the reveal", async () => {
    render(
      stageOf(REVEAL_STATE, false, {
        ownRanks: { previous: 4, current: 2 },
      }),
    );
    expect(await screen.findByText("Up 2 places")).toBeInTheDocument();
  });

  it("says how many places the player went down at the reveal", async () => {
    render(
      stageOf(REVEAL_STATE, false, {
        ownRanks: { previous: 1, current: 2 },
      }),
    );
    expect(await screen.findByText("Down 1 place")).toBeInTheDocument();
    expect(screen.queryByText(/^Up /)).toBeNull();
  });

  it("says no move at a later reveal with an unchanged rank, as the store remembers it", async () => {
    const earlierQuestion = { ...QUESTION, questionId: "question-0" };
    const actions: QuizshowClientAction[] = [
      {
        event: "session:state",
        payload: stateIn("reveal", "10", {
          question: earlierQuestion,
          myReveal: { ...MY_REVEAL, phaseId: "10", questionId: "question-0" },
        }),
      },
      {
        event: "phase:change",
        payload: {
          cursor: cursorIn("read", "19"),
          round: null,
          question: QUESTION,
          wheel: null,
          wheelBonus: null,
        },
      },
      {
        event: "phase:change",
        payload: {
          cursor: cursorIn("reveal", "20"),
          round: null,
          question: QUESTION,
          wheel: null,
          wheelBonus: null,
        },
      },
      { event: "reveal:mine", payload: MY_REVEAL },
    ];
    const storeState = actions.reduce(
      applyQuizshowFrame,
      createQuizshowClientState("player"),
    );
    // Both reveals put the player 2nd: the store says no move.
    expect(storeState.ownRanks).toEqual({ previous: 2, current: 2 });
    const session = isPlayerState(storeState.session)
      ? storeState.session
      : REVEAL_STATE;
    render(stageOf(session, false, storeState));
    await screen.findByText("Right");
    expect(screen.queryByText(/^Up /)).toBeNull();
    expect(screen.queryByText(/^Down /)).toBeNull();
  });
});

describe("QuizshowPlayerStage gap, podium place and footer", () => {
  it("shows the gap to the entrant above inside the top ten", async () => {
    const topTen = TOP_TEN_RANKS.map((rank): QuizshowLeaderboardEntry =>
      rank === 3
        ? { ...leaderboardEntryOf(rank), entrantId: "player-1", name: "Sam" }
        : leaderboardEntryOf(rank),
    );
    render(
      stageOf(
        stateIn("scores", "62", {
          scores: {
            phaseId: "62",
            scope: "question",
            entries: topTen,
            entrantCount: 14,
          },
          myScores: {
            phaseId: "62",
            rank: 3,
            score: 4700,
            previousScore: 3700,
            ownScore: 4700,
          },
        }),
        false,
        { ownRanks: { previous: 5, current: 3 } },
      ),
    );
    expect(
      await screen.findByText("100 points behind Player 2"),
    ).toBeInTheDocument();
    expect(screen.getByText("Up 2 places")).toBeInTheDocument();
  });

  it("leaves the gap out below the top ten", async () => {
    const topTen = TOP_TEN_RANKS.map((rank) => leaderboardEntryOf(rank));
    render(
      stageOf(
        stateIn("scores", "63", {
          scores: {
            phaseId: "63",
            scope: "question",
            entries: topTen,
            entrantCount: 14,
          },
          myScores: {
            phaseId: "63",
            rank: 13,
            score: 900,
            previousScore: 600,
            ownScore: 900,
          },
        }),
      ),
    );
    expect(await screen.findByText("You're 13th of 14")).toBeInTheDocument();
    expect(screen.queryByText(/points behind/)).toBeNull();
  });

  it("leaves the gap out in first place", async () => {
    const topTen = TOP_TEN_RANKS.map((rank): QuizshowLeaderboardEntry =>
      rank === 1
        ? { ...leaderboardEntryOf(rank), entrantId: "player-1", name: "Sam" }
        : leaderboardEntryOf(rank),
    );
    render(
      stageOf(
        stateIn("scores", "64", {
          scores: {
            phaseId: "64",
            scope: "question",
            entries: topTen,
            entrantCount: 14,
          },
          myScores: {
            phaseId: "64",
            rank: 1,
            score: 4900,
            previousScore: 3900,
            ownScore: 4900,
          },
        }),
      ),
    );
    expect(await screen.findByText("You're 1st of 14")).toBeInTheDocument();
    expect(screen.queryByText(/points behind/)).toBeNull();
  });

  it("shows the player's own podium place only once it is revealed", async () => {
    const bronze = {
      place: 3 as const,
      kind: "player" as const,
      entrantId: "player-bronze",
      name: "Bronze",
      colorKey: null,
      score: 1000,
    };
    const silver = {
      ...bronze,
      place: 2 as const,
      entrantId: "player-1",
      name: "Sam",
      score: 2000,
    };
    const { rerender } = render(
      stageOf(
        stateIn("podium", "90", {
          question: null,
          lobby: { teams: [], playerCount: 12 },
          podium: [bronze],
        }),
      ),
    );
    await screen.findByText("Bronze");
    expect(screen.queryByText(/^You're/)).toBeNull();

    rerender(
      stageOf(
        stateIn("podium", "91", {
          question: null,
          lobby: { teams: [], playerCount: 12 },
          podium: [silver, bronze],
        }),
      ),
    );
    expect(await screen.findByText("You're 2nd of 12")).toBeInTheDocument();
  });

  it("lists the player first on a crowded tied step and marks it as theirs", async () => {
    const tiedSecond = ["Ana", "Bo", "Cleo", "Sam"].map((name) => ({
      place: 2 as const,
      kind: "player" as const,
      entrantId: name === "Sam" ? "player-1" : `player-${name}`,
      name,
      colorKey: null,
      score: 2000,
    }));
    render(
      stageOf(
        stateIn("podium", "92", {
          question: null,
          lobby: { teams: [], playerCount: 12 },
          podium: tiedSecond,
        }),
        true,
      ),
    );
    const ownName = await screen.findByText("Sam");
    expect(ownName.closest('[aria-current="true"]')).not.toBeNull();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
    expect(screen.queryByText("Cleo")).toBeNull();
  });

  it("offers leaving the game at the foot of the running game", async () => {
    render(stageOf(REVEAL_STATE));
    expect(
      await screen.findByRole("button", { name: "Leave the game" }),
    ).toBeInTheDocument();
  });

  it("shows the reaction bar at a reveal and folds it away while answers are open", async () => {
    const { rerender } = render(stageOf(REVEAL_STATE));
    expect(
      await screen.findByRole("button", { name: "Heart" }),
    ).toBeInTheDocument();
    rerender(stageOf(stateIn("open", "21")));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Heart" })).toBeNull(),
    );
  });
});

const PODIUM_BRONZE = {
  place: 3 as const,
  kind: "player" as const,
  entrantId: "player-bronze",
  name: "Bronze",
  colorKey: null,
  score: 1000,
};

const PODIUM_SILVER = {
  ...PODIUM_BRONZE,
  place: 2 as const,
  entrantId: "player-silver",
  name: "Silver",
  score: 2000,
};

function podiumStateAt(
  phaseId: string,
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return stateIn("podium", phaseId, {
    question: null,
    lobby: { teams: [], playerCount: 12 },
    ...overrides,
  });
}

describe("QuizshowPlayerStage podium on the phone, timed", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("holds the player's own 1st place for the winner beat", async () => {
    const winner = {
      ...PODIUM_BRONZE,
      place: 1 as const,
      entrantId: "player-1",
      name: "Sam",
      score: 3000,
    };
    const { rerender } = render(
      stageOf(podiumStateAt("92", { podium: [PODIUM_SILVER, PODIUM_BRONZE] })),
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    expect(screen.queryByText(/^You're/)).toBeNull();

    rerender(
      stageOf(
        podiumStateAt("93", {
          podium: [winner, PODIUM_SILVER, PODIUM_BRONZE],
        }),
      ),
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_LIMITS.podiumWinnerHoldMs - 100);
    });
    expect(screen.queryByText("You're 1st of 12")).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.getByText("You're 1st of 12")).toBeInTheDocument();
  });

  it("reads a place below the podium from this step's scores:mine only", async () => {
    const { rerender } = render(
      stageOf(
        podiumStateAt("94", {
          podium: [PODIUM_BRONZE],
          myScores: {
            phaseId: "80",
            rank: 5,
            score: 400,
            previousScore: 300,
            ownScore: 400,
          },
        }),
      ),
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    // Another phase's myScores says nothing about this step.
    expect(screen.queryByText(/^You're/)).toBeNull();

    rerender(
      stageOf(
        podiumStateAt("94", {
          podium: [PODIUM_BRONZE],
          myScores: {
            phaseId: "94",
            rank: 5,
            score: 400,
            previousScore: 300,
            ownScore: 400,
          },
        }),
      ),
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    expect(screen.getByText("You're 5th of 12")).toBeInTheDocument();
  });
});

describe("QuizshowPlayerStage heading focus on every phase body", () => {
  it("focuses the outcome line once the player's own reveal lands", async () => {
    const { rerender } = render(
      stageOf({ ...REVEAL_STATE, myReveal: null, question: QUESTION }),
    );
    // The reveal frame alone leaves a hidden heading: results are in.
    const waitingHeading = await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(waitingHeading).toHaveFocus());

    rerender(stageOf(REVEAL_STATE));
    const outcomeHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Right",
    });
    await waitFor(() => expect(outcomeHeading).toHaveFocus());
    expect(outcomeHeading).toHaveAttribute("tabindex", "-1");
  });

  it("gives a poll reveal a heading to focus even with no outcome line", async () => {
    render(
      stageOf(
        stateIn("reveal", "20", {
          question: POLL_QUESTION,
          myReveal: { ...MY_REVEAL, isCorrect: null },
          reveal: {
            ...(REVEAL_STATE.reveal as NonNullable<
              QuizshowPlayerState["reveal"]
            >),
            correct: null,
          },
        }),
      ),
    );
    const heading = await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it("focuses the place line on the scores, and a hidden heading before the rank lands", async () => {
    const scores = {
      phaseId: "62",
      scope: "question" as const,
      entries: TOP_TEN_RANKS.map((rank) => leaderboardEntryOf(rank)),
      entrantCount: 14,
    };
    const { rerender } = render(stageOf(stateIn("scores", "62", { scores })));
    const hiddenHeading = await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(hiddenHeading).toHaveFocus());

    rerender(
      stageOf(
        stateIn("scores", "62", {
          scores,
          myScores: {
            phaseId: "62",
            rank: 13,
            score: 900,
            previousScore: 600,
            ownScore: 900,
          },
        }),
      ),
    );
    const placeHeading = await screen.findByRole("heading", {
      level: 1,
      name: "You're 13th of 14",
    });
    await waitFor(() => expect(placeHeading).toHaveFocus());
  });

  it("focuses a heading on the round intro", async () => {
    render(
      stageOf(stateIn("round_intro", "5", { round: roundCardOf(0, "quiz") })),
    );
    const heading = await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(
      screen.getByRole("heading", { level: 2, name: "Warm up" }),
    ).toBeInTheDocument();
  });

  it("focuses a heading when the podium lands and leaves it alone on the next step", async () => {
    const { rerender } = render(
      stageOf(podiumStateAt("95", { podium: [PODIUM_BRONZE] })),
    );
    const heading = await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(heading).toHaveFocus());

    heading.blur();
    rerender(
      stageOf(podiumStateAt("96", { podium: [PODIUM_SILVER, PODIUM_BRONZE] })),
    );
    await screen.findByText("Silver");
    expect(heading).not.toHaveFocus();
  });
});

describe("QuizshowPlayerStage warm-up and corrected reveals", () => {
  const WARM_UP_ROUND: QuizshowRoundCard = {
    ...roundCardOf(0, "quiz"),
    isWarmUp: true,
  };

  it("says a warm-up scores nothing and leaves the points and place out", async () => {
    render(
      stageOf({
        ...REVEAL_STATE,
        round: WARM_UP_ROUND,
        rounds: [WARM_UP_ROUND],
      }),
    );
    expect(await screen.findByText("Right")).toBeInTheDocument();
    expect(
      screen.getByText(/Warm-up: no points|player\.warmUpNoPoints/),
    ).toBeInTheDocument();
    expect(screen.queryByText("+1,200 points")).toBeNull();
    expect(screen.queryByText(/^You're/)).toBeNull();
    expect(screen.queryByText("Streak of 3")).toBeNull();
  });

  it("finds the warm-up flag on the round list when the current round card is gone", async () => {
    render(
      stageOf(
        { ...REVEAL_STATE, round: null, rounds: [WARM_UP_ROUND] },
        false,
        { ownRanks: { previous: 1, current: 2 } },
      ),
    );
    await screen.findByText("Right");
    expect(screen.queryByText(/^Down /)).toBeNull();
    expect(screen.queryByText("+1,200 points")).toBeNull();
  });

  it("keeps the points and place on a scored round", async () => {
    render(
      stageOf({
        ...REVEAL_STATE,
        round: roundCardOf(0, "quiz"),
        rounds: [roundCardOf(0, "quiz")],
      }),
    );
    expect(await screen.findByText("+1,200 points")).toBeInTheDocument();
    expect(screen.getByText("You're 2nd of 5")).toBeInTheDocument();
    expect(
      screen.queryByText(/Warm-up: no points|player\.warmUpNoPoints/),
    ).toBeNull();
  });

  it("tells the player the host corrected the answer", async () => {
    render(
      stageOf({
        ...REVEAL_STATE,
        reveal: {
          ...(REVEAL_STATE.reveal as NonNullable<
            QuizshowPlayerState["reveal"]
          >),
          wasCorrected: true,
        },
      }),
    );
    expect(
      await screen.findByText(
        /The host corrected this answer|player\.hostCorrected/,
      ),
    ).toBeInTheDocument();
  });

  it("says nothing of a correction when the host left the answer alone", async () => {
    render(stageOf(REVEAL_STATE));
    await screen.findByText("Right");
    expect(
      screen.queryByText(
        /The host corrected this answer|player\.hostCorrected/,
      ),
    ).toBeNull();
  });
});
