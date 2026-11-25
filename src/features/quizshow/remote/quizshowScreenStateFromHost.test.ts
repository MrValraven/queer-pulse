import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowLeaderboardEntry,
  QuizshowPodiumEntry,
} from "../../../shared/contracts/quizshow";
import { screenStateFromHost } from "./quizshowScreenStateFromHost";

const CURSOR: QuizshowCursor = {
  phaseId: "7",
  status: "running",
  phase: "read",
  roundIndex: 0,
  questionIndex: 0,
  roundCount: 2,
  phaseStartedAt: 1_000,
  deadline: 6_000,
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
};

const QUESTION: QuizshowHostQuestionView = {
  questionId: "question-1",
  roundIndex: 0,
  questionIndex: 0,
  roundKind: "quiz",
  type: "multiple_choice",
  prompt: { en: "Which flag has pink and blue?", pt: "Que bandeira?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 20,
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant",
  numberUnit: { en: "", pt: "" },
  readMs: 4000,
  options: [
    { id: "option-a", text: { en: "Rainbow", pt: "Arco-íris" } },
    { id: "option-b", text: { en: "Trans", pt: "Trans" } },
  ],
  answerKey: { type: "multiple_choice", correctIndexes: [1] },
  revealNote: { en: "Made in 1999", pt: "Criada em 1999" },
};

function leaderboardEntry(
  rank: number,
  entrantId: string,
): QuizshowLeaderboardEntry {
  return {
    rank,
    kind: "player",
    entrantId,
    name: entrantId,
    colorKey: null,
    score: 1000 * (4 - rank),
    previousScore: 0,
    streak: 0,
  };
}

function podiumEntry(place: 1 | 2 | 3, entrantId: string): QuizshowPodiumEntry {
  return {
    place,
    kind: "player",
    entrantId,
    name: entrantId,
    colorKey: null,
    score: 1000 * (4 - place),
  };
}

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
    screenLanguage: "both",
    playMode: "teams",
    maxTeamSize: null,
    isReviewOn: true,
    isPractice: true,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor: CURSOR,
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    wheel: null,
    wheelBonus: null,
    lobby: {
      players: [
        {
          playerId: "player-1",
          screenName: "Rita",
          teamId: "team-1",
          avatarUrl: "avatars/rita.webp",
          isCohostPlayer: true,
          hasExtraTime: true,
          hasUsedJoker: false,
          score: 2400,
          streak: 3,
          isConnected: true,
          disconnectedAt: null,
          joinedAt: 1_000,
        },
      ],
      teams: [
        {
          teamId: "team-1",
          name: "Sparkle",
          colorKey: "star",
          memberCount: 1,
          isHostMade: true,
          score: 2400,
          hasUsedJoker: false,
        },
      ],
      playerCount: 1,
    },
    question: QUESTION,
    answerCount: { count: 1, total: 3 },
    voteOptions: null,
    reviewList: {
      phaseId: "7",
      questionId: "question-1",
      submissions: [],
    },
    pairedDevices: [
      {
        pairingId: "pairing-1",
        kind: "helper",
        helperName: "Nuno",
        pairedAt: 900,
        isConnected: true,
      },
    ],
    typedAnswers: null,
    guestPushSentAt: 1_200,
    ...overrides,
  };
}

describe("screenStateFromHost", () => {
  it("strips every host-only field and keeps the base as it is", () => {
    const host = hostState();
    const screenState = screenStateFromHost(host);

    expect(screenState.role).toBe("screen");
    expect(screenState).not.toHaveProperty("pairedDevices");
    expect(screenState).not.toHaveProperty("typedAnswers");
    expect(screenState).not.toHaveProperty("guestPushSentAt");
    expect(screenState).not.toHaveProperty("reviewList");
    expect(screenState.question).not.toHaveProperty("answerKey");
    expect(screenState.question).not.toHaveProperty("revealNote");
    expect(screenState.question?.prompt).toEqual(QUESTION.prompt);
    expect(screenState.question?.readMs).toBe(4000);
    expect(screenState.answerCount).toEqual({ count: 1, total: 3 });
    expect(screenState.isPractice).toBe(true);
    expect(screenState.screenLanguage).toBe("both");
    expect(screenState.cursor).toEqual(CURSOR);
    // The host's own state is left as it was.
    expect(host.question).toHaveProperty("answerKey");
  });

  it("keeps the roster's names, teams and avatars without the host columns", () => {
    const screenState = screenStateFromHost(hostState());

    expect(screenState.lobby).toEqual({
      players: [
        {
          playerId: "player-1",
          screenName: "Rita",
          teamId: "team-1",
          avatarUrl: "avatars/rita.webp",
        },
      ],
      teams: [
        {
          teamId: "team-1",
          name: "Sparkle",
          colorKey: "star",
          memberCount: 1,
          isHostMade: true,
        },
      ],
      playerCount: 1,
    });
  });

  it("drops the authors and the truth from the vote options", () => {
    const screenState = screenStateFromHost(
      hostState({
        question: null,
        voteOptions: {
          phaseId: "7",
          questionId: "question-2",
          ownOptionId: null,
          options: [
            {
              optionId: "option-1",
              text: "a disco in Porto",
              answerId: "answer-1",
              authorName: "Nuno",
              isTruth: false,
            },
            {
              optionId: "option-truth",
              text: "a bookshop",
              answerId: null,
              authorName: null,
              isTruth: true,
            },
          ],
        },
      }),
    );

    expect(screenState.voteOptions?.options).toEqual([
      { optionId: "option-1", text: "a disco in Porto" },
      { optionId: "option-truth", text: "a bookshop" },
    ]);
  });

  it("leaves out the podium places the host has not revealed", () => {
    const screenState = screenStateFromHost(
      hostState({
        question: null,
        cursor: { ...CURSOR, phase: "podium", podiumRevealedCount: 1 },
        podium: [
          podiumEntry(1, "first"),
          podiumEntry(2, "second"),
          podiumEntry(3, "third"),
        ],
        scores: {
          phaseId: "7",
          scope: "final",
          entrantCount: 4,
          entries: [
            leaderboardEntry(1, "first"),
            leaderboardEntry(2, "second"),
            leaderboardEntry(3, "third"),
            leaderboardEntry(4, "fourth"),
          ],
        },
      }),
    );

    expect(screenState.podium?.map((entry) => entry.entrantId)).toEqual([
      "third",
    ]);
    expect(screenState.scores?.entries.map((entry) => entry.entrantId)).toEqual(
      ["third", "fourth"],
    );
    expect(screenState.scores?.entrantCount).toBe(4);
  });
});
