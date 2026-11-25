import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Link, Route, Routes } from "react-router-dom";
import QRCode from "qrcode";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { TestProviders } from "../../../test/TestProviders";
import {
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
  type QuizshowLiveSessionRef,
  type QuizshowQuestionView,
  type QuizshowRoundCard,
  type QuizshowScores,
  type QuizshowScreenState,
  type QuizshowWheelBonusView,
  type QuizshowWheelSlice,
  type QuizshowWheelSpin,
  type QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowScope } from "../quizshowScope";
import { defaultGatheringSlug } from "../../gatherings/data";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { QUIZSHOW_DEMO_TICK_MS } from "../quizshow.constants";
import {
  QUIZSHOW_SCREEN_ROUTE,
  QUIZSHOW_TV_LEAVE_STATE,
  quizshowScreenPath,
  quizshowTvPath,
} from "../quizshowPaths";
import { eventScope } from "../quizshowScope";
import type {
  QuizshowClientState,
  QuizshowReactionBurst,
} from "../realtime/quizshowClientStore";
import type { QuizshowHostSession } from "./quizshowHostSession";
import { QuizshowScreenPage, QuizshowScreenView } from "./QuizshowScreenPage";
import { QuizshowScreenStage } from "./QuizshowScreenStage";
import { QuizshowTvPage } from "./QuizshowTvPage";
import { saveDeviceTicket } from "./quizshowDeviceTicket";

const pairingApiMock = vi.hoisted(() => ({
  startScreenPairing: vi.fn(),
  startHelperPairing: vi.fn(),
  claimPairing: vi.fn(),
}));
const cueMock = vi.hoisted(() => ({
  playQuizshowCue: vi.fn(),
  isAudioRunning: false,
}));
const liveMock = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  return {
    isLive: false,
    isOrganizer: true,
    liveSession: null as QuizshowLiveSessionRef | null,
    hasQuizFailed: false,
    version: 0,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Changes what the next quiz read returns and re-renders its readers. */
    setQuiz(next: {
      liveSession: QuizshowLiveSessionRef | null;
      hasQuizFailed: boolean;
    }) {
      this.liveSession = next.liveSession;
      this.hasQuizFailed = next.hasQuizFailed;
      this.version += 1;
      for (const listener of listeners) listener();
    },
  };
});
const sessionOverride = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  return {
    state: null as QuizshowClientState | null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(next: QuizshowClientState | null) {
      this.state = next;
      for (const listener of listeners) listener();
    },
  };
});

vi.mock("../../../shared/components/ui/RollingNumber", () => ({
  RollingNumber: (props: { value: string }) => <span>{props.value}</span>,
}));
vi.mock("../api/quizshowPairing.api", () => pairingApiMock);
vi.mock("../sound/quizshowCues", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../sound/quizshowCues")>()),
  playQuizshowCue: cueMock.playQuizshowCue,
  isQuizshowAudioRunning: () => cueMock.isAudioRunning,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...actual,
    useDemoMode: () => {
      const value = actual.useDemoMode();
      return liveMock.isLive ? { ...value, demoMode: false } : value;
    },
  };
});
vi.mock("../../gatherings/api/useEvent", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../gatherings/api/useEvent")>();
  return {
    ...actual,
    useEvent: (param: string | undefined) => {
      const result = actual.useEvent(param);
      if (!liveMock.isLive) return result;
      return {
        data: {
          gathering: {
            slug: param ?? "quiz-night",
            title: "Quiz night",
            viewerIsOrganizer: liveMock.isOrganizer,
          },
        },
        error: null,
        isError: false,
        isLoading: false,
      };
    },
  };
});
vi.mock("../api/useQuizshowQuiz", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useQuizshowQuiz")>();
  const { useSyncExternalStore } = await import("react");
  return {
    ...actual,
    useQuizshowQuiz: (
      scope: QuizshowScope,
      options: Parameters<typeof actual.useQuizshowQuiz>[1],
    ) => {
      const result = actual.useQuizshowQuiz(scope, options);
      useSyncExternalStore(
        (listener) => liveMock.subscribe(listener),
        () => liveMock.version,
      );
      if (!liveMock.isLive) return result;
      // A failed background refetch keeps the last data, as react-query does.
      return {
        data: {
          quiz: null,
          problems: [],
          isAdultsEvent: false,
          liveSession: liveMock.liveSession,
          hasResults: false,
        },
        error: liveMock.hasQuizFailed ? new Error("Network down") : null,
        isError: liveMock.hasQuizFailed,
        isLoading: false,
      };
    },
  };
});
vi.mock("../realtime/useQuizshowSession", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../realtime/useQuizshowSession")>();
  const { useSyncExternalStore } = await import("react");
  return {
    ...actual,
    useQuizshowSession: (
      options: Parameters<typeof actual.useQuizshowSession>[0],
    ) => {
      const controller = actual.useQuizshowSession(options);
      const overriddenState = useSyncExternalStore(
        (listener) => sessionOverride.subscribe(listener),
        () => sessionOverride.state,
      );
      return overriddenState === null
        ? controller
        : { ...controller, state: overriddenState };
    },
  };
});

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  const roundIndex =
    overrides.roundIndex === undefined ? null : overrides.roundIndex;
  return {
    phaseId: "1",
    status: "running",
    phase: "lobby",
    roundIndex: null,
    questionIndex: null,
    roundCount: 2,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: roundIndex === null ? 0 : roundIndex + 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
    ...overrides,
  };
}

const ROUNDS: QuizshowRoundCard[] = [
  {
    roundIndex: 0,
    kind: "quiz",
    title: { en: "Warm up", pt: "Aquecimento" },
    contentLabel: "none",
    questionCount: 3,
    isJokerAllowed: true,
    isSpeedBonusOn: true,
    isWarmUp: false,
    talkSeconds: 0,
  },
  {
    roundIndex: 1,
    kind: "caption_this",
    title: { en: "Captions", pt: "Legendas" },
    contentLabel: "spicy",
    questionCount: 2,
    isJokerAllowed: false,
    isSpeedBonusOn: false,
    isWarmUp: false,
    talkSeconds: 0,
  },
];

const QUIZ_QUESTION: QuizshowQuestionView = {
  questionId: "question-1",
  roundIndex: 0,
  questionIndex: 0,
  roundKind: "quiz",
  type: "multiple_choice",
  prompt: { en: "Which year was Stonewall?", pt: "Em que ano foi Stonewall?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 20,
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant",
  numberUnit: { en: "", pt: "" },
  readMs: 4000,
  options: [
    { id: "option-a", text: { en: "1959", pt: "1959" } },
    { id: "option-b", text: { en: "1969", pt: "1969" } },
    { id: "option-c", text: { en: "1979", pt: "1979" } },
    { id: "option-d", text: { en: "1989", pt: "1989" } },
  ],
};

const PARTY_QUESTION: QuizshowQuestionView = {
  ...QUIZ_QUESTION,
  questionId: "question-party",
  roundIndex: 1,
  roundKind: "caption_this",
  type: "prompt",
  prompt: { en: "Caption this picture", pt: "Legenda esta foto" },
  options: null,
};

function screenSession(
  overrides: Partial<QuizshowScreenState> = {},
): QuizshowScreenState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    kind: "event",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Pride quiz",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: cursorWith(),
    rounds: ROUNDS,
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "screen",
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    wheel: null,
    wheelBonus: null,
    ...overrides,
  };
}

