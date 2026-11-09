import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowPhase,
  QuizshowRoundKind,
  QuizshowWheelBonus,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
} from "../../shared/contracts/quizshow";
import {
  canSpinForNextRound,
  createWheelState,
  displayRoundNumber,
  displayWheelNumber,
  drawnWheelSliceRoundIndexes,
  drawWheelSpin,
  emptyWheelProgress,
  isInWheelRange,
  isQuizRoundKind,
  isWheelExhausted,
  isWheelRoundKind,
  isWheelSlicePlayed,
  isWheelSpinLanded,
  nextQuizshowStep,
  normaliseWheelRounds,
  playableRoundCount,
  progressCursorFields,
  quizshowRoundNumber,
  quizshowRoundTotal,
  toWheelView,
  unplannedWheelSliceRoundIndexes,
  wheelAngleModulo,
  wheelBonusViewForCursor,
  wheelRoundIndexOfRange,
  wheelSliceRoundIndexes,
  wheelSliceTones,
  wheelSpinEndAngle,
  wheelSpinLandsAt,
  wheelViewForCursor,
  withWheelSettingsDefaults,
  type QuizshowWheelProgress,
  type QuizshowWheelRoundRow,
} from "./quizshowWheel";

type WheelSettings = QuizshowWheelRoundRow["settings"];

function row(
  kind: QuizshowRoundKind,
  questionCount = 1,
  settings: WheelSettings = {},
  titleEn = `${kind} round`,
): QuizshowWheelRoundRow {
  return {
    kind,
    title: { en: titleEn, pt: titleEn },
    contentLabel: "none",
    settings,
    questions: Array.from(
      { length: questionCount },
      (_unused, questionIndex) => ({ questionIndex }),
    ),
  };
}

/**
 * The contract 3.2 example: [R0, W1(Auto, pick round), R2, R3, R4,
 * W5(sliceCount 2, pick question), R6, R7, R8]. Every R is a quiz row with one
 * question unless the case says otherwise.
 */
function contractRows(
  questionCounts: Partial<Record<number, number>> = {},
  bonusByRowIndex: Partial<Record<number, QuizshowWheelBonus>> = {},
): QuizshowWheelRoundRow[] {
  return Array.from({ length: 9 }, (_unused, rowIndex) => {
    const questionCount = questionCounts[rowIndex] ?? 1;
    const wheelBonus = bonusByRowIndex[rowIndex];
    if (rowIndex === 1) return row("wheel", 0);
    if (rowIndex === 5) {
      return row("wheel", 0, { wheelPick: "question", sliceCount: 2 });
    }
    return row(
      "quiz",
      questionCount,
      wheelBonus === undefined ? {} : { wheelBonus },
      `Round ${rowIndex}`,
    );
  });
}

/** [R0, R1, R2, W3 count 2, R4, R5, R6, R7]: R6 and R7 sit outside every range. */
const SPLIT_ROWS = [
  row("quiz"),
  row("quiz"),
  row("quiz"),
  row("wheel", 0, { sliceCount: 2 }),
  row("quiz"),
  row("quiz"),
  row("quiz"),
  row("quiz"),
];

function flatRows(rowCount: number): QuizshowWheelRoundRow[] {
  return Array.from({ length: rowCount }, () => row("quiz"));
}

function progressWith(
  overrides: Partial<QuizshowWheelProgress> = {},
): QuizshowWheelProgress {
  return { ...emptyWheelProgress(), ...overrides };
}

function scriptedRandom(values: number[]) {
  const limits: number[] = [];
  return {
    limits,
    integerBelow(limit: number) {
      limits.push(limit);
      return values.shift() ?? 0;
    },
  };
}

function cursorAt(
  phase: QuizshowPhase,
  roundIndex: number | null,
  phaseId = "7",
): QuizshowCursor {
  return {
    phaseId,
    status: "running",
    phase,
    roundIndex,
    questionIndex: null,
    roundCount: 6,
    phaseStartedAt: 1000,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
  };
}

