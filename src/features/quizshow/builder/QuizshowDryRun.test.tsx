import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import { demoQuizFor } from "../api/quizshowDemoStore";
import {
  createQuizshowDemoController,
  type QuizshowDemoEngine,
  type QuizshowDemoEngineOptions,
} from "../engine/useQuizshowDemoEngine";
import { QUIZSHOW_SIMULATED_PLAYERS } from "../engine/quizshowSimulatedPlayers.data";
import { QuizshowLeaveGame } from "../player/QuizshowLeaveGame";
import { QuizshowPlayerEnd } from "../player/QuizshowPlayerEnd";
import { QuizshowTryOutContext } from "../player/quizshowTryOutContext";
import { createQuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_TICK_MS,
} from "../quizshow.constants";
import {
  draftFromQuiz,
  draftToInput,
  type QuizshowDraft,
} from "./quizshowDraft";
import { QuizshowDryRun } from "./QuizshowDryRun";
import {
  DRY_RUN_ID,
  dryRunQuizOf,
  sliceProblemsOf,
  type QuizshowDryRunSlice,
} from "./quizshowDryRunQuiz";
import { quizshowProblemsFor } from "./quizshowValidation";
import { QuizshowTryItButton } from "./QuizshowTryItButton";
import { useDryRunPlayerController } from "./useDryRunPlayerController";

const socketMock = vi.hoisted(() => ({
  io: vi.fn(),
  constructed: vi.fn(),
}));
/** Every set of options the try-out hands the demo engine, newest last. */
const engineOptionsSpy = vi.hoisted(() => vi.fn());
/** Every distinct engine the try-out has been handed: a restart makes a new one. */
const enginesSeen = vi.hoisted(() => new Set<object>());

vi.mock("socket.io-client", () => ({ io: socketMock.io }));
vi.mock("../realtime/quizshowSocket", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../realtime/quizshowSocket")>();
  class CountedSocketClient extends actual.QuizshowSocketClient {
    constructor(
      ...args: ConstructorParameters<typeof actual.QuizshowSocketClient>
    ) {
      super(...args);
      socketMock.constructed(...args);
    }
  }
  return { ...actual, QuizshowSocketClient: CountedSocketClient };
});
// Live mode: the try-out still plays, since it never asks the demo switch.
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode: false,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));
vi.mock("../engine/useQuizshowDemoEngine", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../engine/useQuizshowDemoEngine")>();
  return {
    ...actual,
    useQuizshowDemoEngine: (
      options: QuizshowDemoEngineOptions,
      isEnabled: boolean,
    ) => {
      engineOptionsSpy(options);
      const engine = actual.useQuizshowDemoEngine(options, isEnabled);
      if (engine !== null) enginesSeen.add(engine);
      return engine;
    },
  };
});
vi.mock("../../../shared/components/ui/RollingNumber", () => ({
  RollingNumber: (props: { value: string }) => <span>{props.value}</span>,
}));

const FIRST_ROUND_TITLE = "Dry run warm up";
const JOIN_GAP_MS = 700;
const LOBBY_SETTLE_MS = 3_000;
/** Every pretend player has joined and the lobby has settled; the round card shows for four seconds after. */
const UNTIL_FIRST_ROUND_MS =
  JOIN_GAP_MS * QUIZSHOW_SIMULATED_PLAYERS.length + LOBBY_SETTLE_MS + 1_500;
const ROUND_CARD_MS = 4_000;
const PICTURE_KEY = "event-cover/quiz-picture.jpg";
const PICTURE_URL = "https://files.example.test/event-cover/quiz-picture.jpg";
/** In demo a fresh pick's key is the picture field's own `blob:` URL, gone once the question closed. */
const REVOKED_FIELD_KEY = "blob:field-preview";
const DRAFT_COPY_URL = "blob:draft-copy";

function dryRunDraft(): QuizshowDraft {
  const draft = draftFromQuiz(demoQuizFor("dry-run-test-event"));
  return {
    ...draft,
    title: "Tuesday trivia",
    rounds: draft.rounds.map((round, roundIndex) =>
      roundIndex === 0
        ? { ...round, title: { en: FIRST_ROUND_TITLE, pt: FIRST_ROUND_TITLE } }
        : round,
    ),
  };
}