function clientState(session: QuizshowScreenState): QuizshowClientState {
  return {
    role: "screen",
    status: "attached",
    refusalCode: null,
    session,
    sessionEnd: null,
    isRemoved: false,
    pendingAnswer: null,
    hasAttached: true,
    retryCause: null,
    rematch: null,
    reactionBurst: null,
    canRejoinAfterRemoval: false,
    nightLog: [],
    ownRanks: { previous: null, current: null },
    ownRankSourceKey: null,
    lastTeamName: null,
  };
}

function openQuestionSession(
  cursorOverrides: Partial<QuizshowCursor> = {},
): QuizshowScreenState {
  return screenSession({
    cursor: cursorWith({
      phaseId: "4",
      phase: "open",
      roundIndex: 0,
      questionIndex: 0,
      phaseStartedAt: Date.now(),
      deadline: Date.now() + 20_000,
      ...cursorOverrides,
    }),
    round: ROUNDS[0] ?? null,
    question: QUIZ_QUESTION,
    answerCount: { count: 3, total: 12 },
  });
}

function revealSession(
  phaseId: string,
  overrides: Partial<QuizshowScreenState> = {},
): QuizshowScreenState {
  return screenSession({
    cursor: cursorWith({
      phaseId,
      phase: "reveal",
      roundIndex: 0,
      questionIndex: 0,
    }),
    round: ROUNDS[0] ?? null,
    question: QUIZ_QUESTION,
    reveal: {
      phaseId,
      questionId: QUIZ_QUESTION.questionId,
      correct: { type: "multiple_choice", correctIndexes: [1] },
      answeredCount: 10,
      eligibleCount: 12,
      distribution: { kind: "options", counts: [2, 6, 1, 1] },
      note: null,
      wasCorrected: false,
    },
    ...overrides,
  });
}

function partySession(
  phase: QuizshowCursor["phase"],
  overrides: Partial<QuizshowScreenState> = {},
): QuizshowScreenState {
  return screenSession({
    cursor: cursorWith({
      phaseId: "9",
      phase,
      roundIndex: 1,
      questionIndex: 0,
    }),
    round: ROUNDS[1] ?? null,
    question: PARTY_QUESTION,
    ...overrides,
  });
}

function renderStage(session: QuizshowScreenState) {
  return render(
    <TestProviders>
      <QuizshowScreenStage
        state={clientState(session)}
        clockOffsetMs={0}
        size="screen"
      />
    </TestProviders>,
  );
}

function renderPage(path = quizshowScreenPath(defaultGatheringSlug)) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path={QUIZSHOW_SCREEN_ROUTE} element={<QuizshowScreenPage />} />
      </Routes>
    </TestProviders>,
  );
}

function screenRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>("[data-quizshow-screen]");
  if (root === null) throw new Error("No presenter root");
  return root;
}

beforeEach(() => {
  window.localStorage.clear();
  cueMock.playQuizshowCue.mockReset();
  cueMock.isAudioRunning = false;
  liveMock.isLive = false;
  liveMock.isOrganizer = true;
  liveMock.setQuiz({ liveSession: null, hasQuizFailed: false });
  sessionOverride.set(null);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("QuizshowScreenPage lobby in demo", () => {
  it("shows the join code, the QR to /play/<code> and the players as they arrive", async () => {
    const createSpy = vi.spyOn(QRCode, "create");
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderPage();

    const code = await screen.findByText("QZ7KP4");
    expect(code).toHaveAttribute("data-quizshow-join-code");
    expect(
      await screen.findByRole("img", { name: "QR code to join the game" }),
    ).toBeInTheDocument();
    expect(
      createSpy.mock.calls.some(
        (call) =>
          typeof call[0] === "string" && call[0].endsWith("/play/QZ7KP4"),
      ),
    ).toBe(true);
    expect(screen.queryByText("Rita")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_DEMO_TICK_MS * 3);
    });
    expect(screen.getByText("Rita")).toBeInTheDocument();
    expect(screen.queryByText("Nuno")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_DEMO_TICK_MS * 3);
    });
    expect(screen.getByText("Nuno")).toBeInTheDocument();
  });
});

describe("QuizshowScreenPage play mode override", () => {
  it("the screen shows teams with ?demoPlayMode=teams in demo", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderPage(
      `${quizshowScreenPath(defaultGatheringSlug)}?demoPlayMode=teams`,
    );
    await screen.findByText("QZ7KP4");
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_DEMO_TICK_MS * 6);
    });
    expect(screen.getAllByText(/\d+ members?$/).length).toBeGreaterThan(0);
  });
});

