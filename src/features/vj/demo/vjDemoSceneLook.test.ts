import { describe, expect, it } from "vitest";
import type { VjSceneLook } from "../../../shared/contracts/vj";
import { VJ_DEMO_SCENE_SEEDS } from "./vjDemo.data";
import {
  EMPTY_VJ_SCENE_LOOK,
  checkVjSceneLook,
  normalizeStoredVjSceneLook,
  rewriteVjSceneLookForDeletedClip,
  vjSceneLookClipRefs,
} from "./vjDemoSceneLook";

const CLIP_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";
const MIX_CLIP_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

/** A valid look as plain data; each test breaks one field of a fresh copy. */
function validLook(): Record<string, unknown> {
  return {
    source: { kind: "clip", clipId: CLIP_ID },
    effects: {
      speed: 1,
      settings: { glitch: { isOn: true, amount: 0.4, variant: null } },
    },
    transition: { mode: "fade", length: { unit: "beats", value: 2 } },
    overlay: {
      text: "Hello",
      style: "big",
      isVisible: true,
      position: "center",
      size: "l",
      colorToken: "cream",
    },
    mix: { clipId: MIX_CLIP_ID, amount: 0.5, blendMode: "screen" },
  };
}

function lookWith(part: string, value: unknown): Record<string, unknown> {
  return { ...validLook(), [part]: value };
}

function invalidAt(lookField: string) {
  return { code: "VJ_SCENE_LOOK_INVALID", lookField };
}

describe("checkVjSceneLook", () => {
  it("accepts the two demo seed looks", () => {
    for (const seed of VJ_DEMO_SCENE_SEEDS) {
      expect(checkVjSceneLook(seed.look)).toEqual({ look: seed.look });
    }
  });

  it("step 1: an extra key, a missing key or over 16 KB fails the whole look", () => {
    expect(checkVjSceneLook({ ...validLook(), extra: 1 })).toEqual(
      invalidAt(""),
    );
    const withoutMix = validLook();
    delete withoutMix.mix;
    expect(checkVjSceneLook(withoutMix)).toEqual(invalidAt(""));
    expect(checkVjSceneLook(null)).toEqual(invalidAt(""));
    const huge = lookWith("overlay", {
      ...(validLook().overlay as Record<string, unknown>),
      text: "x".repeat(17_000),
    });
    expect(checkVjSceneLook(huge)).toEqual(invalidAt(""));
  });

  it("step 2: the source names its first bad field", () => {
    expect(
      checkVjSceneLook(lookWith("source", { kind: "clip", clipId: "nope" })),
    ).toEqual(invalidAt("source.clipId"));
    expect(
      checkVjSceneLook(
        lookWith("source", { kind: "clip", clipId: CLIP_ID, extra: 1 }),
      ),
    ).toEqual(invalidAt("source"));
    expect(checkVjSceneLook(lookWith("source", { kind: "photo" }))).toEqual(
      invalidAt("source.kind"),
    );
    expect(
      checkVjSceneLook(
        lookWith("source", {
          kind: "generator",
          generatorId: "lava",
          generatorVariant: null,
        }),
      ),
    ).toEqual(invalidAt("source.generatorId"));
    expect(
      checkVjSceneLook(
        lookWith("source", {
          kind: "generator",
          generatorId: "prideFlagWave",
          generatorVariant: null,
        }),
      ),
    ).toEqual(invalidAt("source.generatorVariant"));
  });

  it("step 3: effects name the setting field that fails", () => {
    expect(
      checkVjSceneLook(
        lookWith("effects", {
          speed: 1,
          settings: { glitch: { isOn: true, amount: 3, variant: null } },
        }),
      ),
    ).toEqual(invalidAt("effects.settings.glitch.amount"));
    expect(
      checkVjSceneLook(
        lookWith("effects", {
          speed: 1,
          settings: { glitch: { isOn: true, amount: 0.4 } },
        }),
      ),
    ).toEqual(invalidAt("effects.settings.glitch.variant"));
    expect(
      checkVjSceneLook(lookWith("effects", { speed: 3, settings: {} })),
    ).toEqual(invalidAt("effects.speed"));
    expect(
      checkVjSceneLook(
        lookWith("effects", {
          speed: 1,
          settings: {
            freeze: { isOn: true, amount: 1, variant: null },
            reverse: { isOn: true, amount: 1, variant: null },
          },
        }),
      ),
    ).toEqual(invalidAt("effects.settings"));
  });

  it("step 4: the transition names mode or length", () => {
    expect(
      checkVjSceneLook(
        lookWith("transition", {
          mode: "swirl",
          length: { unit: "ms", value: 800 },
        }),
      ),
    ).toEqual(invalidAt("transition.mode"));
    expect(
      checkVjSceneLook(
        lookWith("transition", {
          mode: "fade",
          length: { unit: "ms", value: 5000 },
        }),
      ),
    ).toEqual(invalidAt("transition.length"));
    expect(
      checkVjSceneLook(
        lookWith("transition", {
          mode: "fade",
          length: { unit: "beats", value: 3 },
        }),
      ),
    ).toEqual(invalidAt("transition.length"));
  });

  it("step 5: the overlay names its field; visible blank text fails at overlay.isVisible", () => {
    const overlay = validLook().overlay as Record<string, unknown>;
    expect(
      checkVjSceneLook(lookWith("overlay", { ...overlay, size: "xxl" })),
    ).toEqual(invalidAt("overlay.size"));
    expect(
      checkVjSceneLook(lookWith("overlay", { ...overlay, text: "   " })),
    ).toEqual(invalidAt("overlay.isVisible"));
    expect(
      checkVjSceneLook(
        lookWith("overlay", { ...overlay, text: "x".repeat(81) }),
      ),
    ).toEqual(invalidAt("overlay.text"));
  });

  it("step 6: the mix names its field", () => {
    expect(
      checkVjSceneLook(
        lookWith("mix", { clipId: "nope", amount: 0.5, blendMode: "normal" }),
      ),
    ).toEqual(invalidAt("mix.clipId"));
    expect(
      checkVjSceneLook(
        lookWith("mix", { clipId: null, amount: 2, blendMode: "normal" }),
      ),
    ).toEqual(invalidAt("mix.amount"));
    expect(
      checkVjSceneLook(
        lookWith("mix", { clipId: null, amount: 0, blendMode: "burn" }),
      ),
    ).toEqual(invalidAt("mix.blendMode"));
  });

  it("a part key holding undefined counts as missing, as on the JSON wire", () => {
    const overlay = validLook().overlay as Record<string, unknown>;
    expect(
      checkVjSceneLook(lookWith("overlay", { ...overlay, text: undefined })),
    ).toEqual(invalidAt("overlay"));
  });

  it("answers the first bad part in step order", () => {
    const look = {
      ...lookWith("source", { kind: "clip", clipId: "nope" }),
      mix: { clipId: null, amount: 2, blendMode: "normal" },
    };
    expect(checkVjSceneLook(look)).toEqual(invalidAt("source.clipId"));
  });

  it("returns the look canonical: uuids lowercased, amounts rounded", () => {
    const result = checkVjSceneLook({
      ...validLook(),
      source: { kind: "clip", clipId: CLIP_ID.toUpperCase() },
      effects: {
        speed: 1,
        settings: {
          beatPulse: { isOn: true, amount: 0.555, variant: null },
          glitch: { isOn: false, amount: 0.4, variant: null },
        },
      },
    });
    expect(result).toMatchObject({
      look: {
        source: { kind: "clip", clipId: CLIP_ID },
        effects: {
          speed: 1,
          settings: { beatPulse: { isOn: true, amount: 0.56, variant: null } },
        },
      },
    });
  });
});

