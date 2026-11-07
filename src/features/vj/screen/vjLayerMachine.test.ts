import { describe, expect, it } from "vitest";
import type { VjGeneratorId } from "../../../shared/contracts/vj";
import type { VjResolvedTransition } from "../engine/vjEngineLook";
import {
  INITIAL_VJ_LAYERS,
  VJ_LAYER_NAMES,
  reduceVjLayers,
  releasedVjSourceUrls,
  vjLayerOpacity,
  vjLayerZ,
  type VjLayerEvent,
  type VjLayerMachineState,
  type VjLayerName,
  type VjRenderableClip,
  type VjRenderableGenerator,
  type VjRenderableSource,
  vjGeneratorSourceKey,
} from "./vjLayerMachine";

const FADE: VjResolvedTransition = { mode: "fade", durationMs: 800 };
const CUT: VjResolvedTransition = { mode: "cut", durationMs: 0 };

/** One v2 clip with every field set; overrides change only what a test needs. */
function clipFixture(
  clipId: string,
  overrides: Partial<VjRenderableClip> = {},
): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl: `blob:source-${clipId}`,
    durationMs: 8000,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
    ...overrides,
  };
}

function clipNamed(clipId: string): VjRenderableClip {
  return clipFixture(clipId);
}

function generatorFixture(
  generatorId: VjGeneratorId,
  generatorVariant: string | null = null,
): VjRenderableGenerator {
  return {
    clipId: vjGeneratorSourceKey(generatorId, generatorVariant),
    generatorId,
    generatorVariant,
    mediaKind: "generator",
    sourceUrl: "",
  };
}

function applyAll(
  events: VjLayerEvent[],
  state: VjLayerMachineState = INITIAL_VJ_LAYERS,
): VjLayerMachineState {
  return events.reduce(reduceVjLayers, state);
}

function layerHolding(state: VjLayerMachineState, clipId: string): VjLayerName {
  const layer = VJ_LAYER_NAMES.find(
    (layerName) => state.slots[layerName].clip?.clipId === clipId,
  );
  if (!layer) throw new Error(`no layer holds ${clipId}`);
  return layer;
}

/** Clip "one" fully shown on the front, reached from black. */
function showingClipOne(): VjLayerMachineState {
  const loading = applyAll([
    { type: "target", clip: clipNamed("one"), transition: FADE },
  ]);
  return applyAll(
    [
      {
        type: "firstFrame",
        layer: layerHolding(loading, "one"),
        clipId: "one",
      },
    ],
    loading,
  );
}

