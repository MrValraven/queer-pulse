import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSettings,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { VJ_SUB_FLASH_GAIN } from "../engine/safety/vjFlashGovernor";
import type { VjClockReader } from "../engine/vjEngineLook";
import { VjEffectsFrame } from "./VjEffectsFrame";

function on(
  effectId: VjEffectId,
  amount = VJ_EFFECT_CATALOG[effectId].defaultAmount,
  variant = VJ_EFFECT_CATALOG[effectId].defaultVariant,
): VjEffectSettings {
  return { [effectId]: { isOn: true, amount, variant } };
}

function tempoAt(bpm: number): VjTempo {
  return { bpm, downbeatAt: 0, quantize: "off", source: "manual" };
}

/** A synced clock whose server time the test moves together with the frames. */
let serverMs = 0;
const clock: VjClockReader = {
  serverNow: () => serverMs,
  toLocalTime: (time) => time,
};

let pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

/** Runs the frames waiting now at `atMs`, on the server clock and the frame clock alike. */
function runFrameAt(atMs: number): void {
  serverMs = atMs;
  const callbacks = [...pendingFrames.values()];
  pendingFrames = new Map();
  act(() => {
    for (const callback of callbacks) callback(atMs);
  });
}

function renderFrame(props: {
  settings: VjEffectSettings;
  isStrobing?: boolean;
  tempo?: VjTempo;
  hasClock?: boolean;
}) {
  const view = render(
    <VjEffectsFrame
      effects={{
        settings: props.settings,
        isStrobing: props.isStrobing ?? false,
      }}
      tempo={props.tempo ?? tempoAt(120)}
      clock={props.hasClock === false ? null : clock}
    >
      <div data-testid="clip" />
    </VjEffectsFrame>,
  );
  const frame = view.container.querySelector<HTMLElement>(
    "[data-vj-effects-frame]",
  );
  if (frame === null) throw new Error("missing effects frame");
  return { ...view, frame };
}

/** Times at which the brightness rose above the sub-flash line, stepping 10 ms. */
function brightnessRiseTimes(frame: HTMLElement, untilMs: number): number[] {
  const riseTimes: number[] = [];
  let wasAbove = false;
  for (let atMs = 0; atMs <= untilMs; atMs += 10) {
    runFrameAt(atMs);
    const brightness = Number(
      frame.style.getPropertyValue("--vj-dom-brightness"),
    );
    const isAbove = brightness > 1 + VJ_SUB_FLASH_GAIN;
    if (isAbove && !wasAbove) riseTimes.push(atMs);
    wasAbove = isAbove;
  }
  return riseTimes;
}

