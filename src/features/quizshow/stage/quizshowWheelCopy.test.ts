import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowWheelBonusView,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import {
  stageRoundLineCopy,
  wheelSliceTitleOf,
  type QuizshowTranslate,
  wheelBonusAwardCopy,
  wheelBonusTargetKey,
  wheelPillCopy,
  wheelSliceKindKey,
  wheelSliceMetaCopy,
} from "./quizshowWheelCopy";

/** The session rows: the wheel at 0, then quiz rows. */
const ROUNDS = [
  { kind: "wheel" },
  { kind: "quiz" },
  { kind: "quiz" },
  { kind: "quiz" },
] as const;

/** Reads the one catalog key the helper may ask for. */
const translate: QuizshowTranslate = (key, options) =>
  key === "quizshow:rounds.untitled" ? `Round ${options?.number}` : key;

function sliceOf(
  overrides: Partial<QuizshowWheelSlice> = {},
): QuizshowWheelSlice {
  return {
    roundIndex: 1,
    title: { en: "Music", pt: "Música" },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 8,
    isPlayed: false,
    ...overrides,
  };
}

const quizSlice8 = sliceOf({ questionCount: 8 });
const lieDetectorSlice = sliceOf({ kind: "lie_detector", questionCount: 5 });

function plannedWheel(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick: "round",
    slices: [sliceOf()],
    spinNumber: 1,
    spinTotal: 3,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function questionWheel(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return plannedWheel({
    pick: "question",
    slices: [sliceOf({ roundIndex: 3, title: { en: "Music", pt: "Música" } })],
    ...overrides,
  });
}

function cursorAt(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
    phaseId: "1",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 6,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    ...overrides,
  };
}

function winnersOf(
  names: string[],
  kind: "player" | "team" = "player",
): QuizshowWheelBonusView["winners"] {
  return names.map((name) => ({
    entrantId: `id-${name}`,
    kind,
    name,
    colorKey: null,
  }));
}

function bonusOf(
  winners: QuizshowWheelBonusView["winners"],
  title = { en: "Music", pt: "Música" },
): QuizshowWheelBonusView {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 1,
    sliceTitle: title,
    winners,
  };
}

describe("wheelSliceKindKey", () => {
  it("maps quiz to the quiz label and every party kind to the party label", () => {
    expect(wheelSliceKindKey("quiz")).toBe("quizshow:stage.wheel.kind.quiz");
    expect(wheelSliceKindKey("lie_detector")).toBe(
      "quizshow:stage.wheel.kind.party",
    );
    expect(wheelSliceKindKey("caption_this")).toBe(
      "quizshow:stage.wheel.kind.party",
    );
  });
});

describe("wheelSliceMetaCopy", () => {
  it("counts the questions of a quiz round", () => {
    expect(wheelSliceMetaCopy(quizSlice8, "round")).toEqual({
      key: "quizshow:stage.wheel.metaQuizRound",
      values: { count: 8 },
    });
  });

  it("counts the prompts of a party round", () => {
    expect(wheelSliceMetaCopy(lieDetectorSlice, "round")).toEqual({
      key: "quizshow:stage.wheel.metaPartyRound",
      values: { count: 5 },
    });
  });

  it("carries no values for a pick-a-question slice", () => {
    expect(wheelSliceMetaCopy(lieDetectorSlice, "question")).toEqual({
      key: "quizshow:stage.wheel.metaPartyQuestion",
      values: {},
    });
    expect(wheelSliceMetaCopy(quizSlice8, "question")).toEqual({
      key: "quizshow:stage.wheel.metaQuizQuestion",
      values: {},
    });
  });
});

describe("wheelBonusTargetKey", () => {
  it("names the round winner or the question winner", () => {
    expect(wheelBonusTargetKey("round")).toBe(
      "quizshow:stage.wheel.bonusToRoundWinner",
    );
    expect(wheelBonusTargetKey("question")).toBe(
      "quizshow:stage.wheel.bonusToQuestionWinner",
    );
  });
});

describe("wheelPillCopy", () => {
  it("reads spin N of M on a planned wheel", () => {
    expect(
      wheelPillCopy(plannedWheel({ spinNumber: 2, spinTotal: 5 })),
    ).toEqual({
      key: "quizshow:stage.wheel.pill",
      values: { number: 2, total: 5 },
    });
  });

  it("reads the unplanned pill without values", () => {
    expect(wheelPillCopy(plannedWheel({ wheelRoundIndex: null }))).toEqual({
      key: "quizshow:stage.wheel.pillUnplanned",
      values: {},
    });
  });
});

