import { describe, expect, it } from "vitest";
import type {
  QuizshowAnswerPayload,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import { QUIZSHOW_HOST_TOOL_HANDLERS } from "./quizshowEngineHostTools";
import { quizshowRandomFrom } from "./quizshowRandom";
import type {
  QuizshowCommandResult,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import { WHEEL_TEST_SETTINGS } from "./quizshowWheelTestFixtures";

function bilingual(english: string): QuizshowText {
  return { en: english, pt: english };
}

const BLANK_TEXT: QuizshowText = { en: "", pt: "" };

const QUESTION_SHARED = {
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: BLANK_TEXT,
  mediaReveal: "instant",
  revealNote: BLANK_TEXT,
  numberUnit: BLANK_TEXT,
  timeLimitSeconds: null,
  points: 1000,
} as const;

const TYPED_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-typed",
  type: "type_answer",
  prompt: bilingual("Which city hosted the first night?"),
  options: [],
  answer: { text: bilingual("Lisbon") },
  acceptedAnswers: [],
};

const CHOICE_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-choice",
  type: "multiple_choice",
  prompt: bilingual("Which option is the right one?"),
  options: [
    { id: "a", text: bilingual("First") },
    { id: "b", text: bilingual("Second") },
    { id: "c", text: bilingual("Third") },
  ],
  answer: { correctIndexes: [1] },
  acceptedAnswers: [],
};

function quizOf(questions: QuizshowQuestion[]): QuizshowQuiz {
  return {
    title: "Demo night",
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
    updatedAt: "2026-11-01T00:00:00.000Z",
    rounds: [
      {
        id: "round-quiz",
        kind: "quiz",
        title: bilingual("Round one"),
        contentLabel: "none",
        settings: WHEEL_TEST_SETTINGS,
        questions,
      },
    ],
  };
}

const TYPED_QUIZ = quizOf([TYPED_QUESTION, CHOICE_QUESTION]);
const CHOICE_QUIZ = quizOf([CHOICE_QUESTION]);

const RITA = "member-rita";
const NUNO = "member-nuno";
const BEA = "member-bea";
const MEMBERS = [
  { memberKey: RITA, screenName: "Rita" },
  { memberKey: NUNO, screenName: "Nuno" },
  { memberKey: BEA, screenName: "Bea" },
] as const;

type HostToolName = keyof typeof QUIZSHOW_HOST_TOOL_HANDLERS;
type Outcome = QuizshowCommandResult & { state: QuizshowEngineState };

function host(
  state: QuizshowEngineState,
  name: "host:start" | "host:next" | "host:reveal",
  now: number,
): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "host",
    name,
    payload: { phaseId: state.cursor.phaseId },
    now,
  }).state;
}

function lobbyWith(quiz: QuizshowQuiz): QuizshowEngineState {
  let state = createQuizshowEngine({
    quiz,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: false,
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    joinCode: "QZ7KP4",
    sessionId: "demo-session",
    seed: 7,
    now: 0,
  });
  for (const member of MEMBERS) {
    state = reduceQuizshowEngine(state, {
      type: "player",
      memberKey: member.memberKey,
      name: "lobby:join",
      payload: {
        screenName: member.screenName,
        isAvatarShown: false,
        hasExtraTime: false,
        team: null,
      },
      now: 0,
    }).state;
  }
  return state;
}

/** The first question's `open`: started, read, then the read deadline ticked. */
function openWith(quiz: QuizshowQuiz): QuizshowEngineState {
  const reading = host(host(lobbyWith(quiz), "host:start", 0), "host:next", 0);
  const openAt = reading.cursor.deadline ?? 0;
  return reduceQuizshowEngine(reading, { type: "tick", now: openAt }).state;
}

/** Every member answers the first question, then its reveal. */
function revealWith(
  quiz: QuizshowQuiz,
  answers: ReadonlyArray<readonly [string, QuizshowAnswerPayload]>,
): QuizshowEngineState {
  let state = openWith(quiz);
  const answeredAt = (state.cursor.phaseStartedAt ?? 0) + 1_000;
  const questionId = state.current?.questionId ?? "";
  for (const [memberKey, payload] of answers) {
    state = reduceQuizshowEngine(state, {
      type: "player",
      memberKey,
      name: "answer:submit",
      payload: { phaseId: state.cursor.phaseId, questionId, payload },
      now: answeredAt,
    }).state;
  }
  if (state.cursor.phase === "open")
    state = host(state, "host:reveal", answeredAt);
  return state;
}

