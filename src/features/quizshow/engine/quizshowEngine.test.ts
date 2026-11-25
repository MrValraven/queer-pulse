import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerPayload,
  type QuizshowLobbyJoinInput,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
  type QuizshowRoundKind,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  drawnWheelSliceRoundIndexes,
  nextQuizshowStep,
  toWheelView,
  type QuizshowWheelState,
} from "../quizshowWheel";
import type { QuizshowServerFrame } from "../realtime/quizshowFrames";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import { quizshowRandomFrom } from "./quizshowRandom";
import { readPhaseMsFor, setSessionStatus } from "./quizshowEngineSetup";
import {
  isAutoAdvanceDue,
  isWarmUpRound,
  openQuestion,
  openRoundIntro,
  podiumStepsOf,
  refreshPodiumIfShown,
  returnAwayPlayer,
  revealNextPodiumStep,
  revealQuestion,
  showPodium,
  showScores,
  skipsLeaderboardAfterRound,
  skipsScoresAfterReveal,
} from "./quizshowEngineTransitions";
import type {
  QuizshowEngineAction,
  QuizshowEngineOptions,
  QuizshowEnginePlayer,
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
import {
  finishWheel,
  openStep,
  spinWheel,
  startWheelPick,
} from "./quizshowEngineWheel";
import {
  EMPTY_WHEEL_NIGHT,
  PICK_QUESTION_NIGHT,
  PICK_ROUND_NIGHT,
  UNPLANNED_NIGHT,
  WHEEL_FIRST_NIGHT,
  WHEEL_TEST_SETTINGS,
  wheelTestEngineOptions,
  wheelTestQuiz,
  wheelTestRound,
  wheelTestWheel,
} from "./quizshowWheelTestFixtures";

function bilingual(english: string): QuizshowText {
  return { en: english, pt: english };
}

const QUESTION_SHARED = {
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: bilingual(""),
  mediaReveal: "instant" as const,
  revealNote: bilingual(""),
  numberUnit: bilingual(""),
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
  answer: { correctIndexes: [1] },
  acceptedAnswers: [],
};

const NUMBER_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-number",
  type: "closest_number",
  prompt: bilingual("How many glitter cannons fired?"),
  options: [],
  answer: { value: 100, tolerance: { mode: "percent", amount: 10 } },
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
    settings: WHEEL_TEST_SETTINGS,
    questions,
  };
}

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Demo night",
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
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

/** Started at 0, then the first question's `read` (phase id 2, deadline 3000: the 3 s floor of the scaled read). */
function toRead(state: QuizshowEngineState): QuizshowEngineState {
  const started = hostStep(state, "host:start", { phaseId: "0" }, 0).state;
  return nextStep(started, 0).state;
}

