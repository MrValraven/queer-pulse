import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowJoinInput,
  QuizshowJoinResponse,
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import {
  QUIZSHOW_DEMO_GAME_JOIN_CODE,
  QUIZSHOW_DEMO_GAME_SESSION_PREFIX,
} from "../quizshow.constants";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { QuizshowPlayPage } from "./QuizshowPlayPage";

const fakeSession = vi.hoisted(() => ({
  initialState: null as QuizshowClientState | null,
  send: vi.fn(),
  lastOptions: null as Record<string, unknown> | null,
  /** The ack each `lobby:join` gets, in order; once used up, joins succeed. */
  joinAcks: [] as { ok: boolean; code?: string }[],
}));

vi.mock("../realtime/useQuizshowSession", async () => {
  const { useState } = await import("react");
  return {
    useQuizshowSession: (options: Record<string, unknown>) => {
      fakeSession.lastOptions = options;
      const [state] = useState(fakeSession.initialState as QuizshowClientState);
      return {
        state,
        clockOffsetMs: 0,
        isDemo: true,
        send: (name: string, payload: unknown) => {
          fakeSession.send(name, payload);
          const queuedAck =
            name === "lobby:join" ? fakeSession.joinAcks.shift() : undefined;
          return Promise.resolve(queuedAck ?? { ok: true });
        },
        submitAnswer: vi.fn(),
        demoScreenState: null,
        restartDemo: vi.fn(),
      };
    },
  };
});

const joinOverride = vi.hoisted(() => ({
  changes: null as Partial<QuizshowJoinResponse> | null,
}));

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return {
    ...actual,
    demoJoin: (body: QuizshowJoinInput) => ({
      ...actual.demoJoin(body),
      ...(joinOverride.changes ?? {}),
    }),
  };
});

