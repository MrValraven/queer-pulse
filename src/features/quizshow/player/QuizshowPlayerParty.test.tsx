import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowPhase,
  QuizshowPlayerState,
  QuizshowQuestionView,
  QuizshowReveal,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPartyReveal } from "./QuizshowPartyReveal";
import { QuizshowPlayerParty } from "./QuizshowPlayerParty";

vi.mock("../../economy/ReportListingModal", () => ({
  ReportListingModal: (props: {
    subjectType: string;
    subjectId: string;
    subjectName: string;
  }) => (
    <div
      role="dialog"
      aria-label="Report dialog"
      data-subject-type={props.subjectType}
      data-subject-id={props.subjectId}
    >
      {props.subjectName}
    </div>
  ),
}));

const QUESTION: QuizshowQuestionView = {
  questionId: "question-1",
  roundIndex: 1,
  questionIndex: 0,
  roundKind: "lie_detector",
  type: "prompt",
  prompt: { en: "Who invented the pride flag?", pt: "Quem criou a bandeira?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 60,
  options: null,
};

function cursorIn(phase: QuizshowPhase): QuizshowCursor {
  return {
    phaseId: "11",
    status: "running",
    phase,
    roundIndex: 1,
    questionIndex: 0,
    roundCount: 2,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
  };
}

function stateIn(
  phase: QuizshowPhase,
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
    cursor: cursorIn(phase),
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "player",
    lobby: { players: [], teams: [], playerCount: 4 },
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
  mocks: { submitAnswer?: unknown; send?: unknown } = {},
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
    send: mocks.send ?? vi.fn(),
    submitAnswer: mocks.submitAnswer ?? vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  } as unknown as QuizshowSessionController;
}

function renderParty(controller: QuizshowSessionController) {
  return render(
    <TestProviders>
      <QuizshowPlayerParty
        controller={controller}
        question={QUESTION}
        language="en"
      />
    </TestProviders>,
  );
}

const VOTE_REVEAL: QuizshowReveal = {
  phaseId: "11",
  questionId: "question-1",
  correct: null,
  answeredCount: 3,
  eligibleCount: 4,
  distribution: {
    kind: "votes",
    favouriteOptionId: "option-other",
    entries: [
      {
        optionId: "option-mine",
        answerId: "answer-mine",
        text: "Gilbert Baker maybe",
        authorName: "Sam",
        isTruth: false,
        voteCount: 1,
        authorPoints: 250,
      },
      {
        optionId: "option-other",
        answerId: "answer-other",
        text: "Harvey Milk",
        authorName: "Ro",
        isTruth: false,
        voteCount: 2,
        authorPoints: 500,
      },
      {
        optionId: "option-truth",
        answerId: null,
        text: "Gilbert Baker",
        authorName: null,
        isTruth: true,
        voteCount: 0,
        authorPoints: 0,
      },
    ],
  },
};

