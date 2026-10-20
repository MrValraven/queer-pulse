import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowLobby,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowJoinForm } from "./QuizshowJoinForm";

function lobbySession(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
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
    lobby: { players: [], teams: [], playerCount: 0 },
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

function renderForm(
  session: QuizshowPlayerState,
  send: QuizshowSessionController["send"],
) {
  return render(
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowJoinForm controller={controllerOf(session, send)} />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

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

describe("QuizshowJoinForm", () => {
  it("prefills the suggested name and sends the join with the choices", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({ ok: true });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);

    const nameInput = screen.getByLabelText("Screen name");
    expect(nameInput).toHaveValue("Sam");
    expect(nameInput).toHaveAttribute("maxlength", "30");
    await user.click(
      screen.getByRole("switch", {
        name: "Give me more time on each question",
      }),
    );
    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(send).toHaveBeenCalledWith("lobby:join", {
      screenName: "Sam",
      isAvatarShown: false,
      hasExtraTime: true,
      team: null,
    });
  });

  it("keeps extra time private", () => {
    renderForm(lobbySession(), vi.fn() as QuizshowSessionController["send"]);
    expect(
      screen.getByText("Only you and the hosts see this"),
    ).toBeInTheDocument();
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

  it("shows the gentle copy for a blocked name", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockResolvedValue({
      ok: false,
      code: "quizshow_text_blocked",
      message: "blocked",
    });
    renderForm(lobbySession(), send as QuizshowSessionController["send"]);

    await user.click(screen.getByRole("button", { name: "I'm in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Let's keep it kind. Try different words",
    );
    expect(screen.getByLabelText("Screen name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
