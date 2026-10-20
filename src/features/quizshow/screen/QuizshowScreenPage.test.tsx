import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Link, Route, Routes } from "react-router-dom";
import QRCode from "qrcode";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowLiveSessionRef,
  QuizshowQuestionView,
  QuizshowRoundCard,
  QuizshowScreenState,
} from "../../../shared/contracts/quizshow";
import { defaultGatheringSlug } from "../../gatherings/data";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { QUIZSHOW_DEMO_TICK_MS } from "../quizshow.constants";
import { QUIZSHOW_SCREEN_ROUTE, quizshowScreenPath } from "../quizshowPaths";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { QuizshowScreenPage } from "./QuizshowScreenPage";
import { QuizshowScreenStage } from "./QuizshowScreenStage";

const cueMock = vi.hoisted(() => ({ playQuizshowCue: vi.fn() }));
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
vi.mock("../sound/quizshowCues", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../sound/quizshowCues")>()),
  playQuizshowCue: cueMock.playQuizshowCue,
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
      slug: string,
      options: Parameters<typeof actual.useQuizshowQuiz>[1],
    ) => {
      const result = actual.useQuizshowQuiz(slug, options);
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
  },
  {
    roundIndex: 1,
    kind: "caption_this",
    title: { en: "Captions", pt: "Legendas" },
    contentLabel: "spicy",
    questionCount: 2,
    isJokerAllowed: false,
    isSpeedBonusOn: false,
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
    joinCode: "QZ7KP4",
    quizTitle: "Pride quiz",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
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
      correct: { type: "multiple_choice", correctIndex: 1 },
      answeredCount: 10,
      eligibleCount: 12,
      distribution: { kind: "options", counts: [2, 6, 1, 1] },
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
    expect(await screen.findByText("Finishing up")).toBeInTheDocument();
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
            },
            {
              teamId: "team-2",
              name: "Spill the Tea",
              colorKey: "triangle",
              memberCount: 1,
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

  it("the teams lobby splits more than four teams into two columns", async () => {
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
          teams: teamNames.slice(0, teamCount).map((name, teamIndex) => ({
            teamId: `team-${teamIndex + 1}`,
            name,
            colorKey: "circle" as const,
            memberCount: 2,
          })),
          playerCount: teamCount * 2,
        },
      });
    const fourTeamsRender = renderStage(teamsSession(4));
    const fourthTeam = await screen.findByText("Queens of Trivia");
    expect(fourthTeam.closest("ul")).toHaveAttribute("data-columns", "one");
    fourTeamsRender.unmount();

    renderStage(teamsSession(8));
    const eighthTeam = await screen.findByText("Tea Party");
    expect(eighthTeam.closest("ul")).toHaveAttribute("data-columns", "two");
  });
});

describe("QuizshowScreenStage party layouts on the TV", () => {
  it("the party reveal shows the eight leading entries and folds the rest into a +N more line", async () => {
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
          distribution: {
            kind: "votes",
            favouriteOptionId: null,
            entries,
          },
        },
      }),
    );
    expect(await screen.findByText("Caption number 10")).toBeInTheDocument();
    expect(screen.getByText("Caption number 3")).toBeInTheDocument();
    expect(screen.queryByText("Caption number 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Caption number 1")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
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
            },
            isRemoved: false,
            pendingAnswer: null,
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
    const toggle = await screen.findByRole("button", { name: "Light screen" });
    expect(screenRoot()).toHaveAttribute("data-theme", "dark");
    fireEvent.click(toggle);
    expect(screenRoot()).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("quizshow:screenTheme")).toBe("light");
    expect(
      screen.getByRole("button", { name: "Dark screen" }),
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
        await screen.findByRole("button", { name: "Full screen" }),
      );
      expect(requestFullscreen).toHaveBeenCalledTimes(1);

      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => document.documentElement,
      });
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(
        screen.getByRole("button", { name: "Leave full screen" }),
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
      await screen.findByText("Something went wrong. Try again"),
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