describe("QuizshowScreenStage", () => {
  it("lists tonight's rounds with their content labels", async () => {
    renderStage(screenSession());
    expect(await screen.findByText("Tonight's rounds")).toBeInTheDocument();
    expect(screen.getByText("Warm up")).toBeInTheDocument();
    expect(screen.getByText("Captions")).toBeInTheDocument();
    expect(screen.getByText("Quiz")).toBeInTheDocument();
    expect(screen.getByText("Caption This")).toBeInTheDocument();
    expect(screen.getByText("Spicy")).toBeInTheDocument();
    expect(screen.queryByText("No label")).not.toBeInTheDocument();
  });

  it("puts the question in screen type with its answers as shapes", async () => {
    renderStage(openQuestionSession());
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Which year was Stonewall?",
      }),
    ).toBeInTheDocument();
    const tiles = await screen.findAllByRole("group", { name: /^Answer / });
    expect(tiles).toHaveLength(4);
    ["A", "B", "C", "D"].forEach((letter, tileIndex) => {
      const tile = tiles[tileIndex];
      if (tile === undefined) throw new Error("Missing tile");
      expect(tile).toHaveAccessibleName(new RegExp(`^Answer ${letter},`));
      expect(within(tile).getByText(letter)).toBeInTheDocument();
    });
  });

  it("marks no answer correct before the reveal", async () => {
    const { unmount } = renderStage(openQuestionSession());
    expect(await screen.findByText("Question 1 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("group", { name: /Correct answer/ }),
    ).toHaveLength(0);
    const tileStates = Array.from(
      document.querySelectorAll("[data-tile-state]"),
    ).map((element) => element.getAttribute("data-tile-state"));
    expect(tileStates).toHaveLength(4);
    expect(tileStates).not.toContain("correct");
    unmount();

    renderStage(revealSession("5"));
    expect(
      await screen.findByRole("group", { name: /^Correct answer, Answer B/ }),
    ).toBeInTheDocument();
    const revealedStates = Array.from(
      document.querySelectorAll("[data-tile-state]"),
    ).map((element) => element.getAttribute("data-tile-state"));
    expect(revealedStates).toEqual(["dimmed", "correct", "dimmed", "dimmed"]);
  });

  it("shows Finishing up between the deadline and the extra-time deadline", async () => {
    renderStage(
      openQuestionSession({
        phaseStartedAt: Date.now() - 21_000,
        deadline: Date.now() - 1_000,
        extraTimeDeadline: Date.now() + 10_000,
      }),
    );
    // The ring shows the note to the room and says it once in its status line.
    expect(
      await screen.findByText("Finishing up", { selector: "[role='status']" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Finishing up", {
        selector: "[aria-hidden='true']",
      }),
    ).toBeInTheDocument();
  });

  it("shows the checking line during review and the vote options without authors", async () => {
    const { unmount } = renderStage(partySession("review"));
    expect(
      await screen.findByText("The hosts are checking the answers"),
    ).toBeInTheDocument();
    unmount();

    renderStage(
      partySession("vote", {
        voteOptions: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          options: [
            { optionId: "option-1", text: "Serving looks" },
            { optionId: "option-2", text: "Brunch forever" },
          ],
          ownOptionId: null,
        },
        answerCount: { count: 4, total: 12 },
      }),
    );
    expect(await screen.findByText("Serving looks")).toBeInTheDocument();
    expect(screen.getByText("Brunch forever")).toBeInTheDocument();
    expect(await screen.findByText(/of 12 voted/)).toBeInTheDocument();
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument();
    expect(screen.queryByText("Rita")).not.toBeInTheDocument();
  });

  it("the review phase shows how many answers are being checked", async () => {
    renderStage(
      partySession("review", { answerCount: { count: 7, total: 12 } }),
    );
    expect(
      await screen.findByText("The hosts are checking 7 answers"),
    ).toBeInTheDocument();
  });

  it("names authors at the reveal only", async () => {
    renderStage(
      partySession("reveal", {
        reveal: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          correct: null,
          answeredCount: 2,
          eligibleCount: 12,
          note: null,
          wasCorrected: false,
          distribution: {
            kind: "votes",
            favouriteOptionId: "option-1",
            entries: [
              {
                optionId: "option-1",
                answerId: "answer-1",
                text: "Serving looks",
                authorName: "Rita",
                isTruth: false,
                voteCount: 3,
                authorPoints: 1250,
              },
              {
                optionId: "option-2",
                answerId: "answer-2",
                text: "Brunch forever",
                authorName: "Nuno",
                isTruth: false,
                voteCount: 1,
                authorPoints: 250,
              },
            ],
          },
        },
      }),
    );
    expect(await screen.findByText("by Rita")).toBeInTheDocument();
    expect(screen.getByText("by Nuno")).toBeInTheDocument();
    expect(screen.getByText("3 votes")).toBeInTheDocument();
    expect(screen.getByText("Hosts' favourite")).toBeInTheDocument();
  });
});

describe("QuizshowScreenStage lobby on the TV", () => {
  it("the teams lobby lists the teams with their member counts and leaves the player chips out", async () => {
    renderStage(
      screenSession({
        playMode: "teams",
        lobby: {
          players: [
            {
              playerId: "player-1",
              screenName: "Rita",
              teamId: "team-1",
              avatarUrl: null,
            },
            {
              playerId: "player-2",
              screenName: "Nuno",
              teamId: "team-2",
              avatarUrl: null,
            },
          ],
          teams: [
            {
              teamId: "team-1",
              name: "Quizzly Bears",
              colorKey: "circle",
              memberCount: 1,
              isHostMade: false,
            },
            {
              teamId: "team-2",
              name: "Spill the Tea",
              colorKey: "triangle",
              memberCount: 1,
              isHostMade: false,
            },
          ],
          playerCount: 2,
        },
      }),
    );
    expect(await screen.findByText("Quizzly Bears")).toBeInTheDocument();
    expect(screen.getByText("Spill the Tea")).toBeInTheDocument();
    expect(screen.getAllByText(/^1 member$/)).toHaveLength(2);
    expect(screen.queryByText("Rita")).not.toBeInTheDocument();
    expect(screen.queryByText("Nuno")).not.toBeInTheDocument();
  });

  it("the solo lobby shows the player chips", async () => {
    renderStage(
      screenSession({
        lobby: {
          players: [
            {
              playerId: "player-1",
              screenName: "Rita",
              teamId: null,
              avatarUrl: null,
            },
          ],
          teams: [],
          playerCount: 1,
        },
      }),
    );
    expect(await screen.findByText("Rita")).toBeInTheDocument();
  });

  it("a fixed canvas keeps the desktop lobby layout on a narrow window", async () => {
    const players = [...Array(20).keys()].map((playerIndex) => ({
      playerId: `player-${playerIndex + 1}`,
      screenName: `Player ${playerIndex + 1}`,
      teamId: null,
      avatarUrl: null,
    }));
    const lobbySession = screenSession({
      lobby: { players, teams: [], playerCount: players.length },
    });
    const realScreen = renderStage(lobbySession);
    expect(await screen.findByText("Player 20")).toBeInTheDocument();
    expect(
      realScreen.container.querySelector("[data-fixed-canvas]"),
    ).toBeNull();
    realScreen.unmount();

    const canvasRender = render(
      <TestProviders>
        <QuizshowScreenStage
          state={clientState(lobbySession)}
          clockOffsetMs={0}
          size="screen"
          isFixedCanvas
        />
      </TestProviders>,
    );
    expect(await screen.findByText("Player 20")).toBeInTheDocument();
    expect(
      canvasRender.container.querySelector('[data-fixed-canvas="true"]'),
    ).not.toBeNull();
    // The canvas holds the 720p lobby: the newest 12 players and "+8 more".
    expect(screen.queryByText("Player 8")).not.toBeInTheDocument();
    expect(screen.getByText("Player 9")).toBeInTheDocument();
    expect(screen.getByText("+8 more")).toBeInTheDocument();
  });

  it("the teams lobby splits three teams or more into two columns", async () => {
    const teamNames = [
      "Quizzly Bears",
      "Spill the Tea",
      "Disco Inferno",
      "Queens of Trivia",
      "Brunch Club",
      "Glitter Squad",
      "Night Owls",
      "Tea Party",
    ];
    const teamsSession = (teamCount: number) =>
      screenSession({
        playMode: "teams",
        lobby: {
          players: [],
          teams: [...Array(teamCount).keys()].map((teamIndex) => ({
            teamId: `team-${teamIndex + 1}`,
            name: teamNames[teamIndex] ?? `Team ${teamIndex + 1}`,
            colorKey: "circle" as const,
            memberCount: 2,
            isHostMade: false,
          })),
          playerCount: teamCount * 2,
        },
      });
    const twoTeamsRender = renderStage(teamsSession(2));
    const secondTeam = await screen.findByText("Spill the Tea");
    expect(secondTeam.closest("ul")).toHaveAttribute("data-columns", "one");
    twoTeamsRender.unmount();

    const threeTeamsRender = renderStage(teamsSession(3));
    const thirdTeam = await screen.findByText("Disco Inferno");
    expect(thirdTeam.closest("ul")).toHaveAttribute("data-columns", "two");
    threeTeamsRender.unmount();

    const eightTeamsRender = renderStage(teamsSession(8));
    const eighthTeam = await screen.findByText("Tea Party");
    expect(eighthTeam.closest("ul")).toHaveAttribute("data-columns", "two");
    expect(screen.queryByText(/more teams?$/)).not.toBeInTheDocument();
    eightTeamsRender.unmount();

    // A tall screen holds eight teams; the earliest fold into a line.
    renderStage(teamsSession(10));
    expect(await screen.findByText("Team 10")).toBeInTheDocument();
    expect(screen.queryByText("Quizzly Bears")).not.toBeInTheDocument();
    expect(screen.queryByText("Spill the Tea")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more teams")).toBeInTheDocument();
  });
});

describe("QuizshowScreenStage answered count", () => {
  /** The row that reads "3 of 12 answered", found by its line. */
  function answeredRow(): HTMLElement | null {
    const line = screen
      .queryAllByText(/of 12 answered/)
      .find((element) => element.tagName === "P");
    return line?.parentElement ?? null;
  }

  it("keeps the count hidden while the question is read out and shows it once answers open", async () => {
    const promptHeading = { level: 1, name: "Which year was Stonewall?" };
    const readView = renderStage(openQuestionSession({ phase: "read" }));
    await screen.findByRole("heading", promptHeading);
    expect(answeredRow()).toHaveAttribute("aria-hidden", "true");
    readView.unmount();

    renderStage(openQuestionSession());
    await screen.findByRole("heading", promptHeading);
    expect(answeredRow()).not.toHaveAttribute("aria-hidden");
  });
});

describe("QuizshowTvPage in demo", () => {
  it("hides the pointer on the code screen after two still seconds", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const view = render(
      <TestProviders initialEntries={[quizshowTvPath()]}>
        <QuizshowTvPage />
      </TestProviders>,
    );
    const root = document.documentElement;
    const attribute = "data-quizshow-pointer-still";
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root).toHaveAttribute(attribute, "true");
    act(() => {
      window.dispatchEvent(new Event("pointermove"));
    });
    expect(root).not.toHaveAttribute(attribute);
    view.unmount();
  });

  it("shows the demo note and a way back to Pulse Live, with no code to enter", async () => {
    render(
      <TestProviders initialEntries={[quizshowTvPath()]}>
        <QuizshowTvPage />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/Pairing a screen needs the live app/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Pulse Live" }),
    ).toHaveAttribute("href", "/play");
    expect(screen.queryByText(/enter this code/)).not.toBeInTheDocument();
  });
});