function typedReveal(): QuizshowEngineState {
  return revealWith(TYPED_QUIZ, [
    [RITA, { type: "type_answer", text: "Lisbon" }],
    [NUNO, { type: "type_answer", text: "Lisboa city!" }],
    [BEA, { type: "type_answer", text: "Porto" }],
  ]);
}

function choiceReveal(): QuizshowEngineState {
  return revealWith(CHOICE_QUIZ, [
    [RITA, { type: "multiple_choice", optionIndex: 1 }],
    [NUNO, { type: "multiple_choice", optionIndex: 2 }],
    [BEA, { type: "multiple_choice", optionIndex: 0 }],
  ]);
}

function hostTool(
  state: QuizshowEngineState,
  name: HostToolName,
  payload: unknown,
  now = 50_000,
): Outcome {
  const nextState = structuredClone(state);
  const context = {
    state: nextState,
    random: quizshowRandomFrom(nextState.randomState),
  };
  return {
    ...QUIZSHOW_HOST_TOOL_HANDLERS[name](context, payload, now),
    state: nextState,
  };
}

function codeOf(outcome: Outcome): string | null {
  return outcome.ack.ok ? null : outcome.ack.code;
}

function playerOf(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEnginePlayer {
  const player = state.players.find(
    (candidate) => candidate.memberKey === memberKey,
  );
  if (player === undefined) throw new Error(`${memberKey} has not joined.`);
  return player;
}

function playOf(state: QuizshowEngineState): QuizshowEngineQuestionPlay {
  if (state.current === null) throw new Error("No question in play.");
  return state.current;
}

function accept(state: QuizshowEngineState, normalisedText: string): Outcome {
  return hostTool(state, "host:acceptAnswer", {
    phaseId: state.cursor.phaseId,
    questionId: playOf(state).questionId,
    normalisedText,
  });
}

function changeKey(state: QuizshowEngineState, answer: unknown): Outcome {
  return hostTool(state, "host:changeCorrectAnswer", {
    phaseId: state.cursor.phaseId,
    questionId: playOf(state).questionId,
    answer,
  });
}

function adjust(
  state: QuizshowEngineState,
  entrantId: string,
  delta: number,
  requestId: string,
): Outcome {
  return hostTool(state, "host:adjustPoints", { entrantId, delta, requestId });
}

describe("host:acceptAnswer", () => {
  it("scores a wrong typed answer again as right and puts the typed answers after the reveal", () => {
    const reveal = typedReveal();
    expect(reveal.cursor.phase).toBe("reveal");
    const nunoId = playerOf(reveal, NUNO).playerId;
    expect(playOf(reveal).myReveals[nunoId]?.isCorrect).toBe(false);
    const outcome = accept(reveal, "lisboa city");
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    const play = playOf(outcome.state);
    expect(play.acceptedTexts).toEqual(["lisboa city"]);
    expect(play.wasCorrected).toBe(true);
    expect(play.myReveals[nunoId]?.isCorrect).toBe(true);
    expect(playerOf(outcome.state, NUNO).score).toBeGreaterThan(0);
    expect(playerOf(outcome.state, BEA).score).toBe(0);
    expect(outcome.effects.map((effect) => effect.kind).slice(0, 2)).toEqual([
      "reveal_updated",
      "typed_answers_changed",
    ]);
  });

  it("accepts a second text on top of the first", () => {
    const once = accept(typedReveal(), "lisboa city").state;
    const twice = accept(once, "porto");
    expect(playOf(twice.state).acceptedTexts).toEqual(["lisboa city", "porto"]);
    expect(playerOf(twice.state, BEA).score).toBeGreaterThan(0);
    expect(playerOf(twice.state, NUNO).score).toBe(playerOf(once, NUNO).score);
  });

  it("acks a repeated accept of a text already accepted as a no-op", () => {
    const once = accept(typedReveal(), "lisboa city").state;
    const again = accept(once, "lisboa city");
    expect(again.ack).toEqual({ ok: true, isNoop: true });
    expect(again.effects).toEqual([]);
    expect(playOf(again.state).acceptedTexts).toEqual(["lisboa city"]);
    expect(playerOf(again.state, NUNO).score).toBe(playerOf(once, NUNO).score);
  });

  it("in scores, takes the reveal's phase id that typed:answers carries", () => {
    const reveal = typedReveal();
    const scores = host(reveal, "host:next", 30_000);
    expect(scores.cursor.phase).toBe("scores");
    const outcome = hostTool(scores, "host:acceptAnswer", {
      phaseId: reveal.cursor.phaseId,
      questionId: TYPED_QUESTION.id,
      normalisedText: "porto",
    });
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(playerOf(outcome.state, BEA).score).toBeGreaterThan(0);
  });

  it("refuses quizshow_answer_already_correct when only right answers match", () => {
    expect(codeOf(accept(typedReveal(), "lisbon"))).toBe(
      "quizshow_answer_already_correct",
    );
  });

  it("refuses quizshow_answer_text_not_found when no answer matches", () => {
    expect(codeOf(accept(typedReveal(), "madrid"))).toBe(
      "quizshow_answer_text_not_found",
    );
  });

  it("refuses quizshow_accept_needs_typed_answer on a choice question", () => {
    expect(codeOf(accept(choiceReveal(), "second"))).toBe(
      "quizshow_accept_needs_typed_answer",
    );
  });

  it("refuses quizshow_stale_phase with the cursor", () => {
    const reveal = typedReveal();
    const outcome = hostTool(reveal, "host:acceptAnswer", {
      phaseId: "999",
      questionId: TYPED_QUESTION.id,
      normalisedText: "porto",
    });
    expect(outcome.ack).toMatchObject({
      ok: false,
      code: "quizshow_stale_phase",
      cursor: reveal.cursor,
    });
  });

  it("refuses quizshow_wrong_question for another question", () => {
    const reveal = typedReveal();
    const outcome = hostTool(reveal, "host:acceptAnswer", {
      phaseId: reveal.cursor.phaseId,
      questionId: CHOICE_QUESTION.id,
      normalisedText: "porto",
    });
    expect(codeOf(outcome)).toBe("quizshow_wrong_question");
  });

  it("refuses quizshow_rescore_not_now before the reveal", () => {
    expect(codeOf(accept(openWith(TYPED_QUIZ), "porto"))).toBe(
      "quizshow_rescore_not_now",
    );
  });

  it("refuses quizshow_rescore_not_now for a play scored before a restart", () => {
    const reveal = typedReveal();
    playOf(reveal).streakBeforeByPlayer = {};
    expect(codeOf(accept(reveal, "porto"))).toBe("quizshow_rescore_not_now");
  });

  it("in scores, takes the corrected totals as the frame's totals and sends the scores", () => {
    const scores = host(typedReveal(), "host:next", 30_000);
    expect(scores.cursor.phase).toBe("scores");
    const outcome = accept(scores, "porto");
    const beaId = playerOf(scores, BEA).playerId;
    expect(outcome.state.scoresAtLastFrame[beaId]).toBe(
      playerOf(outcome.state, BEA).score,
    );
    expect(outcome.state.lastScoresFrame).toEqual(scores.lastScoresFrame);
    expect(outcome.effects.map((effect) => effect.kind)).toContain(
      "scores_shown",
    );
  });
});

describe("host:changeCorrectAnswer", () => {
  it("moves the points to the new key and restores the streaks first", () => {
    const reveal = choiceReveal();
    expect(playerOf(reveal, RITA).streak).toBe(1);
    const outcome = changeKey(reveal, {
      type: "multiple_choice",
      correctIndexes: [2],
    });
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(playOf(outcome.state).keyOverride).toEqual({
      type: "multiple_choice",
      correctIndexes: [2],
    });
    expect(playerOf(outcome.state, RITA).score).toBe(0);
    expect(playerOf(outcome.state, RITA).streak).toBe(0);
    expect(playerOf(outcome.state, NUNO).score).toBeGreaterThan(0);
    expect(playerOf(outcome.state, NUNO).streak).toBe(1);
  });

  it("sorts and dedupes the indexes, then keeps the same key as a no-op", () => {
    const changed = changeKey(choiceReveal(), {
      type: "multiple_choice",
      correctIndexes: [2, 1, 2],
    });
    expect(playOf(changed.state).keyOverride).toEqual({
      type: "multiple_choice",
      correctIndexes: [1, 2],
    });
    const again = changeKey(changed.state, {
      type: "multiple_choice",
      correctIndexes: [1, 2],
    });
    expect(again.ack).toEqual({ ok: true, isNoop: true });
    expect(again.effects).toEqual([]);
  });

  it("keeps the authored key as a no-op", () => {
    expect(
      changeKey(choiceReveal(), {
        type: "multiple_choice",
        correctIndexes: [1],
      }).ack,
    ).toEqual({ ok: true, isNoop: true });
  });

  it("refuses quizshow_every_option_correct", () => {
    expect(
      codeOf(
        changeKey(choiceReveal(), {
          type: "multiple_choice",
          correctIndexes: [0, 1, 2],
        }),
      ),
    ).toBe("quizshow_every_option_correct");
  });

  it("refuses quizshow_correct_option_not_found for an index outside the options", () => {
    expect(
      codeOf(
        changeKey(choiceReveal(), {
          type: "multiple_choice",
          correctIndexes: [5],
        }),
      ),
    ).toBe("quizshow_correct_option_not_found");
  });

  it("refuses quizshow_change_needs_choice_question on a typed question or a mismatched type", () => {
    expect(
      codeOf(
        changeKey(typedReveal(), {
          type: "multiple_choice",
          correctIndexes: [0],
        }),
      ),
    ).toBe("quizshow_change_needs_choice_question");
    expect(
      codeOf(changeKey(choiceReveal(), { type: "true_false", isTrue: true })),
    ).toBe("quizshow_change_needs_choice_question");
  });
});

describe("host:adjustPoints", () => {
  it("moves a player's total and tells the lobby and the player", () => {
    const reveal = choiceReveal();
    const bea = playerOf(reveal, BEA);
    const outcome = adjust(reveal, bea.playerId, 200, "request-1");
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(playerOf(outcome.state, BEA).score).toBe(bea.score + 200);
    expect(outcome.state.adjustRequestIds).toEqual(["request-1"]);
    expect(outcome.effects).toEqual([
      { kind: "lobby_changed" },
      { kind: "me_changed", playerIds: [bea.playerId] },
    ]);
  });

  it("applies a repeated request id once", () => {
    const reveal = choiceReveal();
    const beaId = playerOf(reveal, BEA).playerId;
    const once = adjust(reveal, beaId, 200, "request-1").state;
    const again = adjust(once, beaId, 200, "request-1");
    expect(again.ack).toEqual({ ok: true, isNoop: true });
    expect(playerOf(again.state, BEA).score).toBe(playerOf(once, BEA).score);
  });

  it("remembers only the last 50 request ids", () => {
    let state = choiceReveal();
    const beaId = playerOf(state, BEA).playerId;
    for (let requestNumber = 0; requestNumber < 51; requestNumber += 1) {
      state = adjust(state, beaId, 1, `request-${requestNumber}`).state;
    }
    expect(state.adjustRequestIds).toHaveLength(50);
    expect(state.adjustRequestIds[0]).toBe("request-1");
  });

  it("in scores, takes the new totals as the frame's totals and sends the scores", () => {
    const scores = host(choiceReveal(), "host:next", 30_000);
    const beaId = playerOf(scores, BEA).playerId;
    const outcome = adjust(scores, beaId, 300, "request-1");
    expect(outcome.state.scoresAtLastFrame[beaId]).toBe(
      playerOf(outcome.state, BEA).score,
    );
    expect(outcome.effects[0]).toEqual({ kind: "scores_shown" });
  });

  it("keeps an adjustment through a later rescore", () => {
    const reveal = choiceReveal();
    const nunoId = playerOf(reveal, NUNO).playerId;
    const adjusted = adjust(reveal, nunoId, 100, "request-1").state;
    const rescored = changeKey(adjusted, {
      type: "multiple_choice",
      correctIndexes: [2],
    }).state;
    expect(playerOf(rescored, NUNO).score).toBe(
      100 + (playOf(rescored).pointsByPlayer[nunoId] ?? 0),
    );
  });

  it("refuses quizshow_adjust_below_zero", () => {
    const reveal = choiceReveal();
    expect(
      codeOf(adjust(reveal, playerOf(reveal, BEA).playerId, -1, "request-1")),
    ).toBe("quizshow_adjust_below_zero");
  });

  it("refuses quizshow_entrant_not_found", () => {
    expect(codeOf(adjust(choiceReveal(), "nobody", 100, "request-1"))).toBe(
      "quizshow_entrant_not_found",
    );
  });

  it("refuses quizshow_adjust_not_now in the lobby", () => {
    const lobby = lobbyWith(CHOICE_QUIZ);
    expect(
      codeOf(adjust(lobby, playerOf(lobby, BEA).playerId, 100, "request-1")),
    ).toBe("quizshow_adjust_not_now");
  });
});

/** A player leaves through the whole engine. */
function leftIn(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "player",
    memberKey,
    name: "lobby:leave",
    payload: {},
    now: 40_000,
  }).state;
}

