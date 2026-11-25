import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowPlayerLobby,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowJoinForm } from "./QuizshowJoinForm";
import { awaitCatalog } from "../../../test/awaitCatalog";

function lobbySession(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: "session-1",
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
    lobby: { teams: [], playerCount: 0 },
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

function controllerOf(
  session: QuizshowPlayerState,
  send: QuizshowSessionController["send"],
): QuizshowSessionController {
  const state: QuizshowClientState = {
    ...createQuizshowClientState("player"),
    status: "attached",
    hasAttached: true,
    session,
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

function renderForm(
  session: QuizshowPlayerState,
  send: QuizshowSessionController["send"],
  rematchTeamName: string | null = null,
) {
  return render(
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowJoinForm
          controller={controllerOf(session, send)}
          rematchTeamName={rematchTeamName}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

const TEAMS_LOBBY: QuizshowPlayerLobby = {
  teams: [
    {
      teamId: "team-1",
      name: "Rainbow crew",
      colorKey: "circle",
      memberCount: 3,
      isHostMade: false,
    },
    {
      teamId: "team-2",
      name: "Night owls",
      colorKey: "moon",
      memberCount: 2,
      isHostMade: false,
    },
  ],
  playerCount: 5,
};

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

describe("QuizshowJoinForm", () => {
  it("prefills the suggested name and joins with one field", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({ ok: true });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    const nameInput = screen.getByLabelText("Screen name");
    expect(nameInput).toHaveValue("Sam");
    expect(nameInput).toHaveAttribute("maxlength", "30");
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    // Extra time and the photo are set from the lobby sheet after joining (item 31).
    expect(send).toHaveBeenCalledWith("lobby:join", {
      screenName: "Sam",
      isAvatarShown: false,
      hasExtraTime: false,
      team: null,
    });
  });

  it("shows no switches on the name step", async () => {
    renderForm(lobbySession(), vi.fn() as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    expect(screen.getByLabelText("Screen name")).toBeInTheDocument();
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
    expect(
      screen.queryByText("Give me more time on each question"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Show my photo on the big screen"),
    ).not.toBeInTheDocument();
  });

  it("offers the suggested free name when the name is taken", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_screen_name_taken",
      message: "taken",
      suggestedScreenName: "Sam 2",
    });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(await findComponentAlert()).toHaveTextContent(
      "Someone here already uses that name. Try Sam 2",
    );
    await user.click(screen.getByRole("button", { name: "Use Sam 2" }));

    expect(screen.getByLabelText("Screen name")).toHaveValue("Sam 2");
    expect(screen.getByRole("button", { name: "I'm in" })).toHaveFocus();
  });

  it("asks for a team in teams mode and starts one with a free shape", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({ ok: true });
    renderForm(
      lobbySession({
        playMode: "teams",
        maxTeamSize: 3,
        lobby: TEAMS_LOBBY,
      }),
      send as QuizshowSessionController["send"],
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "I'm in" }));
    expect(send).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Pick a team or start one"),
    ).toBeInTheDocument();

    expect(screen.getByText("Full")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Start a team/ }));
    await user.type(screen.getByLabelText("Team name"), "Glitter");
    expect(screen.getByRole("radio", { name: "Circle" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Moon" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.click(screen.getByRole("radio", { name: "Star" }));
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(send).toHaveBeenCalledWith("lobby:join", {
      screenName: "Sam",
      isAvatarShown: false,
      hasExtraTime: false,
      team: { newTeam: { name: "Glitter", colorKey: "star" } },
    });
  });

  it("names a taken name with no button when no free name is left", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_screen_name_taken",
      message: "taken",
    });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(await findComponentAlert()).toHaveTextContent(
      "Someone here already uses that name. Pick another one",
    );
    expect(
      screen.queryByRole("button", { name: /^Use/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Screen name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows the gentle copy for a blocked name", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_text_blocked",
      message: "blocked",
    });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(await findComponentAlert()).toHaveTextContent(
      "Let's keep it kind. Try different words",
    );
    expect(screen.getByLabelText("Screen name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("QuizshowJoinForm rematch", () => {
  const STORAGE_KEY = "quizshow.rematchTeamName.QZ7KP4";

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("starts on the old team the page passes down", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({ ok: true });
    // The name folds to the lobby team's key (case and spaces differ).
    renderForm(
      lobbySession({ playMode: "teams", maxTeamSize: 3, lobby: TEAMS_LOBBY }),
      send as QuizshowSessionController["send"],
      "  night   OWLS ",
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(send).toHaveBeenCalledWith("lobby:join", {
      screenName: "Sam",
      isAvatarShown: false,
      hasExtraTime: false,
      team: { teamId: "team-2" },
    });
  });

  it("starts with no team when the old team is not in the lobby", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true });
    renderForm(
      lobbySession({ playMode: "teams", maxTeamSize: 3, lobby: TEAMS_LOBBY }),
      send as QuizshowSessionController["send"],
      "Glitter",
    );
    await awaitCatalog("quizshow");

    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen
        .getAllByRole("radio")
        .some((radio) => (radio as HTMLInputElement).checked),
    ).toBe(false);
  });

  it("leaves the stored name to the page that owns it", async () => {
    window.sessionStorage.setItem(STORAGE_KEY, "Night owls");
    const send = vi.fn().mockResolvedValue({ ok: true });
    renderForm(
      lobbySession({ playMode: "teams", maxTeamSize: 3, lobby: TEAMS_LOBBY }),
      send as QuizshowSessionController["send"],
    );
    await awaitCatalog("quizshow");

    await act(async () => {
      await Promise.resolve();
    });
    // The form neither reads nor clears it: no team starts picked.
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("Night owls");
    expect(
      screen
        .getAllByRole("radio")
        .some((radio) => (radio as HTMLInputElement).checked),
    ).toBe(false);
  });
});
