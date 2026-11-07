import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { resolveVjScreenLook, vjRenderableGeneratorOf } from "./vjScreenLook";

const SCREEN_ID = "screen-1";

function stageState(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("epoch-1", 0),
    activePackId: "pack-1",
    liveClipId: "clip-1",
    clipSequence: 1,
    revision: 1,
    ...changes,
  };
}

describe("resolveVjScreenLook", () => {
  it("follows the main clip without an override entry", () => {
    const state = stageState({
      screenOverrides: {
        "screen-2": {
          clipId: "clip-9",
          generatorId: null,
          generatorVariant: null,
        },
      },
    });
    expect(resolveVjScreenLook(state, SCREEN_ID, "clip-3")).toEqual({
      live: { kind: "clip", clipId: "clip-3" },
      mixClipId: null,
      isOverridden: false,
    });
    expect(resolveVjScreenLook(state, SCREEN_ID, null).live).toBeNull();
  });

  it("shows this screen's override clip", () => {
    const state = stageState({
      screenOverrides: {
        [SCREEN_ID]: {
          clipId: "clip-7",
          generatorId: null,
          generatorVariant: null,
        },
      },
    });
    expect(resolveVjScreenLook(state, SCREEN_ID, "clip-1")).toEqual({
      live: { kind: "clip", clipId: "clip-7" },
      mixClipId: null,
      isOverridden: true,
    });
  });

  it("shows this screen's override generator with its variant", () => {
    const state = stageState({
      screenOverrides: {
        [SCREEN_ID]: {
          clipId: null,
          generatorId: "prideFlagWave",
          generatorVariant: "trans",
        },
      },
    });
    const look = resolveVjScreenLook(state, SCREEN_ID, "clip-1");
    expect(look.live).toEqual({
      kind: "generator",
      generatorId: "prideFlagWave",
      generatorVariant: "trans",
    });
    expect(look.isOverridden).toBe(true);
    expect(vjRenderableGeneratorOf("prideFlagWave", "trans")).toEqual({
      clipId: "generator:prideFlagWave:trans",
      generatorId: "prideFlagWave",
      generatorVariant: "trans",
      mediaKind: "generator",
      sourceUrl: "",
    });
  });

  it("prefers the live generator over the clip", () => {
    const state = stageState({
      liveClipId: null,
      liveGeneratorId: "plasma",
      liveGeneratorVariant: null,
    });
    expect(resolveVjScreenLook(state, SCREEN_ID, "clip-4")).toEqual({
      live: {
        kind: "generator",
        generatorId: "plasma",
        generatorVariant: null,
      },
      mixClipId: null,
      isOverridden: false,
    });
  });

  it("keeps the mix clip shared under an override", () => {
    const state = stageState({
      mix: { clipId: "clip-5", amount: 0.4, blendMode: "screen" },
      screenOverrides: {
        [SCREEN_ID]: {
          clipId: null,
          generatorId: "tunnel",
          generatorVariant: null,
        },
      },
    });
    const look = resolveVjScreenLook(state, SCREEN_ID, "clip-1");
    expect(look.mixClipId).toBe("clip-5");
    expect(look.isOverridden).toBe(true);
    expect(resolveVjScreenLook(state, "screen-2", "clip-1").mixClipId).toBe(
      "clip-5",
    );
  });
});
