import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";
import {
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
  type QuizshowHostPlayer,
  type QuizshowHostState,
  type QuizshowHostTeam,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemotePlayers } from "./QuizshowRemotePlayers";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const NOW = 1_800_000_000_000;

const LOBBY_CURSOR: QuizshowCursor = {
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
  roundNumber: 0,
  upNext: null,
  canSpinForNextRound: false,
  talkStartsAt: null,
  autoAdvanceAt: null,
  podiumRevealedCount: null,
};

function playerWith(
  overrides: Partial<QuizshowHostPlayer> = {},
): QuizshowHostPlayer {
  return {
    playerId: "player-alex",
    screenName: "Alex",
    teamId: null,
    avatarUrl: null,
    isCohostPlayer: false,
    hasExtraTime: false,
    hasUsedJoker: false,
    score: 0,
    streak: 0,
    isConnected: true,
    disconnectedAt: null,
    joinedAt: NOW - 60_000,
    ...overrides,
  };
}

const TEAM_STARS: QuizshowHostTeam = {
  teamId: "team-stars",
  name: "Stars",
  colorKey: "circle",
  memberCount: 1,
  isHostMade: false,
  score: 0,
  hasUsedJoker: false,
};

function hostState(
  overrides: Partial<QuizshowHostState> = {},
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
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: LOBBY_CURSOR,
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    lobby: { players: [playerWith()], teams: [], playerCount: 1 },
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
      hasAttached: true,
      retryCause: null,
      rematch: null,
      reactionBurst: null,
      canRejoinAfterRemoval: false,
      nightLog: [],
      ownRanks: { previous: null, current: null },
      ownRankSourceKey: null,
      lastTeamName: null,
    },
    clockOffsetMs: 0,
    isDemo: true,
    send: send as unknown as QuizshowSessionController["send"],
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function renderRoster(state: QuizshowHostState, send: Mock<SendFunction>) {
  return render(
    <TestProviders>
      <ReducedMotionContext.Provider value>
        <QuizshowRemotePlayers
          controller={controllerFor(state, send)}
          lobby={state.lobby}
          playMode={state.playMode}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

function acting() {
  return vi.fn<SendFunction>(() =>
    Promise.resolve({ ok: true, isNoop: false }),
  );
}

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolveWith) => {
    resolve = resolveWith;
  });
  return { promise, resolve };
}

const TEAM_MOONS: QuizshowHostTeam = {
  ...TEAM_STARS,
  teamId: "team-moons",
  name: "Moons",
  colorKey: "square",
};

function teamsState(
  teams: QuizshowHostTeam[],
  overrides: Partial<QuizshowHostState> = {},
): QuizshowHostState {
  return hostState({
    playMode: "teams",
    lobby: {
      players: [playerWith({ teamId: TEAM_STARS.teamId })],
      teams,
      playerCount: 1,
    },
    ...overrides,
  });
}

describe("QuizshowRemotePlayers away and rename", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("turns Offline into Away once awayAfterMs passes by the server clock", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(NOW);
    const disconnectedAt = NOW - QUIZSHOW_LIMITS.awayAfterMs + 1_500;
    const state = hostState({
      lobby: {
        players: [playerWith({ isConnected: false, disconnectedAt })],
        teams: [],
        playerCount: 1,
      },
    });
    renderRoster(state, acting());
    await awaitCatalogUnderFakeTimers("quizshow");

    expect(screen.getByText("Offline")).toBeTruthy();
    expect(screen.queryByText("Away")).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    // The tag swap fades out the old tag first; let that finish on real timers.
    vi.useRealTimers();
    expect(await screen.findByText("Away")).toBeTruthy();
  });

  it("renames a player and offers the server's free name when it is taken", async () => {
    const user = userEvent.setup();
    const send = vi
      .fn<SendFunction>()
      .mockResolvedValueOnce({
        ok: false,
        code: "quizshow_screen_name_taken",
        message: "taken",
        suggestedScreenName: "Sam 2",
      })
      .mockResolvedValueOnce({ ok: true, isNoop: false });
    renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    const renameButton = screen.getByRole("button", { name: /Rename/ });
    await user.click(renameButton);
    const nameInput = screen.getByLabelText("Name on the big screen");
    expect(document.activeElement).toBe(nameInput);
    await user.clear(nameInput);
    await user.type(nameInput, "Sam");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(send).toHaveBeenCalledWith("host:renamePlayer", {
      playerId: "player-alex",
      screenName: "Sam",
    });
    await user.click(await screen.findByRole("button", { name: "Use Sam 2" }));
    expect((nameInput as HTMLInputElement).value).toBe("Sam 2");

    await user.click(screen.getByRole("button", { name: "Save name" }));
    expect(send).toHaveBeenLastCalledWith("host:renamePlayer", {
      playerId: "player-alex",
      screenName: "Sam 2",
    });
    await waitFor(() => expect(document.activeElement).toBe(renameButton));
  });

  it("stops a blank name on the client with the blank copy", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    await user.click(screen.getByRole("button", { name: /Rename/ }));
    const nameInput = screen.getByLabelText("Name on the big screen");
    await user.clear(nameInput);
    await user.type(nameInput, "   ");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(send).not.toHaveBeenCalled();
    expect(await screen.findByText("Write something first")).toBeTruthy();
  });
});

