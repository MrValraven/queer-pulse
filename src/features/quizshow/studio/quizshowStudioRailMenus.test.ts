import { describe, expect, it, vi } from "vitest";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import {
  newRound,
  newWheel,
  type QuizshowDraftRound,
} from "../builder/quizshowDraft";
import type { QuizshowStudioActions } from "./QuizshowStudioContext";
import type { QuizshowStudioMenuEntry } from "./QuizshowStudioMenu";
import { railMenuEntriesOf } from "./quizshowStudioRailMenus";

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
}): QuizshowStudioMenuEntry[] {
  return railMenuEntriesOf({
    target: input.target,
    rounds: input.rounds ?? [newRound("quiz")],
    quizQuestionCount: input.quizQuestionCount ?? 1,
    viewLanguage: "en",
    actions: input.actions ?? actionsStub(),
    onRequestRemoveQuestion: vi.fn(),
    onRequestRemoveRound: input.onRequestRemoveRound ?? vi.fn(),
    t: translateStub,
  });
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
    if (wheelEntry?.kind === "separator") throw new Error("wheel entry");
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
    if (removeEntry?.kind === "separator") throw new Error("remove entry");
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
