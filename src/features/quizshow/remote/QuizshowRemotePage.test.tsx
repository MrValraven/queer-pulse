import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowHostPlayer,
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowRoundCard,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { primeMessageChime } from "../../../shared/lib/messageChime";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  demoDeleteGameResults,
  demoGameLiveSession,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { QuizshowOpenLobbyButton } from "../builder/QuizshowOpenLobbyButton";
import {
  gameScope,
  quizshowScopeRemotePath,
  quizshowScopeScreenPath,
  type QuizshowSessionScope,
} from "../quizshowScope";
import { QuizshowRemotePage } from "./QuizshowRemotePage";
import { awaitCatalog } from "../../../test/awaitCatalog";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const sessionMock = vi.hoisted(() => ({
  controller: null as QuizshowSessionController | null,
}));
const eventSessionMock = vi.hoisted(() => ({
  hasLoadFailed: false,
  /** A paired helper's ticket (C6.5); null on the host's own remote. */
  deviceTicket: null as string | null,
}));

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
    deviceTicket: eventSessionMock.deviceTicket,
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
      data-role={props.state.session?.role ?? "none"}
      data-has-answer-key={String(
        props.state.session?.question != null &&
          "answerKey" in props.state.session.question,
      )}
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
vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: vi.fn(),
}));
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
  isWarmUp: false,
  talkSeconds: 0,
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
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant",
  numberUnit: { en: "", pt: "" },
  readMs: 4000,
  options: [
    { id: "option-a", text: { en: "Rainbow", pt: "Arco-íris" } },
    { id: "option-b", text: { en: "Trans", pt: "Trans" } },
  ],
  answerKey: { type: "multiple_choice", correctIndexes: [1] },
  revealNote: { en: "", pt: "" },
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
    streak: 0,
    isConnected: true,
    disconnectedAt: null,
    joinedAt: 1_000,
    ...overrides,
  };
}

function hostState(
  cursorOverrides: Partial<QuizshowCursor> = {},
  overrides: Partial<QuizshowHostState> = {},
): QuizshowHostState {
  const roundIndex =
    cursorOverrides.roundIndex === undefined ? 0 : cursorOverrides.roundIndex;
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
    roundNumber: roundIndex === null ? 0 : roundIndex + 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
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
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
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
    wheel: null,
    wheelBonus: null,
    reviewList: null,
    pairedDevices: [],
    typedAnswers: null,
    guestPushSentAt: null,
    ...overrides,
  };
}