/** The draft with a picture on its first question: the key in the question, the resolved URL beside it. */
function draftWithPicture(
  mediaRef: string = PICTURE_KEY,
  mediaUrl: string | null = PICTURE_URL,
): QuizshowDraft {
  const draft = dryRunDraft();
  return {
    ...draft,
    rounds: draft.rounds.map((round, roundIndex) =>
      roundIndex === 0
        ? {
            ...round,
            questions: round.questions.map((draftQuestion, questionIndex) =>
              questionIndex === 0
                ? {
                    ...draftQuestion,
                    question: {
                      ...draftQuestion.question,
                      mediaRef,
                    },
                    mediaUrl,
                  }
                : draftQuestion,
            ),
          }
        : round,
    ),
  };
}

/** The phone's screens link out of the game (Leave the game), so every render has a router. */
function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <I18nProvider>{children}</I18nProvider>
    </MemoryRouter>
  );
}

function renderDryRun(
  onClose: () => void = () => {},
  draft: QuizshowDraft = dryRunDraft(),
  pickedPreviewUrls?: ReadonlyMap<string, string>,
) {
  return render(
    <Providers>
      <QuizshowDryRun
        draft={draft}
        pickedPreviewUrls={pickedPreviewUrls}
        onClose={onClose}
      />
    </Providers>,
  );
}

/** The newest options the try-out gave the demo engine. */
function latestEngineOptions(): QuizshowDemoEngineOptions {
  const calls = engineOptionsSpy.mock.calls;
  const latest = calls[calls.length - 1]?.[0] as
    QuizshowDemoEngineOptions | undefined;
  if (latest === undefined) throw new Error("The demo engine never started");
  return latest;
}

/** The dry run draft with every option of its first question marked right: a structural problem. */
function draftWithStructuralProblem(): QuizshowDraft {
  const draft = dryRunDraft();
  return {
    ...draft,
    rounds: draft.rounds.map((round, roundIndex) =>
      roundIndex === 0
        ? {
            ...round,
            questions: round.questions.map((draftQuestion, questionIndex) =>
              questionIndex === 0
                ? {
                    ...draftQuestion,
                    question: everyOptionCorrect(draftQuestion.question),
                  }
                : draftQuestion,
            ),
          }
        : round,
    ),
  };
}

function everyOptionCorrect(
  question: QuizshowQuestionInput,
): QuizshowQuestionInput {
  if (question.type !== "multiple_choice") {
    throw new Error("The demo quiz opens on a multiple choice question");
  }
  return {
    ...question,
    answer: {
      correctIndexes: question.options.map(
        (_option, optionIndex) => optionIndex,
      ),
    },
  };
}

/** A real demo engine on the dry run draft, for the player role, with nothing ticking it. */
function realPlayerEngine(): QuizshowDemoEngine {
  const options: QuizshowDemoEngineOptions = {
    role: "player",
    eventSlug: DRY_RUN_ID,
    eventTitle: "Tuesday trivia",
    isAutoHost: false,
    hasSelfPlayer: false,
    playMode: "solo",
    suggestedScreenName: "",
    shouldLoop: false,
    selfScreenName: "You",
    quiz: dryRunQuizOf(dryRunDraft(), new Map()),
  };
  return createQuizshowDemoController(() => options).engineApi;
}

function renderTryRound(draft: QuizshowDraft, slice: QuizshowDryRunSlice) {
  return render(
    <Providers>
      <QuizshowTryItButton
        draft={draft}
        pickedPreviewUrls={new Map()}
        problems={sliceProblemsOf(
          quizshowProblemsFor(draftToInput(draft, null), {
            isAdultsEvent: true,
          }),
          draft,
          slice,
        )}
        slice={slice}
      />
    </Providers>,
  );
}

let fetchSpy: MockInstance<typeof globalThis.fetch>;

beforeEach(() => {
  socketMock.io.mockReset();
  socketMock.constructed.mockReset();
  engineOptionsSpy.mockReset();
  enginesSeen.clear();
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
  vi.useRealTimers();
});