describe("reduceVjLayers switching clips", () => {
  it("loads the next clip hidden and fades it in over the current one once it has a frame", () => {
    const shown = showingClipOne();
    const frontLayer = shown.front;
    expect(frontLayer).not.toBeNull();
    if (!frontLayer) return;

    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    const incomingLayer = layerHolding(loading, "two");
    expect(incomingLayer).not.toBe(frontLayer);
    expect(loading.slots[incomingLayer].phase).toBe("loading");
    expect(vjLayerOpacity(loading, incomingLayer)).toBe(0);
    expect(vjLayerZ(loading, incomingLayer)).toBe(0);
    expect(vjLayerOpacity(loading, frontLayer)).toBe(1);
    expect(vjLayerZ(loading, frontLayer)).toBe(1);
    expect(loading.slots[frontLayer].phase).toBe("shown");

    const fading = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(fading.slots[incomingLayer].phase).toBe("fadingIn");
    expect(vjLayerOpacity(fading, incomingLayer)).toBe(1);
    expect(vjLayerZ(fading, incomingLayer)).toBe(1);
    expect(vjLayerZ(fading, frontLayer)).toBe(0);
    expect(fading.incoming).toEqual({
      layer: incomingLayer,
      mode: "fade",
      durationMs: 800,
      isArmed: true,
    });
  });

  it("keeps the outgoing layer at full opacity until the fade ends", () => {
    const shown = showingClipOne();
    const outgoingLayer = shown.front;
    if (!outgoingLayer) throw new Error("expected a front layer");
    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    const incomingLayer = layerHolding(loading, "two");
    const fading = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(vjLayerOpacity(fading, outgoingLayer)).toBe(1);
    expect(fading.slots[outgoingLayer].phase).toBe("shown");
    expect(fading.front).toBe(outgoingLayer);

    const ended = reduceVjLayers(fading, {
      type: "fadeEnded",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(ended.front).toBe(incomingLayer);
    expect(ended.slots[incomingLayer].phase).toBe("shown");
    expect(ended.slots[outgoingLayer].phase).toBe("leaving");
    expect(vjLayerOpacity(ended, outgoingLayer)).toBe(0);
    expect(ended.incoming).toBeNull();
  });

  it("cuts only once the next clip has a frame", () => {
    const shown = showingClipOne();
    const outgoingLayer = shown.front;
    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("two"),
      transition: CUT,
    });
    const incomingLayer = layerHolding(loading, "two");
    expect(loading.front).toBe(outgoingLayer);
    expect(vjLayerOpacity(loading, incomingLayer)).toBe(0);

    const cut = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(cut.front).toBe(incomingLayer);
    expect(cut.slots[incomingLayer].phase).toBe("shown");
    expect(vjLayerOpacity(cut, incomingLayer)).toBe(1);
    expect(cut.incoming).toBeNull();
  });

  it("keeps the current clip on screen when the next one fails to decode", () => {
    const shown = showingClipOne();
    const frontLayer = shown.front;
    if (!frontLayer) throw new Error("expected a front layer");
    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("broken"),
      transition: FADE,
    });
    const incomingLayer = layerHolding(loading, "broken");
    const failed = reduceVjLayers(loading, {
      type: "failed",
      layer: incomingLayer,
      clipId: "broken",
    });
    expect(failed.front).toBe(frontLayer);
    expect(failed.slots[frontLayer]).toEqual({
      clip: clipNamed("one"),
      phase: "shown",
    });
    expect(failed.slots[incomingLayer]).toEqual({ clip: null, phase: "empty" });
    expect(failed.incoming).toBeNull();
    expect(failed.isBlackRequested).toBe(false);
  });
});

/** Clip "one" shown, clip "two" fading in over it. */
function twoFadingOverOne(): VjLayerMachineState {
  const loading = reduceVjLayers(showingClipOne(), {
    type: "target",
    clip: clipNamed("two"),
    transition: FADE,
  });
  return reduceVjLayers(loading, {
    type: "firstFrame",
    layer: layerHolding(loading, "two"),
    clipId: "two",
  });
}

