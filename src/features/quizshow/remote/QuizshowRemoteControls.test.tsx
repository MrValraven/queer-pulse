import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowRoundCard,
  QuizshowWheelPick,
  QuizshowWheelSpin,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteControls } from "./QuizshowRemoteControls";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";

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
  const roundIndex =
    overrides.roundIndex === undefined ? 0 : overrides.roundIndex;
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
    roundNumber: roundIndex === null ? 0 : roundIndex + 1,
    upNext: null,
    canSpinForNextRound: false,
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
    wheel: null,
    wheelBonus: null,
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Add 15 seconds" }));

    expect(send).toHaveBeenCalledWith("host:addTime", {
      phaseId: PHASE_ID,
      seconds: 15,
      expectedDeadline: DEADLINE,
    });
  });

  it("offers Reveal now only in open and vote, and Skip only where the contract allows it", async () => {
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
      await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");
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
    await awaitCatalog("quizshow");

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
    await awaitCatalog("quizshow");

    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Start game" }));
    expect(send).toHaveBeenCalledWith("host:start", { phaseId: PHASE_ID });
  });
});

const SPIN_MS = 5_500;

function wheelSpinStartedAt(startedAt: number): QuizshowWheelSpin {
  return {
    landedSliceIndex: 0,
    startedAt,
    durationMs: SPIN_MS,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
  };
}

function wheelViewWith(
  spin: QuizshowWheelSpin | null,
  pick: QuizshowWheelPick = "round",
): QuizshowWheelView {
  const slice = {
    contentLabel: "none" as const,
    wheelBonus: 0 as const,
    questionCount: 5,
    isPlayed: false,
    kind: "quiz" as const,
  };
  return {
    wheelRoundIndex: 1,
    pick,
    slices: [
      { ...slice, roundIndex: 2, title: { en: "Music", pt: "Musica" } },
      { ...slice, roundIndex: 3, title: { en: "Movies", pt: "Filmes" } },
    ],
    spinNumber: 1,
    spinTotal: 2,
    spin,
    playingRoundIndex: null,
  };
}

function wheelState(
  wheel: QuizshowWheelView,
  cursorOverrides: Partial<QuizshowCursor> = {},
): QuizshowHostState {
  return {
    ...hostState(
      {
        phase: "wheel",
        roundIndex: 1,
        questionIndex: null,
        roundNumber: 1,
        deadline: null,
        ...cursorOverrides,
      },
      null,
    ),
    wheel,
  };
}

function landedSpin(): QuizshowWheelSpin {
  return wheelSpinStartedAt(Date.now() - SPIN_MS - 10_000);
}