describe("QuizshowRemotePlayers remove", () => {
  it("swaps the body with the rejoin switch and removes with canRejoin", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    await user.click(
      screen.getByRole("button", { name: /Remove from the game/ }),
    );
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: "Cancel" }),
      ),
    );
    expect(
      within(dialog).getByText(
        "They can't rejoin this game, and their written answers stay hidden",
      ),
    ).toBeTruthy();

    await user.click(
      within(dialog).getByRole("switch", { name: "Let them join again" }),
    );
    expect(
      within(dialog).getByText(
        "They leave now and can join again with the same code. Their score and answers stay",
      ),
    ).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Remove from the game" }),
    );

    expect(send).toHaveBeenCalledWith("host:removePlayer", {
      playerId: "player-alex",
      canRejoin: true,
    });
  });

  it("removes for good when the rejoin switch stays off", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    await user.click(
      screen.getByRole("button", { name: /Remove from the game/ }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Remove from the game" }),
    );

    expect(send).toHaveBeenCalledWith("host:removePlayer", {
      playerId: "player-alex",
      canRejoin: false,
    });
  });
});

describe("QuizshowRemotePlayers game settings", () => {
  it("shows the asked value and sends once while a switch is pending", async () => {
    const user = userEvent.setup();
    const ack = deferred<unknown>();
    const send = vi.fn<SendFunction>((name) =>
      name === "host:setJoinLock"
        ? ack.promise
        : Promise.resolve({ ok: true, isNoop: false }),
    );
    renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    const joinLockSwitch = screen.getByRole("switch", {
      name: "Close joining",
    });
    expect(joinLockSwitch.getAttribute("aria-checked")).toBe("false");
    await user.click(joinLockSwitch);
    expect(joinLockSwitch.getAttribute("aria-checked")).toBe("true");
    await user.click(joinLockSwitch);
    expect(
      send.mock.calls.filter(([name]) => name === "host:setJoinLock"),
    ).toEqual([["host:setJoinLock", { isLocked: true }]]);

    await act(async () => {
      ack.resolve({ ok: true, isNoop: false });
      await ack.promise;
    });
    // No session:flags frame arrived in this test, so the server's value shows again.
    expect(joinLockSwitch.getAttribute("aria-checked")).toBe("false");

    await user.click(screen.getByRole("switch", { name: "Move on by itself" }));
    expect(send).toHaveBeenLastCalledWith("host:setAutoAdvance", {
      isOn: true,
    });
  });

  it("sends Send the join code to guests and shows the sent line once set", async () => {
    const user = userEvent.setup();
    const send = acting();
    const { rerender } = renderRoster(hostState(), send);
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: /Send the join code to guests/ }),
    );
    expect(send).toHaveBeenCalledWith("host:notifyGuests", {});

    const sentState = hostState({ guestPushSentAt: NOW });
    rerender(
      <TestProviders>
        <ReducedMotionContext.Provider value>
          <QuizshowRemotePlayers
            controller={controllerFor(sentState, send)}
            lobby={sentState.lobby}
            playMode={sentState.playMode}
          />
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
    expect(screen.getByText("Guests have the code")).toBeTruthy();
  });
});

