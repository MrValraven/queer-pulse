import { act, cleanup, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";
import {
  QUIZSHOW_LIMITS,
  type QuizshowWheelBonusView,
  type QuizshowWheelSlice,
  type QuizshowWheelSpin,
  type QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { wheelSpinLandsAt } from "../quizshowWheel";
import { QUIZSHOW_WHEEL_PANEL_DELAY_MS } from "../stage/quizshowWheelMotion";
import type { QuizshowRoundKindRows } from "../stage/quizshowWheelCopy";
import { QuizshowScreenWheel } from "./QuizshowScreenWheel";
import { QuizshowScreenWheelBonus } from "./QuizshowScreenWheelBonus";

const NOW = 1_000_000;

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

/** Five slices, Eurovision played: Music (+500), Queer history, Drag Name Generator and Ballroom are drawn. */
const SLICES: QuizshowWheelSlice[] = [
  sliceOf(1, "Music", { wheelBonus: 500 }),
  sliceOf(2, "Queer history", { questionCount: 10 }),
  sliceOf(3, "Eurovision", { isPlayed: true }),
  sliceOf(4, "Drag Name Generator", { kind: "drag_name", questionCount: 3 }),
  sliceOf(5, "Ballroom", { questionCount: 6, contentLabel: "spicy" }),
];

/** The session's rows: the wheel at 0, then one quiz row per slice (indexes 1 to 8). */
const ROUNDS: QuizshowRoundKindRows = [
  { kind: "wheel" },
  ...Array.from({ length: 8 }, () => ({ kind: "quiz" as const })),
];

function spinStartedAt(
  startedAt: number,
  landedSliceIndex = 0,
): QuizshowWheelSpin {
  return {
    landedSliceIndex,
    startedAt,
    durationMs: QUIZSHOW_LIMITS.wheelSpinMs,
    turns: 5,
    jitterSeed: 500,
    startAngle: 0,
  };
}

function wheelOf(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick: "round",
    slices: SLICES,
    spinNumber: 2,
    spinTotal: 5,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function bonusFor(names: string[]): QuizshowWheelBonusView {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 1,
    sliceTitle: { en: "Music", pt: "Música" },
    winners: names.map((name) => ({
      entrantId: `player-${name}`,
      kind: "player",
      name,
      colorKey: null,
    })),
  };
}

interface WheelRenderOptions {
  wheel?: QuizshowWheelView;
  wheelBonus?: QuizshowWheelBonusView | null;
  joinCode?: string | null;
}

function wheelTree({
  wheel = wheelOf(),
  wheelBonus = null,
  joinCode = "4KQ7",
}: WheelRenderOptions = {}) {
  return (
    <TestProviders>
      <MotionProvider>
        <QuizshowScreenWheel
          wheel={wheel}
          wheelBonus={wheelBonus}
          rounds={ROUNDS}
          joinCode={joinCode}
          language="en"
          playMode="solo"
          clockOffsetMs={0}
          size="screen"
        />
      </MotionProvider>
    </TestProviders>
  );
}

async function renderWheel(options: WheelRenderOptions = {}) {
  const rendered = render(wheelTree(options));
  await awaitCatalogUnderFakeTimers("quizshow");
  const root = rendered.container.querySelector<HTMLElement>(
    "[data-quizshow-screen-wheel]",
  );
  if (root === null) throw new Error("The wheel view is missing.");
  return { ...rendered, root };
}

/** The result panel's heading text, read from the DOM so a hidden panel reads too. */
function resultTitleOf(root: HTMLElement): string | null | undefined {
  return panelOf(root, "result").querySelector("h1")?.textContent;
}

function panelOf(root: HTMLElement, panel: "choose" | "result"): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[data-panel="${panel}"]`);
  if (element === null) throw new Error(`The ${panel} panel is missing.`);
  return element;
}

function rowOf(root: HTMLElement, title: string): HTMLElement {
  const rows = Array.from(
    panelOf(root, "choose").querySelectorAll<HTMLElement>("li"),
  );
  const row = rows.find((element) => element.textContent?.includes(title));
  if (row === undefined) throw new Error(`No row for ${title}.`);
  return row;
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

/** Fakes the clock and the frame loop, and stubs Web Animations (jsdom has none; the disc kicks its pointer through it). */
function installFakeClock() {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    vi.setSystemTime(NOW);
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({ cancel: vi.fn() })),
    });
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(Element.prototype, "animate");
    vi.useRealTimers();
  });
}

describe("QuizshowScreenWheel", () => {
  installFakeClock();

  it("shows the spin pill and the join code", async () => {
    const { root } = await renderWheel();
    expect(within(root).getByText("Wheel · spin 2 of 5")).toBeInTheDocument();
    expect(within(root).getByText(/Join at/)).toBeInTheDocument();
    expect(within(root).getByText("4KQ7").tagName).toBe("STRONG");
  });

  it("shows the next round pill on an unplanned wheel", async () => {
    const { root } = await renderWheel({
      wheel: wheelOf({ wheelRoundIndex: null, spinNumber: 1, spinTotal: 1 }),
    });
    expect(within(root).getByText("Wheel · next round")).toBeInTheDocument();
    expect(within(root).queryByText(/spin/)).not.toBeInTheDocument();
  });

  it("draws a wheel at rest with no spin", async () => {
    const { root } = await renderWheel();
    const spinner = root.querySelector<SVGSVGElement>(
      "[data-quizshow-wheel-spinner]",
    );
    expect(spinner?.style.transform).toBe("rotate(0deg)");
    expect(panelOf(root, "choose").getAttribute("data-shown")).toBe("true");
    expect(panelOf(root, "result").getAttribute("aria-hidden")).toBe("true");
    expect(panelOf(root, "result").hasAttribute("inert")).toBe(true);
  });

  it("leaves the join line out without a code", async () => {
    const { root } = await renderWheel({ joinCode: null });
    expect(within(root).queryByText(/Join at/)).not.toBeInTheDocument();
  });

  it("lists the drawn slices with their chips and the played line", async () => {
    const { root } = await renderWheel();
    const choosePanel = panelOf(root, "choose");
    expect(
      within(choosePanel).getByText("Still on the wheel"),
    ).toBeInTheDocument();
    expect(choosePanel.querySelectorAll("li")).toHaveLength(4);
    expect(within(rowOf(root, "Music")).getByText("+500")).toBeInTheDocument();
    expect(within(rowOf(root, "Music")).getByText("Quiz")).toBeInTheDocument();
    expect(
      within(rowOf(root, "Drag Name Generator")).getByText("Party"),
    ).toBeInTheDocument();
    expect(within(rowOf(root, "Ballroom")).queryByText("Spicy")).toBeNull();
    const played = within(choosePanel).getByText(/Played:/);
    expect(played.querySelector("s")?.textContent).toBe("Eurovision");
  });

  it("shows the content chip on pick a question", async () => {
    const { root } = await renderWheel({
      wheel: wheelOf({ pick: "question" }),
    });
    expect(
      within(rowOf(root, "Ballroom")).getByText("Spicy"),
    ).toBeInTheDocument();
  });

  it("tightens the list at seven or more slices", async () => {
    const eightSlices = Array.from({ length: 8 }, (_slot, sliceIndex) =>
      sliceOf(sliceIndex + 1, `Category ${sliceIndex + 1}`),
    );
    const { root } = await renderWheel({
      wheel: wheelOf({ slices: eightSlices }),
    });
    expect(
      panelOf(root, "choose").querySelector("ul")?.getAttribute("data-density"),
    ).toBe("tight");
  });
});

describe("QuizshowScreenWheel landing", () => {
  installFakeClock();

  it("renders a landed spin as Up next at once", async () => {
    // Ruling R8: the landing shows the content label on a pick-a-round wheel too.
    const spicyMusicSlices = SLICES.map((slice) =>
      slice.roundIndex === 1
        ? { ...slice, contentLabel: "spicy" as const }
        : slice,
    );
    const { root } = await renderWheel({
      wheel: wheelOf({
        slices: spicyMusicSlices,
        spin: spinStartedAt(NOW - 10_000),
      }),
    });
    const resultPanel = panelOf(root, "result");
    expect(resultPanel.getAttribute("data-shown")).toBe("true");
    expect(root.getAttribute("data-instant")).toBe("true");
    expect(within(resultPanel).getByText("Up next")).toBeInTheDocument();
    expect(within(resultPanel).getByRole("heading").textContent).toBe("Music");
    expect(
      within(resultPanel).getByText("Quiz round · 8 questions"),
    ).toBeInTheDocument();
    expect(within(resultPanel).getByText("Spicy")).toBeInTheDocument();
    expect(within(resultPanel).getByText("+500")).toBeInTheDocument();
    expect(
      within(resultPanel).getByText("to whoever wins this round"),
    ).toBeInTheDocument();
    expect(
      within(resultPanel).getByText("Starts when the host is ready"),
    ).toBeInTheDocument();
    expect(within(root).getByRole("status").textContent).toBe(
      "The wheel landed on Music",
    );
    expect(panelOf(root, "choose").getAttribute("aria-hidden")).toBe("true");
  });

  it("reads Round N for a slice with no title yet, on the disc, the list and the result panel", async () => {
    const untitledSlices = SLICES.map((slice) =>
      slice.roundIndex === 1
        ? { ...slice, title: { en: "", pt: "  " } }
        : slice,
    );
    const { root } = await renderWheel({
      wheel: wheelOf({
        slices: untitledSlices,
        spin: spinStartedAt(NOW - 10_000),
      }),
    });
    // Row 1 is the first playable row after the wheel at row 0.
    expect(resultTitleOf(root)).toBe("Round 1");
    expect(
      within(rowOf(root, "Round 1")).getByText("+500"),
    ).toBeInTheDocument();
    expect(
      root.querySelector("[data-quizshow-wheel-spinner]")?.textContent,
    ).toContain("Round 1");
    expect(within(root).getByRole("status").textContent).toBe(
      "The wheel landed on Round 1",
    );
  });

  it("shows Up next at once for a screen that arrives inside the panel delay", async () => {
    const spin = spinStartedAt(NOW - QUIZSHOW_LIMITS.wheelSpinMs - 100);
    const { root } = await renderWheel({ wheel: wheelOf({ spin }) });
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("true");
    expect(root.getAttribute("data-instant")).toBe("true");
    expect(resultTitleOf(root)).toBe("Music");
  });

  it("keeps the last result while a new spin turns, then shows the new one", async () => {
    const landedOnMusic = spinStartedAt(NOW - 10_000);
    const { root, rerender } = await renderWheel({
      wheel: wheelOf({ spin: landedOnMusic }),
    });
    expect(resultTitleOf(root)).toBe("Music");

    const spinAgain: QuizshowWheelSpin = {
      ...spinStartedAt(NOW, 3),
      startAngle: 123,
    };
    rerender(wheelTree({ wheel: wheelOf({ spin: spinAgain }) }));
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("false");
    expect(root.getAttribute("data-instant")).toBe("false");
    expect(resultTitleOf(root)).toBe("Music");
    expect(within(root).getByRole("status").textContent).toBe("");

    advance(
      wheelSpinLandsAt(spinAgain) + QUIZSHOW_WHEEL_PANEL_DELAY_MS - Date.now(),
    );
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("true");
    expect(resultTitleOf(root)).toBe("Ballroom");
    expect(within(root).getByRole("status").textContent).toBe(
      "The wheel landed on Ballroom",
    );
  });

  it("waits 250 ms after the stop to show Up next", async () => {
    const spin = spinStartedAt(NOW - 2000);
    const { root } = await renderWheel({ wheel: wheelOf({ spin }) });
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("false");
    expect(within(root).getByRole("status").textContent).toBe("");
    advance(wheelSpinLandsAt(spin) - Date.now());
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("false");
    advance(QUIZSHOW_WHEEL_PANEL_DELAY_MS);
    expect(panelOf(root, "result").getAttribute("data-shown")).toBe("true");
    expect(root.getAttribute("data-instant")).toBe("false");
    expect(panelOf(root, "choose").getAttribute("aria-hidden")).toBe("true");
    expect(within(root).getByRole("status").textContent).toBe(
      "The wheel landed on Music",
    );
  });

  it("words a question pick", async () => {
    const { root } = await renderWheel({
      wheel: wheelOf({
        pick: "question",
        spin: spinStartedAt(NOW - 10_000, 3),
      }),
    });
    const resultPanel = panelOf(root, "result");
    expect(within(resultPanel).getByRole("heading").textContent).toBe(
      "Ballroom",
    );
    expect(
      within(resultPanel).getByText("One quiz question from this category"),
    ).toBeInTheDocument();
    expect(within(resultPanel).getByText("Spicy")).toBeInTheDocument();

    cleanup();
    const musicLanding = await renderWheel({
      wheel: wheelOf({ pick: "question", spin: spinStartedAt(NOW - 10_000) }),
    });
    expect(
      within(panelOf(musicLanding.root, "result")).getByText(
        "to whoever wins this question",
      ),
    ).toBeInTheDocument();
  });

  it("announces the wheel bonus", async () => {
    const { root } = await renderWheel({ wheelBonus: bonusFor(["Ana"]) });
    const choosePanel = panelOf(root, "choose");
    expect(within(choosePanel).getByText("Wheel bonus")).toBeInTheDocument();
    expect(
      within(choosePanel).getByText("+500 to Ana for Music"),
    ).toBeInTheDocument();

    cleanup();
    const tied = render(
      <TestProviders>
        <MotionProvider>
          <QuizshowScreenWheelBonus
            bonus={bonusFor(["Ana", "Bo"])}
            rounds={ROUNDS}
            language="en"
            variant="board"
          />
        </MotionProvider>
      </TestProviders>,
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    expect(
      within(tied.container).getByText("+500 each to Ana and Bo for Music"),
    ).toBeInTheDocument();
  });
});