/** A host removes a player for good through the whole engine. */
function removedIn(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "host",
    name: "host:removePlayer",
    payload: { playerId: playerOf(state, memberKey).playerId },
    now: 40_000,
  }).state;
}

describe("who a correction rescores", () => {
  it("rescores a player who left after the reveal", () => {
    const reveal = leftIn(typedReveal(), NUNO);
    expect(playerOf(reveal, NUNO).leftAt).not.toBeNull();
    const outcome = accept(reveal, "lisboa city");
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    const nunoId = playerOf(reveal, NUNO).playerId;
    expect(playOf(outcome.state).myReveals[nunoId]?.isCorrect).toBe(true);
    expect(playerOf(outcome.state, NUNO).score).toBeGreaterThan(0);
  });

  it("leaves a host-removed player's answer out and their score untouched", () => {
    const reveal = removedIn(typedReveal(), BEA);
    const beaScore = playerOf(reveal, BEA).score;
    expect(codeOf(accept(reveal, "porto"))).toBe(
      "quizshow_answer_text_not_found",
    );
    const changed = accept(reveal, "lisboa city");
    expect(changed.ack.ok).toBe(true);
    expect(playerOf(changed.state, BEA).score).toBe(beaScore);
  });

  it("leaves out a player who left before the reveal", () => {
    let state = openWith(TYPED_QUIZ);
    const answeredAt = (state.cursor.phaseStartedAt ?? 0) + 1_000;
    const answer = (memberKey: string, text: string): void => {
      state = reduceQuizshowEngine(state, {
        type: "player",
        memberKey,
        name: "answer:submit",
        payload: {
          phaseId: state.cursor.phaseId,
          questionId: TYPED_QUESTION.id,
          payload: { type: "type_answer", text },
        },
        now: answeredAt,
      }).state;
    };
    answer(NUNO, "Lisboa city!");
    state = leftIn(state, NUNO);
    answer(RITA, "Lisbon");
    answer(BEA, "Porto");
    if (state.cursor.phase === "open") {
      state = host(state, "host:reveal", answeredAt);
    }
    expect(state.cursor.phase).toBe("reveal");
    expect(codeOf(accept(state, "lisboa city"))).toBe(
      "quizshow_answer_text_not_found",
    );
  });

  it("moves a changed key's points to a player who left and none to a removed one", () => {
    const reveal = removedIn(leftIn(choiceReveal(), NUNO), BEA);
    const beaScore = playerOf(reveal, BEA).score;
    const outcome = changeKey(reveal, {
      type: "multiple_choice",
      correctIndexes: [0, 2],
    });
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(playerOf(outcome.state, NUNO).score).toBeGreaterThan(0);
    expect(playerOf(outcome.state, BEA).score).toBe(beaScore);
  });
});

