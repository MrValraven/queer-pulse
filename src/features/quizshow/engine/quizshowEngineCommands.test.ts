import { describe, expect, it } from "vitest";
import type {
  QuizshowAnswerPayload,
  QuizshowLobbyJoinInput,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
  QuizshowRoundKind,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import type { QuizshowServerFrame } from "../realtime/quizshowFrames";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineAction,
  QuizshowEngineOptions,
  QuizshowEngineState,
  QuizshowEngineStep,
  QuizshowHostFrameName,
  QuizshowPlayerFrameName,
} from "./quizshowEngineTypes";
import {
  engineSessionStateFor,
  framesForViewer,
  playerIdOf,
} from "./quizshowEngineViews";

const ROUND_SETTINGS = {
  timeLimitSeconds: 20,
  isSpeedBonusOn: true,
  isJokerAllowed: true,
  writeSeconds: 60,
  voteSeconds: 30,
};

function bilingual(english: string): QuizshowText {
  return { en: english, pt: english };
}

const QUESTION_SHARED = {
  mediaRef: null,
  mediaUrl: null,
  timeLimitSeconds: null,
  points: 1000,
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
    { id: "d", text: bilingual("Fourth") },
  ],
  answer: { correctIndex: 1 },
  acceptedAnswers: [],
};

const NUMBER_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-number",
  type: "closest_number",
  prompt: bilingual("How many glitter cannons fired?"),
  options: [],
  answer: { value: 100 },
  acceptedAnswers: [],
};

const LIE_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-lie",
  type: "prompt",
  prompt: bilingual("Where did the club hold its first night?"),
  options: [],
  answer: { truth: { en: "A sauna", pt: "Uma sauna" } },
  acceptedAnswers: [],
};

function roundOf(
  id: string,
  kind: QuizshowRoundKind,
  questions: QuizshowQuestion[],
): QuizshowRound {
  return {
    id,
    kind,
    title: bilingual(`Round ${id}`),
    contentLabel: "none",
    settings: ROUND_SETTINGS,
    questions,
  };
}

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Demo night",
    languages: "both",
    screenLanguage: "en",
    starterPackKey: null,
    updatedAt: "2026-10-19T00:00:00.000Z",
    rounds,
  };
}

const DEMO_QUIZ = quizOf([
  roundOf("quiz", "quiz", [CHOICE_QUESTION, NUMBER_QUESTION]),
  roundOf("lie", "lie_detector", [LIE_QUESTION]),
]);

