import {
  FiArrowDown,
  FiArrowUp,
  FiCopy,
  FiDisc,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_PLAYABLE_ROUND_KINDS,
  type QuizshowLanguage,
  type QuizshowPlayableRoundKind,
} from "../../../shared/contracts/quizshow";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import {
  displayRoundNumber,
  displayWheelNumber,
  isWheelRoundKind,
  playableRoundCount,
} from "../quizshowWheel";
import type { QuizshowStudioActions } from "./QuizshowStudioContext";
import { shownTextOf } from "./quizshowStudioRailView";
import type { QuizshowStudioMenuEntry } from "./QuizshowStudioMenu";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/** What the rail's one shared menu is open for. */
export type StudioRailMenuTarget =
  | { kind: "question"; roundIndex: number; questionIndex: number }
  | { kind: "round"; roundIndex: number }
  | { kind: "addRound" };

/** A "..." press toggles its menu; a context menu (right-click, Shift+F10, the menu key) only opens. */
export type StudioRailMenuOpenMode = "toggle" | "open";

/** The key the rail's triggers compare against for `aria-expanded`. */
export function railMenuKeyOf(
  target: StudioRailMenuTarget | null,
): string | null {
  if (target === null) return null;
  if (target.kind === "question") {
    return `question-${target.roundIndex}-${target.questionIndex}`;
  }
  return target.kind === "round" ? `round-${target.roundIndex}` : "addRound";
}

/** The limit line for a full round: the round's own, or the quiz-wide one. */
export function addLimitNoteOf(
  questionCount: number,
  quizQuestionCount: number,
  t: Translate,
): string {
  const isQuizFull = quizQuestionCount >= QUIZSHOW_LIMITS.questionsPerQuizMax;
  return t("quizshow:questions.count", {
    count: isQuizFull ? quizQuestionCount : questionCount,
    max: isQuizFull
      ? QUIZSHOW_LIMITS.questionsPerQuizMax
      : QUIZSHOW_LIMITS.questionsPerRoundMax,
  });
}

