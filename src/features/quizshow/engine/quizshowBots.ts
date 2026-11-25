import {
  QUIZSHOW_CLOSEST_TOLERANCE_DEFAULT,
  QUIZSHOW_LIMITS,
  QUIZSHOW_REACTION_IDS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowAnswerPayload,
  type QuizshowClosestTolerance,
  type QuizshowLobbyJoinInput,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
} from "../../../shared/contracts/quizshow";
import { foldNameKey, suggestedScreenNameFor } from "../quizshowNormalise";
import { isReactionPhase } from "../stage/quizshowReactionRules";
import { isActivePlayer } from "./quizshowEngineSetup";
import type {
  QuizshowEngineAction,
  QuizshowEnginePlayer,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import { quizshowRandomFrom } from "./quizshowRandom";
import { closestBandWidth } from "./quizshowScoring";
import {
  QUIZSHOW_SIMULATED_PLAYERS,
  QUIZSHOW_SIMULATED_TEAMS,
  QUIZSHOW_SIMULATED_TEXTS,
  type QuizshowSimulatedPlayer,
} from "./quizshowSimulatedPlayers.data";

export interface QuizshowBotState {
  randomState: number;
  plannedPhaseId: string | null;
  /** The phase start the plans were timed against; a resume moves it forward. */
  plannedPhaseStartedAt: number | null;
  plans: Array<{ dueAt: number; action: QuizshowEngineAction }>;
  lobbyStartedAt: number;
  /** How many teams the bots spread over in teams play. */
  teamCount: number;
  /** Each bot's reaction timing by member key: the last one sent and the next one due (null outside reaction phases). */
  reactionsByMemberKey: Record<
    string,
    { lastSentAt: number | null; nextAt: number | null }
  >;
  /** A separate seeded stream for reactions, so time in the lobby never changes how bots answer, vote or play jokers. */
  reactionRandomState: number;
  /** Bots whose join was sent and did not land (a refusal); later bots join past them. */
  attemptedJoinMemberKeys: string[];
}

export interface QuizshowBotOptions {
  /** Teams the bots spread over in teams play; default the four simulated teams. */
  teamCount?: number;
}

type BotRandom = ReturnType<typeof quizshowRandomFrom>;
type BotPlan = QuizshowBotState["plans"][number];

interface ActiveBot {
  simulated: QuizshowSimulatedPlayer;
  simulatedIndex: number;
  enginePlayer: QuizshowEnginePlayer;
}

const JOIN_GAP_MS = 700;
/** Mixed into the seed for the reaction stream (MurmurHash2's multiplier). */
const REACTION_SEED_MIX = 0x5bd1e995;
const EARLIEST_ANSWER_MS = 1_200;
const LATEST_ANSWER_SHARE = 0.95;
/** A closest guess lands within this many band widths of the truth, so a band shows both outcomes. */
const CLOSEST_SPREAD_BAND_WIDTHS = 3;
/** With no band (exact, or a percent of 0), guesses spread over this share of the truth. */
const CLOSEST_SPREAD_TRUTH_SHARE = 0.05;
const CLOSEST_SPREAD_MIN = 5;
/**
 * Phases bots react in (contract 10 row 46): the shared reaction phases minus
 * the round intro and the wheel, so the bots stay quiet while a round is
 * introduced or the wheel turns.
 */
const BOT_QUIET_REACTION_PHASES: readonly QuizshowPhase[] = [
  "round_intro",
  "wheel",
];

function isBotReactionPhase(phase: QuizshowPhase): boolean {
  return isReactionPhase(phase) && !BOT_QUIET_REACTION_PHASES.includes(phase);
}
/** At most one reaction per bot in this window. */
const BOT_REACTION_GAP_MS = 3_000;
const BOT_REACTION_FIRST_DELAY_MS = 1_000;
const BOT_REACTION_FIRST_SPREAD_MS = 4_000;
const BOT_REACTION_NEXT_SPREAD_MS = 9_000;

export function createBotState(
  seed: number,
  now: number,
  options: QuizshowBotOptions = {},
): QuizshowBotState {
  const teamCountMax = Math.min(
    QUIZSHOW_SIMULATED_PLAYERS.length,
    QUIZSHOW_LIMITS.teamsPerSessionMax,
  );
  return {
    randomState: seed >>> 0,
    plannedPhaseId: null,
    plannedPhaseStartedAt: null,
    plans: [],
    lobbyStartedAt: now,
    teamCount: Math.min(
      Math.max(
        Math.round(options.teamCount ?? QUIZSHOW_SIMULATED_TEAMS.length),
        1,
      ),
      teamCountMax,
    ),
    reactionsByMemberKey: {},
    reactionRandomState: (seed ^ REACTION_SEED_MIX) >>> 0,
    attemptedJoinMemberKeys: [],
  };
}

export function planBotActions(
  botState: QuizshowBotState,
  engine: QuizshowEngineState,
  now: number,
): { botState: QuizshowBotState; actions: QuizshowEngineAction[] } {
  const random = quizshowRandomFrom(botState.randomState);
  const actions: QuizshowEngineAction[] = [];
  const joinAction = planNextJoin(botState, engine, now);
  if (joinAction) actions.push(joinAction);
  const attemptedJoinMemberKeys =
    joinAction?.type === "player"
      ? [...botState.attemptedJoinMemberKeys, joinAction.memberKey]
      : botState.attemptedJoinMemberKeys;
  const reactions = planReactions(botState, engine, now);
  actions.push(...reactions.actions);

  let plans = botState.plans;
  let plannedPhaseId = botState.plannedPhaseId;
  let plannedPhaseStartedAt = botState.plannedPhaseStartedAt;
  if (engine.cursor.phaseId !== plannedPhaseId) {
    plans = planPhase(engine, random, now);
    plannedPhaseId = engine.cursor.phaseId;
    plannedPhaseStartedAt = engine.cursor.phaseStartedAt;
  } else if (
    plannedPhaseStartedAt !== null &&
    engine.cursor.phaseStartedAt !== null &&
    engine.cursor.phaseStartedAt !== plannedPhaseStartedAt
  ) {
    const shiftMs = engine.cursor.phaseStartedAt - plannedPhaseStartedAt;
    plans = plans.map((plan) => ({
      dueAt: plan.dueAt + shiftMs,
      action:
        plan.action.type === "tick"
          ? plan.action
          : { ...plan.action, now: plan.action.now + shiftMs },
    }));
    plannedPhaseStartedAt = engine.cursor.phaseStartedAt;
  }
  if (engine.pausedAt === null) {
    const duePlans = plans.filter((plan) => plan.dueAt <= now);
    plans = plans.filter((plan) => plan.dueAt > now);
    for (const plan of duePlans) actions.push(plan.action);
  }
  return {
    botState: {
      ...botState,
      randomState: random.state(),
      plannedPhaseId,
      plannedPhaseStartedAt,
      plans,
      reactionsByMemberKey: reactions.reactionsByMemberKey,
      reactionRandomState: reactions.reactionRandomState,
      attemptedJoinMemberKeys,
    },
    actions,
  };
}

function planNextJoin(
  botState: QuizshowBotState,
  engine: QuizshowEngineState,
  now: number,
): QuizshowEngineAction | null {
  if (engine.cursor.phase !== "lobby" || engine.isJoinLocked) return null;
  const joinedKeys = new Set(engine.players.map((player) => player.memberKey));
  const attemptedKeys = new Set(botState.attemptedJoinMemberKeys);
  // A bot with no free name, or whose join was refused, is passed over.
  for (const [nextIndex, next] of QUIZSHOW_SIMULATED_PLAYERS.entries()) {
    if (joinedKeys.has(next.memberKey) || attemptedKeys.has(next.memberKey)) {
      continue;
    }
    if (now < botState.lobbyStartedAt + JOIN_GAP_MS * (nextIndex + 1)) {
      return null;
    }
    const screenName = freeScreenNameFor(engine, next.screenName);
    if (screenName === null) continue;
    return joinActionFor(engine, botState, next, nextIndex, screenName, now);
  }
  return null;
}

function joinActionFor(
  engine: QuizshowEngineState,
  botState: QuizshowBotState,
  next: QuizshowSimulatedPlayer,
  nextIndex: number,
  screenName: string,
  now: number,
): QuizshowEngineAction {
  return {
    type: "player",
    memberKey: next.memberKey,
    name: "lobby:join",
    payload: {
      screenName,
      isAvatarShown: false,
      hasExtraTime: next.hasExtraTime,
      team:
        engine.playMode === "teams"
          ? teamChoiceFor(engine, next, nextIndex, botState.teamCount)
          : null,
      /** Simulated players confirm 18+ content, so they join an 18+ game too. */
      hasAcceptedAdultContent: true,
    },
    now,
  };
}

/**
 * The bot's own name when no other player of the session (active or left)
 * holds its key (contract 6.13), else the first free numbered one; null when
 * none is free.
 */
function freeScreenNameFor(
  engine: QuizshowEngineState,
  screenName: string,
): string | null {
  const takenNames = engine.players
    .filter((player) => !player.isRemoved)
    .map((player) => player.screenName);
  const nameKey = foldNameKey(screenName);
  const isTaken = takenNames.some((name) => foldNameKey(name) === nameKey);
  return isTaken ? suggestedScreenNameFor(screenName, takenNames) : screenName;
}

/** The simulated team for a slot: the four templates, then each again with a number ("Spill the Tea 2"). */
function slotTeamName(slot: number): string {
  const templateCount = QUIZSHOW_SIMULATED_TEAMS.length;
  const templateName =
    QUIZSHOW_SIMULATED_TEAMS[slot % templateCount]?.name ?? "";
  const repeatIndex = Math.floor(slot / templateCount);
  return repeatIndex === 0
    ? templateName
    : `${templateName} ${repeatIndex + 1}`;
}

/**
 * Spreads the bots over `teamCount` teams: a bot joins its slot's team when
 * one holds that name (by `foldNameKey`), else an empty host-made team, else
 * founds it with the template's colour when free or the first free of the 24
 * keys, tier 1 first. With every key or the team limit used, it joins an
 * existing team.
 */
function teamChoiceFor(
  engine: QuizshowEngineState,
  simulated: QuizshowSimulatedPlayer,
  simulatedIndex: number,
  teamCount: number,
): QuizshowLobbyJoinInput["team"] {
  const slot =
    teamCount === QUIZSHOW_SIMULATED_TEAMS.length
      ? simulated.teamIndex
      : simulatedIndex % teamCount;
  const name = slotTeamName(slot);
  const nameKey = foldNameKey(name);
  const existing = engine.teams.find(
    (team) => foldNameKey(team.name) === nameKey,
  );
  if (existing) return { teamId: existing.teamId };
  // A table a host made and nobody sits at yet fills before bots found their own.
  const emptyHostTeam = engine.teams.find(
    (team) =>
      team.isHostMade &&
      !engine.players.some(
        (player) => player.teamId === team.teamId && isActivePlayer(player),
      ),
  );
  if (emptyHostTeam) return { teamId: emptyHostTeam.teamId };
  const usedColorKeys = new Set(engine.teams.map((team) => team.colorKey));
  const templateColorKey = QUIZSHOW_SIMULATED_TEAMS[slot]?.colorKey;
  const colorKey =
    templateColorKey !== undefined && !usedColorKeys.has(templateColorKey)
      ? templateColorKey
      : QUIZSHOW_TEAM_COLOR_KEYS.find((key) => !usedColorKeys.has(key));
  const isTeamLimitReached =
    engine.teams.length >= QUIZSHOW_LIMITS.teamsPerSessionMax;
  if (colorKey === undefined || isTeamLimitReached) {
    const fallback = engine.teams[slot % Math.max(engine.teams.length, 1)];
    return fallback ? { teamId: fallback.teamId } : null;
  }
  return { newTeam: { name, colorKey } };
}

function activeBots(engine: QuizshowEngineState): ActiveBot[] {
  const bots: ActiveBot[] = [];
  QUIZSHOW_SIMULATED_PLAYERS.forEach((simulated, simulatedIndex) => {
    const enginePlayer = engine.players.find(
      (player) =>
        player.memberKey === simulated.memberKey && isActivePlayer(player),
    );
    if (enginePlayer) bots.push({ simulated, simulatedIndex, enginePlayer });
  });
  return bots;
}

/**
 * Bots react in the lobby and around the scores (contract 10 row 46), each at
 * most once per `BOT_REACTION_GAP_MS`. Outside those phases, after the end
 * and while paused, nothing is sent; a bot's next reaction is planned again
 * on the way back in.
 */
function planReactions(
  botState: QuizshowBotState,
  engine: QuizshowEngineState,
  now: number,
): {
  reactionsByMemberKey: QuizshowBotState["reactionsByMemberKey"];
  reactionRandomState: number;
  actions: QuizshowEngineAction[];
} {
  const random = quizshowRandomFrom(botState.reactionRandomState);
  const reactionsByMemberKey = { ...botState.reactionsByMemberKey };
  const actions: QuizshowEngineAction[] = [];
  const { phase, status } = engine.cursor;
  const isReactionTime =
    (status === "lobby" || status === "running") && isBotReactionPhase(phase);
  if (engine.pausedAt !== null) {
    return {
      reactionsByMemberKey,
      reactionRandomState: random.state(),
      actions,
    };
  }
  for (const { simulated } of activeBots(engine)) {
    const timing = reactionsByMemberKey[simulated.memberKey] ?? {
      lastSentAt: null,
      nextAt: null,
    };
    if (!isReactionTime) {
      reactionsByMemberKey[simulated.memberKey] = { ...timing, nextAt: null };
      continue;
    }
    const earliestAt =
      timing.lastSentAt === null
        ? Number.NEGATIVE_INFINITY
        : timing.lastSentAt + BOT_REACTION_GAP_MS;
    if (timing.nextAt === null) {
      const firstAt = Math.round(
        now +
          BOT_REACTION_FIRST_DELAY_MS +
          random.next() * BOT_REACTION_FIRST_SPREAD_MS,
      );
      reactionsByMemberKey[simulated.memberKey] = {
        ...timing,
        nextAt: Math.max(firstAt, earliestAt),
      };
      continue;
    }
    if (now < timing.nextAt || now < earliestAt) continue;
    const reactionId = pickFrom(QUIZSHOW_REACTION_IDS, random) ?? "heart";
    actions.push({
      type: "player",
      memberKey: simulated.memberKey,
      name: "reaction:send",
      payload: { reactionId },
      now,
    });
    reactionsByMemberKey[simulated.memberKey] = {
      lastSentAt: now,
      nextAt: Math.round(
        now + BOT_REACTION_GAP_MS + random.next() * BOT_REACTION_NEXT_SPREAD_MS,
      ),
    };
  }
  return { reactionsByMemberKey, reactionRandomState: random.state(), actions };
}

function planPhase(
  engine: QuizshowEngineState,
  random: BotRandom,
  now: number,
): BotPlan[] {
  const { phase } = engine.cursor;
  if (phase === "round_intro") return planJokers(engine, random, now);
  if (!engine.current) return [];
  if (phase === "open" || phase === "write") {
    return planAnswers(engine, random, now);
  }
  if (phase === "vote") return planVotes(engine, random, now);
  return [];
}

function currentRound(engine: QuizshowEngineState): QuizshowRound | null {
  const roundIndex = engine.current?.roundIndex ?? engine.cursor.roundIndex;
  if (roundIndex === null || roundIndex === undefined) return null;
  return engine.quiz.rounds[roundIndex] ?? null;
}

function planJokers(
  engine: QuizshowEngineState,
  random: BotRandom,
  now: number,
): BotPlan[] {
  const roundIndex = engine.cursor.roundIndex;
  const round = currentRound(engine);
  if (roundIndex === null || !round || !round.settings.isJokerAllowed) {
    return [];
  }
  const roundsLeft = Math.max(
    engine.cursor.roundCount - engine.cursor.roundNumber,
    1,
  );
  const phaseStartedAt = engine.cursor.phaseStartedAt ?? now;
  const plans: BotPlan[] = [];
  for (const bot of activeBots(engine)) {
    if (!bot.simulated.willPlayJoker) continue;
    const team = engine.teams.find(
      (candidate) => candidate.teamId === bot.enginePlayer.teamId,
    );
    const hasUsedJoker = team
      ? team.hasUsedJoker
      : bot.enginePlayer.hasUsedJoker;
    const wantsNow = random.next() < 1 / roundsLeft;
    const jitter = random.next();
    if (hasUsedJoker || !wantsNow) continue;
    plans.push({
      dueAt: Math.round(phaseStartedAt + 800 + jitter * 1_500),
      action: {
        type: "player",
        memberKey: bot.simulated.memberKey,
        name: "joker:play",
        payload: { roundIndex },
        now: Math.round(phaseStartedAt + 800 + jitter * 1_500),
      },
    });
  }
  return plans;
}

function limitMsFor(
  round: QuizshowRound,
  question: QuizshowQuestion,
  phase: string,
): number {
  if (phase === "write") return round.settings.writeSeconds * 1_000;
  if (phase === "vote") return round.settings.voteSeconds * 1_000;
  return (question.timeLimitSeconds ?? round.settings.timeLimitSeconds) * 1_000;
}

function dueAtFor(
  random: BotRandom,
  phaseStartedAt: number,
  limitMs: number,
  speed: number,
): number {
  const earliest = phaseStartedAt + EARLIEST_ANSWER_MS;
  const latest = Math.max(
    phaseStartedAt + LATEST_ANSWER_SHARE * limitMs,
    earliest,
  );
  const span =
    (LATEST_ANSWER_SHARE * limitMs - EARLIEST_ANSWER_MS) * (1.3 - speed);
  const raw = Math.round(earliest + random.next() * Math.max(span, 0));
  return Math.min(Math.max(raw, earliest), Math.floor(latest));
}

function planAnswers(
  engine: QuizshowEngineState,
  random: BotRandom,
  now: number,
): BotPlan[] {
  const { current, cursor } = engine;
  const round = currentRound(engine);
  const question = round?.questions[current?.questionIndex ?? -1];
  if (!current || !round || !question) return [];
  const phaseStartedAt = cursor.phaseStartedAt ?? now;
  const limitMs = limitMsFor(round, question, cursor.phase);
  const plans: BotPlan[] = [];
  for (const bot of activeBots(engine)) {
    const { enginePlayer, simulated, simulatedIndex } = bot;
    if (!current.eligiblePlayerIds.includes(enginePlayer.playerId)) continue;
    if (
      current.answers.some(
        (answer) => answer.playerId === enginePlayer.playerId,
      )
    ) {
      continue;
    }
    const payload =
      question.type === "prompt"
        ? partyAnswerPayload(round, simulatedIndex, current.questionIndex)
        : quizAnswerPayload(
            question,
            engine.quiz,
            engine.shuffledOrderOptions[question.id]?.map(
              (option) => option.id,
            ),
            simulated.skill,
            random,
          );
    const dueAt = dueAtFor(random, phaseStartedAt, limitMs, simulated.speed);
    if (!payload) continue;
    plans.push({
      dueAt,
      action: {
        type: "player",
        memberKey: simulated.memberKey,
        name: "answer:submit",
        payload: {
          phaseId: cursor.phaseId,
          questionId: question.id,
          payload,
        },
        now: dueAt,
      },
    });
  }
  return plans;
}

function partyAnswerPayload(
  round: QuizshowRound,
  simulatedIndex: number,
  questionIndex: number,
): QuizshowAnswerPayload | null {
  const lines =
    round.kind === "lie_detector"
      ? QUIZSHOW_SIMULATED_TEXTS.lieDetectorFakes
      : round.kind === "caption_this"
        ? QUIZSHOW_SIMULATED_TEXTS.captions
        : QUIZSHOW_SIMULATED_TEXTS.dragNames;
  const text = lines[(simulatedIndex + questionIndex) % lines.length];
  return text ? { type: "prompt", text } : null;
}

function pickFrom<Item>(
  items: readonly Item[],
  random: BotRandom,
): Item | null {
  return items[Math.floor(random.next() * items.length)] ?? null;
}

function quizAnswerPayload(
  question: QuizshowQuestion,
  quiz: QuizshowQuiz,
  shownOptionIds: string[] | undefined,
  skill: number,
  random: BotRandom,
): QuizshowAnswerPayload | null {
  const rollIsRight = () => random.next() < skill;
  switch (question.type) {
    case "multiple_choice": {
      const correctIndexes = question.answer?.correctIndexes.length
        ? question.answer.correctIndexes
        : [0];
      const rightIndex = pickFrom(correctIndexes, random) ?? 0;
      const wrongIndexes = question.options
        .map((_option, optionIndex) => optionIndex)
        .filter((optionIndex) => !correctIndexes.includes(optionIndex));
      if (rollIsRight() || wrongIndexes.length === 0) {
        return { type: "multiple_choice", optionIndex: rightIndex };
      }
      return {
        type: "multiple_choice",
        optionIndex: pickFrom(wrongIndexes, random) ?? rightIndex,
      };
    }
    case "poll": {
      if (question.options.length === 0) return null;
      return {
        type: "poll",
        optionIndex: random.integerBelow(question.options.length),
      };
    }
    case "true_false": {
      const key = question.answer?.isTrue ?? true;
      return { type: "true_false", isTrue: rollIsRight() ? key : !key };
    }
    case "type_answer": {
      // A "both" screen reads English first, as the stage does.
      const keyLanguage =
        quiz.screenLanguage === "both" ? "en" : quiz.screenLanguage;
      const keyText =
        question.answer?.text[keyLanguage] || question.answer?.text.en || "";
      if (rollIsRight() && keyText)
        return { type: "type_answer", text: keyText };
      const wrong = pickFrom(
        QUIZSHOW_SIMULATED_TEXTS.wrongTypedAnswers,
        random,
      );
      return { type: "type_answer", text: wrong ?? "no idea" };
    }
    case "order": {
      const keyIds = question.answer?.orderedIds ?? shownOptionIds ?? [];
      return {
        type: "order",
        orderedIds: rollIsRight()
          ? [...keyIds]
          : swapNeighbours(keyIds, random),
      };
    }
    case "closest_number": {
      const truth = question.answer?.value ?? 0;
      const tolerance =
        question.answer?.tolerance ?? QUIZSHOW_CLOSEST_TOLERANCE_DEFAULT;
      const spread = closestGuessSpread(truth, tolerance);
      const guess = truth + (random.next() - 0.5) * 2 * spread * (1.2 - skill);
      return {
        type: "closest_number",
        value: Number.isInteger(truth) ? Math.round(guess) : guess,
      };
    }
    default:
      return null;
  }
}

/**
 * How far a guess may land from the truth: a few band widths, so some bots
 * land in the band and some outside it; with no band, a small share of the
 * truth, so one bot is closest and the rest are not.
 */
function closestGuessSpread(
  truth: number,
  tolerance: QuizshowClosestTolerance,
): number {
  const bandWidth = closestBandWidth(truth, tolerance);
  if (bandWidth > 0) return bandWidth * CLOSEST_SPREAD_BAND_WIDTHS;
  return Math.max(
    Math.abs(truth) * CLOSEST_SPREAD_TRUTH_SHARE,
    CLOSEST_SPREAD_MIN,
  );
}

function swapNeighbours(orderedIds: readonly string[], random: BotRandom) {
  const swapped = [...orderedIds];
  if (swapped.length < 2) return swapped;
  const firstIndex = Math.floor(random.next() * (swapped.length - 1));
  const first = swapped[firstIndex];
  const second = swapped[firstIndex + 1];
  if (first === undefined || second === undefined) return swapped;
  swapped[firstIndex] = second;
  swapped[firstIndex + 1] = first;
  return swapped;
}

function planVotes(
  engine: QuizshowEngineState,
  random: BotRandom,
  now: number,
): BotPlan[] {
  const { current, cursor } = engine;
  const round = currentRound(engine);
  const question = round?.questions[current?.questionIndex ?? -1];
  const voteOptions = current?.voteOptions;
  if (!current || !round || !question || !voteOptions) return [];
  const phaseStartedAt = cursor.phaseStartedAt ?? now;
  const limitMs = limitMsFor(round, question, "vote");
  const plans: BotPlan[] = [];
  for (const bot of activeBots(engine)) {
    const { enginePlayer, simulated } = bot;
    if (!current.eligiblePlayerIds.includes(enginePlayer.playerId)) continue;
    if (
      current.votes.some((vote) => vote.voterPlayerId === enginePlayer.playerId)
    ) {
      continue;
    }
    const ownAnswer = current.answers.find(
      (answer) => answer.playerId === enginePlayer.playerId,
    );
    const others = voteOptions.filter(
      (option) => !ownAnswer || option.answerId !== ownAnswer.answerId,
    );
    const truth = others.find((option) => option.isTruth);
    const wantsTruth =
      round.kind === "lie_detector" && random.next() < simulated.skill;
    const chosen = wantsTruth && truth ? truth : pickFrom(others, random);
    const dueAt = dueAtFor(random, phaseStartedAt, limitMs, simulated.speed);
    if (!chosen) continue;
    plans.push({
      dueAt,
      action: {
        type: "player",
        memberKey: simulated.memberKey,
        name: "vote:submit",
        payload: {
          phaseId: cursor.phaseId,
          questionId: question.id,
          optionId: chosen.optionId,
        },
        now: dueAt,
      },
    });
  }
  return plans;
}
