import { describe, expect, it } from "vitest";
import { fitStudioPopover } from "./studioPopoverFit";

const PHONE = { viewportWidth: 360, viewportHeight: 640 };

describe("fitStudioPopover", () => {
  it("leaves a panel that fits where it is", () => {
    const fit = fitStudioPopover({
      ...PHONE,
      panelLeft: 40,
      panelWidth: 300,
      triggerTop: 560,
      triggerBottom: 604,
      placement: "up",
    });
    expect(fit.shiftX).toBe(0);
    expect(fit.maxBlockSize).toBe(560 - 8 - 16);
  });

  it("moves a panel that overflows the start edge back inside", () => {
    const fit = fitStudioPopover({
      ...PHONE,
      panelLeft: -120,
      panelWidth: 300,
      triggerTop: 560,
      triggerBottom: 604,
      placement: "up",
    });
    expect(fit.shiftX).toBe(136);
  });

  it("moves a panel that overflows the end edge back inside", () => {
    const fit = fitStudioPopover({
      ...PHONE,
      panelLeft: 200,
      panelWidth: 300,
      triggerTop: 20,
      triggerBottom: 64,
      placement: "down",
    });
    expect(fit.shiftX).toBe(-156);
    expect(fit.maxBlockSize).toBe(640 - 64 - 8 - 16);
  });

  it("keeps the start edge in view when the panel is wider than the screen", () => {
    const fit = fitStudioPopover({
      ...PHONE,
      panelLeft: 0,
      panelWidth: 400,
      triggerTop: 560,
      triggerBottom: 604,
      placement: "up",
    });
    expect(fit.shiftX).toBe(16);
  });

  it("keeps a usable height when the trigger sits near the edge", () => {
    const fit = fitStudioPopover({
      ...PHONE,
      panelLeft: 40,
      panelWidth: 300,
      triggerTop: 30,
      triggerBottom: 74,
      placement: "up",
    });
    expect(fit.maxBlockSize).toBe(160);
  });
});
