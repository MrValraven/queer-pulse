import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type { UseQueryResult } from "@tanstack/react-query";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_LIMITS,
  type QuizshowJoinPreview,
  type QuizshowMe,
  type QuizshowPlayerState,
  type QuizshowRoundCard,
  type QuizshowSessionEnd,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowCodeForm } from "./QuizshowCodeForm";
import { QuizshowPlayPage } from "./QuizshowPlayPage";
import { awaitCatalog } from "../../../test/awaitCatalog";

const fakeSession = vi.hoisted(() => ({
  initialState: null as QuizshowClientState | null,
  send: vi.fn(),
  restartDemo: vi.fn(),
  /** Every render that built a live session (signed out builds none). */
  sessionHookCalls: 0,
}));

/** Signed out: the real signed-out auth state. Checking: the session is still
 *  loading. Lagging user: demo's commit where `loggedIn` is set and `user` not yet. */
const authOverride = vi.hoisted(() => ({
  isSignedOut: false,
  isChecking: false,
  isUserLagging: false,
}));

vi.mock("../../../app/providers/authContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../app/providers/authContext")>();
  return {
    ...actual,
    useAuth: () => {
      const value = actual.useAuth();
      if (authOverride.isChecking) {
        return { ...value, checking: true, loggedIn: false, user: null };
      }
      if (authOverride.isUserLagging) {
        return { ...value, loggedIn: true, user: null };
      }
      if (!authOverride.isSignedOut) return value;
      return {
        ...value,
        loggedIn: false,
        user: null,
        status: null,
        role: null,
        staffRoles: [],
      };
    },
  };
});

/** The join preview the signed-out card reads; null leaves the real hook in place. */
const previewOverride = vi.hoisted(() => ({
  result: null as {
    data: unknown;
    error: unknown;
    isError: boolean;
    isFetching: boolean;
  } | null,
  requestedCodes: [] as Array<string | null>,
  refetch: vi.fn(),
}));

vi.mock("../api/useQuizshowPublic", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useQuizshowPublic")>();
  return {
    ...actual,
    useQuizshowJoinPreview: (code: string | null) => {
      previewOverride.requestedCodes.push(code);
      if (previewOverride.result === null) {
        return actual.useQuizshowJoinPreview(code);
      }
      return {
        ...previewOverride.result,
        refetch: previewOverride.refetch,
      } as unknown as UseQueryResult<QuizshowJoinPreview>;
    },
  };
});

/** Every value the page passed to the wake lock, in render order. */
const wakeLockSpy = vi.hoisted(() => ({ calls: [] as boolean[] }));

vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: (isActive: boolean) => {
    wakeLockSpy.calls.push(isActive);
  },
}));

vi.mock("../realtime/useQuizshowSession", async () => {
  const { useState } = await import("react");
  return {
    useQuizshowSession: () => {
      fakeSession.sessionHookCalls += 1;
      const [state, setState] = useState(
        fakeSession.initialState as QuizshowClientState,
      );
      return {
        state,
        clockOffsetMs: 0,
        isDemo: true,
        send: (name: string, payload: unknown) => {
          fakeSession.send(name, payload);
          const session = state.session;
          if (name === "joker:play" && session?.role === "player") {
            setState({
              ...state,
              session: {
                ...session,
                me: {
                  ...(session.me as QuizshowMe),
                  hasUsedJoker: true,
                  jokerRoundIndex: 0,
                },
              },
            });
          }
          // The server drops the player's row at once; the ack stays pending,
          // so the page holds what shows between the leave and the navigation.
          if (name === "lobby:leave" && session?.role === "player") {
            setState({ ...state, session: { ...session, me: null } });
            return new Promise(() => undefined);
          }
          return Promise.resolve({ ok: true });
        },
        submitAnswer: vi.fn(),
        demoScreenState: null,
        restartDemo: fakeSession.restartDemo,
      };
    },
  };
});

const joinSpy = vi.hoisted(() => ({
  calls: [] as string[],
  shouldFail: false,
}));

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return {
    ...actual,
    demoJoin: (body: { code: string }) => {
      joinSpy.calls.push(body.code);
      if (joinSpy.shouldFail) throw new Error("offline");
      return actual.demoJoin(body);
    },
  };
});

vi.mock("./QuizshowPlayerStage", () => ({
  QuizshowPlayerStage: () => <p data-testid="player-stage" />,
}));