describe("QuizshowPlayerParty", () => {
  it("counts the characters left and sends the text", async () => {
    const submitAnswer = vi.fn(() => new Promise<never>(() => undefined));
    renderParty(controllerOf(stateIn("write"), { submitAnswer }));
    const user = userEvent.setup();
    const box = await screen.findByLabelText(/^Your fake answer/);
    await user.type(box, "abc");
    expect(screen.getByText("77 characters left")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(submitAnswer).toHaveBeenCalledWith({
      questionId: "question-1",
      payload: { type: "prompt", text: "abc" },
    });
  });

  it("refuses a fake too close to the truth with the spec's words", async () => {
    const submitAnswer = vi.fn(() =>
      Promise.resolve({
        ok: false,
        code: "quizshow_fake_too_close",
        message: "too close",
      }),
    );
    renderParty(controllerOf(stateIn("write"), { submitAnswer }));
    const user = userEvent.setup();
    const box = await screen.findByLabelText(/^Your fake answer/);
    await user.type(box, "Gilbert Baker");
    await user.click(screen.getByRole("button", { name: "Send" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Too close to the real answer, try another",
    );
    expect(box).toHaveValue("Gilbert Baker");
  });

  it("keeps a player from voting for their own answer", async () => {
    const send = vi.fn(() => new Promise<never>(() => undefined));
    renderParty(
      controllerOf(
        stateIn("vote", {
          voteOptions: {
            phaseId: "11",
            questionId: "question-1",
            ownOptionId: "option-mine",
            options: [
              { optionId: "option-mine", text: "Gilbert Baker maybe" },
              { optionId: "option-other", text: "Harvey Milk" },
            ],
          },
        }),
        { send },
      ),
    );
    const user = userEvent.setup();
    const own = await screen.findByRole("button", {
      name: /Gilbert Baker maybe/,
    });
    expect(own).toHaveAttribute("aria-disabled", "true");
    expect(own).toHaveTextContent("Yours");
    await user.click(own);
    expect(send).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Harvey Milk/ }));
    expect(send).toHaveBeenCalledWith("vote:submit", {
      phaseId: "11",
      questionId: "question-1",
      optionId: "option-other",
    });
  });

  it("reports a revealed answer as quizshow_answer", async () => {
    const state = stateIn("reveal", {
      reveal: VOTE_REVEAL,
      voteOptions: {
        phaseId: "11",
        questionId: "question-1",
        ownOptionId: "option-mine",
        options: [],
      },
    });
    render(
      <TestProviders>
        <QuizshowPartyReveal state={state} language="en" />
      </TestProviders>,
    );
    const user = userEvent.setup();
    expect(
      await screen.findAllByRole("button", { name: /^Report the answer/ }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("button", {
        name: "Report the answer Gilbert Baker maybe",
      }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Report the answer Harvey Milk" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Report dialog" });
    expect(dialog).toHaveAttribute("data-subject-type", "quizshow_answer");
    expect(dialog).toHaveAttribute("data-subject-id", "answer-other");
  });
});

describe("party rounds on the phone through reconnects, pictures and pauses", () => {
  it("the author's own entry has no Report after a reconnect", async () => {
    // A reconnect in reveal replays no vote options, so the reveal's own answer id decides.
    const state = stateIn("reveal", {
      reveal: VOTE_REVEAL,
      voteOptions: null,
      myReveal: {
        phaseId: "11",
        questionId: "question-1",
        hasAnswered: true,
        isCorrect: null,
        correctPositions: null,
        pointsAwarded: 250,
        streakBonus: 0,
        isJokerActive: false,
        streak: 0,
        score: 250,
        teamScore: null,
        rank: 2,
        ownAnswerId: "answer-mine",
      },
    });
    render(
      <TestProviders>
        <QuizshowPartyReveal state={state} language="en" />
      </TestProviders>,
    );
    expect(
      await screen.findAllByRole("button", { name: /^Report the answer/ }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Report the answer Harvey Milk" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Report the answer Gilbert Baker maybe",
      }),
    ).toBeNull();
  });

  it("a caption round shows its picture on the phone", async () => {
    const captionQuestion: QuizshowQuestionView = {
      ...QUESTION,
      roundKind: "caption_this",
      prompt: { en: "", pt: "" },
      mediaUrl: "https://cdn.example.test/caption-picture.jpg",
    };
    const writeState = stateIn("write", { question: captionQuestion });
    const written = render(
      <TestProviders>
        <QuizshowPlayerParty
          controller={controllerOf(writeState)}
          question={captionQuestion}
          language="en"
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Caption This" }),
    ).toBeInTheDocument();
    expect(written.container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.example.test/caption-picture.jpg",
    );
    expect(screen.getByLabelText(/^Your caption/)).toBeInTheDocument();
    written.unmount();

    const revealed = render(
      <TestProviders>
        <QuizshowPartyReveal
          state={stateIn("reveal", {
            question: captionQuestion,
            reveal: VOTE_REVEAL,
          })}
          language="en"
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Caption This" }),
    ).toBeInTheDocument();
    expect(revealed.container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.example.test/caption-picture.jpg",
    );
  });

  it("holds the votes while the game is paused", async () => {
    const send = vi.fn(() => new Promise<never>(() => undefined));
    const pausedState = stateIn("vote", {
      cursor: {
        ...cursorIn("vote"),
        status: "paused",
        pausedRemainingMs: 9_000,
      },
      voteOptions: {
        phaseId: "11",
        questionId: "question-1",
        ownOptionId: "option-mine",
        options: [
          { optionId: "option-mine", text: "Gilbert Baker maybe" },
          { optionId: "option-other", text: "Harvey Milk" },
        ],
      },
    });
    renderParty(controllerOf(pausedState, { send }));
    const user = userEvent.setup();
    const other = await screen.findByRole("button", { name: /Harvey Milk/ });
    expect(other).toHaveAttribute("aria-disabled", "true");
    await user.click(other);
    expect(send).not.toHaveBeenCalled();
  });

  it("shows a late joiner the wait line in the vote", async () => {
    renderParty(
      controllerOf(
        stateIn("vote", {
          isEligibleForQuestion: false,
          voteOptions: {
            phaseId: "11",
            questionId: "question-1",
            ownOptionId: null,
            options: [{ optionId: "option-other", text: "Harvey Milk" }],
          },
        }),
      ),
    );
    expect(
      await screen.findByText("You're in from the next question"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Harvey Milk/ })).toBeNull();
  });

  it("tells the player the hosts are checking during review", async () => {
    renderParty(controllerOf(stateIn("review")));
    expect(
      await screen.findByText("The hosts are checking the answers"),
    ).toBeInTheDocument();
  });
});

describe("party reveal order on the phone", () => {
  it("the party reveal leads with the truth", async () => {
    render(
      <TestProviders>
        <QuizshowPartyReveal
          state={stateIn("reveal", { reveal: VOTE_REVEAL })}
          language="en"
        />
      </TestProviders>,
    );

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    const entryList = screen.getAllByRole("list").at(0);
    if (entryList === undefined) throw new Error("No entry list");
    const entryTexts = within(entryList)
      .getAllByRole("listitem")
      .map((entry) => entry.querySelector("p")?.textContent);
    // The truth first, then the most voted entry, then the rest.
    expect(entryTexts).toEqual([
      "Gilbert Baker",
      "Harvey Milk",
      "Gilbert Baker maybe",
    ]);
  });
});