describe("reduceVjLayers catching a fading clip up", () => {
  it("catches the fading layer up to full opacity, then promotes it and loads the new clip into the freed layer", () => {
    const fading = twoFadingOverOne();
    const firstLayer = layerHolding(fading, "one");
    const secondLayer = layerHolding(fading, "two");

    const catchingUp = reduceVjLayers(fading, {
      type: "target",
      clip: clipNamed("three"),
      transition: FADE,
    });
    expect(catchingUp.slots[secondLayer].phase).toBe("catchingUp");
    expect(catchingUp.front).toBe(firstLayer);
    expect(catchingUp.slots[firstLayer].phase).toBe("shown");
    expect(vjLayerOpacity(catchingUp, firstLayer)).toBe(1);
    expect(vjLayerOpacity(catchingUp, secondLayer)).toBe(1);
    expect(vjLayerZ(catchingUp, secondLayer)).toBe(1);
    expect(vjLayerZ(catchingUp, firstLayer)).toBe(0);
    expect(catchingUp.pendingTarget?.clip.clipId).toBe("three");
    expect(
      VJ_LAYER_NAMES.some(
        (layerName) => catchingUp.slots[layerName].clip?.clipId === "three",
      ),
    ).toBe(false);

    const staleFadeEnd = reduceVjLayers(catchingUp, {
      type: "fadeEnded",
      layer: secondLayer,
      clipId: "two",
    });
    expect(staleFadeEnd).toBe(catchingUp);

    const ended = reduceVjLayers(catchingUp, {
      type: "catchUpEnded",
      layer: secondLayer,
      clipId: "two",
    });
    expect(ended.front).toBe(secondLayer);
    expect(ended.slots[secondLayer].phase).toBe("shown");
    expect(ended.pendingTarget).toBeNull();
    expect(ended.slots[firstLayer]).toEqual({
      clip: clipNamed("three"),
      phase: "loading",
    });
    expect(ended.incoming).toEqual({
      layer: firstLayer,
      mode: "fade",
      durationMs: 800,
      isArmed: true,
    });
  });

  it("keeps the latest tap while a catch-up runs and ignores a tap on the clip catching up", () => {
    const fading = twoFadingOverOne();
    const secondLayer = layerHolding(fading, "two");
    const catchingUp = reduceVjLayers(fading, {
      type: "target",
      clip: clipNamed("three"),
      transition: FADE,
    });
    const retapped = reduceVjLayers(catchingUp, {
      type: "target",
      clip: clipNamed("four"),
      transition: FADE,
    });
    expect(retapped.pendingTarget?.clip.clipId).toBe("four");
    expect(releasedVjSourceUrls(catchingUp, retapped)).toEqual([
      "blob:source-three",
    ]);

    const backToTwo = reduceVjLayers(retapped, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    expect(backToTwo.pendingTarget).toBeNull();
    expect(backToTwo.slots[secondLayer].phase).toBe("catchingUp");
    const ended = reduceVjLayers(backToTwo, {
      type: "catchUpEnded",
      layer: secondLayer,
      clipId: "two",
    });
    expect(ended.incoming).toBeNull();
    expect(ended.front).toBe(secondLayer);
  });

  it("keeps the instant swap for a cut, a black target and a cut during a catch-up", () => {
    const fading = twoFadingOverOne();
    const secondLayer = layerHolding(fading, "two");
    const cutAway = reduceVjLayers(fading, {
      type: "target",
      clip: clipNamed("three"),
      transition: CUT,
    });
    expect(cutAway.front).toBe(secondLayer);
    expect(cutAway.slots[secondLayer].phase).toBe("shown");
    expect(cutAway.pendingTarget).toBeNull();
    expect(cutAway.incoming?.mode).toBe("cut");

    const toBlack = reduceVjLayers(fading, {
      type: "target",
      clip: null,
      transition: FADE,
    });
    expect(toBlack.front).toBe(secondLayer);
    expect(toBlack.isBlackRequested).toBe(true);

    const catchingUp = reduceVjLayers(fading, {
      type: "target",
      clip: clipNamed("three"),
      transition: FADE,
    });
    const cutDuringCatchUp = reduceVjLayers(catchingUp, {
      type: "target",
      clip: clipNamed("four"),
      transition: CUT,
    });
    expect(cutDuringCatchUp.front).toBe(secondLayer);
    expect(cutDuringCatchUp.pendingTarget).toBeNull();
    expect(cutDuringCatchUp.incoming?.mode).toBe("cut");
    expect(
      VJ_LAYER_NAMES.map(
        (layerName) => cutDuringCatchUp.slots[layerName].clip?.clipId,
      ),
    ).toContain("four");
  });
});

describe("reduceVjLayers with targets in flight", () => {
  it("lets the latest target win while one is still loading", () => {
    const shown = showingClipOne();
    const loadingTwo = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    const loadingThree = reduceVjLayers(loadingTwo, {
      type: "target",
      clip: clipNamed("three"),
      transition: CUT,
    });
    const incomingLayer = layerHolding(loadingThree, "three");
    expect(
      VJ_LAYER_NAMES.some(
        (layerName) => loadingThree.slots[layerName].clip?.clipId === "two",
      ),
    ).toBe(false);
    expect(loadingThree.incoming?.mode).toBe("cut");

    const staleFrame = reduceVjLayers(loadingThree, {
      type: "firstFrame",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(staleFrame).toBe(loadingThree);
  });

  it("changes nothing when the live clip is targeted again", () => {
    const shown = showingClipOne();
    const retapped = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("one"),
      transition: CUT,
    });
    expect(retapped).toBe(shown);
  });

  it("raises the black curtain for no clip and keeps the old clip under it until the curtain is up", () => {
    const shown = showingClipOne();
    const frontLayer = shown.front;
    if (!frontLayer) throw new Error("expected a front layer");
    const black = reduceVjLayers(shown, {
      type: "target",
      clip: null,
      transition: { mode: "fade", durationMs: 1200 },
    });
    expect(black.isBlackRequested).toBe(true);
    expect(black.curtainFadeMs).toBe(1200);
    expect(black.front).toBe(frontLayer);
    expect(black.slots[frontLayer].phase).toBe("shown");
    expect(vjLayerOpacity(black, frontLayer)).toBe(1);

    const cutToBlack = reduceVjLayers(shown, {
      type: "target",
      clip: null,
      transition: CUT,
    });
    expect(cutToBlack.curtainFadeMs).toBe(0);
  });

  it("fades in from black under a lifting curtain", () => {
    const black = reduceVjLayers(showingClipOne(), {
      type: "target",
      clip: null,
      transition: FADE,
    });
    const loading = reduceVjLayers(black, {
      type: "target",
      clip: clipNamed("two"),
      transition: { mode: "fade", durationMs: 600 },
    });
    const incomingLayer = layerHolding(loading, "two");
    expect(loading.isBlackRequested).toBe(true);

    const lifted = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: incomingLayer,
      clipId: "two",
    });
    expect(lifted.isBlackRequested).toBe(false);
    expect(lifted.curtainFadeMs).toBe(600);
    expect(lifted.front).toBe(incomingLayer);
    expect(vjLayerOpacity(lifted, incomingLayer)).toBe(1);
    expect(lifted.slots[incomingLayer].phase).toBe("shown");

    const fromColdStart = applyAll([
      { type: "target", clip: clipNamed("first"), transition: FADE },
    ]);
    expect(fromColdStart.isBlackRequested).toBe(true);
    const coldLifted = reduceVjLayers(fromColdStart, {
      type: "firstFrame",
      layer: layerHolding(fromColdStart, "first"),
      clipId: "first",
    });
    expect(coldLifted.isBlackRequested).toBe(false);
    expect(coldLifted.curtainFadeMs).toBe(800);
  });
});