const ME: QuizshowMe = {
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
};

function sessionOf(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: "demo-quizshow-session",
    answerCount: null,
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
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
    cursor: {
      phaseId: "1",
      status: "lobby",
      phase: "lobby",
      roundIndex: null,
      questionIndex: null,
      roundCount: 1,
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      roundNumber: 0,
      upNext: null,
      canSpinForNextRound: false,
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
    },
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    wheel: null,
    wheelBonus: null,
    role: "player",
    lobby: { teams: [], playerCount: 6 },
    question: null,
    voteOptions: null,
    me: null,
    suggestedScreenName: "Sam",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
    ...overrides,
  };
}

function stateOf(
  session: QuizshowPlayerState,
  overrides: Partial<QuizshowClientState> = {},
): QuizshowClientState {
  return {
    ...createQuizshowClientState("player"),
    status: "attached",
    hasAttached: true,
    session,
    ...overrides,
  };
}

function CodeProbe() {
  const { code } = useParams();
  return <p>{`Joined ${code}`}</p>;
}

/** Renders the play page at `path` and waits for its copy to load. */
async function renderPlay(path: string): Promise<void> {
  render(
    <TestProviders initialEntries={[path]}>
      <ReducedMotionContext.Provider value={true}>
        <Routes>
          <Route path="/play" element={<QuizshowPlayPage />} />
          <Route path="/play/:code" element={<QuizshowPlayPage />} />
        </Routes>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
}

beforeEach(() => {
  fakeSession.send.mockReset();
  fakeSession.restartDemo.mockReset();
  fakeSession.sessionHookCalls = 0;
  authOverride.isSignedOut = false;
  authOverride.isChecking = false;
  authOverride.isUserLagging = false;
  previewOverride.result = null;
  previewOverride.requestedCodes = [];
  previewOverride.refetch.mockReset();
  joinSpy.calls = [];
  joinSpy.shouldFail = false;
  wakeLockSpy.calls = [];
  fakeSession.initialState = stateOf(sessionOf());
});

/** The component's own alert. TestProviders also mounts the toast regions,
 *  and the assertive one carries the alert role while it is empty. */
function findComponentAlert(): Promise<HTMLElement> {
  return waitFor(() => {
    const [alert, ...otherAlerts] = screen
      .getAllByRole("alert")
      .filter((element) => element.closest("[data-toast-region]") === null);
    expect(otherAlerts).toHaveLength(0);
    if (alert === undefined) {
      throw new Error("The component rendered no alert of its own");
    }
    return alert;
  });
}

describe("QuizshowPlayPage", () => {
  it("normalises a typed code and joins at the sixth character", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders initialEntries={["/play"]}>
        <ReducedMotionContext.Provider value={true}>
          <Routes>
            <Route path="/play" element={<QuizshowPlayPage />} />
            <Route path="/play/:code" element={<CodeProbe />} />
          </Routes>
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
    await awaitCatalog("quizshow");

    // No Join tap: the sixth character submits (item 32).
    await user.type(screen.getByLabelText("Game code"), "qz7-kp4");

    expect(await screen.findByText("Joined QZ7KP4")).toBeInTheDocument();
  });

  it("explains a code that finds no game", async () => {
    const user = userEvent.setup();
    await renderPlay("/play");

    // Six characters, but 0 is never in a join code.
    await user.type(screen.getByLabelText("Game code"), "QZ7KP0");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(await findComponentAlert()).toHaveTextContent(
      "We couldn't find a game with that code",
    );
    expect(screen.getByLabelText("Game code")).toBeInTheDocument();
  });

  it("asks for all six characters before it looks for a game", async () => {
    const user = userEvent.setup();
    await renderPlay("/play");

    await user.type(screen.getByLabelText("Game code"), "ABC");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(await findComponentAlert()).toHaveTextContent(
      "Type all six letters and numbers",
    );
  });

  it("keeps a pasted code that is not a join code in the cells", async () => {
    const user = userEvent.setup();
    await renderPlay("/play");

    await user.click(screen.getByLabelText("Game code"));
    // 0 is never in a join code, so the paste waits for the Join button.
    await user.paste("qz7-kp0");

    const cells = within(screen.getByRole("group", { name: "Game code" }))
      .getAllByRole("textbox")
      .map((cell) => (cell as HTMLInputElement).value);
    expect(cells).toEqual(["Q", "Z", "7", "K", "P", "0"]);
    expect(joinSpy.calls).toEqual([]);
  });

  it("goes straight to the name step from /play/:code", async () => {
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(screen.getByRole("button", { name: "I'm in" })).toBeInTheDocument();
  });

  it("tells a removed player kindly", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      isRemoved: true,
      status: "ended",
    });
    await renderPlay("/play/QZ7KP4");

    expect(
      await screen.findByText("A host removed you from this game"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can still enjoy the rest of the event"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the event" }),
    ).toHaveAttribute("href", gatheringPath(QUIZSHOW_DEMO_LIVE_SLUG));
  });

  it("shows the final place when the game ends", async () => {
    const user = userEvent.setup();
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        cursor: { ...sessionOf().cursor, status: "finished", phase: "ended" },
        myScores: {
          phaseId: "1",
          rank: 2,
          score: 3000,
          previousScore: 2000,
          ownScore: 3000,
        },
      }),
      {
        status: "ended",
        sessionEnd: {
          sessionId: "demo-quizshow-session",
          status: "finished",
          podium: [],
          nextEvent: null,
          hasResults: true,
          isPractice: false,
          giving: null,
        },
      },
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You finished 2 of 6")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play again" }));
    expect(fakeSession.restartDemo).toHaveBeenCalledTimes(1);
  });

  it("plays a joker once and shows it played", async () => {
    const user = userEvent.setup();
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        rounds: [
          {
            roundIndex: 0,
            kind: "quiz",
            title: { en: "Warm up", pt: "Aquecimento" },
            contentLabel: "none",
            questionCount: 3,
            isJokerAllowed: true,
            isSpeedBonusOn: false,
            isWarmUp: false,
            talkSeconds: 0,
          },
        ],
        cursor: {
          ...sessionOf().cursor,
          upNext: { kind: "round", roundIndex: 0 },
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    await user.click(
      await screen.findByRole("button", {
        name: "Play my joker on this round",
      }),
    );

    expect(fakeSession.send).toHaveBeenCalledWith("joker:play", {
      roundIndex: 0,
    });
    expect(
      await screen.findByText("Joker played on round 1"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Play my joker on this round" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the removed screen when a re-attach is refused", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "refused",
      refusalCode: "quizshow_player_removed",
    });
    await renderPlay("/play/QZ7KP4");

    expect(
      await screen.findByText("A host removed you from this game"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can still enjoy the rest of the event"),
    ).toBeInTheDocument();
  });

  it("tries the same code again after a failure", async () => {
    const user = userEvent.setup();
    joinSpy.shouldFail = true;
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent(
      "Something went wrong. Try again",
    );
    expect(joinSpy.calls).toEqual(["QZ7KP4"]);

    joinSpy.shouldFail = false;
    // The sixth character submits the same code again.
    await user.type(screen.getByLabelText("Game code"), "QZ7KP4");

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(joinSpy.calls).toEqual(["QZ7KP4", "QZ7KP4"]);
  });

  it("shows the reconnecting banner", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "reconnecting",
    });
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .some((region) => region.textContent === "Reconnecting to the game"),
    ).toBe(true);
  });

  it("names the page's main landmark for the skip link", async () => {
    await renderPlay("/play");

    const main = await screen.findByRole("main");
    expect(main).toHaveAttribute("id", MAIN_CONTENT_ID);
    expect(main).toHaveAttribute("tabindex", "-1");
  });
});

