import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowPhase,
  QuizshowPodiumEntry,
  QuizshowRoundCard,
  QuizshowScreenState,
  QuizshowStateBase,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowTranslate } from "../stage/quizshowWheelCopy";
import {
  quizshowPrimaryControlOf,
  type QuizshowPrimaryControlState,
} from "./quizshowPrimaryControl";

/** Answers the one catalog key the control may ask for. */
const translate: QuizshowTranslate = (key, options) =>
  key === "quizshow:rounds.untitled" ? `Round ${options?.number}` : key;

const SPIN_STARTED_AT = 10_000;
const SPIN_DURATION_MS = 5_500;
const SPIN_LANDS_AT = SPIN_STARTED_AT + SPIN_DURATION_MS;

function cursorIn(
  phase: QuizshowPhase,
  overrides: Partial<QuizshowCursor> = {},
): QuizshowCursor {
  return {
    phaseId: "7",
    status: "running",
    phase,
    roundIndex: 0,
    questionIndex: null,
    roundCount: 3,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
    ...overrides,
  };
}

function sliceTitled(
  roundIndex: number,
  title: QuizshowWheelSlice["title"],
  isPlayed = false,
): QuizshowWheelSlice {
  return {
    roundIndex,
    title,
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 4,
    isPlayed,
  };
}

const SPIN: QuizshowWheelSpin = {
  landedSliceIndex: 1,
  startedAt: SPIN_STARTED_AT,
  durationMs: SPIN_DURATION_MS,
  turns: 5,
  jitterSeed: 10,
  startAngle: 0,
};

