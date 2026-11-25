import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowCursor,
  QuizshowHostPlayer,
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowRoundCard,
} from "../../../shared/contracts/quizshow";
import { createQuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteAdjustPoints } from "./QuizshowRemoteAdjustPoints";
import { QuizshowRemoteRescore } from "./QuizshowRemoteRescore";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const PHASE_ID = "21";

const QUIZ_ROUND: QuizshowRoundCard = {
  roundIndex: 0,
  kind: "quiz",
  title: { en: "Icons", pt: "Ícones" },
  contentLabel: "none",
  questionCount: 5,
  isJokerAllowed: true,
  isSpeedBonusOn: true,
  isWarmUp: false,
  talkSeconds: 0,
};

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

const TYPED_QUESTION: QuizshowHostQuestionView = {
  ...MULTIPLE_CHOICE_QUESTION,
  questionId: "question-2",
  type: "type_answer",
  options: null,
  answerKey: {
    type: "type_answer",
    text: { en: "Lisbon", pt: "Lisboa" },
    acceptedAnswers: [],
  },
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
  const cursor: QuizshowCursor = {
    phaseId: PHASE_ID,
    status: "running",
    phase: "reveal",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 2,
    phaseStartedAt: 1_000,
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
    lobby: {
      players: [player(), player({ playerId: "player-2", screenName: "Nuno" })],
      teams: [],
      playerCount: 2,
    },
    question: MULTIPLE_CHOICE_QUESTION,
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

function controllerFor(state: QuizshowHostState): {
  controller: QuizshowSessionController;
  send: Mock<SendFunction>;
} {
  const send = vi.fn<SendFunction>(() =>
    Promise.resolve({ ok: true, isNoop: false }),
  );
  const controller: QuizshowSessionController = {
    state: {
      ...createQuizshowClientState("host"),
      status: "attached",
      hasAttached: true,
      session: state,
    },
    clockOffsetMs: 0,
    isDemo: true,
    send: send as unknown as QuizshowSessionController["send"],
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
  return { controller, send };
}

function renderRescore(state: QuizshowHostState) {
  const { controller, send } = controllerFor(state);
  render(
    <TestProviders>
      <ReducedMotionContext.Provider value>
        <QuizshowRemoteRescore controller={controller} session={state} />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  return send;
}

function renderAdjust(state: QuizshowHostState) {
  const { controller, send } = controllerFor(state);
  render(
    <TestProviders>
      <ReducedMotionContext.Provider value>
        <QuizshowRemoteAdjustPoints controller={controller} session={state} />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  return send;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuizshowRemoteRescore typed answers", () => {
  it("accepts a group with the normalised text the server sent", async () => {
    const user = userEvent.setup();
    const send = renderRescore(
      hostState(
        {},
        {
          question: TYPED_QUESTION,
          typedAnswers: {
            phaseId: PHASE_ID,
            questionId: "question-2",
            groups: [
              { normalisedText: "lisboa", sampleText: "Lisboa!", count: 3 },
              { normalisedText: "porto", sampleText: "Porto", count: 1 },
            ],
          },
        },
      ),
    );
    await awaitCatalog("quizshow");

    const row = screen.getByText("Lisboa!").closest("li");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("3 people wrote this")).toBeInTheDocument();
    await user.click(
      within(row!).getByRole("button", {
        name: "Accept for everyone who wrote this",
      }),
    );

    expect(send).toHaveBeenCalledWith("host:acceptAnswer", {
      phaseId: PHASE_ID,
      questionId: "question-2",
      normalisedText: "lisboa",
    });
  });

  it("shows no groups from another question's frame", async () => {
    renderRescore(
      hostState(
        {},
        {
          question: TYPED_QUESTION,
          typedAnswers: {
            phaseId: "20",
            questionId: "question-1",
            groups: [{ normalisedText: "x", sampleText: "Old", count: 1 }],
          },
        },
      ),
    );
    await awaitCatalog("quizshow");

    expect(screen.queryByText("Old")).not.toBeInTheDocument();
    expect(
      screen.getByText("No wrong typed answers to accept"),
    ).toBeInTheDocument();
  });

  it("holds only the row whose accept is on its way", async () => {
    const user = userEvent.setup();
    const send = renderRescore(
      hostState(
        {},
        {
          question: TYPED_QUESTION,
          typedAnswers: {
            phaseId: PHASE_ID,
            questionId: "question-2",
            groups: [
              { normalisedText: "lisboa", sampleText: "Lisboa!", count: 3 },
              { normalisedText: "porto", sampleText: "Porto", count: 1 },
            ],
          },
        },
      ),
    );
    send.mockImplementation(() => new Promise<unknown>(() => {}));
    await awaitCatalog("quizshow");

    const acceptIn = (text: string) =>
      within(screen.getByText(text).closest("li")!).getByRole("button", {
        name: "Accept for everyone who wrote this",
      });
    await user.click(acceptIn("Lisboa!"));

    expect(acceptIn("Lisboa!")).toHaveAttribute("aria-disabled", "true");
    expect(acceptIn("Porto")).toHaveAttribute("aria-disabled", "false");
  });
});

describe("QuizshowRemoteRescore change the right answer", () => {
  it("never lets the last wrong option be marked", async () => {
    const user = userEvent.setup();
    const send = renderRescore(hostState());
    await awaitCatalog("quizshow");

    const rainbow = screen.getByRole("button", { name: /Rainbow/ });
    const save = screen.getByRole("button", {
      name: "Save the correct answer",
    });
    expect(rainbow).toHaveAttribute("aria-pressed", "false");
    expect(rainbow).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText("At least one option has to stay wrong"),
    ).toBeInTheDocument();

    await user.click(rainbow);
    await user.click(save);

    expect(rainbow).toHaveAttribute("aria-pressed", "false");
    expect(save).toHaveAttribute("aria-disabled", "true");
    expect(send).not.toHaveBeenCalled();
  });

  it("saves a second right option, sorted, while one option stays wrong", async () => {
    const user = userEvent.setup();
    const question: QuizshowHostQuestionView = {
      ...MULTIPLE_CHOICE_QUESTION,
      options: [
        { id: "option-a", text: { en: "Rainbow", pt: "Arco-íris" } },
        { id: "option-b", text: { en: "Trans", pt: "Trans" } },
        { id: "option-c", text: { en: "Bi", pt: "Bi" } },
      ],
      answerKey: { type: "multiple_choice", correctIndexes: [1] },
    };
    const send = renderRescore(hostState({ phase: "scores" }, { question }));
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("button", { name: "Save the correct answer" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Rainbow/ }));
    expect(screen.getByRole("button", { name: /Bi/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // Two right options change the label to the plural.
    expect(
      screen.queryByRole("button", { name: "Save the correct answer" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Save the correct answers" }),
    );

    expect(send).toHaveBeenCalledWith("host:changeCorrectAnswer", {
      phaseId: PHASE_ID,
      questionId: "question-1",
      answer: { type: "multiple_choice", correctIndexes: [0, 1] },
    });
  });

  it("says why Save waits while no option is marked", async () => {
    const user = userEvent.setup();
    const send = renderRescore(hostState());
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: /Trans/ }));
    const save = screen.getByRole("button", {
      name: "Save the correct answer",
    });
    const hintId = save.getAttribute("aria-describedby");
    expect(hintId).not.toBeNull();
    expect(document.getElementById(hintId!)?.textContent).toBe(
      "Mark at least one option as correct",
    );
    await user.click(save);
    expect(send).not.toHaveBeenCalled();
  });

  it("starts from the corrected key the reveal carries", async () => {
    renderRescore(
      hostState(
        {},
        {
          question: {
            ...MULTIPLE_CHOICE_QUESTION,
            type: "true_false",
            options: null,
            answerKey: { type: "true_false", isTrue: true },
          },
          reveal: {
            phaseId: PHASE_ID,
            questionId: "question-1",
            correct: { type: "true_false", isTrue: false },
            answeredCount: 2,
            eligibleCount: 2,
            distribution: { kind: "true_false", trueCount: 1, falseCount: 1 },
            note: null,
            wasCorrected: true,
          },
        },
      ),
    );
    await awaitCatalog("quizshow");

    expect(screen.getByRole("button", { name: /False/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /True/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

describe("QuizshowRemoteAdjustPoints", () => {
  it("sends a new request id on every tap", async () => {
    const user = userEvent.setup();
    const send = renderAdjust(hostState({ phase: "leaderboard" }));
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: "Give or take points" }),
    );
    await user.click(await screen.findByRole("button", { name: /Players/ }));
    await user.click(screen.getByRole("option", { name: "Nuno" }));
    const give = screen.getByRole("button", { name: "Give points" });
    await user.click(give);
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    await user.click(give);
    await waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    await user.click(screen.getByRole("button", { name: "Take points" }));
    await waitFor(() => expect(send).toHaveBeenCalledTimes(3));

    const payloads = send.mock.calls.map(
      ([, payload]) =>
        payload as { entrantId: string; delta: number; requestId: string },
    );
    expect(send.mock.calls.map(([name]) => name)).toEqual([
      "host:adjustPoints",
      "host:adjustPoints",
      "host:adjustPoints",
    ]);
    expect(payloads.map((payload) => payload.entrantId)).toEqual([
      "player-2",
      "player-2",
      "player-2",
    ]);
    expect(payloads.map((payload) => payload.delta)).toEqual([100, 100, -100]);
    expect(new Set(payloads.map((payload) => payload.requestId)).size).toBe(3);
  });

  it("holds Give and Take until a player is picked", async () => {
    const user = userEvent.setup();
    const send = renderAdjust(hostState({ phase: "scores" }));
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: "Give or take points" }),
    );
    const give = await screen.findByRole("button", { name: "Give points" });
    const take = screen.getByRole("button", { name: "Take points" });
    expect(give).toHaveAttribute("aria-disabled", "true");
    const hintId = give.getAttribute("aria-describedby");
    expect(document.getElementById(hintId!)?.textContent).toBe(
      "Pick a player first",
    );
    expect(take.getAttribute("aria-describedby")).toBe(hintId);
    await user.click(give);

    expect(send).not.toHaveBeenCalled();
  });

  it("asks for a team in teams play", async () => {
    const user = userEvent.setup();
    renderAdjust(
      hostState(
        { phase: "leaderboard" },
        {
          playMode: "teams",
          lobby: {
            players: [player({ teamId: "team-1" })],
            teams: [
              {
                teamId: "team-1",
                name: "The Glitter",
                colorKey: "circle",
                memberCount: 1,
                isHostMade: false,
                score: 1200,
                hasUsedJoker: false,
              },
            ],
            playerCount: 1,
          },
        },
      ),
    );
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: "Give or take points" }),
    );
    expect(await screen.findByText("Pick a team first")).toBeInTheDocument();
  });

  it("holds only the button whose command is on its way", async () => {
    const user = userEvent.setup();
    const send = renderAdjust(hostState({ phase: "leaderboard" }));
    send.mockImplementation(() => new Promise<unknown>(() => {}));
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: "Give or take points" }),
    );
    await user.click(await screen.findByRole("button", { name: /Players/ }));
    await user.click(screen.getByRole("option", { name: "Rita" }));
    const give = screen.getByRole("button", { name: "Give points" });
    const take = screen.getByRole("button", { name: "Take points" });
    await user.click(give);

    expect(give).toHaveAttribute("aria-disabled", "true");
    expect(take).toHaveAttribute("aria-disabled", "false");
  });
});
