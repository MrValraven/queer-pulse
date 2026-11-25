import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowMe,
  QuizshowMyReveal,
  QuizshowMyScores,
  QuizshowPhaseChangeFrame,
  QuizshowPlayerState,
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowRoundCard,
  QuizshowScreenState,
  QuizshowSessionEnd,
  QuizshowSessionState,
  QuizshowStateBase,
  QuizshowWheelBonusView,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isHostState,
  isPlayerState,
  isScreenState,
  type QuizshowClientAction,
  type QuizshowClientState,
} from "./quizshowClientStore";
import { placesMovedOf } from "../player/quizshowPhoneScores";

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
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
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
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    numberUnit: { en: "", pt: "" },
    readMs: 4000,
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
  isPractice: false,
  isJoinLocked: false,
  isAutoAdvanceOn: false,
  giving: null,
  isScreenMuted: false,
  rounds: [],
  round: null,
  reveal: null,
  scores: null,
  podium: null,
  nextEvent: null,
  wheel: null,
  wheelBonus: null,
};

function playerState(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    ...baseState,
    role: "player",
    cursor: cursorWith(),
    lobby: { teams: [], playerCount: 0 },
    answerCount: null,
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
    pairedDevices: [],
    typedAnswers: null,
    guestPushSentAt: null,
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
      wheel: null,
      wheelBonus: null,
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
    note: null,
    wasCorrected: false,
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
        streak: 0,
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
      payload: { sessionId: "s1", canRejoin: false },
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
      isPractice: false,
      giving: null,
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

function wheelViewWith(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 1,
    pick: "round",
    slices: [
      {
        roundIndex: 0,
        title: { en: "Music", pt: "Musica" },
        kind: "quiz",
        contentLabel: "none",
        wheelBonus: 500,
        questionCount: 3,
        isPlayed: false,
      },
    ],
    spinNumber: 1,
    spinTotal: 1,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function wheelBonusWith(): QuizshowWheelBonusView {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 0,
    sliceTitle: { en: "Music", pt: "Musica" },
    winners: [{ entrantId: "p1", kind: "player", name: "Ana", colorKey: null }],
  };
}

describe("wheel frames", () => {
  it("copies the wheel view and the bonus off a new phase for screen, player and host", () => {
    const wheel = wheelViewWith();
    const wheelBonus = wheelBonusWith();
    const sessions = [screenState(), playerState(), hostState()];
    for (const session of sessions) {
      const next = applyQuizshowFrame(
        attached(session),
        phaseChange(
          { phaseId: "6", phase: "wheel", roundIndex: 1 },
          { wheel, wheelBonus },
        ),
      );
      expect(next.session?.wheel).toEqual(wheel);
      expect(next.session?.wheelBonus).toEqual(wheelBonus);
    }
  });

  it("keeps the wheel on a same-phase re-send", () => {
    const wheel = wheelViewWith();
    const wheelBonus = wheelBonusWith();
    const state = attached(
      screenState({
        cursor: cursorWith({ phaseId: "6", phase: "wheel" }),
        wheel,
        wheelBonus,
      }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "6", phase: "wheel", status: "paused" },
        { wheel: null, wheelBonus: null },
      ),
    );
    expect(next.session?.wheel).toEqual(wheel);
    expect(next.session?.wheelBonus).toEqual(wheelBonus);
    expect(next.session?.cursor.status).toBe("paused");
  });

  it("clears the wheel when the next phase carries none", () => {
    const wheelBonus = wheelBonusWith();
    const state = attached(
      screenState({
        cursor: cursorWith({ phaseId: "6", phase: "wheel" }),
        wheel: wheelViewWith(),
      }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "7", phase: "leaderboard" },
        { wheel: null, wheelBonus },
      ),
    );
    expect(next.session?.wheel).toBeNull();
    expect(next.session?.wheelBonus).toEqual(wheelBonus);
  });

  it("clears a held bonus when a new phase carries none", () => {
    const state = attached(
      screenState({
        cursor: cursorWith({ phaseId: "7", phase: "leaderboard" }),
        wheelBonus: wheelBonusWith(),
      }),
    );
    const next = applyQuizshowFrame(
      state,
      phaseChange(
        { phaseId: "8", phase: "round_intro" },
        { wheel: null, wheelBonus: null },
      ),
    );
    expect(next.session?.wheelBonus).toBeNull();
  });

  it("reads a frame without wheel fields as null", () => {
    const payload: Record<string, unknown> = {
      ...phaseChange({ phaseId: "7", phase: "leaderboard" }).payload,
    };
    delete payload.wheel;
    delete payload.wheelBonus;
    const state = attached(
      screenState({
        cursor: cursorWith({ phaseId: "6", phase: "wheel" }),
        wheel: wheelViewWith(),
        wheelBonus: wheelBonusWith(),
      }),
    );
    const next = applyQuizshowFrame(state, {
      event: "phase:change",
      payload,
    } as unknown as QuizshowClientAction);
    expect(next.session?.wheel).toBeNull();
    expect(next.session?.wheelBonus).toBeNull();
  });

  it("reads a session state without wheel fields as null", () => {
    const legacyState: Record<string, unknown> = { ...screenState() };
    delete legacyState.wheel;
    delete legacyState.wheelBonus;
    const next = applyQuizshowFrame(createQuizshowClientState("screen"), {
      event: "session:state",
      payload: legacyState,
    } as unknown as QuizshowClientAction);
    expect(next.session?.wheel).toBeNull();
    expect(next.session?.wheelBonus).toBeNull();
  });
});