/** Duplicate question, Move up, Move down and Delete question. */
export function questionMenuEntries(input: {
  roundIndex: number;
  questionIndex: number;
  questionCount: number;
  quizQuestionCount: number;
  actions: QuizshowStudioActions;
  onRemove: () => void;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  const { roundIndex, questionIndex, questionCount, actions, t } = input;
  const number = questionIndex + 1;
  const isDuplicateAllowed = actions.isAddQuestionToRoundAllowed(roundIndex);
  return [
    {
      key: "duplicate",
      label: t("quizshow:questions.duplicate"),
      icon: FiCopy,
      isDisabled: !isDuplicateAllowed,
      disabledReason: addLimitNoteOf(questionCount, input.quizQuestionCount, t),
      onSelect: () => actions.duplicateQuestion(roundIndex, questionIndex),
    },
    {
      key: "moveUp",
      label: t("quizshow:questions.moveUp", { number }),
      icon: FiArrowUp,
      isDisabled: questionIndex === 0,
      onSelect: () =>
        actions.moveQuestion(roundIndex, questionIndex, questionIndex - 1),
    },
    {
      key: "moveDown",
      label: t("quizshow:questions.moveDown", { number }),
      icon: FiArrowDown,
      isDisabled: questionIndex === questionCount - 1,
      onSelect: () =>
        actions.moveQuestion(roundIndex, questionIndex, questionIndex + 1),
    },
    { key: "separator", kind: "separator" },
    {
      key: "remove",
      label: t("quizshow:questions.remove"),
      icon: FiTrash2,
      isDestructive: true,
      onSelect: input.onRemove,
    },
  ];
}

/** Add question, Move up, Move down and Delete round. */
export function roundMenuEntries(input: {
  roundIndex: number;
  roundCount: number;
  title: string;
  actions: QuizshowStudioActions;
  onRemove: () => void;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  const { roundIndex, roundCount, title, actions, t } = input;
  return [
    {
      key: "add",
      label: t("quizshow:questions.add"),
      icon: FiPlus,
      isDisabled: !actions.isAddQuestionToRoundAllowed(roundIndex),
      onSelect: () => actions.addQuestionToRound(roundIndex),
    },
    {
      key: "moveUp",
      label: t("quizshow:rounds.moveUp", { title }),
      icon: FiArrowUp,
      isDisabled: roundIndex === 0,
      onSelect: () => actions.moveRound(roundIndex, roundIndex - 1),
    },
    {
      key: "moveDown",
      label: t("quizshow:rounds.moveDown", { title }),
      icon: FiArrowDown,
      isDisabled: roundIndex === roundCount - 1,
      onSelect: () => actions.moveRound(roundIndex, roundIndex + 1),
    },
    { key: "separator", kind: "separator" },
    {
      key: "remove",
      label: t("quizshow:rounds.remove"),
      icon: FiTrash2,
      isDestructive: true,
      onSelect: input.onRemove,
    },
  ];
}

/** Move up, Move down and Delete wheel; a wheel holds no questions to add. */
export function wheelMenuEntries(input: {
  roundIndex: number;
  roundCount: number;
  title: string;
  actions: QuizshowStudioActions;
  onRemove: () => void;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  const { roundIndex, roundCount, title, actions, t } = input;
  return [
    {
      key: "moveUp",
      label: t("quizshow:rounds.moveUp", { title }),
      icon: FiArrowUp,
      isDisabled: roundIndex === 0,
      onSelect: () => actions.moveRound(roundIndex, roundIndex - 1),
    },
    {
      key: "moveDown",
      label: t("quizshow:rounds.moveDown", { title }),
      icon: FiArrowDown,
      isDisabled: roundIndex === roundCount - 1,
      onSelect: () => actions.moveRound(roundIndex, roundIndex + 1),
    },
    { key: "separator", kind: "separator" },
    {
      key: "remove",
      label: t("quizshow:rounds.removeWheel"),
      icon: FiTrash2,
      isDestructive: true,
      onSelect: input.onRemove,
    },
  ];
}

/** The playable round kinds, each with its one-line hint, for "Add round". */
export function roundKindEntries(input: {
  onPick: (kind: QuizshowPlayableRoundKind) => void;
  isAddRoundAllowed: boolean;
  /** Why a round cannot be added: the round limit, or the quiz-wide question limit. */
  disabledReason: string;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  return QUIZSHOW_PLAYABLE_ROUND_KINDS.map((kind) => ({
    key: kind,
    label: input.t(`quizshow:kind.${kind}.name`),
    description: input.t(`quizshow:kind.${kind}.hint`),
    isDisabled: !input.isAddRoundAllowed,
    disabledReason: input.disabledReason,
    onSelect: () => input.onPick(kind),
  }));
}

/**
 * The rail's round count line ("3 of 10 rounds", wheels left out), which is
 * also why "Add round" is blocked: the count when the rounds are full, else
 * the quiz-wide question limit (a new round arrives with a question).
 */
export function roundCountLineOf(
  rounds: readonly QuizshowDraftRound[],
  quizQuestionCount: number,
  t: Translate,
): string {
  const roundCount = playableRoundCount(rounds);
  const isQuizFull = quizQuestionCount >= QUIZSHOW_LIMITS.questionsPerQuizMax;
  if (roundCount >= QUIZSHOW_LIMITS.roundsMax || !isQuizFull) {
    return t("quizshow:rounds.count", {
      count: roundCount,
      max: QUIZSHOW_LIMITS.roundsMax,
    });
  }
  return addLimitNoteOf(0, quizQuestionCount, t);
}

/** "Add round": the playable kinds, then the wheel with its own limit. */
function addRoundMenuEntries(input: {
  rounds: readonly QuizshowDraftRound[];
  quizQuestionCount: number;
  actions: QuizshowStudioActions;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  const { actions, t } = input;
  return [
    ...roundKindEntries({
      onPick: actions.addRound,
      isAddRoundAllowed: actions.isAddRoundAllowed,
      disabledReason: roundCountLineOf(
        input.rounds,
        input.quizQuestionCount,
        t,
      ),
      t,
    }),
    { key: "separator", kind: "separator" },
    {
      key: "wheel",
      label: t("quizshow:kind.wheel.name"),
      description: t("quizshow:kind.wheel.hint"),
      icon: FiDisc,
      isDisabled: !actions.isAddWheelAllowed,
      disabledReason: t("quizshow:rounds.wheelsFull", {
        max: QUIZSHOW_LIMITS.wheelStepsMax,
      }),
      onSelect: actions.addWheel,
    },
  ];
}

/** The entries for whatever the rail's shared menu is open for; none when it is closed. */
export function railMenuEntriesOf(input: {
  target: StudioRailMenuTarget | null;
  rounds: readonly QuizshowDraftRound[];
  quizQuestionCount: number;
  viewLanguage: QuizshowLanguage;
  actions: QuizshowStudioActions;
  onRequestRemoveQuestion: (roundIndex: number, questionIndex: number) => void;
  onRequestRemoveRound: (roundIndex: number) => void;
  t: Translate;
}): QuizshowStudioMenuEntry[] {
  const { target, actions, t } = input;
  if (target === null) return [];
  if (target.kind === "addRound") {
    return addRoundMenuEntries({
      rounds: input.rounds,
      quizQuestionCount: input.quizQuestionCount,
      actions,
      t,
    });
  }
  const round = input.rounds[target.roundIndex];
  if (!round) return [];
  const { roundIndex } = target;
  if (target.kind === "question") {
    const { questionIndex } = target;
    return questionMenuEntries({
      roundIndex,
      questionIndex,
      questionCount: round.questions.length,
      quizQuestionCount: input.quizQuestionCount,
      actions,
      onRemove: () => input.onRequestRemoveQuestion(roundIndex, questionIndex),
      t,
    });
  }
  if (isWheelRoundKind(round.kind)) {
    return wheelMenuEntries({
      roundIndex,
      roundCount: input.rounds.length,
      title: t("quizshow:studio.inspector.wheel.eyebrow", {
        number: displayWheelNumber(input.rounds, roundIndex),
      }),
      actions,
      onRemove: () => input.onRequestRemoveRound(roundIndex),
      t,
    });
  }
  const title =
    shownTextOf(round.title, input.viewLanguage) ||
    t("quizshow:rounds.untitled", {
      number: displayRoundNumber(input.rounds, roundIndex),
    });
  return roundMenuEntries({
    roundIndex,
    roundCount: input.rounds.length,
    title,
    actions,
    onRemove: () => input.onRequestRemoveRound(roundIndex),
    t,
  });
}