describe("QuizshowScreenStage party layouts on the TV", () => {
  it("the party reveal shows the six leading entries a tall screen holds and folds the rest into a +N more line", async () => {
    const entries = [...Array(10).keys()].map((entryIndex) => ({
      optionId: `option-${entryIndex + 1}`,
      answerId: `answer-${entryIndex + 1}`,
      text: `Caption number ${entryIndex + 1}`,
      authorName: `Author ${entryIndex + 1}`,
      isTruth: false,
      // The first entry has the fewest votes, so the order differs from the wire order.
      voteCount: entryIndex + 1,
      authorPoints: 0,
    }));
    renderStage(
      partySession("reveal", {
        reveal: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          correct: null,
          answeredCount: 10,
          eligibleCount: 12,
          note: null,
          wasCorrected: false,
          distribution: {
            kind: "votes",
            favouriteOptionId: null,
            entries,
          },
        },
      }),
    );
    expect(await screen.findByText("Caption number 10")).toBeInTheDocument();
    expect(screen.getByText("Caption number 5")).toBeInTheDocument();
    expect(screen.queryByText("Caption number 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Caption number 1")).not.toBeInTheDocument();
    expect(screen.getByText("+4 more")).toBeInTheDocument();
  });

  it("the reveal holds two rows when the practice badge and a two-language prompt share the screen", async () => {
    const entries = [...Array(10).keys()].map((entryIndex) => ({
      optionId: `option-${entryIndex + 1}`,
      answerId: `answer-${entryIndex + 1}`,
      text: `Caption number ${entryIndex + 1}`,
      authorName: `Author ${entryIndex + 1}`,
      isTruth: false,
      voteCount: entryIndex + 1,
      authorPoints: 0,
    }));
    renderStage(
      partySession("reveal", {
        isPractice: true,
        screenLanguage: "both",
        reveal: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          correct: null,
          answeredCount: 10,
          eligibleCount: 12,
          note: null,
          wasCorrected: false,
          distribution: { kind: "votes", favouriteOptionId: null, entries },
        },
      }),
    );
    expect(await screen.findByText("Caption number 10")).toBeInTheDocument();
    expect(screen.getByText("Caption number 7")).toBeInTheDocument();
    expect(screen.queryByText("Caption number 6")).not.toBeInTheDocument();
    expect(screen.getByText("+6 more")).toBeInTheDocument();
  });

  it("the vote grid moves to six columns at 13 captions and to eight at 25", async () => {
    const voteSession = (optionCount: number) =>
      partySession("vote", {
        voteOptions: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          options: [...Array(optionCount).keys()].map((optionIndex) => ({
            optionId: `option-${optionIndex + 1}`,
            text: `Caption number ${optionIndex + 1}`,
          })),
          ownOptionId: null,
        },
      });
    const { unmount } = renderStage(voteSession(12));
    const roomyCaption = await screen.findByText("Caption number 12");
    expect(roomyCaption.closest("ol")).toHaveAttribute("data-density", "roomy");
    unmount();

    const manyRender = renderStage(voteSession(13));
    const manyCaption = await screen.findByText("Caption number 13");
    expect(manyCaption.closest("ol")).toHaveAttribute("data-density", "many");
    manyRender.unmount();

    const busiestManyRender = renderStage(voteSession(24));
    const busiestManyCaption = await screen.findByText("Caption number 24");
    expect(busiestManyCaption.closest("ol")).toHaveAttribute(
      "data-density",
      "many",
    );
    busiestManyRender.unmount();

    renderStage(voteSession(25));
    const packedCaption = await screen.findByText("Caption number 25");
    expect(packedCaption.closest("ol")).toHaveAttribute(
      "data-density",
      "packed",
    );
  });

  it("a long caption keeps its whole text for screen readers and the vote cards take no focus", async () => {
    const longCaption =
      "when the quiz host says one last question and then reads out another twelve";
    renderStage(
      partySession("vote", {
        voteOptions: {
          phaseId: "9",
          questionId: PARTY_QUESTION.questionId,
          options: [{ optionId: "option-1", text: longCaption }],
          ownOptionId: null,
        },
      }),
    );
    const caption = await screen.findByText(longCaption);
    expect(caption.textContent).toBe(longCaption);
    const voteList = caption.closest("ol");
    expect(voteList).not.toBeNull();
    expect(
      voteList?.querySelectorAll("a, button, input, [tabindex]"),
    ).toHaveLength(0);
  });

  it("a vote with 60 captions shows the dense cap and the rest as more", async () => {
    const voteSession = partySession("vote", {
      voteOptions: {
        phaseId: "9",
        questionId: PARTY_QUESTION.questionId,
        options: [...Array(60).keys()].map((optionIndex) => ({
          optionId: `option-${optionIndex + 1}`,
          text: `Caption number ${optionIndex + 1}`,
        })),
        ownOptionId: null,
      },
    });
    const { rerender } = renderStage(voteSession);
    expect(await screen.findByText("Caption number 1")).toBeInTheDocument();
    expect(screen.getByText("Caption number 31")).toBeInTheDocument();
    expect(screen.queryByText("Caption number 32")).not.toBeInTheDocument();
    expect(screen.queryByText("Caption number 60")).not.toBeInTheDocument();
    expect(screen.getByText("+29 more")).toBeInTheDocument();
    const voteList = screen.getByText("Caption number 1").closest("ol");
    expect(voteList).toHaveAttribute("data-density", "packed");
    expect(voteList?.querySelectorAll(":scope > li")).toHaveLength(32);

    // A later frame with the same options keeps the same cards in the same order.
    rerender(
      <TestProviders>
        <QuizshowScreenStage
          state={clientState(voteSession)}
          clockOffsetMs={0}
          size="screen"
        />
      </TestProviders>,
    );
    const captions = [...(voteList?.querySelectorAll(":scope > li") ?? [])].map(
      (row) => row.textContent,
    );
    expect(captions.slice(0, 3)).toEqual([
      "1Caption number 1",
      "2Caption number 2",
      "3Caption number 3",
    ]);
    expect(captions[31]).toBe("+29 more");
  });

  it("the party picture shrinks once the vote opens", () => {
    const pictureQuestion: QuizshowQuestionView = {
      ...PARTY_QUESTION,
      mediaUrl: "https://example.test/picture.jpg",
    };
    const { container, unmount } = renderStage(
      partySession("write", { question: pictureQuestion }),
    );
    expect(container.querySelector("img[data-size]")).toHaveAttribute(
      "data-size",
      "full",
    );
    unmount();

    const voteRender = renderStage(
      partySession("vote", { question: pictureQuestion }),
    );
    expect(
      voteRender.container.querySelector("img[data-size]"),
    ).toHaveAttribute("data-size", "compact");
  });

  it("a picture without prompt text stays centred on its own card", () => {
    const { container } = renderStage(
      partySession("vote", {
        question: {
          ...PARTY_QUESTION,
          prompt: { en: "", pt: "" },
          mediaUrl: "https://example.test/picture.jpg",
        },
      }),
    );
    expect(container.querySelector('[data-has-prompt="false"]')).not.toBeNull();
    expect(container.querySelector("h1")).toBeNull();
  });
});

