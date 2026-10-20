import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowPlayerState,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPlayerQuestion } from "./QuizshowPlayerQuestion";

const CURSOR: QuizshowCursor = {
  phaseId: "7",
  status: "running",
  phase: "open",
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

function questionOf(
  overrides: Partial<QuizshowQuestionView> = {},
): QuizshowQuestionView {
  return {
    questionId: "question-1",
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    prompt: {
      en: "Where did the riots start?",
      pt: "Onde comecaram os motins?",
    },
    mediaUrl: null,
    points: 1000,
    timeLimitSeconds: 20,
    options: [
      { id: "a", text: { en: "Stonewall", pt: "Stonewall" } },
      { id: "b", text: { en: "Compton", pt: "Compton" } },
      { id: "c", text: { en: "Castro", pt: "Castro" } },
    ],
    ...overrides,
  };
}

function playerStateOf(
  question: QuizshowQuestionView,
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    joinCode: "QZ7KP4",
    quizTitle: "Quiz",
    languages: "en",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isScreenMuted: false,
    cursor: CURSOR,
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "player",
    lobby: { players: [], teams: [], playerCount: 3 },
    question,
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
  submitAnswer = vi.fn(() => new Promise<never>(() => undefined)),
): QuizshowSessionController {
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
    submitAnswer,
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function renderQuestion(
  controller: QuizshowSessionController,
  question: QuizshowQuestionView,
) {
  const element = (
    <TestProviders>
      <QuizshowPlayerQuestion
        controller={controller}
        question={question}
        language="en"
      />
    </TestProviders>
  );
  const result = render(element);
  return { ...result, element };
}

describe("QuizshowPlayerQuestion", () => {
  it("puts the question on the phone as a heading that takes focus", async () => {
    const question = questionOf();
    const controller = controllerOf(playerStateOf(question));
    const { rerender } = renderQuestion(controller, question);
    const heading = await screen.findByRole("heading", {
      level: 1,
      name: "Where did the riots start?",
    });
    expect(heading).toHaveFocus();

    (document.activeElement as HTMLElement).blur();
    const nextQuestion = questionOf({
      questionId: "question-2",
      prompt: { en: "Who marched first?", pt: "Quem marchou primeiro?" },
    });
    rerender(
      <TestProviders>
        <QuizshowPlayerQuestion
          controller={controllerOf(playerStateOf(nextQuestion))}
          question={nextQuestion}
          language="en"
        />
      </TestProviders>,
    );
    const nextHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Who marched first?",
    });
    expect(nextHeading).toHaveFocus();
  });

  it("names each answer button by letter, shape and text", async () => {
    const question = questionOf();
    renderQuestion(controllerOf(playerStateOf(question)), question);
    expect(
      await screen.findByRole("button", {
        name: "Answer A, Triangle: Stonewall",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Answer B, Diamond: Compton" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Answer C, Circle: Castro" }),
    ).toBeInTheDocument();
  });

  it("locks the answer in and shows it while the ack is pending", async () => {
    const question = questionOf();
    const submitAnswer = vi.fn(() => new Promise<never>(() => undefined));
    renderQuestion(
      controllerOf(playerStateOf(question), submitAnswer),
      question,
    );
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", {
        name: "Answer A, Triangle: Stonewall",
      }),
    );
    expect(submitAnswer).toHaveBeenCalledTimes(1);
    expect(submitAnswer).toHaveBeenCalledWith({
      questionId: "question-1",
      payload: { type: "multiple_choice", optionIndex: 0 },
    });
    await screen.findByText("Locked in");
    for (const tile of screen.getAllByRole("button", { name: /^Answer / })) {
      expect(tile).toHaveAttribute("aria-disabled", "true");
    }
    await user.click(screen.getByRole("button", { name: /Answer B/ }));
    expect(submitAnswer).toHaveBeenCalledTimes(1);
  });

  it("sends a typed answer and a number", async () => {
    const user = userEvent.setup();
    const typedQuestion = questionOf({
      type: "type_answer",
      options: null,
    });
    const typedSubmit = vi.fn(() => new Promise<never>(() => undefined));
    const typed = renderQuestion(
      controllerOf(playerStateOf(typedQuestion), typedSubmit),
      typedQuestion,
    );
    await user.type(await screen.findByLabelText("Your answer"), "  Marsha  ");
    await user.click(screen.getByRole("button", { name: "Send answer" }));
    expect(typedSubmit).toHaveBeenCalledWith({
      questionId: "question-1",
      payload: { type: "type_answer", text: "Marsha" },
    });
    typed.unmount();

    const numberQuestion = questionOf({
      type: "closest_number",
      options: null,
    });
    const numberSubmit = vi.fn(() => new Promise<never>(() => undefined));
    renderQuestion(
      controllerOf(playerStateOf(numberQuestion), numberSubmit),
      numberQuestion,
    );
    const numberInput = await screen.findByLabelText("Your number");
    expect(numberInput).toHaveAttribute("inputmode", "decimal");
    await user.type(numberInput, "1969");
    await user.click(screen.getByRole("button", { name: "Send answer" }));
    expect(numberSubmit).toHaveBeenCalledWith({
      questionId: "question-1",
      payload: { type: "closest_number", value: 1969 },
    });
  });

  it("shows the extra-time countdown to a player with extra time", async () => {
    const question = questionOf();
    const session = playerStateOf(question);
    const base = session.me;
    if (base === null) throw new Error("fixture has a player");
    renderQuestion(
      controllerOf({ ...session, me: { ...base, hasExtraTime: true } }),
      question,
    );
    expect(
      await screen.findByText("Your extra time is on"),
    ).toBeInTheDocument();
  });

  it("tells a late joiner they play from the next question", async () => {
    const question = questionOf();
    renderQuestion(
      controllerOf(playerStateOf(question, { isEligibleForQuestion: false })),
      question,
    );
    await waitFor(() =>
      expect(
        screen.getByText("You're in from the next question"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("button", { name: /^Answer / })).toBeNull();
  });

  it("answers are held while the game is paused", async () => {
    const question = questionOf();
    const submitAnswer = vi.fn(() => new Promise<never>(() => undefined));
    const pausedCursor: QuizshowCursor = {
      ...CURSOR,
      status: "paused",
      pausedRemainingMs: 12_000,
    };
    renderQuestion(
      controllerOf(
        playerStateOf(question, { cursor: pausedCursor }),
        submitAnswer,
      ),
      question,
    );
    const user = userEvent.setup();
    const tiles = await screen.findAllByRole("button", { name: /^Answer / });
    expect(tiles).toHaveLength(3);
    for (const tile of tiles) {
      expect(tile).toHaveAttribute("aria-disabled", "true");
    }
    await user.click(
      screen.getByRole("button", { name: "Answer A, Triangle: Stonewall" }),
    );
    expect(submitAnswer).not.toHaveBeenCalled();
    expect(screen.queryByText("Locked in")).toBeNull();
  });

  it("holds a typed answer once the player's own deadline has passed", async () => {
    const question = questionOf({ type: "type_answer", options: null });
    const submitAnswer = vi.fn(() => new Promise<never>(() => undefined));
    const lateCursor: QuizshowCursor = {
      ...CURSOR,
      phaseStartedAt: Date.now() - 30_000,
      deadline: Date.now() - 5_000,
    };
    renderQuestion(
      controllerOf(
        playerStateOf(question, { cursor: lateCursor }),
        submitAnswer,
      ),
      question,
    );
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Your answer"), "Stonewall");
    const sendButton = screen.getByRole("button", { name: "Send answer" });
    expect(sendButton).toHaveAttribute("aria-disabled", "true");
    await user.click(sendButton);
    expect(submitAnswer).not.toHaveBeenCalled();
  });
});