function wheelWith(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick: "round",
    slices: [
      sliceTitled(1, { en: "Music", pt: "Musica" }),
      sliceTitled(2, { en: "Film", pt: "Cinema" }),
      sliceTitled(3, { en: "Pride history", pt: "Historia do orgulho" }),
    ],
    spinNumber: 1,
    spinTotal: 3,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

/** The session's round cards: the wheel at 0, then a quiz row per slice. */
const ROUND_CARDS: QuizshowStateBase["rounds"] = [0, 1, 2, 3].map(
  (roundIndex): QuizshowRoundCard => ({
    roundIndex,
    kind: roundIndex === 0 ? "wheel" : "quiz",
    title: { en: "", pt: "" },
    contentLabel: "none",
    questionCount: roundIndex === 0 ? 0 : 4,
    isJokerAllowed: true,
    isSpeedBonusOn: true,
    isWarmUp: false,
    talkSeconds: 0,
  }),
);

function stateWith(
  phase: QuizshowPhase,
  wheel: QuizshowWheelView | null = null,
  overrides: Partial<QuizshowPrimaryControlState> = {},
): QuizshowPrimaryControlState {
  return {
    cursor: cursorIn(phase),
    wheel,
    rounds: ROUND_CARDS,
    round: null,
    screenLanguage: "en",
    podium: null,
    question: null,
    ...overrides,
  };
}

/** Round 1 of the plain quiz: a quiz row at index 1 with four questions. */
const QUIZ_CARD: QuizshowRoundCard = {
  roundIndex: 1,
  kind: "quiz",
  title: { en: "Music", pt: "Musica" },
  contentLabel: "none",
  questionCount: 4,
  isJokerAllowed: true,
  isSpeedBonusOn: true,
  isWarmUp: false,
  talkSeconds: 0,
};

/** The state on question `questionIndex` (0-based) of QUIZ_CARD in `phase`. */
function questionState(
  phase: QuizshowPhase,
  questionIndex: number,
  overrides: Partial<QuizshowPrimaryControlState> = {},
): QuizshowPrimaryControlState {
  return stateWith(phase, null, {
    cursor: cursorIn(phase, { roundIndex: 1, questionIndex, roundNumber: 2 }),
    round: QUIZ_CARD,
    question: { type: "multiple_choice" },
    ...overrides,
  });
}

function podiumEntry(place: 1 | 2 | 3, name: string): QuizshowPodiumEntry {
  return {
    place,
    kind: "player",
    entrantId: `player-${name}`,
    name,
    colorKey: null,
    score: 1000 * (4 - place),
  };
}

const FULL_PODIUM: QuizshowPodiumEntry[] = [
  podiumEntry(1, "Ana"),
  podiumEntry(2, "Rui"),
  podiumEntry(3, "Bea"),
];

function podiumState(
  revealedCount: number | null,
  podium: QuizshowPodiumEntry[] = FULL_PODIUM,
  role: QuizshowPrimaryControlState["role"] = "host",
): QuizshowPrimaryControlState {
  return stateWith("podium", null, {
    cursor: cursorIn("podium", {
      roundIndex: null,
      podiumRevealedCount: revealedCount,
    }),
    podium,
    role,
  });
}

describe("quizshowPrimaryControlOf", () => {
  it("starts the game in the lobby", () => {
    expect(quizshowPrimaryControlOf(stateWith("lobby"), 0, translate)).toEqual({
      name: "host:start",
      labelKey: "quizshow:remote.primary.start",
      isBlocked: false,
    });
  });

  it("shows answers in review", () => {
    expect(quizshowPrimaryControlOf(stateWith("review"), 0, translate)).toEqual(
      {
        name: "host:showAnswers",
        labelKey: "quizshow:remote.showAnswers",
        isBlocked: false,
      },
    );
  });

  it("spins a wheel that has no spin yet", () => {
    expect(
      quizshowPrimaryControlOf(
        stateWith("wheel", wheelWith()),
        SPIN_LANDS_AT,
        translate,
      ),
    ).toEqual({
      name: "host:spin",
      labelKey: "quizshow:remote.wheel.spin",
      isBlocked: false,
    });
  });

  it("blocks the button while the spin is in the air", () => {
    const state = stateWith("wheel", wheelWith({ spin: SPIN }));
    expect(quizshowPrimaryControlOf(state, SPIN_STARTED_AT, translate)).toEqual(
      {
        name: "host:spin",
        labelKey: "quizshow:remote.wheel.spinning",
        isBlocked: true,
      },
    );
    expect(
      quizshowPrimaryControlOf(state, SPIN_LANDS_AT - 1, translate),
    ).toMatchObject({
      labelKey: "quizshow:remote.wheel.spinning",
      isBlocked: true,
    });
  });

  it("counts exactly landsAt as landed", () => {
    const state = stateWith("wheel", wheelWith({ spin: SPIN }));
    expect(quizshowPrimaryControlOf(state, SPIN_LANDS_AT, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.playSlice",
      labelValues: { title: "Film" },
      isBlocked: false,
    });
  });

  it("names the landed round after a pick a round spin", () => {
    const state = stateWith("wheel", wheelWith({ spin: SPIN }));
    expect(
      quizshowPrimaryControlOf(state, SPIN_LANDS_AT + 4_000, translate),
    ).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.playSlice",
      labelValues: { title: "Film" },
      isBlocked: false,
    });
  });

  it("skips played slices when it finds the landed one", () => {
    const wheel = wheelWith({ spin: { ...SPIN, landedSliceIndex: 0 } });
    wheel.slices[0] = sliceTitled(1, { en: "Music", pt: "Musica" }, true);
    expect(
      quizshowPrimaryControlOf(
        stateWith("wheel", wheel),
        SPIN_LANDS_AT,
        translate,
      ),
    ).toMatchObject({ labelValues: { title: "Film" } });
  });

  it("plays the question after a pick a question spin", () => {
    const state = stateWith(
      "wheel",
      wheelWith({ pick: "question", spin: SPIN }),
    );
    expect(quizshowPrimaryControlOf(state, SPIN_LANDS_AT, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.wheel.playQuestion",
      isBlocked: false,
    });
  });

  it("titles the slice in the screen language", () => {
    const state = stateWith("wheel", wheelWith({ spin: SPIN }), {
      screenLanguage: "pt",
    });
    expect(
      quizshowPrimaryControlOf(state, SPIN_LANDS_AT, translate).labelValues,
    ).toEqual({
      title: "Cinema",
    });
  });

  it("falls back to the English title when the Portuguese one is blank", () => {
    const wheel = wheelWith({ spin: SPIN });
    wheel.slices[1] = sliceTitled(2, { en: "Film", pt: "   " });
    const state = stateWith("wheel", wheel, { screenLanguage: "pt" });
    expect(
      quizshowPrimaryControlOf(state, SPIN_LANDS_AT, translate).labelValues,
    ).toEqual({
      title: "Film",
    });
  });

  it("titles an untitled slice as Round N on the Start button", () => {
    const wheel = wheelWith({ spin: SPIN });
    wheel.slices[1] = sliceTitled(2, { en: "", pt: "  " });
    expect(
      quizshowPrimaryControlOf(
        stateWith("wheel", wheel),
        SPIN_LANDS_AT,
        translate,
      ),
    ).toMatchObject({
      labelKey: "quizshow:remote.primary.playSlice",
      labelValues: { title: "Round 2" },
    });
  });
});