describe("QuizshowScreenStage", () => {
  it("shows the thank-you screen with the next event", async () => {
    renderStage(
      screenSession({
        cursor: cursorWith({
          phaseId: "40",
          phase: "ended",
          status: "finished",
        }),
        nextEvent: {
          slug: "quiz-night-2",
          title: "Quiz night 2",
          startAt: "2026-11-02T20:00:00.000Z",
        },
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Thanks for playing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^Next in this series: Quiz night 2, /),
    ).toBeInTheDocument();
  });
});

describe("QuizshowScreenStage after the end", () => {
  it("shows the thank-you screen when the end arrives before any session", async () => {
    render(
      <TestProviders>
        <QuizshowScreenStage
          state={{
            role: "screen",
            status: "ended",
            refusalCode: null,
            session: null,
            sessionEnd: {
              sessionId: "session-1",
              status: "abandoned",
              podium: [],
              nextEvent: null,
              hasResults: false,
              isPractice: false,
              giving: null,
            },
            isRemoved: false,
            pendingAnswer: null,
            hasAttached: true,
            retryCause: null,
            rematch: null,
            reactionBurst: null,
            canRejoinAfterRemoval: false,
            nightLog: [],
            ownRanks: { previous: null, current: null },
            ownRankSourceKey: null,
            lastTeamName: null,
          }}
          clockOffsetMs={0}
          size="screen"
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "This game has ended" }),
    ).toBeInTheDocument();
  });
});

describe("QuizshowScreenPage controls", () => {
  it("starts dark and switches to light", async () => {
    renderPage();
    const toggle = await screen.findByRole("button", {
      name: "Use a light screen",
    });
    expect(screenRoot()).toHaveAttribute("data-theme", "dark");
    fireEvent.click(toggle);
    expect(screenRoot()).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("quizshow:screenTheme")).toBe("light");
    expect(
      screen.getByRole("button", { name: "Use a dark screen" }),
    ).toBeInTheDocument();
  });

  it("toggles full screen", async () => {
    const requestFullscreen = vi.fn(() => Promise.resolve());
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    try {
      renderPage();
      fireEvent.click(
        await screen.findByRole("button", { name: "Go full screen" }),
      );
      expect(requestFullscreen).toHaveBeenCalledTimes(1);

      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => document.documentElement,
      });
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      // The toolbar mounts after the game loads, so its subscription can land
      // just after this event; the hook then reads the state on subscribing.
      expect(
        await screen.findByRole("button", { name: "Leave full screen" }),
      ).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(document.documentElement, "requestFullscreen");
      Reflect.deleteProperty(document, "fullscreenElement");
    }
  });

  it("starts locally muted on every load, whatever was stored", async () => {
    window.localStorage.setItem("quizshow:screenMuted", "false");
    renderPage();
    expect(
      await screen.findByRole("button", { name: "Turn sounds on" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mute sounds" }),
    ).not.toBeInTheDocument();
  });

  it("the mute button shows the host mute", async () => {
    sessionOverride.set(clientState(screenSession({ isScreenMuted: true })));
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "Turn sounds on" }),
    );
    expect(
      await screen.findByRole("button", {
        name: "The hosts muted this screen",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mute sounds" }),
    ).not.toBeInTheDocument();
  });

  it("stays silent while a host muted the screen or the local toggle is on", async () => {
    sessionOverride.set(clientState(screenSession({ isScreenMuted: true })));
    renderPage();

    // The screen starts locally muted; this click is also the audio unlock gesture.
    fireEvent.click(
      await screen.findByRole("button", { name: "Turn sounds on" }),
    );
    expect(
      screen.getByRole("button", {
        name: "The hosts muted this screen",
      }),
    ).toBeInTheDocument();
    act(() => {
      sessionOverride.set(
        clientState(revealSession("2", { isScreenMuted: true })),
      );
    });
    expect(cueMock.playQuizshowCue).not.toHaveBeenCalled();

    act(() => {
      sessionOverride.set(
        clientState(
          screenSession({
            cursor: cursorWith({ phaseId: "3", phase: "scores" }),
          }),
        ),
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "Mute sounds" }));
    act(() => {
      sessionOverride.set(clientState(revealSession("4")));
    });
    expect(cueMock.playQuizshowCue).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Turn sounds on" }));
    act(() => {
      sessionOverride.set(
        clientState(
          screenSession({
            cursor: cursorWith({ phaseId: "5", phase: "scores" }),
          }),
        ),
      );
    });
    act(() => {
      sessionOverride.set(clientState(revealSession("6")));
    });
    expect(cueMock.playQuizshowCue.mock.calls).toEqual([["reveal"]]);
  });
});

/** A test-only link that moves the router to another event. */
const NEXT_EVENT_LINK_NAME = "Next event";