vi.mock("../games/QuizshowPlayHome", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../games/QuizshowPlayHome")>();
  return {
    QuizshowPlayHome: (
      props: Parameters<typeof actual.QuizshowPlayHome>[0],
    ) => (
      <div data-testid="pulse-live-home">
        <actual.QuizshowPlayHome {...props} />
      </div>
    ),
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

const AFTER_DARK_SESSION_ID =
  QUIZSHOW_DEMO_GAME_SESSION_PREFIX + QUIZSHOW_DEMO_GAME_IDS.afterDark;

function gameSessionOf(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: AFTER_DARK_SESSION_ID,
    eventSlug: null,
    eventTitle: null,
    kind: "game",
    gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
    isAdultsOnly: true,
    joinCode: QUIZSHOW_DEMO_GAME_JOIN_CODE,
    quizTitle: "After dark trivia",
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
      roundCount: 2,
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

function LocationProbe() {
  const { pathname } = useLocation();
  return <p data-testid="location">{pathname}</p>;
}

function renderPlay(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <ReducedMotionContext.Provider value={true}>
        <Routes>
          <Route path="/play" element={<QuizshowPlayPage />} />
          <Route path="/play/:code" element={<QuizshowPlayPage />} />
        </Routes>
        <LocationProbe />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

const CONSENT_TITLE = "This game holds 18+ content";

beforeEach(() => {
  resetQuizshowDemoGames();
  fakeSession.send.mockReset();
  fakeSession.lastOptions = null;
  fakeSession.joinAcks = [];
  joinOverride.changes = null;
  fakeSession.initialState = stateOf(gameSessionOf());
});

describe("QuizshowPlayPage on a game", () => {
  it("shows the host with a link to their profile before a game's join form", async () => {
    joinOverride.changes = { isAdultsOnly: false };
    fakeSession.initialState = stateOf(gameSessionOf({ isAdultsOnly: false }));
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(screen.getByText("Hosted by Rui Marçal")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See Rui Marçal's profile" }),
    ).toHaveAttribute("href", "/members/rui");
    expect(
      screen.getByText("You can report or block them from their profile"),
    ).toBeInTheDocument();
    expect(screen.queryByText(CONSENT_TITLE)).not.toBeInTheDocument();
  });

  it("asks for 18+ consent before the name step on a deep link", async () => {
    const user = userEvent.setup();
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(await screen.findByText(CONSENT_TITLE)).toBeInTheDocument();
    expect(screen.getByText("Hosted by Rui Marçal")).toBeInTheDocument();
    expect(screen.queryByLabelText("Screen name")).not.toBeInTheDocument();
    expect(fakeSession.lastOptions).toMatchObject({
      sessionId: AFTER_DARK_SESSION_ID,
      gameId: QUIZSHOW_DEMO_GAME_IDS.afterDark,
      isAdultsOnly: true,
    });

    await user.click(screen.getByRole("button", { name: "Join game" }));
    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(fakeSession.send).toHaveBeenCalledWith(
      "lobby:join",
      expect.objectContaining({
        screenName: "Sam",
        hasAcceptedAdultContent: true,
      }),
    );
  });

  it("asks for 18+ consent on an 18+ event game too", async () => {
    const user = userEvent.setup();
    joinOverride.changes = { isAdultsOnly: true };
    fakeSession.initialState = stateOf(
      gameSessionOf({
        kind: "event",
        gameId: null,
        eventSlug: "quiz-night",
        eventTitle: "Quiz night",
      }),
    );
    renderPlay("/play/QZ7KP4");

    expect(await screen.findByText(CONSENT_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(/Hosted by/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Screen name")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Join game" }));
    await user.click(await screen.findByRole("button", { name: "I'm in" }));

    expect(fakeSession.send).toHaveBeenCalledWith(
      "lobby:join",
      expect.objectContaining({ hasAcceptedAdultContent: true }),
    );
  });

  it("Leave goes back to the Pulse Live home", async () => {
    const user = userEvent.setup();
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    await user.click(await screen.findByRole("button", { name: "Leave" }));

    expect(await screen.findByTestId("location")).toHaveTextContent(/^\/play$/);
    expect(await screen.findByLabelText("Game code")).toBeInTheDocument();
    expect(fakeSession.send).not.toHaveBeenCalled();
  });

  it("asks consent when the session is 18+ though the join response is not", async () => {
    const user = userEvent.setup();
    // The host turned 18+ off after the lobby opened; the session keeps the flag it loaded with.
    joinOverride.changes = { isAdultsOnly: false };
    fakeSession.initialState = stateOf(gameSessionOf({ isAdultsOnly: true }));
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(await screen.findByText(CONSENT_TITLE)).toBeInTheDocument();
    expect(screen.queryByLabelText("Screen name")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Join game" }));
    await user.click(await screen.findByRole("button", { name: "I'm in" }));

    expect(fakeSession.send).toHaveBeenCalledWith(
      "lobby:join",
      expect.objectContaining({ hasAcceptedAdultContent: true }),
    );
  });

  it("returns to the consent step when the server asks for consent", async () => {
    const user = userEvent.setup();
    joinOverride.changes = { isAdultsOnly: false };
    fakeSession.initialState = stateOf(gameSessionOf({ isAdultsOnly: false }));
    fakeSession.joinAcks = [
      { ok: false, code: "quizshow_adult_consent_required" },
    ];
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    await user.click(await screen.findByRole("button", { name: "I'm in" }));
    expect(fakeSession.send).toHaveBeenLastCalledWith(
      "lobby:join",
      expect.not.objectContaining({ hasAcceptedAdultContent: true }),
    );

    expect(await screen.findByText(CONSENT_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByText("This game holds 18+ content. Confirm to join"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Join game" }));
    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(
      screen.getByRole("heading", { name: "Pick your screen name" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(fakeSession.send).toHaveBeenCalledTimes(2);
    expect(fakeSession.send).toHaveBeenLastCalledWith(
      "lobby:join",
      expect.objectContaining({ hasAcceptedAdultContent: true }),
    );
  });

  it("skips consent on a rejoin", async () => {
    joinOverride.changes = { isRejoin: true };
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(await screen.findByLabelText("Screen name")).toHaveValue("Sam");
    expect(screen.queryByText(CONSENT_TITLE)).not.toBeInTheDocument();
  });

  it("links a game's end screen to Pulse Live and shows no next event", async () => {
    fakeSession.initialState = stateOf(
      gameSessionOf({
        me: ME,
        cursor: {
          ...gameSessionOf().cursor,
          status: "finished",
          phase: "ended",
        },
      }),
      {
        status: "ended",
        sessionEnd: {
          sessionId: AFTER_DARK_SESSION_ID,
          status: "finished",
          podium: [],
          nextEvent: {
            slug: "drag-brunch",
            title: "Drag brunch",
            startAt: "2026-11-01T12:00:00.000Z",
          },
          hasResults: true,
        },
      },
    );
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(
      await screen.findByRole("link", { name: "Back to Pulse Live" }),
    ).toHaveAttribute("href", "/play");
    expect(screen.queryByText(/Drag brunch/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Back to the event" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Report this game" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(CONSENT_TITLE)).not.toBeInTheDocument();
  });

  it("tells a removed game player they can join another game", async () => {
    fakeSession.initialState = stateOf(gameSessionOf({ me: ME }), {
      isRemoved: true,
      status: "ended",
    });
    renderPlay(`/play/${QUIZSHOW_DEMO_GAME_JOIN_CODE}`);

    expect(
      await screen.findByText("A host removed you from this game"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can join another game any time"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Pulse Live" }),
    ).toHaveAttribute("href", "/play");
    expect(
      screen.getByRole("button", { name: "Report this game" }),
    ).toBeInTheDocument();
  });

  it("shows the Pulse Live home on /play", async () => {
    renderPlay("/play");

    const home = await screen.findByTestId("pulse-live-home");
    expect(within(home).getByLabelText("Game code")).toBeInTheDocument();
    expect(
      within(home).getByRole("link", { name: "Back to QueerPulse" }),
    ).toHaveAttribute("href", "/feed");
    expect(
      within(home).getByRole("button", { name: "Join game" }),
    ).toBeInTheDocument();
  });
});
