import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowLobby,
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowChangeTeam } from "./QuizshowChangeTeam";
import { awaitCatalog } from "../../../test/awaitCatalog";

const TEAMS_LOBBY: QuizshowLobby = {
  players: [],
  teams: [
    {
      teamId: "team-1",
      name: "Rainbow crew",
      colorKey: "circle",
      memberCount: 3,
    },
    { teamId: "team-2", name: "Night owls", colorKey: "moon", memberCount: 2 },
  ],
  playerCount: 5,
};

const ME: QuizshowMe = {
  playerId: "player-1",
  screenName: "Sam",
  isAvatarShown: false,
  hasExtraTime: false,
  teamId: "team-1",
  isCohostPlayer: false,
  score: 0,
  streak: 0,
  hasUsedJoker: false,
  jokerRoundIndex: null,
};

function lobbySession(
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
    playMode: "teams",
    maxTeamSize: 3,
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
    lobby: TEAMS_LOBBY,
    question: null,
    voteOptions: null,
    me: ME,
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
  send: QuizshowSessionController["send"],
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
    send,
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function changeTeamOf(
  session: QuizshowPlayerState,
  send: QuizshowSessionController["send"],
) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowChangeTeam
          controller={controllerOf(session, send)}
          session={session}
          me={ME}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

function sendOf(result: unknown = { ok: true }) {
  return vi.fn().mockResolvedValue(result);
}

async function openPicker(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Change team" }));
}

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

describe("QuizshowChangeTeam", () => {
  it("is hidden in a solo game", async () => {
    render(
      changeTeamOf(
        lobbySession({ playMode: "solo", maxTeamSize: null }),
        sendOf() as QuizshowSessionController["send"],
      ),
    );
    await awaitCatalog("quizshow");
    expect(
      screen.queryByRole("button", { name: "Change team" }),
    ).not.toBeInTheDocument();
  });

  it("folds away once the game starts", async () => {
    const send = sendOf() as QuizshowSessionController["send"];
    const session = lobbySession();
    const { rerender } = render(changeTeamOf(session, send));
    await awaitCatalog("quizshow");
    expect(
      screen.getByRole("button", { name: "Change team" }),
    ).toBeInTheDocument();

    rerender(
      changeTeamOf(
        lobbySession({
          cursor: { ...session.cursor, status: "running", phase: "read" },
        }),
        send,
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Change team" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("moves to another team with lobby:pickTeam", async () => {
    const user = userEvent.setup();
    const send = sendOf();
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    expect(screen.getByText("Your team")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Night owls/ }));
    await user.click(screen.getByRole("button", { name: "Join Night owls" }));

    expect(send).toHaveBeenCalledWith("lobby:pickTeam", { teamId: "team-2" });
    const openButton = screen.getByRole("button", { name: "Change team" });
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("starts a team with lobby:createTeam", async () => {
    const user = userEvent.setup();
    const send = sendOf();
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: /Start a team/ }));
    await user.type(screen.getByLabelText("Team name"), "  Glitter ");
    await user.click(screen.getByRole("button", { name: "Start team" }));

    expect(send).toHaveBeenCalledWith("lobby:createTeam", {
      name: "Glitter",
      colorKey: "triangle",
    });
  });

  it("keeps the current team without sending anything", async () => {
    const user = userEvent.setup();
    const send = sendOf();
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("button", { name: "Keep my team" }));

    expect(send).not.toHaveBeenCalled();
    const openButton = screen.getByRole("button", { name: "Change team" });
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("asks for a name on the team name field when it is blank", async () => {
    const user = userEvent.setup();
    const send = sendOf();
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: /Start a team/ }));
    await user.click(screen.getByRole("button", { name: "Start team" }));

    expect(send).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Give your team a name"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("names the reason a move was refused", async () => {
    const user = userEvent.setup();
    const send = sendOf({
      ok: false,
      code: "quizshow_team_full",
      message: "full",
    });
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: /Night owls/ }));
    await user.click(screen.getByRole("button", { name: "Join Night owls" }));

    expect(await findComponentAlert()).toHaveTextContent("That team is full");
  });

  it("sends once when the confirm is tapped twice", async () => {
    const user = userEvent.setup();
    // The ack never arrives, so the send stays pending through the second tap.
    const send = vi.fn().mockReturnValue(new Promise(() => {}));
    render(
      changeTeamOf(lobbySession(), send as QuizshowSessionController["send"]),
    );
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: /Night owls/ }));
    const confirmButton = screen.getByRole("button", {
      name: "Join Night owls",
    });
    await user.dblClick(confirmButton);

    expect(send).toHaveBeenCalledTimes(1);
    expect(confirmButton).toHaveAttribute("aria-disabled", "true");
  });

  it("says why when the picked team vanishes", async () => {
    const user = userEvent.setup();
    const send = sendOf() as QuizshowSessionController["send"];
    const { rerender } = render(changeTeamOf(lobbySession(), send));
    await awaitCatalog("quizshow");

    await openPicker(user);
    await user.click(screen.getByRole("radio", { name: /Night owls/ }));
    rerender(
      changeTeamOf(
        lobbySession({
          lobby: {
            ...TEAMS_LOBBY,
            teams: TEAMS_LOBBY.teams.filter((team) => team.teamId !== "team-2"),
          },
        }),
        send,
      ),
    );

    expect(await findComponentAlert()).toHaveTextContent(
      "That team is gone. Pick another",
    );
    expect(
      screen.getByRole("button", { name: "Keep my team" }),
    ).toBeInTheDocument();
  });
});