describe("reduceVjLayers invariants", () => {
  it("keeps an opaque layer under every live clip across 500 random event sequences", () => {
    let seed = 20261105;
    const nextRandom = (): number => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pick = <Item>(items: readonly Item[]): Item => {
      const item = items[Math.floor(nextRandom() * items.length)];
      if (item === undefined) throw new Error("empty pick");
      return item;
    };
    const clipIds = ["one", "two", "three", "four"];
    const transitions: VjResolvedTransition[] = [
      FADE,
      CUT,
      { mode: "fade", durationMs: 0 },
      { mode: "fade", durationMs: 4000 },
    ];

    const randomEvent = (state: VjLayerMachineState): VjLayerEvent => {
      const roll = nextRandom();
      if (roll < 0.35) {
        const clipId = nextRandom() < 0.15 ? null : pick(clipIds);
        return {
          type: "target",
          clip: clipId === null ? null : clipNamed(clipId),
          transition: pick(transitions),
        };
      }
      const layer = pick(VJ_LAYER_NAMES);
      const heldClipId = state.slots[layer].clip?.clipId;
      const clipId =
        heldClipId && nextRandom() < 0.85 ? heldClipId : pick(clipIds);
      if (roll < 0.65) return { type: "firstFrame", layer, clipId };
      if (roll < 0.8) return { type: "failed", layer, clipId };
      if (roll < 0.9) return { type: "catchUpEnded", layer, clipId };
      return { type: "fadeEnded", layer, clipId };
    };

    for (let sequenceIndex = 0; sequenceIndex < 500; sequenceIndex += 1) {
      let state = INITIAL_VJ_LAYERS;
      for (let eventIndex = 0; eventIndex < 40; eventIndex += 1) {
        state = reduceVjLayers(state, randomEvent(state));
        if (!state.isBlackRequested) {
          expect(state.front).not.toBeNull();
          if (state.front === null) return;
          expect(state.slots[state.front].phase).toBe("shown");
          expect(vjLayerOpacity(state, state.front)).toBe(1);
        }
        if (state.incoming) {
          const incomingSlot = state.slots[state.incoming.layer];
          expect(state.incoming.layer).not.toBe(state.front);
          expect(incomingSlot.clip).not.toBeNull();
          expect(["loading", "fadingIn", "catchingUp"]).toContain(
            incomingSlot.phase,
          );
          if (incomingSlot.phase !== "loading") {
            expect(vjLayerOpacity(state, state.incoming.layer)).toBe(1);
            expect(vjLayerZ(state, state.incoming.layer)).toBe(1);
          } else {
            expect(vjLayerOpacity(state, state.incoming.layer)).toBe(0);
          }
        }
        if (state.pendingTarget) {
          expect(state.incoming).not.toBeNull();
          if (state.incoming === null) return;
          expect(state.slots[state.incoming.layer].phase).toBe("catchingUp");
        }
      }
    }
  });

  it("hands back every source URL a slot let go", () => {
    const shown = showingClipOne();
    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: clipNamed("two"),
      transition: CUT,
    });
    expect(releasedVjSourceUrls(shown, loading)).toEqual([]);

    const replaced = reduceVjLayers(loading, {
      type: "target",
      clip: clipNamed("three"),
      transition: CUT,
    });
    expect(releasedVjSourceUrls(loading, replaced)).toEqual([
      "blob:source-two",
    ]);

    const cut = reduceVjLayers(replaced, {
      type: "firstFrame",
      layer: layerHolding(replaced, "three"),
      clipId: "three",
    });
    expect(releasedVjSourceUrls(replaced, cut)).toEqual(["blob:source-one"]);

    const beforeFailure = reduceVjLayers(cut, {
      type: "target",
      clip: clipNamed("four"),
      transition: FADE,
    });
    const failedLoad = reduceVjLayers(beforeFailure, {
      type: "failed",
      layer: layerHolding(beforeFailure, "four"),
      clipId: "four",
    });
    expect(releasedVjSourceUrls(beforeFailure, failedLoad)).toEqual([
      "blob:source-four",
    ]);

    const black = reduceVjLayers(failedLoad, {
      type: "target",
      clip: null,
      transition: CUT,
    });
    expect(releasedVjSourceUrls(failedLoad, black)).toEqual([]);
  });
});

