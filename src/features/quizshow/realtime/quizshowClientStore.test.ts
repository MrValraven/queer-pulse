import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowMe,
  QuizshowMyReveal,
  QuizshowPhaseChangeFrame,
  QuizshowPlayerState,
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowScreenState,
  QuizshowSessionEnd,
  QuizshowStateBase,
} from "../../../shared/contracts/quizshow";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isHostState,
  isPlayerState,
  isScreenState,
  type QuizshowClientState,
} from "./quizshowClientStore";

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
    phaseId: "5",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 2,
    phaseStartedAt: 1_000,
    deadline: 21_000,
    extraTimeDeadline: 31_000,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    ...overrides,
  };
}

function questionWith(questionId: string): QuizshowQuestionView {
  return {
    questionId,
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "true_false",
    prompt: { en: "Is this a question", pt: "Isto e uma pergunta" },
    mediaUrl: null,
    points: 1000,
    timeLimitSeconds: 20,
    options: null,
  };
}

function meWith(overrides: Partial<QuizshowMe> = {}): QuizshowMe {
  return {
    playerId: "p1",
    screenName: "Ana",
    isAvatarShown: false,
    hasExtraTime: false,
    teamId: null,
    isCohostPlayer: false,
    score: 0,
    streak: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    ...overrides,
  };
}

const baseState: Omit<QuizshowStateBase, "cursor"> = {
  sessionId: "s1",
  eventSlug: "quiz-night",
  eventTitle: "Quiz night",
  kind: "event",
  gameId: null,
  isAdultsOnly: false,
  joinCode: "QZ7KP4",
  quizTitle: "Pride quiz",
  languages: "both",
  screenLanguage: "en",
  playMode: "solo",
  maxTeamSize: null,
  isReviewOn: false,
  isScreenMuted: false,
  rounds: [],
  round: null,
  reveal: null,
  scores: null,
  podium: null,
  nextEvent: null,
};

function playerState(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    ...baseState,
    role: "player",
    cursor: cursorWith(),
    lobby: { players: [], teams: [], playerCount: 0 },
    question: questionWith("q1"),
    voteOptions: null,
    me: meWith(),
    suggestedScreenName: "Ana",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
    ...overrides,
  };
}

function screenState(
  overrides: Partial<QuizshowScreenState> = {},
): QuizshowScreenState {
  return {
    ...baseState,
    role: "screen",
    cursor: cursorWith(),
    lobby: { players: [], teams: [], playerCount: 0 },
    question: questionWith("q1"),
    answerCount: null,
    voteOptions: null,
    ...overrides,
  };
}

function hostState(
  overrides: Partial<QuizshowHostState> = {},
): QuizshowHostState {
  return {
    ...baseState,
    role: "host",
    cursor: cursorWith(),
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    reviewList: null,
    ...overrides,
  };
}

function phaseChange(
  cursorOverrides: Partial<QuizshowCursor>,
  frameOverrides: Partial<QuizshowPhaseChangeFrame> = {},
) {
  return {
    event: "phase:change" as const,
    payload: {
      cursor: cursorWith(cursorOverrides),
      round: null,
      question: questionWith("q1"),
      ...frameOverrides,
    },
  };
}

function revealFor(phaseId: string): QuizshowReveal {
  return {
    phaseId,
    questionId: "q1",
    correct: { type: "true_false", isTrue: true },
    answeredCount: 1,
    eligibleCount: 1,
    distribution: { kind: "true_false", trueCount: 1, falseCount: 0 },
  };
}

function myRevealFor(phaseId: string): QuizshowMyReveal {
  return {
    phaseId,
    questionId: "q1",
    hasAnswered: true,
    ownAnswerId: "answer-1",
    isCorrect: true,
    correctPositions: null,
    pointsAwarded: 900,
    streakBonus: 100,
    isJokerActive: false,
    streak: 1,
    score: 900,
    teamScore: null,
    rank: 1,
  };
}

function attached(
  session: QuizshowClientState["session"],
): QuizshowClientState {
  const role = session?.role ?? "player";
  return { ...createQuizshowClientState(role), status: "attached", session };
}