describe("Pulse Live v2 frames", () => {
  it("typed:answers sets the host's typed answer groups", () => {
    const typedAnswers = {
      phaseId: "5",
      questionId: "q1",
      groups: [{ normalisedText: "lisboa", sampleText: "Lisboa", count: 2 }],
    };
    const next = applyQuizshowFrame(attached(hostState()), {
      event: "typed:answers",
      payload: typedAnswers,
    });
    expect(isHostState(next.session) && next.session.typedAnswers).toEqual(
      typedAnswers,
    );
  });

  it("reactions replaces the burst with the next sequence for screen and host, and players ignore it", () => {
    const frame = {
      event: "reactions" as const,
      payload: { counts: { heart: 2 } },
    };
    const first = applyQuizshowFrame(attached(screenState()), frame);
    expect(first.reactionBurst).toEqual({ counts: { heart: 2 }, sequence: 1 });
    const second = applyQuizshowFrame(first, frame);
    expect(second.reactionBurst).toEqual({ counts: { heart: 2 }, sequence: 2 });
    const onHost = applyQuizshowFrame(attached(hostState()), frame);
    expect(onHost.reactionBurst?.sequence).toBe(1);
    const onPlayer = applyQuizshowFrame(attached(playerState()), frame);
    expect(onPlayer.reactionBurst).toBeNull();
  });

  it("devices:update sets the host's paired devices", () => {
    const devices = [
      {
        pairingId: "pairing-1",
        kind: "screen" as const,
        helperName: null,
        pairedAt: 1_000,
        isConnected: true,
      },
    ];
    const next = applyQuizshowFrame(attached(hostState()), {
      event: "devices:update",
      payload: { devices },
    });
    expect(isHostState(next.session) && next.session.pairedDevices).toEqual(
      devices,
    );
  });

  it("device:unpaired refuses with its code", () => {
    const next = applyQuizshowFrame(attached(screenState()), {
      event: "device:unpaired",
      payload: { pairingId: "pairing-1" },
    });
    expect(next.status).toBe("refused");
    expect(next.refusalCode).toBe("quizshow_device_unpaired");
  });

  it("session:rematch after session:end is kept", () => {
    const ended = applyQuizshowFrame(attached(playerState()), {
      event: "session:end",
      payload: {
        sessionId: "s1",
        status: "finished",
        podium: [],
        nextEvent: null,
        hasResults: true,
        isPractice: false,
        giving: null,
      },
    });
    expect(ended.status).toBe("ended");
    const rematch = {
      fromSessionId: "s1",
      sessionId: "s2",
      joinCode: "RM4TCH",
      playMode: "solo" as const,
    };
    const next = applyQuizshowFrame(ended, {
      event: "session:rematch",
      payload: rematch,
    });
    expect(next.rematch).toEqual(rematch);
    expect(next.status).toBe("ended");
  });

  it("session:flags writes the join lock and auto-advance on every role", () => {
    for (const session of [screenState(), playerState(), hostState()]) {
      const next = applyQuizshowFrame(attached(session), {
        event: "session:flags",
        payload: { isJoinLocked: true, isAutoAdvanceOn: true },
      });
      expect(next.session?.isJoinLocked).toBe(true);
      expect(next.session?.isAutoAdvanceOn).toBe(true);
    }
  });

  it("answer:count writes the player's answer count for the current phase only", () => {
    const state = attached(playerState());
    const stale = applyQuizshowFrame(state, {
      event: "answer:count",
      payload: { phaseId: "4", count: 2, total: 5 },
    });
    expect(
      isPlayerState(stale.session) && stale.session.answerCount,
    ).toBeNull();
    const current = applyQuizshowFrame(state, {
      event: "answer:count",
      payload: { phaseId: "5", count: 2, total: 5 },
    });
    expect(
      isPlayerState(current.session) && current.session.answerCount,
    ).toEqual({ count: 2, total: 5 });
  });

  it("podium stores the revealed places and mirrors the count on the cursor", () => {
    const onPodium = attached(
      screenState({
        cursor: cursorWith({
          phaseId: "9",
          phase: "podium",
          deadline: null,
          podiumRevealedCount: 0,
        }),
      }),
    );
    const third = {
      place: 3 as const,
      kind: "player" as const,
      entrantId: "p3",
      name: "Caio",
      colorKey: null,
      score: 1200,
    };
    const next = applyQuizshowFrame(onPodium, {
      event: "podium",
      payload: { phaseId: "9", entries: [third], revealedCount: 1 },
    });
    expect(next.session?.podium).toEqual([third]);
    expect(next.session?.cursor.podiumRevealedCount).toBe(1);
    const stale = applyQuizshowFrame(onPodium, {
      event: "podium",
      payload: { phaseId: "8", entries: [third], revealedCount: 1 },
    });
    expect(stale.session?.cursor.podiumRevealedCount).toBe(0);
  });

  it("lobby:update stores teams and a count only for a player", () => {
    const team = {
      teamId: "t1",
      name: "Owls",
      colorKey: "circle_2" as const,
      memberCount: 2,
      isHostMade: true,
    };
    const next = applyQuizshowFrame(attached(playerState()), {
      event: "lobby:update",
      payload: { teams: [team], playerCount: 2 },
    });
    expect(isPlayerState(next.session) && next.session.lobby).toEqual({
      teams: [team],
      playerCount: 2,
    });
  });

  it("player:removed keeps whether the player may rejoin", () => {
    const next = applyQuizshowFrame(attached(playerState()), {
      event: "player:removed",
      payload: { sessionId: "s1", canRejoin: true },
    });
    expect(next.isRemoved).toBe(true);
    expect(next.canRejoinAfterRemoval).toBe(true);
  });
});

