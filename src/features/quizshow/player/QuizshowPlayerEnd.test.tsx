import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowPlayerState,
  QuizshowPodiumEntry,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowPlayerEnd } from "./QuizshowPlayerEnd";

const OWN_TEAM_ID = "team-quokkas";

/** Four teams tied on 2nd: one more than a step lists, the player's own team last. */
const TIED_SECOND_TEAMS: Omit<QuizshowPodiumEntry, "kind" | "colorKey">[] = [
  { entrantId: "team-gold", name: "Gold Stars", place: 1, score: 3000 },
  { entrantId: "team-ana", name: "Disco Inferno", place: 2, score: 2000 },
  { entrantId: "team-bo", name: "Spill the Tea", place: 2, score: 2000 },
  { entrantId: "team-cleo", name: "Queens of Trivia", place: 2, score: 2000 },
  { entrantId: OWN_TEAM_ID, name: "Quokkas", place: 2, score: 2000 },
];

const TIED_SECOND: QuizshowPodiumEntry[] = TIED_SECOND_TEAMS.map((entry) => ({
  ...entry,
  kind: "team" as const,
  colorKey: null,
}));

function endedTeamsSession(): QuizshowPlayerState {
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
    maxTeamSize: 4,
    isReviewOn: true,
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: {
      phaseId: "99",
      status: "running",
      phase: "podium",
      roundIndex: 0,
      questionIndex: 0,
      roundCount: 1,
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      roundNumber: 1,
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
    podium: TIED_SECOND,
    nextEvent: null,
    wheel: null,
    wheelBonus: null,
    role: "player",
    lobby: { teams: [], playerCount: 12 },
    answerCount: null,
    question: null,
    voteOptions: null,
    me: {
      playerId: "player-1",
      screenName: "Sam",
      isAvatarShown: false,
      hasExtraTime: false,
      teamId: OWN_TEAM_ID,
      isCohostPlayer: false,
      score: 2000,
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

function endStateOf(session: QuizshowPlayerState): QuizshowClientState {
  return {
    ...createQuizshowClientState("player"),
    status: "attached",
    hasAttached: true,
    session,
  };
}

describe("QuizshowPlayerEnd podium", () => {
  it("lists the player's own team first on a crowded tied step and marks it", async () => {
    render(
      <TestProviders>
        <ReducedMotionContext.Provider value>
          <QuizshowPlayerEnd
            state={endStateOf(endedTeamsSession())}
            kind="event"
            eventSlug="quiz-night"
          />
        </ReducedMotionContext.Provider>
      </TestProviders>,
    );
    const ownTeamName = await screen.findByText("Quokkas");
    expect(ownTeamName.closest('[aria-current="true"]')).not.toBeNull();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
    // The fourth tied team gives up its line to the player's own.
    expect(screen.queryByText("Queens of Trivia")).toBeNull();
  });
});
