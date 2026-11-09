/**
 * Scripted Pulse Live wheel nights, driven through the public reducer: a
 * pick-a-round night with a bonus, a pick-a-question night in teams, an
 * unplanned spin, finishing a wheel early, a reconnect around a spin, the same
 * seed twice, and the phone wake. Every case reads cursors, the wheel view on
 * the phase change frames, and totals.
 */
import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_ATTACH_ROLES,
  QUIZSHOW_LIMITS,
  type QuizshowCursor,
  type QuizshowLeaderboardEntry,
  type QuizshowLobbyJoinInput,
  type QuizshowPhaseChangeFrame,
  type QuizshowPlayMode,
  type QuizshowPodiumEntry,
  type QuizshowPodiumFrame,
  type QuizshowQuiz,
  type QuizshowScores,
  type QuizshowTeamColorKey,
  type QuizshowUpNext,
  type QuizshowWheelBonusView,
  type QuizshowWheelBonusWinner,
  type QuizshowWheelSpin,
  type QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { drawnWheelSliceRoundIndexes } from "../quizshowWheel";
import type { QuizshowServerFrame } from "../realtime/quizshowFrames";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineState,
  QuizshowEngineStep,
  QuizshowHostFrameName,
} from "./quizshowEngineTypes";
import { engineSessionStateFor, framesForViewer } from "./quizshowEngineViews";
import {
  PICK_QUESTION_NIGHT,
  PICK_ROUND_NIGHT,
  UNPLANNED_NIGHT,
  wheelTestEngineOptions,
  wheelTestQuiz,
  wheelTestRound,
} from "./quizshowWheelTestFixtures";

// ---------------------------------------------------------------------------
// Members and the clock
// ---------------------------------------------------------------------------

interface NightMember {
  memberKey: string;
  screenName: string;
  team: { name: string; colorKey: QuizshowTeamColorKey } | null;
}

const ANA_KEY = "member-ana";
const BRUNO_KEY = "member-bruno";
const CLEO_KEY = "member-cleo";

const SOLO_MEMBERS: NightMember[] = [
  { memberKey: ANA_KEY, screenName: "Ana", team: null },
  { memberKey: BRUNO_KEY, screenName: "Bruno", team: null },
  { memberKey: CLEO_KEY, screenName: "Cleo", team: null },
];

const TEAM_MEMBERS: NightMember[] = [
  {
    memberKey: ANA_KEY,
    screenName: "Ana",
    team: { name: "Circles", colorKey: "circle" },
  },
  {
    memberKey: CLEO_KEY,
    screenName: "Cleo",
    team: { name: "Circles", colorKey: "circle" },
  },
  {
    memberKey: BRUNO_KEY,
    screenName: "Bruno",
    team: { name: "Triangles", colorKey: "triangle" },
  },
];

/** Each command time sits a whole spin (and more) after the one before. */
const NIGHT_STEP_MS = 100_000;
const MAX_RESPINS = 60;
const PICK_ROUND_WHEEL_ROW = 1;

