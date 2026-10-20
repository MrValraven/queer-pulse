import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowRoundCard,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteControls } from "./QuizshowRemoteControls";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const PHASE_ID = "7";
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

const LIE_DETECTOR_ROUND: QuizshowRoundCard = {
  ...QUIZ_ROUND,
  kind: "lie_detector",
};

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
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
    ...overrides,
  };
}

function hostState(
  cursorOverrides: Partial<QuizshowCursor> = {},
  round: QuizshowRoundCard | null = QUIZ_ROUND,
): QuizshowHostState {
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
    cursor: cursorWith(cursorOverrides),
    rounds: [QUIZ_ROUND],
    round,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    reviewList: null,
  };
}

function lobbyState(): QuizshowHostState {
  return hostState(
    {
      status: "lobby",
      phase: "lobby",
      roundIndex: null,
      questionIndex: null,
      phaseStartedAt: null,
      deadline: null,
    },
    null,
  );
}

function controllerFor(
  state: QuizshowHostState,
  send: Mock<SendFunction>,
): QuizshowSessionController {
  return {
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
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function controlsTree(state: QuizshowHostState, send: Mock<SendFunction>) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value>
        <QuizshowRemoteControls
          controller={controllerFor(state, send)}
          state={state}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

function renderControls(state: QuizshowHostState, send: Mock<SendFunction>) {
  return render(controlsTree(state, send));
}

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolveWith) => {
    resolve = resolveWith;
  });
  return { promise, resolve };
}

function acting() {
  return vi.fn<SendFunction>(() =>
    Promise.resolve({ ok: true, isNoop: false }),
  );
}

