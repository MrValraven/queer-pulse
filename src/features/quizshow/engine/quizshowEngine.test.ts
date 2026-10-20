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
import { quizshowRandomFrom } from "./quizshowRandom";
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

function endStep(state: QuizshowEngineState, now: number): QuizshowEngineStep {
  return hostStep(state, "host:end", { phaseId: state.cursor.phaseId }, now);
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

describe("demo engine lobby and start", () => {
  it("opens in the lobby with phase id 0 and refuses a start with nobody in it", () => {
    const state = engineWith();
    expect(state.cursor).toMatchObject({
      phaseId: "0",
      phase: "lobby",
      status: "lobby",
      roundCount: 2,
    });
    const result = hostStep(state, "host:start", { phaseId: "0" }, 0);
    expect(result.ack).toEqual({
      ok: false,
      code: "quizshow_no_players",
      message: "quizshow_no_players",
    });
    expect(result.frames).toEqual([]);
    expect(result.state).toEqual(state);
  });

  it("starts at round 0's intro and drops empty teams", () => {
    let state = engineWith({ playMode: "teams" });
    state = playerStep(
      state,
      RITA,
      "lobby:join",
      joinPayload("Rita", {
        team: { newTeam: { name: "Quizzly Bears", colorKey: "circle" } },
      }),
      0,
    ).state;
    state = playerStep(
      state,
      NUNO,
      "lobby:join",
      joinPayload("Nuno", {
        team: { newTeam: { name: "Spill the Tea", colorKey: "triangle" } },
      }),
      0,
    ).state;
    const keptTeamId = at(state.teams, 0).teamId;
    state = playerStep(
      state,
      NUNO,
      "lobby:pickTeam",
      { teamId: keptTeamId },
      0,
    ).state;
    expect(state.teams).toHaveLength(2);
    const result = hostStep(state, "host:start", { phaseId: "0" }, 0);
    expect(result.ack).toEqual({ ok: true, isNoop: false });
    expect(result.state.cursor).toMatchObject({
      phaseId: "1",
      phase: "round_intro",
      roundIndex: 0,
      status: "running",
    });
    expect(result.state.teams.map((team) => team.name)).toEqual([
      "Quizzly Bears",
    ]);
    const frames = screenFrames(result);
    expect(at(frames, 0).event).toBe("phase:change");
    const lobby = at(payloadsOf(frames, "lobby:update"), 0);
    expect(lobby.teams.map((team) => team.teamId)).toEqual([keptTeamId]);
  });

  it("keeps an idle lobby open, since the demo has no idle clock", () => {
    const state = joinedEngine();
    const result = tickStep(state, 7_200_000);
    expect(result.state.cursor).toMatchObject({
      phase: "lobby",
      status: "lobby",
    });
    expect(result.frames).toEqual([]);
  });
});

describe("demo engine timed phases", () => {
  it("shows a quiz question for four seconds, then opens it with the round's limit", () => {
    const reading = toRead(joinedEngine());
    expect(reading.cursor).toMatchObject({
      phaseId: "2",
      phase: "read",
      deadline: 4_000,
    });
    const early = tickStep(reading, 3_999);
    expect(early.state.cursor.phase).toBe("read");
    expect(early.frames).toEqual([]);
    expect(early.ack).toBeNull();
    const opened = tickStep(reading, 4_000);
    expect(opened.state.cursor).toMatchObject({
      phaseId: "3",
      phase: "open",
      phaseStartedAt: 4_000,
      deadline: 24_000,
      extraTimeDeadline: 34_000,
    });
  });

  it("closes open early once every eligible player answered", () => {
    let state = toOpen(joinedEngine());
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    state = answerStep(state, RITA, choice, 5_000).state;
    state = answerStep(state, NUNO, choice, 6_000).state;
    expect(state.cursor.phase).toBe("open");
    const result = answerStep(state, BEA, choice, 7_000);
    expect(result.state.cursor.phase).toBe("reveal");
    const frames = screenFrames(result);
    expect(at(frames, 0).event).toBe("phase:change");
    expect(payloadsOf(frames, "reveal")).toHaveLength(1);
  });

  it("ends open at the extra-time deadline while an extra-time player has not answered", () => {
    let state = toOpen(joinedEngine({}, BEA));
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 0,
    };
    state = answerStep(state, RITA, choice, 5_000).state;
    state = answerStep(state, NUNO, choice, 6_000).state;
    const waiting = tickStep(state, 24_500);
    expect(waiting.state.cursor.phase).toBe("open");
    expect(waiting.frames).toEqual([]);
    const answered = answerStep(waiting.state, BEA, choice, 30_000);
    expect(answered.ack).toMatchObject({ ok: true, isDuplicate: false });
    expect(answered.state.cursor.phase).toBe("reveal");
    expect(tickStep(waiting.state, 34_499).state.cursor.phase).toBe("open");
    expect(tickStep(waiting.state, 34_500).state.cursor.phase).toBe("reveal");
  });

  it("accepts an answer inside the 500 ms grace and refuses one after it", () => {
    const state = toOpen(joinedEngine());
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    const inGrace = answerStep(state, RITA, choice, 24_500);
    expect(inGrace.ack).toMatchObject({ ok: true, isDuplicate: false });
    const late = answerStep(inGrace.state, NUNO, choice, 24_501);
    expect(late.ack).toEqual({
      ok: false,
      code: "quizshow_phase_closed",
      message: "quizshow_phase_closed",
    });
  });

  it("keeps a late joiner out of the question in play and in from the next", () => {
    let state = toOpen(joinedEngine());
    state = playerStep(
      state,
      "member-kiko",
      "lobby:join",
      joinPayload("Kiko"),
      5_000,
    ).state;
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    expect(answerStep(state, "member-kiko", choice, 5_100).ack).toMatchObject({
      ok: false,
      code: "quizshow_not_eligible",
    });
    for (const memberKey of [RITA, NUNO, BEA]) {
      state = answerStep(state, memberKey, choice, 6_000).state;
    }
    state = nextStep(state, 7_000).state;
    expect(state.cursor.phase).toBe("scores");
    state = nextStep(state, 8_000).state;
    state = tickStep(state, 12_000).state;
    expect(state.cursor).toMatchObject({ phase: "open", questionIndex: 1 });
    expect(
      answerStep(
        state,
        "member-kiko",
        { type: "closest_number", value: 90 },
        13_000,
      ).ack,
    ).toMatchObject({ ok: true, isDuplicate: false });
  });
});