describe("QuizshowRemoteControls wheel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers Spin the wheel before a spin", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(wheelState(wheelViewWith(null)), send);
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("button", { name: "Finish the wheel" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Skip question" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Spin again" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Spin the wheel" }));
    expect(send).toHaveBeenCalledWith("host:spin", { phaseId: PHASE_ID });
  });

  it("blocks the primary while the wheel spins", async () => {
    const send = acting();
    renderControls(
      wheelState(wheelViewWith(wheelSpinStartedAt(Date.now() + 60_000))),
      send,
    );
    await awaitCatalog("quizshow");

    const spinningButton = screen.getByRole("button", {
      name: "The wheel is spinning",
    });
    expect(spinningButton.getAttribute("aria-disabled")).toBe("true");
    expect(screen.queryByRole("button", { name: "Spin again" })).toBeNull();
  });

  it("turns into Start Music at the stop", async () => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    vi.setSystemTime(1_000_000);
    const send = acting();
    renderControls(
      wheelState(wheelViewWith(wheelSpinStartedAt(1_000_000 - SPIN_MS + 500))),
      send,
    );
    await awaitCatalogUnderFakeTimers("quizshow");

    expect(
      screen.getByRole("button", { name: "The wheel is spinning" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Spin again" })).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(screen.getByRole("button", { name: "Start Music" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Spin again" })).toBeTruthy();
  });

  it("spins again after a landing", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(wheelState(wheelViewWith(landedSpin())), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Spin again" }));
    expect(send).toHaveBeenCalledWith("host:spin", { phaseId: PHASE_ID });
    await user.click(screen.getByRole("button", { name: "Start Music" }));
    expect(send).toHaveBeenLastCalledWith("host:next", { phaseId: PHASE_ID });
  });

  it("plays the question after a question pick", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(wheelState(wheelViewWith(landedSpin(), "question")), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Play the question" }));
    expect(send).toHaveBeenCalledWith("host:next", { phaseId: PHASE_ID });
    expect(screen.getByRole("button", { name: "Spin again" })).toBeTruthy();
  });

  it("confirms before finishing the wheel", async () => {
    const user = userEvent.setup();
    const send = acting();
    const roundView = renderControls(wheelState(wheelViewWith(null)), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Finish the wheel" }));
    const roundDialog = await screen.findByRole("dialog");
    expect(within(roundDialog).getByText("Finish the wheel now?")).toBeTruthy();
    expect(
      within(roundDialog).getByText(
        "The rounds still on the wheel are skipped, and the game moves on",
      ),
    ).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
    await user.click(
      within(roundDialog).getByRole("button", { name: "Finish the wheel" }),
    );
    expect(send).toHaveBeenCalledWith("host:finishWheel", {
      phaseId: PHASE_ID,
    });
    roundView.unmount();

    renderControls(wheelState(wheelViewWith(null, "question")), send);
    await awaitCatalog("quizshow");
    await user.click(screen.getByRole("button", { name: "Finish the wheel" }));
    const questionDialog = await screen.findByRole("dialog");
    expect(
      within(questionDialog).getByText(
        "The questions still on the wheel are skipped, and the game moves on",
      ),
    ).toBeTruthy();
  });

  it("closes the finish confirm when the phase leaves the wheel", async () => {
    const user = userEvent.setup();
    const send = acting();
    const view = renderControls(wheelState(wheelViewWith(null)), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Finish the wheel" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();

    const movedOnState = hostState({ phase: "round_intro" });
    view.rerender(controlsTree(movedOnState, send));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(send).not.toHaveBeenCalled();
  });

  it("gives a crowded secondary row the smaller label size", async () => {
    const crowdedView = renderControls(
      wheelState(wheelViewWith(landedSpin())),
      acting(),
    );
    await awaitCatalog("quizshow");
    const crowdedRow = screen
      .getByRole("button", { name: "Finish the wheel" })
      .closest("[data-is-crowded]");
    expect(crowdedRow?.getAttribute("data-is-crowded")).toBe("true");
    crowdedView.unmount();

    renderControls(lobbyState(), acting());
    await awaitCatalog("quizshow");
    const sparseRow = screen
      .getByRole("button", { name: "End game" })
      .closest("[data-is-crowded]");
    expect(sparseRow?.getAttribute("data-is-crowded")).toBe("false");
  });

  it("offers Spin for the next round on an eligible leaderboard", async () => {
    const user = userEvent.setup();
    const send = acting();
    const eligibleView = renderControls(
      hostState({
        phase: "leaderboard",
        deadline: null,
        canSpinForNextRound: true,
      }),
      send,
    );
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: "Spin for the next round" }),
    );
    expect(send).toHaveBeenCalledWith("host:spin", { phaseId: PHASE_ID });
    eligibleView.unmount();

    renderControls(
      hostState({
        phase: "leaderboard",
        deadline: null,
        canSpinForNextRound: false,
      }),
      send,
    );
    await awaitCatalog("quizshow");
    expect(
      screen.queryByRole("button", { name: "Spin for the next round" }),
    ).toBeNull();
  });

  it("blocks wheel controls while paused", async () => {
    const send = acting();
    renderControls(
      wheelState(wheelViewWith(landedSpin()), { status: "paused" }),
      send,
    );
    await awaitCatalog("quizshow");

    for (const name of ["Spin again", "Finish the wheel", "Start Music"]) {
      expect(
        screen.getByRole("button", { name }).getAttribute("aria-disabled"),
        name,
      ).toBe("true");
    }
  });

  it("warns that ending at the first spin keeps no score", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderControls(
      wheelState(wheelViewWith(null), { roundIndex: null, roundNumber: 0 }),
      send,
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "End game" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "No question has scored yet, so the game closes with no results",
      ),
    ).toBeTruthy();
  });
});
