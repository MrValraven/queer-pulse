import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowHostPlayer,
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowRoundCard,
} from "../../../shared/contracts/quizshow";
import { primeMessageChime } from "../../../shared/lib/messageChime";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemotePage } from "./QuizshowRemotePage";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const sessionMock = vi.hoisted(() => ({
  controller: null as QuizshowSessionController | null,
}));
const eventSessionMock = vi.hoisted(() => ({ hasLoadFailed: false }));

vi.mock("../screen/useQuizshowEventSession", () => ({
  useQuizshowEventSession: () => ({
    scope: { kind: "event", eventSlug: "pride-brunch-jun" },
    slug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    gameTitle: "",
    isAdultsOnly: false,
    backPath: "/gatherings/pride-brunch-jun",
    backLabelKey: "quizshow:screen.backToEvent",
    noGameKeys: {
      screen: "quizshow:screen.noGame",
      remote: "quizshow:remote.noGame",
    },
    isOrganizer: true,
    isLoading: false,
    sessionId: null,
    errorCode: null,
    hasLoadFailed: eventSessionMock.hasLoadFailed,
    playMode: "solo",
  }),
}));
vi.mock("../screen/QuizshowScreenStage", () => ({
  QuizshowScreenStage: (props: {
    state: QuizshowClientState;
    size: string;
    isFixedCanvas?: boolean;
  }) => (
    <div
      data-testid="screen-stage"
      data-size={props.size}
      data-fixed-canvas={String(props.isFixedCanvas ?? false)}
      data-phase={props.state.session?.cursor.phase ?? "none"}
      data-muted={String(props.state.session?.isScreenMuted ?? false)}
    />
  ),
}));
vi.mock("../realtime/useQuizshowSession", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../realtime/useQuizshowSession")>();
  /** The demo session runs for real; a test that sets a controller sees that one instead. */
  function useSessionForTest(
    options: Parameters<typeof actual.useQuizshowSession>[0],
  ): QuizshowSessionController {
    const demoController = actual.useQuizshowSession(options);
    return sessionMock.controller ?? demoController;
  }
  return { ...actual, useQuizshowSession: useSessionForTest };
});
vi.mock("../sound/useQuizshowCues", () => ({ useQuizshowCues: vi.fn() }));
vi.mock("../../../shared/lib/messageChime", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../shared/lib/messageChime")
  >()),
  primeMessageChime: vi.fn(),
}));

const PHASE_ID = "12";
const DEADLINE = 4_102_444_800_000;

const QUIZ_ROUND: QuizshowRoundCard = {
  roundIndex: 0,
  kind: "quiz",
  title: { en: "Warm up", pt: "Aquecimento" },
  contentLabel: "none",
  questionCount: 5,
  isJokerAllowed: true,
  isSpeedBonusOn: true,
};

function partyRound(kind: QuizshowRoundCard["kind"]): QuizshowRoundCard {
  return { ...QUIZ_ROUND, roundIndex: 1, kind };
}