describe("QuizshowPlayPage code auto-submit", () => {
  it("joins at once on a paste of a valid code", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders initialEntries={["/play"]}>
        <ReducedMotionContext.Provider value={true}>
          <Routes>
            <Route path="/play" element={<QuizshowPlayPage />} />
            <Route path="/play/:code" element={<CodeProbe />} />
          </Routes>
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByLabelText("Game code"));
    await user.paste("qz7-kp4");

    expect(await screen.findByText("Joined QZ7KP4")).toBeInTheDocument();
  });
});

describe("QuizshowPlayPage join and lobby pause", () => {
  it("joins once under StrictMode", async () => {
    // One client for both StrictMode renders, as the app's single client is.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <StrictMode>
        <TestProviders
          initialEntries={["/play/QZ7KP4"]}
          queryClient={queryClient}
        >
          <ReducedMotionContext.Provider value={true}>
            <Routes>
              <Route path="/play/:code" element={<QuizshowPlayPage />} />
            </Routes>
          </ReducedMotionContext.Provider>
        </TestProviders>
      </StrictMode>,
    );
    await awaitCatalog("quizshow");

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(joinSpy.calls).toEqual(["QZ7KP4"]);
  });

  it("a lobby pause shows one Paused", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        cursor: {
          ...sessionOf().cursor,
          status: "paused",
          phase: "round_intro",
          roundIndex: 0,
          roundNumber: 1,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    // The lead keeps its words while the paused note shows the pause.
    expect(await screen.findByText("Get ready")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Paused")).toHaveLength(1));
    expect(screen.getByText("Paused").closest('[role="status"]')).toBeNull();
    const leadRegion = screen.getByText("Get ready").closest('[role="status"]');
    expect(leadRegion).not.toBeNull();
    expect(leadRegion).toHaveTextContent("Get ready. Paused");
  });

  it("the lobby shows and says the pause during the first title card", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        cursor: {
          ...sessionOf().cursor,
          status: "paused",
          phase: "round_intro",
          roundIndex: 0,
          roundNumber: 1,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent?.includes("Paused")),
      ).toBe(true),
    );
    // The visible paused note sits outside the live region, so the pause is said once.
    expect(
      screen
        .getAllByText("Paused")
        .some((element) => element.closest('[role="status"]') === null),
    ).toBe(true);
  });
});