describe("quizshowPrimaryControlOf question steps", () => {
  it("names each question step", () => {
    const cases: Array<[QuizshowPhase, string]> = [
      ["round_intro", "quizshow:remote.primary.showFirstQuestion"],
      ["read", "quizshow:remote.primary.takeAnswers"],
      ["open", "quizshow:remote.primary.closeAnswers"],
      ["vote", "quizshow:remote.primary.closeAnswers"],
      ["write", "quizshow:remote.primary.closeWriting"],
    ];
    for (const [phase, labelKey] of cases) {
      expect(
        quizshowPrimaryControlOf(questionState(phase, 0), 0, translate),
        phase,
      ).toEqual({ name: "host:next", labelKey, isBlocked: false });
    }
  });

  it("shows scores after a quiz question's reveal", () => {
    expect(
      quizshowPrimaryControlOf(questionState("reveal", 0), 0, translate),
    ).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.showScores",
      isBlocked: false,
    });
  });

  it("counts the next question from the scores", () => {
    expect(
      quizshowPrimaryControlOf(questionState("scores", 1), 0, translate),
    ).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.nextQuestion",
      labelValues: { n: 3, total: 4 },
      isBlocked: false,
    });
  });

  it("ends the round from the last question's scores", () => {
    expect(
      quizshowPrimaryControlOf(questionState("scores", 3), 0, translate),
    ).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.endRound",
      labelValues: { n: 2 },
      isBlocked: false,
    });
  });

  it("goes straight to the next question after a poll's reveal", () => {
    const state = questionState("reveal", 0, { question: { type: "poll" } });
    expect(quizshowPrimaryControlOf(state, 0, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.nextQuestion",
      labelValues: { n: 2, total: 4 },
      isBlocked: false,
    });
  });

  it("skips the scores after a warm-up question and names the end of the warm-up", () => {
    const warmUpCard = { ...QUIZ_CARD, isWarmUp: true };
    expect(
      quizshowPrimaryControlOf(
        questionState("reveal", 0, { round: warmUpCard }),
        0,
        translate,
      ),
    ).toMatchObject({
      labelKey: "quizshow:remote.primary.nextQuestion",
      labelValues: { n: 2, total: 4 },
    });
    expect(
      quizshowPrimaryControlOf(
        questionState("reveal", 3, { round: warmUpCard }),
        0,
        translate,
      ),
    ).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.endWarmUp",
      isBlocked: false,
    });
  });

  it("moves a party reveal on with no scores step", () => {
    const partyCard: QuizshowRoundCard = { ...QUIZ_CARD, kind: "caption_this" };
    expect(
      quizshowPrimaryControlOf(
        questionState("reveal", 0, {
          round: partyCard,
          question: { type: "prompt" },
        }),
        0,
        translate,
      ),
    ).toMatchObject({
      labelKey: "quizshow:remote.primary.nextQuestion",
      labelValues: { n: 2, total: 4 },
    });
  });

  it("goes back to a pick a question wheel while it has questions left", () => {
    const playingWheel = wheelWith({ pick: "question", playingRoundIndex: 1 });
    expect(
      quizshowPrimaryControlOf(
        questionState("scores", 0, { wheel: playingWheel }),
        0,
        translate,
      ),
    ).toMatchObject({ labelKey: "quizshow:remote.primary.openWheel" });

    const emptyWheel = wheelWith({
      pick: "question",
      playingRoundIndex: 1,
      slices: [
        sliceTitled(1, { en: "Music", pt: "Musica" }, true),
        sliceTitled(2, { en: "Film", pt: "Cinema" }, true),
      ],
    });
    expect(
      quizshowPrimaryControlOf(
        questionState("scores", 0, { wheel: emptyWheel }),
        0,
        translate,
      ),
    ).toMatchObject({
      labelKey: "quizshow:remote.primary.endRound",
      labelValues: { n: 2 },
    });
  });
});