describe("QuizshowRemoteControls", () => {
  it("sends the current phase id with Next so a double tap moves once", async () => {
    const user = userEvent.setup();
    const ack = deferred<unknown>();
    const send = vi.fn<SendFunction>(() => ack.promise);
    renderControls(hostState({ phase: "read" }), send);

    const nextButton = screen.getByRole("button", { name: "Next" });
    await user.click(nextButton);
    await user.click(nextButton);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("host:next", { phaseId: PHASE_ID });
    expect(nextButton.getAttribute("aria-disabled")).toBe("true");

    await act(async () => {
      ack.resolve({ ok: true, isNoop: false });
      await ack.promise;
    });
    expect(nextButton.getAttribute("aria-disabled")).toBe("false");
  });

  it("treats a noop ack as success and a stale ack as already moved", async () => {
    const user = userEvent.setup();
    const send = vi
      .fn<SendFunction>()
      .mockResolvedValueOnce({ ok: true, isNoop: true })
      .mockResolvedValueOnce({
        ok: false,
        code: "quizshow_stale_phase",
        message: "stale",
        cursor: cursorWith({ phaseId: "8" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        code: "quizshow_command_not_allowed",
        message: "not allowed",
      });
    renderControls(hostState({ phase: "open" }), send);
    const nextButton = screen.getByRole("button", { name: "Next" });

    await user.click(nextButton);
    for (const statusRegion of screen.getAllByRole("status")) {
      expect(statusRegion.textContent).toBe("");
    }

    await user.click(nextButton);
    expect(screen.queryByText("The game moved on")).toBeNull();
    for (const statusRegion of screen.getAllByRole("status")) {
      expect(statusRegion.textContent).toBe("");
    }

    await user.click(nextButton);
    expect(await screen.findByText("That can't happen right now")).toBeTruthy();
    expect(send).toHaveBeenCalledTimes(3);
  });

  it("adds 15 seconds against the deadline it shows", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(hostState({ phase: "open", deadline: DEADLINE }), send);

    await user.click(screen.getByRole("button", { name: "Add 15 seconds" }));

    expect(send).toHaveBeenCalledWith("host:addTime", {
      phaseId: PHASE_ID,
      seconds: 15,
      expectedDeadline: DEADLINE,
    });
  });

  it("offers Reveal now only in open and vote, and Skip only where the contract allows it", () => {
    const cases: Array<{
      state: QuizshowHostState;
      hasReveal: boolean;
      hasSkip: boolean;
    }> = [
      { state: lobbyState(), hasReveal: false, hasSkip: false },
      {
        state: hostState({ phase: "round_intro", deadline: null }),
        hasReveal: false,
        hasSkip: false,
      },
      { state: hostState({ phase: "read" }), hasReveal: false, hasSkip: true },
      { state: hostState({ phase: "open" }), hasReveal: true, hasSkip: true },
      {
        state: hostState({ phase: "write" }, LIE_DETECTOR_ROUND),
        hasReveal: false,
        hasSkip: true,
      },
      {
        state: hostState(
          { phase: "review", deadline: null },
          LIE_DETECTOR_ROUND,
        ),
        hasReveal: false,
        hasSkip: true,
      },
      {
        state: hostState({ phase: "vote" }, LIE_DETECTOR_ROUND),
        hasReveal: true,
        hasSkip: true,
      },
      {
        state: hostState({ phase: "reveal", deadline: null }),
        hasReveal: false,
        hasSkip: true,
      },
      {
        state: hostState(
          { phase: "reveal", deadline: null },
          LIE_DETECTOR_ROUND,
        ),
        hasReveal: false,
        hasSkip: false,
      },
      {
        state: hostState({ phase: "scores", deadline: null }),
        hasReveal: false,
        hasSkip: false,
      },
      {
        state: hostState({ phase: "leaderboard", deadline: null }),
        hasReveal: false,
        hasSkip: false,
      },
      {
        state: hostState({ phase: "podium", deadline: null }, null),
        hasReveal: false,
        hasSkip: false,
      },
    ];
    for (const testCase of cases) {
      const view = renderControls(testCase.state, acting());
      const phase = testCase.state.cursor.phase;
      expect(
        screen.queryByRole("button", { name: "Reveal now" }) !== null,
        `Reveal now in ${phase}`,
      ).toBe(testCase.hasReveal);
      expect(
        screen.queryByRole("button", { name: "Skip question" }) !== null,
        `Skip question in ${phase}`,
      ).toBe(testCase.hasSkip);
      view.unmount();
    }
  });

  it("pauses and resumes", async () => {
    const user = userEvent.setup();
    const send = acting();
    const runningView = renderControls(hostState({ phase: "open" }), send);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(send).toHaveBeenLastCalledWith("host:pause", { phaseId: PHASE_ID });
    expect(screen.queryByRole("button", { name: "Resume" })).toBeNull();
    runningView.unmount();

    renderControls(
      hostState({
        phase: "open",
        status: "paused",
        deadline: null,
        pausedRemainingMs: 9_000,
      }),
      send,
    );
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Next" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(send).toHaveBeenLastCalledWith("host:resume", { phaseId: PHASE_ID });
  });

  it("asks before ending, with the lobby's own words", async () => {
    const user = userEvent.setup();
    const send = acting();
    const lobbyView = renderControls(lobbyState(), send);

    await user.click(screen.getByRole("button", { name: "End game" }));
    const lobbyDialog = await screen.findByRole("dialog");
    expect(
      within(lobbyDialog).getByText(
        "Nobody has played yet, so the game closes with no results",
      ),
    ).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
    await user.click(
      within(lobbyDialog).getByRole("button", { name: "End game" }),
    );
    expect(send).toHaveBeenCalledWith("host:end", { phaseId: PHASE_ID });
    lobbyView.unmount();

    // A later question, so an earlier one has scored.
    renderControls(hostState({ phase: "open", questionIndex: 1 }), send);
    await user.click(screen.getByRole("button", { name: "End game" }));
    const runningDialog = await screen.findByRole("dialog");
    expect(
      within(runningDialog).getByText(
        "Everyone goes to the podium with the scores so far",
      ),
    ).toBeTruthy();
  });
});

describe("QuizshowRemoteControls end confirm and pause", () => {
  it("the end confirm speaks to the podium", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(
      hostState(
        {
          phase: "podium",
          roundIndex: null,
          questionIndex: null,
          deadline: null,
        },
        null,
      ),
      send,
    );

    await user.click(screen.getByRole("button", { name: "End game" }));
    const podiumDialog = await screen.findByRole("dialog");
    expect(
      within(podiumDialog).getByText(
        "The game closes here and keeps these results",
      ),
    ).toBeTruthy();
    expect(
      within(podiumDialog).queryByText(
        "Everyone goes to the podium with the scores so far",
      ),
    ).toBeNull();
    await user.click(
      within(podiumDialog).getByRole("button", { name: "End game" }),
    );
    expect(send).toHaveBeenCalledWith("host:end", { phaseId: PHASE_ID });
  });

  it("the end confirm says nothing is scored before the first reveal", async () => {
    const user = userEvent.setup();
    const send = acting();
    const firstQuestionView = renderControls(
      hostState({ phase: "open", roundIndex: 0, questionIndex: 0 }),
      send,
    );

    await user.click(screen.getByRole("button", { name: "End game" }));
    const unscoredDialog = await screen.findByRole("dialog");
    expect(
      within(unscoredDialog).getByText(
        "No question has scored yet, so the game closes with no results",
      ),
    ).toBeTruthy();
    firstQuestionView.unmount();

    renderControls(
      hostState({
        phase: "reveal",
        roundIndex: 0,
        questionIndex: 0,
        deadline: null,
      }),
      send,
    );
    await user.click(screen.getByRole("button", { name: "End game" }));
    const revealDialog = await screen.findByRole("dialog");
    expect(
      within(revealDialog).getByText(
        "Everyone goes to the podium with the scores so far",
      ),
    ).toBeTruthy();
  });

  it("pause and resume keep focus", async () => {
    const user = userEvent.setup();
    const send = acting();
    const runningState = hostState({ phase: "open" });
    const pausedState = hostState({
      phase: "open",
      status: "paused",
      deadline: null,
      pausedRemainingMs: 9_000,
    });
    const view = renderControls(runningState, send);

    const pauseButton = screen.getByRole("button", { name: "Pause" });
    await user.click(pauseButton);
    expect(document.activeElement).toBe(pauseButton);

    view.rerender(controlsTree(pausedState, send));
    const resumeButton = screen.getByRole("button", { name: "Resume" });
    expect(resumeButton).toBe(pauseButton);
    expect(document.activeElement).toBe(resumeButton);
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();

    await user.click(resumeButton);
    expect(send).toHaveBeenLastCalledWith("host:resume", { phaseId: PHASE_ID });
    view.rerender(controlsTree(runningState, send));
    expect(screen.getByRole("button", { name: "Pause" })).toBe(pauseButton);
    expect(document.activeElement).toBe(pauseButton);
  });

  it("says Start game in the lobby", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(lobbyState(), send);

    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Start game" }));
    expect(send).toHaveBeenCalledWith("host:start", { phaseId: PHASE_ID });
  });
});
