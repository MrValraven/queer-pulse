import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowPhase,
  QuizshowRoundCard,
  QuizshowScreenState,
  QuizshowStateBase,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowTranslate } from "../stage/quizshowWheelCopy";
import { quizshowPrimaryControlOf } from "./quizshowPrimaryControl";

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
  }),
);

function stateWith(
  phase: QuizshowPhase,
  wheel: QuizshowWheelView | null = null,
  overrides: Partial<QuizshowStateBase> = {},
): Pick<QuizshowStateBase, "cursor" | "wheel" | "rounds" | "screenLanguage"> {
  return {
    cursor: cursorIn(phase),
    wheel,
    rounds: ROUND_CARDS,
    screenLanguage: "en",
    ...overrides,
  };
}

describe("quizshowPrimaryControlOf", () => {
  it("starts the game in the lobby", () => {
    expect(quizshowPrimaryControlOf(stateWith("lobby"), 0, translate)).toEqual({
      name: "host:start",
      labelKey: "quizshow:remote.start",
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
      labelKey: "quizshow:remote.wheel.startRound",
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
      labelKey: "quizshow:remote.wheel.startRound",
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
      labelKey: "quizshow:remote.wheel.startRound",
      labelValues: { title: "Round 2" },
    });
  });

  it("goes to the next step everywhere else", () => {
    const phases: QuizshowPhase[] = ["leaderboard", "scores", "open", "reveal"];
    for (const phase of phases) {
      expect(quizshowPrimaryControlOf(stateWith(phase), 0, translate)).toEqual({
        name: "host:next",
        labelKey: "quizshow:remote.next",
        isBlocked: false,
      });
    }
  });

  it("keeps the next button on a leaderboard that can spin for the next round", () => {
    const state = stateWith("leaderboard", null, {
      cursor: cursorIn("leaderboard", { canSpinForNextRound: true }),
    });
    expect(quizshowPrimaryControlOf(state, 0, translate)).toMatchObject({
      name: "host:next",
      labelKey: "quizshow:remote.next",
    });
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