describe("QuizshowRemotePlayers game settings after the end", () => {
  it("shows no game settings once the session ended or was abandoned", async () => {
    for (const status of ["finished", "abandoned"] as const) {
      const endedState = hostState({
        cursor: { ...LOBBY_CURSOR, phase: "ended", status },
      });
      const { unmount } = renderRoster(endedState, acting());
      await awaitCatalog("quizshow");
      expect(
        screen.queryByRole("switch", { name: "Close joining" }),
      ).not.toBeInTheDocument();
      unmount();
    }
  });
});

describe("QuizshowRemotePlayers make teams", () => {
  it("makes teams for tables with the names in order", async () => {
    const user = userEvent.setup();
    const send = vi.fn<SendFunction>(() =>
      Promise.resolve({ ok: true, isNoop: false, teamIds: [] }),
    );
    renderRoster(teamsState([TEAM_STARS]), send);
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: /Make teams for tables/ }),
    );
    const dialog = await screen.findByRole("dialog");
    const nameInputs = within(dialog).getAllByRole("textbox");
    expect(
      nameInputs.map((input) => (input as HTMLInputElement).value),
    ).toEqual(["Table 1", "Table 2", "Table 3", "Table 4"]);

    await user.click(
      within(dialog).getByRole("button", { name: "Remove a table" }),
    );
    const secondName = within(dialog).getByLabelText("Team 2 name");
    await user.clear(secondName);
    await user.type(secondName, "Bar crew");
    await user.click(
      within(dialog).getByRole("button", { name: "Create these teams" }),
    );

    expect(send).toHaveBeenCalledWith("host:createTeams", {
      names: ["Table 1", "Bar crew", "Table 3"],
    });
  });

  it("skips default names an existing team already holds", async () => {
    const user = userEvent.setup();
    const tableTwo = { ...TEAM_MOONS, name: "table  2" };
    renderRoster(teamsState([TEAM_STARS, tableTwo]), acting());
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: /Make teams for tables/ }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog)
        .getAllByRole("textbox")
        .map((input) => (input as HTMLInputElement).value),
    ).toEqual(["Table 1", "Table 3", "Table 4", "Table 5"]);
  });

  it("stops a blank table name before sending", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderRoster(teamsState([TEAM_STARS]), send);
    await awaitCatalog("quizshow");

    await user.click(
      screen.getByRole("button", { name: /Make teams for tables/ }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.clear(within(dialog).getByLabelText("Team 3 name"));
    await user.click(
      within(dialog).getByRole("button", { name: "Create these teams" }),
    );

    expect(send).not.toHaveBeenCalled();
    expect(
      await within(dialog).findByText("Write something first"),
    ).toBeTruthy();
  });
});

describe("QuizshowRemotePlayers team moves", () => {
  it("moves a player to another team and hands focus back to the menu", async () => {
    const user = userEvent.setup();
    const send = acting();
    renderRoster(teamsState([TEAM_STARS, TEAM_MOONS]), send);
    await awaitCatalog("quizshow");

    const menuButton = screen.getByRole("button", { name: "Options for Alex" });
    await user.click(menuButton);
    await user.click(screen.getByRole("button", { name: /Move to team/ }));
    await user.click(screen.getByRole("button", { name: /Moons/ }));

    expect(send).toHaveBeenCalledWith("host:movePlayer", {
      playerId: "player-alex",
      teamId: "team-moons",
    });
    await waitFor(() => expect(document.activeElement).toBe(menuButton));
  });

  it("hides Move to team while no other team exists", async () => {
    const user = userEvent.setup();
    renderRoster(teamsState([TEAM_STARS]), acting());
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    expect(screen.queryByRole("button", { name: /Move to team/ })).toBeNull();
  });

  it("disables Move to team during a question and says why", async () => {
    const user = userEvent.setup();
    const send = acting();
    const state = teamsState([TEAM_STARS, TEAM_MOONS], {
      cursor: {
        ...LOBBY_CURSOR,
        status: "running",
        phase: "open",
        roundIndex: 0,
        questionIndex: 0,
      },
    });
    renderRoster(state, send);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Options for Alex" }));
    const moveButton = screen.getByRole("button", { name: /Move to team/ });
    expect(moveButton.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen.getByText(
        "Move people before a question opens or after its scores",
      ),
    ).toBeTruthy();
    await user.click(moveButton);
    expect(send).not.toHaveBeenCalled();
  });
});
