import { describe, expect, it } from "vitest";
import type { VjEffectSettings } from "../../../shared/contracts/vj";
import { VJ_FLASH_HOLD_MS, VJ_SUB_FLASH_GAIN } from "./safety/vjFlashGovernor";
import {
  VjCompositorFlashes,
  type VjFlashTickInput,
} from "./vjCompositorFlashes";

const PULSE_SETTINGS: VjEffectSettings = {
  beatPulse: { isOn: true, amount: 1, variant: null },
};

function tickInput(
  nowMs: number,
  micLevel: number | null,
  beatIndex = 0,
): VjFlashTickInput {
  return {
    nowMs,
    settings: PULSE_SETTINGS,
    isStrobing: false,
    isStrobeEnabled: false,
    beatIndex,
    beatPhase: 0,
    beatPeriodMs: 500,
    drive: micLevel ?? 1,
    micLevel,
  };
}

describe("VjCompositorFlashes", () => {
  it("spends audioBrightness grants on mic swings smaller and slower than a fast rise", () => {
    const flashes = new VjCompositorFlashes();
    // Amount 1, mic swinging 0.55 to 0.8 at 5 Hz: the gain moves 1.275 to 1.4.
    expect(flashes.tick(tickInput(0, 0.55)).outputGain).toBeCloseTo(1.275);
    expect(flashes.heldGrantCount(0)).toBe(1);

    expect(flashes.tick(tickInput(100, 0.8)).outputGain).toBeCloseTo(1.4);
    expect(flashes.heldGrantCount(100)).toBe(2);

    expect(flashes.tick(tickInput(200, 0.55)).outputGain).toBeCloseTo(1.275);
    expect(flashes.heldGrantCount(200)).toBe(3);

    // The budget is full: the swing stays within the sub-flash band of the last grant.
    const deniedGain = flashes.tick(tickInput(300, 0.8)).outputGain;
    expect(deniedGain).toBeCloseTo(1.275 + VJ_SUB_FLASH_GAIN);
    expect(flashes.tick(tickInput(400, 0.55)).outputGain).toBeCloseTo(1.275);
    expect(flashes.heldGrantCount(400)).toBe(3);

    // The next beat is denied too, so the gain holds near 1.
    const nextBeatGain = flashes.tick(tickInput(500, 0.8, 1)).outputGain;
    expect(nextBeatGain).toBeCloseTo(1 + VJ_SUB_FLASH_GAIN);
  });

  it("asks for audioBrightness on a slow mic rise", () => {
    const flashes = new VjCompositorFlashes();
    flashes.tick(tickInput(0, 0));
    expect(flashes.heldGrantCount(0)).toBe(1);
    let hasAskedAgain = false;
    for (let step = 1; step <= 60; step += 1) {
      const nowMs = step * (1000 / 60);
      flashes.tick(tickInput(nowMs, step / 60));
      if (flashes.heldGrantCount(nowMs) > 1) hasAskedAgain = true;
    }
    expect(hasAskedAgain).toBe(true);
  });

  it("keeps a granted beat's gain moving freely while the mic is off", () => {
    const flashes = new VjCompositorFlashes();
    expect(flashes.tick(tickInput(0, null)).outputGain).toBeCloseTo(1.5);
    expect(flashes.heldGrantCount(0)).toBe(1);
  });

  it("counts a grant as held for the governor's full hold", () => {
    const flashes = new VjCompositorFlashes();
    expect(flashes.request("beatPulse", 0)).toBe(true);
    expect(flashes.heldGrantCount(1040)).toBe(1);
    expect(flashes.heldGrantCount(VJ_FLASH_HOLD_MS)).toBe(1);
    expect(flashes.heldGrantCount(VJ_FLASH_HOLD_MS + 1)).toBe(0);
  });
});