function roundCardOf(
  roundIndex: number,
  kind: QuizshowRoundCard["kind"],
): QuizshowRoundCard {
  return {
    roundIndex,
    kind,
    title: { en: "Warm up", pt: "Aquecimento" },
    contentLabel: "none",
    questionCount: kind === "wheel" ? 0 : 3,
    isJokerAllowed: kind !== "wheel",
    isSpeedBonusOn: false,
    isWarmUp: false,
    talkSeconds: 0,
  };
}

describe("QuizshowPlayPage lobby screen and the wheel", () => {
  it("stays on the lobby for the first title card, wherever its row sits", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        cursor: {
          ...sessionOf().cursor,
          phase: "round_intro",
          roundIndex: 2,
          roundNumber: 1,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    expect(screen.queryByTestId("player-stage")).not.toBeInTheDocument();
  });

  it("shows the stage on the first round card after an opening wheel", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        rounds: [roundCardOf(0, "wheel"), roundCardOf(1, "quiz")],
        cursor: {
          ...sessionOf().cursor,
          phase: "round_intro",
          roundIndex: 1,
          roundNumber: 1,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByTestId("player-stage")).toBeInTheDocument();
    expect(screen.queryByText("You're in")).not.toBeInTheDocument();
  });

  it("goes to the stage from the second title card", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        cursor: {
          ...sessionOf().cursor,
          phase: "round_intro",
          roundIndex: 2,
          roundNumber: 2,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByTestId("player-stage")).toBeInTheDocument();
    expect(screen.queryByText("You're in")).not.toBeInTheDocument();
  });

  it("points the joker at the round card when the wheel is up next", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        rounds: [roundCardOf(0, "wheel"), roundCardOf(1, "quiz")],
        cursor: {
          ...sessionOf().cursor,
          upNext: { kind: "wheel", wheelRoundIndex: 0 },
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(
      await screen.findByText("Play your joker on the round card"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Play my joker on this round" }),
    ).not.toBeInTheDocument();
  });

  it("offers the joker button when round 0 is up next", async () => {
    fakeSession.initialState = stateOf(
      sessionOf({
        me: ME,
        rounds: [roundCardOf(0, "quiz")],
        cursor: {
          ...sessionOf().cursor,
          upNext: { kind: "round", roundIndex: 0 },
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(
      await screen.findByRole("button", {
        name: "Play my joker on this round",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Play your joker on the round card"),
    ).not.toBeInTheDocument();
  });
});

function previewOf(status: QuizshowJoinPreview["status"]) {
  return {
    data: { quizTitle: "Queer pop trivia", status },
    error: null,
    isError: false,
    isFetching: false,
  };
}

describe("QuizshowPlayPage signed out", () => {
  it.each([
    ["lobby", "The lobby is open"],
    ["running", "The game is on. You can join from the next question"],
    ["paused", "The game is on a short break"],
  ] as const)(
    "shows the %s card with sign-in and opens no game",
    async (status, statusLine) => {
      authOverride.isSignedOut = true;
      previewOverride.result = previewOf(status);
      await renderPlay("/play/qz7-kp4");

      expect(
        await screen.findByRole("heading", { name: "Queer pop trivia" }),
      ).toBeInTheDocument();
      expect(screen.getByText(statusLine)).toBeInTheDocument();
      expect(screen.getByText("QZ7KP4")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Sign in to play" }),
      ).toHaveAttribute(
        "href",
        `${routes.signIn}?next=${encodeURIComponent("/play/qz7-kp4")}`,
      );
      expect(previewOverride.requestedCodes).toContain("QZ7KP4");
      expect(
        screen.getByText("Pulse Live games are for QueerPulse members"),
      ).toBeInTheDocument();
      // No join request and no live session while signed out.
      expect(joinSpy.calls).toEqual([]);
      expect(fakeSession.sessionHookCalls).toBe(0);
    },
  );

  it("says a code that finds no game", async () => {
    authOverride.isSignedOut = true;
    previewOverride.result = {
      data: undefined,
      error: new ApiError(404, "not found", {
        code: "quizshow_join_code_not_found",
      }),
      isError: true,
      isFetching: false,
    };
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent(
      "We couldn't find a game with that code",
    );
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(fakeSession.sessionHookCalls).toBe(0);
  });

  it("says a game that has ended", async () => {
    authOverride.isSignedOut = true;
    previewOverride.result = {
      data: undefined,
      error: new ApiError(410, "gone", { code: "quizshow_session_finished" }),
      isError: true,
      isFetching: false,
    };
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent("That game has ended");
    expect(fakeSession.sessionHookCalls).toBe(0);
  });
});

describe("QuizshowPlayPage while auth settles", () => {
  it("waits on the joining spinner while the session is still loading", async () => {
    authOverride.isChecking = true;
    previewOverride.result = previewOf("lobby");
    await renderPlay("/play/QZ7KP4");

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent === "Connecting"),
      ).toBe(true),
    );
    expect(
      screen.queryByRole("heading", { name: "Queer pop trivia" }),
    ).not.toBeInTheDocument();
    expect(previewOverride.requestedCodes).toEqual([]);
    expect(joinSpy.calls).toEqual([]);
    expect(fakeSession.sessionHookCalls).toBe(0);
  });

  it("waits on the joining spinner while demo sets the user a commit late", async () => {
    authOverride.isUserLagging = true;
    previewOverride.result = previewOf("lobby");
    await renderPlay("/play/QZ7KP4");

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("status")
          .some((region) => region.textContent === "Connecting"),
      ).toBe(true),
    );
    expect(
      screen.queryByRole("heading", { name: "Queer pop trivia" }),
    ).not.toBeInTheDocument();
    expect(previewOverride.requestedCodes).toEqual([]);
    expect(joinSpy.calls).toEqual([]);
    expect(fakeSession.sessionHookCalls).toBe(0);
  });

  it("asks the preview again once per Try again tap", async () => {
    const user = userEvent.setup();
    authOverride.isSignedOut = true;
    previewOverride.result = {
      data: undefined,
      error: new ApiError(503, "unavailable"),
      isError: true,
      isFetching: false,
    };
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent(
      "We couldn't reach the server. Try again in a moment",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(previewOverride.refetch).toHaveBeenCalledTimes(1);
  });
});

describe("QuizshowPlayPage rematch", () => {
  const STORAGE_KEY = "quizshow.rematchTeamName.QZ7KP4";

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("starts the join on the old team and removes the stored name", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(STORAGE_KEY, "Night owls");
    fakeSession.initialState = stateOf(
      sessionOf({
        playMode: "teams",
        maxTeamSize: 3,
        lobby: {
          teams: [
            {
              teamId: "team-1",
              name: "Rainbow crew",
              colorKey: "circle",
              memberCount: 3,
              isHostMade: true,
            },
            {
              teamId: "team-2",
              name: "Night owls",
              colorKey: "moon",
              memberCount: 2,
              isHostMade: true,
            },
          ],
          playerCount: 5,
        },
      }),
    );
    await renderPlay("/play/QZ7KP4");

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    await waitFor(() =>
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(fakeSession.send).toHaveBeenCalledWith(
      "lobby:join",
      expect.objectContaining({ team: { teamId: "team-2" } }),
    );
  });
});

/** Every location the router lands on, so a test can count navigations. */
function LocationLog({ visits }: { visits: string[] }) {
  const { pathname, key } = useLocation();
  useEffect(() => {
    visits.push(`${pathname}#${key}`);
  }, [pathname, key, visits]);
  return null;
}

describe("QuizshowCodeForm double submit", () => {
  it("navigates once for a valid paste followed by Enter", async () => {
    const user = userEvent.setup();
    const visits: string[] = [];
    render(
      <TestProviders initialEntries={["/play"]}>
        <ReducedMotionContext.Provider value={true}>
          <QuizshowCodeForm initialErrorCode={null} />
          <LocationLog visits={visits} />
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByLabelText("Game code"));
    await user.paste("QZ7KP4");
    await waitFor(() => expect(visits).toHaveLength(2));
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(visits.map((visit) => visit.split("#")[0])).toEqual([
      "/play",
      "/play/QZ7KP4",
    ]);
  });
});

describe("QuizshowPlayPage refused connection", () => {
  it("names a server fault and offers a reload", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "refused",
      refusalCode: "SERVER_ERROR",
    });
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent(
      "The server hit a problem. Reload to get back to the game",
    );
    expect(
      screen.getByRole("button", { name: "Reload the page" }),
    ).toBeInTheDocument();
  });

  it("names a lapsed sign-in and links to sign in again", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "refused",
      refusalCode: "UNAUTHORIZED",
    });
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent(
      "Your sign-in ended. Sign in again to get back to the game",
    );
    expect(screen.getByRole("link", { name: "Sign in again" })).toHaveAttribute(
      "href",
      `${routes.signIn}?next=${encodeURIComponent("/play/QZ7KP4")}`,
    );
  });

  it("keeps the code entry for a refusal a quiz code names", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "refused",
      refusalCode: "quizshow_session_finished",
    });
    await renderPlay("/play/QZ7KP4");

    expect(await findComponentAlert()).toHaveTextContent("That game has ended");
    expect(
      screen.getByRole("link", { name: "Join a live game" }),
    ).toBeInTheDocument();
  });
});