describe("Pulse Live v2 connection status", () => {
  it("local:status marks the first attach and writes the retry cause only when given", () => {
    const start = createQuizshowClientState("player");
    expect(start.hasAttached).toBe(false);
    const retrying = applyQuizshowFrame(start, {
      event: "local:status",
      payload: {
        status: "reconnecting",
        refusalCode: null,
        retryCause: "offline",
      },
    });
    expect(retrying.retryCause).toBe("offline");
    expect(retrying.hasAttached).toBe(false);
    const stillRetrying = applyQuizshowFrame(retrying, {
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });
    expect(stillRetrying.retryCause).toBe("offline");
    const attachedState = applyQuizshowFrame(stillRetrying, {
      event: "local:status",
      payload: { status: "attached", refusalCode: null, retryCause: null },
    });
    expect(attachedState.hasAttached).toBe(true);
    expect(attachedState.retryCause).toBeNull();
    const dropped = applyQuizshowFrame(attachedState, {
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });
    expect(dropped.hasAttached).toBe(true);
  });

  it("session:state marks the first attach too", () => {
    const next = applyQuizshowFrame(createQuizshowClientState("screen"), {
      event: "session:state",
      payload: screenState(),
    });
    expect(next.hasAttached).toBe(true);
  });
});

function joinedAt(session: QuizshowSessionState): QuizshowClientState {
  return applyQuizshowFrame(createQuizshowClientState(session.role), {
    event: "session:state",
    payload: session,
  });
}