describe("wheelBonusAwardCopy", () => {
  it("names the one winner", () => {
    expect(
      wheelBonusAwardCopy(bonusOf(winnersOf(["Ana"])), ROUNDS, "en", translate),
    ).toEqual({
      key: "quizshow:stage.wheel.bonusAward",
      values: { points: 500, names: "Ana", title: "Music" },
    });
  });

  it("joins two winners with the language's conjunction", () => {
    const twoWinners = bonusOf(winnersOf(["Ana", "Bo"]));
    const english = wheelBonusAwardCopy(twoWinners, ROUNDS, "en", translate);
    expect(english.key).toBe("quizshow:stage.wheel.bonusAwardTied");
    expect(english.values.names).toBe("Ana and Bo");
    expect(
      wheelBonusAwardCopy(twoWinners, ROUNDS, "pt", translate).values.names,
    ).toBe("Ana e Bo");
  });

  it("lists three winners and still uses the tied sentence", () => {
    const copy = wheelBonusAwardCopy(
      bonusOf(winnersOf(["Ana", "Bo", "Cy"])),
      ROUNDS,
      "en",
      translate,
    );
    expect(copy.key).toBe("quizshow:stage.wheel.bonusAwardTied");
    expect(copy.values.names).toBe("Ana, Bo, and Cy");
  });

  it("counts four or more teams", () => {
    const fourTeams = bonusOf(winnersOf(["A", "B", "C", "D"], "team"));
    expect(wheelBonusAwardCopy(fourTeams, ROUNDS, "en", translate)).toEqual({
      key: "quizshow:stage.wheel.bonusAwardTeams",
      values: { points: 500, count: 4, title: "Music" },
    });
  });

  it("counts four or more players", () => {
    const fivePlayers = bonusOf(winnersOf(["A", "B", "C", "D", "E"]));
    expect(wheelBonusAwardCopy(fivePlayers, ROUNDS, "en", translate)).toEqual({
      key: "quizshow:stage.wheel.bonusAwardPlayers",
      values: { points: 500, count: 5, title: "Music" },
    });
  });

  it("reads the plain bonus line when no winner is named", () => {
    expect(wheelBonusAwardCopy(bonusOf([]), ROUNDS, "en", translate)).toEqual({
      key: "quizshow:stage.wheel.sliceBonus",
      values: { points: 500 },
    });
  });

  it("falls back to the English title when the Portuguese one is blank", () => {
    const copy = wheelBonusAwardCopy(
      bonusOf(winnersOf(["Ana"]), { en: "Music", pt: "   " }),
      ROUNDS,
      "pt",
      translate,
    );
    expect(copy.values.title).toBe("Music");
  });

  it("names Round N when the slice has no title yet", () => {
    const copy = wheelBonusAwardCopy(
      bonusOf(winnersOf(["Ana"]), { en: "", pt: "  " }),
      ROUNDS,
      "en",
      translate,
    );
    expect(copy.values.title).toBe("Round 1");
  });
});

describe("stageRoundLineCopy", () => {
  it("reads Round N of M outside a wheel", () => {
    expect(
      stageRoundLineCopy(
        cursorAt({ roundIndex: 6, roundNumber: 3, roundCount: 6 }),
        null,
        ROUNDS,
        "en",
        translate,
      ),
    ).toEqual({
      key: "quizshow:stage.roundOf",
      values: { number: 3, total: 6 },
    });
  });

  it("reads the category pill for a pick-a-question wheel question", () => {
    expect(
      stageRoundLineCopy(
        cursorAt({ phase: "open", roundIndex: 3 }),
        questionWheel({ playingRoundIndex: 3, spinNumber: 2, spinTotal: 9 }),
        ROUNDS,
        "pt",
        translate,
      ),
    ).toEqual({
      key: "quizshow:stage.wheel.questionPill",
      values: { category: "Música", number: 2, total: 9 },
    });
  });

  it("reads Round N of M on a pick-a-round wheel", () => {
    const copy = stageRoundLineCopy(
      cursorAt({ roundIndex: 1, roundNumber: 2 }),
      plannedWheel({ playingRoundIndex: 1 }),
      ROUNDS,
      "en",
      translate,
    );
    expect(copy.key).toBe("quizshow:stage.roundOf");
  });

  it("reads Round N of M when the wheel plays another slice", () => {
    const copy = stageRoundLineCopy(
      cursorAt({ roundIndex: 4 }),
      questionWheel({ playingRoundIndex: 3 }),
      ROUNDS,
      "en",
      translate,
    );
    expect(copy.key).toBe("quizshow:stage.roundOf");
  });

  it("reads Round N in the question pill while the category has no title yet", () => {
    const untitledWheel = questionWheel({
      playingRoundIndex: 3,
      slices: [sliceOf({ roundIndex: 3, title: { en: "", pt: "" } })],
    });
    expect(
      stageRoundLineCopy(
        cursorAt({ phase: "open", roundIndex: 3 }),
        untitledWheel,
        ROUNDS,
        "en",
        translate,
      ).values.category,
    ).toBe("Round 3");
  });
});

describe("wheelSliceTitleOf", () => {
  it("prints the title in the screen's language", () => {
    expect(wheelSliceTitleOf(sliceOf(), ROUNDS, "pt", translate)).toBe(
      "Música",
    );
  });

  it("falls back to the other language before the placeholder", () => {
    const slice = sliceOf({ title: { en: "Music", pt: "  " } });
    expect(wheelSliceTitleOf(slice, ROUNDS, "pt", translate)).toBe("Music");
  });

  it("reads Round N, counting playable rows before the slice, when both are blank", () => {
    const slice = sliceOf({ roundIndex: 2, title: { en: " ", pt: "" } });
    expect(wheelSliceTitleOf(slice, ROUNDS, "en", translate)).toBe("Round 2");
  });
});