describe("QuizshowPlayPage leaving the game", () => {
  it("never shows the join form between the leave and the code entry", async () => {
    const user = userEvent.setup();
    fakeSession.initialState = stateOf(sessionOf({ me: ME }));
    await renderPlay("/play/QZ7KP4");

    await user.click(
      await screen.findByRole("button", { name: "Leave the game" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Leave the game" }),
    );

    expect(fakeSession.send).toHaveBeenCalledWith("lobby:leave", {});
    await waitFor(() =>
      expect(screen.queryByText("You're in")).not.toBeInTheDocument(),
    );
    expect(screen.queryByLabelText("Screen name")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "I'm in" }),
    ).not.toBeInTheDocument();
  });
});

describe("QuizshowPlayPage wake lock after the end", () => {
  const FINISHED_END: QuizshowSessionEnd = {
    sessionId: "demo-quizshow-session",
    status: "finished",
    podium: [],
    nextEvent: null,
    hasResults: true,
    isPractice: false,
    giving: null,
  };

  function endedState(overrides: Partial<QuizshowClientState> = {}) {
    return stateOf(
      sessionOf({
        me: ME,
        cursor: { ...sessionOf().cursor, status: "finished", phase: "ended" },
      }),
      { status: "ended", sessionEnd: FINISHED_END, ...overrides },
    );
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays awake while a rematch can still arrive, then lets the phone sleep", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fakeSession.initialState = endedState();
    await renderPlay("/play/QZ7KP4");

    await waitFor(() => expect(wakeLockSpy.calls.at(-1)).toBe(true));
    act(() => {
      vi.advanceTimersByTime(QUIZSHOW_LIMITS.rematchWindowMs);
    });
    expect(wakeLockSpy.calls.at(-1)).toBe(false);
  });

  it("lets the phone sleep once the rematch arrived or the game was abandoned", async () => {
    fakeSession.initialState = endedState({
      rematch: {
        fromSessionId: "demo-quizshow-session",
        sessionId: "rematch-session",
        joinCode: "RM4TCH",
        playMode: "solo",
      },
    });
    await renderPlay("/play/QZ7KP4");
    await waitFor(() => expect(wakeLockSpy.calls.length).toBeGreaterThan(0));
    expect(wakeLockSpy.calls.every((isActive) => !isActive)).toBe(true);
  });
});
