import type { ReactNode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../test/awaitCatalogUnderFakeTimers";
import {
  QUIZSHOW_LIMITS,
  type QuizshowWheelSlice,
  type QuizshowWheelSpin,
} from "../../../shared/contracts/quizshow";
import { wheelSpinEndAngle, wheelSpinLandsAt } from "../quizshowWheel";
import { QuizshowStageWheel } from "./QuizshowStageWheel";
import { QUIZSHOW_WHEEL_PANEL_DELAY_MS } from "./quizshowWheelMotion";
import type { QuizshowStageSize } from "./quizshowText";

/** The session rows: the wheel at 0, then one quiz row per slice. */
const ROUNDS = [
  { kind: "wheel" },
  { kind: "quiz" },
  { kind: "quiz" },
  { kind: "quiz" },
] as const;

const NOW = 1_000_000;
const FRAME_MS = 16;
const DRAWN_COUNT = 3;

function sliceOf(
  roundIndex: number,
  title: string,
  wheelBonus: QuizshowWheelSlice["wheelBonus"] = 0,
): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: title, pt: title },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus,
    questionCount: 8,
    isPlayed: false,
  };
}

const SLICES: QuizshowWheelSlice[] = [
  sliceOf(1, "Music", 500),
  sliceOf(2, "Queer history"),
  sliceOf(3, "Ballroom"),
];

function spinStartedAt(startedAt: number): QuizshowWheelSpin {
  return {
    landedSliceIndex: 1,
    startedAt,
    durationMs: QUIZSHOW_LIMITS.wheelSpinMs,
    turns: 5,
    jitterSeed: 500,
    startAngle: 40,
  };
}

function wheelTree(
  spin: QuizshowWheelSpin | null,
  isReducedMotion = false,
  extra: ReactNode = null,
  size: QuizshowStageSize = "screen",
) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <QuizshowStageWheel
          slices={SLICES}
          rounds={ROUNDS}
          spin={spin}
          clockOffsetMs={0}
          language="en"
          size={size}
        />
        {extra}
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

async function renderWheel(
  spin: QuizshowWheelSpin | null,
  isReducedMotion = false,
) {
  const rendered = render(wheelTree(spin, isReducedMotion));
  await awaitCatalogUnderFakeTimers("quizshow");
  return rendered;
}

function wheelRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("[data-quizshow-wheel]");
  if (root === null) throw new Error("The wheel root is missing.");
  return root;
}

function spinnerOf(container: HTMLElement): SVGSVGElement {
  const spinner = container.querySelector<SVGSVGElement>(
    "[data-quizshow-wheel-spinner]",
  );
  if (spinner === null) throw new Error("The spinner layer is missing.");
  return spinner;
}

function angleOf(container: HTMLElement): number {
  const match = /rotate\((-?[\d.e+-]+)deg\)/.exec(
    spinnerOf(container).style.transform,
  );
  if (match?.[1] === undefined) throw new Error("The spinner has no angle.");
  return Number(match[1]);
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

/**
 * Fakes the frame clock at NOW and stubs Element.animate for every test in
 * the calling describe block. jsdom has no Web Animations, so the pointer
 * kick is asserted through the returned holder's stub.
 */
interface WheelTestClock {
  animateStub: ReturnType<typeof vi.fn>;
}

function installWheelTestClock(): WheelTestClock {
  const holder: WheelTestClock = { animateStub: vi.fn() };

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
    holder.animateStub = vi.fn(() => ({ cancel: vi.fn() }));
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      writable: true,
      value: holder.animateStub,
    });
  });

  afterEach(() => {
    // Unmount while the frame loop's clock is still the faked one it scheduled on.
    cleanup();
    Reflect.deleteProperty(Element.prototype, "animate");
    vi.useRealTimers();
  });

  return holder;
}