describe("vjSceneLookClipRefs", () => {
  it("lists the source clip and the mix clip with their paths", () => {
    const result = checkVjSceneLook(validLook());
    if (!("look" in result)) throw new Error("expected a valid look");
    expect(vjSceneLookClipRefs(result.look)).toEqual([
      { lookField: "source.clipId", clipId: CLIP_ID },
      { lookField: "mix.clipId", clipId: MIX_CLIP_ID },
    ]);
    expect(vjSceneLookClipRefs(EMPTY_VJ_SCENE_LOOK)).toEqual([]);
  });
});

describe("normalizeStoredVjSceneLook", () => {
  it("the normaliser drops an effect the catalog no longer has", () => {
    const stored = lookWith("effects", {
      speed: 1,
      settings: {
        sparkle: { isOn: true, amount: 1, variant: null },
        glitch: { isOn: true, amount: 0.4, variant: null },
      },
    });
    expect(normalizeStoredVjSceneLook(stored).effects).toEqual({
      speed: 1,
      settings: { glitch: { isOn: true, amount: 0.4, variant: null } },
    });
  });

  it("a value that is no object reads as the empty look", () => {
    expect(normalizeStoredVjSceneLook("broken")).toEqual(EMPTY_VJ_SCENE_LOOK);
  });

  it("a bad part takes its default and the rest stays", () => {
    const stored = lookWith("mix", { clipId: 5, amount: 0.5 });
    const normalized = normalizeStoredVjSceneLook(stored);
    expect(normalized.mix).toEqual(EMPTY_VJ_SCENE_LOOK.mix);
    expect(normalized.source).toEqual({ kind: "clip", clipId: CLIP_ID });
  });
});

describe("rewriteVjSceneLookForDeletedClip", () => {
  it("the clip delete rewrite clears the source and empties the mix but keeps its blend mode", () => {
    const look: VjSceneLook = {
      ...EMPTY_VJ_SCENE_LOOK,
      source: { kind: "clip", clipId: CLIP_ID },
      mix: { clipId: CLIP_ID, amount: 0.7, blendMode: "screen" },
    };
    expect(
      rewriteVjSceneLookForDeletedClip(look, CLIP_ID.toUpperCase()),
    ).toEqual({
      ...look,
      source: null,
      mix: { clipId: null, amount: 0, blendMode: "screen" },
    });
  });

  it("answers null when the look does not name the clip", () => {
    const look: VjSceneLook = {
      ...EMPTY_VJ_SCENE_LOOK,
      source: { kind: "clip", clipId: CLIP_ID },
    };
    expect(rewriteVjSceneLookForDeletedClip(look, MIX_CLIP_ID)).toBeNull();
  });
});