describe("quizshow client store", () => {
  it("takes session:state as the whole truth on attach and on reconnect", () => {
    const stale = attached(playerState({ myReveal: myRevealFor("5") }));
    const fresh = playerState({
      myReveal: null,
      cursor: cursorWith({ phaseId: "9" }),
    });
    const next = applyQuizshowFrame(
      { ...stale, status: "reconnecting" },
      { event: "session:state", payload: fresh },
    );
    expect(next.session).toBe(fresh);
    expect(isPlayerState(next.session) && next.session.myReveal).toBeNull();
    expect(next.status).toBe("attached");
  });

  it("ignores a frame that arrives before the first session:state", () => {
    const next = applyQuizshowFrame(createQuizshowClientState("player"), {
      event: "reveal",
      payload: revealFor("5"),
    });
    expect(next.session).toBeNull();
  });

  it("keeps the question on a pause, which resends the same phase id", () => {
    const state = attached(
      playerState({
        myAnswer: {
          questionId: "q1",
          phaseId: "5",
          payload: { type: "true_false", isTrue: true },
          receivedAt: 2_000,
        },
      }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "5", status: "paused", deadline: null },
        { question: null },
      ),
    );
    expect(next.session?.cursor.status).toBe("paused");
    expect(next.session?.cursor.deadline).toBeNull();
    expect(next.session?.question?.questionId).toBe("q1");
    expect(
      isPlayerState(next.session) && next.session.myAnswer?.questionId,
    ).toBe("q1");
  });

  it("keeps the answer count of a screen on a pause", () => {
    const state = attached(
      screenState({ answerCount: { count: 3, total: 9 } }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange({ phaseId: "5", status: "paused" }),
    );
    expect(isScreenState(next.session) && next.session.answerCount).toEqual({
      count: 3,
      total: 9,
    });
  });

  it("clears last question's answer, vote and reveal when a new question opens", () => {
    const state = attached(
      playerState({
        myAnswer: {
          questionId: "q1",
          phaseId: "5",
          payload: { type: "true_false", isTrue: true },
          receivedAt: 2_000,
        },
        myVote: { questionId: "q1", optionId: "a" },
        myReveal: myRevealFor("6"),
        reveal: revealFor("6"),
        cursor: cursorWith({ phaseId: "6", phase: "reveal" }),
      }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "7", phase: "read" },
        { question: questionWith("q2") },
      ),
    );
    expect(next.session?.question?.questionId).toBe("q2");
    expect(next.session?.reveal).toBeNull();
    expect(isPlayerState(next.session) && next.session.myAnswer).toBeNull();
    expect(isPlayerState(next.session) && next.session.myVote).toBeNull();
    expect(isPlayerState(next.session) && next.session.myReveal).toBeNull();
  });
});

describe("quizshow client store, scores across phases", () => {
  const scoresFor = (phaseId: string) => ({
    phaseId,
    scope: "question" as const,
    entries: [
      {
        rank: 1,
        kind: "player" as const,
        entrantId: "p1",
        name: "Ana",
        colorKey: null,
        score: 900,
        previousScore: 0,
      },
    ],
    entrantCount: 1,
  });
  const myScoresFor = (phaseId: string) => ({
    phaseId,
    rank: 1,
    score: 900,
    previousScore: 0,
    ownScore: 900,
  });

  it("drops the question's scores when the leaderboard opens", () => {
    const onScores = attached(
      playerState({
        cursor: cursorWith({ phaseId: "8", phase: "scores", deadline: null }),
        scores: scoresFor("8"),
        myScores: myScoresFor("8"),
      }),
    );
    const next = applyQuizshowFrame(
      onScores,
      phaseChange(
        { phaseId: "9", phase: "leaderboard", deadline: null },
        { question: null },
      ),
    );
    expect(next.session?.scores).toBeNull();
    expect(isPlayerState(next.session) && next.session.myScores).toBeNull();
    const withLeaderboard = applyQuizshowFrame(next, {
      event: "scores",
      payload: { ...scoresFor("9"), scope: "round" },
    });
    expect(withLeaderboard.session?.scores).toMatchObject({
      phaseId: "9",
      scope: "round",
    });
  });

  it("keeps the scores through a pause, which resends the same phase id", () => {
    const onScores = attached(
      screenState({
        cursor: cursorWith({ phaseId: "8", phase: "scores", deadline: null }),
        scores: scoresFor("8"),
      }),
    );
    const paused = applyQuizshowFrame(
      onScores,
      phaseChange({
        phaseId: "8",
        phase: "scores",
        status: "paused",
        deadline: null,
      }),
    );
    expect(paused.session?.scores).toEqual(scoresFor("8"));
  });
});