function stubController(
  state: QuizshowHostState,
  { isDemo = true }: { isDemo?: boolean } = {},
): Mock<SendFunction> {
  const send = vi.fn<SendFunction>(() =>
    Promise.resolve({ ok: true, isNoop: false }),
  );
  sessionMock.controller = {
    state: {
      ...createQuizshowClientState("host"),
      status: "attached",
      hasAttached: true,
      session: state,
    },
    clockOffsetMs: 0,
    isDemo,
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
        note: null,
        wasCorrected: false,
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");

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

  it("shows the correct answer to hosts from the first phase", async () => {
    stubController(
      hostState({ phase: "read" }, { question: MULTIPLE_CHOICE_QUESTION }),
    );
    renderPage();
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
    expect(screen.queryByRole("button", { name: "Show" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Hide" })).toHaveLength(1);
  });

  it("picks a favourite at a party reveal", async () => {
    const user = userEvent.setup();
    const send = stubController(partyRevealState("caption_this"));
    const captionView = renderPage();
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
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

  it("names the unreachable server when the event fails to load", async () => {
    eventSessionMock.hasLoadFailed = true;
    renderPage();
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("heading", {
        name: "We couldn't reach the server. Try again in a moment",
      }),
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
    await awaitCatalog("quizshow");
    await openPlayers(user);

    await user.click(screen.getByRole("button", { name: "Options for Rita" }));
    await user.click(
      screen.getByRole("button", { name: /Remove from the game/ }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Remove Rita from this game?"),
    ).toBeTruthy();
    expect(send).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Remove from the game" }),
    );
    expect(send).toHaveBeenCalledWith("host:removePlayer", {
      playerId: "player-1",
      canRejoin: false,
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
                isHostMade: false,
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
    await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");
    await openPlayers(user);

    expect(screen.getByText("co-host")).toBeTruthy();
    expect(screen.getByText("Offline")).toBeTruthy();
  });

  it("counts review submissions as written and speaks each phase", async () => {
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
    await awaitCatalog("quizshow");

    expect(screen.getByText("3 of 5 written")).toBeTruthy();
    expect(screen.queryByText("3 of 5 answered")).toBeNull();
    const spokenLines = screen
      .getAllByRole("status")
      .map((statusRegion) => statusRegion.textContent);
    expect(spokenLines).toContain("Checking answers");
  });

  it("shows the paused note and says the pause aloud", async () => {
    stubController(
      hostState({
        status: "paused",
        deadline: null,
        pausedRemainingMs: 9_000,
      }),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Paused")).toBeTruthy();
    const spokenLines = screen
      .getAllByRole("status")
      .map((statusRegion) => statusRegion.textContent);
    expect(spokenLines).toContain("Answering, Paused");
  });

  it("holds the countdown at its frozen place when the remote opens during a pause", async () => {
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
    await awaitCatalog("quizshow");

    // Ten of the question's twenty seconds are left, so the bar sits half full.
    const fill = container.querySelector<HTMLElement>('[style*="scaleX"]');
    expect(fill?.style.transform).toBe("scaleX(0.5)");
  });

  it("explains the restart pause", async () => {
    stubController(
      hostState({
        status: "paused",
        deadline: null,
        pausedRemainingMs: 12_000,
        isRestartRecovery: true,
      }),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy();
    expect(
      screen.getByText(
        "The game paused while our servers restarted. Resume to replay this question from its start",
      ),
    ).toBeTruthy();
  });
});

describe("QuizshowRemotePage answer key, preview and badge", () => {
  afterEach(() => {
    sessionMock.controller = null;
    vi.mocked(useScreenWakeLock).mockClear();
  });

  it("marks every correct option in the answer key", async () => {
    stubController(
      hostState(
        { phase: "read" },
        {
          question: {
            ...MULTIPLE_CHOICE_QUESTION,
            options: [
              { id: "option-a", text: { en: "Rainbow", pt: "Arco-íris" } },
              { id: "option-b", text: { en: "Trans", pt: "Trans" } },
              { id: "option-c", text: { en: "Bi", pt: "Bi" } },
            ],
            answerKey: { type: "multiple_choice", correctIndexes: [0, 2] },
          },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    const answerKey = screen.getByRole("region", { name: "Answer" });
    const correctTiles = within(answerKey).getAllByRole("group", {
      name: /^Correct answer, /,
    });
    expect(correctTiles).toHaveLength(2);
    expect(correctTiles[0]?.getAttribute("aria-label")).toMatch(/Rainbow$/);
    expect(correctTiles[1]?.getAttribute("aria-label")).toMatch(/Bi$/);
    expect(
      within(answerKey).getByRole("group", {
        name: "Answer B, Diamond: Trans",
      }),
    ).toBeTruthy();
  });

  it("says a poll has no right answer and shows the fun fact until the reveal", async () => {
    stubController(
      hostState(
        { phase: "read" },
        {
          question: {
            ...MULTIPLE_CHOICE_QUESTION,
            type: "poll",
            answerKey: null,
            revealNote: { en: "Made in 1999", pt: "Criada em 1999" },
          },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    const answerKey = screen.getByRole("region", { name: "Answer" });
    expect(within(answerKey).getByText("Poll: no right answer")).toBeTruthy();
    expect(within(answerKey).getByText("Fun fact")).toBeTruthy();
    const note = within(answerKey).getByText("Made in 1999");
    expect(note.getAttribute("lang")).toBe("en");
    expect(
      within(answerKey).getByText("Only you see this until the reveal"),
    ).toBeTruthy();
    expect(within(answerKey).queryByRole("group")).toBeNull();
  });

  it("previews the big screen live from the host state without host-only fields", async () => {
    stubController(
      hostState({ phase: "read" }, { question: MULTIPLE_CHOICE_QUESTION }),
      { isDemo: false },
    );
    renderPage();
    await awaitCatalog("quizshow");

    const preview = screen.getByRole("region", { name: "Big screen preview" });
    const stage = within(preview).getByTestId("screen-stage");
    expect(stage.getAttribute("data-phase")).toBe("read");
    expect(stage.getAttribute("data-role")).toBe("screen");
    expect(stage.getAttribute("data-has-answer-key")).toBe("false");
  });

  it("shows the practice badge above the title in a practice session", async () => {
    stubController(hostState({}, { isPractice: true }));
    renderPage();
    await awaitCatalog("quizshow");

    const badge = screen.getByText("Practice");
    const title = screen.getByRole("heading", { level: 1 });
    // The badge never shares the title's line, so the header keeps one height at 320px.
    expect(badge.parentElement?.contains(title)).toBe(false);
    expect(
      badge.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("says joining is closed in the lobby once the join is locked", async () => {
    stubController(
      hostState(
        { phase: "lobby", status: "lobby", deadline: null },
        { isJoinLocked: true },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Joining is closed")).toBeTruthy();
    expect(screen.queryByText("Join code QZ7KP4")).toBeNull();
  });

  it("shows the join code in the lobby while joining is open", async () => {
    stubController(
      hostState({ phase: "lobby", status: "lobby", deadline: null }),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Join code QZ7KP4")).toBeTruthy();
    expect(screen.queryByText("Joining is closed")).toBeNull();
  });

  it("holds the answered count back while the question is still being read", async () => {
    stubController(
      hostState(
        { phase: "read" },
        {
          question: PROMPT_QUESTION,
          answerCount: { count: 0, total: 9 },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.queryByText("0 of 9 answered")).toBeNull();
  });

  it("counts the answers once they open", async () => {
    stubController(
      hostState(
        { phase: "open" },
        {
          question: PROMPT_QUESTION,
          answerCount: { count: 2, total: 9 },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("2 of 9 answered")).toBeTruthy();
  });

  it("keeps the phone awake while the session is open", async () => {
    stubController(hostState({ phase: "lobby", status: "lobby" }));
    renderPage();
    await awaitCatalog("quizshow");

    expect(vi.mocked(useScreenWakeLock)).toHaveBeenLastCalledWith(true);
  });

  it("lets the phone sleep once the session has finished", async () => {
    stubController(
      hostState({ phase: "ended", status: "finished", deadline: null }),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(vi.mocked(useScreenWakeLock)).toHaveBeenLastCalledWith(false);
  });
});

function wheelSlice(
  overrides: Partial<QuizshowWheelSlice> = {},
): QuizshowWheelSlice {
  return {
    roundIndex: 2,
    title: { en: "Music", pt: "Musica" },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 4,
    isPlayed: false,
    ...overrides,
  };
}

function wheelView(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 1,
    pick: "round",
    slices: [wheelSlice(), wheelSlice({ roundIndex: 3 })],
    spinNumber: 2,
    spinTotal: 5,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

describe("QuizshowRemotePage round line", () => {
  afterEach(() => {
    sessionMock.controller = null;
  });

  it("reads the wheel pill while the wheel is up", async () => {
    stubController(
      hostState(
        { phase: "wheel", deadline: null, roundIndex: 1 },
        { round: null, wheel: wheelView() },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Wheel · spin 2 of 5")).toBeTruthy();
  });

  it("reads next round on a wheel that is not planned", async () => {
    stubController(
      hostState(
        { phase: "wheel", deadline: null, roundIndex: null },
        { round: null, wheel: wheelView({ wheelRoundIndex: null }) },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Wheel · next round")).toBeTruthy();
  });

  it("counts played rounds in the round line", async () => {
    stubController(
      hostState(
        { roundIndex: 4, roundNumber: 2, roundCount: 5 },
        { question: MULTIPLE_CHOICE_QUESTION },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Round 2 of 5")).toBeTruthy();
    expect(screen.getByText("Question 1 of 5")).toBeTruthy();
  });

  it("reads the category pill and no question count on a wheel question", async () => {
    stubController(
      hostState(
        { roundIndex: 2, roundNumber: 2, roundCount: 5 },
        {
          question: MULTIPLE_CHOICE_QUESTION,
          wheel: wheelView({
            pick: "question",
            spinNumber: 2,
            spinTotal: 9,
            playingRoundIndex: 2,
          }),
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Music · spin 2 of 9")).toBeTruthy();
    expect(screen.queryByText(/Question \d/)).toBeNull();
  });

  it("reads the category pill in the session's screen language", async () => {
    stubController(
      hostState(
        { roundIndex: 2, roundNumber: 2, roundCount: 5 },
        {
          screenLanguage: "pt",
          question: MULTIPLE_CHOICE_QUESTION,
          wheel: wheelView({
            pick: "question",
            spinNumber: 2,
            spinTotal: 9,
            playingRoundIndex: 2,
          }),
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(screen.getByText("Musica · spin 2 of 9")).toBeTruthy();
    expect(screen.queryByText("Music · spin 2 of 9")).toBeNull();
  });
});

describe("QuizshowRemotePage fixing answers and the rematch", () => {
  afterEach(() => {
    sessionMock.controller = null;
  });

  const multipleChoiceReveal: NonNullable<QuizshowHostState["reveal"]> = {
    phaseId: PHASE_ID,
    questionId: "question-1",
    correct: { type: "multiple_choice", correctIndexes: [1] },
    answeredCount: 1,
    eligibleCount: 1,
    distribution: { kind: "options", counts: [0, 1] },
    note: null,
    wasCorrected: false,
  };

  it("shows Fix answers at a quiz reveal and says when the answer was corrected", async () => {
    stubController(
      hostState(
        { phase: "reveal", deadline: null },
        {
          question: MULTIPLE_CHOICE_QUESTION,
          reveal: {
            ...multipleChoiceReveal,
            correct: { type: "multiple_choice", correctIndexes: [0] },
            wasCorrected: true,
          },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("region", { name: "Fix answers" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Answer corrected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Give or take points" }),
    ).toBeInTheDocument();
  });

  it("shows the corrected key from the reveal in the answer key", async () => {
    stubController(
      hostState(
        { phase: "reveal", deadline: null },
        {
          question: MULTIPLE_CHOICE_QUESTION,
          reveal: {
            ...multipleChoiceReveal,
            correct: { type: "multiple_choice", correctIndexes: [0] },
            wasCorrected: true,
          },
        },
      ),
    );
    renderPage();
    await awaitCatalog("quizshow");

    const answerKey = screen.getByRole("region", { name: "Answer" });
    expect(
      within(answerKey).getByRole("group", {
        name: "Correct answer, Answer A, Triangle: Rainbow",
      }),
    ).toBeTruthy();
    expect(
      within(answerKey).getByRole("group", {
        name: "Answer B, Diamond: Trans",
      }),
    ).toBeTruthy();
  });

  it("never shows Fix answers for a poll or a party round", async () => {
    stubController(
      hostState(
        { phase: "reveal", deadline: null },
        {
          question: {
            ...MULTIPLE_CHOICE_QUESTION,
            type: "poll",
            answerKey: null,
          },
          reveal: { ...multipleChoiceReveal, correct: null },
        },
      ),
    );
    const { unmount } = renderPage();
    await awaitCatalog("quizshow");
    expect(screen.queryByRole("region", { name: "Fix answers" })).toBeNull();
    unmount();

    stubController(partyRevealState("caption_this"));
    renderPage();
    await awaitCatalog("quizshow");
    expect(screen.queryByRole("region", { name: "Fix answers" })).toBeNull();
  });

  it("offers the rematch only after a finished game", async () => {
    stubController(
      hostState({
        phase: "ended",
        status: "finished",
        deadline: null,
        roundIndex: null,
        questionIndex: null,
      }),
    );
    const { unmount } = renderPage();
    await awaitCatalog("quizshow");
    expect(
      screen.getByRole("button", { name: "Play again with these players" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Give or take points" }),
    ).toBeNull();
    unmount();

    stubController(
      hostState({
        phase: "ended",
        status: "abandoned",
        deadline: null,
        roundIndex: null,
        questionIndex: null,
      }),
    );
    renderPage();
    await awaitCatalog("quizshow");
    expect(
      screen.queryByRole("button", { name: "Play again with these players" }),
    ).toBeNull();
  });

  it("offers no rematch on a paired helper's remote", async () => {
    eventSessionMock.deviceTicket = "helper-ticket";
    try {
      stubController(
        hostState({
          phase: "ended",
          status: "finished",
          deadline: null,
          roundIndex: null,
          questionIndex: null,
        }),
      );
      renderPage();
      await awaitCatalog("quizshow");
      expect(
        screen.queryByRole("button", {
          name: "Play again with these players",
        }),
      ).toBeNull();
    } finally {
      eventSessionMock.deviceTicket = null;
    }
  });
});

/** Where the router is, and whether it got there by a push or a replace. */
function LocationProbe() {
  const location = useLocation();
  const navigationType = useNavigationType();
  return (
    <output data-testid="location" data-navigation-type={navigationType}>
      {location.pathname}
    </output>
  );
}

describe("QuizshowOpenLobbyButton after a successful open", () => {
  const GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
  const scope = gameScope(GAME_ID);
  const remotePath = quizshowScopeRemotePath(scope);

  afterEach(() => {
    resetQuizshowDemoGames();
  });

  function renderOpenButton(
    afterOpenPath?: (openedScope: QuizshowSessionScope) => string,
  ) {
    demoDeleteGameResults(GAME_ID);
    return render(
      <TestProviders initialEntries={[remotePath]}>
        <ReducedMotionContext.Provider value>
          <QuizshowOpenLobbyButton
            scope={scope}
            rounds={[]}
            isBlocked={false}
            blockedReason={null}
            appearance="studio"
            afterOpenPath={afterOpenPath}
          />
          <LocationProbe />
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
  }

  async function openLobby(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole("button", { name: "Open lobby" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Open lobby" }),
    );
  }

  it("closes the dialog and stays on the remote when the path is the current one", async () => {
    const user = userEvent.setup();
    renderOpenButton(quizshowScopeRemotePath);
    await awaitCatalog("quizshow");

    await openLobby(user);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(demoGameLiveSession(GAME_ID)?.status).toBe("lobby");
    const location = screen.getByTestId("location");
    expect(location.textContent).toBe(remotePath);
    expect(location.getAttribute("data-navigation-type")).toBe("POP");
  });

  it("replaces the history entry when the caller's path is another page", async () => {
    const user = userEvent.setup();
    renderOpenButton(() => "/play/games");
    await awaitCatalog("quizshow");

    await openLobby(user);

    const location = screen.getByTestId("location");
    await waitFor(() => expect(location.textContent).toBe("/play/games"));
    expect(location.getAttribute("data-navigation-type")).toBe("REPLACE");
  });

  it("still goes to the big screen by default", async () => {
    const user = userEvent.setup();
    renderOpenButton();
    await awaitCatalog("quizshow");

    await openLobby(user);

    const location = screen.getByTestId("location");
    await waitFor(() =>
      expect(location.textContent).toBe(quizshowScopeScreenPath(scope)),
    );
    expect(location.getAttribute("data-navigation-type")).toBe("PUSH");
  });
});