function applyAll(
  start: QuizshowClientState,
  actions: QuizshowClientAction[],
): QuizshowClientState {
  return actions.reduce(applyQuizshowFrame, start);
}

const warmUpRound: QuizshowRoundCard = {
  roundIndex: 0,
  kind: "quiz",
  title: { en: "Warm up", pt: "Aquecimento" },
  contentLabel: "none",
  questionCount: 3,
  isJokerAllowed: false,
  isSpeedBonusOn: false,
  isWarmUp: true,
  talkSeconds: 0,
};

const ackedAnswer = {
  questionId: "q1",
  phaseId: "5",
  payload: { type: "true_false" as const, isTrue: true },
  receivedAt: 2_000,
};

function myScoresWith(phaseId: string, rank: number): QuizshowMyScores {
  return { phaseId, rank, score: 900, previousScore: 0, ownScore: 900 };
}

describe("Pulse Live v2 night log (R2)", () => {
  it("fills the night log across a question from the frames the phone received", () => {
    const start = joinedAt(
      playerState({ cursor: cursorWith({ phase: "open", phaseId: "5" }) }),
    );
    expect(start.nightLog).toHaveLength(1);
    expect(start.nightLog[0]?.myAnswer).toBeNull();
    const next = applyAll(start, [
      { event: "answer:ack", payload: ackedAnswer },
      phaseChange({ phase: "reveal", phaseId: "6", deadline: null }),
      {
        event: "reveal",
        payload: { ...revealFor("6"), note: { en: "Yes", pt: "Sim" } },
      },
      { event: "reveal:mine", payload: myRevealFor("6") },
    ]);
    const entry = next.nightLog[0];
    expect(next.nightLog).toHaveLength(1);
    expect(entry?.myAnswer).toEqual(ackedAnswer);
    expect(entry?.myReveal).toEqual(myRevealFor("6"));
    expect(entry?.correct).toEqual({ type: "true_false", isTrue: true });
    expect(entry?.note).toEqual({ en: "Yes", pt: "Sim" });
    expect(entry?.isWarmUp).toBe(false);
  });

  it("overwrites the entry on a rescore and keeps it after the next question", () => {
    const revealed = applyAll(
      joinedAt(
        playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
      ),
      [
        { event: "reveal", payload: revealFor("6") },
        { event: "reveal:mine", payload: myRevealFor("6") },
      ],
    );
    const rescoredReveal: QuizshowReveal = {
      ...revealFor("6"),
      correct: { type: "true_false", isTrue: false },
      wasCorrected: true,
    };
    const rescoredMine: QuizshowMyReveal = {
      ...myRevealFor("6"),
      isCorrect: false,
      pointsAwarded: 0,
      streak: 0,
      score: 0,
    };
    const next = applyAll(revealed, [
      { event: "reveal", payload: rescoredReveal },
      { event: "reveal:mine", payload: rescoredMine },
      phaseChange(
        { phase: "read", phaseId: "7", questionIndex: 1 },
        { question: { ...questionWith("q2"), questionIndex: 1 } },
      ),
    ]);
    expect(next.nightLog.map((entry) => entry.questionId)).toEqual([
      "q1",
      "q2",
    ]);
    expect(next.nightLog[0]?.correct).toEqual({
      type: "true_false",
      isTrue: false,
    });
    expect(next.nightLog[0]?.myReveal?.isCorrect).toBe(false);
  });

  it("keeps the warm-up flag of the round card the question arrived with", () => {
    const next = joinedAt(playerState({ round: warmUpRound }));
    expect(next.nightLog[0]?.isWarmUp).toBe(true);
  });

  it("logs no party question", () => {
    const next = applyAll(joinedAt(playerState({ question: null })), [
      phaseChange(
        { phase: "write", phaseId: "6" },
        {
          question: {
            ...questionWith("p1"),
            roundKind: "lie_detector",
            type: "prompt",
          },
        },
      ),
    ]);
    expect(next.nightLog).toEqual([]);
  });
});