describe("QuizshowDryRun", () => {
  it("plays the draft with twelve pretend players and no request", async () => {
    expect(QUIZSHOW_SIMULATED_PLAYERS).toHaveLength(12);
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun();

    expect(
      await screen.findByRole("heading", { name: "Waiting for players" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: FIRST_ROUND_TITLE }),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(JOIN_GAP_MS + 100);
    });
    expect(screen.getByText("Rita")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS);
    });

    expect(
      await screen.findByRole(
        "heading",
        { name: FIRST_ROUND_TITLE },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(socketMock.io).not.toHaveBeenCalled();
    expect(socketMock.constructed).not.toHaveBeenCalled();
  });

  it("shows no join code, QR or join line, since nobody can join a try-out", async () => {
    renderDryRun();

    expect(
      await screen.findByRole("heading", { name: "Waiting for players" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(QUIZSHOW_DEMO_JOIN_CODE)).not.toBeInTheDocument();
    expect(
      document.querySelector("[data-quizshow-join-code]"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "QR code to join the game" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Join at /)).not.toBeInTheDocument();
  });

  it("shows the draft's picture in the try-out", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun(() => {}, draftWithPicture());
    await screen.findByRole("heading", { name: "Waiting for players" });

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS + ROUND_CARD_MS);
    });

    await waitFor(
      () =>
        expect(
          document.querySelector(`img[src="${PICTURE_URL}"]`),
        ).toBeInTheDocument(),
      { timeout: 3_000 },
    );
    expect(
      document.querySelector(`img[src="${PICTURE_KEY}"]`),
    ).not.toBeInTheDocument();
  });

  it("the try-out shows a picture picked before the question was reopened", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun(
      () => {},
      draftWithPicture(REVOKED_FIELD_KEY, null),
      new Map([[REVOKED_FIELD_KEY, DRAFT_COPY_URL]]),
    );
    await screen.findByRole("heading", { name: "Waiting for players" });

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS + ROUND_CARD_MS);
    });

    await waitFor(
      () =>
        expect(
          document.querySelector(`img[src="${DRAFT_COPY_URL}"]`),
        ).toBeInTheDocument(),
      { timeout: 3_000 },
    );
    expect(
      document.querySelector(`img[src="${REVOKED_FIELD_KEY}"]`),
    ).not.toBeInTheDocument();
  });

  it("closes on Close the try-out", async () => {
    const onClose = vi.fn();
    renderDryRun(onClose);

    fireEvent.click(
      await screen.findByRole("button", { name: "Close the try-out" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("the full Try it plays the whole draft on the screen, solo, with You joined in both views", async () => {
    const draft = dryRunDraft();
    renderDryRun(() => {}, draft);

    await screen.findByRole("heading", { name: "Waiting for players" });

    const options = latestEngineOptions();
    expect(options.role).toBe("player");
    expect(options.playMode).toBe("solo");
    expect(options.teamCount).toBeUndefined();
    expect(options.selfScreenName).toBe("You");
    expect(options.quiz?.rounds).toHaveLength(draft.rounds.length);
    expect(
      screen.getByRole("button", { name: "Screen", pressed: true }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-dry-run-phone]")).toBeNull();
  });

  it("Phone shows the player's phone, joined as You, with no way out of the try-out, and keeps the host bar", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    render(
      <Providers>
        <MotionProvider>
          <QuizshowDryRun draft={dryRunDraft()} onClose={() => {}} />
        </MotionProvider>
      </Providers>,
    );
    await screen.findByRole("heading", { name: "Waiting for players" });

    fireEvent.click(screen.getByRole("button", { name: "Phone" }));
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_DEMO_TICK_MS * 2);
    });

    const options = latestEngineOptions();
    expect(options.role).toBe("player");
    expect(options.selfScreenName).toBe("You");
    const phone = await waitFor(
      () => {
        const found = document.querySelector<HTMLElement>(
          "[data-dry-run-phone]",
        );
        expect(found).not.toBeNull();
        return found as HTMLElement;
      },
      { timeout: 3_000 },
    );
    // "Change name" shows only once "You" has a row in the lobby.
    expect(
      await within(phone).findByRole(
        "button",
        { name: "Change name" },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
    expect(within(phone).getAllByText("You").length).toBeGreaterThan(0);
    expect(
      within(phone).queryByRole("button", { name: "Leave the game" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Waiting for players" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close the try-out" }),
    ).toBeInTheDocument();
  });

  it("Teams restarts the try-out in teams play over four teams", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun();
    await screen.findByRole("heading", { name: "Waiting for players" });

    fireEvent.click(screen.getByRole("switch", { name: "Teams" }));

    await waitFor(() => {
      expect(latestEngineOptions().playMode).toBe("teams");
    });
    expect(latestEngineOptions().teamCount).toBe(4);

    // Nothing has started, so the switch is free to flip back.
    expect(screen.getByRole("switch", { name: "Teams" })).toBeEnabled();

    // The screen lobby lists the pretend players by team, four of them.
    act(() => {
      vi.advanceTimersByTime(JOIN_GAP_MS * QUIZSHOW_SIMULATED_PLAYERS.length);
    });
    await waitFor(
      () =>
        expect(
          document.querySelector("ul[data-columns]")?.children,
        ).toHaveLength(4),
      { timeout: 3_000 },
    );
  });

  it("holds the Teams switch, with its reason, once the game has started", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun();
    await screen.findByRole("heading", { name: "Waiting for players" });
    act(() => {
      vi.advanceTimersByTime(JOIN_GAP_MS * QUIZSHOW_SIMULATED_PLAYERS.length);
    });

    fireEvent.click(await screen.findByRole("button", { name: /^Start/ }));

    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Teams" })).toBeDisabled(),
    );
    expect(
      screen.getByText("Teams can only change before the game starts"),
    ).toBeInTheDocument();
  });
});