describe("QuizshowScreenPage live", () => {
  it("tells an organiser with no open game how to open one", async () => {
    liveMock.isLive = true;
    renderPage("/gatherings/quiz-night/quizshow/screen");
    expect(
      await screen.findByText(
        "No game is open for this event. Open the lobby from the Live game tab",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the event" }),
    ).toHaveAttribute("href", gatheringPath("quiz-night"));
  });

  it("keeps the game on screen after the session leaves the event", async () => {
    liveMock.isLive = true;
    liveMock.setQuiz({
      liveSession: {
        sessionId: "session-live",
        joinCode: "QZ7KP4",
        status: "running",
        playMode: "solo",
        playerCount: 3,
        startedAt: "2026-10-19T20:00:00.000Z",
        isPractice: false,
        isBehindQuiz: false,
      },
      hasQuizFailed: false,
    });
    sessionOverride.set({
      ...clientState(
        screenSession({
          sessionId: "session-live",
          cursor: cursorWith({
            phaseId: "40",
            phase: "ended",
            status: "finished",
          }),
        }),
      ),
      status: "ended",
    });
    renderPage("/gatherings/quiz-night/quizshow/screen");
    expect(
      await screen.findByRole("heading", { name: "Thanks for playing" }),
    ).toBeInTheDocument();

    // The ended session drops out of the quiz GET.
    act(() => {
      liveMock.setQuiz({ liveSession: null, hasQuizFailed: false });
    });
    expect(
      screen.getByRole("heading", { name: "Thanks for playing" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No game is open/)).not.toBeInTheDocument();

    // A background refetch fails while the game is held.
    act(() => {
      liveMock.setQuiz({ liveSession: null, hasQuizFailed: true });
    });
    expect(
      screen.getByRole("heading", { name: "Thanks for playing" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong. Try again"),
    ).not.toBeInTheDocument();
  });

  it("does not carry a game over to another event", async () => {
    liveMock.isLive = true;
    liveMock.setQuiz({
      liveSession: {
        sessionId: "session-live",
        joinCode: "QZ7KP4",
        status: "running",
        playMode: "solo",
        playerCount: 3,
        startedAt: "2026-10-19T20:00:00.000Z",
        isPractice: false,
        isBehindQuiz: false,
      },
      hasQuizFailed: false,
    });
    sessionOverride.set({
      ...clientState(
        screenSession({
          sessionId: "session-live",
          cursor: cursorWith({
            phaseId: "40",
            phase: "ended",
            status: "finished",
          }),
        }),
      ),
      status: "ended",
    });
    render(
      <TestProviders
        initialEntries={["/gatherings/quiz-night/quizshow/screen"]}
      >
        <Link to="/gatherings/drag-brunch/quizshow/screen">
          {NEXT_EVENT_LINK_NAME}
        </Link>
        <Routes>
          <Route
            path={QUIZSHOW_SCREEN_ROUTE}
            element={<QuizshowScreenPage />}
          />
        </Routes>
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Thanks for playing" }),
    ).toBeInTheDocument();

    // Another event, with no session open there.
    act(() => {
      liveMock.setQuiz({ liveSession: null, hasQuizFailed: false });
    });
    fireEvent.click(screen.getByRole("link", { name: NEXT_EVENT_LINK_NAME }));
    expect(
      await screen.findByText(
        "No game is open for this event. Open the lobby from the Live game tab",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Thanks for playing" }),
    ).not.toBeInTheDocument();

    // Errors for the new event show as they would anywhere.
    act(() => {
      liveMock.setQuiz({ liveSession: null, hasQuizFailed: true });
    });
    expect(
      await screen.findByText(
        "We couldn't reach the server. Try again in a moment",
      ),
    ).toBeInTheDocument();
  });

  it("refuses a guest who does not organise the event", async () => {
    liveMock.isLive = true;
    liveMock.isOrganizer = false;
    renderPage("/gatherings/quiz-night/quizshow/screen");
    expect(
      await screen.findByText("Only the event's hosts can do that"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the event" }),
    ).toBeInTheDocument();
  });
});

function wheelSliceOf(
  roundIndex: number,
  title: string,
  overrides: Partial<QuizshowWheelSlice> = {},
): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: title, pt: title },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 8,
    isPlayed: false,
    ...overrides,
  };
}

/** Four drawn slices and one played: the wheel of spin 1 of 4. */
const WHEEL_SLICES: QuizshowWheelSlice[] = [
  wheelSliceOf(1, "Music", { wheelBonus: 500 }),
  wheelSliceOf(2, "Queer history"),
  wheelSliceOf(3, "Eurovision"),
  wheelSliceOf(4, "Ballroom"),
  wheelSliceOf(5, "Drag kings", { isPlayed: true }),
];

function wheelViewWith(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick: "round",
    slices: WHEEL_SLICES,
    spinNumber: 1,
    spinTotal: 4,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function wheelSession(
  phaseId: string,
  wheel: QuizshowWheelView = wheelViewWith(),
): QuizshowScreenState {
  return screenSession({
    cursor: cursorWith({ phaseId, phase: "wheel", roundIndex: 0 }),
    wheel,
  });
}

/** A spin that landed long ago, so the disc draws its stop with no animation. */
function landedSpin(): QuizshowWheelSpin {
  return {
    landedSliceIndex: 1,
    startedAt: Date.now() - 60_000,
    durationMs: QUIZSHOW_LIMITS.wheelSpinMs,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
  };
}

const ROUND_SCORES: QuizshowScores = {
  phaseId: "30",
  scope: "round",
  entries: [
    {
      rank: 1,
      kind: "player",
      entrantId: "player-ana",
      name: "Ana",
      colorKey: null,
      score: 2400,
      previousScore: 1400,
      streak: 0,
    },
    {
      rank: 2,
      kind: "player",
      entrantId: "player-bo",
      name: "Bo",
      colorKey: null,
      score: 1800,
      previousScore: 1200,
      streak: 0,
    },
  ],
  entrantCount: 2,
};

const MUSIC_BONUS: QuizshowWheelBonusView = {
  points: 500,
  pick: "round",
  sliceRoundIndex: 1,
  sliceTitle: { en: "Music", pt: "Música" },
  winners: [
    { entrantId: "player-ana", kind: "player", name: "Ana", colorKey: null },
  ],
};

function leaderboardSession(
  cursorOverrides: Partial<QuizshowCursor>,
  wheelBonus: QuizshowWheelBonusView | null = null,
): QuizshowScreenState {
  return screenSession({
    cursor: cursorWith({
      phaseId: "30",
      phase: "leaderboard",
      ...cursorOverrides,
    }),
    scores: ROUND_SCORES,
    wheelBonus,
  });
}

function renderMotionStage(
  session: QuizshowScreenState,
  options: { isJoinHidden?: boolean; isFixedCanvas?: boolean } = {},
) {
  return render(
    <TestProviders>
      <MotionProvider>
        <QuizshowScreenStage
          state={clientState(session)}
          clockOffsetMs={0}
          size="screen"
          isJoinHidden={options.isJoinHidden}
          isFixedCanvas={options.isFixedCanvas}
        />
      </MotionProvider>
    </TestProviders>,
  );
}

function wheelRootOf(container: HTMLElement): HTMLElement {
  const wheel = container.querySelector<HTMLElement>("[data-quizshow-wheel]");
  if (wheel === null) throw new Error("The wheel is missing.");
  return wheel;
}

describe("QuizshowScreenStage wheel", () => {
  beforeEach(() => {
    // jsdom has no Web Animations; the disc kicks its pointer through this.
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({ cancel: vi.fn() })),
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, "animate");
  });

  it("shows the wheel in the wheel phase", async () => {
    const { container } = renderMotionStage(wheelSession("12"));
    expect(await screen.findByText("Wheel · spin 1 of 4")).toBeInTheDocument();
    expect(wheelRootOf(container)).toBeInTheDocument();
    expect(screen.getByText(/Join at/)).toBeInTheDocument();
    expect(screen.getByText("QZ7KP4")).toBeInTheDocument();
  });

  it("draws the studio's wheel slide at rest", async () => {
    const { container } = renderMotionStage(wheelSession("12"), {
      isJoinHidden: true,
      isFixedCanvas: true,
    });
    expect(await screen.findByText("Wheel · spin 1 of 4")).toBeInTheDocument();
    expect(
      container.querySelector('[data-fixed-canvas="true"]'),
    ).not.toBeNull();
    const spinner = container.querySelector<SVGSVGElement>(
      "[data-quizshow-wheel-spinner]",
    );
    expect(spinner?.style.transform).toBe("rotate(0deg)");
    expect(screen.queryByText(/Join at/)).not.toBeInTheDocument();
    expect(screen.queryByText("QZ7KP4")).not.toBeInTheDocument();
    const choosePanel = container.querySelector<HTMLElement>(
      '[data-panel="choose"]',
    );
    if (choosePanel === null) throw new Error("The choose panel is missing.");
    expect(choosePanel.querySelectorAll("li")).toHaveLength(4);
    ["Music", "Queer history", "Eurovision", "Ballroom"].forEach((title) => {
      expect(within(choosePanel).getByText(title)).toBeInTheDocument();
    });
  });

  it("keeps the wheel mounted between spins", async () => {
    const { container, rerender } = renderMotionStage(wheelSession("12"));
    expect(await screen.findByText("Wheel · spin 1 of 4")).toBeInTheDocument();
    const wheelBefore = wheelRootOf(container);

    rerender(
      <TestProviders>
        <MotionProvider>
          <QuizshowScreenStage
            state={clientState(
              wheelSession(
                "13",
                wheelViewWith({ spinNumber: 2, spin: landedSpin() }),
              ),
            )}
            clockOffsetMs={0}
            size="screen"
          />
        </MotionProvider>
      </TestProviders>,
    );
    expect(await screen.findByText("Wheel · spin 2 of 4")).toBeInTheDocument();
    expect(wheelRootOf(container)).toBe(wheelBefore);
  });

  it("announces the wheel bonus on the leaderboard", async () => {
    renderMotionStage(
      leaderboardSession(
        { roundIndex: 1, roundNumber: 2, roundCount: 5 },
        MUSIC_BONUS,
      ),
    );
    expect(await screen.findByText("Wheel bonus")).toBeInTheDocument();
    expect(screen.getByText("+500 to Ana for Music")).toBeInTheDocument();
  });

  it("numbers the round board by rounds played", async () => {
    renderMotionStage(
      leaderboardSession({ roundIndex: 6, roundNumber: 2, roundCount: 5 }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "After round 2 of 5",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 rounds to go")).toBeInTheDocument();
    expect(screen.queryByText("Wheel bonus")).not.toBeInTheDocument();
  });
});

function renderMotionPage(path = quizshowScreenPath(defaultGatheringSlug)) {
  return render(
    <TestProviders initialEntries={[path]}>
      <MotionProvider>
        <Routes>
          <Route
            path={QUIZSHOW_SCREEN_ROUTE}
            element={<QuizshowScreenPage />}
          />
        </Routes>
      </MotionProvider>
    </TestProviders>,
  );
}

function burstOf(
  counts: QuizshowReactionBurst["counts"],
  sequence: number,
): QuizshowClientState {
  return {
    ...clientState(screenSession()),
    reactionBurst: { counts, sequence },
  };
}

function floaterCount(): number {
  return document.querySelectorAll("[data-reaction-floater]").length;
}

/** The view's session for a TV a remote paired, as the TV page builds it. */
function pairedTvHostSession(): QuizshowHostSession {
  return {
    scope: eventScope(defaultGatheringSlug),
    slug: defaultGatheringSlug,
    eventTitle: null,
    gameTitle: "",
    isAdultsOnly: false,
    backPath: quizshowTvPath(),
    backLabelKey: "quizshow:tv.backToCode",
    backState: QUIZSHOW_TV_LEAVE_STATE,
    noGameKeys: {
      screen: "quizshow:screen.noGame",
      remote: "quizshow:remote.noGame",
    },
    isOrganizer: true,
    isLoading: false,
    sessionId: "session-1",
    errorCode: null,
    hasLoadFailed: false,
    playMode: "solo",
    deviceTicket: "ticket-1",
  };
}

describe("QuizshowScreenPage on the venue TV", () => {
  it("hides the pointer after two still seconds and shows it on movement", () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    const view = renderPage();
    const root = document.documentElement;
    const attribute = "data-quizshow-pointer-still";
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(root).not.toHaveAttribute(attribute);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    // On <html>, so the portaled toolbar, chip and reactions hide it too.
    expect(root).toHaveAttribute(attribute, "true");
    act(() => {
      window.dispatchEvent(new Event("pointermove"));
    });
    expect(root).not.toHaveAttribute(attribute);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root).toHaveAttribute(attribute, "true");
    view.unmount();
    expect(root).not.toHaveAttribute(attribute);
  });

  it("shows Turn on sound until audio runs, and the tap turns the sound on", async () => {
    renderMotionPage();
    const chip = await screen.findByRole("button", { name: "Turn on sound" });
    cueMock.isAudioRunning = true;
    fireEvent.click(chip);
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Turn on sound" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Mute sounds" }),
    ).toBeInTheDocument();
  });

  it("keeps the sound level on this device", async () => {
    const view = renderPage();
    // One button names the level and steps to the next: Quiet, Normal, Venue.
    const levelButton = await screen.findByRole("button", {
      name: "Sound: Normal",
    });
    expect(levelButton).toHaveAccessibleDescription("Press to switch to Venue");
    fireEvent.click(levelButton);
    expect(window.localStorage.getItem("quizshow.soundLevel")).toBe("venue");
    expect(
      screen.getByRole("button", { name: "Sound: Venue" }),
    ).toHaveAccessibleDescription("Press to switch to Quiet");
    // A screen reader hears the new level after the press.
    expect(
      screen
        .getAllByRole("status")
        .some((statusLine) => statusLine.textContent === "Sound: Venue"),
    ).toBe(true);
    view.unmount();

    renderPage();
    const nextButton = await screen.findByRole("button", {
      name: "Sound: Venue",
    });
    fireEvent.click(nextButton);
    expect(window.localStorage.getItem("quizshow.soundLevel")).toBe("quiet");
  });

  it("marks <html> while Turn on sound shows, so the join chip climbs above it", async () => {
    renderMotionPage();
    const chip = await screen.findByRole("button", { name: "Turn on sound" });
    const root = document.documentElement;
    expect(root).toHaveAttribute("data-quizshow-sound-chip", "true");
    cueMock.isAudioRunning = true;
    fireEvent.click(chip);
    await waitFor(() => {
      expect(root).not.toHaveAttribute("data-quizshow-sound-chip");
    });
  });

  it("floats the reactions behind the stage, inside the page", async () => {
    sessionOverride.set(clientState(screenSession()));
    renderPage();
    await screen.findByRole("button", { name: "Hide reactions" });
    act(() => {
      sessionOverride.set(burstOf({ heart: 2 }, 1));
    });
    const floater = document.querySelector("[data-reaction-floater]");
    expect(floater).not.toBeNull();
    // In the page's slot before the main content, so the stage paints over it.
    expect(screenRoot().contains(floater)).toBe(true);
    expect(
      document.getElementById(MAIN_CONTENT_ID)?.contains(floater) ?? false,
    ).toBe(false);
  });

  it("floats at most 30 reactions at once", async () => {
    sessionOverride.set(clientState(screenSession()));
    renderPage();
    await screen.findByRole("button", { name: "Hide reactions" });
    act(() => {
      sessionOverride.set(burstOf({ heart: 40, fire: 5 }, 1));
    });
    expect(floaterCount()).toBe(30);
    expect(
      document.querySelectorAll('[data-reaction-floater="fire"]'),
    ).toHaveLength(5);
    act(() => {
      sessionOverride.set(burstOf({ clap: 3 }, 2));
    });
    expect(floaterCount()).toBe(30);
  });

  it("the Hide reactions switch hides them for this page load", async () => {
    sessionOverride.set(clientState(screenSession()));
    renderMotionPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "Hide reactions" }),
    );
    await waitFor(() => {
      expect(
        document.querySelector("[data-quizshow-reactions]"),
      ).not.toBeInTheDocument();
    });
    act(() => {
      sessionOverride.set(burstOf({ heart: 4 }, 1));
    });
    expect(floaterCount()).toBe(0);
    expect(
      await screen.findByRole("button", { name: "Show reactions" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["TOKEN_EXPIRED", "quizshow_device_ticket_expired"],
    ["quizshow_device_unpaired", "quizshow_device_unpaired"],
    ["quizshow_session_finished", "quizshow_session_finished"],
  ] as const)(
    "a paired TV refused with %s hears %s",
    async (refusalCode, expectedCode) => {
      const onSessionRefused = vi.fn();
      sessionOverride.set({
        ...clientState(screenSession()),
        status: "refused",
        refusalCode,
      });
      render(
        <TestProviders>
          <QuizshowScreenView
            hostSession={pairedTvHostSession()}
            onSessionRefused={onSessionRefused}
          />
        </TestProviders>,
      );
      await waitFor(() => {
        expect(onSessionRefused).toHaveBeenCalledWith(expectedCode);
      });
    },
  );
});