describe("quizshow client store, frames after the first state", () => {
  it("drops a reveal whose phase id has passed", () => {
    const state = attached(playerState());
    const moved = applyQuizshowFrame(
      state,
      phaseChange({ phaseId: "8", phase: "reveal" }),
    );
    const next = applyQuizshowFrame(moved, {
      event: "reveal",
      payload: revealFor("7"),
    });
    expect(next.session?.reveal).toBeNull();
    const accepted = applyQuizshowFrame(moved, {
      event: "reveal",
      payload: revealFor("8"),
    });
    expect(accepted.session?.reveal?.phaseId).toBe("8");
  });

  it("drops an answer count for another phase", () => {
    const state = attached(screenState());
    const stale = applyQuizshowFrame(state, {
      event: "answer:count",
      payload: { phaseId: "4", count: 2, total: 5 },
    });
    expect(
      isScreenState(stale.session) && stale.session.answerCount,
    ).toBeNull();
    const current = applyQuizshowFrame(state, {
      event: "answer:count",
      payload: { phaseId: "5", count: 2, total: 5 },
    });
    expect(
      isScreenState(current.session) && current.session.answerCount,
    ).toEqual({ count: 2, total: 5 });
  });

  it("clears the pending answer once session:state carries it", () => {
    const pendingAnswer = {
      phaseId: "5",
      questionId: "q1",
      payload: { type: "true_false", isTrue: true },
    } as const;
    const base = { ...createQuizshowClientState("player"), pendingAnswer };
    const answered = applyQuizshowFrame(base, {
      event: "session:state",
      payload: playerState({
        myAnswer: {
          questionId: "q1",
          phaseId: "5",
          payload: pendingAnswer.payload,
          receivedAt: 2_000,
        },
      }),
    });
    expect(answered.pendingAnswer).toBeNull();
    const unanswered = applyQuizshowFrame(base, {
      event: "session:state",
      payload: playerState({ myAnswer: null }),
    });
    expect(unanswered.pendingAnswer).toEqual(pendingAnswer);
    const passed = applyQuizshowFrame(base, {
      event: "session:state",
      payload: playerState({
        myAnswer: null,
        cursor: cursorWith({ phaseId: "6" }),
      }),
    });
    expect(passed.pendingAnswer).toBeNull();
  });

  it("clears the pending answer when the phase moves past its question", () => {
    const pendingAnswer = {
      phaseId: "5",
      questionId: "q1",
      payload: { type: "true_false", isTrue: true },
    } as const;
    const state = { ...attached(playerState()), pendingAnswer };
    const moved = applyQuizshowFrame(
      state,
      phaseChange({ phaseId: "6", phase: "reveal" }),
    );
    expect(moved.pendingAnswer).toBeNull();
    const nextQuestion = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "7", phase: "read" },
        { question: questionWith("q2") },
      ),
    );
    expect(nextQuestion.pendingAnswer).toBeNull();
  });

  it("keeps the pending answer on a pause, which resends the same phase id", () => {
    const pendingAnswer = {
      phaseId: "5",
      questionId: "q1",
      payload: { type: "true_false", isTrue: true },
    } as const;
    const state = { ...attached(playerState()), pendingAnswer };
    const paused = applyQuizshowFrame(
      state,
      phaseChange({ phaseId: "5", status: "paused", deadline: null }),
    );
    expect(paused.pendingAnswer).toEqual(pendingAnswer);
  });

  it("makes a late joiner eligible when the next question opens", () => {
    const state = attached(playerState({ isEligibleForQuestion: false }));
    const sameQuestion = applyQuizshowFrame(
      state,
      phaseChange({ phaseId: "6", phase: "reveal" }),
    );
    expect(
      isPlayerState(sameQuestion.session) &&
        sameQuestion.session.isEligibleForQuestion,
    ).toBe(false);
    const nextQuestion = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "7", phase: "read" },
        { question: questionWith("q2") },
      ),
    );
    expect(
      isPlayerState(nextQuestion.session) &&
        nextQuestion.session.isEligibleForQuestion,
    ).toBe(true);
  });
});

