import type {
  QuizshowCursor,
  QuizshowDistribution,
  QuizshowLanguage,
  QuizshowPhase,
  QuizshowPlayerState,
  QuizshowQuiz,
  QuizshowQuestion,
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowRound,
  QuizshowScreenState,
  QuizshowStateBase,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import { dryRunQuizOf } from "../builder/quizshowDryRunQuiz";
import { toAnswerKeyView, toRoundCard } from "../engine/quizshowEngineViews";
import {
  createWheelState,
  displayRoundNumber,
  emptyWheelProgress,
  isQuizRoundKind,
  isWheelRoundKind,
  quizshowRoundTotal,
  toWheelView,
  wheelSliceRoundIndexes,
} from "../quizshowWheel";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  clampStudioSelection,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";

/**
 * Draft-to-view adapters for the studio canvas: the selected slide as the
 * real big screen and phone renderers expect it. Nobody plays a preview, so
 * every count is zero, no deadline runs, and the answer key shows only in
 * `reveal`. Ids are minted by position, so a keystroke never swaps the view.
 */

export type QuizshowStudioPreviewPhase = "open" | "reveal" | "round_intro";

export interface QuizshowStudioPreviewOptions {
  /** The studio's view language; the stage draws in it. */
  language: QuizshowLanguage;
  phase: QuizshowStudioPreviewPhase;
  pickedPreviewUrls: ReadonlyMap<string, string>;
}

/** What `QuizshowPlayerQuestion` (and `QuizshowPlayerParty`) take. */
export interface QuizshowStudioPlayerQuestionProps {
  controller: QuizshowSessionController;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
}

const PREVIEW_ID = "studio-preview";

/**
 * Options as the screen shows them while players answer. An order question's
 * draft holds its items in the right order, and the stage never opens on the
 * right order, so the preview rotates them by one (stable while typing).
 */
function shownOptionsOf(question: QuizshowQuestion) {
  if (question.type === "multiple_choice") return [...question.options];
  if (question.type !== "order") return null;
  const [first, ...rest] = question.options;
  return first === undefined ? [] : [...rest, first];
}

function questionViewOf(
  round: QuizshowRound,
  question: QuizshowQuestion,
  roundIndex: number,
  questionIndex: number,
): QuizshowQuestionView {
  return {
    questionId: question.id,
    roundIndex,
    questionIndex,
    roundKind: round.kind,
    type: question.type,
    prompt: { ...question.prompt },
    mediaUrl: question.mediaUrl,
    points: question.points,
    timeLimitSeconds: isQuizRoundKind(round.kind)
      ? (question.timeLimitSeconds ?? round.settings.timeLimitSeconds)
      : round.settings.writeSeconds,
    options: shownOptionsOf(question),
  };
}

/** A distribution nobody answered into: every count zero, the Lie Detector truth listed alone. */
function emptyDistributionOf(
  round: QuizshowRound,
  question: QuizshowQuestion,
  language: QuizshowLanguage,
): QuizshowDistribution {
  switch (question.type) {
    case "multiple_choice":
      return { kind: "options", counts: question.options.map(() => 0) };
    case "true_false":
      return { kind: "true_false", trueCount: 0, falseCount: 0 };
    case "type_answer":
      return { kind: "typed", correctCount: 0, incorrectCount: 0 };
    case "order":
      return { kind: "order", exactCount: 0, partialCount: 0, noneCount: 0 };
    case "closest_number":
      return {
        kind: "closest",
        closestValue: null,
        closestNames: [],
        withinBandCount: 0,
      };
    case "prompt": {
      const truth =
        round.kind === "lie_detector" && question.answer !== null
          ? question.answer.truth[language]
          : null;
      const entries =
        truth === null
          ? []
          : [
              {
                optionId: `${question.id}-truth`,
                answerId: null,
                text: truth,
                authorName: null,
                isTruth: true,
                voteCount: 0,
                authorPoints: 0,
              },
            ];
      return { kind: "votes", entries, favouriteOptionId: null };
    }
  }
}

function revealOf(
  round: QuizshowRound,
  question: QuizshowQuestion,
  language: QuizshowLanguage,
): QuizshowReveal {
  return {
    phaseId: PREVIEW_ID,
    questionId: question.id,
    correct: toAnswerKeyView(round, question),
    answeredCount: 0,
    eligibleCount: 0,
    distribution: emptyDistributionOf(round, question, language),
  };
}

/** The question phase for this round kind: party rounds write where quiz rounds open. */
function questionPhaseOf(
  round: QuizshowRound,
  phase: QuizshowStudioPreviewPhase,
): QuizshowPhase {
  if (phase === "reveal") return "reveal";
  return isQuizRoundKind(round.kind) ? "open" : "write";
}

function cursorOf(
  phase: QuizshowPhase,
  roundIndex: number | null,
  questionIndex: number | null,
  progress: Pick<QuizshowCursor, "roundNumber" | "roundCount">,
): QuizshowCursor {
  return {
    phaseId: PREVIEW_ID,
    status: phase === "lobby" ? "lobby" : "running",
    phase,
    roundIndex,
    questionIndex,
    roundNumber: progress.roundNumber,
    roundCount: progress.roundCount,
    upNext: null,
    canSpinForNextRound: false,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
  };
}

interface PreviewFrame {
  base: QuizshowStateBase;
  question: QuizshowQuestionView | null;
}

/** "Round N" of the selection: playable rows up to it, 0 on the quiz; a wheel shows the rounds before it. */
function previewRoundNumberOf(
  rounds: QuizshowQuiz["rounds"],
  roundIndex: number | null,
): number {
  if (roundIndex === null) return 0;
  const row = rounds[roundIndex];
  if (row === undefined) return 0;
  const number = displayRoundNumber(rounds, roundIndex);
  return isWheelRoundKind(row.kind) ? number - 1 : number;
}

/** The wheel at rest, built from the draft's own rows (contract 8.5). */
function previewWheelOf(
  rounds: QuizshowQuiz["rounds"],
  wheelRoundIndex: number,
): QuizshowWheelView {
  return toWheelView(
    rounds,
    createWheelState(
      rounds,
      wheelRoundIndex,
      wheelSliceRoundIndexes(rounds, wheelRoundIndex),
    ),
    emptyWheelProgress(),
    "wheel",
  );
}

/** The shared part of both states for the selection; null round and question on the quiz. */
function previewFrameOf(
  draft: QuizshowDraft,
  selection: QuizshowStudioSelection,
  options: QuizshowStudioPreviewOptions,
  phaseFor: (round: QuizshowRound) => QuizshowPhase,
): PreviewFrame {
  // The try-out's own quiz: position-minted ids and loadable pictures.
  const quiz = dryRunQuizOf(draft, options.pickedPreviewUrls);
  const fitted = clampStudioSelection(selection, draft);
  const roundIndex = fitted.kind === "quiz" ? null : fitted.roundIndex;
  const round = roundIndex === null ? undefined : quiz.rounds[roundIndex];
  const shown = shownQuestionOf(round, fitted);
  const isWheelRow = round !== undefined && isWheelRoundKind(round.kind);
  let phase: QuizshowPhase = "lobby";
  if (round !== undefined) {
    if (isWheelRow) phase = "wheel";
    else phase = shown === null ? "round_intro" : phaseFor(round);
  }
  const base: QuizshowStateBase = {
    sessionId: PREVIEW_ID,
    eventSlug: null,
    eventTitle: null,
    kind: "game",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "",
    quizTitle: quiz.title,
    languages: quiz.languages,
    screenLanguage: options.language,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: false,
    isScreenMuted: true,
    cursor: cursorOf(phase, roundIndex, shown?.questionIndex ?? null, {
      roundNumber: previewRoundNumberOf(quiz.rounds, roundIndex),
      roundCount: quizshowRoundTotal(quiz.rounds, emptyWheelProgress()),
    }),
    rounds: quiz.rounds.map((eachRound, eachIndex) =>
      toRoundCard(eachRound, eachIndex),
    ),
    round:
      round === undefined || roundIndex === null || isWheelRow
        ? null
        : toRoundCard(round, roundIndex),
    reveal:
      shown !== null && phase === "reveal"
        ? revealOf(shown.round, shown.question, options.language)
        : null,
    scores: null,
    podium: null,
    wheel:
      isWheelRow && roundIndex !== null
        ? previewWheelOf(quiz.rounds, roundIndex)
        : null,
    wheelBonus: null,
    nextEvent: null,
  };
  return {
    base,
    question:
      shown === null
        ? null
        : questionViewOf(
            shown.round,
            shown.question,
            shown.roundIndex,
            shown.questionIndex,
          ),
  };
}

/** The selected question with its round, or null when a question is not selected. */
function shownQuestionOf(
  round: QuizshowRound | undefined,
  fitted: QuizshowStudioSelection,
): {
  round: QuizshowRound;
  question: QuizshowQuestion;
  roundIndex: number;
  questionIndex: number;
} | null {
  if (round === undefined || fitted.kind !== "question") return null;
  const question = round.questions[fitted.questionIndex];
  if (question === undefined) return null;
  return {
    round,
    question,
    roundIndex: fitted.roundIndex,
    questionIndex: fitted.questionIndex,
  };
}

/**
 * The big screen's state for the selection: a round header as its intro
 * card, and a question in `options.phase`: "open" (a party round's "write"),
 * "reveal" with the answer key, or "round_intro" for its round's card. The
 * quiz itself still maps to a lobby phase here, but no preview draws it: the
 * Big screen preview shows its typeset title slide instead.
 */
export function studioScreenStateFor(
  draft: QuizshowDraft,
  selection: QuizshowStudioSelection,
  options: QuizshowStudioPreviewOptions,
): QuizshowScreenState {
  const { base, question } = previewFrameOf(
    draft,
    selection,
    options,
    (round) =>
      options.phase === "round_intro"
        ? "round_intro"
        : questionPhaseOf(round, options.phase),
  );
  const isQuestionShown = base.cursor.phase !== "round_intro";
  return {
    ...base,
    role: "screen",
    lobby: { players: [], teams: [], playerCount: 0 },
    question: isQuestionShown ? question : null,
    answerCount: null,
    voteOptions: null,
  };
}

/** The screen state wrapped as the client state `QuizshowScreenStage` reads. */
export function studioScreenClientStateOf(
  session: QuizshowScreenState,
): QuizshowClientState {
  return {
    ...createQuizshowClientState("screen"),
    status: "attached",
    session,
  };
}

// A preview sends nothing: every send answers as if the network dropped it,
// which the phone holds as a local lock, so a tap still shows "Answer locked".
const PREVIEW_SEND_RESULT = { ok: false, code: "transport_timeout" } as const;
const sendNothing: QuizshowSessionController["send"] = () =>
  Promise.resolve(PREVIEW_SEND_RESULT);
const submitNothing: QuizshowSessionController["submitAnswer"] = () =>
  Promise.resolve(PREVIEW_SEND_RESULT);
const restartNothing = () => undefined;

/**
 * Props for the phone's answering view of the selected question, or null
 * when no question is selected. The phone always shows the answering phase
 * ("open", or "write" in a party round): a preview has no own result to
 * reveal. `QuizshowPlayerParty` takes the same props for a party round.
 */
export function studioPlayerQuestionPropsFor(
  draft: QuizshowDraft,
  selection: QuizshowStudioSelection,
  options: QuizshowStudioPreviewOptions,
): QuizshowStudioPlayerQuestionProps | null {
  const { base, question } = previewFrameOf(
    draft,
    selection,
    options,
    (round) => questionPhaseOf(round, "open"),
  );
  if (question === null) return null;
  const session: QuizshowPlayerState = {
    ...base,
    reveal: null,
    role: "player",
    lobby: { players: [], teams: [], playerCount: 0 },
    question,
    voteOptions: null,
    me: null,
    suggestedScreenName: "",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
  };
  return {
    controller: {
      state: {
        ...createQuizshowClientState("player"),
        status: "attached",
        session,
      },
      clockOffsetMs: 0,
      isDemo: true,
      send: sendNothing,
      submitAnswer: submitNothing,
      demoScreenState: null,
      restartDemo: restartNothing,
    },
    question,
    language: options.language,
  };
}