describe("QuizshowTvPage after a live game ends", () => {
  const endedState = (): QuizshowClientState => ({
    ...clientState(screenSession({ cursor: cursorWith({ phase: "ended" }) })),
    status: "ended",
    sessionEnd: {
      sessionId: "session-1",
      status: "finished",
      podium: [],
      nextEvent: null,
      hasResults: false,
      isPractice: true,
      giving: null,
    },
  });

  afterEach(() => {
    window.sessionStorage.clear();
    pairingApiMock.startScreenPairing.mockReset();
    pairingApiMock.claimPairing.mockReset();
  });

  it("tells the TV view once the session ended", async () => {
    const onSessionEnded = vi.fn();
    sessionOverride.set(endedState());
    render(
      <TestProviders>
        <QuizshowScreenView
          hostSession={pairedTvHostSession()}
          onSessionEnded={onSessionEnded}
          aside={<span data-testid="next-code" />}
        />
      </TestProviders>,
    );
    await waitFor(() => {
      expect(onSessionEnded).toHaveBeenCalled();
    });
    expect(screen.getByTestId("next-code")).toBeInTheDocument();
  });

  it("keeps the thank-you card, shows a fresh code beside it and moves to the session that code pairs", async () => {
    liveMock.isLive = true;
    saveDeviceTicket(
      {
        status: "paired",
        deviceTicket: "ticket-1",
        sessionId: "session-1",
        kind: "event",
        eventSlug: defaultGatheringSlug,
        gameId: null,
      },
      "screen",
    );
    sessionOverride.set(endedState());
    pairingApiMock.startScreenPairing.mockResolvedValue({
      pairingId: "0f6c2a8e-3b1d-4c5a-9e7f-1a2b3c4d5e6f",
      pairingCode: "472935",
      pollToken: "p".repeat(43),
      expiresAt: Date.now() + QUIZSHOW_LIMITS.pairingCodeTtlMs,
    });
    pairingApiMock.claimPairing.mockResolvedValue({
      status: "paired",
      deviceTicket: "ticket-2",
      sessionId: "session-2",
      kind: "event",
      eventSlug: defaultGatheringSlug,
      gameId: null,
    });
    render(
      <TestProviders initialEntries={[quizshowTvPath()]}>
        <QuizshowTvPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "Next game? Pair this screen again",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Pairing code 4 7 2 9 3 5"),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          window.sessionStorage.getItem("quizshow.devicePairing.last"),
        ).toBe("session-2");
      },
      { timeout: QUIZSHOW_LIMITS.pairingPollMs * 2 },
    );
    expect(
      window.sessionStorage.getItem("quizshow.deviceTicket.session-1"),
    ).toBeNull();
  });
});