describe("VjEffectsFrame", () => {
  beforeEach(() => {
    serverMs = 0;
    pendingFrames = new Map();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      pendingFrames.set(frameId, callback);
      return frameId;
    });
    vi.stubGlobal("cancelAnimationFrame", (frameId: number) => {
      pendingFrames.delete(frameId);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("draws the tint layer in the variant's palette colour", () => {
    const { container } = renderFrame({ settings: on("tint", 0.4, "jade") });
    const tint = container.querySelector<HTMLElement>("[data-vj-tint]");
    expect(tint?.dataset.vjTint).toBe("jade");
    expect(tint?.style.getPropertyValue("--vj-dom-tint")).toBe(
      "var(--vj-palette-jade)",
    );
    expect(tint?.style.opacity).toBe("0.4");
  });

  it("darkens the tint by the colour's own grey, as the shader's luma times colour", () => {
    const { container } = renderFrame({ settings: on("tint", 0.4, "jade") });
    const shade = container.querySelector<HTMLElement>("[data-vj-tint-shade]");
    expect(shade?.style.getPropertyValue("--vj-dom-tint")).toBe(
      "var(--vj-palette-jade)",
    );
    expect(shade?.style.opacity).toBe("0.4");
  });

  it("draws duotone as a highlight multiply and a shadow screen", () => {
    const { container } = renderFrame({
      settings: on("duotone", 0.7, "violet-amber"),
    });
    const highlight = container.querySelector<HTMLElement>(
      "[data-vj-duotone-highlight]",
    );
    const shadow = container.querySelector<HTMLElement>(
      "[data-vj-duotone-shadow]",
    );
    expect(highlight?.style.getPropertyValue("--vj-dom-duotone")).toBe(
      "var(--vj-palette-amber)",
    );
    expect(shadow?.style.getPropertyValue("--vj-dom-duotone")).toBe(
      "var(--vj-palette-violet)",
    );
    expect(highlight?.style.opacity).toBe("0.7");
    expect(shadow?.style.opacity).toBe("0.7");
  });

  it("reflects the left half for horizontal mirror", () => {
    const { container, getByTestId, rerender } = renderFrame({
      settings: on("mirror", 1, "horizontal"),
    });
    const clip = getByTestId("clip");
    const mirror = container.querySelector<HTMLElement>("[data-vj-mirror]");
    expect(mirror?.dataset.vjMirror).toBe("horizontal");
    expect(mirror?.contains(clip)).toBe(true);

    rerender(
      <VjEffectsFrame
        effects={{ settings: on("mirror", 1, "quad"), isStrobing: false }}
      >
        <div data-testid="clip" />
      </VjEffectsFrame>,
    );
    expect(
      container.querySelector<HTMLElement>("[data-vj-mirror]")?.dataset
        .vjMirror,
    ).toBe("horizontal");
    // Switching the mirror never remounts the clips.
    expect(getByTestId("clip")).toBe(clip);
  });

  it("writes the hue custom property from the synced clock", () => {
    const { frame } = renderFrame({
      settings: on("hueCycle", 0.5),
      tempo: tempoAt(120),
    });
    // 120 BPM: two beats by 1000 ms, at 45 degrees a beat.
    runFrameAt(1000);
    expect(frame.style.getPropertyValue("--vj-dom-hue")).toBe("90deg");
    runFrameAt(1250);
    expect(frame.style.getPropertyValue("--vj-dom-hue")).toBe("112.5deg");
  });

  it("leaves every beat value at rest without a clock", () => {
    const { frame, container } = renderFrame({
      settings: { ...on("hueCycle", 0.5), ...on("vignette", 0.5) },
      hasClock: false,
    });
    expect(pendingFrames.size).toBe(0);
    expect(frame.style.getPropertyValue("--vj-dom-hue")).toBe("");
    expect(container.querySelector("[data-vj-vignette]")).not.toBeNull();
  });

  it("keeps beatPulse under the sub-flash gain while the strobe runs", () => {
    const { frame } = renderFrame({
      settings: on("beatPulse", 1),
      isStrobing: true,
      tempo: tempoAt(120),
    });
    let highestBrightness = 0;
    for (let atMs = 0; atMs <= 3000; atMs += 10) {
      runFrameAt(atMs);
      highestBrightness = Math.max(
        highestBrightness,
        Number(frame.style.getPropertyValue("--vj-dom-brightness")),
      );
    }
    expect(highestBrightness).toBeGreaterThan(1);
    expect(highestBrightness).toBeLessThanOrEqual(1 + VJ_SUB_FLASH_GAIN);
  });

  it("grants at most 3 beat flashes in a second", () => {
    // 200 BPM: a beat every 300 ms, so 4 beats fall inside some seconds.
    const { frame } = renderFrame({
      settings: on("beatPulse", 1),
      tempo: tempoAt(200),
    });
    const riseTimes = brightnessRiseTimes(frame, 4000);
    expect(riseTimes.length).toBeGreaterThanOrEqual(9);
    for (const windowStartMs of riseTimes) {
      const inWindow = riseTimes.filter(
        (riseMs) => riseMs >= windowStartMs && riseMs < windowStartMs + 1000,
      );
      expect(inWindow.length).toBeLessThanOrEqual(3);
    }
  });

  it("ramps a denied invert toggle over 400 ms", () => {
    const view = renderFrame({ settings: {}, isStrobing: true });
    runFrameAt(0);
    view.rerender(
      <VjEffectsFrame
        effects={{ settings: on("invert", 1, "steady"), isStrobing: true }}
        tempo={tempoAt(120)}
        clock={clock}
      >
        <div data-testid="clip" />
      </VjEffectsFrame>,
    );
    // Denied at 10 ms: 10 ms then 100 ms of a 400 ms ramp.
    runFrameAt(10);
    runFrameAt(110);
    expect(
      Number(view.frame.style.getPropertyValue("--vj-dom-invert")),
    ).toBeCloseTo(0.275);
    for (let atMs = 120; atMs <= 500; atMs += 10) runFrameAt(atMs);
    expect(view.frame.style.getPropertyValue("--vj-dom-invert")).toBe("1");
  });
});
