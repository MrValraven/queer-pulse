import type {
  QuizshowAnswerPayload,
  QuizshowLobbyJoinInput,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
} from "../../../shared/contracts/quizshow";
import type {
  QuizshowEngineAction,
  QuizshowEnginePlayer,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import { quizshowRandomFrom } from "./quizshowRandom";
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
}

type BotRandom = ReturnType<typeof quizshowRandomFrom>;
type BotPlan = QuizshowBotState["plans"][number];

interface ActiveBot {
  simulated: QuizshowSimulatedPlayer;
  simulatedIndex: number;
  enginePlayer: QuizshowEnginePlayer;
}

const JOIN_GAP_MS = 700;
const EARLIEST_ANSWER_MS = 1_200;
const LATEST_ANSWER_SHARE = 0.95;

export function createBotState(seed: number, now: number): QuizshowBotState {
  return {
    randomState: seed >>> 0,
    plannedPhaseId: null,
    plannedPhaseStartedAt: null,
    plans: [],
    lobbyStartedAt: now,
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
    },
    actions,
  };
}

function planNextJoin(
  botState: QuizshowBotState,
  engine: QuizshowEngineState,
  now: number,
): QuizshowEngineAction | null {
  if (engine.cursor.phase !== "lobby") return null;
  const joinedKeys = new Set(engine.players.map((player) => player.memberKey));
  const nextIndex = QUIZSHOW_SIMULATED_PLAYERS.findIndex(
    (simulated) => !joinedKeys.has(simulated.memberKey),
  );
  const next = QUIZSHOW_SIMULATED_PLAYERS[nextIndex];
  if (!next) return null;
  if (now < botState.lobbyStartedAt + JOIN_GAP_MS * (nextIndex + 1)) {
    return null;
  }
  return {
    type: "player",
    memberKey: next.memberKey,
    name: "lobby:join",
    payload: {
      screenName: next.screenName,
      isAvatarShown: false,
      hasExtraTime: next.hasExtraTime,
      team: engine.playMode === "teams" ? teamChoiceFor(engine, next) : null,
    },
    now,
  };
}

function teamChoiceFor(
  engine: QuizshowEngineState,
  simulated: QuizshowSimulatedPlayer,
): QuizshowLobbyJoinInput["team"] {
  const template = QUIZSHOW_SIMULATED_TEAMS[simulated.teamIndex];
  if (!template) return null;
  const existing = engine.teams.find((team) => team.name === template.name);
  if (existing) return { teamId: existing.teamId };
  return {
    newTeam: {
      name: template.name,
      colorKey: template.colorKey,
    },
  };
}

function activeBots(engine: QuizshowEngineState): ActiveBot[] {
  const bots: ActiveBot[] = [];
  QUIZSHOW_SIMULATED_PLAYERS.forEach((simulated, simulatedIndex) => {
    const enginePlayer = engine.players.find(
      (player) => player.memberKey === simulated.memberKey && !player.isRemoved,
    );
    if (enginePlayer) bots.push({ simulated, simulatedIndex, enginePlayer });
  });
  return bots;
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
  const roundsLeft = Math.max(engine.cursor.roundCount - roundIndex, 1);
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
      const keyIndex = question.answer?.correctIndex ?? 0;
      if (rollIsRight() || question.options.length < 2) {
        return { type: "multiple_choice", optionIndex: keyIndex };
      }
      const others = question.options
        .map((_option, optionIndex) => optionIndex)
        .filter((optionIndex) => optionIndex !== keyIndex);
      return {
        type: "multiple_choice",
        optionIndex: pickFrom(others, random) ?? keyIndex,
      };
    }
    case "true_false": {
      const key = question.answer?.isTrue ?? true;
      return { type: "true_false", isTrue: rollIsRight() ? key : !key };
    }
    case "type_answer": {
      const keyText =
        question.answer?.text[quiz.screenLanguage] ||
        question.answer?.text.en ||
        "";
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
      const key = question.answer?.value ?? 0;
      const guess = key * (1 + (random.next() - 0.5) * 0.6 * (1.2 - skill));
      return {
        type: "closest_number",
        value: Number.isInteger(key) ? Math.round(guess) : guess,
      };
    }
    default:
      return null;
  }
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
