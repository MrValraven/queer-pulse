import { describe, expect, it, vi } from "vitest";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPlayableRoundKind,
} from "../../../shared/contracts/quizshow";
import {
  newRound,
  newWheel,
  type QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { displayRoundNumber } from "../quizshowWheel";
import type { QuizshowStudioActions } from "./QuizshowStudioContext";
import type {
  QuizshowStudioMenuAction,
  QuizshowStudioMenuEntry,
} from "./QuizshowStudioMenu";
import {
  questionMoveTargetsOf,
  railMenuEntriesOf,
} from "./quizshowStudioRailMenus";

/** Echoes the key, with its values as JSON when there are any. */
function translateStub(
  key: string,
  values?: Record<string, string | number>,
): string {
  return values ? `${key}${JSON.stringify(values)}` : key;
}

function actionsStub(
  overrides: Partial<QuizshowStudioActions> = {},
): QuizshowStudioActions {
  return {
    isAddQuestionAllowed: true,
    isAddRoundAllowed: true,
    isAddWheelAllowed: true,
    isAddQuestionToRoundAllowed: () => true,
    selectPrevious: vi.fn(),
    selectNext: vi.fn(),
    addQuestionAfterSelection: vi.fn(),
    addQuestionToRound: vi.fn(),
    duplicateSelectedQuestion: vi.fn(),
    duplicateQuestion: vi.fn(),
    addRound: vi.fn(),
    addWheel: vi.fn(),
    removeQuestion: vi.fn(),
    removeRound: vi.fn(),
    moveQuestion: vi.fn(),
    moveRound: vi.fn(),
    ...overrides,
  };
}

function entriesOf(input: {
  target: Parameters<typeof railMenuEntriesOf>[0]["target"];
  rounds?: QuizshowDraftRound[];
  quizQuestionCount?: number;
  actions?: QuizshowStudioActions;
  onRequestRemoveRound?: (roundIndex: number) => void;
  onOpenMoveToRound?: (roundIndex: number, questionIndex: number) => void;
  onBackToQuestionMenu?: (roundIndex: number, questionIndex: number) => void;
}): QuizshowStudioMenuEntry[] {
  return railMenuEntriesOf({
    target: input.target,
    rounds: input.rounds ?? [newRound("quiz")],
    quizQuestionCount: input.quizQuestionCount ?? 1,
    viewLanguage: "en",
    actions: input.actions ?? actionsStub(),
    onRequestRemoveQuestion: vi.fn(),
    onRequestRemoveRound: input.onRequestRemoveRound ?? vi.fn(),
    onOpenMoveToRound: input.onOpenMoveToRound,
    onBackToQuestionMenu: input.onBackToQuestionMenu,
    t: translateStub,
  });
}

/** Whether the entry is one someone can choose (neither a separator nor a heading). */
function isActionEntry(
  entry: QuizshowStudioMenuEntry | undefined,
): entry is QuizshowStudioMenuAction {
  return entry !== undefined && "onSelect" in entry;
}

function entryByKey(
  entries: QuizshowStudioMenuEntry[],
  key: string,
): QuizshowStudioMenuEntry | undefined {
  return entries.find((entry) => entry.key === key);
}

const PLAYABLE_KEYS = ["quiz", "lie_detector", "caption_this", "drag_name"];

describe("railMenuEntriesOf: add round", () => {
  it("lists the four playable kinds, a separator and the wheel", () => {
    const entries = entriesOf({ target: { kind: "addRound" } });
    expect(entries.map((entry) => entry.key)).toEqual([
      ...PLAYABLE_KEYS,
      "separator",
      "wheel",
    ]);
    expect(entryByKey(entries, "wheel")).toMatchObject({
      label: "quizshow:kind.wheel.name",
      description: "quizshow:kind.wheel.hint",
      isDisabled: false,
    });
  });

  it("adds a wheel from its entry", () => {
    const actions = actionsStub();
    const wheelEntry = entryByKey(
      entriesOf({ target: { kind: "addRound" }, actions }),
      "wheel",
    );
    if (!isActionEntry(wheelEntry)) throw new Error("wheel entry");
    wheelEntry?.onSelect();
    expect(actions.addWheel).toHaveBeenCalledTimes(1);
  });

  it("disables the wheel at the wheel limit with its reason", () => {
    const entries = entriesOf({
      target: { kind: "addRound" },
      actions: actionsStub({ isAddWheelAllowed: false }),
    });
    expect(entryByKey(entries, "wheel")).toMatchObject({
      isDisabled: true,
      disabledReason: translateStub("quizshow:rounds.wheelsFull", { max: 3 }),
    });
    expect(entryByKey(entries, "quiz")).toMatchObject({ isDisabled: false });
  });

  it("disables the four kinds with the round count when rounds are full", () => {
    const fullRounds = [
      ...Array.from({ length: QUIZSHOW_LIMITS.roundsMax }, () =>
        newRound("quiz"),
      ),
      newWheel(),
    ];
    const entries = entriesOf({
      target: { kind: "addRound" },
      rounds: fullRounds,
      quizQuestionCount: QUIZSHOW_LIMITS.roundsMax,
      actions: actionsStub({ isAddRoundAllowed: false }),
    });
    const countLine = translateStub("quizshow:rounds.count", {
      count: QUIZSHOW_LIMITS.roundsMax,
      max: QUIZSHOW_LIMITS.roundsMax,
    });
    for (const key of PLAYABLE_KEYS) {
      expect(entryByKey(entries, key)).toMatchObject({
        isDisabled: true,
        disabledReason: countLine,
      });
    }
    expect(entryByKey(entries, "wheel")).toMatchObject({ isDisabled: false });
  });

  it("names the question limit when that is what blocks a round", () => {
    const entries = entriesOf({
      target: { kind: "addRound" },
      quizQuestionCount: QUIZSHOW_LIMITS.questionsPerQuizMax,
      actions: actionsStub({ isAddRoundAllowed: false }),
    });
    expect(entryByKey(entries, "quiz")).toMatchObject({
      isDisabled: true,
      disabledReason: translateStub("quizshow:questions.count", {
        count: QUIZSHOW_LIMITS.questionsPerQuizMax,
        max: QUIZSHOW_LIMITS.questionsPerQuizMax,
      }),
    });
  });
});

describe("railMenuEntriesOf: a wheel row", () => {
  const rounds = (): QuizshowDraftRound[] => [
    newRound("quiz"),
    newWheel(),
    newRound("quiz"),
    newRound("quiz"),
  ];

  it("moves and deletes the wheel by its number", () => {
    const entries = entriesOf({
      target: { kind: "round", roundIndex: 1 },
      rounds: rounds(),
    });
    expect(entries.map((entry) => entry.key)).toEqual([
      "moveUp",
      "moveDown",
      "separator",
      "remove",
    ]);
    const title = translateStub("quizshow:studio.inspector.wheel.eyebrow", {
      number: 1,
    });
    expect(entryByKey(entries, "moveUp")).toMatchObject({
      label: translateStub("quizshow:rounds.moveUp", { title }),
    });
    expect(entryByKey(entries, "moveDown")).toMatchObject({
      label: translateStub("quizshow:rounds.moveDown", { title }),
    });
    expect(entryByKey(entries, "remove")).toMatchObject({
      label: "quizshow:rounds.removeWheel",
      isDestructive: true,
    });
  });

  it("asks to remove the wheel through the round's confirm", () => {
    const onRequestRemoveRound = vi.fn();
    const removeEntry = entryByKey(
      entriesOf({
        target: { kind: "round", roundIndex: 1 },
        rounds: rounds(),
        onRequestRemoveRound,
      }),
      "remove",
    );
    if (!isActionEntry(removeEntry)) throw new Error("remove entry");
    removeEntry?.onSelect();
    expect(onRequestRemoveRound).toHaveBeenCalledWith(1);
  });
});

describe("railMenuEntriesOf: numbers skip wheel rows", () => {
  it("names an untitled round after a wheel as round 1", () => {
    const entries = entriesOf({
      target: { kind: "round", roundIndex: 1 },
      rounds: [newWheel(), newRound("quiz"), newRound("quiz")],
    });
    const title = translateStub("quizshow:rounds.untitled", { number: 1 });
    expect(entryByKey(entries, "moveUp")).toMatchObject({
      label: translateStub("quizshow:rounds.moveUp", { title }),
    });
  });
});

describe("railMenuEntriesOf: move to round", () => {
  /** A round of `kind` titled `title` holding `questionCount` questions. */
  function roundOf(
    kind: QuizshowPlayableRoundKind,
    title: string,
    questionCount = 1,
  ): QuizshowDraftRound {
    const round = newRound(kind);
    const [question] = round.questions;
    if (question === undefined) throw new Error("new round has no question");
    return {
      ...round,
      title: { en: title, pt: title },
      questions: Array.from({ length: questionCount }, (_unused, index) => ({
        ...question,
        draftKey: `${round.draftKey}-${index}`,
      })),
    };
  }

  const rounds = (): QuizshowDraftRound[] => [
    roundOf("quiz", "Opener"),
    newWheel(),
    roundOf("lie_detector", "Liars"),
    roundOf("quiz", "Full", QUIZSHOW_LIMITS.questionsPerRoundMax),
    roundOf("quiz", "Closer"),
    roundOf("lie_detector", "More liars"),
  ];

  it("lists only other rounds of the same kind with room", () => {
    expect(questionMoveTargetsOf(rounds(), 0)).toEqual([4]);
    expect(questionMoveTargetsOf(rounds(), 2)).toEqual([5]);
    expect(questionMoveTargetsOf(rounds(), 1)).toEqual([]);
  });

  it("adds Move to round after Move down and opens the submenu from it", () => {
    const onOpenMoveToRound = vi.fn();
    const entries = entriesOf({
      target: { kind: "question", roundIndex: 0, questionIndex: 0 },
      rounds: rounds(),
      actions: actionsStub({ moveQuestionToRound: vi.fn() }),
      onOpenMoveToRound,
    });
    expect(entries.map((entry) => entry.key)).toEqual([
      "duplicate",
      "moveUp",
      "moveDown",
      "moveToRound",
      "separator",
      "remove",
    ]);
    const moveEntry = entryByKey(entries, "moveToRound");
    if (!isActionEntry(moveEntry)) {
      throw new Error("move entry");
    }
    expect(moveEntry).toMatchObject({
      label: "quizshow:studio.moveToRound",
      isDisabled: false,
      hasPopup: true,
    });
    moveEntry.onSelect();
    expect(onOpenMoveToRound).toHaveBeenCalledWith(0, 0);
  });

  it("disables Move to round when no round fits the question", () => {
    const entries = entriesOf({
      target: { kind: "question", roundIndex: 0, questionIndex: 0 },
      rounds: [roundOf("quiz", "Only"), roundOf("caption_this", "Captions")],
      actions: actionsStub({ moveQuestionToRound: vi.fn() }),
      onOpenMoveToRound: vi.fn(),
    });
    expect(entryByKey(entries, "moveToRound")).toMatchObject({
      isDisabled: true,
      disabledReason: "quizshow:studio.moveToRoundNone",
    });
  });

  it("names each fitting round in the submenu and moves the question there", () => {
    const moveQuestionToRound = vi.fn();
    const entries = entriesOf({
      target: { kind: "moveQuestion", roundIndex: 2, questionIndex: 0 },
      rounds: rounds(),
      actions: actionsStub({ moveQuestionToRound }),
    });
    expect(entries.map((each) => each.key)).toEqual(["heading", "round-5"]);
    expect(entryByKey(entries, "heading")).toMatchObject({
      kind: "heading",
      label: "quizshow:studio.moveToRound",
    });
    const entry = entryByKey(entries, "round-5");
    if (!isActionEntry(entry)) {
      throw new Error("round entry");
    }
    expect(entry.label).toBe(
      translateStub("quizshow:studio.moveToRoundItem", {
        number: displayRoundNumber(rounds(), 5),
        title: "More liars",
      }),
    );
    entry.onSelect();
    expect(moveQuestionToRound).toHaveBeenCalledWith(2, 0, 5);
  });

  it("names an untitled round by its number alone", () => {
    const entries = entriesOf({
      target: { kind: "moveQuestion", roundIndex: 0, questionIndex: 0 },
      rounds: [roundOf("quiz", "Opener"), roundOf("quiz", "")],
      actions: actionsStub({ moveQuestionToRound: vi.fn() }),
    });
    const entry = entryByKey(entries, "round-1");
    if (!isActionEntry(entry)) {
      throw new Error("round entry");
    }
    expect(entry.label).toBe(
      translateStub("quizshow:rounds.untitled", { number: 2 }),
    );
  });

  it("opens the submenu with Back, which returns to the question's menu", () => {
    const onBackToQuestionMenu = vi.fn();
    const entries = entriesOf({
      target: { kind: "moveQuestion", roundIndex: 2, questionIndex: 0 },
      rounds: rounds(),
      actions: actionsStub({ moveQuestionToRound: vi.fn() }),
      onBackToQuestionMenu,
    });
    expect(entries.map((entry) => entry.key)).toEqual([
      "back",
      "separator",
      "heading",
      "round-5",
    ]);
    const backEntry = entryByKey(entries, "back");
    if (!isActionEntry(backEntry)) {
      throw new Error("back entry");
    }
    expect(backEntry.label).toBe("quizshow:studio.moveToRoundBack");
    backEntry.onSelect();
    expect(onBackToQuestionMenu).toHaveBeenCalledWith(2, 0);
  });
});