/** Clip "one" shown, clip "two" prepared and primed in the free layer. */
function twoPrimedUnderOne(): VjLayerMachineState {
  const prepared = reduceVjLayers(showingClipOne(), {
    type: "prepare",
    source: clipNamed("two"),
  });
  return reduceVjLayers(prepared, {
    type: "firstFrame",
    layer: layerHolding(prepared, "two"),
    clipId: "two",
  });
}

describe("reduceVjLayers preparing the next source", () => {
  it("keeps a primed clip hidden under the front until its target arrives", () => {
    const shown = showingClipOne();
    const frontLayer = shown.front;
    if (!frontLayer) throw new Error("expected a front layer");
    const prepared = reduceVjLayers(shown, {
      type: "prepare",
      source: clipNamed("two"),
    });
    const preparedLayer = layerHolding(prepared, "two");
    expect(preparedLayer).not.toBe(frontLayer);
    expect(prepared.slots[preparedLayer].phase).toBe("loading");
    expect(prepared.incoming?.isArmed).toBe(false);

    const primed = reduceVjLayers(prepared, {
      type: "firstFrame",
      layer: preparedLayer,
      clipId: "two",
    });
    expect(primed.slots[preparedLayer].phase).toBe("primed");
    expect(primed.front).toBe(frontLayer);
    expect(primed.slots[frontLayer].phase).toBe("shown");
    expect(vjLayerOpacity(primed, preparedLayer)).toBe(0);
    expect(vjLayerZ(primed, preparedLayer)).toBe(0);
    expect(vjLayerOpacity(primed, frontLayer)).toBe(1);
    expect(vjLayerZ(primed, frontLayer)).toBe(1);

    const retargetedFront = reduceVjLayers(primed, {
      type: "target",
      clip: clipNamed("one"),
      transition: CUT,
    });
    expect(retargetedFront).toBe(primed);
    const staleFadeEnd = reduceVjLayers(primed, {
      type: "fadeEnded",
      layer: preparedLayer,
      clipId: "two",
    });
    expect(staleFadeEnd).toBe(primed);
  });

  it("starts the transition at once when the target names a primed clip", () => {
    const primed = twoPrimedUnderOne();
    const frontLayer = primed.front;
    if (!frontLayer) throw new Error("expected a front layer");
    const primedLayer = layerHolding(primed, "two");

    const fading = reduceVjLayers(primed, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    expect(fading.slots[primedLayer].phase).toBe("fadingIn");
    expect(fading.incoming).toEqual({
      layer: primedLayer,
      mode: "fade",
      durationMs: 800,
      isArmed: true,
    });
    expect(vjLayerOpacity(fading, primedLayer)).toBe(1);
    expect(vjLayerZ(fading, primedLayer)).toBe(1);
    expect(fading.front).toBe(frontLayer);

    const cut = reduceVjLayers(primed, {
      type: "target",
      clip: clipNamed("two"),
      transition: CUT,
    });
    expect(cut.front).toBe(primedLayer);
    expect(cut.slots[primedLayer].phase).toBe("shown");
    expect(cut.slots[frontLayer].phase).toBe("leaving");
    expect(cut.incoming).toBeNull();

    const black = reduceVjLayers(showingClipOne(), {
      type: "target",
      clip: null,
      transition: CUT,
    });
    const preparedUnderCurtain = reduceVjLayers(black, {
      type: "prepare",
      source: clipNamed("two"),
    });
    const primedUnderCurtain = reduceVjLayers(preparedUnderCurtain, {
      type: "firstFrame",
      layer: layerHolding(preparedUnderCurtain, "two"),
      clipId: "two",
    });
    expect(primedUnderCurtain.isBlackRequested).toBe(true);
    const lifted = reduceVjLayers(primedUnderCurtain, {
      type: "target",
      clip: clipNamed("two"),
      transition: { mode: "fade", durationMs: 600 },
    });
    expect(lifted.isBlackRequested).toBe(false);
    expect(lifted.curtainFadeMs).toBe(600);
    expect(lifted.front).toBe(layerHolding(primedUnderCurtain, "two"));
  });

  it("arms a still-loading prepared clip so it starts at its first frame", () => {
    const shown = showingClipOne();
    const prepared = reduceVjLayers(shown, {
      type: "prepare",
      source: clipNamed("two"),
    });
    const preparedLayer = layerHolding(prepared, "two");
    const armed = reduceVjLayers(prepared, {
      type: "target",
      clip: clipNamed("two"),
      transition: FADE,
    });
    expect(armed.slots[preparedLayer].phase).toBe("loading");
    expect(armed.incoming).toEqual({
      layer: preparedLayer,
      mode: "fade",
      durationMs: 800,
      isArmed: true,
    });
    expect(vjLayerOpacity(armed, preparedLayer)).toBe(0);

    const ignoredPrepare = reduceVjLayers(armed, {
      type: "prepare",
      source: clipNamed("three"),
    });
    expect(ignoredPrepare).toBe(armed);

    const fading = reduceVjLayers(armed, {
      type: "firstFrame",
      layer: preparedLayer,
      clipId: "two",
    });
    expect(fading.slots[preparedLayer].phase).toBe("fadingIn");
    expect(vjLayerOpacity(fading, preparedLayer)).toBe(1);
  });

  it("replaces an unarmed prepared clip with a newer prepare", () => {
    const primed = twoPrimedUnderOne();
    const preparedLayer = layerHolding(primed, "two");
    const replaced = reduceVjLayers(primed, {
      type: "prepare",
      source: clipNamed("three"),
    });
    expect(replaced.slots[preparedLayer]).toEqual({
      clip: clipNamed("three"),
      phase: "loading",
    });
    expect(replaced.incoming?.isArmed).toBe(false);
    expect(releasedVjSourceUrls(primed, replaced)).toEqual(["blob:source-two"]);

    const targetedElsewhere = reduceVjLayers(replaced, {
      type: "target",
      clip: clipNamed("four"),
      transition: FADE,
    });
    expect(targetedElsewhere.slots[preparedLayer].clip?.clipId).toBe("four");
    expect(targetedElsewhere.incoming?.isArmed).toBe(true);
    expect(releasedVjSourceUrls(replaced, targetedElsewhere)).toEqual([
      "blob:source-three",
    ]);

    const cancelled = reduceVjLayers(primed, { type: "prepare", source: null });
    expect(cancelled.incoming).toBeNull();
    expect(cancelled.slots[preparedLayer]).toEqual({
      clip: null,
      phase: "empty",
    });
    expect(releasedVjSourceUrls(primed, cancelled)).toEqual([
      "blob:source-two",
    ]);
  });

  it("treats a generator as ready at its first frame and never reports a source URL for it", () => {
    expect(vjGeneratorSourceKey("prideFlagWave", "trans")).toBe(
      "generator:prideFlagWave:trans",
    );
    expect(vjGeneratorSourceKey("plasma", null)).toBe("generator:plasma:");

    const plasma = generatorFixture("plasma");
    const shown = showingClipOne();
    const loading = reduceVjLayers(shown, {
      type: "target",
      clip: plasma,
      transition: CUT,
    });
    const generatorLayer = layerHolding(loading, plasma.clipId);
    expect(releasedVjSourceUrls(shown, loading)).toEqual([]);

    const cut = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: generatorLayer,
      clipId: plasma.clipId,
    });
    expect(cut.front).toBe(generatorLayer);
    expect(cut.slots[generatorLayer]).toEqual({ clip: plasma, phase: "shown" });
    expect(releasedVjSourceUrls(loading, cut)).toEqual(["blob:source-one"]);

    const backToClip = reduceVjLayers(cut, {
      type: "target",
      clip: clipNamed("two"),
      transition: CUT,
    });
    const clipShown = reduceVjLayers(backToClip, {
      type: "firstFrame",
      layer: layerHolding(backToClip, "two"),
      clipId: "two",
    });
    expect(clipShown.slots[generatorLayer].phase).toBe("leaving");
    expect(releasedVjSourceUrls(backToClip, clipShown)).toEqual([]);
    expect(releasedVjSourceUrls(cut, INITIAL_VJ_LAYERS)).toEqual([]);
  });
});