describe("quizshowPrimaryControlOf leaderboard and podium", () => {
  it("starts the next round by number and title from the leaderboard", () => {
    const state = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", {
        roundNumber: 1,
        upNext: { kind: "round", roundIndex: 2 },
      }),
      rounds: [
        ...ROUND_CARDS.slice(0, 2),
        { ...QUIZ_CARD, roundIndex: 2, title: { en: "Film", pt: "Cinema" } },
      ],
    });
    expect(quizshowPrimaryControlOf(state, 0, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.startRound",
      labelValues: { n: 2, title: "Film" },
      isBlocked: false,
    });
  });

  it("says Start round N alone for a next round with no title", () => {
    const state = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", {
        roundNumber: 1,
        upNext: { kind: "round", roundIndex: 2 },
      }),
    });
    expect(quizshowPrimaryControlOf(state, 0, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.startRoundUntitled",
      labelValues: { n: 2 },
      isBlocked: false,
    });
  });

  it("opens the wheel or shows the podium from the leaderboard", () => {
    const wheelNext = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", {
        upNext: { kind: "wheel", wheelRoundIndex: 0 },
      }),
    });
    expect(quizshowPrimaryControlOf(wheelNext, 0, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.openWheel",
      isBlocked: false,
    });
    const podiumNext = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", { upNext: { kind: "podium" } }),
    });
    expect(quizshowPrimaryControlOf(podiumNext, 0, translate)).toEqual({
      name: "host:next",
      labelKey: "quizshow:remote.primary.showPodium",
      isBlocked: false,
    });
  });

  it("keeps the leaderboard's own button when it can spin for the next round", () => {
    const state = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", {
        canSpinForNextRound: true,
        upNext: { kind: "podium" },
      }),
    });
    expect(quizshowPrimaryControlOf(state, 0, translate)).toMatchObject({
      name: "host:next",
      labelKey: "quizshow:remote.primary.showPodium",
    });
  });

  it("reveals the podium one place at a time, then finishes the game", () => {
    const labels = [0, 1, 2, 3].map(
      (revealedCount) =>
        quizshowPrimaryControlOf(podiumState(revealedCount), 0, translate)
          .labelKey,
    );
    expect(labels).toEqual([
      "quizshow:remote.primary.revealThird",
      "quizshow:remote.primary.revealSecond",
      "quizshow:remote.primary.revealWinner",
      "quizshow:remote.primary.finishGame",
    ]);
  });

  it("lets a tie share a podium step", () => {
    const tiedForSecond = [
      podiumEntry(1, "Ana"),
      podiumEntry(2, "Rui"),
      podiumEntry(2, "Bea"),
    ];
    const labels = [0, 1, 2].map(
      (revealedCount) =>
        quizshowPrimaryControlOf(
          podiumState(revealedCount, tiedForSecond),
          0,
          translate,
        ).labelKey,
    );
    expect(labels).toEqual([
      "quizshow:remote.primary.revealSecond",
      "quizshow:remote.primary.revealWinner",
      "quizshow:remote.primary.finishGame",
    ]);
  });

  it("finishes the game on a podium shown whole", () => {
    expect(
      quizshowPrimaryControlOf(podiumState(null), 0, translate).labelKey,
    ).toBe("quizshow:remote.primary.finishGame");
  });

  it("reads the next step from the host's whole podium", () => {
    // One place shown: the host's podium still holds 2nd and 1st.
    expect(
      quizshowPrimaryControlOf(podiumState(1), 0, translate).labelKey,
    ).toBe("quizshow:remote.primary.revealSecond");
  });

  it("never offers Finish the game on a withheld podium with places still hidden", () => {
    // The fallback for a screen state alone (Try it reads the host view first).
    const withheld = podiumState(1, [podiumEntry(3, "Bea")], "screen");
    expect(quizshowPrimaryControlOf(withheld, 0, translate).labelKey).not.toBe(
      "quizshow:remote.primary.finishGame",
    );
    const everyPlaceShown = podiumState(3, FULL_PODIUM, "screen");
    expect(
      quizshowPrimaryControlOf(everyPlaceShown, 0, translate).labelKey,
    ).toBe("quizshow:remote.primary.finishGame");
  });

  it("accepts a screen state and a host state in the same call", () => {
    const screenState = {
      role: "screen",
      cursor: cursorIn("lobby"),
      wheel: null,
      screenLanguage: "en",
    } as QuizshowScreenState;
    const hostState = {
      role: "host",
      cursor: cursorIn("review"),
      wheel: null,
      screenLanguage: "en",
    } as QuizshowHostState;
    const controls = [screenState, hostState].map((state) =>
      quizshowPrimaryControlOf(state, 0, translate),
    );
    expect(controls.map((control) => control.name)).toEqual([
      "host:start",
      "host:showAnswers",
    ]);
  });
});
