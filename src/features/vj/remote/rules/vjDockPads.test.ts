import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_IDS,
  type VjEffectId,
} from "../../../../shared/contracts/vj";
import {
  VJ_DEFAULT_DOCK_PADS,
  VJ_DOCK_PADS_MAX,
  addVjDockPad,
  moveVjDockPad,
  parseVjDockPads,
  removeVjDockPad,
} from "./vjDockPads";

const FIRST_EIGHT_IDS = VJ_EFFECT_IDS.slice(0, 8);

describe("VJ_DEFAULT_DOCK_PADS", () => {
  it("holds the first 8 catalog ids", () => {
    expect(VJ_DEFAULT_DOCK_PADS).toEqual(FIRST_EIGHT_IDS);
  });
});

describe("parseVjDockPads", () => {
  it("keeps known ids in their stored order", () => {
    expect(parseVjDockPads(["glitch", "monochrome", "vhs"])).toEqual([
      "glitch",
      "monochrome",
      "vhs",
    ]);
  });

  it("drops an unknown id", () => {
    expect(parseVjDockPads(["glitch", "sparkles", 7, null, "vhs"])).toEqual([
      "glitch",
      "vhs",
    ]);
  });

  it("drops a duplicate id", () => {
    expect(parseVjDockPads(["glitch", "glitch", "vhs"])).toEqual([
      "glitch",
      "vhs",
    ]);
  });

  it("caps the list at 12 pads", () => {
    expect(parseVjDockPads([...VJ_EFFECT_IDS])).toEqual(
      VJ_EFFECT_IDS.slice(0, VJ_DOCK_PADS_MAX),
    );
  });

  it("falls back to the first 8 catalog ids for garbage", () => {
    expect(parseVjDockPads("glitch")).toEqual(FIRST_EIGHT_IDS);
    expect(parseVjDockPads(null)).toEqual(FIRST_EIGHT_IDS);
    expect(parseVjDockPads({ pads: ["glitch"] })).toEqual(FIRST_EIGHT_IDS);
    expect(parseVjDockPads([])).toEqual(FIRST_EIGHT_IDS);
    expect(parseVjDockPads(["sparkles"])).toEqual(FIRST_EIGHT_IDS);
  });
});

describe("addVjDockPad", () => {
  it("appends a new pad at the end", () => {
    expect(addVjDockPad(["glitch"], "vhs")).toEqual(["glitch", "vhs"]);
  });

  it("keeps a docked pad where it is", () => {
    expect(addVjDockPad(["glitch", "vhs"], "glitch")).toEqual([
      "glitch",
      "vhs",
    ]);
  });

  it("refuses a thirteenth pad", () => {
    const fullDock: VjEffectId[] = VJ_EFFECT_IDS.slice(0, VJ_DOCK_PADS_MAX);
    expect(addVjDockPad(fullDock, "beatPulse")).toBe("full");
  });
});

describe("removeVjDockPad", () => {
  it("removes the pad and keeps the rest in order", () => {
    expect(removeVjDockPad(["glitch", "vhs", "crt"], "vhs")).toEqual([
      "glitch",
      "crt",
    ]);
  });
});

describe("moveVjDockPad", () => {
  it("moves a pad left and stops at the edge", () => {
    const movedOnce = moveVjDockPad(["glitch", "vhs", "crt"], "crt", -1);
    expect(movedOnce).toEqual(["glitch", "crt", "vhs"]);
    const movedTwice = moveVjDockPad(movedOnce, "crt", -1);
    expect(movedTwice).toEqual(["crt", "glitch", "vhs"]);
    expect(moveVjDockPad(movedTwice, "crt", -1)).toEqual([
      "crt",
      "glitch",
      "vhs",
    ]);
  });

  it("moves a pad right and stops at the edge", () => {
    expect(moveVjDockPad(["glitch", "vhs"], "glitch", 1)).toEqual([
      "vhs",
      "glitch",
    ]);
    expect(moveVjDockPad(["glitch", "vhs"], "vhs", 1)).toEqual([
      "glitch",
      "vhs",
    ]);
  });
});