describe("quizshow client store, restart recovery", () => {
  const pendingAnswer = {
    phaseId: "5",
    questionId: "q1",
    payload: { type: "true_false", isTrue: true },
  } as const;

  function pausedByRestart(isEligibleForQuestion = false): QuizshowClientState {
    const session = playerState({
      cursor: cursorWith({
        phaseId: "5",
        status: "paused",
        phase: "open",
        deadline: null,
        extraTimeDeadline: null,
        isRestartRecovery: true,
      }),
      myAnswer: {
        questionId: "q1",
        phaseId: "5",
        payload: pendingAnswer.payload,
        receivedAt: 2_000,
      },
      myVote: { questionId: "q1", optionId: "a" },
      myReveal: myRevealFor("5"),
      isEligibleForQuestion,
    });
    return { ...attached(session), pendingAnswer };
  }

  it("a restart replay of the same question clears the answer and makes the player eligible", () => {
    const replay = phaseChange(
      { phaseId: "6", phase: "read", status: "running" },
      { question: questionWith("q1") },
    );
    const next = applyQuizshowFrame(pausedByRestart(), replay);
    const session = isPlayerState(next.session) ? next.session : null;
    expect(session?.question?.questionId).toBe("q1");
    expect(session?.cursor.phaseId).toBe("6");
    expect(session?.cursor.isRestartRecovery).toBe(false);
    expect(session?.myAnswer).toBeNull();
    expect(session?.myVote).toBeNull();
    expect(session?.myReveal).toBeNull();
    expect(session?.isEligibleForQuestion).toBe(true);
    expect(next.pendingAnswer).toBeNull();

    const ordinaryPause = pausedByRestart();
    const ordinarySession = isPlayerState(ordinaryPause.session)
      ? ordinaryPause.session
      : null;
    if (ordinarySession === null) throw new Error("expected a player state");
    const withoutRecovery = applyQuizshowFrame(
      {
        ...ordinaryPause,
        session: {
          ...ordinarySession,
          cursor: { ...ordinarySession.cursor, isRestartRecovery: false },
        },
      },
      replay,
    );
    const keptSession = isPlayerState(withoutRecovery.session)
      ? withoutRecovery.session
      : null;
    expect(keptSession?.myAnswer?.questionId).toBe("q1");
    expect(keptSession?.isEligibleForQuestion).toBe(false);
  });

  it("a paused restart recovery keeps the answer until the replay opens", () => {
    const stillPaused = applyQuizshowFrame(
      pausedByRestart(),
      phaseChange(
        {
          phaseId: "5",
          status: "paused",
          phase: "open",
          deadline: null,
          isRestartRecovery: true,
        },
        { question: questionWith("q1") },
      ),
    );
    const pausedSession = isPlayerState(stillPaused.session)
      ? stillPaused.session
      : null;
    expect(pausedSession?.myAnswer?.questionId).toBe("q1");
    expect(pausedSession?.myVote).toEqual({ questionId: "q1", optionId: "a" });
    expect(pausedSession?.isEligibleForQuestion).toBe(false);
    expect(stillPaused.pendingAnswer).toEqual(pendingAnswer);

    const replayed = applyQuizshowFrame(
      stillPaused,
      phaseChange(
        { phaseId: "6", phase: "read", status: "running" },
        { question: questionWith("q1") },
      ),
    );
    const replayedSession = isPlayerState(replayed.session)
      ? replayed.session
      : null;
    expect(replayedSession?.myAnswer).toBeNull();
    expect(replayedSession?.isEligibleForQuestion).toBe(true);
    expect(replayed.pendingAnswer).toBeNull();
  });

  it("a restart pause that reports eligibility keeps the player eligible through the replay", () => {
    const paused = pausedByRestart(true);
    expect(
      isPlayerState(paused.session) && paused.session.isEligibleForQuestion,
    ).toBe(true);
    const replayed = applyQuizshowFrame(
      paused,
      phaseChange(
        { phaseId: "6", phase: "read", status: "running" },
        { question: questionWith("q1") },
      ),
    );
    const replayedSession = isPlayerState(replayed.session)
      ? replayed.session
      : null;
    expect(replayedSession?.isEligibleForQuestion).toBe(true);
    expect(replayedSession?.myAnswer).toBeNull();
  });

  it("settles a resent answer only while it is still the pending one", () => {
    const newerPending = {
      phaseId: "7",
      questionId: "q2",
      payload: { type: "true_false", isTrue: false },
    } as const;
    const onSecondQuestion = {
      ...attached(
        playerState({
          cursor: cursorWith({ phaseId: "7" }),
          question: questionWith("q2"),
        }),
      ),
      pendingAnswer: newerPending,
    };
    const keptNewer = applyQuizshowFrame(onSecondQuestion, {
      event: "local:pendingAnswerSettled",
      payload: pendingAnswer,
    });
    expect(keptNewer.pendingAnswer).toEqual(newerPending);

    const settled = applyQuizshowFrame(onSecondQuestion, {
      event: "local:pendingAnswerSettled",
      payload: newerPending,
    });
    expect(settled.pendingAnswer).toBeNull();

    const staleQuestion = applyQuizshowFrame(
      { ...onSecondQuestion, pendingAnswer },
      { event: "local:pendingAnswerSettled", payload: newerPending },
    );
    expect(staleQuestion.pendingAnswer).toBeNull();
  });
});