describe("demo engine privacy", () => {
  it("never sends an answer key, a truth or a vote count to the screen or players before reveal", () => {
    const choice: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    const walk: Array<(state: QuizshowEngineState) => QuizshowEngineAction> = [
      () => ({
        type: "host",
        name: "host:start",
        payload: { phaseId: "0" },
        now: 0,
      }),
      (state) => ({
        type: "host",
        name: "host:next",
        payload: { phaseId: state.cursor.phaseId },
        now: 0,
      }),
      () => ({ type: "tick", now: 4_000 }),
      ...[RITA, NUNO, BEA].map(
        (memberKey) =>
          (state: QuizshowEngineState): QuizshowEngineAction => ({
            type: "player",
            memberKey,
            name: "answer:submit",
            payload: {
              phaseId: state.cursor.phaseId,
              questionId: currentQuestionId(state),
              payload: choice,
            },
            now: 5_000,
          }),
      ),
      (state) => ({
        type: "host",
        name: "host:skip",
        payload: { phaseId: state.cursor.phaseId },
        now: 6_000,
      }),
      (state) => ({
        type: "host",
        name: "host:skip",
        payload: { phaseId: state.cursor.phaseId },
        now: 6_000,
      }),
      (state) => ({
        type: "host",
        name: "host:next",
        payload: { phaseId: state.cursor.phaseId },
        now: 6_000,
      }),
      (state) => ({
        type: "host",
        name: "host:next",
        payload: { phaseId: state.cursor.phaseId },
        now: 6_000,
      }),
      ...[
        { memberKey: RITA, text: "a basement" },
        { memberKey: NUNO, text: "a rooftop" },
        { memberKey: BEA, text: "a ferry" },
      ].map(
        ({ memberKey, text }) =>
          (state: QuizshowEngineState): QuizshowEngineAction => ({
            type: "player",
            memberKey,
            name: "answer:submit",
            payload: {
              phaseId: state.cursor.phaseId,
              questionId: currentQuestionId(state),
              payload: { type: "prompt", text },
            },
            now: 7_000,
          }),
      ),
      (state) => ({
        type: "host",
        name: "host:showAnswers",
        payload: { phaseId: state.cursor.phaseId },
        now: 8_000,
      }),
      ...[RITA, NUNO, BEA].map(
        (memberKey) =>
          (state: QuizshowEngineState): QuizshowEngineAction => ({
            type: "player",
            memberKey,
            name: "vote:submit",
            payload: {
              phaseId: state.cursor.phaseId,
              questionId: currentQuestionId(state),
              optionId: truthOptionId(state),
            },
            now: 9_000,
          }),
      ),
    ];
    const secretKeys = [
      '"answerKey"',
      '"correctIndex"',
      '"truth"',
      '"isTruth"',
      '"voteCount"',
    ];
    const beforeReveal = ["read", "open", "write", "review", "vote"];
    let state = joinedEngine();
    const visitedPhases = new Set<string>();
    for (const buildAction of walk) {
      const result = step(state, buildAction(state));
      expect(result.ack === null || result.ack.ok).toBe(true);
      state = result.state;
      if (!beforeReveal.includes(state.cursor.phase)) continue;
      visitedPhases.add(state.cursor.phase);
      const publicJson = JSON.stringify([
        result.frames.filter((frame) => frame.audience !== "hosts"),
        engineSessionStateFor(state, { role: "screen" }),
        engineSessionStateFor(state, {
          role: "player",
          memberKey: RITA,
          suggestedScreenName: "Rita",
        }),
      ]);
      for (const secretKey of secretKeys)
        expect(publicJson).not.toContain(secretKey);
    }
    expect([...visitedPhases].sort()).toEqual([
      "open",
      "read",
      "review",
      "vote",
      "write",
    ]);
    expect(state.cursor.phase).toBe("reveal");
  });

  it("gives hosts the answer key from the question's first phase", () => {
    const started = hostStep(
      joinedEngine(),
      "host:start",
      { phaseId: "0" },
      0,
    ).state;
    const result = nextStep(started, 0);
    expect(result.state.cursor.phase).toBe("read");
    const hostChange = at(
      payloadsOf(
        framesForViewer(result.frames, { role: "host", playerId: null }),
        "phase:change",
      ),
      0,
    );
    expect(hostChange.question).toMatchObject({
      answerKey: { type: "multiple_choice", correctIndex: 1 },
    });
    expect(
      engineSessionStateFor(result.state, { role: "host" }).question,
    ).toMatchObject({
      answerKey: { type: "multiple_choice", correctIndex: 1 },
    });
    const screenChange = at(
      payloadsOf(screenFrames(result), "phase:change"),
      0,
    );
    expect(screenChange.question).not.toHaveProperty("answerKey");
  });
});

