import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { QuizshowPlayPage } from "./QuizshowPlayPage";

const fakeSession = vi.hoisted(() => ({
  initialState: null as QuizshowClientState | null,
  send: vi.fn(),
  restartDemo: vi.fn(),
}));

vi.mock("../realtime/useQuizshowSession", async () => {
  const { useState } = await import("react");
  return {
    useQuizshowSession: () => {
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
    },
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "player",
    lobby: { players: [], teams: [], playerCount: 6 },
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
    role: "player",
    status: "attached",
    refusalCode: null,
    session,
    sessionEnd: null,
    isRemoved: false,
    pendingAnswer: null,
    ...overrides,
  };
}

function CodeProbe() {
  const { code } = useParams();
  return <p>{`Joined ${code}`}</p>;
}

function renderPlay(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <ReducedMotionContext.Provider value={true}>
        <Routes>
          <Route path="/play" element={<QuizshowPlayPage />} />
          <Route path="/play/:code" element={<QuizshowPlayPage />} />
        </Routes>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

beforeEach(() => {
  fakeSession.send.mockReset();
  fakeSession.restartDemo.mockReset();
  joinSpy.calls = [];
  joinSpy.shouldFail = false;
  fakeSession.initialState = stateOf(sessionOf());
});

describe("QuizshowPlayPage", () => {
  it("normalises a typed code and joins", async () => {
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

    await user.type(screen.getByLabelText("Game code"), "qz7-kp4");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(await screen.findByText("Joined QZ7KP4")).toBeInTheDocument();
  });

  it("explains a code that finds no game", async () => {
    const user = userEvent.setup();
    renderPlay("/play");

    await user.type(screen.getByLabelText("Game code"), "ABC");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't find a game with that code",
    );
    expect(screen.getByLabelText("Game code")).toBeInTheDocument();
  });

  it("goes straight to the name step from /play/:code", async () => {
    renderPlay("/play/QZ7KP4");

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(screen.getByRole("button", { name: "I'm in" })).toBeInTheDocument();
  });

  it("tells a removed player kindly", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      isRemoved: true,
      status: "ended",
    });
    renderPlay("/play/QZ7KP4");

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
        },
      },
    );
    renderPlay("/play/QZ7KP4");

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
          },
        ],
      }),
    );
    renderPlay("/play/QZ7KP4");

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
    renderPlay("/play/QZ7KP4");

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
    renderPlay("/play/QZ7KP4");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Try again",
    );
    expect(joinSpy.calls).toEqual(["QZ7KP4"]);

    joinSpy.shouldFail = false;
    await user.type(screen.getByLabelText("Game code"), "QZ7KP4");
    await user.click(screen.getByRole("button", { name: "Join game" }));

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(joinSpy.calls).toEqual(["QZ7KP4", "QZ7KP4"]);
  });

  it("shows the reconnecting banner", async () => {
    fakeSession.initialState = stateOf(sessionOf({ me: ME }), {
      status: "reconnecting",
    });
    renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .some((region) => region.textContent === "Reconnecting to the game"),
    ).toBe(true);
  });

  it("names the page's main landmark for the skip link", async () => {
    renderPlay("/play");

    const main = await screen.findByRole("main");
    expect(main).toHaveAttribute("id", MAIN_CONTENT_ID);
    expect(main).toHaveAttribute("tabindex", "-1");
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
        },
      }),
    );
    renderPlay("/play/QZ7KP4");

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
        },
      }),
    );
    renderPlay("/play/QZ7KP4");

    expect(await screen.findByText("You're in")).toBeInTheDocument();
    // The lead keeps its words while the paused note shows the pause.
    expect(await screen.findByText("Get ready")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Paused")).toHaveLength(1));
    expect(screen.getByText("Paused").closest('[role="status"]')).toBeNull();
    const leadRegion = screen.getByText("Get ready").closest('[role="status"]');
    expect(leadRegion).not.toBeNull();
    expect(leadRegion).toHaveTextContent("Get ready. Paused");
  });
});