describe("host:adjustPoints retries", () => {
  it("answers a retried request id as a no-op after the phase moved on", () => {
    const reveal = choiceReveal();
    const beaId = playerOf(reveal, BEA).playerId;
    const adjusted = adjust(reveal, beaId, 200, "request-1").state;
    const podium = reduceQuizshowEngine(adjusted, {
      type: "host",
      name: "host:end",
      payload: { phaseId: adjusted.cursor.phaseId },
      now: 45_000,
    }).state;
    expect(podium.cursor.phase).toBe("podium");
    expect(adjust(podium, beaId, 200, "request-1").ack).toEqual({
      ok: true,
      isNoop: true,
    });
    expect(codeOf(adjust(podium, beaId, 200, "request-2"))).toBe(
      "quizshow_adjust_not_now",
    );
  });

  it("sends no me_changed for a team with no active member", () => {
    let state = createQuizshowEngine({
      quiz: CHOICE_QUIZ,
      playMode: "teams",
      maxTeamSize: null,
      isReviewOn: false,
      eventSlug: "pride-brunch-jun",
      eventTitle: "Pride brunch",
      joinCode: "QZ7KP4",
      sessionId: "demo-session",
      seed: 7,
      now: 0,
    });
    state = reduceQuizshowEngine(state, {
      type: "player",
      memberKey: RITA,
      name: "lobby:join",
      payload: {
        screenName: "Rita",
        isAvatarShown: false,
        hasExtraTime: false,
        team: { newTeam: { name: "Glitter", colorKey: "circle" } },
      },
      now: 0,
    }).state;
    state = leftIn(host(state, "host:start", 0), RITA);
    const teamId = playerOf(state, RITA).teamId ?? "";
    const outcome = adjust(state, teamId, 100, "request-1");
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.effects).toEqual([{ kind: "lobby_changed" }]);
  });
});