describe("demo engine party routing", () => {
  it("routes a party question through write, review, vote and reveal", () => {
    let state = toLieWrite(joinedEngine());
    expect(state.cursor).toMatchObject({
      phase: "write",
      roundIndex: 1,
      deadline: 60_000,
    });
    state = answerStep(
      state,
      RITA,
      { type: "prompt", text: "a basement" },
      1_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "prompt", text: "a rooftop" },
      2_000,
    ).state;
    const reviewing = answerStep(
      state,
      BEA,
      { type: "prompt", text: "a ferry" },
      3_000,
    );
    expect(reviewing.state.cursor.phase).toBe("review");
    const reviewList = at(
      payloadsOf(
        framesForViewer(reviewing.frames, { role: "host", playerId: null }),
        "review:list",
      ),
      0,
    );
    expect(
      reviewList.submissions.map((submission) => submission.screenName),
    ).toEqual(["Rita", "Nuno", "Bea"]);
    const voting = hostStep(
      reviewing.state,
      "host:showAnswers",
      { phaseId: reviewing.state.cursor.phaseId },
      4_000,
    );
    expect(voting.state.cursor.phase).toBe("vote");
    const screenOptions = at(
      payloadsOf(screenFrames(voting), "vote:options"),
      0,
    );
    expect(screenOptions.options).toHaveLength(4);
    expect(screenOptions.ownOptionId).toBeNull();
    const ritaId = playerIdOf(voting.state, RITA);
    const ritaOptions = at(
      payloadsOf(
        framesForViewer(voting.frames, { role: "player", playerId: ritaId }),
        "vote:options",
      ),
      0,
    );
    expect(ritaOptions.ownOptionId).not.toBeNull();
    state = voting.state;
    for (const memberKey of [RITA, NUNO]) {
      state = voteStep(state, memberKey, truthOptionId(state), 5_000).state;
    }
    const revealed = voteStep(state, BEA, truthOptionId(state), 6_000);
    expect(revealed.state.cursor.phase).toBe("reveal");
    const reveal = at(payloadsOf(screenFrames(revealed), "reveal"), 0);
    expect(reveal.distribution).toMatchObject({ kind: "votes" });
    expect(reveal.correct).toEqual({
      type: "lie_detector",
      truth: { en: "A sauna", pt: "Uma sauna" },
    });
  });

  it("names each author's own entry on their reveal and on a reconnect, null for a player who wrote nothing", () => {
    let state = toLieWrite(joinedEngine());
    state = answerStep(
      state,
      RITA,
      { type: "prompt", text: "a basement" },
      1_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "prompt", text: "a rooftop" },
      2_000,
    ).state;
    state = nextStep(state, 3_000).state;
    expect(state.cursor.phase).toBe("review");
    state = hostStep(
      state,
      "host:showAnswers",
      { phaseId: state.cursor.phaseId },
      4_000,
    ).state;
    expect(state.cursor.phase).toBe("vote");
    for (const memberKey of [RITA, NUNO]) {
      state = voteStep(state, memberKey, truthOptionId(state), 5_000).state;
    }
    const revealed = voteStep(state, BEA, truthOptionId(state), 6_000);
    expect(revealed.state.cursor.phase).toBe("reveal");
    const reveal = at(payloadsOf(screenFrames(revealed), "reveal"), 0);
    if (reveal.distribution.kind !== "votes") {
      throw new Error("Expected a votes distribution.");
    }
    const ritaEntry = reveal.distribution.entries.find(
      (entry) => entry.authorName === "Rita",
    );
    expect(ritaEntry?.answerId).toEqual(expect.any(String));
    const ritaId = playerIdOf(revealed.state, RITA);
    const ritaReveal = at(
      payloadsOf(
        framesForViewer(revealed.frames, { role: "player", playerId: ritaId }),
        "reveal:mine",
      ),
      0,
    );
    expect(ritaReveal.ownAnswerId).toBe(ritaEntry?.answerId);
    const ritaRejoin = engineSessionStateFor(revealed.state, {
      role: "player",
      memberKey: RITA,
      suggestedScreenName: "Rita",
    });
    expect(
      ritaRejoin.role === "player" ? ritaRejoin.myReveal?.ownAnswerId : null,
    ).toBe(ritaEntry?.answerId);
    const beaId = playerIdOf(revealed.state, BEA);
    const beaReveal = at(
      payloadsOf(
        framesForViewer(revealed.frames, { role: "player", playerId: beaId }),
        "reveal:mine",
      ),
      0,
    );
    expect(beaReveal.hasAnswered).toBe(false);
    expect(beaReveal.ownAnswerId).toBeNull();
  });

  it("skips review when review is off", () => {
    let state = toLieWrite(joinedEngine({ isReviewOn: false }));
    state = answerStep(
      state,
      RITA,
      { type: "prompt", text: "a basement" },
      1_000,
    ).state;
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
    expect(state.cursor.phase).toBe("vote");
    expect(state.current?.voteOptions).toHaveLength(4);
  });

  it("goes straight to reveal when fewer than two vote options remain", () => {
    const state = toLieWrite(joinedEngine());
    const result = nextStep(state, 1_000);
    expect(result.state.cursor.phase).toBe("reveal");
    expect(result.state.current?.voteOptions).toHaveLength(1);
  });
});