const RITA = "member-rita";
const NUNO = "member-nuno";
const BEA = "member-bea";
const MEMBERS = [
  { memberKey: RITA, screenName: "Rita" },
  { memberKey: NUNO, screenName: "Nuno" },
  { memberKey: BEA, screenName: "Bea" },
] as const;

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Nothing at index ${index}.`);
  return item;
}

function engineWith(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  return createQuizshowEngine({
    quiz: DEMO_QUIZ,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    joinCode: "QZ7KP4",
    sessionId: "demo-session",
    seed: 7,
    now: 0,
    ...overrides,
  });
}

function step(
  state: QuizshowEngineState,
  action: QuizshowEngineAction,
): QuizshowEngineStep {
  return reduceQuizshowEngine(state, action);
}

function hostStep(
  state: QuizshowEngineState,
  name: QuizshowHostFrameName,
  payload: unknown,
  now: number,
): QuizshowEngineStep {
  return step(state, { type: "host", name, payload, now });
}

function playerStep(
  state: QuizshowEngineState,
  memberKey: string,
  name: QuizshowPlayerFrameName,
  payload: unknown,
  now: number,
): QuizshowEngineStep {
  return step(state, { type: "player", memberKey, name, payload, now });
}

function tickStep(state: QuizshowEngineState, now: number): QuizshowEngineStep {
  return step(state, { type: "tick", now });
}

function joinPayload(
  screenName: string,
  overrides: Partial<QuizshowLobbyJoinInput> = {},
): QuizshowLobbyJoinInput {
  return {
    screenName,
    isAvatarShown: false,
    hasExtraTime: false,
    team: null,
    ...overrides,
  };
}

/** Rita, Nuno and Bea joined at 0; `extraTimeMemberKey` joins with extra time. */
function joinedEngine(
  overrides: Partial<QuizshowEngineOptions> = {},
  extraTimeMemberKey: string | null = null,
): QuizshowEngineState {
  let state = engineWith(overrides);
  for (const member of MEMBERS) {
    state = playerStep(
      state,
      member.memberKey,
      "lobby:join",
      joinPayload(member.screenName, {
        hasExtraTime: member.memberKey === extraTimeMemberKey,
      }),
      0,
    ).state;
  }
  return state;
}

function nextStep(state: QuizshowEngineState, now: number): QuizshowEngineStep {
  return hostStep(state, "host:next", { phaseId: state.cursor.phaseId }, now);
}

function skipStep(state: QuizshowEngineState, now: number): QuizshowEngineStep {
  return hostStep(state, "host:skip", { phaseId: state.cursor.phaseId }, now);
}

/** Started at 0, then the first question's `read` (phase id 2, deadline 4000). */
function toRead(state: QuizshowEngineState): QuizshowEngineState {
  const started = hostStep(state, "host:start", { phaseId: "0" }, 0).state;
  return nextStep(started, 0).state;
}

/** The first question's `open` from 4000 (deadline 24000, extra time 34000). */
function toOpen(state: QuizshowEngineState): QuizshowEngineState {
  return tickStep(toRead(state), 4_000).state;
}

/** Both quiz questions skipped, then the Lie Detector question's `write` at 0. */
function toLieWrite(state: QuizshowEngineState): QuizshowEngineState {
  let walked = toRead(state);
  walked = skipStep(walked, 0).state;
  walked = skipStep(walked, 0).state;
  walked = nextStep(walked, 0).state;
  return nextStep(walked, 0).state;
}

function currentQuestionId(state: QuizshowEngineState): string {
  const current = state.current;
  if (current === null) throw new Error("No question in play.");
  return current.questionId;
}

function answerStep(
  state: QuizshowEngineState,
  memberKey: string,
  payload: QuizshowAnswerPayload,
  now: number,
): QuizshowEngineStep {
  return playerStep(
    state,
    memberKey,
    "answer:submit",
    {
      phaseId: state.cursor.phaseId,
      questionId: currentQuestionId(state),
      payload,
    },
    now,
  );
}

function truthOptionId(state: QuizshowEngineState): string {
  const truthOption = (state.current?.voteOptions ?? []).find(
    (option) => option.isTruth,
  );
  if (truthOption === undefined) throw new Error("No truth option.");
  return truthOption.optionId;
}

function voteStep(
  state: QuizshowEngineState,
  memberKey: string,
  optionId: string,
  now: number,
): QuizshowEngineStep {
  return playerStep(
    state,
    memberKey,
    "vote:submit",
    {
      phaseId: state.cursor.phaseId,
      questionId: currentQuestionId(state),
      optionId,
    },
    now,
  );
}

function screenFrames(result: QuizshowEngineStep): QuizshowServerFrame[] {
  return framesForViewer(result.frames, { role: "screen", playerId: null });
}

type QuizshowServerFrameName = QuizshowServerFrame["event"];
type PayloadByEvent = {
  [Frame in QuizshowServerFrame as Frame["event"]]: Frame["payload"];
};

function payloadsOf<Event extends QuizshowServerFrameName>(
  frames: readonly QuizshowServerFrame[],
  event: Event,
): Array<PayloadByEvent[Event]> {
  // The one narrow cast, approved for this test helper: a generic event name does not correlate with its payload.
  return frames
    .filter((frame) => frame.event === event)
    .map((frame) => frame.payload as PayloadByEvent[Event]);
}

const KIKO = "member-kiko";

const CAPTION_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-caption",
  type: "prompt",
  prompt: bilingual(""),
  mediaRef: "event-cover/demo/caption.jpg",
  mediaUrl: "https://example.test/caption.jpg",
  options: [],
  answer: null,
  acceptedAnswers: [],
};

const CAPTION_QUIZ = quizOf([
  roundOf("caption", "caption_this", [CAPTION_QUESTION]),
]);

const LIE_TEXTS = [
  { memberKey: RITA, text: "a basement" },
  { memberKey: NUNO, text: "a rooftop" },
  { memberKey: BEA, text: "a ferry" },
] as const;

/** The Lie Detector `vote` at 4000, after the three fakes went through review. */
function toLieVote(state: QuizshowEngineState): QuizshowEngineState {
  let walked = toLieWrite(state);
  for (const [textIndex, { memberKey, text }] of LIE_TEXTS.entries()) {
    walked = answerStep(
      walked,
      memberKey,
      { type: "prompt", text },
      1_000 * (textIndex + 1),
    ).state;
  }
  return hostStep(
    walked,
    "host:showAnswers",
    { phaseId: walked.cursor.phaseId },
    4_000,
  ).state;
}

function playerIdFor(state: QuizshowEngineState, memberKey: string): string {
  const playerId = playerIdOf(state, memberKey);
  if (playerId === null) throw new Error(`${memberKey} has not joined.`);
  return playerId;
}

function answerIdOf(state: QuizshowEngineState, memberKey: string): string {
  const playerId = playerIdFor(state, memberKey);
  const answer = (state.current?.answers ?? []).find(
    (candidate) => candidate.playerId === playerId,
  );
  if (answer === undefined) throw new Error(`${memberKey} has no answer.`);
  return answer.answerId;
}

/** The vote option made from the member's own answer. */
function optionIdOf(state: QuizshowEngineState, memberKey: string): string {
  const answerId = answerIdOf(state, memberKey);
  const option = (state.current?.voteOptions ?? []).find(
    (candidate) => candidate.answerId === answerId,
  );
  if (option === undefined) throw new Error(`${memberKey} has no option.`);
  return option.optionId;
}

function scoreOf(state: QuizshowEngineState, memberKey: string): number {
  const playerId = playerIdFor(state, memberKey);
  const player = state.players.find(
    (candidate) => candidate.playerId === playerId,
  );
  if (player === undefined) throw new Error(`${memberKey} is missing.`);
  return player.score;
}

function playerFrames(
  result: QuizshowEngineStep,
  memberKey: string,
): QuizshowServerFrame[] {
  return framesForViewer(result.frames, {
    role: "player",
    playerId: playerIdOf(result.state, memberKey),
  });
}

function joinTeamed(
  state: QuizshowEngineState,
  memberKey: string,
  screenName: string,
  team: QuizshowLobbyJoinInput["team"],
  now = 0,
): QuizshowEngineStep {
  return playerStep(
    state,
    memberKey,
    "lobby:join",
    joinPayload(screenName, { team }),
    now,
  );
}

/** Started, then the Caption This question's `write` at 0. */
function toCaptionWrite(state: QuizshowEngineState): QuizshowEngineState {
  const started = hostStep(state, "host:start", { phaseId: "0" }, 0).state;
  return nextStep(started, 0).state;
}

describe("demo engine moving commands", () => {
  it("advances once when two host:next frames carry the same phase id and acks the second as a noop", () => {
    const started = hostStep(
      joinedEngine(),
      "host:start",
      { phaseId: "0" },
      0,
    ).state;
    const first = hostStep(started, "host:next", { phaseId: "1" }, 0);
    expect(first.ack).toEqual({ ok: true, isNoop: false });
    expect(first.state.cursor).toMatchObject({ phaseId: "2", phase: "read" });
    const second = hostStep(first.state, "host:next", { phaseId: "1" }, 10);
    expect(second.ack).toEqual({ ok: true, isNoop: true });
    expect(second.state.cursor).toMatchObject({ phaseId: "2", phase: "read" });
    expect(second.frames).toEqual([]);
  });

  it("treats host:next after a timer moved the phase as a noop", () => {
    const opened = tickStep(toRead(joinedEngine()), 4_000).state;
    expect(opened.cursor).toMatchObject({ phaseId: "3", phase: "open" });
    const result = hostStep(opened, "host:next", { phaseId: "2" }, 4_100);
    expect(result.ack).toEqual({ ok: true, isNoop: true });
    expect(result.state.cursor.phase).toBe("open");
  });

  it("acks a host:next with an older phase id as stale with the cursor", () => {
    const reading = toRead(joinedEngine());
    const result = hostStep(reading, "host:next", { phaseId: "0" }, 100);
    expect(result.ack).toMatchObject({
      ok: false,
      code: "quizshow_stale_phase",
      message: "quizshow_stale_phase",
      cursor: { phaseId: "2", phase: "read", status: "running" },
    });
  });
});

describe("demo engine submissions", () => {
  it("takes the first answer and acks a resend as a duplicate", () => {
    const state = toOpen(joinedEngine());
    const first = answerStep(
      state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      5_000,
    );
    expect(first.ack).toMatchObject({ ok: true, isDuplicate: false });
    expect(
      at(payloadsOf(playerFrames(first, RITA), "answer:ack"), 0).receivedAt,
    ).toBe(5_000);
    const resend = answerStep(
      first.state,
      RITA,
      { type: "multiple_choice", optionIndex: 2 },
      6_000,
    );
    expect(resend.ack).toEqual({
      ok: true,
      isDuplicate: true,
      answer: {
        questionId: "question-choice",
        phaseId: "3",
        payload: { type: "multiple_choice", optionIndex: 1 },
        receivedAt: 5_000,
      },
    });
    expect(resend.frames).toEqual([]);
  });

  it("refuses answers and votes while paused", () => {
    const opened = toOpen(joinedEngine());
    const pausedOpen = hostStep(
      opened,
      "host:pause",
      { phaseId: opened.cursor.phaseId },
      5_000,
    ).state;
    expect(pausedOpen.cursor.status).toBe("paused");
    expect(
      answerStep(
        pausedOpen,
        RITA,
        { type: "multiple_choice", optionIndex: 1 },
        5_100,
      ).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_phase_closed",
    });
    const voting = toLieVote(joinedEngine());
    const pausedVote = hostStep(
      voting,
      "host:pause",
      { phaseId: voting.cursor.phaseId },
      5_000,
    ).state;
    expect(
      voteStep(pausedVote, RITA, truthOptionId(pausedVote), 5_100).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_phase_closed",
    });
  });

  it("freezes the remaining time on pause and restores it on resume", () => {
    const opened = toOpen(joinedEngine());
    const paused = hostStep(opened, "host:pause", { phaseId: "3" }, 9_000);
    expect(paused.ack).toEqual({ ok: true, isNoop: false });
    expect(paused.state.cursor).toMatchObject({
      phaseId: "3",
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: 15_000,
      pausedExtraTimeRemainingMs: 25_000,
    });
    expect(
      at(payloadsOf(screenFrames(paused), "phase:change"), 0).cursor.phaseId,
    ).toBe("3");
    const resumed = hostStep(
      paused.state,
      "host:resume",
      { phaseId: "3" },
      69_000,
    );
    expect(resumed.state.cursor).toMatchObject({
      phaseId: "3",
      status: "running",
      deadline: 84_000,
      extraTimeDeadline: 94_000,
      phaseStartedAt: 64_000,
      pausedRemainingMs: null,
    });
    let state = answerStep(
      resumed.state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      70_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "multiple_choice", optionIndex: 0 },
      70_500,
    ).state;
    const revealed = answerStep(
      state,
      BEA,
      { type: "multiple_choice", optionIndex: 0 },
      71_000,
    );
    expect(revealed.state.cursor.phase).toBe("reveal");
    // Speed of 6000 ms elapsed of 20000: 850, plus the first streak step of 100.
    expect(scoreOf(revealed.state, RITA)).toBe(950);
    expect(
      at(payloadsOf(playerFrames(revealed, RITA), "reveal:mine"), 0)
        .pointsAwarded,
    ).toBe(950);
  });

  it("adds time once when two remotes send the same expected deadline", () => {
    const opened = toOpen(joinedEngine());
    const command = {
      phaseId: opened.cursor.phaseId,
      seconds: 15,
      expectedDeadline: 24_000,
    };
    const first = hostStep(opened, "host:addTime", command, 5_000);
    expect(first.ack).toEqual({ ok: true, isNoop: false });
    expect(first.state.cursor).toMatchObject({
      deadline: 39_000,
      extraTimeDeadline: 49_000,
    });
    const second = hostStep(first.state, "host:addTime", command, 5_010);
    expect(second.ack).toEqual({ ok: true, isNoop: true });
    expect(second.state.cursor.deadline).toBe(39_000);
  });

  it("refuses added time that is not a whole number from 5 to 60 seconds", () => {
    const opened = toOpen(joinedEngine());
    for (const seconds of [4, 61, 7.5, Number.NaN, undefined]) {
      const result = hostStep(
        opened,
        "host:addTime",
        { phaseId: opened.cursor.phaseId, seconds, expectedDeadline: 24_000 },
        5_000,
      );
      expect(result.ack).toMatchObject({
        ok: false,
        code: "quizshow_command_not_allowed",
        cursor: { deadline: 24_000 },
      });
      expect(result.state.cursor.deadline).toBe(24_000);
    }
  });

  it("refuses blank typed and party text", () => {
    const writing = toLieWrite(joinedEngine());
    expect(
      answerStep(writing, RITA, { type: "prompt", text: "   " }, 1_000).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_text_blank",
    });
  });
});

describe("demo engine scoring", () => {
  it("scores a quiz question with speed, streak and joker, and averages teams over eligible members", () => {
    let state = engineWith({ playMode: "teams" });
    state = joinTeamed(state, RITA, "Rita", {
      newTeam: { name: "Quizzly Bears", colorKey: "circle" },
    }).state;
    const bearsId = at(state.teams, 0).teamId;
    state = joinTeamed(state, NUNO, "Nuno", { teamId: bearsId }).state;
    state = joinTeamed(state, BEA, "Bea", {
      newTeam: { name: "Spill the Tea", colorKey: "triangle" },
    }).state;
    const teaId = at(state.teams, 1).teamId;
    state = playerStep(state, RITA, "joker:play", { roundIndex: 0 }, 0).state;
    state = toOpen(state);
    state = joinTeamed(state, KIKO, "Kiko", { teamId: bearsId }, 5_000).state;
    state = answerStep(
      state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      4_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "multiple_choice", optionIndex: 1 },
      14_000,
    ).state;
    const revealed = answerStep(
      state,
      BEA,
      { type: "multiple_choice", optionIndex: 3 },
      15_000,
    );
    expect(revealed.state.cursor.phase).toBe("reveal");
    // Rita: (1000 + 100) doubled; Nuno at half the limit: (750 + 100) doubled.
    expect(scoreOf(revealed.state, RITA)).toBe(2_200);
    expect(scoreOf(revealed.state, NUNO)).toBe(1_700);
    expect(scoreOf(revealed.state, BEA)).toBe(0);
    const teamScores = Object.fromEntries(
      revealed.state.teams.map((team) => [team.teamId, team.score]),
    );
    // Kiko joined late, so the Bears average is over Rita and Nuno only.
    expect(teamScores).toEqual({ [bearsId]: 1_950, [teaId]: 0 });
    expect(
      at(payloadsOf(playerFrames(revealed, RITA), "reveal:mine"), 0),
    ).toMatchObject({
      isCorrect: true,
      pointsAwarded: 2_200,
      streakBonus: 100,
      streak: 1,
      isJokerActive: true,
      teamScore: 1_950,
      rank: 1,
    });
    expect(
      at(payloadsOf(playerFrames(revealed, BEA), "reveal:mine"), 0),
    ).toMatchObject({
      isCorrect: false,
      pointsAwarded: 0,
      streak: 0,
    });
  });

  it("refuses a vote for your own answer", () => {
    const voting = toLieVote(joinedEngine());
    expect(
      voteStep(voting, RITA, optionIdOf(voting, RITA), 5_000).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_own_answer_vote",
    });
  });

  it("turns away a fake too close to the truth", () => {
    const writing = toLieWrite(joinedEngine());
    for (const fake of ["a sauna!", "Uma sauna", "a saunaa"]) {
      expect(
        answerStep(writing, RITA, { type: "prompt", text: fake }, 1_000).ack,
      ).toMatchObject({
        ok: false,
        code: "quizshow_fake_too_close",
        message: "quizshow_fake_too_close",
      });
    }
  });

  it("scores Lie Detector votes and Caption This votes with the favourite", () => {
    let lie = toLieVote(joinedEngine());
    lie = voteStep(lie, RITA, truthOptionId(lie), 5_000).state;
    lie = voteStep(lie, NUNO, optionIdOf(lie, RITA), 5_100).state;
    const lieReveal = voteStep(lie, BEA, optionIdOf(lie, RITA), 5_200);
    expect(lieReveal.state.cursor.phase).toBe("reveal");
    // Rita: the truth (1000) plus two players fooled (2 x 500).
    expect(scoreOf(lieReveal.state, RITA)).toBe(2_000);
    expect(scoreOf(lieReveal.state, NUNO)).toBe(0);
    const lieDistribution = at(
      payloadsOf(screenFrames(lieReveal), "reveal"),
      0,
    ).distribution;
    if (lieDistribution.kind !== "votes") throw new Error("Expected votes.");
    expect(
      lieDistribution.entries.find((entry) => entry.authorName === "Rita"),
    ).toMatchObject({
      voteCount: 2,
      authorPoints: 1_000,
      isTruth: false,
    });
    expect(
      lieDistribution.entries.find((entry) => entry.isTruth),
    ).toMatchObject({
      voteCount: 1,
      authorName: null,
      answerId: null,
      text: "A sauna",
    });

    let caption = toCaptionWrite(
      joinedEngine({ quiz: CAPTION_QUIZ, isReviewOn: false }),
    );
    const captions = [
      { memberKey: RITA, text: "me when the dj plays the one song" },
      { memberKey: NUNO, text: "waiting for my oat latte like" },
      { memberKey: BEA, text: "the group chat at 2am" },
    ];
    for (const { memberKey, text } of captions) {
      caption = answerStep(
        caption,
        memberKey,
        { type: "prompt", text },
        1_000,
      ).state;
    }
    expect(caption.cursor.phase).toBe("vote");
    caption = voteStep(caption, RITA, optionIdOf(caption, NUNO), 2_000).state;
    caption = voteStep(caption, NUNO, optionIdOf(caption, RITA), 2_100).state;
    caption = voteStep(caption, BEA, optionIdOf(caption, RITA), 2_200).state;
    expect(caption.cursor.phase).toBe("reveal");
    expect(scoreOf(caption, RITA)).toBe(500);
    expect(scoreOf(caption, NUNO)).toBe(250);
    const favourite = {
      phaseId: caption.cursor.phaseId,
      questionId: "question-caption",
      optionId: optionIdOf(caption, NUNO),
    };
    const picked = hostStep(caption, "host:pickFavourite", favourite, 3_000);
    expect(picked.ack).toEqual({ ok: true, isNoop: false });
    expect(scoreOf(picked.state, NUNO)).toBe(750);
    const updatedReveal = at(payloadsOf(screenFrames(picked), "reveal"), 0);
    expect(updatedReveal.distribution).toMatchObject({
      kind: "votes",
      favouriteOptionId: favourite.optionId,
    });
    expect(
      at(payloadsOf(playerFrames(picked, NUNO), "reveal:mine"), 0)
        .pointsAwarded,
    ).toBe(750);
    const secondPick = hostStep(
      picked.state,
      "host:pickFavourite",
      { ...favourite, optionId: optionIdOf(picked.state, RITA) },
      3_100,
    );
    expect(secondPick.ack).toEqual({ ok: true, isNoop: true });
    expect(scoreOf(secondPick.state, RITA)).toBe(500);
    expect(scoreOf(secondPick.state, NUNO)).toBe(750);
  });
});

describe("demo engine hides while scores are on show", () => {
  it("sends the scores again with the new totals when a hide lands on the leaderboard or the podium", () => {
    const toCaptionReveal = (quiz: QuizshowQuiz): QuizshowEngineState => {
      let walked = toCaptionWrite(joinedEngine({ quiz, isReviewOn: false }));
      for (const memberKey of [RITA, NUNO, BEA]) {
        walked = answerStep(
          walked,
          memberKey,
          { type: "prompt", text: `caption by ${memberKey}` },
          1_000,
        ).state;
      }
      for (const memberKey of [NUNO, BEA]) {
        walked = voteStep(
          walked,
          memberKey,
          optionIdOf(walked, RITA),
          2_000,
        ).state;
      }
      walked = voteStep(walked, RITA, optionIdOf(walked, BEA), 2_100).state;
      expect(walked.cursor.phase).toBe("reveal");
      return walked;
    };
    const hideRita = (shown: QuizshowEngineState): QuizshowEngineStep =>
      hostStep(
        shown,
        "host:hideAnswer",
        { answerId: answerIdOf(shown, RITA), isHidden: true },
        4_000,
      );
    const leaderboardState = nextStep(
      toCaptionReveal(
        quizOf([
          roundOf("caption", "caption_this", [CAPTION_QUESTION]),
          roundOf("quiz", "quiz", [CHOICE_QUESTION]),
        ]),
      ),
      3_000,
    ).state;
    expect(leaderboardState.cursor.phase).toBe("leaderboard");
    const ritaId = playerIdFor(leaderboardState, RITA);
    expect(scoreOf(leaderboardState, RITA)).toBe(500);
    expect(leaderboardState.scoresAtLastFrame[ritaId]).toBe(500);
    const hiddenOnLeaderboard = hideRita(leaderboardState);
    expect(hiddenOnLeaderboard.ack).toEqual({ ok: true, isNoop: false });
    expect(hiddenOnLeaderboard.state.scoresAtLastFrame[ritaId]).toBe(0);
    const resentScores = at(
      payloadsOf(screenFrames(hiddenOnLeaderboard), "scores"),
      0,
    );
    expect(resentScores.scope).toBe("round");
    expect(
      resentScores.entries.find((entry) => entry.entrantId === ritaId),
    ).toMatchObject({ score: 0, previousScore: 0 });
    const podiumState = nextStep(toCaptionReveal(CAPTION_QUIZ), 3_000).state;
    expect(podiumState.cursor.phase).toBe("podium");
    const podiumRitaId = playerIdFor(podiumState, RITA);
    expect(podiumState.scoresAtLastFrame[podiumRitaId]).toBe(500);
    const hiddenOnPodium = hideRita(podiumState);
    expect(hiddenOnPodium.state.scoresAtLastFrame[podiumRitaId]).toBe(0);
    const podiumScores = at(
      payloadsOf(screenFrames(hiddenOnPodium), "scores"),
      0,
    );
    expect(podiumScores.scope).toBe("final");
    expect(
      podiumScores.entries.find((entry) => entry.entrantId === podiumRitaId),
    ).toMatchObject({ score: 0 });
    expect(payloadsOf(screenFrames(hiddenOnPodium), "podium")).toHaveLength(1);
  });

  it("keeps the scores frames out of a hide during reveal", () => {
    let state = toCaptionWrite(
      joinedEngine({ quiz: CAPTION_QUIZ, isReviewOn: false }),
    );
    for (const memberKey of [RITA, NUNO, BEA]) {
      state = answerStep(
        state,
        memberKey,
        { type: "prompt", text: `caption by ${memberKey}` },
        1_000,
      ).state;
    }
    for (const memberKey of [NUNO, BEA]) {
      state = voteStep(state, memberKey, optionIdOf(state, RITA), 2_000).state;
    }
    state = voteStep(state, RITA, optionIdOf(state, BEA), 2_100).state;
    expect(state.cursor.phase).toBe("reveal");
    const hidden = hostStep(
      state,
      "host:hideAnswer",
      { answerId: answerIdOf(state, RITA), isHidden: true },
      3_000,
    );
    expect(hidden.ack).toEqual({ ok: true, isNoop: false });
    expect(payloadsOf(screenFrames(hidden), "scores")).toEqual([]);
  });
});

describe("demo engine hiding and removal", () => {
  it("takes back a hidden answer's points and recomputes the team", () => {
    let state = engineWith({
      playMode: "teams",
      quiz: CAPTION_QUIZ,
      isReviewOn: false,
    });
    state = joinTeamed(state, RITA, "Rita", {
      newTeam: { name: "Quizzly Bears", colorKey: "circle" },
    }).state;
    const bearsId = at(state.teams, 0).teamId;
    state = joinTeamed(state, NUNO, "Nuno", { teamId: bearsId }).state;
    state = joinTeamed(state, BEA, "Bea", {
      newTeam: { name: "Disco Inferno", colorKey: "star" },
    }).state;
    const discoId = at(state.teams, 1).teamId;
    state = joinTeamed(state, KIKO, "Kiko", { teamId: discoId }).state;
    state = toCaptionWrite(state);
    for (const memberKey of [RITA, NUNO, BEA, KIKO]) {
      state = answerStep(
        state,
        memberKey,
        { type: "prompt", text: `caption by ${memberKey}` },
        1_000,
      ).state;
    }
    for (const memberKey of [NUNO, BEA, KIKO]) {
      state = voteStep(state, memberKey, optionIdOf(state, RITA), 2_000).state;
    }
    state = voteStep(state, RITA, optionIdOf(state, BEA), 2_100).state;
    expect(state.cursor.phase).toBe("reveal");
    expect(scoreOf(state, RITA)).toBe(750);
    const teamScore = (
      current: QuizshowEngineState,
      teamId: string,
    ): number | undefined =>
      current.teams.find((team) => team.teamId === teamId)?.score;
    expect(teamScore(state, bearsId)).toBe(375);
    expect(teamScore(state, discoId)).toBe(125);
    const ritaOptionId = optionIdOf(state, RITA);
    const hidden = hostStep(
      state,
      "host:hideAnswer",
      { answerId: answerIdOf(state, RITA), isHidden: true },
      3_000,
    );
    expect(hidden.ack).toEqual({ ok: true, isNoop: false });
    expect(scoreOf(hidden.state, RITA)).toBe(0);
    expect(teamScore(hidden.state, bearsId)).toBe(0);
    expect(teamScore(hidden.state, discoId)).toBe(125);
    expect(
      at(payloadsOf(screenFrames(hidden), "answer:hidden"), 0),
    ).toMatchObject({
      questionId: "question-caption",
      optionId: ritaOptionId,
    });
    const updatedReveal = at(payloadsOf(screenFrames(hidden), "reveal"), 0);
    if (updatedReveal.distribution.kind !== "votes") {
      throw new Error("Expected votes.");
    }
    expect(
      updatedReveal.distribution.entries.map((entry) => entry.optionId),
    ).not.toContain(ritaOptionId);
  });

  it("allows un-hiding during review only", () => {
    let state = toLieWrite(joinedEngine());
    for (const { memberKey, text } of LIE_TEXTS) {
      state = answerStep(
        state,
        memberKey,
        { type: "prompt", text },
        1_000,
      ).state;
    }
    expect(state.cursor.phase).toBe("review");
    const ritaAnswerId = answerIdOf(state, RITA);
    const hidden = hostStep(
      state,
      "host:hideAnswer",
      { answerId: ritaAnswerId, isHidden: true },
      2_000,
    );
    const hostView = framesForViewer(hidden.frames, {
      role: "host",
      playerId: null,
    });
    const submissions = at(payloadsOf(hostView, "review:list"), 0).submissions;
    expect(
      submissions.find((submission) => submission.answerId === ritaAnswerId)
        ?.isHidden,
    ).toBe(true);
    expect(at(payloadsOf(hostView, "answer:hidden"), 0)).toMatchObject({
      answerId: ritaAnswerId,
      optionId: null,
    });
    expect(screenFrames(hidden)).toEqual([]);
    const shown = hostStep(
      hidden.state,
      "host:hideAnswer",
      { answerId: ritaAnswerId, isHidden: false },
      2_100,
    );
    expect(shown.ack).toEqual({ ok: true, isNoop: false });
    state = hostStep(
      shown.state,
      "host:hideAnswer",
      { answerId: ritaAnswerId, isHidden: true },
      2_200,
    ).state;
    state = hostStep(
      state,
      "host:showAnswers",
      { phaseId: state.cursor.phaseId },
      3_000,
    ).state;
    expect(state.cursor.phase).toBe("vote");
    expect(
      state.current?.voteOptions?.some(
        (option) => option.answerId === ritaAnswerId,
      ),
    ).toBe(false);
    expect(
      hostStep(
        state,
        "host:hideAnswer",
        { answerId: ritaAnswerId, isHidden: false },
        3_100,
      ).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_command_not_allowed",
      cursor: { phase: "vote" },
    });
  });

  it("removes a player, hides their party answers and closes the phase when they were the last to answer", () => {
    let state = toLieVote(joinedEngine());
    const beaOptionId = optionIdOf(state, BEA);
    state = voteStep(state, RITA, truthOptionId(state), 5_000).state;
    state = voteStep(state, NUNO, truthOptionId(state), 5_100).state;
    expect(state.cursor.phase).toBe("vote");
    const beaId = playerIdFor(state, BEA);
    const removed = hostStep(
      state,
      "host:removePlayer",
      { playerId: beaId },
      6_000,
    );
    expect(removed.ack).toEqual({ ok: true, isNoop: false });
    expect(removed.state.cursor.phase).toBe("reveal");
    expect(payloadsOf(playerFrames(removed, BEA), "player:removed")).toEqual([
      { sessionId: "demo-session" },
    ]);
    const screenView = screenFrames(removed);
    expect(at(screenView, 0).event).toBe("phase:change");
    expect(at(payloadsOf(screenView, "answer:hidden"), 0).optionId).toBe(
      beaOptionId,
    );
    expect(at(payloadsOf(screenView, "lobby:update"), 0).playerCount).toBe(2);
    const distribution = at(payloadsOf(screenView, "reveal"), 0).distribution;
    if (distribution.kind !== "votes") throw new Error("Expected votes.");
    expect(distribution.entries.map((entry) => entry.text)).not.toContain(
      "a ferry",
    );
    expect(
      hostStep(removed.state, "host:removePlayer", { playerId: beaId }, 6_100)
        .ack,
    ).toEqual({
      ok: true,
      isNoop: true,
    });
    expect(
      playerStep(
        removed.state,
        BEA,
        "settings:extraTime",
        { hasExtraTime: true },
        6_200,
      ).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_player_removed",
    });
  });
});

describe("demo engine double taps", () => {
  it("acks a joker double tap on the same round with the player's me, even once the moment has passed", () => {
    const played = playerStep(
      joinedEngine(),
      RITA,
      "joker:play",
      { roundIndex: 0 },
      0,
    );
    const doubleTap = playerStep(
      played.state,
      RITA,
      "joker:play",
      { roundIndex: 0 },
      100,
    );
    expect(doubleTap.ack).toMatchObject({
      ok: true,
      me: { hasUsedJoker: true, jokerRoundIndex: 0 },
    });
    expect(doubleTap.frames).toEqual([]);
    const reading = toRead(played.state);
    expect(reading.cursor.phase).toBe("read");
    expect(
      playerStep(reading, RITA, "joker:play", { roundIndex: 0 }, 200).ack,
    ).toMatchObject({
      ok: true,
      me: { hasUsedJoker: true, jokerRoundIndex: 0 },
    });
  });

  it("acks a teammate's joker tap on the round the team already played it on", () => {
    let state = engineWith({ playMode: "teams" });
    state = joinTeamed(state, RITA, "Rita", {
      newTeam: { name: "Quizzly Bears", colorKey: "circle" },
    }).state;
    const bearsId = at(state.teams, 0).teamId;
    state = joinTeamed(state, NUNO, "Nuno", { teamId: bearsId }).state;
    state = playerStep(state, RITA, "joker:play", { roundIndex: 0 }, 0).state;
    const teammateTap = playerStep(
      state,
      NUNO,
      "joker:play",
      { roundIndex: 0 },
      100,
    );
    expect(teammateTap.ack).toMatchObject({
      ok: true,
      me: { teamId: bearsId },
    });
    expect(teammateTap.frames).toEqual([]);
    expect(
      teammateTap.state.teams.find((team) => team.teamId === bearsId),
    ).toMatchObject({ hasUsedJoker: true, jokerRoundIndex: 0 });
  });

  it("acks a create-team double tap with the team the player already holds", () => {
    const joined = joinTeamed(engineWith({ playMode: "teams" }), RITA, "Rita", {
      newTeam: { name: "Disco Inferno", colorKey: "star" },
    });
    const first = playerStep(
      joined.state,
      RITA,
      "lobby:createTeam",
      { name: "Quizzly Bears", colorKey: "circle" },
      0,
    );
    const bearsId = at(first.state.teams, 1).teamId;
    expect(first.ack).toMatchObject({ ok: true, teamId: bearsId });
    const doubleTap = playerStep(
      first.state,
      RITA,
      "lobby:createTeam",
      { name: " quizzly bears ", colorKey: "circle" },
      100,
    );
    expect(doubleTap.ack).toMatchObject({
      ok: true,
      teamId: bearsId,
      me: { teamId: bearsId },
    });
    expect(doubleTap.frames).toEqual([]);
    expect(doubleTap.state.teams).toHaveLength(2);
    expect(
      playerStep(
        first.state,
        RITA,
        "lobby:createTeam",
        { name: "Quizzly Bears", colorKey: "triangle" },
        100,
      ).ack,
    ).toMatchObject({ ok: false, code: "quizshow_team_name_taken" });
  });
});

describe("demo engine lobby rules and the screen", () => {
  it("plays a joker once per night at an allowed moment", () => {
    let state = joinedEngine();
    expect(
      playerStep(state, RITA, "joker:play", { roundIndex: 1 }, 0).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_joker_not_allowed",
    });
    const played = playerStep(state, RITA, "joker:play", { roundIndex: 0 }, 0);
    expect(played.ack).toMatchObject({
      ok: true,
      me: { hasUsedJoker: true, jokerRoundIndex: 0 },
    });
    expect(payloadsOf(playerFrames(played, RITA), "me:update")).toHaveLength(1);
    state = played.state;
    expect(
      playerStep(state, RITA, "joker:play", { roundIndex: 1 }, 0).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_joker_not_allowed",
    });
    state = toRead(state);
    expect(
      playerStep(state, NUNO, "joker:play", { roundIndex: 0 }, 100).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_joker_not_allowed",
    });
    state = skipStep(skipStep(state, 200).state, 300).state;
    expect(state.cursor).toMatchObject({ phase: "leaderboard", roundIndex: 0 });
    expect(
      playerStep(state, NUNO, "joker:play", { roundIndex: 1 }, 400).ack,
    ).toMatchObject({
      ok: true,
      me: { hasUsedJoker: true, jokerRoundIndex: 1 },
    });
    expect(
      playerStep(state, RITA, "joker:play", { roundIndex: 1 }, 400).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_joker_used",
    });
  });

  it("locks names and teams once the game starts", () => {
    let state = engineWith({ playMode: "teams" });
    state = joinTeamed(state, RITA, "Rita", {
      newTeam: { name: "Quizzly Bears", colorKey: "circle" },
    }).state;
    const bearsId = at(state.teams, 0).teamId;
    state = joinTeamed(state, NUNO, "Nuno", {
      newTeam: { name: "Spill the Tea", colorKey: "triangle" },
    }).state;
    const teaId = at(state.teams, 1).teamId;
    state = hostStep(state, "host:start", { phaseId: "0" }, 0).state;
    const closed = { ok: false, code: "quizshow_team_change_closed" };
    expect(
      playerStep(
        state,
        RITA,
        "lobby:setName",
        { screenName: "Rita Moment" },
        100,
      ).ack,
    ).toMatchObject(closed);
    expect(
      playerStep(state, RITA, "lobby:pickTeam", { teamId: teaId }, 100).ack,
    ).toMatchObject(closed);
    expect(
      playerStep(
        state,
        RITA,
        "lobby:createTeam",
        { name: "Disco Inferno", colorKey: "star" },
        100,
      ).ack,
    ).toMatchObject(closed);
    expect(
      joinTeamed(
        state,
        KIKO,
        "Kiko",
        { newTeam: { name: "Disco Inferno", colorKey: "star" } },
        100,
      ).ack,
    ).toMatchObject(closed);
    expect(
      joinTeamed(state, KIKO, "Kiko", { teamId: bearsId }, 100).ack,
    ).toMatchObject({
      ok: true,
      me: { teamId: bearsId },
    });
  });

  it("mutes the screen for every host and the screen, and acks a repeat as a noop", () => {
    const state = joinedEngine();
    const muted = hostStep(
      state,
      "host:setScreenMuted",
      { isMuted: true },
      100,
    );
    expect(muted.ack).toEqual({ ok: true, isNoop: false });
    expect(muted.frames).toEqual([
      {
        audience: "screen",
        frame: { event: "screen:muted", payload: { isMuted: true } },
      },
      {
        audience: "hosts",
        frame: { event: "screen:muted", payload: { isMuted: true } },
      },
    ]);
    expect(
      engineSessionStateFor(muted.state, { role: "screen" }).isScreenMuted,
    ).toBe(true);
    expect(
      engineSessionStateFor(muted.state, { role: "host" }).isScreenMuted,
    ).toBe(true);
    expect(
      engineSessionStateFor(muted.state, {
        role: "player",
        memberKey: RITA,
        suggestedScreenName: "Rita",
      }).isScreenMuted,
    ).toBe(true);
    const repeat = hostStep(
      muted.state,
      "host:setScreenMuted",
      { isMuted: true },
      200,
    );
    expect(repeat.ack).toEqual({ ok: true, isNoop: true });
    expect(repeat.frames).toEqual([]);
  });
});

describe("demo engine coordinator rulings on moves and points", () => {
  it("checks host:end like a moving command, so a stale or repeated End is a no-op", () => {
    let state = toOpen(joinedEngine());
    for (const memberKey of [RITA, NUNO, BEA]) {
      state = answerStep(
        state,
        memberKey,
        { type: "multiple_choice", optionIndex: 1 },
        5_000,
      ).state;
    }
    const revealPhaseId = state.cursor.phaseId;
    const ended = hostStep(
      state,
      "host:end",
      { phaseId: revealPhaseId },
      6_000,
    );
    expect(ended.state.cursor.phase).toBe("podium");
    const repeat = hostStep(
      ended.state,
      "host:end",
      { phaseId: revealPhaseId },
      6_100,
    );
    expect(repeat.ack).toEqual({ ok: true, isNoop: true });
    expect(repeat.state.cursor.phase).toBe("podium");
    expect(
      hostStep(ended.state, "host:end", { phaseId: "0" }, 6_200).ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_stale_phase",
      cursor: { phase: "podium" },
    });
    const finished = hostStep(
      ended.state,
      "host:end",
      { phaseId: ended.state.cursor.phaseId },
      6_300,
    );
    expect(finished.state.cursor).toMatchObject({
      phase: "ended",
      status: "finished",
    });
  });

  it("closes once everyone still allowed to submit has, so a standard player past the deadline holds nothing", () => {
    let state = toOpen(joinedEngine({}, BEA));
    state = answerStep(
      state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      5_000,
    ).state;
    state = tickStep(state, 24_500).state;
    expect(state.cursor.phase).toBe("open");
    // Nuno never answered and his deadline plus grace has passed, so Bea's answer closes the phase.
    const result = answerStep(
      state,
      BEA,
      { type: "multiple_choice", optionIndex: 1 },
      30_000,
    );
    expect(result.state.cursor.phase).toBe("reveal");
  });

  it("averages a team over the members present at the opening, a removed one counting 0", () => {
    let state = engineWith({ playMode: "teams" });
    state = joinTeamed(state, RITA, "Rita", {
      newTeam: { name: "Quizzly Bears", colorKey: "circle" },
    }).state;
    const bearsId = at(state.teams, 0).teamId;
    state = joinTeamed(state, NUNO, "Nuno", { teamId: bearsId }).state;
    state = joinTeamed(state, BEA, "Bea", {
      newTeam: { name: "Spill the Tea", colorKey: "triangle" },
    }).state;
    state = toOpen(state);
    state = answerStep(
      state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      4_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "multiple_choice", optionIndex: 1 },
      4_000,
    ).state;
    state = hostStep(
      state,
      "host:removePlayer",
      { playerId: playerIdFor(state, NUNO) },
      5_000,
    ).state;
    state = answerStep(
      state,
      BEA,
      { type: "multiple_choice", optionIndex: 0 },
      6_000,
    ).state;
    expect(state.cursor.phase).toBe("reveal");
    expect(scoreOf(state, RITA)).toBe(1_100);
    // (1100 + 0) / 2: Nuno was present at the opening and counts 0 once removed.
    expect(state.teams.find((team) => team.teamId === bearsId)?.score).toBe(
      550,
    );
  });

  it("counts no vote from a voter removed before the reveal", () => {
    let state = toLieVote(joinedEngine());
    state = voteStep(state, NUNO, optionIdOf(state, RITA), 5_000).state;
    state = voteStep(state, BEA, optionIdOf(state, RITA), 5_100).state;
    state = hostStep(
      state,
      "host:removePlayer",
      { playerId: playerIdFor(state, NUNO) },
      5_200,
    ).state;
    expect(state.cursor.phase).toBe("vote");
    state = voteStep(state, RITA, truthOptionId(state), 5_300).state;
    expect(state.cursor.phase).toBe("reveal");
    // The truth (1000) plus Bea fooled (500); Nuno's vote counts for nobody.
    expect(scoreOf(state, RITA)).toBe(1_500);
  });
});

describe("demo engine coordinator rulings on time and favourites", () => {
  it("keeps the signed remainder when a pause falls inside the grace", () => {
    const opened = toOpen(joinedEngine());
    const paused = hostStep(
      opened,
      "host:pause",
      { phaseId: opened.cursor.phaseId },
      24_300,
    ).state;
    expect(paused.cursor).toMatchObject({
      pausedRemainingMs: -300,
      pausedExtraTimeRemainingMs: 9_700,
    });
    const resumed = hostStep(
      paused,
      "host:resume",
      { phaseId: paused.cursor.phaseId },
      60_000,
    ).state;
    expect(resumed.cursor).toMatchObject({
      deadline: 59_700,
      extraTimeDeadline: 69_700,
    });
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    expect(answerStep(resumed, RITA, choice, 60_200).ack).toMatchObject({
      ok: true,
      isDuplicate: false,
    });
    expect(answerStep(resumed, RITA, choice, 60_201).ack).toMatchObject({
      ok: false,
      code: "quizshow_phase_closed",
    });
    expect(tickStep(resumed, 60_199).state.cursor.phase).toBe("open");
    expect(tickStep(resumed, 60_200).state.cursor.phase).toBe("reveal");
  });

  it("resets the idle clock on every host command attempt, refused ones included", () => {
    const state = joinedEngine();
    const refused = hostStep(state, "host:start", { phaseId: "7" }, 7_000_000);
    expect(refused.ack).toMatchObject({
      ok: false,
      code: "quizshow_stale_phase",
    });
    expect(refused.frames).toEqual([]);
    expect(refused.state.lastHostCommandAt).toBe(7_000_000);
    expect(refused.state.cursor).toEqual(state.cursor);
  });

  it("clears the favourite when its answer is hidden", () => {
    let state = toCaptionWrite(
      joinedEngine({ quiz: CAPTION_QUIZ, isReviewOn: false }),
    );
    for (const memberKey of [RITA, NUNO, BEA]) {
      state = answerStep(
        state,
        memberKey,
        { type: "prompt", text: `caption by ${memberKey}` },
        1_000,
      ).state;
    }
    state = voteStep(state, RITA, optionIdOf(state, NUNO), 2_000).state;
    state = voteStep(state, NUNO, optionIdOf(state, RITA), 2_100).state;
    state = voteStep(state, BEA, optionIdOf(state, RITA), 2_200).state;
    const nunoOptionId = optionIdOf(state, NUNO);
    state = hostStep(
      state,
      "host:pickFavourite",
      {
        phaseId: state.cursor.phaseId,
        questionId: "question-caption",
        optionId: nunoOptionId,
      },
      3_000,
    ).state;
    expect(scoreOf(state, NUNO)).toBe(750);
    const hidden = hostStep(
      state,
      "host:hideAnswer",
      { answerId: answerIdOf(state, NUNO), isHidden: true },
      3_100,
    );
    expect(hidden.state.current?.favouriteOptionId).toBeNull();
    expect(scoreOf(hidden.state, NUNO)).toBe(0);
    const distribution = at(
      payloadsOf(screenFrames(hidden), "reveal"),
      0,
    ).distribution;
    expect(distribution).toMatchObject({
      kind: "votes",
      favouriteOptionId: null,
    });
  });

  it("stops taking fakes after three too-close tries and still lets the player vote", () => {
    let state = toLieWrite(joinedEngine());
    for (const attempt of [1_000, 1_100, 1_200]) {
      const result = answerStep(
        state,
        RITA,
        { type: "prompt", text: "a sauna" },
        attempt,
      );
      expect(result.ack).toMatchObject({
        ok: false,
        code: "quizshow_fake_too_close",
      });
      state = result.state;
    }
    expect(state.current?.tooCloseFakeCounts?.[playerIdFor(state, RITA)]).toBe(
      3,
    );
    expect(
      answerStep(state, RITA, { type: "prompt", text: "a basement" }, 1_300)
        .ack,
    ).toMatchObject({
      ok: false,
      code: "quizshow_fake_too_close",
    });
    state = answerStep(
      state,
      NUNO,
      { type: "prompt", text: "a rooftop" },
      2_000,
    ).state;
    state = answerStep(
      state,
      BEA,
      { type: "prompt", text: "a ferry" },
      3_000,
    ).state;
    expect(state.cursor.phase).toBe("write");
    state = nextStep(state, 4_000).state;
    state = hostStep(
      state,
      "host:showAnswers",
      { phaseId: state.cursor.phaseId },
      5_000,
    ).state;
    expect(state.cursor.phase).toBe("vote");
    expect(state.current?.voteOptions).toHaveLength(3);
    expect(
      voteStep(state, RITA, truthOptionId(state), 6_000).ack,
    ).toMatchObject({ ok: true, isDuplicate: false });
  });
});