describe("Pulse Live v2 night log corrections and replays (R2)", () => {
  it("takes a host correction in scores into the night log, myReveal and the rank", () => {
    const onScores = applyAll(
      joinedAt(
        playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
      ),
      [
        { event: "reveal", payload: revealFor("6") },
        { event: "reveal:mine", payload: { ...myRevealFor("6"), rank: 1 } },
        phaseChange({ phase: "scores", phaseId: "7" }),
      ],
    );
    const corrected = applyAll(onScores, [
      {
        event: "reveal",
        payload: {
          ...revealFor("6"),
          correct: { type: "true_false", isTrue: false },
          wasCorrected: true,
        },
      },
      {
        event: "reveal:mine",
        payload: { ...myRevealFor("6"), isCorrect: false, rank: 3 },
      },
    ]);
    const session = isPlayerState(corrected.session) ? corrected.session : null;
    expect(session?.myReveal?.rank).toBe(3);
    expect(session?.reveal?.wasCorrected).toBe(true);
    expect(corrected.nightLog[0]?.myReveal?.isCorrect).toBe(false);
    expect(corrected.nightLog[0]?.correct).toEqual({
      type: "true_false",
      isTrue: false,
    });
    expect(corrected.ownRanks).toEqual({ previous: null, current: 3 });
    const otherQuestion = applyQuizshowFrame(corrected, {
      event: "reveal:mine",
      payload: { ...myRevealFor("6"), questionId: "q9", rank: 8 },
    });
    expect(otherQuestion).toBe(corrected);
  });

  it("clears the entry's answer and reveal on a restart replay", () => {
    const answered = applyQuizshowFrame(
      joinedAt(
        playerState({
          cursor: cursorWith({
            phase: "open",
            phaseId: "5",
            status: "paused",
            isRestartRecovery: true,
          }),
        }),
      ),
      { event: "answer:ack", payload: ackedAnswer },
    );
    expect(answered.nightLog[0]?.myAnswer).toEqual(ackedAnswer);
    const replayed = applyQuizshowFrame(
      answered,
      phaseChange({ phase: "read", phaseId: "8" }),
    );
    expect(replayed.nightLog).toHaveLength(1);
    expect(replayed.nightLog[0]?.myAnswer).toBeNull();
    expect(replayed.nightLog[0]?.myReveal).toBeNull();
  });

  it("keeps the log's identity across answer:count", () => {
    const start = joinedAt(playerState());
    const next = applyQuizshowFrame(start, {
      event: "answer:count",
      payload: { phaseId: "5", count: 3, total: 8 },
    });
    expect(next.nightLog).toBe(start.nightLog);
  });

  it("keeps the log through a session:state replay of the same session", () => {
    const start = applyAll(
      joinedAt(
        playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
      ),
      [{ event: "reveal:mine", payload: myRevealFor("6") }],
    );
    const replayed = applyQuizshowFrame(start, {
      event: "session:state",
      payload: playerState({
        cursor: cursorWith({ phase: "reveal", phaseId: "6" }),
        myReveal: myRevealFor("6"),
      }),
    });
    expect(replayed.nightLog).toEqual(start.nightLog);
    expect(replayed.ownRanks).toEqual(start.ownRanks);
  });

  it("starts the memory again for a session:state of another session", () => {
    const start = applyAll(
      joinedAt(
        playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
      ),
      [{ event: "reveal:mine", payload: myRevealFor("6") }],
    );
    const next = applyQuizshowFrame(start, {
      event: "session:state",
      payload: playerState({ sessionId: "s2", question: questionWith("q7") }),
    });
    expect(next.nightLog.map((entry) => entry.questionId)).toEqual(["q7"]);
    expect(next.ownRanks).toEqual({ previous: null, current: null });
  });
});

