import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowPhase,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowPlayerStage } from "./QuizshowPlayerStage";
import { QuizshowReportGameButton } from "./QuizshowReportGameButton";

const reportModalProps = vi.fn();

vi.mock("../../economy/ReportListingModal", () => ({
  ReportListingModal: (props: {
    subjectType: string;
    subjectId: string;
    subjectName: string;
  }) => {
    reportModalProps(props);
    return <div role="dialog">Report dialog</div>;
  },
}));

vi.mock("./QuizshowJokerButton", () => ({
  QuizshowJokerButton: () => <button type="button">Joker</button>,
}));

function playerStateOf(
  phase: QuizshowPhase,
  kind: "game" | "event",
): QuizshowPlayerState {
  return {
    sessionId: "session-9",
    eventSlug: kind === "event" ? "quiz-night" : null,
    eventTitle: kind === "event" ? "Quiz night" : null,
    kind,
    gameId: kind === "game" ? "game-1" : null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Friday quiz",
    languages: "en",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isScreenMuted: false,
    cursor: {
      phaseId: "7",
      status: "running",
      phase,
      roundIndex: 0,
      questionIndex: 0,
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
    lobby: { players: [], teams: [], playerCount: 5 },
    question: {
      questionId: "question-1",
      roundIndex: 0,
      questionIndex: 0,
      roundKind: "quiz",
      type: "multiple_choice",
      prompt: { en: "Which flag?", pt: "Que bandeira?" },
      mediaUrl: null,
      points: 1000,
      timeLimitSeconds: 20,
      options: [
        { id: "a", text: { en: "Rainbow", pt: "Arco-iris" } },
        { id: "b", text: { en: "Trans", pt: "Trans" } },
      ],
    },
    voteOptions: null,
    me: {
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
    },
    suggestedScreenName: "Sam",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
  };
}

function controllerOf(session: QuizshowPlayerState): QuizshowSessionController {
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
    send: vi.fn(),
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

function stageOf(session: QuizshowPlayerState) {
  return (
    <TestProviders>
      <QuizshowPlayerStage controller={controllerOf(session)} />
    </TestProviders>
  );
}

describe("QuizshowReportGameButton", () => {
  beforeEach(() => {
    reportModalProps.mockClear();
  });

  it("files a game report with the session id", async () => {
    render(
      <TestProviders>
        <QuizshowReportGameButton
          sessionId="session-9"
          quizTitle="Friday quiz"
        />
      </TestProviders>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Report this game" }),
    );
    await waitFor(() =>
      expect(reportModalProps).toHaveBeenCalledWith({
        subjectType: "quizshow_game",
        subjectId: "session-9",
        subjectName: "Friday quiz",
        onClose: expect.any(Function),
      }),
    );
  });

  it("shows Report this game on a game's question and reveal views", async () => {
    const { rerender } = render(stageOf(playerStateOf("open", "game")));
    expect(
      await screen.findByRole("button", { name: "Report this game" }),
    ).toBeInTheDocument();
    rerender(stageOf(playerStateOf("reveal", "game")));
    expect(
      await screen.findByRole("button", { name: "Report this game" }),
    ).toBeInTheDocument();
  });

  it("keeps it off event games and off the scores views", async () => {
    const { rerender } = render(stageOf(playerStateOf("open", "event")));
    await screen.findByRole("heading");
    expect(
      screen.queryByRole("button", { name: "Report this game" }),
    ).not.toBeInTheDocument();
    rerender(stageOf(playerStateOf("scores", "game")));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Report this game" }),
      ).not.toBeInTheDocument(),
    );
  });
});