describe("QuizshowScreenView refusal actions", () => {
  function eventHostSession(): QuizshowHostSession {
    return { ...pairedTvHostSession(), deviceTicket: null };
  }

  it("offers Sign in again for a lapsed sign-in, back to this page", async () => {
    sessionOverride.set({
      ...clientState(screenSession()),
      status: "refused",
      refusalCode: "UNAUTHORIZED",
    });
    render(
      <TestProviders
        initialEntries={["/gatherings/quiz-night/quizshow/screen"]}
      >
        <QuizshowScreenView hostSession={eventHostSession()} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Sign in again" }),
    ).toHaveAttribute(
      "href",
      `/auth/sign-in?next=${encodeURIComponent("/gatherings/quiz-night/quizshow/screen")}`,
    );
  });

  it("offers Reload the page for a server fault", async () => {
    sessionOverride.set({
      ...clientState(screenSession()),
      status: "refused",
      refusalCode: "SERVER_ERROR",
    });
    render(
      <TestProviders>
        <QuizshowScreenView hostSession={eventHostSession()} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Reload the page" }),
    ).toBeInTheDocument();
  });

  it("keeps the back control on a paired TV whose sign-in lapsed", async () => {
    sessionOverride.set({
      ...clientState(screenSession()),
      status: "refused",
      refusalCode: "UNAUTHORIZED",
    });
    render(
      <TestProviders>
        <QuizshowScreenView hostSession={pairedTvHostSession()} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Show a new code" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in again" }),
    ).not.toBeInTheDocument();
  });
});