describe("Pulse Live v2 rank and team memory (R2)", () => {
  it("keeps the rank its own question re-sends and shifts on a later source", () => {
    const start = joinedAt(
      playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
    );
    const afterReveal = applyQuizshowFrame(start, {
      event: "reveal:mine",
      payload: { ...myRevealFor("6"), rank: 4 },
    });
    expect(afterReveal.ownRanks).toEqual({ previous: null, current: 4 });
    const onScores = applyAll(afterReveal, [
      phaseChange({ phase: "scores", phaseId: "7" }),
      { event: "scores:mine", payload: myScoresWith("7", 4) },
    ]);
    expect(onScores.ownRanks).toEqual({ previous: null, current: 4 });
    const moved = applyAll(onScores, [
      phaseChange({ phase: "leaderboard", phaseId: "8" }, { question: null }),
      { event: "scores:mine", payload: myScoresWith("8", 2) },
    ]);
    expect(moved.ownRanks).toEqual({ previous: 4, current: 2 });
  });

  it("says no move at a later reveal and leaderboard with an unchanged rank", () => {
    const afterFirst = joinedAt(
      playerState({
        cursor: cursorWith({ phase: "reveal", phaseId: "4" }),
        question: questionWith("q0"),
        myReveal: { ...myRevealFor("4"), questionId: "q0", rank: 4 },
      }),
    );
    const secondQuestion = { ...questionWith("q1"), questionIndex: 1 };
    const thirdQuestion = { ...questionWith("q2"), questionIndex: 2 };
    const afterSecond = applyAll(afterFirst, [
      phaseChange(
        { phase: "read", phaseId: "5", questionIndex: 1 },
        { question: secondQuestion },
      ),
      phaseChange(
        { phase: "reveal", phaseId: "6", questionIndex: 1 },
        { question: secondQuestion },
      ),
      { event: "reveal:mine", payload: { ...myRevealFor("6"), rank: 2 } },
    ]);
    expect(afterSecond.ownRanks).toEqual({ previous: 4, current: 2 });
    expect(placesMovedOf(afterSecond.ownRanks)).toBe(2);

    const afterThird = applyAll(afterSecond, [
      phaseChange(
        { phase: "read", phaseId: "7", questionIndex: 2 },
        { question: thirdQuestion },
      ),
      phaseChange(
        { phase: "reveal", phaseId: "8", questionIndex: 2 },
        { question: thirdQuestion },
      ),
      {
        event: "reveal:mine",
        payload: { ...myRevealFor("8"), questionId: "q2", rank: 2 },
      },
    ]);
    expect(afterThird.ownRanks).toEqual({ previous: 2, current: 2 });
    expect(placesMovedOf(afterThird.ownRanks)).toBeNull();

    // The same question re-sending the equal rank changes nothing.
    const replayed = applyQuizshowFrame(afterThird, {
      event: "reveal:mine",
      payload: { ...myRevealFor("8"), questionId: "q2", rank: 2, score: 950 },
    });
    expect(replayed.ownRanks).toBe(afterThird.ownRanks);

    const onLeaderboard = applyAll(afterThird, [
      phaseChange({ phase: "leaderboard", phaseId: "9" }, { question: null }),
      { event: "scores:mine", payload: myScoresWith("9", 2) },
    ]);
    expect(onLeaderboard.ownRanks).toEqual({ previous: 2, current: 2 });
    expect(placesMovedOf(onLeaderboard.ownRanks)).toBeNull();
  });

  it("replaces the rank a correction re-sends without shifting it", () => {
    const afterFirst = joinedAt(
      playerState({
        cursor: cursorWith({ phase: "reveal", phaseId: "4" }),
        question: questionWith("q0"),
        myReveal: { ...myRevealFor("4"), questionId: "q0", rank: 5 },
      }),
    );
    const secondQuestion = { ...questionWith("q1"), questionIndex: 1 };
    const onScores = applyAll(afterFirst, [
      phaseChange(
        { phase: "read", phaseId: "5", questionIndex: 1 },
        { question: secondQuestion },
      ),
      phaseChange(
        { phase: "reveal", phaseId: "6", questionIndex: 1 },
        { question: secondQuestion },
      ),
      { event: "reveal:mine", payload: { ...myRevealFor("6"), rank: 4 } },
      phaseChange(
        { phase: "scores", phaseId: "7", questionIndex: 1 },
        { question: secondQuestion },
      ),
      { event: "scores:mine", payload: myScoresWith("7", 4) },
    ]);
    expect(onScores.ownRanks).toEqual({ previous: 5, current: 4 });
    const corrected = applyQuizshowFrame(onScores, {
      event: "scores:mine",
      payload: myScoresWith("7", 2),
    });
    expect(corrected.ownRanks).toEqual({ previous: 5, current: 2 });
  });

  it("holds the team name once the session ended", () => {
    const team = {
      teamId: "t1",
      name: "Owls",
      colorKey: "circle" as const,
      memberCount: 2,
      isHostMade: false,
    };
    const start = joinedAt(
      playerState({
        playMode: "teams",
        me: meWith({ teamId: "t1" }),
        lobby: { teams: [team], playerCount: 2 },
      }),
    );
    expect(start.lastTeamName).toBe("Owls");
    const ended = applyAll(start, [
      {
        event: "session:end",
        payload: {
          sessionId: "s1",
          status: "finished",
          podium: [],
          nextEvent: null,
          hasResults: true,
          isPractice: false,
          giving: null,
        },
      },
      { event: "lobby:update", payload: { teams: [], playerCount: 0 } },
    ]);
    expect(ended.lastTeamName).toBe("Owls");
    expect(joinedAt(playerState()).lastTeamName).toBeNull();
  });

  it("clears the memory on local:reset", () => {
    const start = joinedAt(playerState());
    expect(start.nightLog).toHaveLength(1);
    const reset = applyQuizshowFrame(start, { event: "local:reset" });
    expect(reset.nightLog).toEqual([]);
    expect(reset.ownRanks).toEqual({ previous: null, current: null });
    expect(reset.lastTeamName).toBeNull();
  });

  it("keeps the night log empty for screen and host stores", () => {
    const screen = applyAll(joinedAt(screenState()), [
      phaseChange({ phase: "reveal", phaseId: "6" }),
      { event: "reveal", payload: revealFor("6") },
    ]);
    const host = applyAll(
      joinedAt(
        hostState({
          question: {
            ...questionWith("q1"),
            answerKey: null,
            revealNote: { en: "", pt: "" },
          },
        }),
      ),
      [
        phaseChange({ phase: "reveal", phaseId: "6" }),
        { event: "reveal", payload: revealFor("6") },
      ],
    );
    expect(screen.nightLog).toEqual([]);
    expect(host.nightLog).toEqual([]);
    expect(screen.ownRanks).toEqual({ previous: null, current: null });
  });
});