function createNightClock(): () => number {
  let currentTime = 0;
  return () => {
    currentTime += NIGHT_STEP_MS;
    return currentTime;
  };
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Nothing at index ${index}.`);
  return item;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function joinPayloadOf(
  state: QuizshowEngineState,
  member: NightMember,
): QuizshowLobbyJoinInput {
  const base = {
    screenName: member.screenName,
    isAvatarShown: false,
    hasExtraTime: false,
  };
  if (member.team === null) return { ...base, team: null };
  const teamName = member.team.name;
  const existingTeam = state.teams.find((team) => team.name === teamName);
  return {
    ...base,
    team:
      existingTeam === undefined
        ? { newTeam: { name: teamName, colorKey: member.team.colorKey } }
        : { teamId: existingTeam.teamId },
  };
}

/** The lobby of a wheel night with every member joined; seed 7 unless given. */
function joinedNight(
  quiz: QuizshowQuiz,
  playMode: QuizshowPlayMode,
  members: readonly NightMember[],
  seed = 7,
): QuizshowEngineState {
  let state = createQuizshowEngine(
    wheelTestEngineOptions(quiz, {
      playMode,
      maxTeamSize: playMode === "teams" ? 4 : null,
      seed,
    }),
  );
  for (const member of members) {
    const joined = reduceQuizshowEngine(state, {
      type: "player",
      memberKey: member.memberKey,
      name: "lobby:join",
      payload: joinPayloadOf(state, member),
      now: 0,
    });
    expect(joined.ack).toMatchObject({ ok: true });
    state = joined.state;
  }
  return state;
}

/** A host command with the current phase id; the caller reads the ack. */
function hostAttempt(
  state: QuizshowEngineState,
  name: QuizshowHostFrameName,
  now: number,
): QuizshowEngineStep {
  return reduceQuizshowEngine(state, {
    type: "host",
    name,
    payload: { phaseId: state.cursor.phaseId },
    now,
  });
}

/** A host command that must act. */
function hostCommand(
  state: QuizshowEngineState,
  name: QuizshowHostFrameName,
  now: number,
): QuizshowEngineStep {
  const step = hostAttempt(state, name, now);
  expect(step.ack).toMatchObject({ ok: true });
  return step;
}

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

function phaseChangesIn(
  frames: readonly QuizshowServerFrame[],
): QuizshowPhaseChangeFrame[] {
  const phaseChanges: QuizshowPhaseChangeFrame[] = [];
  for (const frame of frames) {
    if (frame.event === "phase:change") phaseChanges.push(frame.payload);
  }
  return phaseChanges;
}

function scoresIn(frames: readonly QuizshowServerFrame[]): QuizshowScores[] {
  const scores: QuizshowScores[] = [];
  for (const frame of frames) {
    if (frame.event === "scores") scores.push(frame.payload);
  }
  return scores;
}

function podiumsIn(
  frames: readonly QuizshowServerFrame[],
): QuizshowPodiumFrame[] {
  const podiums: QuizshowPodiumFrame[] = [];
  for (const frame of frames) {
    if (frame.event === "podium") podiums.push(frame.payload);
  }
  return podiums;
}

function meScoresIn(frames: readonly QuizshowServerFrame[]): number[] {
  const meScores: number[] = [];
  for (const frame of frames) {
    if (frame.event === "me:update") meScores.push(frame.payload.me.score);
  }
  return meScores;
}

function screenFramesOf(step: QuizshowEngineStep): QuizshowServerFrame[] {
  return framesForViewer(step.frames, { role: "screen", playerId: null });
}

function screenPhaseChanges(
  step: QuizshowEngineStep,
): QuizshowPhaseChangeFrame[] {
  return phaseChangesIn(screenFramesOf(step));
}

/** The one `phase:change` a moving step sends the screen. */
function screenPhaseChange(step: QuizshowEngineStep): QuizshowPhaseChangeFrame {
  const phaseChanges = screenPhaseChanges(step);
  if (phaseChanges.length !== 1) {
    throw new Error(
      `Expected one phase:change for the screen, got ${phaseChanges.length}.`,
    );
  }
  return at(phaseChanges, 0);
}

function screenScoresOf(step: QuizshowEngineStep): QuizshowScores {
  const scoresFrames = scoresIn(screenFramesOf(step));
  if (scoresFrames.length !== 1) {
    throw new Error(
      `Expected one scores frame for the screen, got ${scoresFrames.length}.`,
    );
  }
  return at(scoresFrames, 0);
}

function scoreEntryOf(
  step: QuizshowEngineStep,
  entrantName: string,
): QuizshowLeaderboardEntry {
  const entry = screenScoresOf(step).entries.find(
    (candidate) => candidate.name === entrantName,
  );
  if (entry === undefined) {
    throw new Error(`The scores frame has no entry for ${entrantName}.`);
  }
  return entry;
}

function podiumEntryOf(
  step: QuizshowEngineStep,
  entrantName: string,
): QuizshowPodiumEntry {
  const [podium] = podiumsIn(screenFramesOf(step));
  const entry = podium?.entries.find(
    (candidate) => candidate.name === entrantName,
  );
  if (entry === undefined) {
    throw new Error(`The podium frame has no entry for ${entrantName}.`);
  }
  return entry;
}

/** The wheel spins carried by the `session:state` frames among these. */
function sessionStateSpinsIn(
  frames: readonly QuizshowServerFrame[],
): Array<QuizshowWheelSpin | null> {
  const spins: Array<QuizshowWheelSpin | null> = [];
  for (const frame of frames) {
    if (frame.event === "session:state") {
      spins.push(frame.payload.wheel?.spin ?? null);
    }
  }
  return spins;
}

// ---------------------------------------------------------------------------
// Expectations
// ---------------------------------------------------------------------------

interface ExpectedCursor {
  phase: QuizshowCursor["phase"];
  roundIndex: number | null;
  roundNumber: number;
  roundCount: number;
  upNext: QuizshowUpNext | null;
  canSpinForNextRound: boolean;
}

/** The engine cursor and the cursor on the screen's phase change agree with the script. */
function expectCursorOf(
  step: QuizshowEngineStep,
  expected: ExpectedCursor,
): void {
  expect(step.state.cursor).toMatchObject(expected);
  expect(screenPhaseChange(step).cursor).toEqual(step.state.cursor);
}

interface ExpectedWheel {
  wheelRoundIndex: number | null;
  pick: "round" | "question";
  spinNumber: number;
  spinTotal: number;
  drawnRoundIndexes: number[];
  playingRoundIndex: number | null;
  isSpun: boolean;
}

function drawnRoundIndexesOf(view: QuizshowWheelView): number[] {
  return view.slices
    .filter((slice) => !slice.isPlayed)
    .map((slice) => slice.roundIndex);
}

function expectWheelView(
  view: QuizshowWheelView | null,
  expected: ExpectedWheel,
): void {
  if (view === null) {
    throw new Error("Expected a wheel view on this phase change, got none.");
  }
  expect(view).toMatchObject({
    wheelRoundIndex: expected.wheelRoundIndex,
    pick: expected.pick,
    spinNumber: expected.spinNumber,
    spinTotal: expected.spinTotal,
    playingRoundIndex: expected.playingRoundIndex,
  });
  expect(drawnRoundIndexesOf(view)).toEqual(expected.drawnRoundIndexes);
  expect(view.spin !== null).toBe(expected.isSpun);
}

function expectWheelBonus(
  bonus: QuizshowWheelBonusView | null,
  expected: {
    points: number;
    pick: "round" | "question";
    sliceRoundIndex: number;
    sliceTitle: string;
    winners: QuizshowWheelBonusWinner[];
  },
): void {
  expect(bonus).toEqual({
    points: expected.points,
    pick: expected.pick,
    sliceRoundIndex: expected.sliceRoundIndex,
    sliceTitle: { en: expected.sliceTitle, pt: expected.sliceTitle },
    winners: expected.winners,
  });
}

// ---------------------------------------------------------------------------
// Entrants and scores
// ---------------------------------------------------------------------------

function playerNamed(state: QuizshowEngineState, screenName: string) {
  const player = state.players.find(
    (candidate) => candidate.screenName === screenName,
  );
  if (player === undefined) throw new Error(`No player named ${screenName}.`);
  return player;
}

/** A team's score when a team has the name, else the player's own score. */
function entrantScoreOf(state: QuizshowEngineState, entrantName: string) {
  const team = state.teams.find((candidate) => candidate.name === entrantName);
  return team === undefined
    ? playerNamed(state, entrantName).score
    : team.score;
}

function teamNamed(state: QuizshowEngineState, teamName: string) {
  const team = state.teams.find((candidate) => candidate.name === teamName);
  if (team === undefined) throw new Error(`No team named ${teamName}.`);
  return team;
}

function addGain(
  gains: Record<string, number>,
  entrantName: string,
  before: QuizshowEngineState,
  after: QuizshowEngineState,
): void {
  gains[entrantName] =
    (gains[entrantName] ?? 0) +
    entrantScoreOf(after, entrantName) -
    entrantScoreOf(before, entrantName);
}

// ---------------------------------------------------------------------------
// Playing questions and rounds
// ---------------------------------------------------------------------------

type AnswerVerdict = "right" | "wrong";

/** The fixture questions are four-way choices whose correct option is index 1. */
function optionIndexOf(verdict: AnswerVerdict): number {
  return verdict === "right" ? 1 : 0;
}

/** Every member wrong, except the ones named. */
function verdictsWhere(
  members: readonly NightMember[],
  rightMemberKeys: readonly string[],
): Record<string, AnswerVerdict> {
  return Object.fromEntries(
    members.map((member): [string, AnswerVerdict] => [
      member.memberKey,
      rightMemberKeys.includes(member.memberKey) ? "right" : "wrong",
    ]),
  );
}

function submitAnswer(
  state: QuizshowEngineState,
  memberKey: string,
  verdict: AnswerVerdict,
  now: number,
): QuizshowEngineStep {
  const questionId = state.current?.questionId;
  if (questionId === undefined) {
    throw new Error(`${memberKey} answered with no question in play.`);
  }
  const step = reduceQuizshowEngine(state, {
    type: "player",
    memberKey,
    name: "answer:submit",
    payload: {
      phaseId: state.cursor.phaseId,
      questionId,
      payload: {
        type: "multiple_choice",
        optionIndex: optionIndexOf(verdict),
      },
    },
    now,
  });
  expect(step.ack).toMatchObject({ ok: true });
  return step;
}

interface PlayedQuestion {
  /** The step into `scores`. */
  step: QuizshowEngineStep;
  /** The screen's phase changes from `open` through `scores`. */
  phaseChanges: QuizshowPhaseChangeFrame[];
}

/** From a question's `read`: opens it, takes every answer, reveals, and shows the scores. */
function playQuizQuestion(
  state: QuizshowEngineState,
  verdictsByMemberKey: Record<string, AnswerVerdict>,
  now: number,
): PlayedQuestion {
  expect(state.cursor.phase).toBe("read");
  let step = hostCommand(state, "host:next", now);
  const phaseChanges = [...screenPhaseChanges(step)];
  expect(step.state.cursor.phase).toBe("open");
  for (const [memberKey, verdict] of Object.entries(verdictsByMemberKey)) {
    step = submitAnswer(step.state, memberKey, verdict, now);
    phaseChanges.push(...screenPhaseChanges(step));
  }
  expect(step.state.cursor.phase).toBe("reveal");
  step = hostCommand(step.state, "host:next", now);
  phaseChanges.push(...screenPhaseChanges(step));
  expect(step.state.cursor.phase).toBe("scores");
  return { step, phaseChanges };
}

interface PlayedRound {
  /** The step the last `host:next` made: a leaderboard or the podium. */
  step: QuizshowEngineStep;
  /** The state at the last question's `scores`, before any bonus. */
  stateAtLastScores: QuizshowEngineState;
}

/** From a round card: every question of the round, then the `host:next` that ends it. */
function playQuizRound(
  introState: QuizshowEngineState,
  verdictsByMemberKey: Record<string, AnswerVerdict>,
  clock: () => number,
): PlayedRound {
  const { roundIndex } = introState.cursor;
  expect(introState.cursor.phase).toBe("round_intro");
  const questionCount =
    roundIndex === null
      ? 0
      : (introState.quiz.rounds[roundIndex]?.questions.length ?? 0);
  let step = hostCommand(introState, "host:next", clock());
  let stateAtLastScores = introState;
  for (
    let questionIndex = 0;
    questionIndex < questionCount;
    questionIndex += 1
  ) {
    const now = clock();
    const played = playQuizQuestion(step.state, verdictsByMemberKey, now);
    stateAtLastScores = played.step.state;
    step = hostCommand(played.step.state, "host:next", now);
  }
  return { step, stateAtLastScores };
}

// ---------------------------------------------------------------------------
// Spinning
// ---------------------------------------------------------------------------

interface LandedSpin {
  /** The `host:spin` step. */
  step: QuizshowEngineStep;
  state: QuizshowEngineState;
  landedRoundIndex: number;
  landsAt: number;
}

function spinOf(state: QuizshowEngineState): QuizshowWheelSpin {
  const spin = state.wheelProgress.wheel?.spin ?? null;
  if (spin === null) throw new Error("The open wheel has no spin on it.");
  return spin;
}

/** `host:spin`, then where it lands: read from the drawn slices and the spin, never assumed. */
function landSpin(state: QuizshowEngineState, now: number): LandedSpin {
  const step = hostCommand(state, "host:spin", now);
  const wheel = step.state.wheelProgress.wheel;
  if (wheel === null) throw new Error(`host:spin at ${now} opened no wheel.`);
  const spin = spinOf(step.state);
  expect(spin.startedAt).toBe(now);
  expect(spin.durationMs).toBe(QUIZSHOW_LIMITS.wheelSpinMs);
  const drawnRoundIndexes = drawnWheelSliceRoundIndexes(
    step.state.quiz.rounds,
    wheel,
    step.state.wheelProgress,
  );
  const landedRoundIndex = drawnRoundIndexes[spin.landedSliceIndex];
  if (landedRoundIndex === undefined) {
    throw new Error(
      `Slice ${spin.landedSliceIndex} is outside the ${drawnRoundIndexes.length} drawn slices.`,
    );
  }
  return {
    step,
    state: step.state,
    landedRoundIndex,
    landsAt: spin.startedAt + spin.durationMs,
  };
}

/** Spins again after each landing until the wanted row lands. */
function landSpinOn(
  state: QuizshowEngineState,
  targetRoundIndex: number,
  clock: () => number,
): LandedSpin {
  let landed = landSpin(state, clock());
  let spinCount = 1;
  while (landed.landedRoundIndex !== targetRoundIndex) {
    if (spinCount >= MAX_RESPINS) {
      throw new Error(
        `Row ${targetRoundIndex} did not land in ${MAX_RESPINS} spins.`,
      );
    }
    landed = landSpin(landed.state, clock());
    spinCount += 1;
  }
  return landed;
}

interface OpenedWheel {
  /** The step into the first leaderboard. */
  leaderboard: QuizshowEngineStep;
  /** The step into the `wheel` phase, before any spin. */
  wheel: QuizshowEngineStep;
  /** The round card of row 0, for the score ledger. */
  introState: QuizshowEngineState;
  firstRound: PlayedRound;
}

/** Starts the night, plays row 0 and opens the wheel after its leaderboard. */
function openFirstWheel(
  lobby: QuizshowEngineState,
  verdictsByMemberKey: Record<string, AnswerVerdict>,
  clock: () => number,
): OpenedWheel {
  const started = hostCommand(lobby, "host:start", clock());
  const firstRound = playQuizRound(started.state, verdictsByMemberKey, clock);
  const wheel = hostCommand(firstRound.step.state, "host:next", clock());
  return {
    leaderboard: firstRound.step,
    wheel,
    introState: started.state,
    firstRound,
  };
}

interface SliceTurn {
  landed: LandedSpin;
  /** The step into the landed round's card. */
  intro: QuizshowEngineStep;
  played: PlayedRound;
}

/** Lands on the wanted row, starts it with `host:next` at the landing, and plays the round. */
function turnOnSlice(
  wheelState: QuizshowEngineState,
  targetRoundIndex: number,
  verdictsByMemberKey: Record<string, AnswerVerdict>,
  clock: () => number,
): SliceTurn {
  const landed = landSpinOn(wheelState, targetRoundIndex, clock);
  const intro = hostCommand(landed.state, "host:next", landed.landsAt);
  const played = playQuizRound(intro.state, verdictsByMemberKey, clock);
  return { landed, intro, played };
}

// ---------------------------------------------------------------------------
// Night 1: pick a round, with a bonus, solo
// ---------------------------------------------------------------------------

/** Row 3 (no bonus), then row 2 (+500), then row 4 (no bonus). */
const PICK_ROUND_LANDING_ORDER = [3, 2, 4];
const PICK_ROUND_SLICES = [2, 3, 4];

function expectPickRoundWheelPhase(
  wheelStep: QuizshowEngineStep,
  turnIndex: number,
): void {
  expectCursorOf(wheelStep, {
    phase: "wheel",
    roundIndex: PICK_ROUND_WHEEL_ROW,
    roundNumber: 1 + turnIndex,
    roundCount: 5,
    upNext: null,
    canSpinForNextRound: false,
  });
  expectWheelView(screenPhaseChange(wheelStep).wheel, {
    wheelRoundIndex: PICK_ROUND_WHEEL_ROW,
    pick: "round",
    spinNumber: turnIndex + 1,
    spinTotal: 3,
    drawnRoundIndexes: PICK_ROUND_SLICES.filter(
      (sliceRoundIndex) =>
        !PICK_ROUND_LANDING_ORDER.slice(0, turnIndex).includes(sliceRoundIndex),
    ),
    playingRoundIndex: null,
    isSpun: false,
  });
  expect(screenPhaseChange(wheelStep).wheelBonus).toBeNull();
}

/** The leaderboard after a slice: its cursor, and the +500 for Ana only on row 2. */
function expectPickRoundLeaderboard(
  turn: SliceTurn,
  targetRoundIndex: number,
  turnIndex: number,
): void {
  const leaderboard = turn.played.step;
  const isLastTurn = turnIndex === PICK_ROUND_LANDING_ORDER.length - 1;
  expectCursorOf(leaderboard, {
    phase: "leaderboard",
    roundIndex: targetRoundIndex,
    roundNumber: turnIndex + 2,
    roundCount: 5,
    upNext: isLastTurn
      ? { kind: "round", roundIndex: 5 }
      : { kind: "wheel", wheelRoundIndex: PICK_ROUND_WHEEL_ROW },
    canSpinForNextRound: false,
  });
  const phaseChange = screenPhaseChange(leaderboard);
  expect(phaseChange.wheel).toBeNull();
  const scoresBefore = turn.played.stateAtLastScores;
  const scoresAfter = leaderboard.state;
  if (targetRoundIndex !== 2) {
    expect(phaseChange.wheelBonus).toBeNull();
    for (const member of SOLO_MEMBERS) {
      expect(entrantScoreOf(scoresAfter, member.screenName)).toBe(
        entrantScoreOf(scoresBefore, member.screenName),
      );
    }
    return;
  }
  expectWheelBonus(phaseChange.wheelBonus, {
    points: 500,
    pick: "round",
    sliceRoundIndex: 2,
    sliceTitle: "Music",
    winners: [
      {
        entrantId: playerNamed(scoresAfter, "Ana").playerId,
        kind: "player",
        name: "Ana",
        colorKey: null,
      },
    ],
  });
  expect(entrantScoreOf(scoresAfter, "Ana")).toBe(
    entrantScoreOf(scoresBefore, "Ana") + 500,
  );
  expect(entrantScoreOf(scoresAfter, "Bruno")).toBe(
    entrantScoreOf(scoresBefore, "Bruno"),
  );
  expect(entrantScoreOf(scoresAfter, "Cleo")).toBe(
    entrantScoreOf(scoresBefore, "Cleo"),
  );
  // The hosts get the new lobby scores and Ana her own score (contract A14).
  expect(scoreEntryOf(leaderboard, "Ana").score).toBe(
    entrantScoreOf(scoresAfter, "Ana"),
  );
  expect(
    framesForViewer(leaderboard.frames, { role: "host", playerId: null }).some(
      (frame) => frame.event === "lobby:update",
    ),
  ).toBe(true);
  const anaFrames = framesForViewer(leaderboard.frames, {
    role: "player",
    playerId: playerNamed(scoresAfter, "Ana").playerId,
  });
  expect(meScoresIn(anaFrames)).toContain(entrantScoreOf(scoresAfter, "Ana"));
}

describe("scripted wheel nights", () => {
  it("pick-a-round night with a bonus, solo", () => {
    const clock = createNightClock();
    const lobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS);
    expect(lobby.cursor).toMatchObject({
      phase: "lobby",
      roundIndex: null,
      roundNumber: 0,
      roundCount: 5,
      upNext: { kind: "round", roundIndex: 0 },
      canSpinForNextRound: false,
    });
    const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
    const gains: Record<string, number> = {};

    const opening = openFirstWheel(lobby, anaOnly, clock);
    addGain(
      gains,
      "Ana",
      opening.introState,
      opening.firstRound.stateAtLastScores,
    );
    expectCursorOf(opening.leaderboard, {
      phase: "leaderboard",
      roundIndex: 0,
      roundNumber: 1,
      roundCount: 5,
      upNext: { kind: "wheel", wheelRoundIndex: PICK_ROUND_WHEEL_ROW },
      canSpinForNextRound: false,
    });
    expect(screenPhaseChange(opening.leaderboard).wheel).toBeNull();

    let wheelStep = opening.wheel;
    for (const [
      turnIndex,
      targetRoundIndex,
    ] of PICK_ROUND_LANDING_ORDER.entries()) {
      expectPickRoundWheelPhase(wheelStep, turnIndex);
      const turn = turnOnSlice(
        wheelStep.state,
        targetRoundIndex,
        anaOnly,
        clock,
      );
      // The spun wheel keeps its spin number and drawn set.
      expectWheelView(screenPhaseChange(turn.landed.step).wheel, {
        wheelRoundIndex: PICK_ROUND_WHEEL_ROW,
        pick: "round",
        spinNumber: turnIndex + 1,
        spinTotal: 3,
        drawnRoundIndexes: PICK_ROUND_SLICES.filter(
          (sliceRoundIndex) =>
            !PICK_ROUND_LANDING_ORDER.slice(0, turnIndex).includes(
              sliceRoundIndex,
            ),
        ),
        playingRoundIndex: null,
        isSpun: true,
      });
      expectCursorOf(turn.intro, {
        phase: "round_intro",
        roundIndex: targetRoundIndex,
        roundNumber: turnIndex + 2,
        roundCount: 5,
        upNext: null,
        canSpinForNextRound: false,
      });
      expect(screenPhaseChange(turn.intro).wheel).toBeNull();
      addGain(gains, "Ana", turn.intro.state, turn.played.stateAtLastScores);
      expectPickRoundLeaderboard(turn, targetRoundIndex, turnIndex);
      wheelStep = hostCommand(turn.played.step.state, "host:next", clock());
      // The phase after the leaderboard carries no bonus.
      expect(screenPhaseChange(wheelStep).wheelBonus).toBeNull();
    }

    // The wheel is exhausted: the next step is the finale, round 5 of 5.
    expect(wheelStep.state.wheelProgress.wheel).toBeNull();
    expect(wheelStep.state.wheelProgress.closedWheelRoundIndexes).toEqual([
      PICK_ROUND_WHEEL_ROW,
    ]);
    expectCursorOf(wheelStep, {
      phase: "round_intro",
      roundIndex: 5,
      roundNumber: 5,
      roundCount: 5,
      upNext: null,
      canSpinForNextRound: false,
    });
    const finale = playQuizRound(wheelStep.state, anaOnly, clock);
    addGain(gains, "Ana", wheelStep.state, finale.stateAtLastScores);
    expectCursorOf(finale.step, {
      phase: "podium",
      roundIndex: null,
      roundNumber: 5,
      roundCount: 5,
      upNext: null,
      canSpinForNextRound: false,
    });
    const anaPodium = podiumEntryOf(finale.step, "Ana");
    expect(anaPodium.place).toBe(1);
    expect(anaPodium.score).toBe((gains["Ana"] ?? 0) + 500);
    expect(anaPodium.score).toBe(entrantScoreOf(finale.step.state, "Ana"));
  });

  // -------------------------------------------------------------------------
  // Night 2: pick a question, in teams
  // -------------------------------------------------------------------------

  it("pick-a-question night in teams", () => {
    runPickQuestionTeamsNight();
  });

  it("unplanned spin resumes the running order", () => {
    runUnplannedNight();
  });

  it("finish the wheel early, both picks", () => {
    finishPickRoundWheelEarly();
    finishPickQuestionWheelEarly();
  });

  it("a reconnect during and after a spin", () => {
    runReconnectNight();
  });

  it("the same seed lands the same slices twice", () => {
    const firstRun = spinSequenceOf(7);
    const secondRun = spinSequenceOf(7);
    expect(secondRun).toEqual(firstRun);
    expect(firstRun).toHaveLength(3);
    expect(
      firstRun
        .map((spin) => spin.landedRoundIndex)
        .sort((first, second) => first - second),
    ).toEqual(PICK_ROUND_SLICES);
    expect(firstRun.map((spin) => spin.startAngle)).toEqual([0, 0, 0]);
  });

  it("phone wake and announce", () => {
    runPhoneWakeNight();
  });

  it("skipping a wheel question in read or open pays no bonus", () => {
    runSkippedWheelQuestionsNight();
  });

  it("skipping a wheel question at reveal pays the bonus it earned", () => {
    runSkippedAtRevealNight();
  });

  it("finishing an unplanned wheel leaves the closed wheels alone", () => {
    runFinishUnplannedNight();
  });

  it("host:spin is refused where no wheel can spin", () => {
    runSpinRefusalsNight();
  });
});

// ---------------------------------------------------------------------------
// Night 2 body
// ---------------------------------------------------------------------------

const TEAM_ROUND_COUNT = 3;
const TEAM_NAMES = ["Circles", "Triangles"] as const;
const TEAM_WHEEL_ROW = 1;

function addTeamGains(
  gains: Record<string, number>,
  before: QuizshowEngineState,
  after: QuizshowEngineState,
): void {
  for (const teamName of TEAM_NAMES) addGain(gains, teamName, before, after);
}

function teamWheel(
  spinNumber: number,
  drawnRoundIndexes: number[],
  playingRoundIndex: number | null,
): ExpectedWheel {
  return {
    wheelRoundIndex: TEAM_WHEEL_ROW,
    pick: "question",
    spinNumber,
    spinTotal: 3,
    drawnRoundIndexes,
    playingRoundIndex,
    isSpun: false,
  };
}

function expectQuestionPhaseWheel(
  phaseChanges: readonly QuizshowPhaseChangeFrame[],
  expected: ExpectedWheel,
  rowIndex: number,
  questionIndex: number,
): void {
  expect(phaseChanges.map((phaseChange) => phaseChange.cursor.phase)).toEqual([
    "open",
    "reveal",
    "scores",
  ]);
  for (const phaseChange of phaseChanges) {
    expect(phaseChange.cursor).toMatchObject({
      roundIndex: rowIndex,
      questionIndex,
      roundNumber: 2,
      roundCount: TEAM_ROUND_COUNT,
    });
    expectWheelView(phaseChange.wheel, expected);
    expect(phaseChange.wheelBonus).toBeNull();
  }
}

/** The previous score on a scores frame is the total the entrant held when the question opened. */
function expectPreviousScores(
  scoresStep: QuizshowEngineStep,
  totalsBefore: Record<string, number>,
): void {
  for (const [entrantName, total] of Object.entries(totalsBefore)) {
    expect(scoreEntryOf(scoresStep, entrantName).previousScore).toBe(total);
  }
}

function teamTotalsOf(state: QuizshowEngineState): Record<string, number> {
  return {
    Circles: teamNamed(state, "Circles").score,
    Triangles: teamNamed(state, "Triangles").score,
  };
}

function expectTeamBonus(
  wheelStep: QuizshowEngineStep,
  scoresState: QuizshowEngineState,
  winnerTeamName: "Circles" | "Triangles",
): void {
  const winner = teamNamed(wheelStep.state, winnerTeamName);
  const loserName = winnerTeamName === "Circles" ? "Triangles" : "Circles";
  expectWheelBonus(screenPhaseChange(wheelStep).wheelBonus, {
    points: 500,
    pick: "question",
    sliceRoundIndex: 2,
    sliceTitle: "Music",
    winners: [
      {
        entrantId: winner.teamId,
        kind: "team",
        name: winnerTeamName,
        colorKey: winner.colorKey,
      },
    ],
  });
  expect(entrantScoreOf(wheelStep.state, winnerTeamName)).toBe(
    entrantScoreOf(scoresState, winnerTeamName) + 500,
  );
  expect(entrantScoreOf(wheelStep.state, loserName)).toBe(
    entrantScoreOf(scoresState, loserName),
  );
  // Members keep their own scores; the bonus sits on the team.
  for (const member of TEAM_MEMBERS) {
    expect(entrantScoreOf(wheelStep.state, member.screenName)).toBe(
      entrantScoreOf(scoresState, member.screenName),
    );
  }
  const hostFrames = framesForViewer(wheelStep.frames, {
    role: "host",
    playerId: null,
  });
  expect(hostFrames.some((frame) => frame.event === "lobby:update")).toBe(true);
  expect(
    wheelStep.frames.some(({ frame }) => frame.event === "me:update"),
  ).toBe(false);
}

interface AskedQuestion {
  read: QuizshowEngineStep;
  question: PlayedQuestion;
  /** The `host:next` after the scores: the wheel again, or the leaderboard. */
  after: QuizshowEngineStep;
}

/** Lands on a category, plays its next question with the given right answers, and presses on. */
function askWheelQuestion(
  wheelState: QuizshowEngineState,
  categoryRoundIndex: number,
  questionIndex: number,
  rightMemberKeys: readonly string[],
  clock: () => number,
  gains: Record<string, number>,
): AskedQuestion {
  const landing = landSpinOn(wheelState, categoryRoundIndex, clock);
  const read = hostCommand(landing.state, "host:next", landing.landsAt);
  expect(read.state.cursor).toMatchObject({
    phase: "read",
    roundIndex: categoryRoundIndex,
    questionIndex,
    roundNumber: 2,
    roundCount: TEAM_ROUND_COUNT,
  });
  const question = playQuizQuestion(
    read.state,
    verdictsWhere(TEAM_MEMBERS, rightMemberKeys),
    clock(),
  );
  addTeamGains(gains, read.state, question.step.state);
  const after = hostCommand(question.step.state, "host:next", clock());
  return { read, question, after };
}

function expectTeamsOpening(opening: OpenedWheel): void {
  expectCursorOf(opening.leaderboard, {
    phase: "leaderboard",
    roundIndex: 0,
    roundNumber: 1,
    roundCount: TEAM_ROUND_COUNT,
    upNext: { kind: "wheel", wheelRoundIndex: TEAM_WHEEL_ROW },
    canSpinForNextRound: false,
  });
  // The whole wheel counts as round 2 of 3 from the moment it opens.
  expectCursorOf(opening.wheel, {
    phase: "wheel",
    roundIndex: TEAM_WHEEL_ROW,
    roundNumber: 2,
    roundCount: TEAM_ROUND_COUNT,
    upNext: null,
    canSpinForNextRound: false,
  });
  expectWheelView(
    screenPhaseChange(opening.wheel).wheel,
    teamWheel(1, [2, 3], null),
  );
}

function expectWheelPhaseAfterQuestion(
  after: QuizshowEngineStep,
  expectedWheel: ExpectedWheel,
): void {
  expectCursorOf(after, {
    phase: "wheel",
    roundIndex: TEAM_WHEEL_ROW,
    roundNumber: 2,
    roundCount: TEAM_ROUND_COUNT,
    upNext: null,
    canSpinForNextRound: false,
  });
  expectWheelView(screenPhaseChange(after).wheel, expectedWheel);
}

/** The leaderboard after the last category question names the wheel row. */
function expectTeamsWheelLeaderboard(leaderboard: QuizshowEngineStep): void {
  expectCursorOf(leaderboard, {
    phase: "leaderboard",
    roundIndex: TEAM_WHEEL_ROW,
    roundNumber: 2,
    roundCount: TEAM_ROUND_COUNT,
    upNext: { kind: "round", roundIndex: 4 },
    canSpinForNextRound: false,
  });
  const phaseChange = screenPhaseChange(leaderboard);
  expect(phaseChange.round).toMatchObject({
    roundIndex: TEAM_WHEEL_ROW,
    kind: "wheel",
  });
  expect(phaseChange.wheel).toBeNull();
  expect(phaseChange.wheelBonus).toBeNull();
  expect(leaderboard.state.wheelProgress.wheel).toBeNull();
  expect(leaderboard.state.wheelProgress.closedWheelRoundIndexes).toEqual([
    TEAM_WHEEL_ROW,
  ]);
}

/** Round 3 of 3, then the podium with each team's bonus in its total. */
function playTeamsFinale(
  leaderboard: QuizshowEngineStep,
  clock: () => number,
  gains: Record<string, number>,
): void {
  const finaleIntro = hostCommand(leaderboard.state, "host:next", clock());
  expectCursorOf(finaleIntro, {
    phase: "round_intro",
    roundIndex: 4,
    roundNumber: 3,
    roundCount: TEAM_ROUND_COUNT,
    upNext: null,
    canSpinForNextRound: false,
  });
  const finale = playQuizRound(
    finaleIntro.state,
    verdictsWhere(TEAM_MEMBERS, [BRUNO_KEY]),
    clock,
  );
  addTeamGains(gains, finaleIntro.state, finale.stateAtLastScores);
  expectCursorOf(finale.step, {
    phase: "podium",
    roundIndex: null,
    roundNumber: 3,
    roundCount: TEAM_ROUND_COUNT,
    upNext: null,
    canSpinForNextRound: false,
  });
  for (const teamName of TEAM_NAMES) {
    expect(podiumEntryOf(finale.step, teamName)).toMatchObject({
      kind: "team",
      score: (gains[teamName] ?? 0) + 500,
    });
  }
}

function runPickQuestionTeamsNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_QUESTION_NIGHT, "teams", TEAM_MEMBERS);
  expect(lobby.cursor).toMatchObject({
    phase: "lobby",
    roundNumber: 0,
    roundCount: TEAM_ROUND_COUNT,
    upNext: { kind: "round", roundIndex: 0 },
  });
  const gains: Record<string, number> = {};
  const opening = openFirstWheel(
    lobby,
    verdictsWhere(TEAM_MEMBERS, [ANA_KEY]),
    clock,
  );
  addTeamGains(gains, opening.introState, opening.firstRound.stateAtLastScores);
  expectTeamsOpening(opening);

  // Question 1: Music, Ana's team wins the bonus.
  const first = askWheelQuestion(
    opening.wheel.state,
    2,
    0,
    [ANA_KEY],
    clock,
    gains,
  );
  expectWheelView(screenPhaseChange(first.read).wheel, teamWheel(1, [2, 3], 2));
  expectQuestionPhaseWheel(
    first.question.phaseChanges,
    teamWheel(1, [2, 3], 2),
    2,
    0,
  );
  expectWheelPhaseAfterQuestion(first.after, teamWheel(2, [2, 3], null));
  expectTeamBonus(first.after, first.question.step.state, "Circles");

  // Question 2: Music again, Bruno's team wins; its scores count from the totals with the bonus (ruling R16).
  const second = askWheelQuestion(
    first.after.state,
    2,
    1,
    [BRUNO_KEY],
    clock,
    gains,
  );
  expectQuestionPhaseWheel(
    second.question.phaseChanges,
    teamWheel(2, [3], 2),
    2,
    1,
  );
  expectPreviousScores(second.question.step, teamTotalsOf(first.after.state));
  expectWheelPhaseAfterQuestion(second.after, teamWheel(3, [3], null));
  expectTeamBonus(second.after, second.question.step.state, "Triangles");

  // Question 3: the last category has no bonus; the wheel closes on a leaderboard that names row 1.
  const third = askWheelQuestion(
    second.after.state,
    3,
    0,
    [CLEO_KEY],
    clock,
    gains,
  );
  expectPreviousScores(third.question.step, teamTotalsOf(second.after.state));
  expectTeamsWheelLeaderboard(third.after);
  playTeamsFinale(third.after, clock, gains);
}

// ---------------------------------------------------------------------------
// Night 3: an unplanned spin
// ---------------------------------------------------------------------------

function runUnplannedNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(UNPLANNED_NIGHT, "solo", SOLO_MEMBERS);
  expect(lobby.cursor).toMatchObject({
    phase: "lobby",
    roundNumber: 0,
    roundCount: 4,
    upNext: { kind: "round", roundIndex: 0 },
  });
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
  const introRowIndexes: number[] = [];
  const started = hostCommand(lobby, "host:start", clock());
  introRowIndexes.push(started.state.cursor.roundIndex ?? -1);
  expectCursorOf(started, {
    phase: "round_intro",
    roundIndex: 0,
    roundNumber: 1,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  const firstRound = playQuizRound(started.state, anaOnly, clock);
  expectCursorOf(firstRound.step, {
    phase: "leaderboard",
    roundIndex: 0,
    roundNumber: 1,
    roundCount: 4,
    upNext: { kind: "round", roundIndex: 1 },
    canSpinForNextRound: true,
  });

  // First spin, from the leaderboard: the last row lands, so it plays before rows 1 and 2.
  const firstLanding = landSpinOn(firstRound.step.state, 3, clock);
  expectCursorOf(firstLanding.step, {
    phase: "wheel",
    roundIndex: null,
    roundNumber: 1,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  const firstView = screenPhaseChange(firstLanding.step).wheel;
  expectWheelView(firstView, {
    wheelRoundIndex: null,
    pick: "round",
    spinNumber: 1,
    spinTotal: 3,
    drawnRoundIndexes: [1, 2, 3],
    playingRoundIndex: null,
    isSpun: true,
  });
  expect(firstView?.slices.map((slice) => slice.wheelBonus)).toEqual([0, 0, 0]);
  const secondIntro = hostCommand(
    firstLanding.state,
    "host:next",
    firstLanding.landsAt,
  );
  introRowIndexes.push(secondIntro.state.cursor.roundIndex ?? -1);
  expectCursorOf(secondIntro, {
    phase: "round_intro",
    roundIndex: 3,
    roundNumber: 2,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  expect(screenPhaseChange(secondIntro).wheel).toBeNull();
  expect(secondIntro.state.wheelProgress.wheel).toBeNull();
  const secondRound = playQuizRound(secondIntro.state, anaOnly, clock);

  // Afterwards the running order resumes at the first unplayed row.
  expectCursorOf(secondRound.step, {
    phase: "leaderboard",
    roundIndex: 3,
    roundNumber: 2,
    roundCount: 4,
    upNext: { kind: "round", roundIndex: 1 },
    canSpinForNextRound: true,
  });

  // Second spin: whatever lands plays next, the other row waits.
  const secondLanding = landSpin(secondRound.step.state, clock());
  expectWheelView(screenPhaseChange(secondLanding.step).wheel, {
    wheelRoundIndex: null,
    pick: "round",
    spinNumber: 1,
    spinTotal: 2,
    drawnRoundIndexes: [1, 2],
    playingRoundIndex: null,
    isSpun: true,
  });
  const thirdIntro = hostCommand(
    secondLanding.state,
    "host:next",
    secondLanding.landsAt,
  );
  introRowIndexes.push(thirdIntro.state.cursor.roundIndex ?? -1);
  expectCursorOf(thirdIntro, {
    phase: "round_intro",
    roundIndex: secondLanding.landedRoundIndex,
    roundNumber: 3,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  const thirdRound = playQuizRound(thirdIntro.state, anaOnly, clock);
  const lastRowIndex = secondLanding.landedRoundIndex === 1 ? 2 : 1;
  expectCursorOf(thirdRound.step, {
    phase: "leaderboard",
    roundIndex: secondLanding.landedRoundIndex,
    roundNumber: 3,
    roundCount: 4,
    upNext: { kind: "round", roundIndex: lastRowIndex },
    canSpinForNextRound: false,
  });
  // One row is left, so the remote cannot spin.
  const refusedSpin = hostAttempt(thirdRound.step.state, "host:spin", clock());
  expect(refusedSpin.ack).toMatchObject({
    ok: false,
    code: "quizshow_wheel_spin_too_few_rounds",
  });

  const lastIntro = hostCommand(thirdRound.step.state, "host:next", clock());
  introRowIndexes.push(lastIntro.state.cursor.roundIndex ?? -1);
  expectCursorOf(lastIntro, {
    phase: "round_intro",
    roundIndex: lastRowIndex,
    roundNumber: 4,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  const lastRound = playQuizRound(lastIntro.state, anaOnly, clock);
  expectCursorOf(lastRound.step, {
    phase: "podium",
    roundIndex: null,
    roundNumber: 4,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  // Every round played once, in the order the spins and the running order gave.
  expect(introRowIndexes).toEqual([
    0,
    3,
    secondLanding.landedRoundIndex,
    lastRowIndex,
  ]);
  expect(
    [...lastRound.step.state.wheelProgress.playedRoundIndexes].sort(
      (first, second) => first - second,
    ),
  ).toEqual([0, 1, 2, 3]);
}

// ---------------------------------------------------------------------------
// Night 4: finishing a wheel early
// ---------------------------------------------------------------------------

function finishPickRoundWheelEarly(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS);
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
  const introRowIndexes = [0];
  const opening = openFirstWheel(lobby, anaOnly, clock);
  expectCursorOf(opening.wheel, {
    phase: "wheel",
    roundIndex: 1,
    roundNumber: 1,
    roundCount: 5,
    upNext: null,
    canSpinForNextRound: false,
  });

  // One slice plays, then the host ends the wheel with a second spin in the air.
  const turn = turnOnSlice(opening.wheel.state, 4, anaOnly, clock);
  introRowIndexes.push(turn.landed.landedRoundIndex);
  const backAtWheel = hostCommand(turn.played.step.state, "host:next", clock());
  expectCursorOf(backAtWheel, {
    phase: "wheel",
    roundIndex: 1,
    roundNumber: 2,
    roundCount: 5,
    upNext: null,
    canSpinForNextRound: false,
  });
  const spinAt = clock();
  const spun = hostCommand(backAtWheel.state, "host:spin", spinAt);
  const finished = hostCommand(
    spun.state,
    "host:finishWheel",
    spinAt + QUIZSHOW_LIMITS.wheelSpinMs / 5,
  );
  introRowIndexes.push(finished.state.cursor.roundIndex ?? -1);

  // Rows 2 and 3 never play; M shrinks to 3 (contract 3.5): row 0, the one slice, the finale.
  expectCursorOf(finished, {
    phase: "round_intro",
    roundIndex: 5,
    roundNumber: 3,
    roundCount: 3,
    upNext: null,
    canSpinForNextRound: false,
  });
  expect(screenPhaseChange(finished).wheel).toBeNull();
  expect(finished.state.wheelProgress.wheel).toBeNull();
  expect(finished.state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
  expect(finished.state.wheelProgress.playedRoundIndexes).toEqual([0, 4, 5]);
  const finale = playQuizRound(finished.state, anaOnly, clock);
  expectCursorOf(finale.step, {
    phase: "podium",
    roundIndex: null,
    roundNumber: 3,
    roundCount: 3,
    upNext: null,
    canSpinForNextRound: false,
  });
  expect(introRowIndexes).toEqual([0, 4, 5]);
  expect(finale.step.state.wheelProgress.playedRoundIndexes).toEqual([0, 4, 5]);
}

function finishPickQuestionWheelEarly(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_QUESTION_NIGHT, "solo", SOLO_MEMBERS);
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);

  // Finished before any question: straight to the finale, still round 3 of 3.
  const untouched = openFirstWheel(lobby, anaOnly, clock);
  const skipped = hostCommand(
    untouched.wheel.state,
    "host:finishWheel",
    clock(),
  );
  expectCursorOf(skipped, {
    phase: "round_intro",
    roundIndex: 4,
    roundNumber: 3,
    roundCount: 3,
    upNext: null,
    canSpinForNextRound: false,
  });
  expect(skipped.state.wheelProgress.closedWheelRoundIndexes).toEqual([1]);
  expect(skipped.state.wheelProgress.wheel).toBeNull();

  // Finished after one question: a leaderboard naming the wheel row, then the finale.
  const nightClock = createNightClock();
  const played = openFirstWheel(lobby, anaOnly, nightClock);
  const landing = landSpinOn(played.wheel.state, 3, nightClock);
  const read = hostCommand(landing.state, "host:next", landing.landsAt);
  expect(read.state.cursor).toMatchObject({
    phase: "read",
    roundIndex: 3,
    questionIndex: 0,
  });
  const question = playQuizQuestion(read.state, anaOnly, nightClock());
  const backAtWheel = hostCommand(
    question.step.state,
    "host:next",
    nightClock(),
  );
  expectCursorOf(backAtWheel, {
    phase: "wheel",
    roundIndex: 1,
    roundNumber: 2,
    roundCount: 3,
    upNext: null,
    canSpinForNextRound: false,
  });
  expectWheelView(screenPhaseChange(backAtWheel).wheel, {
    wheelRoundIndex: 1,
    pick: "question",
    spinNumber: 2,
    spinTotal: 3,
    drawnRoundIndexes: [2],
    playingRoundIndex: null,
    isSpun: false,
  });
  const finished = hostCommand(
    backAtWheel.state,
    "host:finishWheel",
    nightClock(),
  );
  expectCursorOf(finished, {
    phase: "leaderboard",
    roundIndex: 1,
    roundNumber: 2,
    roundCount: 3,
    upNext: { kind: "round", roundIndex: 4 },
    canSpinForNextRound: false,
  });
  expect(screenPhaseChange(finished).round).toMatchObject({
    roundIndex: 1,
    kind: "wheel",
  });
  expect(finished.state.wheelProgress.wheel).toBeNull();
  const finaleIntro = hostCommand(finished.state, "host:next", nightClock());
  expectCursorOf(finaleIntro, {
    phase: "round_intro",
    roundIndex: 4,
    roundNumber: 3,
    roundCount: 3,
    upNext: null,
    canSpinForNextRound: false,
  });
  const finale = playQuizRound(finaleIntro.state, anaOnly, nightClock);
  expect(finale.step.state.cursor.phase).toBe("podium");
  // The two unplayed questions of row 2 were never asked.
  expect(finale.step.state.wheelProgress.playedRoundIndexes).toEqual([0, 4]);
}

// ---------------------------------------------------------------------------
// Night 5: a reconnect during and after a spin
// ---------------------------------------------------------------------------

function runReconnectNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS);
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
  const opening = openFirstWheel(lobby, anaOnly, clock);

  // Before any spin the host cannot move on.
  const notSpun = hostAttempt(opening.wheel.state, "host:next", clock());
  expect(notSpun.ack).toMatchObject({
    ok: false,
    code: "quizshow_wheel_not_spun",
  });

  const spinAt = clock();
  const landed = landSpin(opening.wheel.state, spinAt);
  const { landsAt } = landed;
  expect(landsAt).toBe(spinAt + QUIZSHOW_LIMITS.wheelSpinMs);
  const spun = spinOf(landed.state);
  expect(spun.startAngle).toBe(0);

  // The host cannot move on until the wheel lands, within the tolerance.
  const tolerance = QUIZSHOW_LIMITS.wheelLandingToleranceMs;
  for (const refusedAt of [landsAt - 1000, landsAt - tolerance - 1]) {
    expect(hostAttempt(landed.state, "host:next", refusedAt).ack).toMatchObject(
      {
        ok: false,
        code: "quizshow_wheel_spinning",
      },
    );
  }
  expect(
    hostAttempt(landed.state, "host:next", landsAt - tolerance).ack,
  ).toMatchObject({ ok: true });

  // A phone reconnecting a second before the stop, and another a second after.
  const ana = playerNamed(landed.state, "Ana");
  const viewer = {
    role: "player" as const,
    memberKey: ana.memberKey,
    suggestedScreenName: "Ana",
  };
  const beforeStop = reduceQuizshowEngine(landed.state, {
    type: "tick",
    now: landsAt - 1000,
  });
  const duringState = engineSessionStateFor(beforeStop.state, viewer);
  const afterStop = reduceQuizshowEngine(beforeStop.state, {
    type: "tick",
    now: landsAt + 1000,
  });
  const afterState = engineSessionStateFor(afterStop.state, viewer);
  for (const sessionState of [duringState, afterState]) {
    expect(sessionState.cursor.phaseId).toBe(landed.state.cursor.phaseId);
    expect(sessionState.wheel?.spin).toEqual(spun);
    expect(sessionState.wheel?.spin).toMatchObject({
      startedAt: spinAt,
      landedSliceIndex: spun.landedSliceIndex,
      startAngle: 0,
    });
  }
  expect(afterState.wheel).toEqual(duringState.wheel);
  for (const role of ["screen", "host"] as const) {
    expect(
      engineSessionStateFor(afterStop.state, { role }).wheel?.spin,
    ).toEqual(spun);
  }
  // A phone that rejoins with lobby:join gets a session:state whose spin is the original one.
  for (const rejoinAt of [landsAt - 1000, landsAt + 1000]) {
    const rejoined = reduceQuizshowEngine(afterStop.state, {
      type: "player",
      memberKey: ana.memberKey,
      name: "lobby:join",
      payload: {
        screenName: "Ana",
        isAvatarShown: false,
        hasExtraTime: false,
        team: null,
      },
      now: rejoinAt,
    });
    expect(rejoined.ack).toMatchObject({ ok: true });
    const rejoinedFrames = framesForViewer(rejoined.frames, {
      role: "player",
      playerId: ana.playerId,
    });
    expect(sessionStateSpinsIn(rejoinedFrames)).toEqual([spun]);
    expect(rejoined.state.cursor.phaseId).toBe(landed.state.cursor.phaseId);
  }

  // Once landed, the next press starts the round and the wheel leaves the state.
  const intro = hostCommand(afterStop.state, "host:next", landsAt + 1000);
  expect(intro.state.cursor).toMatchObject({
    phase: "round_intro",
    roundIndex: landed.landedRoundIndex,
  });
  expect(engineSessionStateFor(intro.state, viewer).wheel).toBeNull();
}

// ---------------------------------------------------------------------------
// Night 6: the same seed twice
// ---------------------------------------------------------------------------

interface SpinRecord {
  landedSliceIndex: number;
  landedRoundIndex: number;
  startedAt: number;
  turns: number;
  jitterSeed: number;
  startAngle: number;
}

/** The three spins of the pick-a-round night, each landing used as it comes. */
function spinSequenceOf(seed: number): SpinRecord[] {
  const clock = createNightClock();
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
  const lobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS, seed);
  let wheelStep = openFirstWheel(lobby, anaOnly, clock).wheel;
  const spins: SpinRecord[] = [];
  for (
    let turnIndex = 0;
    turnIndex < PICK_ROUND_SLICES.length;
    turnIndex += 1
  ) {
    const landed = landSpin(wheelStep.state, clock());
    const spin = spinOf(landed.state);
    spins.push({
      landedSliceIndex: spin.landedSliceIndex,
      landedRoundIndex: landed.landedRoundIndex,
      startedAt: spin.startedAt,
      turns: spin.turns,
      jitterSeed: spin.jitterSeed,
      startAngle: spin.startAngle,
    });
    const intro = hostCommand(landed.state, "host:next", landed.landsAt);
    const played = playQuizRound(intro.state, anaOnly, clock);
    wheelStep = hostCommand(played.step.state, "host:next", clock());
  }
  return spins;
}

// ---------------------------------------------------------------------------
// Night 7: phone wake and announce
// ---------------------------------------------------------------------------

function expectWheelPhaseForEveryRole(
  step: QuizshowEngineStep,
  playerId: string,
  isSpun: boolean,
): void {
  for (const role of QUIZSHOW_ATTACH_ROLES) {
    const frames = framesForViewer(step.frames, {
      role,
      playerId: role === "player" ? playerId : null,
    });
    const phaseChanges = phaseChangesIn(frames);
    expect(phaseChanges).toHaveLength(1);
    const phaseChange = at(phaseChanges, 0);
    expect(phaseChange.cursor.phase).toBe("wheel");
    expect(phaseChange.wheel).not.toBeNull();
    expect(phaseChange.wheel?.spin !== null).toBe(isSpun);
  }
}

function runPhoneWakeNight(): void {
  const clock = createNightClock();
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);

  // A planned wheel: when it opens, and when it spins.
  const plannedLobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS);
  const anaId = playerNamed(plannedLobby, "Ana").playerId;
  const opening = openFirstWheel(plannedLobby, anaOnly, clock);
  expectWheelPhaseForEveryRole(opening.wheel, anaId, false);
  const landed = landSpin(opening.wheel.state, clock());
  expectWheelPhaseForEveryRole(landed.step, anaId, true);
  // A phone that wakes on the landed spin reads the same wheel from its state.
  const woken = engineSessionStateFor(landed.state, {
    role: "player",
    memberKey: ANA_KEY,
    suggestedScreenName: "Ana",
  });
  expect(woken.wheel?.spin).toEqual(spinOf(landed.state));

  // An unplanned spin, from a leaderboard.
  const unplannedLobby = joinedNight(UNPLANNED_NIGHT, "solo", SOLO_MEMBERS);
  const started = hostCommand(unplannedLobby, "host:start", clock());
  const firstRound = playQuizRound(started.state, anaOnly, clock);
  const unplanned = landSpin(firstRound.step.state, clock());
  expectWheelPhaseForEveryRole(unplanned.step, anaId, true);
}

// ---------------------------------------------------------------------------
// Night 8: host:skip on a wheel question
// ---------------------------------------------------------------------------

/** Every team and every player, by name, with its current total. */
function allTotalsOf(state: QuizshowEngineState): Record<string, number> {
  return Object.fromEntries(
    [...TEAM_NAMES, ...TEAM_MEMBERS.map((member) => member.screenName)].map(
      (entrantName): [string, number] => [
        entrantName,
        entrantScoreOf(state, entrantName),
      ],
    ),
  );
}

function expectBackAtWheelWithoutBonus(
  skipped: QuizshowEngineStep,
  totalsBefore: Record<string, number>,
  spinNumber: number,
  drawnRoundIndexes: number[],
): void {
  expectWheelPhaseAfterQuestion(
    skipped,
    teamWheel(spinNumber, drawnRoundIndexes, null),
  );
  expect(screenPhaseChange(skipped).wheelBonus).toBeNull();
  expect(allTotalsOf(skipped.state)).toEqual(totalsBefore);
}

function runSkippedWheelQuestionsNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_QUESTION_NIGHT, "teams", TEAM_MEMBERS);
  const opening = openFirstWheel(
    lobby,
    verdictsWhere(TEAM_MEMBERS, [ANA_KEY]),
    clock,
  );

  // Skipped in read: the Music question never opened, so nobody scored on it.
  const firstLanding = landSpinOn(opening.wheel.state, 2, clock);
  const read = hostCommand(
    firstLanding.state,
    "host:next",
    firstLanding.landsAt,
  );
  expect(read.state.cursor.phase).toBe("read");
  const totalsAtRead = allTotalsOf(read.state);
  const skippedInRead = hostCommand(read.state, "host:skip", clock());
  expectBackAtWheelWithoutBonus(skippedInRead, totalsAtRead, 2, [2, 3]);

  // Skipped in open, after Ana already answered right: no points are scored until the reveal.
  const secondLanding = landSpinOn(skippedInRead.state, 2, clock);
  const secondRead = hostCommand(
    secondLanding.state,
    "host:next",
    secondLanding.landsAt,
  );
  expect(secondRead.state.cursor).toMatchObject({
    phase: "read",
    roundIndex: 2,
    questionIndex: 1,
  });
  const now = clock();
  let open = hostCommand(secondRead.state, "host:next", now);
  expect(open.state.cursor.phase).toBe("open");
  open = submitAnswer(open.state, ANA_KEY, "right", now);
  expect(open.state.cursor.phase).toBe("open");
  const totalsAtOpen = allTotalsOf(open.state);
  const skippedInOpen = hostCommand(open.state, "host:skip", now);
  expectBackAtWheelWithoutBonus(skippedInOpen, totalsAtOpen, 3, [3]);
}

/** Ruling R21: the reveal comes after scoring, so skipping there still pays the bonus. */
function runSkippedAtRevealNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(PICK_QUESTION_NIGHT, "teams", TEAM_MEMBERS);
  const opening = openFirstWheel(
    lobby,
    verdictsWhere(TEAM_MEMBERS, [ANA_KEY]),
    clock,
  );
  const landing = landSpinOn(opening.wheel.state, 2, clock);
  const read = hostCommand(landing.state, "host:next", landing.landsAt);
  const now = clock();
  let step = hostCommand(read.state, "host:next", now);
  for (const [memberKey, verdict] of Object.entries(
    verdictsWhere(TEAM_MEMBERS, [ANA_KEY]),
  )) {
    step = submitAnswer(step.state, memberKey, verdict, now);
  }
  expect(step.state.cursor.phase).toBe("reveal");
  const skipped = hostCommand(step.state, "host:skip", now);
  expectWheelPhaseAfterQuestion(skipped, teamWheel(2, [2, 3], null));
  expectTeamBonus(skipped, step.state, "Circles");
}

// ---------------------------------------------------------------------------
// Night 9: finishing an unplanned wheel
// ---------------------------------------------------------------------------

function runFinishUnplannedNight(): void {
  const clock = createNightClock();
  const lobby = joinedNight(UNPLANNED_NIGHT, "solo", SOLO_MEMBERS);
  const anaOnly = verdictsWhere(SOLO_MEMBERS, [ANA_KEY]);
  const started = hostCommand(lobby, "host:start", clock());
  const firstRound = playQuizRound(started.state, anaOnly, clock);
  expect(firstRound.step.state.cursor).toMatchObject({
    phase: "leaderboard",
    upNext: { kind: "round", roundIndex: 1 },
    canSpinForNextRound: true,
  });

  const spinAt = clock();
  const spun = hostCommand(firstRound.step.state, "host:spin", spinAt);
  expect(spun.state.cursor).toMatchObject({ phase: "wheel", roundIndex: null });
  expect(spun.state.wheelProgress.wheel).not.toBeNull();
  const finished = hostCommand(spun.state, "host:finishWheel", spinAt + 1000);

  // No planned wheel closed, and the night resumes at the round upNext named.
  expect(finished.state.wheelProgress.closedWheelRoundIndexes).toEqual([]);
  expect(finished.state.wheelProgress.wheel).toBeNull();
  expectCursorOf(finished, {
    phase: "round_intro",
    roundIndex: 1,
    roundNumber: 2,
    roundCount: 4,
    upNext: null,
    canSpinForNextRound: false,
  });
  expect(screenPhaseChange(finished).wheel).toBeNull();
  expect(finished.state.wheelProgress.playedRoundIndexes).toEqual([0, 1]);
}

// ---------------------------------------------------------------------------
// Night 10: host:spin refusals
// ---------------------------------------------------------------------------

function expectSpinRefused(
  state: QuizshowEngineState,
  code: string,
  now: number,
): void {
  const attempt = hostAttempt(state, "host:spin", now);
  expect(attempt.ack).toMatchObject({ ok: false, code });
  expect(attempt.state.cursor).toEqual(state.cursor);
  expect(attempt.state.wheelProgress).toEqual(state.wheelProgress);
}

function runSpinRefusalsNight(): void {
  const clock = createNightClock();
  const soloQuiz = wheelTestQuiz([wheelTestRound("only", "Only round", 1)]);
  const lobby = joinedNight(soloQuiz, "solo", SOLO_MEMBERS);
  const notAllowed = "quizshow_command_not_allowed";

  // Every phase of a plain night without a wheel.
  expectSpinRefused(lobby, notAllowed, clock());
  const introStep = hostCommand(lobby, "host:start", clock());
  expectSpinRefused(introStep.state, notAllowed, clock());
  const readStep = hostCommand(introStep.state, "host:next", clock());
  expect(readStep.state.cursor.phase).toBe("read");
  expectSpinRefused(readStep.state, notAllowed, clock());
  const now = clock();
  let step = hostCommand(readStep.state, "host:next", now);
  expect(step.state.cursor.phase).toBe("open");
  expectSpinRefused(step.state, notAllowed, now);
  for (const member of SOLO_MEMBERS) {
    step = submitAnswer(step.state, member.memberKey, "right", now);
  }
  expect(step.state.cursor.phase).toBe("reveal");
  expectSpinRefused(step.state, notAllowed, now);
  step = hostCommand(step.state, "host:next", now);
  expect(step.state.cursor.phase).toBe("scores");
  expectSpinRefused(step.state, notAllowed, now);
  step = hostCommand(step.state, "host:next", now);
  expect(step.state.cursor.phase).toBe("podium");
  expectSpinRefused(step.state, notAllowed, clock());

  // A leaderboard with a wheel next.
  const wheelLobby = joinedNight(PICK_ROUND_NIGHT, "solo", SOLO_MEMBERS);
  const opening = openFirstWheel(
    wheelLobby,
    verdictsWhere(SOLO_MEMBERS, [ANA_KEY]),
    clock,
  );
  expectSpinRefused(
    opening.leaderboard.state,
    "quizshow_wheel_already_next",
    clock(),
  );

  // A spin still turning.
  const spinAt = clock();
  const spun = hostCommand(opening.wheel.state, "host:spin", spinAt);
  expectSpinRefused(spun.state, "quizshow_wheel_spinning", spinAt + 1000);

  // The phase id from before the spin: the double tap is a no-op, the spin is not redrawn.
  const doubleTap = reduceQuizshowEngine(spun.state, {
    type: "host",
    name: "host:spin",
    payload: { phaseId: opening.wheel.state.cursor.phaseId },
    now: spinAt + 2000,
  });
  expect(doubleTap.ack).toMatchObject({ ok: true, isNoop: true });
  expect(doubleTap.frames).toEqual([]);
  expect(spinOf(doubleTap.state)).toEqual(spinOf(spun.state));

  // A phase id from two phases back is stale.
  const stale = reduceQuizshowEngine(spun.state, {
    type: "host",
    name: "host:spin",
    payload: { phaseId: opening.leaderboard.state.cursor.phaseId },
    now: spinAt + 2000,
  });
  expect(stale.ack).toMatchObject({ ok: false, code: "quizshow_stale_phase" });
  expect(spinOf(stale.state)).toEqual(spinOf(spun.state));
}