describe("quizshow client store, hiding and ending", () => {
  it("takes a hidden answer off the vote options and the reveal at once", () => {
    const hostSession = hostState({
      cursor: cursorWith({ phaseId: "7", phase: "vote" }),
      voteOptions: {
        phaseId: "7",
        questionId: "q1",
        ownOptionId: null,
        options: [
          {
            optionId: "o1",
            text: "one",
            answerId: "a1",
            authorName: "Ana",
            isTruth: false,
          },
          {
            optionId: "o2",
            text: "two",
            answerId: "a2",
            authorName: "Bia",
            isTruth: false,
          },
        ],
      },
      reviewList: {
        phaseId: "6",
        questionId: "q1",
        submissions: [
          {
            answerId: "a1",
            playerId: "p1",
            screenName: "Ana",
            text: "one",
            isHidden: false,
            receivedAt: 1,
          },
          {
            answerId: "a2",
            playerId: "p2",
            screenName: "Bia",
            text: "two",
            isHidden: false,
            receivedAt: 2,
          },
        ],
      },
      reveal: {
        ...revealFor("7"),
        distribution: {
          kind: "votes",
          favouriteOptionId: null,
          entries: [
            {
              optionId: "o1",
              answerId: "a1",
              text: "one",
              authorName: "Ana",
              isTruth: false,
              voteCount: 1,
              authorPoints: 250,
            },
            {
              optionId: "o2",
              answerId: "a2",
              text: "two",
              authorName: "Bia",
              isTruth: false,
              voteCount: 0,
              authorPoints: 0,
            },
          ],
        },
      },
    });
    const next = applyQuizshowFrame(attached(hostSession), {
      event: "answer:hidden",
      payload: { questionId: "q1", answerId: "a1", optionId: "o1" },
    });
    expect(
      isHostState(next.session) &&
        next.session.voteOptions?.options.map((option) => option.optionId),
    ).toEqual(["o2"]);
    const distribution = next.session?.reveal?.distribution;
    expect(
      distribution?.kind === "votes" &&
        distribution.entries.map((entry) => entry.answerId),
    ).toEqual(["a2"]);
    expect(
      isHostState(next.session) &&
        next.session.reviewList?.submissions.map((row) => row.isHidden),
    ).toEqual([true, false]);
  });

  it("ends the session for a removed player", () => {
    const next = applyQuizshowFrame(attached(playerState()), {
      event: "player:removed",
      payload: { sessionId: "s1" },
    });
    expect(next.isRemoved).toBe(true);
    expect(next.status).toBe("ended");
  });

  it("turns session:end into the ended phase with its podium", () => {
    const end: QuizshowSessionEnd = {
      sessionId: "s1",
      status: "finished",
      podium: [
        {
          place: 1,
          kind: "player",
          entrantId: "p1",
          name: "Ana",
          colorKey: null,
          score: 3000,
        },
      ],
      nextEvent: {
        slug: "next-quiz",
        title: "Next quiz",
        startAt: "2026-11-01T20:00:00.000Z",
      },
      hasResults: true,
    };
    const next = applyQuizshowFrame(attached(screenState()), {
      event: "session:end",
      payload: end,
    });
    expect(next.status).toBe("ended");
    expect(next.sessionEnd).toBe(end);
    expect(next.session?.cursor.phase).toBe("ended");
    expect(next.session?.cursor.status).toBe("finished");
    expect(next.session?.podium).toEqual(end.podium);
    expect(next.session?.nextEvent).toEqual(end.nextEvent);
  });

  it("takes the shared screen mute from screen:muted", () => {
    const next = applyQuizshowFrame(
      attached(hostState({ isScreenMuted: false })),
      {
        event: "screen:muted",
        payload: { isMuted: true },
      },
    );
    expect(next.session?.isScreenMuted).toBe(true);
  });
});