describe("demo engine rounds, podium and scores", () => {
  it("moves from the round's last question to the leaderboard and from the quiz's last to the podium", () => {
    let state = toRead(joinedEngine());
    state = skipStep(state, 0).state;
    expect(state.cursor).toMatchObject({ phase: "read", questionIndex: 1 });
    state = skipStep(state, 0).state;
    expect(state.cursor).toMatchObject({ phase: "leaderboard", roundIndex: 0 });
    state = nextStep(state, 0).state;
    expect(state.cursor).toMatchObject({ phase: "round_intro", roundIndex: 1 });
    state = nextStep(state, 0).state;
    const result = skipStep(state, 0);
    expect(result.state.cursor).toMatchObject({
      phase: "podium",
      roundIndex: null,
    });
    expect(payloadsOf(screenFrames(result), "podium")).toHaveLength(1);
  });

  it("finishes from the podium on Next", () => {
    let state = toRead(joinedEngine());
    for (let skipIndex = 0; skipIndex < 2; skipIndex += 1)
      state = skipStep(state, 0).state;
    state = nextStep(nextStep(state, 0).state, 0).state;
    state = skipStep(state, 0).state;
    expect(state.cursor.phase).toBe("podium");
    const result = nextStep(state, 1_000);
    expect(result.state.cursor).toMatchObject({
      phase: "ended",
      status: "finished",
    });
    expect(
      at(payloadsOf(screenFrames(result), "session:end"), 0),
    ).toMatchObject({
      status: "finished",
      hasResults: true,
      nextEvent: null,
    });
  });

  it("ends a game with no scored question as abandoned and one with scores at the podium", () => {
    const unscored = endStep(toRead(joinedEngine()), 1_000);
    expect(unscored.state.cursor).toMatchObject({
      phase: "ended",
      status: "abandoned",
    });
    expect(
      at(payloadsOf(screenFrames(unscored), "session:end"), 0),
    ).toMatchObject({
      status: "abandoned",
      podium: [],
    });
    const lobbyEnd = endStep(joinedEngine(), 0);
    expect(lobbyEnd.state.cursor.status).toBe("abandoned");
    let state = toOpen(joinedEngine());
    for (const memberKey of [RITA, NUNO, BEA]) {
      state = answerStep(
        state,
        memberKey,
        { type: "multiple_choice", optionIndex: 1 },
        5_000,
      ).state;
    }
    expect(state.cursor.phase).toBe("reveal");
    const scored = endStep(state, 6_000);
    expect(scored.state.cursor).toMatchObject({
      phase: "podium",
      status: "running",
    });
    expect(
      at(payloadsOf(screenFrames(scored), "podium"), 0).entries,
    ).toHaveLength(3);
    expect(endStep(scored.state, 7_000).state.cursor.status).toBe("finished");
  });

  it("rotates an order shuffle that lands on the correct order", () => {
    const orderQuestion: QuizshowQuestion = {
      ...QUESTION_SHARED,
      id: "question-order",
      type: "order",
      prompt: bilingual("Put these in order"),
      options: ["a", "b", "c", "d"].map((optionId) => ({
        id: optionId,
        text: bilingual(optionId),
      })),
      answer: { orderedIds: ["a", "b", "c", "d"] },
      acceptedAnswers: [],
    };
    // Seed 80's first Fisher-Yates draw over four items is the identity.
    expect(quizshowRandomFrom(80).shuffle(["a", "b", "c", "d"])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    const state = engineWith({
      seed: 80,
      quiz: quizOf([roundOf("order", "quiz", [orderQuestion])]),
    });
    expect(
      (state.shuffledOrderOptions["question-order"] ?? []).map(
        (option) => option.id,
      ),
    ).toEqual(["b", "c", "d", "a"]);
  });

  it("carries each entrant's score at the previous scores frame as previousScore", () => {
    let state = toOpen(joinedEngine());
    state = answerStep(
      state,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      4_000,
    ).state;
    state = answerStep(
      state,
      NUNO,
      { type: "multiple_choice", optionIndex: 0 },
      5_000,
    ).state;
    state = nextStep(state, 6_000).state;
    expect(state.cursor.phase).toBe("reveal");
    const firstScores = nextStep(state, 7_000);
    const ritaId = playerIdOf(firstScores.state, RITA);
    const firstEntry = at(
      payloadsOf(screenFrames(firstScores), "scores"),
      0,
    ).entries.find((entry) => entry.entrantId === ritaId);
    expect(firstEntry).toMatchObject({
      rank: 1,
      score: 1_100,
      previousScore: 0,
    });
    state = nextStep(firstScores.state, 8_000).state;
    state = tickStep(state, 12_000).state;
    state = answerStep(
      state,
      RITA,
      { type: "closest_number", value: 100 },
      13_000,
    ).state;
    state = nextStep(state, 14_000).state;
    const secondScores = nextStep(state, 15_000);
    const secondEntry = at(
      payloadsOf(screenFrames(secondScores), "scores"),
      0,
    ).entries.find((entry) => entry.entrantId === ritaId);
    expect(secondEntry).toMatchObject({ score: 2_300, previousScore: 1_100 });
  });
});