const MULTIPLE_CHOICE_QUESTION: QuizshowHostQuestionView = {
  questionId: "question-1",
  roundIndex: 0,
  questionIndex: 0,
  roundKind: "quiz",
  type: "multiple_choice",
  prompt: { en: "Which flag has pink and blue?", pt: "Que bandeira?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 20,
  options: [
    { id: "option-a", text: { en: "Rainbow", pt: "Arco-íris" } },
    { id: "option-b", text: { en: "Trans", pt: "Trans" } },
  ],
  answerKey: { type: "multiple_choice", correctIndex: 1 },
};

const PROMPT_QUESTION: QuizshowHostQuestionView = {
  ...MULTIPLE_CHOICE_QUESTION,
  roundIndex: 1,
  roundKind: "caption_this",
  type: "prompt",
  options: null,
  answerKey: null,
};

function player(
  overrides: Partial<QuizshowHostPlayer> = {},
): QuizshowHostPlayer {
  return {
    playerId: "player-1",
    screenName: "Rita",
    teamId: null,
    avatarUrl: null,
    isCohostPlayer: false,
    hasExtraTime: false,
    hasUsedJoker: false,
    score: 2400,
    isConnected: true,
    joinedAt: 1_000,
    ...overrides,
  };
}

function hostState(
  cursorOverrides: Partial<QuizshowCursor> = {},
  overrides: Partial<QuizshowHostState> = {},
): QuizshowHostState {
  const cursor: QuizshowCursor = {
    phaseId: PHASE_ID,
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 2,
    phaseStartedAt: DEADLINE - 20_000,
    deadline: DEADLINE,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    ...cursorOverrides,
  };
  return {
    role: "host",
    sessionId: "session-1",
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
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
    isScreenMuted: false,
    cursor,
    rounds: [QUIZ_ROUND],
    round: QUIZ_ROUND,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    lobby: { players: [player()], teams: [], playerCount: 1 },
    question: null,
    answerCount: null,
    voteOptions: null,
    reviewList: null,
    ...overrides,
  };
}

function stubController(state: QuizshowHostState): Mock<SendFunction> {
  const send = vi.fn<SendFunction>(() =>
    Promise.resolve({ ok: true, isNoop: false }),
  );
  sessionMock.controller = {
    state: {
      role: "host",
      status: "attached",
      refusalCode: null,
      session: state,
      sessionEnd: null,
      isRemoved: false,
      pendingAnswer: null,
    },
    clockOffsetMs: 0,
    isDemo: true,
    send: send as unknown as QuizshowSessionController["send"],
    submitAnswer:
      vi.fn() as unknown as QuizshowSessionController["submitAnswer"],
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
  return send;
}

function renderPage() {
  return render(
    <TestProviders
      initialEntries={["/gatherings/pride-brunch-jun/quizshow/remote"]}
    >
      <ReducedMotionContext.Provider value>
        <Routes>
          <Route
            path="/gatherings/:slug/quizshow/remote"
            element={<QuizshowRemotePage />}
          />
        </Routes>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

function reviewState(isFirstHidden: boolean): QuizshowHostState {
  return hostState(
    { phase: "review", deadline: null, roundIndex: 1 },
    {
      round: partyRound("lie_detector"),
      question: { ...PROMPT_QUESTION, roundKind: "lie_detector" },
      reviewList: {
        phaseId: PHASE_ID,
        questionId: "question-1",
        submissions: [
          {
            answerId: "answer-1",
            playerId: "player-1",
            screenName: "Rita",
            text: "it was a lighthouse",
            isHidden: isFirstHidden,
            receivedAt: 2_000,
          },
          {
            answerId: "answer-2",
            playerId: "player-2",
            screenName: "Nuno",
            text: "a disco in Porto",
            isHidden: false,
            receivedAt: 2_100,
          },
        ],
      },
    },
  );
}

function partyRevealState(kind: QuizshowRoundCard["kind"]): QuizshowHostState {
  return hostState(
    { phase: "reveal", deadline: null, roundIndex: 1 },
    {
      round: partyRound(kind),
      question: { ...PROMPT_QUESTION, roundKind: kind },
      reveal: {
        phaseId: PHASE_ID,
        questionId: "question-1",
        correct: null,
        answeredCount: 2,
        eligibleCount: 2,
        distribution: {
          kind: "votes",
          favouriteOptionId: null,
          entries: [
            {
              optionId: "option-1",
              answerId: "answer-1",
              text: "when the wifi drops mid slay",
              authorName: "Rita",
              isTruth: false,
              voteCount: 3,
              authorPoints: 750,
            },
            {
              optionId: "option-2",
              answerId: "answer-2",
              text: "brunch but make it chaos",
              authorName: "Nuno",
              isTruth: false,
              voteCount: 1,
              authorPoints: 250,
            },
          ],
        },
      },
    },
  );
}

async function openPlayers(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /player/ }));
}

describe("QuizshowRemotePage stage and review", () => {
  afterEach(() => {
    sessionMock.controller = null;
    vi.mocked(primeMessageChime).mockClear();
  });

  it("previews the big screen in demo", async () => {
    renderPage();

    const preview = await screen.findByRole("region", {
      name: "Big screen preview",
    });
    const stage = within(preview).getByTestId("screen-stage");
    expect(stage.getAttribute("data-size")).toBe("screen");
    expect(stage.getAttribute("data-fixed-canvas")).toBe("true");
    const canvas = within(preview).getByTestId("remote-preview-canvas");
    expect(canvas.contains(stage)).toBe(true);
    expect(canvas.style.transform).toMatch(/^scale\(/);
    expect(stage.getAttribute("data-phase")).toBe("lobby");
    expect(screen.getByRole("button", { name: "Start game" })).toBeTruthy();
  });

  it("mutes the big screen for everyone from the remote", async () => {
    const user = userEvent.setup();
    renderPage();

    const muteButton = await screen.findByRole("button", {
      name: "Mute the big screen",
    });
    expect(muteButton.getAttribute("aria-pressed")).toBe("false");
    // Audio is primed on mount, before any tap.
    expect(primeMessageChime).toHaveBeenCalled();
    await user.click(muteButton);

    await waitFor(() =>
      expect(muteButton.getAttribute("aria-pressed")).toBe("true"),
    );
    const preview = screen.getByRole("region", { name: "Big screen preview" });
    expect(
      within(preview).getByTestId("screen-stage").getAttribute("data-muted"),
    ).toBe("true");
  });

  it("shows the correct answer to hosts from the first phase", () => {
    stubController(
      hostState({ phase: "read" }, { question: MULTIPLE_CHOICE_QUESTION }),
    );
    renderPage();

    const answerKey = screen.getByRole("region", { name: "Answer" });
    expect(
      within(answerKey).getByRole("group", {
        name: "Correct answer, Answer B, Diamond: Trans",
      }),
    ).toBeTruthy();
    expect(
      within(answerKey).getByRole("group", {
        name: "Answer A, Triangle: Rainbow",
      }),
    ).toBeTruthy();
  });

  it("hides an answer in review and shows the answers", async () => {
    const user = userEvent.setup();
    const send = stubController(reviewState(false));
    renderPage();

    const review = screen.getByRole("region", { name: "Check the answers" });
    const [firstHide] = within(review).getAllByRole("button", { name: "Hide" });
    if (firstHide === undefined) throw new Error("no Hide button");
    await user.click(firstHide);
    expect(send).toHaveBeenCalledWith("host:hideAnswer", {
      answerId: "answer-1",
      isHidden: true,
    });

    await user.click(screen.getByRole("button", { name: "Show answers" }));
    expect(send).toHaveBeenLastCalledWith("host:showAnswers", {
      phaseId: PHASE_ID,
    });
  });

  it("only lets an answer be shown again during review", async () => {
    const user = userEvent.setup();
    const reviewSend = stubController(reviewState(true));
    const reviewView = renderPage();

    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(reviewSend).toHaveBeenCalledWith("host:hideAnswer", {
      answerId: "answer-1",
      isHidden: false,
    });
    reviewView.unmount();

    stubController(
      hostState(
        { phase: "vote", roundIndex: 1 },
        {
          round: partyRound("lie_detector"),
          question: { ...PROMPT_QUESTION, roundKind: "lie_detector" },
          voteOptions: {
            phaseId: PHASE_ID,
            questionId: "question-1",
            ownOptionId: null,
            options: [
              {
                optionId: "option-2",
                text: "a disco in Porto",
                answerId: "answer-2",
                authorName: "Nuno",
                isTruth: false,
              },
              {
                optionId: "option-truth",
                text: "a bookshop",
                answerId: null,
                authorName: null,
                isTruth: true,
              },
            ],
          },
        },
      ),
    );
    renderPage();
    expect(screen.queryByRole("button", { name: "Show" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Hide" })).toHaveLength(1);
  });

  it("picks a favourite at a party reveal", async () => {
    const user = userEvent.setup();
    const send = stubController(partyRevealState("caption_this"));
    const captionView = renderPage();

    const [firstPick] = screen.getAllByRole("button", {
      name: "Pick as favourite",
    });
    if (firstPick === undefined) throw new Error("no Pick as favourite button");
    await user.click(firstPick);
    expect(send).toHaveBeenCalledWith("host:pickFavourite", {
      phaseId: PHASE_ID,
      questionId: "question-1",
      optionId: "option-1",
    });
    captionView.unmount();

    stubController(partyRevealState("lie_detector"));
    renderPage();
    expect(
      screen.queryByRole("button", { name: "Pick as favourite" }),
    ).toBeNull();
  });
});

describe("QuizshowRemotePage players, teams and errors", () => {
  afterEach(() => {
    sessionMock.controller = null;
    eventSessionMock.hasLoadFailed = false;
  });

  it("shows a generic error when the event fails to load", () => {
    eventSessionMock.hasLoadFailed = true;
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Something went wrong. Try again" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to the event" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start game" })).toBeNull();
  });

  it("asks before removing a player", async () => {
    const user = userEvent.setup();
    const send = stubController(hostState());
    renderPage();
    await openPlayers(user);

    await user.click(screen.getByRole("button", { name: "Remove player" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Remove Rita from this game?"),
    ).toBeTruthy();
    expect(send).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Remove player" }),
    );
    expect(send).toHaveBeenCalledWith("host:removePlayer", {
      playerId: "player-1",
    });
  });

  it("renames a team", async () => {
    const user = userEvent.setup();
    const send = stubController(
      hostState(
        {},
        {
          playMode: "teams",
          lobby: {
            players: [player({ teamId: "team-1" })],
            teams: [
              {
                teamId: "team-1",
                name: "Sparkle",
                colorKey: "star",
                memberCount: 1,
                score: 2400,
                hasUsedJoker: false,
              },
            ],
            playerCount: 1,
          },
        },
      ),
    );
    renderPage();
    await openPlayers(user);

    await user.click(screen.getByRole("button", { name: "Rename team" }));
    const nameInput = screen.getByLabelText("Team name");
    await user.clear(nameInput);
    await user.type(nameInput, "Glitter");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(send).toHaveBeenCalledWith("host:renameTeam", {
      teamId: "team-1",
      name: "Glitter",
    });
  });

  it("tags a co-host who is playing", async () => {
    const user = userEvent.setup();
    stubController(
      hostState(
        {},
        {
          lobby: {
            players: [player({ isCohostPlayer: true, isConnected: false })],
            teams: [],
            playerCount: 1,
          },
        },
      ),
    );
    renderPage();
    await openPlayers(user);

    expect(screen.getByText("co-host")).toBeTruthy();
    expect(screen.getByText("Offline")).toBeTruthy();
  });

  it("counts review submissions as written and speaks each phase", () => {
    stubController(
      hostState(
        { phase: "review", deadline: null, roundIndex: 1 },
        {
          round: partyRound("lie_detector"),
          question: { ...PROMPT_QUESTION, roundKind: "lie_detector" },
          answerCount: { count: 3, total: 5 },
        },
      ),
    );
    renderPage();

    expect(screen.getByText("3 of 5 written")).toBeTruthy();
    expect(screen.queryByText("3 of 5 answered")).toBeNull();
    const spokenLines = screen
      .getAllByRole("status")
      .map((statusRegion) => statusRegion.textContent);
    expect(spokenLines).toContain("Checking answers");
  });

  it("shows the paused note and says the pause aloud", () => {
    stubController(
      hostState({
        status: "paused",
        deadline: null,
        pausedRemainingMs: 9_000,
      }),
    );
    renderPage();

    expect(screen.getByText("Paused")).toBeTruthy();
    const spokenLines = screen
      .getAllByRole("status")
      .map((statusRegion) => statusRegion.textContent);
    expect(spokenLines).toContain("Answering, Paused");
  });

  it("holds the countdown at its frozen place when the remote opens during a pause", () => {
    stubController(
      hostState(
        {
          status: "paused",
          deadline: null,
          pausedRemainingMs: 10_000,
        },
        { question: MULTIPLE_CHOICE_QUESTION },
      ),
    );
    const { container } = renderPage();

    // Ten of the question's twenty seconds are left, so the bar sits half full.
    const fill = container.querySelector<HTMLElement>('[style*="scaleX"]');
    expect(fill?.style.transform).toBe("scaleX(0.5)");
  });

  it("explains the restart pause", () => {
    stubController(
      hostState({
        status: "paused",
        deadline: null,
        pausedRemainingMs: 12_000,
        isRestartRecovery: true,
      }),
    );
    renderPage();

    expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy();
    expect(
      screen.getByText(
        "The game paused while our servers restarted. Resume to replay this question from its start",
      ),
    ).toBeTruthy();
  });
});