function sliceWithBonus(
  roundIndex: number,
  wheelBonus: QuizshowWheelBonus,
): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: `Round ${roundIndex}`, pt: `Ronda ${roundIndex}` },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus,
    questionCount: 1,
    isPlayed: false,
  };
}

function slicesWithBonuses(
  bonuses: readonly QuizshowWheelBonus[],
): QuizshowWheelSlice[] {
  return bonuses.map((bonus, sliceIndex) => sliceWithBonus(sliceIndex, bonus));
}

function spinWith(
  overrides: Partial<QuizshowWheelSpin> = {},
): QuizshowWheelSpin {
  return {
    landedSliceIndex: 1,
    startedAt: 1000,
    durationMs: 5500,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
    ...overrides,
  };
}

describe("quizshowWheel settings and numbering", () => {
  it("kind guards", () => {
    expect(isWheelRoundKind("wheel")).toBe(true);
    expect(isWheelRoundKind("quiz")).toBe(false);
    expect(isQuizRoundKind("quiz")).toBe(true);
    expect(isQuizRoundKind("lie_detector")).toBe(false);
    expect(isQuizRoundKind("wheel")).toBe(false);
  });

  it("fills missing wheel settings and keeps present ones", () => {
    const stored = { timeLimitSeconds: 20 };
    expect(withWheelSettingsDefaults(stored)).toEqual({
      timeLimitSeconds: 20,
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
    expect(stored).toEqual({ timeLimitSeconds: 20 });
    expect(withWheelSettingsDefaults({ wheelBonus: 500 }).wheelBonus).toBe(500);
    expect(
      withWheelSettingsDefaults({
        wheelBonus: 250,
        wheelPick: "question",
        sliceCount: 3,
      }),
    ).toEqual({ wheelBonus: 250, wheelPick: "question", sliceCount: 3 });
  });

  it("counts and numbers rows without wheels", () => {
    const rows = contractRows();
    expect(playableRoundCount(rows)).toBe(7);
    expect(displayRoundNumber(rows, 2)).toBe(2);
    expect(displayRoundNumber(rows, 6)).toBe(5);
    expect(displayWheelNumber(rows, 1)).toBe(1);
    expect(displayWheelNumber(rows, 5)).toBe(2);
  });

  it("wraps angles to a positive remainder", () => {
    expect(wheelAngleModulo(400, 360)).toBe(40);
    expect(wheelAngleModulo(-30, 360)).toBe(330);
    expect(wheelAngleModulo(-30 - 360, 360)).toBe(330);
    expect(wheelAngleModulo(0, 360)).toBe(0);
    expect(wheelAngleModulo(360, 360)).toBe(0);
  });

  it("tones bonus slices and alternates the rest around the circle", () => {
    expect(wheelSliceTones(slicesWithBonuses([0, 500, 0, 0, 250, 0]))).toEqual([
      "rose",
      "bonus",
      "plum",
      "rose",
      "bonus",
      "plum",
    ]);
    expect(wheelSliceTones([])).toEqual([]);
  });

  it("gives a bonus slice that follows a bonus slice the second bonus tone", () => {
    expect(wheelSliceTones(slicesWithBonuses([500, 500, 0]))).toEqual([
      "bonus",
      "bonusAlt",
      "plum",
    ]);
    expect(wheelSliceTones(slicesWithBonuses([250, 500, 1000, 0, 0]))).toEqual([
      "bonus",
      "bonusAlt",
      "bonus",
      "plum",
      "rose",
    ]);
  });

  it("treats the last and the first slice as neighbours", () => {
    expect(wheelSliceTones(slicesWithBonuses([500, 0, 0, 250]))).toEqual([
      "bonusAlt",
      "plum",
      "rose",
      "bonus",
    ]);
    expect(wheelSliceTones(slicesWithBonuses([0, 0, 0, 500, 0]))).toEqual([
      "rose",
      "plum",
      "rose",
      "bonus",
      "plum",
    ]);
  });

  it("never repeats a tone between neighbours on a wheel with both families", () => {
    const wheels: QuizshowWheelBonus[][] = [
      [0, 500, 0, 0, 250, 0],
      [500, 500, 0],
      [500, 0, 0, 250],
      [0, 0, 0, 500, 0],
      [500, 0, 500, 500, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 500],
    ];
    for (const bonuses of wheels) {
      const tones = wheelSliceTones(slicesWithBonuses(bonuses));
      tones.forEach((tone, sliceIndex) => {
        const previousTone = tones.at(sliceIndex - 1);
        expect(tone).not.toBe(previousTone);
      });
    }
  });

  it("alternates a wheel of one family, which only an odd count can repeat across the wrap", () => {
    expect(wheelSliceTones(slicesWithBonuses([0, 0, 0, 0]))).toEqual([
      "plum",
      "rose",
      "plum",
      "rose",
    ]);
    expect(wheelSliceTones(slicesWithBonuses([500, 250]))).toEqual([
      "bonus",
      "bonusAlt",
    ]);
    expect(wheelSliceTones(slicesWithBonuses([0, 0, 0]))).toEqual([
      "plum",
      "rose",
      "plum",
    ]);
    expect(wheelSliceTones(slicesWithBonuses([0]))).toEqual(["plum"]);
    expect(wheelSliceTones(slicesWithBonuses([500]))).toEqual(["bonus"]);
  });
});

describe("quizshowWheel ranges and normalisation", () => {
  it("walks a slice range up to the next wheel, the cap or the end", () => {
    const rows = contractRows();
    expect(wheelSliceRoundIndexes(rows, 1)).toEqual([2, 3, 4]);
    expect(wheelSliceRoundIndexes(rows, 5)).toEqual([6, 7]);
    expect(wheelSliceRoundIndexes(rows, 0)).toEqual([]);
    expect(wheelSliceRoundIndexes(rows, 99)).toEqual([]);
    expect(wheelSliceRoundIndexes([row("quiz"), row("wheel", 0)], 1)).toEqual(
      [],
    );
    expect(
      wheelSliceRoundIndexes(
        [row("wheel", 0), row("wheel", 0), row("quiz")],
        0,
      ),
    ).toEqual([]);
    expect(
      wheelSliceRoundIndexes([row("wheel", 0), ...flatRows(10)], 0),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("caps a stored slice count above the maximum at 8", () => {
    const rows = [row("wheel", 0, { sliceCount: 12 }), ...flatRows(10)];
    expect(wheelSliceRoundIndexes(rows, 0)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("cuts a fixed count short at the next wheel", () => {
    const rows = [
      row("wheel", 0, { sliceCount: 4 }),
      row("quiz"),
      row("quiz"),
      row("wheel", 0),
      row("quiz"),
    ];
    expect(wheelSliceRoundIndexes(rows, 0)).toEqual([1, 2]);
    expect(wheelRoundIndexOfRange(rows, 4)).toBe(3);
  });

  it("finds the wheel that holds a round", () => {
    const rows = contractRows();
    expect(wheelRoundIndexOfRange(rows, 3)).toBe(1);
    expect(wheelRoundIndexOfRange(rows, 7)).toBe(5);
    expect(wheelRoundIndexOfRange(rows, 8)).toBeNull();
    expect(wheelRoundIndexOfRange(rows, 0)).toBeNull();
    expect(wheelRoundIndexOfRange(rows, 1)).toBeNull();
    expect(isInWheelRange(rows, 6)).toBe(true);
    expect(isInWheelRange(rows, 8)).toBe(false);
  });

  it("normalises wheel rows and clears bonuses outside every range", () => {
    const input: QuizshowWheelRoundRow[] = [
      row("quiz", 1, { wheelBonus: 250, wheelPick: "question", sliceCount: 4 }),
      {
        ...row("wheel", 0, { wheelBonus: 500 }),
        contentLabel: "spicy",
      },
      row("quiz"),
      row("quiz", 1, { wheelBonus: 500 }),
      row("quiz"),
    ];
    const snapshotBefore = structuredClone(input);
    const normalised = normaliseWheelRounds(input);
    expect(input).toEqual(snapshotBefore);
    expect(normalised).not.toBe(input);
    expect(normalised[0]?.settings).toEqual({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
    expect(normalised[1]?.contentLabel).toBe("none");
    expect(normalised[1]?.settings.wheelBonus).toBe(0);
    expect(normalised[3]?.settings.wheelBonus).toBe(500);
    expect(normalised[2]?.settings).toEqual({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
    expect(normalised[0]).not.toBe(input[0]);
    expect(normalised[0]?.settings).not.toBe(input[0]?.settings);
  });

  it("fills the defaults first when a row lacks all three fields", () => {
    const normalised = normaliseWheelRounds([row("quiz"), row("wheel", 0)]);
    normalised.forEach((normalisedRow) => {
      expect(normalisedRow.settings).toEqual({
        wheelBonus: 0,
        wheelPick: "round",
        sliceCount: null,
      });
    });
  });
});

describe("quizshowWheel running order", () => {
  it("resolves the next step in running order", () => {
    const rows = contractRows();
    expect(nextQuizshowStep(rows, emptyWheelProgress())).toEqual({
      kind: "round",
      roundIndex: 0,
    });
    expect(
      nextQuizshowStep(rows, progressWith({ playedRoundIndexes: [0] })),
    ).toEqual({ kind: "wheel", wheelRoundIndex: 1 });
    expect(
      nextQuizshowStep(
        rows,
        progressWith({
          playedRoundIndexes: [0],
          closedWheelRoundIndexes: [1],
        }),
      ),
    ).toEqual({ kind: "wheel", wheelRoundIndex: 5 });
    expect(
      nextQuizshowStep(
        rows,
        progressWith({
          playedRoundIndexes: [0],
          closedWheelRoundIndexes: [1, 5],
        }),
      ),
    ).toEqual({ kind: "round", roundIndex: 8 });
    expect(
      nextQuizshowStep(
        rows,
        progressWith({
          playedRoundIndexes: [0, 8],
          closedWheelRoundIndexes: [1, 5],
        }),
      ),
    ).toEqual({ kind: "podium" });
    expect(
      nextQuizshowStep(rows, progressWith({ playedRoundIndexes: [0, 8] })),
    ).toEqual({ kind: "wheel", wheelRoundIndex: 1 });
  });

  it("lists unplanned candidates outside every range", () => {
    expect(
      unplannedWheelSliceRoundIndexes(
        flatRows(10),
        progressWith({ playedRoundIndexes: [0] }),
      ),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(
      unplannedWheelSliceRoundIndexes(
        contractRows(),
        progressWith({ playedRoundIndexes: [0] }),
      ),
    ).toEqual([8]);
  });

  it("offers the unplanned spin only on an eligible leaderboard", () => {
    const fourRows = flatRows(4);
    const afterFirst = progressWith({ playedRoundIndexes: [0] });
    expect(canSpinForNextRound(fourRows, afterFirst, "leaderboard")).toBe(true);
    expect(canSpinForNextRound(fourRows, afterFirst, "lobby")).toBe(false);
    expect(
      canSpinForNextRound(
        fourRows,
        progressWith({
          playedRoundIndexes: [0],
          wheel: createWheelState(fourRows, null, [1, 2]),
        }),
        "leaderboard",
      ),
    ).toBe(false);
    expect(canSpinForNextRound(contractRows(), afterFirst, "leaderboard")).toBe(
      false,
    );
    expect(
      canSpinForNextRound(
        flatRows(3),
        progressWith({ playedRoundIndexes: [0, 1] }),
        "leaderboard",
      ),
    ).toBe(false);
  });

  it("resumes the running order after an unplanned spin", () => {
    expect(
      nextQuizshowStep(
        SPLIT_ROWS,
        progressWith({ playedRoundIndexes: [0, 6] }),
      ),
    ).toEqual({ kind: "round", roundIndex: 1 });
    expect(
      unplannedWheelSliceRoundIndexes(
        SPLIT_ROWS,
        progressWith({ playedRoundIndexes: [0] }),
      ),
    ).toEqual([1, 2, 6, 7]);
  });

  it("counts rounds and round numbers with wheels", () => {
    const rows = contractRows();
    expect(quizshowRoundTotal(rows, emptyWheelProgress())).toBe(6);
    expect(
      quizshowRoundTotal(
        rows,
        progressWith({
          playedRoundIndexes: [0, 2],
          closedWheelRoundIndexes: [1],
        }),
      ),
    ).toBe(4);
    expect(
      quizshowRoundNumber(
        rows,
        progressWith({
          playedRoundIndexes: [0, 2],
          openedWheelRoundIndexes: [1, 5],
        }),
      ),
    ).toBe(3);
  });

  it("fills the four cursor fields", () => {
    const rows = contractRows();
    expect(progressCursorFields(rows, emptyWheelProgress(), "lobby")).toEqual({
      roundNumber: 0,
      roundCount: 6,
      upNext: { kind: "round", roundIndex: 0 },
      canSpinForNextRound: false,
    });
    expect(
      progressCursorFields(rows, emptyWheelProgress(), "read").upNext,
    ).toBeNull();
  });
});

describe("quizshowWheel state and spins", () => {
  it("creates a wheel state for each pick", () => {
    const rows = contractRows({ 6: 2, 7: 1 });
    expect(createWheelState(rows, 1, [2, 3, 4])).toEqual({
      wheelRoundIndex: 1,
      pick: "round",
      sliceRoundIndexes: [2, 3, 4],
      askedCounts: [0, 0, 0],
      pickedCount: 0,
      spinTotal: 3,
      spin: null,
      restAngle: 0,
      playingRoundIndex: null,
      baselineByEntrant: null,
    });
    expect(createWheelState(rows, 5, [6, 7])).toMatchObject({
      pick: "question",
      spinTotal: 3,
      askedCounts: [0, 0],
    });
    expect(createWheelState(rows, null, [8])).toMatchObject({
      pick: "round",
      wheelRoundIndex: null,
    });
  });

  it("marks slices played per pick and draws the rest", () => {
    const rows = contractRows({ 6: 2, 7: 1 });
    const roundWheel = createWheelState(rows, 1, [2, 3, 4]);
    const roundProgress = progressWith({
      playedRoundIndexes: [0, 3],
      wheel: roundWheel,
    });
    expect(isWheelSlicePlayed(rows, roundWheel, roundProgress, 3)).toBe(true);
    expect(isWheelSlicePlayed(rows, roundWheel, roundProgress, 2)).toBe(false);
    expect(
      drawnWheelSliceRoundIndexes(rows, roundWheel, roundProgress),
    ).toEqual([2, 4]);

    const questionWheel = createWheelState(rows, 5, [6, 7]);
    const partlyAsked = { ...questionWheel, askedCounts: [2, 0] };
    expect(
      drawnWheelSliceRoundIndexes(rows, partlyAsked, emptyWheelProgress()),
    ).toEqual([7]);
    expect(isWheelSlicePlayed(rows, partlyAsked, emptyWheelProgress(), 6)).toBe(
      true,
    );
    const allAsked = { ...questionWheel, askedCounts: [2, 1] };
    expect(isWheelExhausted(rows, allAsked, emptyWheelProgress())).toBe(true);
    expect(isWheelExhausted(rows, partlyAsked, emptyWheelProgress())).toBe(
      false,
    );
  });

  it("draws a spin in the fixed order", () => {
    const random = scriptedRandom([2, 1, 737]);
    const spin = drawWheelSpin({
      drawnCount: 4,
      startAngle: 135,
      now: 10_000,
      random,
    });
    expect(spin).toEqual({
      landedSliceIndex: 2,
      startedAt: 10_000,
      durationMs: 5500,
      turns: 6,
      jitterSeed: 737,
      startAngle: 135,
    });
    expect(random.limits).toEqual([4, 2, 1001]);
  });

  it("refuses to draw a spin with no slices", () => {
    expect(() =>
      drawWheelSpin({
        drawnCount: 0,
        startAngle: 0,
        now: 0,
        random: scriptedRandom([]),
      }),
    ).toThrow("Pulse Live cannot spin a wheel with no slices.");
  });

  it("computes the end angle with the pointer at nine o'clock", () => {
    expect(wheelSpinEndAngle(spinWith(), 4)).toBeCloseTo(1935, 9);
    expect(wheelSpinEndAngle(spinWith({ startAngle: 135 }), 4)).toBeCloseTo(
      1935,
      9,
    );
    expect(wheelSpinEndAngle(spinWith({ startAngle: 400 }), 4)).toBeCloseTo(
      2295,
      9,
    );
    expect(wheelSpinEndAngle(spinWith({ jitterSeed: 1000 }), 4)).toBeCloseTo(
      1966.5,
      9,
    );
    expect(wheelSpinEndAngle(spinWith({ jitterSeed: 0 }), 4)).toBeCloseTo(
      1903.5,
      9,
    );
    expect(wheelSpinEndAngle(spinWith({ landedSliceIndex: 2 }), 3)).toBeCloseTo(
      1800 + wheelAngleModulo(270 - 300, 360),
      9,
    );
    expect(wheelSpinEndAngle(spinWith({ landedSliceIndex: 2 }), 3)).toBeCloseTo(
      2130,
      9,
    );
  });

  it("starts a negative angle from the turn below zero", () => {
    // base = -30 - 330 = -360; slice 0 of 4 lands at 270 - 45 = 225.
    expect(
      wheelSpinEndAngle(spinWith({ landedSliceIndex: 0, startAngle: -30 }), 4),
    ).toBeCloseTo(1665, 9);
    expect(
      wheelSpinEndAngle(spinWith({ landedSliceIndex: 1, startAngle: -30 }), 4),
    ).toBeCloseTo(1575, 9);
  });

  it("lands at the stop with an optional tolerance", () => {
    const spin = spinWith({ startedAt: 1000 });
    const landsAt = wheelSpinLandsAt(spin);
    expect(landsAt).toBe(6500);
    expect(isWheelSpinLanded(spin, landsAt - 1)).toBe(false);
    expect(isWheelSpinLanded(spin, landsAt)).toBe(true);
    expect(isWheelSpinLanded(spin, landsAt - 250, 250)).toBe(true);
    expect(isWheelSpinLanded(spin, landsAt - 251, 250)).toBe(false);
  });
});

describe("quizshowWheel views", () => {
  it("builds the wheel view from the rows and the state", () => {
    const rows = [
      ...contractRows({ 2: 2 }, { 2: 250 }).slice(0, 3),
      row("lie_detector", 1, { wheelBonus: 500 }, "Lies"),
      ...contractRows({ 4: 3 }).slice(4),
    ];
    const wheel = {
      ...createWheelState(rows, 1, [2, 3, 4]),
      pickedCount: 1,
    };
    const progress = progressWith({ playedRoundIndexes: [0, 3], wheel });
    const view = toWheelView(rows, wheel, progress, "wheel");
    expect(view.slices.map((slice) => slice.roundIndex)).toEqual([2, 3, 4]);
    expect(view.slices[1]).toEqual({
      roundIndex: 3,
      title: { en: "Lies", pt: "Lies" },
      kind: "lie_detector",
      contentLabel: "none",
      wheelBonus: 500,
      questionCount: 1,
      isPlayed: true,
    });
    expect(view.slices[2]?.questionCount).toBe(3);
    expect(view).toMatchObject({
      wheelRoundIndex: 1,
      pick: "round",
      spinNumber: 2,
      spinTotal: 3,
      spin: null,
      playingRoundIndex: null,
    });
    expect(toWheelView(rows, wheel, progress, "round_intro").spinNumber).toBe(
      1,
    );
  });

  it("builds pick question and unplanned slices", () => {
    const rows = contractRows({ 6: 3, 7: 2 }, { 7: 250 });
    const questionWheel = {
      ...createWheelState(rows, 5, [6, 7]),
      askedCounts: [1, 0],
    };
    const questionView = toWheelView(
      rows,
      questionWheel,
      progressWith({ wheel: questionWheel }),
      "wheel",
    );
    expect(questionView.slices.map((slice) => slice.questionCount)).toEqual([
      2, 2,
    ]);
    expect(questionView.slices[1]?.wheelBonus).toBe(250);

    const bonusRows = contractRows({}, { 8: 500 });
    const unplanned = createWheelState(bonusRows, null, [2, 8]);
    const unplannedView = toWheelView(
      bonusRows,
      unplanned,
      progressWith({ wheel: unplanned }),
      "wheel",
    );
    expect(unplannedView.wheelRoundIndex).toBeNull();
    expect(unplannedView.slices.map((slice) => slice.wheelBonus)).toEqual([
      0, 0,
    ]);
  });

  it("shows the wheel view in the wheel phase and on wheel questions only", () => {
    const rows = contractRows();
    const questionWheel = {
      ...createWheelState(rows, 5, [6, 7]),
      playingRoundIndex: 6,
    };
    const questionProgress = progressWith({ wheel: questionWheel });
    expect(
      wheelViewForCursor(rows, questionProgress, cursorAt("wheel", 5)),
    ).not.toBeNull();
    expect(
      wheelViewForCursor(rows, questionProgress, cursorAt("open", 6))
        ?.playingRoundIndex,
    ).toBe(6);

    const roundWheel = {
      ...createWheelState(rows, 1, [2, 3, 4]),
      playingRoundIndex: 2,
    };
    expect(
      wheelViewForCursor(
        rows,
        progressWith({ wheel: roundWheel }),
        cursorAt("open", 2),
      ),
    ).toBeNull();
    expect(
      wheelViewForCursor(rows, questionProgress, cursorAt("leaderboard", 5)),
    ).toBeNull();
    expect(
      wheelViewForCursor(rows, emptyWheelProgress(), cursorAt("wheel", 5)),
    ).toBeNull();
  });

  it("shows the bonus only while its phase is current", () => {
    const award = {
      phaseId: "7",
      points: 500 as const,
      pick: "round" as const,
      sliceRoundIndex: 2,
      sliceTitle: { en: "Music", pt: "Musica" },
      winners: [
        {
          entrantId: "player-1",
          kind: "player" as const,
          name: "Ana",
          colorKey: null,
        },
      ],
    };
    const progress = progressWith({ wheelBonusAward: award });
    const view = wheelBonusViewForCursor(progress, cursorAt("leaderboard", 2));
    expect(view).toEqual({
      points: 500,
      pick: "round",
      sliceRoundIndex: 2,
      sliceTitle: { en: "Music", pt: "Musica" },
      winners: award.winners,
    });
    expect(view).not.toHaveProperty("phaseId");
    expect(
      wheelBonusViewForCursor(progress, cursorAt("leaderboard", 2, "8")),
    ).toBeNull();
    expect(
      wheelBonusViewForCursor(emptyWheelProgress(), cursorAt("leaderboard", 2)),
    ).toBeNull();
  });
});
