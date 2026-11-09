import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import {
  QUIZSHOW_LIMITS,
  type QuizshowMe,
  type QuizshowPlayMode,
  type QuizshowWheelBonusView,
  type QuizshowWheelPick,
  type QuizshowWheelSlice,
  type QuizshowWheelSpin,
  type QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { QuizshowPlayerWheel } from "./QuizshowPlayerWheel";

/** The session rows: the wheel at 0, then one quiz row per slice. */
const ROUNDS = [{ kind: "wheel" }, { kind: "quiz" }, { kind: "quiz" }] as const;

const SPIN_AGE_LANDED_MS = 60_000;
const CHIPS_TEST_ID = "quizshow-wheel-chips";

function sliceOf(
  roundIndex: number,
  title: string,
  overrides: Partial<QuizshowWheelSlice> = {},
): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: title, pt: title },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 8,
    isPlayed: false,
    ...overrides,
  };
}

function spinStartedAt(startedAt: number): QuizshowWheelSpin {
  return {
    landedSliceIndex: 0,
    startedAt,
    durationMs: QUIZSHOW_LIMITS.wheelSpinMs,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
  };
}

function wheelOf(
  spin: QuizshowWheelSpin | null,
  pick: QuizshowWheelPick = "round",
  musicOverrides: Partial<QuizshowWheelSlice> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick,
    slices: [
      sliceOf(1, "Music", { wheelBonus: 500, ...musicOverrides }),
      sliceOf(2, "Queer history"),
    ],
    spinNumber: 1,
    spinTotal: 2,
    spin,
    playingRoundIndex: null,
  };
}

const landedSpin = (): QuizshowWheelSpin =>
  spinStartedAt(Date.now() - SPIN_AGE_LANDED_MS);

const ME: QuizshowMe = {
  playerId: "player-me",
  screenName: "Ana",
  isAvatarShown: true,
  hasExtraTime: false,
  teamId: "team-1",
  isCohostPlayer: false,
  score: 1200,
  streak: 0,
  hasUsedJoker: false,
  jokerRoundIndex: null,
};

function bonusFor(
  entrantId: string,
  kind: "player" | "team",
  name: string,
): QuizshowWheelBonusView {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 1,
    sliceTitle: { en: "Music", pt: "Musica" },
    winners: [{ entrantId, kind, name, colorKey: null }],
  };
}

async function renderWheel(
  wheel: QuizshowWheelView,
  options: {
    wheelBonus?: QuizshowWheelBonusView | null;
    playMode?: QuizshowPlayMode;
  } = {},
) {
  render(
    <TestProviders>
      <MotionProvider>
        <QuizshowPlayerWheel
          wheel={wheel}
          wheelBonus={options.wheelBonus ?? null}
          rounds={ROUNDS}
          me={ME}
          playMode={options.playMode ?? "solo"}
          language="en"
          clockOffsetMs={0}
          phaseId="phase-1"
        />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
}

beforeAll(() => {
  // jsdom has no Element.animate; the disc's pointer kicks call it.
  if (typeof Element.prototype.animate !== "function") {
    Element.prototype.animate = vi.fn();
  }
});

afterEach(cleanup);

describe("QuizshowPlayerWheel", () => {
  it("waits for the host", async () => {
    await renderWheel(wheelOf(null));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The wheel spins when the host is ready",
    );
  });

  it("says the wheel is spinning", async () => {
    await renderWheel(wheelOf(spinStartedAt(Date.now())));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The wheel is spinning",
    );
    expect(screen.queryByTestId(CHIPS_TEST_ID)).not.toBeInTheDocument();
  });

  it("names what is up next with its chips", async () => {
    await renderWheel(wheelOf(landedSpin()));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Up next: Music",
    );
    expect(
      within(screen.getByTestId(CHIPS_TEST_ID)).getByText("+500 bonus"),
    ).toBeInTheDocument();
  });

  it("names an untitled slice Round N in Up next", async () => {
    const wheel = wheelOf(landedSpin());
    wheel.slices[0] = sliceOf(1, "", { wheelBonus: 500 });
    await renderWheel(wheel);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Up next: Round 1",
    );
  });

  it("shows the content chip on a question pick", async () => {
    await renderWheel(
      wheelOf(landedSpin(), "question", { contentLabel: "spicy" }),
    );
    expect(
      within(screen.getByTestId(CHIPS_TEST_ID)).getByText("Spicy"),
    ).toBeInTheDocument();
  });

  it("leaves the content chip off a round pick", async () => {
    await renderWheel(
      wheelOf(landedSpin(), "round", { contentLabel: "spicy" }),
    );
    expect(
      within(screen.getByTestId(CHIPS_TEST_ID)).queryByText("Spicy"),
    ).not.toBeInTheDocument();
  });

  it("gives a solo winner their own moment", async () => {
    await renderWheel(wheelOf(null), {
      wheelBonus: bonusFor("player-me", "player", "Ana"),
    });
    expect(screen.getByText("You won the wheel bonus")).toBeInTheDocument();
    expect(screen.getByText("+500 for Music")).toBeInTheDocument();
  });

  it("gives a team its own moment", async () => {
    await renderWheel(wheelOf(null), {
      playMode: "teams",
      wheelBonus: bonusFor("team-1", "team", "Pink"),
    });
    expect(
      screen.getByText("Your team won the wheel bonus"),
    ).toBeInTheDocument();
    expect(screen.getByText("+500 for Music")).toBeInTheDocument();
  });

  it("tells everyone else who won", async () => {
    await renderWheel(wheelOf(null), {
      wheelBonus: bonusFor("player-other", "player", "Ana"),
    });
    expect(screen.getByText("Wheel bonus")).toBeInTheDocument();
    expect(screen.getByText("+500 to Ana for Music")).toBeInTheDocument();
    expect(screen.queryByText(/You won/)).not.toBeInTheDocument();
  });
});