/** Every rule a reachable state keeps, primed and generator sources included. */
function expectLayerInvariants(state: VjLayerMachineState): void {
  if (!state.isBlackRequested) {
    expect(state.front).not.toBeNull();
    if (state.front === null) return;
    expect(state.slots[state.front].phase).toBe("shown");
    expect(vjLayerOpacity(state, state.front)).toBe(1);
  }
  if (state.incoming) {
    const incomingSlot = state.slots[state.incoming.layer];
    expect(state.incoming.layer).not.toBe(state.front);
    expect(incomingSlot.clip).not.toBeNull();
    expect(["loading", "primed", "fadingIn", "catchingUp"]).toContain(
      incomingSlot.phase,
    );
    if (!state.incoming.isArmed) {
      expect(["loading", "primed"]).toContain(incomingSlot.phase);
    }
    if (incomingSlot.phase === "primed")
      expect(state.incoming.isArmed).toBe(false);
    if (incomingSlot.phase === "loading" || incomingSlot.phase === "primed") {
      expect(vjLayerOpacity(state, state.incoming.layer)).toBe(0);
      expect(vjLayerZ(state, state.incoming.layer)).toBe(0);
    } else {
      expect(vjLayerOpacity(state, state.incoming.layer)).toBe(1);
      expect(vjLayerZ(state, state.incoming.layer)).toBe(1);
    }
  }
  if (state.pendingTarget) {
    expect(state.incoming).not.toBeNull();
    if (state.incoming === null) return;
    expect(state.slots[state.incoming.layer].phase).toBe("catchingUp");
  }
  for (const layer of VJ_LAYER_NAMES) {
    const phase = state.slots[layer].phase;
    if (phase === "primed") expect(state.incoming?.layer).toBe(layer);
  }
}