describe("QuizshowDryRun viewer switch", () => {
  it("switching between Screen and Phone keeps one engine for the whole run", async () => {
    renderDryRun();
    await screen.findByRole("heading", { name: "Waiting for players" });
    const enginesBefore = enginesSeen.size;
    expect(enginesBefore).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Phone" }));
    await waitFor(() =>
      expect(document.querySelector("[data-dry-run-phone]")).not.toBeNull(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Screen" }));
    await screen.findByRole("heading", { name: "Waiting for players" });

    expect(enginesSeen.size).toBe(enginesBefore);
    expect(latestEngineOptions().role).toBe("player");
    expect(latestEngineOptions().selfScreenName).toBe("You");
  });
});

describe("Try this round", () => {
  it("is blocked by a structural problem in the round and opens nothing", () => {
    renderTryRound(draftWithStructuralProblem(), { roundIndex: 0 });

    const button = screen.getByRole("button", { name: "Try this round" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(button);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(engineOptionsSpy).not.toHaveBeenCalled();
  });

  it("plays only that round when the round can play", async () => {
    const draft = dryRunDraft();
    renderTryRound(draft, { roundIndex: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Try this round" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    // The bar's title names the round that plays.
    expect(
      screen.getByRole("heading", { name: "Try round 1" }),
    ).toBeInTheDocument();
    const rounds = latestEngineOptions().quiz?.rounds ?? [];
    expect(rounds).toHaveLength(1);
    expect(rounds[0]?.title.en).toBe(FIRST_ROUND_TITLE);
    expect(rounds[0]?.questions).toHaveLength(
      draft.rounds[0]?.questions.length ?? -1,
    );
  });
});

describe("Try from this question", () => {
  it("titles the try-out with the question and its round", async () => {
    renderTryRound(dryRunDraft(), { roundIndex: 0, fromQuestionIndex: 1 });

    fireEvent.click(
      screen.getByRole("button", { name: "Try from this question" }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Try from question 2 of round 1",
      }),
    ).toBeInTheDocument();
  });
});

describe("Try-out title with a wheel row first", () => {
  it("numbers the round without counting the wheel", async () => {
    const draft = dryRunDraft();
    const firstRound = draft.rounds[0];
    if (!firstRound) throw new Error("The dry run draft has no round");
    const wheelFirst: QuizshowDraft = {
      ...draft,
      rounds: [
        {
          ...firstRound,
          draftKey: "wheel-first",
          kind: "wheel",
          questions: [],
        },
        ...draft.rounds,
      ],
    };
    renderTryRound(wheelFirst, { roundIndex: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Try this round" }));

    expect(
      await screen.findByRole("heading", { name: "Try round 1" }),
    ).toBeInTheDocument();
  });
});

describe("useDryRunPlayerController", () => {
  it("follows the engine's player frames and unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);
    const send = vi.fn(() => Promise.resolve({ ok: true }));
    const sessionStateFor = vi.fn();
    const demoEngine = {
      subscribe,
      subscribeScreen: vi.fn(() => () => {}),
      send,
      sessionStateFor,
      restart: vi.fn(),
    } as unknown as QuizshowDemoEngine;
    // A state for another role leaves the phone's store as it was.
    sessionStateFor.mockReturnValue({ role: "screen" });

    const { result, unmount } = renderHook(() =>
      useDryRunPlayerController(demoEngine),
    );

    expect(sessionStateFor).toHaveBeenCalledWith("player");
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(result.current.isDemo).toBe(true);
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("starts from nothing on a fresh engine and lets the old one go", () => {
    const firstEngine = realPlayerEngine();
    const unsubscribeFirst = vi.fn();
    const subscribeFirst = vi.fn(
      (listener: Parameters<QuizshowDemoEngine["subscribe"]>[0]) => {
        const stop = firstEngine.subscribe(listener);
        return () => {
          unsubscribeFirst();
          stop();
        };
      },
    );
    const secondSubscribe = vi.fn(() => () => {});
    // A state for another role: the store keeps what the reset left.
    const secondEngine = {
      ...firstEngine,
      subscribe: secondSubscribe,
      sessionStateFor: vi.fn(() => ({ role: "screen" })),
    } as unknown as QuizshowDemoEngine;

    const firstEngineWatched: QuizshowDemoEngine = {
      ...firstEngine,
      subscribe: subscribeFirst,
    };
    const { result, rerender } = renderHook(
      ({ demoEngine }: { demoEngine: QuizshowDemoEngine }) =>
        useDryRunPlayerController(demoEngine),
      { initialProps: { demoEngine: firstEngineWatched } },
    );
    expect(result.current.state.session).not.toBeNull();

    rerender({ demoEngine: secondEngine });

    expect(unsubscribeFirst).toHaveBeenCalledTimes(1);
    expect(secondSubscribe).toHaveBeenCalledTimes(1);
    expect(result.current.state.session).toBeNull();
    expect(result.current.state.hasAttached).toBe(false);
  });

  it("holds an answer as pending until the engine acks it", async () => {
    const engine = realPlayerEngine();
    let ackAnswer: (ack: { ok: true }) => void = () => {};
    const send = vi.fn(
      () =>
        new Promise<{ ok: true }>((resolve) => {
          ackAnswer = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useDryRunPlayerController({
        ...engine,
        send,
      }),
    );

    let submitted: Promise<unknown> = Promise.resolve();
    act(() => {
      submitted = result.current.submitAnswer({
        questionId: "question-1",
        payload: { type: "multiple_choice", optionIndex: 0 },
      });
    });
    expect(result.current.state.pendingAnswer?.questionId).toBe("question-1");
    expect(send).toHaveBeenCalledWith(
      "answer:submit",
      expect.objectContaining({ questionId: "question-1" }),
    );

    await act(async () => {
      ackAnswer({ ok: true });
      await submitted;
    });
    expect(result.current.state.pendingAnswer).toBeNull();
  });
});

describe("inside the try-out", () => {
  it("Leave the game shows only outside the try-out", async () => {
    const controller = {
      send: vi.fn(),
    } as unknown as QuizshowSessionController;
    render(
      <Providers>
        <div data-testid="play-page">
          <QuizshowLeaveGame controller={controller} />
        </div>
        <QuizshowTryOutContext.Provider value>
          <div data-testid="try-out">
            <QuizshowLeaveGame controller={controller} />
          </div>
        </QuizshowTryOutContext.Provider>
      </Providers>,
    );

    expect(
      await within(screen.getByTestId("play-page")).findByRole("button", {
        name: "Leave the game",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("try-out")).toBeEmptyDOMElement();
  });

  it("the end screen keeps its back link and Make your own game outside the try-out only", async () => {
    const endedState = createQuizshowClientState("player");
    render(
      <Providers>
        <div data-testid="play-page">
          <QuizshowPlayerEnd state={endedState} kind="game" eventSlug={null} />
        </div>
        <QuizshowTryOutContext.Provider value>
          <div data-testid="try-out">
            <QuizshowPlayerEnd
              state={endedState}
              kind="game"
              eventSlug={null}
            />
          </div>
        </QuizshowTryOutContext.Provider>
      </Providers>,
    );

    const playPage = screen.getByTestId("play-page");
    expect(
      await within(playPage).findByRole("link", { name: "Back to Pulse Live" }),
    ).toBeInTheDocument();
    expect(
      within(playPage).getByText("Make your own game"),
    ).toBeInTheDocument();
    const tryOut = screen.getByTestId("try-out");
    expect(
      within(tryOut).getByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
    expect(
      within(tryOut).queryByRole("link", { name: "Back to Pulse Live" }),
    ).not.toBeInTheDocument();
    expect(
      within(tryOut).queryByText("Make your own game"),
    ).not.toBeInTheDocument();
  });
});