describe("Pulse Live v2 unscored ranks (final fix wave)", () => {
  it("keeps the rank memory empty through a warm-up reveal and its scores", () => {
    const start = joinedAt(
      playerState({
        round: warmUpRound,
        rounds: [warmUpRound],
        cursor: cursorWith({ phase: "reveal", phaseId: "6" }),
      }),
    );
    const next = applyAll(start, [
      { event: "reveal:mine", payload: { ...myRevealFor("6"), rank: 1 } },
      phaseChange({ phase: "scores", phaseId: "7" }),
      { event: "scores:mine", payload: myScoresWith("7", 1) },
    ]);
    expect(next.ownRanks).toEqual({ previous: null, current: null });
    expect(next.ownRankSourceKey).toBeNull();
  });

  it("keeps the rank memory empty through a poll reveal", () => {
    const start = joinedAt(
      playerState({
        question: { ...questionWith("q1"), type: "poll" },
        cursor: cursorWith({ phase: "reveal", phaseId: "6" }),
      }),
    );
    const next = applyQuizshowFrame(start, {
      event: "reveal:mine",
      payload: { ...myRevealFor("6"), rank: 1 },
    });
    expect(next.ownRanks).toEqual({ previous: null, current: null });
  });

  it("still remembers the rank of a scored question", () => {
    const next = applyQuizshowFrame(
      joinedAt(
        playerState({ cursor: cursorWith({ phase: "reveal", phaseId: "6" }) }),
      ),
      { event: "reveal:mine", payload: { ...myRevealFor("6"), rank: 3 } },
    );
    expect(next.ownRanks).toEqual({ previous: null, current: 3 });
  });
});

describe("Pulse Live v2 giving line at the end (final fix wave)", () => {
  it("copies the end's giving link onto the session", () => {
    const giving = {
      communitySlug: "rainbow-run",
      communityName: "Rainbow Run",
    };
    const next = applyQuizshowFrame(attached(screenState()), {
      event: "session:end",
      payload: {
        sessionId: "s1",
        status: "finished",
        podium: [],
        nextEvent: null,
        hasResults: true,
        isPractice: false,
        giving,
      },
    });
    expect(next.session?.giving).toEqual(giving);
  });
});