describe("reduceVjLayers invariants with prepared sources", () => {
  it("keeps an opaque layer under every live source across 500 random event sequences that include prepare and generators", () => {
    let seed = 20261106;
    const nextRandom = (): number => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pick = <Item>(items: readonly Item[]): Item => {
      const item = items[Math.floor(nextRandom() * items.length)];
      if (item === undefined) throw new Error("empty pick");
      return item;
    };
    const sources: VjRenderableSource[] = [
      clipNamed("one"),
      clipNamed("two"),
      clipNamed("three"),
      generatorFixture("plasma"),
      generatorFixture("prideFlagWave", "trans"),
    ];
    const transitions: VjResolvedTransition[] = [
      FADE,
      CUT,
      { mode: "dipBlack", durationMs: 1000 },
      { mode: "fade", durationMs: 0 },
      { mode: "wipeLeft", durationMs: 4000 },
    ];

    const randomEvent = (state: VjLayerMachineState): VjLayerEvent => {
      const roll = nextRandom();
      if (roll < 0.25) {
        return {
          type: "target",
          clip: nextRandom() < 0.15 ? null : pick(sources),
          transition: pick(transitions),
        };
      }
      if (roll < 0.4) {
        return {
          type: "prepare",
          source: nextRandom() < 0.1 ? null : pick(sources),
        };
      }
      const layer = pick(VJ_LAYER_NAMES);
      const heldClipId = state.slots[layer].clip?.clipId;
      const clipId =
        heldClipId && nextRandom() < 0.85 ? heldClipId : pick(sources).clipId;
      if (roll < 0.68) return { type: "firstFrame", layer, clipId };
      if (roll < 0.8) return { type: "failed", layer, clipId };
      if (roll < 0.9) return { type: "catchUpEnded", layer, clipId };
      return { type: "fadeEnded", layer, clipId };
    };

    for (let sequenceIndex = 0; sequenceIndex < 500; sequenceIndex += 1) {
      let state = INITIAL_VJ_LAYERS;
      for (let eventIndex = 0; eventIndex < 40; eventIndex += 1) {
        const next = reduceVjLayers(state, randomEvent(state));
        expect(releasedVjSourceUrls(state, next)).not.toContain("");
        state = next;
        expectLayerInvariants(state);
      }
    }
  });
});