describe("QuizshowStageWheel", () => {
  const clock = installWheelTestClock();

  it("draws one slice per drawn slice, a peg per boundary and the count in the hub", async () => {
    const { container } = await renderWheel(null);
    expect(container.querySelectorAll("[data-slice-index]")).toHaveLength(
      DRAWN_COUNT,
    );
    expect(
      container.querySelectorAll("[data-quizshow-wheel-peg]"),
    ).toHaveLength(DRAWN_COUNT);
    expect(
      container.querySelector("[data-quizshow-wheel-hub-count]")?.textContent,
    ).toBe("3");
  });

  it("prints Round N on the disc for a slice with no title yet", async () => {
    const { container } = render(
      <TestProviders>
        <QuizshowStageWheel
          slices={[
            sliceOf(1, ""),
            sliceOf(2, "Queer history"),
            sliceOf(3, "Ballroom"),
          ]}
          rounds={ROUNDS}
          spin={null}
          clockOffsetMs={0}
          language="en"
          size="screen"
        />
      </TestProviders>,
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    const firstLabel = container.querySelector('[data-slice-index="0"] text');
    expect(firstLabel?.textContent).toBe("Round 1");
  });

  it("names the wheel for assistive tech", async () => {
    await renderWheel(null);
    expect(
      screen.getByRole("img", { name: "Wheel with 3 slices" }),
    ).toBeInTheDocument();
  });

  it("rests at 0 degrees without a spin", async () => {
    const { container } = await renderWheel(null);
    expect(spinnerOf(container).style.transform).toBe("rotate(0deg)");
    expect(wheelRoot(container).getAttribute("data-landed")).toBe("false");
  });

  it("renders a landed spin at once", async () => {
    const spin = spinStartedAt(NOW - 10_000);
    const { container } = await renderWheel(spin);
    expect(spinnerOf(container).style.transform).toBe(
      `rotate(${wheelSpinEndAngle(spin, DRAWN_COUNT)}deg)`,
    );
    const root = wheelRoot(container);
    expect(root.getAttribute("data-landed")).toBe("true");
    expect(root.getAttribute("data-landed-on-arrival")).toBe("true");
    const winner = container.querySelector('[data-slice-index="1"]');
    expect(winner?.getAttribute("data-winner")).toBe("true");
    expect(container.querySelectorAll('[data-winner="true"]')).toHaveLength(1);
    advance(1000);
    expect(clock.animateStub).not.toHaveBeenCalled();
  });

  it("shows a spin that stopped inside the panel delay as landed at once", async () => {
    const spin = spinStartedAt(NOW - QUIZSHOW_LIMITS.wheelSpinMs - 100);
    const { container } = await renderWheel(spin);
    const root = wheelRoot(container);
    expect(root.getAttribute("data-landed")).toBe("true");
    expect(root.getAttribute("data-landed-on-arrival")).toBe("true");
    expect(spinnerOf(container).style.transform).toBe(
      `rotate(${wheelSpinEndAngle(spin, DRAWN_COUNT)}deg)`,
    );
  });

  it("joins a spin in the air", async () => {
    const spin = spinStartedAt(NOW - 2000);
    const { container } = await renderWheel(spin);
    advance(FRAME_MS);
    const angle = angleOf(container);
    expect(angle).toBeGreaterThan(spin.startAngle);
    expect(angle).toBeLessThan(wheelSpinEndAngle(spin, DRAWN_COUNT));
    expect(wheelRoot(container).getAttribute("data-landed")).toBe("false");
    const landedAt =
      wheelSpinLandsAt(spin) + QUIZSHOW_WHEEL_PANEL_DELAY_MS - Date.now();
    advance(landedAt);
    expect(wheelRoot(container).getAttribute("data-landed")).toBe("true");
    expect(wheelRoot(container).getAttribute("data-landed-on-arrival")).toBe(
      "false",
    );
    expect(spinnerOf(container).style.transform).toBe(
      `rotate(${wheelSpinEndAngle(spin, DRAWN_COUNT)}deg)`,
    );
  });

  it("a new spin starts at its startAngle", async () => {
    const spin = spinStartedAt(NOW - 10_000);
    const { container, rerender } = await renderWheel(spin);
    const nextSpin: QuizshowWheelSpin = {
      ...spin,
      startedAt: NOW,
      startAngle: 123,
    };
    rerender(wheelTree(nextSpin));
    expect(Math.abs(angleOf(container) - 123)).toBeLessThanOrEqual(1);
    expect(wheelRoot(container).getAttribute("data-landed")).toBe("false");
  });

  it("holds under reduced motion and never kicks", async () => {
    const spin = spinStartedAt(NOW + 3000 - QUIZSHOW_LIMITS.wheelSpinMs);
    const { container } = await renderWheel(spin, true);
    expect(spinnerOf(container).style.transform).toBe(
      `rotate(${spin.startAngle}deg)`,
    );
    advance(1000);
    expect(spinnerOf(container).style.transform).toBe(
      `rotate(${spin.startAngle}deg)`,
    );
    advance(wheelSpinLandsAt(spin) - 600 - Date.now());
    const angle = angleOf(container);
    const endAngle = wheelSpinEndAngle(spin, DRAWN_COUNT);
    expect(angle).toBeGreaterThan(spin.startAngle);
    expect(angle).toBeLessThan(endAngle);
    // The short turn travels under one full turn.
    expect(endAngle - angle).toBeLessThan(360);
    advance(1000);
    expect(wheelRoot(container).getAttribute("data-reduced-motion")).toBe(
      "true",
    );
    expect(clock.animateStub).not.toHaveBeenCalled();
  });

  it("kicks the pointer as pegs pass", async () => {
    await renderWheel(spinStartedAt(NOW));
    advance(1000);
    expect(clock.animateStub).toHaveBeenCalled();
  });
});

describe("QuizshowStageWheel paint", () => {
  installWheelTestClock();

  it("gives each wheel its own gradient ids", async () => {
    const secondWheel = (
      <QuizshowStageWheel
        slices={SLICES}
        rounds={ROUNDS}
        spin={null}
        clockOffsetMs={0}
        language="en"
        size="preview"
      />
    );
    const { container } = render(wheelTree(null, false, secondWheel));
    await awaitCatalogUnderFakeTimers("quizshow");
    const toneIds = Array.from(
      container.querySelectorAll(
        "[data-quizshow-wheel-spinner] radialGradient",
      ),
      (gradient) => gradient.id,
    );
    // Four tones per wheel: plum, rose, bonus and the second bonus tone.
    expect(toneIds).toHaveLength(8);
    expect(new Set(toneIds).size).toBe(8);
    const roots = container.querySelectorAll<HTMLElement>(
      "[data-quizshow-wheel]",
    );
    expect(roots).toHaveLength(2);
    roots.forEach((root) => {
      root.querySelectorAll("[data-slice-index]").forEach((slice) => {
        const fill = slice.querySelector("path")?.getAttribute("fill") ?? "";
        const gradientId = /^url\(#(.+)\)$/.exec(fill)?.[1];
        expect(gradientId).toBeDefined();
        expect(root.querySelector(`[id="${gradientId}"]`)).not.toBeNull();
      });
    });
  });

  it("paints two neighbouring bonus slices with different tones", async () => {
    const { container } = render(
      <TestProviders>
        <QuizshowStageWheel
          slices={[
            sliceOf(1, "Music", 500),
            sliceOf(2, "Ballroom", 250),
            sliceOf(3, "Queer history"),
          ]}
          rounds={ROUNDS}
          spin={null}
          clockOffsetMs={0}
          language="en"
          size="screen"
        />
      </TestProviders>,
    );
    await awaitCatalogUnderFakeTimers("quizshow");
    const fills = Array.from(
      container.querySelectorAll("[data-slice-index]"),
      (slice) => slice.querySelector("path")?.getAttribute("fill") ?? "",
    );
    expect(fills).toHaveLength(3);
    expect(fills[0]).toMatch(/-tone-bonus\)$/);
    expect(fills[1]).toMatch(/-tone-bonusAlt\)$/);
    expect(fills[2]).toMatch(/-tone-plum\)$/);
  });

  it("draws the rim halo as a gradient disc that fades on both sides", async () => {
    const { container } = await renderWheel(null);
    const halo = container.querySelector("[data-quizshow-wheel-rim-halo]");
    expect(halo?.getAttribute("r")).toBe("114");
    expect(halo?.getAttribute("stroke-width")).toBeNull();
    const gradientId = /^url\(#(.+)\)$/.exec(
      halo?.getAttribute("fill") ?? "",
    )?.[1];
    expect(gradientId).toMatch(/-rim-halo$/);
    const stopOffsets = Array.from(
      container.querySelectorAll(`[id="${gradientId}"] stop`),
      (stop) => stop.getAttribute("offset"),
    );
    expect(stopOffsets).toEqual(["0.9", "0.956", "1"]);
  });

  it("stacks a wide faint glow and a narrow brighter glow under the winner line", async () => {
    const { container } = await renderWheel(null);
    const firstSlice = container.querySelector('[data-slice-index="0"]');
    const outlineWidths = Array.from(
      firstSlice?.querySelectorAll(":scope > g path") ?? [],
      (path) => path.getAttribute("stroke-width"),
    );
    expect(outlineWidths).toEqual(["5", "2.5", "0.9"]);
  });

  it("prints the slice bonus on the disc", async () => {
    await renderWheel(null);
    expect(screen.getByText("+500 bonus")).toBeInTheDocument();
  });

  it("leaves the slice bonus off the phone disc", async () => {
    render(wheelTree(null, false, null, "phone"));
    await awaitCatalogUnderFakeTimers("quizshow");
    expect(screen.getByText("Music")).toBeInTheDocument();
    expect(screen.queryByText("+500 bonus")).not.toBeInTheDocument();
  });
});