/** The first question's `open` from 4000, past the read (deadline 24000, extra time 34000). */
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
    // The lobby already deleted Spill the Tea when Nuno left it; a hand-built empty team checks the start drops any left over, as the server does.
    expect(state.teams).toHaveLength(1);
    state = {
      ...state,
      teams: [
        ...state.teams,
        {
          teamId: "team-left-over",
          name: "Disco Inferno",
          colorKey: "star",
          score: 0,
          hasUsedJoker: false,
          jokerRoundIndex: null,
          isHostMade: false,
        },
      ],
    };
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
  it("shows a quiz question for its scaled read, then opens it with the round's limit", () => {
    const reading = toRead(joinedEngine());
    // 30 prompt characters and 22 option characters read under the 3 s floor.
    expect(reading.cursor).toMatchObject({
      phaseId: "2",
      phase: "read",
      deadline: 3_000,
    });
    expect(reading.current?.readMs).toBe(3_000);
    const early = tickStep(reading, 2_999);
    expect(early.state.cursor.phase).toBe("read");
    expect(early.frames).toEqual([]);
    expect(early.ack).toBeNull();
    const opened = tickStep(reading, 3_000);
    expect(opened.state.cursor).toMatchObject({
      phaseId: "3",
      phase: "open",
      phaseStartedAt: 3_000,
      deadline: 23_000,
      extraTimeDeadline: 33_000,
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
      '"correctIndexes"',
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
      answerKey: { type: "multiple_choice", correctIndexes: [1] },
    });
    expect(
      engineSessionStateFor(result.state, { role: "host" }).question,
    ).toMatchObject({
      answerKey: { type: "multiple_choice", correctIndexes: [1] },
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

  it("reveals the podium on Next, then finishes on the Next after the last step", () => {
    let state = toRead(joinedEngine());
    for (let skipIndex = 0; skipIndex < 2; skipIndex += 1)
      state = skipStep(state, 0).state;
    state = nextStep(nextStep(state, 0).state, 0).state;
    state = skipStep(state, 0).state;
    expect(state.cursor).toMatchObject({
      phase: "podium",
      podiumRevealedCount: 0,
    });
    // Everyone tied on 0, so the podium has one step: the winners.
    const revealed = nextStep(state, 500);
    expect(revealed.state.cursor).toMatchObject({
      phase: "podium",
      podiumRevealedCount: 1,
    });
    const result = nextStep(revealed.state, 1_000);
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

const WHEEL_NOW = 10_000;

/** Rita alone in the lobby of a wheel night. */
function wheelLobby(quiz: QuizshowQuiz): QuizshowEngineState {
  const lobby = createQuizshowEngine(wheelTestEngineOptions(quiz));
  return playerStep(lobby, RITA, "lobby:join", joinPayload("Rita"), 0).state;
}

function wheelStarted(quiz: QuizshowQuiz): QuizshowEngineState {
  const lobby = wheelLobby(quiz);
  return hostStep(
    lobby,
    "host:start",
    { phaseId: lobby.cursor.phaseId },
    WHEEL_NOW,
  ).state;
}

function ritaIdOf(state: QuizshowEngineState): string {
  const ritaId = playerIdOf(state, RITA);
  if (ritaId === null) throw new Error("Rita is not in the session.");
  return ritaId;
}

function ritaScoreOf(state: QuizshowEngineState): number {
  const ritaId = ritaIdOf(state);
  const rita = state.players.find((player) => player.playerId === ritaId);
  if (rita === undefined) throw new Error("Rita is not in the session.");
  return rita.score;
}

/** From a round card: opens its first question, then skips every question of the round. */
function skipRound(
  state: QuizshowEngineState,
  questionCount: number,
): QuizshowEngineState {
  let walked = nextStep(state, WHEEL_NOW).state;
  for (let skipped = 0; skipped < questionCount; skipped += 1) {
    walked = skipStep(walked, WHEEL_NOW).state;
  }
  return walked;
}

/** From a quiz question's `read`: Rita answers right, then the reveal and the scores show. */
function answeredToScores(state: QuizshowEngineState): QuizshowEngineState {
  let walked = nextStep(state, WHEEL_NOW).state;
  expect(walked.cursor.phase).toBe("open");
  walked = answerStep(
    walked,
    RITA,
    { type: "multiple_choice", optionIndex: 1 },
    WHEEL_NOW,
  ).state;
  expect(walked.cursor.phase).toBe("reveal");
  walked = nextStep(walked, WHEEL_NOW).state;
  expect(walked.cursor.phase).toBe("scores");
  return walked;
}

function openedWheelIn(state: QuizshowEngineState): QuizshowWheelState {
  const wheel = state.wheelProgress.wheel;
  if (wheel === null) throw new Error("No wheel is open.");
  return wheel;
}

/**
 * One spin through the exported transition on a clone (host:spin is Task 11's
 * handler), with a seeded draw, then steered onto the named slice so each
 * scenario picks the slice it needs.
 */
function spunOnto(
  state: QuizshowEngineState,
  sliceRoundIndex: number,
): QuizshowEngineState {
  const spun = structuredClone(state);
  spinWheel({ state: spun, random: quizshowRandomFrom(7) }, WHEEL_NOW);
  const wheel = openedWheelIn(spun);
  const landedSliceIndex = drawnWheelSliceRoundIndexes(
    spun.quiz.rounds,
    wheel,
    spun.wheelProgress,
  ).indexOf(sliceRoundIndex);
  if (wheel.spin === null || landedSliceIndex === -1) {
    throw new Error(`Slice ${sliceRoundIndex} is not drawn on the wheel.`);
  }
  wheel.spin.landedSliceIndex = landedSliceIndex;
  return spun;
}

/** A landed spin on the slice, then its pick started. */
function pickedOnto(
  state: QuizshowEngineState,
  sliceRoundIndex: number,
): QuizshowEngineState {
  const picked = spunOnto(state, sliceRoundIndex);
  startWheelPick(picked, WHEEL_NOW + QUIZSHOW_LIMITS.wheelSpinMs);
  return picked;
}

/** R0 (one question) skipped through, then the wheel opened from its leaderboard. */
function atFirstWheel(quiz: QuizshowQuiz): QuizshowEngineState {
  const leaderboard = skipRound(wheelStarted(quiz), 1);
  expect(leaderboard.cursor).toMatchObject({
    phase: "leaderboard",
    upNext: { kind: "wheel", wheelRoundIndex: 1 },
  });
  return nextStep(leaderboard, WHEEL_NOW).state;
}

/** R0 W1(round, Auto) R2(+500, last row): the only slice pays a bonus. */
const BONUS_LAST_NIGHT = wheelTestQuiz([
  wheelTestRound("r0", "Warm up", 1),
  wheelTestWheel("w1", "round", null),
  wheelTestRound("r2", "Finale", 1, 500),
]);

describe("demo engine running order with wheels", () => {
  it("still plays a quiz without wheels in order", () => {
    let state = wheelStarted(UNPLANNED_NIGHT);
    for (let roundIndex = 0; roundIndex < 4; roundIndex += 1) {
      expect(state.cursor).toMatchObject({
        phase: "round_intro",
        roundIndex,
        roundNumber: roundIndex + 1,
        roundCount: 4,
      });
      state = skipRound(state, 1);
      if (roundIndex === 3) break;
      expect(state.cursor).toMatchObject({ phase: "leaderboard", roundIndex });
      state = nextStep(state, WHEEL_NOW).state;
    }
    expect(state.cursor).toMatchObject({ phase: "podium", roundCount: 4 });
  });

  it("opens a wheel step from the leaderboard before it", () => {
    const leaderboard = skipRound(wheelStarted(PICK_ROUND_NIGHT), 1);
    const upNext = leaderboard.cursor.upNext;
    expect(upNext).toEqual({ kind: "wheel", wheelRoundIndex: 1 });
    if (upNext === null) throw new Error("Nothing comes next.");
    const opened = structuredClone(leaderboard);
    expect(openStep(opened, upNext, WHEEL_NOW)).toEqual([
      { kind: "phase_changed" },
    ]);
    expect(opened.cursor).toMatchObject({
      phase: "wheel",
      roundIndex: 1,
      questionIndex: null,
      deadline: null,
    });
    expect(opened.wheelProgress.openedWheelRoundIndexes).toEqual([1]);
    expect(openedWheelIn(opened)).toMatchObject({
      sliceRoundIndexes: [2, 3, 4],
      spin: null,
      restAngle: 0,
    });
  });

  it("plays the landed round in full and returns to the wheel", () => {
    const atWheel = atFirstWheel(PICK_ROUND_NIGHT);
    const picked = pickedOnto(atWheel, 2);
    expect(picked.cursor).toMatchObject({
      phase: "round_intro",
      roundIndex: 2,
    });
    expect(picked.wheelProgress.playedRoundIndexes).toEqual([0, 2]);
    expect(openedWheelIn(picked)).toMatchObject({
      pickedCount: 1,
      playingRoundIndex: 2,
      baselineByEntrant: { [ritaIdOf(picked)]: 0 },
      spin: null,
      restAngle: 0,
    });
    const leaderboard = skipRound(picked, 2);
    expect(leaderboard.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 2,
      upNext: { kind: "wheel", wheelRoundIndex: 1 },
    });
    const backAtWheel = nextStep(leaderboard, WHEEL_NOW).state;
    expect(backAtWheel.cursor).toMatchObject({ phase: "wheel", roundIndex: 1 });
    const wheel = openedWheelIn(backAtWheel);
    expect(wheel).toMatchObject({
      spin: null,
      restAngle: 0,
      playingRoundIndex: null,
      baselineByEntrant: null,
    });
    const view = toWheelView(
      backAtWheel.quiz.rounds,
      wheel,
      backAtWheel.wheelProgress,
      "wheel",
    );
    expect(view.slices.find((slice) => slice.roundIndex === 2)?.isPlayed).toBe(
      true,
    );
    expect(
      drawnWheelSliceRoundIndexes(
        backAtWheel.quiz.rounds,
        wheel,
        backAtWheel.wheelProgress,
      ),
    ).toEqual([3, 4]);
  });

  it("closes an exhausted pick-a-round wheel and moves past its range", () => {
    let state = atFirstWheel(PICK_ROUND_NIGHT);
    state = skipRound(pickedOnto(state, 2), 2);
    state = nextStep(state, WHEEL_NOW).state;
    state = skipRound(pickedOnto(state, 3), 1);
    state = nextStep(state, WHEEL_NOW).state;
    state = skipRound(pickedOnto(state, 4), 1);
    expect(state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(state.wheelProgress.wheel).toBeNull();
    expect(state.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 4,
      upNext: { kind: "round", roundIndex: 5 },
    });
    expect(nextQuizshowStep(state.quiz.rounds, state.wheelProgress)).toEqual({
      kind: "round",
      roundIndex: 5,
    });
    const finale = nextStep(state, WHEEL_NOW).state;
    expect(finale.cursor).toMatchObject({
      phase: "round_intro",
      roundIndex: 5,
    });
  });

  it("plays one question per pick and returns to the wheel with the award", () => {
    const atWheel = atFirstWheel(PICK_QUESTION_NIGHT);
    const asked = pickedOnto(atWheel, 2);
    expect(asked.cursor).toMatchObject({
      phase: "read",
      roundIndex: 2,
      questionIndex: 0,
    });
    expect(openedWheelIn(asked).askedCounts).toEqual([1, 0]);
    const scores = answeredToScores(asked);
    const scoreBeforeBonus = ritaScoreOf(scores);
    const result = nextStep(scores, WHEEL_NOW);
    expect(result.state.cursor).toMatchObject({
      phase: "wheel",
      roundIndex: 1,
    });
    const ritaId = ritaIdOf(result.state);
    expect(result.state.wheelProgress.wheelBonusAward).toMatchObject({
      phaseId: result.state.cursor.phaseId,
      points: 500,
      pick: "question",
      sliceRoundIndex: 2,
      winners: [{ entrantId: ritaId, kind: "player" }],
    });
    expect(ritaScoreOf(result.state)).toBe(scoreBeforeBonus + 500);
    // Contract A14: the hosts get their lobby scores and Rita her own score.
    expect(
      result.frames.some(
        ({ audience, frame }) =>
          audience === "hosts" && frame.event === "lobby:update",
      ),
    ).toBe(true);
    expect(
      result.frames.some(
        ({ audience, frame }) =>
          typeof audience === "object" &&
          audience.playerId === ritaId &&
          frame.event === "me:update",
      ),
    ).toBe(true);
  });

  it("ends a pick-a-question wheel with a leaderboard on the wheel row", () => {
    let state = atFirstWheel(PICK_QUESTION_NIGHT);
    state = skipStep(pickedOnto(state, 2), WHEEL_NOW).state;
    expect(state.cursor.phase).toBe("wheel");
    state = pickedOnto(state, 2);
    expect(state.cursor).toMatchObject({ roundIndex: 2, questionIndex: 1 });
    expect(openedWheelIn(state).askedCounts).toEqual([2, 0]);
    state = skipStep(state, WHEEL_NOW).state;
    expect(state.cursor.phase).toBe("wheel");
    state = skipStep(pickedOnto(state, 3), WHEEL_NOW).state;
    expect(state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(state.wheelProgress.wheel).toBeNull();
    expect(state.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 1,
      upNext: { kind: "round", roundIndex: 4 },
    });
  });
});

describe("demo engine running order with wheels: endings and edges", () => {
  it("shows only the next wheel question's points on its scores after a bonus", () => {
    const atWheel = atFirstWheel(PICK_QUESTION_NIGHT);
    const firstScores = answeredToScores(pickedOnto(atWheel, 2));
    const backAtWheel = nextStep(firstScores, WHEEL_NOW).state;
    expect(backAtWheel.cursor.phase).toBe("wheel");
    expect(backAtWheel.wheelProgress.wheelBonusAward?.points).toBe(500);
    const scoreWithBonus = ritaScoreOf(backAtWheel);
    expect(scoreWithBonus).toBe(ritaScoreOf(firstScores) + 500);

    let walked = nextStep(pickedOnto(backAtWheel, 2), WHEEL_NOW).state;
    expect(walked.cursor).toMatchObject({
      phase: "open",
      roundIndex: 2,
      questionIndex: 1,
    });
    walked = answerStep(
      walked,
      RITA,
      { type: "multiple_choice", optionIndex: 1 },
      WHEEL_NOW,
    ).state;
    expect(walked.cursor.phase).toBe("reveal");
    const secondScores = nextStep(walked, WHEEL_NOW);
    expect(secondScores.state.cursor.phase).toBe("scores");
    const ritaEntry = at(
      payloadsOf(screenFrames(secondScores), "scores"),
      0,
    ).entries.find((entry) => entry.entrantId === ritaIdOf(walked));
    // The bonus is already in the previous score, so the gain is the question's points alone.
    expect(ritaEntry).toMatchObject({
      previousScore: scoreWithBonus,
      score: ritaScoreOf(secondScores.state),
    });
  });

  it("shows a leaderboard before the podium when the last thing played earned a bonus", () => {
    const atWheel = atFirstWheel(BONUS_LAST_NIGHT);
    const read = nextStep(pickedOnto(atWheel, 2), WHEEL_NOW).state;
    expect(read.cursor).toMatchObject({ phase: "read", roundIndex: 2 });
    const result = nextStep(answeredToScores(read), WHEEL_NOW);
    expect(result.state.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 2,
      upNext: { kind: "podium" },
    });
    expect(result.state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(result.state.wheelProgress.wheelBonusAward).toMatchObject({
      phaseId: result.state.cursor.phaseId,
      points: 500,
      pick: "round",
      sliceRoundIndex: 2,
    });
    expect(nextStep(result.state, WHEEL_NOW).state.cursor.phase).toBe("podium");
  });

  it("finishes a pick-a-round wheel straight to the next step", () => {
    const finished = structuredClone(atFirstWheel(PICK_ROUND_NIGHT));
    finishWheel(finished, WHEEL_NOW);
    expect(finished.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(finished.wheelProgress.wheel).toBeNull();
    expect(finished.cursor).toMatchObject({
      phase: "round_intro",
      roundIndex: 5,
    });
    expect(finished.wheelProgress.playedRoundIndexes).toEqual([0, 5]);
  });

  it("finishes a pick-a-question wheel that played a question with a leaderboard", () => {
    const atWheel = atFirstWheel(PICK_QUESTION_NIGHT);
    const unplayed = structuredClone(atWheel);
    finishWheel(unplayed, WHEEL_NOW);
    expect(unplayed.cursor).toMatchObject({
      phase: "round_intro",
      roundIndex: 4,
    });
    const backAtWheel = skipStep(pickedOnto(atWheel, 2), WHEEL_NOW).state;
    expect(backAtWheel.cursor.phase).toBe("wheel");
    const finished = structuredClone(backAtWheel);
    finishWheel(finished, WHEEL_NOW);
    expect(finished.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(finished.wheelProgress.wheel).toBeNull();
    expect(finished.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 1,
      upNext: { kind: "round", roundIndex: 4 },
    });
  });

  it("closes a wheel with no slice and carries on", () => {
    const leaderboard = skipRound(wheelStarted(EMPTY_WHEEL_NIGHT), 1);
    expect(leaderboard.cursor).toMatchObject({
      phase: "leaderboard",
      roundIndex: 0,
      upNext: { kind: "wheel", wheelRoundIndex: 1 },
    });
    const result = nextStep(leaderboard, WHEEL_NOW);
    expect(result.ack).toMatchObject({ ok: true });
    expect(result.state.cursor.phase).toBe("podium");
    // One phase move only: no `wheel` phase in between.
    expect(result.state.lastTransition).toEqual({
      fromPhaseId: leaderboard.cursor.phaseId,
      toPhaseId: result.state.cursor.phaseId,
    });
    expect(result.state.phaseCounter).toBe(leaderboard.phaseCounter + 1);
    expect(result.state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
    expect(result.state.wheelProgress.wheel).toBeNull();
  });

  it("opens on a wheel when the quiz starts with one", () => {
    const lobby = wheelLobby(WHEEL_FIRST_NIGHT);
    const opened = structuredClone(lobby);
    openStep(
      opened,
      nextQuizshowStep(opened.quiz.rounds, opened.wheelProgress),
      WHEEL_NOW,
    );
    expect(opened.cursor).toMatchObject({
      phase: "wheel",
      roundIndex: 0,
      questionIndex: null,
      deadline: null,
    });
    expect(opened.wheelProgress.openedWheelRoundIndexes).toEqual([0]);
    expect(openedWheelIn(opened).sliceRoundIndexes).toEqual([1, 2]);
  });
});

const POLL_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-poll",
  type: "poll",
  prompt: bilingual("Which snack wins the night?"),
  options: [
    { id: "a", text: bilingual("Crisps") },
    { id: "b", text: bilingual("Olives") },
  ],
  answer: null,
  acceptedAnswers: [],
};

const CAPTION_QUESTION: QuizshowQuestion = {
  ...QUESTION_SHARED,
  id: "question-caption",
  type: "prompt",
  prompt: bilingual("Caption this"),
  options: [],
  answer: null,
  acceptedAnswers: [],
};

/** Row 0 a warm-up, row 1 a quiz round with a 20 s talk beat (a poll, then a choice), row 2 Caption This. */
const FLOW_QUIZ = quizOf([
  {
    ...roundOf("warm", "quiz", [{ ...CHOICE_QUESTION, id: "question-warm" }]),
    settings: { ...WHEEL_TEST_SETTINGS, isWarmUp: true },
  },
  {
    ...roundOf("talk", "quiz", [POLL_QUESTION, CHOICE_QUESTION]),
    settings: { ...WHEEL_TEST_SETTINGS, talkSeconds: 20 },
  },
  roundOf("caption", "caption_this", [CAPTION_QUESTION]),
]);

/** The flow quiz with no players, its status already running, for the transitions called directly. */
function flowEngine(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  const state = engineWith({ quiz: FLOW_QUIZ, ...overrides });
  setSessionStatus(state, "running");
  return state;
}

function enginePlayer(
  playerId: string,
  score: number,
  overrides: Partial<QuizshowEnginePlayer> = {},
): QuizshowEnginePlayer {
  return {
    playerId,
    memberKey: `member-${playerId}`,
    screenName: playerId,
    teamId: null,
    isAvatarShown: false,
    hasExtraTime: false,
    isCohostPlayer: false,
    score,
    streak: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: 0,
    isRemoved: false,
    leftAt: null,
    disconnectedAt: null,
    ...overrides,
  };
}

describe("demo engine read length, talk beat and away players", () => {
  it("scales the read length with the prompt and clamps it at 3 s and 8 s", () => {
    const {
      readPhaseBaseMs,
      readPhaseMsPerChar,
      readPhaseMinMs,
      readPhaseMaxMs,
    } = QUIZSHOW_LIMITS;
    expect(
      readPhaseMsFor({ prompt: bilingual("Short?"), options: [] }, "en"),
    ).toBe(readPhaseMinMs);
    expect(
      readPhaseMsFor({ prompt: bilingual("x".repeat(100)), options: [] }, "en"),
    ).toBe(readPhaseBaseMs + readPhaseMsPerChar * 100);
    expect(
      readPhaseMsFor({ prompt: bilingual("x".repeat(400)), options: [] }, "en"),
    ).toBe(readPhaseMaxMs);
    const withOptions = {
      prompt: bilingual("x".repeat(80)),
      options: [
        { id: "a", text: bilingual("y".repeat(10)) },
        { id: "b", text: bilingual("z".repeat(10)) },
      ],
    };
    expect(readPhaseMsFor(withOptions, "pt")).toBe(
      readPhaseBaseMs + readPhaseMsPerChar * 100,
    );
    // Both languages on screen: the longer one sets the length.
    const uneven = {
      prompt: { en: "x".repeat(60), pt: "x".repeat(120) },
      options: [],
    };
    expect(readPhaseMsFor(uneven, "en")).toBe(readPhaseMinMs);
    expect(readPhaseMsFor(uneven, "both")).toBe(
      readPhaseBaseMs + readPhaseMsPerChar * 120,
    );
  });

  it("extends read by the talk beat in teams play and leaves the solo read alone", () => {
    const teams = flowEngine({ playMode: "teams" });
    openQuestion(teams, 1, 1, 1_000);
    const readMs = teams.current?.readMs ?? 0;
    expect(readMs).toBe(QUIZSHOW_LIMITS.readPhaseMinMs);
    expect(teams.cursor).toMatchObject({
      phase: "read",
      deadline: 1_000 + readMs + 20_000,
      talkStartsAt: 1_000 + readMs,
    });
    const solo = flowEngine();
    openQuestion(solo, 1, 1, 1_000);
    expect(solo.cursor).toMatchObject({
      phase: "read",
      deadline: 1_000 + readMs,
      talkStartsAt: null,
    });
  });

  it("leaves an away player out at the open and lets them in when they return during the question", () => {
    const state = flowEngine();
    // Away after awayAfterMs (20 s) with no socket: bo left at 0, cy only 5 s before the open.
    state.players.push(
      enginePlayer("ana", 0),
      enginePlayer("bo", 0, { disconnectedAt: 0, hasExtraTime: true }),
      enginePlayer("cy", 0, { disconnectedAt: 25_000 }),
    );
    openQuestion(state, 1, 1, 30_000);
    expect(state.current).toMatchObject({
      eligiblePlayerIds: ["ana", "cy"],
      extraTimePlayerIds: [],
      awayPlayerIds: ["bo"],
    });
    expect(returnAwayPlayer(state, "bo", 31_000)).toEqual([
      { kind: "answer_count_changed" },
    ]);
    expect(state.current).toMatchObject({
      eligiblePlayerIds: ["ana", "cy", "bo"],
      extraTimePlayerIds: ["bo"],
      awayPlayerIds: [],
    });
    expect(returnAwayPlayer(state, "ana", 31_000)).toEqual([]);
  });

  it("starts a rematch with its host-made teams and keeps the practice flag", () => {
    const state = engineWith({
      playMode: "teams",
      isPractice: true,
      initialTeams: [{ name: "Quizzly Bears", colorKey: "circle" }],
    });
    expect(state).toMatchObject({
      isPractice: true,
      isJoinLocked: false,
      isAutoAdvanceOn: false,
      sourceUpdatedAt: DEMO_QUIZ.updatedAt,
      giving: null,
      pairedDevices: [],
    });
    expect(state.teams).toHaveLength(1);
    const rematchTeam = at(state.teams, 0);
    expect(rematchTeam.teamId).toMatch(/^demo-team-\d+$/);
    expect(rematchTeam).toMatchObject({
      name: "Quizzly Bears",
      colorKey: "circle",
      score: 0,
      hasUsedJoker: false,
      jokerRoundIndex: null,
      isHostMade: true,
    });
    expect(state.cursor).toMatchObject({
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
    });
  });
});

describe("demo engine podium steps, auto-advance and skipped scores", () => {
  it("reveals the podium 3rd, 2nd, then 1st, each step on a new phase id", () => {
    const state = flowEngine();
    state.players.push(
      enginePlayer("ana", 300),
      enginePlayer("bo", 200),
      enginePlayer("cy", 100),
      enginePlayer("di", 50),
    );
    showPodium(state, 1_000);
    expect(state.cursor).toMatchObject({
      phase: "podium",
      podiumRevealedCount: 0,
    });
    expect(podiumStepsOf(state)).toEqual([3, 2, 1]);
    const seenPhaseIds = [state.cursor.phaseId];
    for (const expectedCount of [1, 2, 3]) {
      const effects = revealNextPodiumStep(state, 1_000 + expectedCount);
      expect(effects?.map((effect) => effect.kind)).toEqual([
        "phase_changed",
        "podium_shown",
        "scores_shown",
      ]);
      expect(state.cursor).toMatchObject({
        phase: "podium",
        podiumRevealedCount: expectedCount,
      });
      // The final scores frame follows the step, so previousScore stays the podium's.
      expect(state.lastScoresFrame?.phaseId).toBe(state.cursor.phaseId);
      seenPhaseIds.push(state.cursor.phaseId);
    }
    expect(new Set(seenPhaseIds).size).toBe(4);
  });

  it("lets a tie share one podium step", () => {
    const state = flowEngine();
    state.players.push(
      enginePlayer("ana", 300),
      enginePlayer("bo", 200),
      enginePlayer("cy", 200),
      enginePlayer("di", 50),
    );
    showPodium(state, 1_000);
    expect(podiumStepsOf(state)).toEqual([2, 1]);
    expect(
      (state.podium ?? [])
        .filter((entry) => entry.place === 2)
        .map((entry) => entry.name),
    ).toEqual(["bo", "cy"]);
    revealNextPodiumStep(state, 1_001);
    revealNextPodiumStep(state, 1_002);
    expect(state.cursor.podiumRevealedCount).toBe(2);
    // Every step shown, so host:next finishes the night.
    expect(revealNextPodiumStep(state, 1_003)).toBeNull();
    expect(state.cursor.podiumRevealedCount).toBe(2);
  });

  it("caps the shown podium steps when a removal drops a place", () => {
    const state = flowEngine();
    state.players.push(
      enginePlayer("ana", 300),
      enginePlayer("bo", 200),
      enginePlayer("cy", 100),
    );
    showPodium(state, 1_000);
    for (const stepNow of [1_001, 1_002, 1_003])
      revealNextPodiumStep(state, stepNow);
    expect(state.cursor.podiumRevealedCount).toBe(3);
    const cy = state.players.find((player) => player.playerId === "cy");
    if (cy === undefined) throw new Error("cy is not in the session.");
    cy.isRemoved = true;
    expect(refreshPodiumIfShown(state)).toEqual([
      { kind: "phase_changed" },
      { kind: "podium_shown" },
    ]);
    expect(state.cursor.podiumRevealedCount).toBe(2);
    expect(refreshPodiumIfShown(state)).toEqual([{ kind: "podium_shown" }]);
  });

  it("arms auto-advance on a round intro, a quiz reveal and scores, and never on a Caption This reveal", () => {
    const state = flowEngine();
    state.isAutoAdvanceOn = true;
    openRoundIntro(state, 1, 1_000);
    const introDueAt = 1_000 + QUIZSHOW_LIMITS.autoAdvanceRoundIntroMs;
    expect(state.cursor.autoAdvanceAt).toBe(introDueAt);
    expect(isAutoAdvanceDue(state, introDueAt - 1)).toBe(false);
    expect(isAutoAdvanceDue(state, introDueAt)).toBe(true);
    openQuestion(state, 1, 1, 7_000);
    expect(state.cursor.autoAdvanceAt).toBeNull();
    revealQuestion(state, 8_000);
    expect(state.cursor.autoAdvanceAt).toBe(
      8_000 + QUIZSHOW_LIMITS.autoAdvanceRevealMs,
    );
    showScores(state, "scores", "question", 9_000);
    expect(state.cursor.autoAdvanceAt).toBe(
      9_000 + QUIZSHOW_LIMITS.autoAdvanceScoresMs,
    );
    showScores(state, "leaderboard", "round", 10_000);
    expect(state.cursor.autoAdvanceAt).toBeNull();
    openQuestion(state, 2, 0, 11_000);
    expect(state.cursor.phase).toBe("write");
    revealQuestion(state, 12_000);
    expect(state.cursor).toMatchObject({
      phase: "reveal",
      autoAdvanceAt: null,
    });
    expect(isAutoAdvanceDue(state, 99_000)).toBe(false);
    const switchedOff = flowEngine();
    openRoundIntro(switchedOff, 1, 1_000);
    expect(switchedOff.cursor.autoAdvanceAt).toBeNull();
  });

  it("skips scores after a warm-up or a poll question and the leaderboard after the warm-up round", () => {
    const state = flowEngine();
    expect(isWarmUpRound(state, 0)).toBe(true);
    expect(isWarmUpRound(state, 1)).toBe(false);
    openQuestion(state, 0, 0, 1_000);
    expect(skipsScoresAfterReveal(state)).toBe(true);
    expect(skipsLeaderboardAfterRound(state)).toBe(true);
    openQuestion(state, 1, 0, 2_000);
    expect(skipsScoresAfterReveal(state)).toBe(true);
    expect(skipsLeaderboardAfterRound(state)).toBe(false);
    openQuestion(state, 1, 1, 3_000);
    expect(skipsScoresAfterReveal(state)).toBe(false);
  });

  it("keeps the leaderboard after a warm-up stored on a wheel slice", () => {
    // A stored quiz from before validation refused a warm-up inside a wheel range.
    const slicedWarmUpQuiz = quizOf([
      roundOf("spin", "wheel", []),
      {
        ...roundOf("warm", "quiz", [
          { ...CHOICE_QUESTION, id: "question-warm" },
        ]),
        settings: { ...WHEEL_TEST_SETTINGS, isWarmUp: true },
      },
      roundOf("slice", "quiz", [CHOICE_QUESTION]),
    ]);
    const state = engineWith({ quiz: slicedWarmUpQuiz });
    setSessionStatus(state, "running");
    openQuestion(state, 1, 0, 1_000);
    expect(skipsScoresAfterReveal(state)).toBe(true);
    expect(skipsLeaderboardAfterRound(state)).toBe(false);
  });

  it("hides a place the host has not revealed when a leave reorders the podium", () => {
    const state = flowEngine();
    state.players.push(
      enginePlayer("ana", 300),
      enginePlayer("bo", 200),
      enginePlayer("cy", 100),
    );
    showPodium(state, 1_000);
    revealNextPodiumStep(state, 1_001);
    revealNextPodiumStep(state, 1_002);
    expect(state.cursor.podiumRevealedCount).toBe(2);
    // 3rd and 2nd are shown; once cy leaves, bo stays 2nd and the winner is still hidden.
    const cy = state.players.find((player) => player.playerId === "cy");
    if (cy === undefined) throw new Error("cy is not in the session.");
    cy.leftAt = 1_003;
    expect(refreshPodiumIfShown(state)).toEqual([
      { kind: "phase_changed" },
      { kind: "podium_shown" },
    ]);
    expect(podiumStepsOf(state)).toEqual([2, 1]);
    expect(state.cursor.podiumRevealedCount).toBe(1);
    expect(refreshPodiumIfShown(state)).toEqual([{ kind: "podium_shown" }]);
  });

  it("counts no warm-up or poll reveal as scored, so ending after only those abandons", () => {
    const state = flowEngine();
    openQuestion(state, 0, 0, 1_000);
    revealQuestion(state, 2_000);
    expect(state.hasScoredQuestion).toBe(false);
    openQuestion(state, 1, 0, 3_000);
    revealQuestion(state, 4_000);
    expect(state.hasScoredQuestion).toBe(false);
    const ended = endStep(state, 5_000);
    expect(ended.state.cursor).toMatchObject({
      phase: "ended",
      status: "abandoned",
    });
    openQuestion(state, 1, 1, 6_000);
    revealQuestion(state, 7_000);
    expect(state.hasScoredQuestion).toBe(true);
  });
});
