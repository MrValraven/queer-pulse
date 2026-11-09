import { describe, expect, it } from "vitest";
import {
  INITIAL_VJ_RENDERER,
  initialVjRendererOf,
  isVjDomRendererForced,
  reduceVjRenderer,
  vjDrawingRendererOf,
  vjRendererMountsKey,
  vjRendererMountsOf,
  vjRendererOf,
  type VjRendererEvent,
  type VjRendererState,
} from "./vjRendererKind";

function run(...events: VjRendererEvent[]): VjRendererState {
  return events.reduce(reduceVjRenderer, INITIAL_VJ_RENDERER);
}

describe("reduceVjRenderer", () => {
  it("starts probing on WebGL and moves to webgl2 once the compositor is ready", () => {
    expect(INITIAL_VJ_RENDERER).toEqual({
      phase: "probing",
      reason: null,
      lossCount: 0,
      retiredReason: null,
      handOffFrom: null,
    });
    expect(vjRendererOf(INITIAL_VJ_RENDERER)).toBe("webgl2");
    expect(run({ type: "ready" })).toEqual({
      phase: "webgl2",
      reason: null,
      lossCount: 0,
      retiredReason: null,
      handOffFrom: null,
    });
  });

  it("uses DOM at once when WebGL2 is missing and names the reason", () => {
    const state = run({ type: "unavailable", reason: "webgl2Missing" });
    expect(state.phase).toBe("dom");
    expect(state.reason).toBe("webgl2Missing");
    expect(vjRendererOf(state)).toBe("dom");
  });

  it("names a program failure after the compositor started", () => {
    const state = run(
      { type: "ready" },
      { type: "unavailable", reason: "programFailed" },
    );
    expect(state).toMatchObject({ phase: "dom", reason: "programFailed" });
  });

  it("shows the DOM renderer while WebGL restores after one loss", () => {
    const state = run({ type: "ready" }, { type: "contextLost", lossCount: 1 });
    expect(state).toEqual({
      phase: "webgl2Restoring",
      reason: "contextLost",
      lossCount: 1,
      retiredReason: null,
      handOffFrom: null,
    });
  });

  it("returns to WebGL after the restore", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      { type: "contextRestored" },
    );
    expect(state).toEqual({
      phase: "webgl2",
      reason: null,
      lossCount: 1,
      retiredReason: null,
      handOffFrom: null,
    });
    expect(vjRendererOf(state)).toBe("webgl2");
  });

  it("settles on DOM after the second loss", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      { type: "contextRestored" },
      { type: "contextLost", lossCount: 2 },
    );
    expect(state).toEqual({
      phase: "dom",
      reason: "contextLost",
      lossCount: 2,
      retiredReason: "contextLost",
      handOffFrom: null,
    });
    // Engine events leave the DOM renderer in place once WebGL is retired.
    expect(
      run(
        { type: "ready" },
        { type: "contextLost", lossCount: 1 },
        { type: "contextRestored" },
        { type: "contextLost", lossCount: 2 },
        { type: "contextRestored" },
        { type: "ready" },
      ).phase,
    ).toBe("dom");
  });

  it("settles on DOM when a second loss lands during the restore", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      { type: "contextLost", lossCount: 2 },
    );
    expect(state).toMatchObject({ phase: "dom", lossCount: 2 });
  });

  it("counts losses across a fresh context that restarts its own count", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      { type: "contextRestored" },
      { type: "contextLost", lossCount: 1 },
    );
    expect(state).toMatchObject({ phase: "dom", lossCount: 2 });
  });

  it("forces DOM with the query flag", () => {
    expect(isVjDomRendererForced("?vjRenderer=dom")).toBe(true);
    expect(isVjDomRendererForced("?screen=2&vjRenderer=dom")).toBe(true);
    expect(isVjDomRendererForced("?vjRenderer=webgl2")).toBe(false);
    expect(isVjDomRendererForced("")).toBe(false);
    const state = run({ type: "forcedDom" }, { type: "ready" });
    expect(state).toEqual({
      phase: "dom",
      reason: "forced",
      lossCount: 0,
      retiredReason: "forced",
      handOffFrom: null,
    });
  });

  it("reports dom as the renderer while restoring", () => {
    const state = run({ type: "ready" }, { type: "contextLost", lossCount: 1 });
    expect(vjRendererOf(state)).toBe("dom");
  });
});

const simple = { type: "remoteMode", mode: "simple" } as const;
const effects = { type: "remoteMode", mode: "effects" } as const;
const shownSimple = { type: "rendererShown", renderer: "simple" } as const;

describe("reduceVjRenderer with the simple renderer", () => {
  it("opens straight on simple with nothing to hand off from", () => {
    expect(
      initialVjRendererOf({ isDomForced: false, renderMode: "simple" }),
    ).toEqual({
      phase: "simple",
      reason: null,
      lossCount: 0,
      retiredReason: null,
      handOffFrom: null,
    });
    expect(
      initialVjRendererOf({ isDomForced: true, renderMode: "effects" }),
    ).toEqual({
      phase: "dom",
      reason: "forced",
      lossCount: 0,
      retiredReason: "forced",
      handOffFrom: null,
    });
    expect(
      initialVjRendererOf({ isDomForced: true, renderMode: "simple" }),
    ).toEqual({
      phase: "simple",
      reason: null,
      lossCount: 0,
      retiredReason: "forced",
      handOffFrom: null,
    });
    expect(
      initialVjRendererOf({ isDomForced: false, renderMode: "effects" }),
    ).toBe(INITIAL_VJ_RENDERER);
  });

  it("keeps the engine drawing until the simple renderer shows", () => {
    const switching = run({ type: "ready" }, simple);
    expect(switching).toMatchObject({ phase: "simple", handOffFrom: "webgl2" });
    expect(vjRendererMountsOf(switching)).toEqual({
      isEngineMounted: true,
      isEngineHidden: false,
      isDomMounted: false,
      isDomArriving: false,
      isSimpleMounted: true,
      isSimpleArriving: true,
    });
    const settled = reduceVjRenderer(switching, shownSimple);
    expect(vjRendererMountsOf(settled)).toMatchObject({
      isEngineMounted: false,
      isSimpleArriving: false,
    });
    expect(vjRendererOf(settled)).toBe("simple");
  });

  it("probes the engine under the simple renderer and hands over on its first live frame", () => {
    const back = run({ type: "ready" }, simple, shownSimple, effects);
    expect(back).toMatchObject({
      phase: "probing",
      reason: null,
      handOffFrom: "simple",
    });
    const ready = reduceVjRenderer(back, { type: "ready" });
    expect(ready).toMatchObject({ phase: "webgl2", handOffFrom: "simple" });
    expect(
      reduceVjRenderer(ready, { type: "firstLiveFrame" }).handOffFrom,
    ).toBeNull();
  });

  it("ignores firstLiveFrame when nothing waits for it", () => {
    const state = run({ type: "ready" });
    expect(reduceVjRenderer(state, { type: "firstLiveFrame" })).toBe(state);
  });

  it("reverses a hand-off in flight back to the renderer still drawing", () => {
    expect(run({ type: "ready" }, simple, effects)).toMatchObject({
      phase: "webgl2",
      handOffFrom: null,
    });
    expect(
      run({ type: "ready" }, simple, shownSimple, effects, simple),
    ).toMatchObject({ phase: "simple", handOffFrom: null });
  });

  it("returns a WebGL that failed on its own to dom, with the simple renderer drawing until dom shows", () => {
    const state = run(
      { type: "unavailable", reason: "programFailed" },
      simple,
      shownSimple,
      effects,
    );
    expect(state).toMatchObject({
      phase: "dom",
      reason: "programFailed",
      retiredReason: "programFailed",
      handOffFrom: "simple",
    });
    expect(vjRendererMountsOf(state)).toMatchObject({
      isEngineMounted: false,
      isDomArriving: true,
      isSimpleMounted: true,
    });
    expect(
      reduceVjRenderer(state, { type: "rendererShown", renderer: "dom" })
        .handOffFrom,
    ).toBeNull();
  });

  it("keeps a forced dom page on dom when effects are asked", () => {
    const forced = initialVjRendererOf({
      isDomForced: true,
      renderMode: "effects",
    });
    expect(reduceVjRenderer(forced, effects)).toBe(forced);
    const viaSimple = [simple, shownSimple, effects].reduce(
      reduceVjRenderer,
      forced,
    );
    expect(viaSimple).toMatchObject({ phase: "dom", reason: "forced" });
  });

  it("takes over from a restoring engine and goes back to restoring", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      simple,
    );
    expect(state).toMatchObject({
      phase: "simple",
      handOffFrom: "webgl2Restoring",
    });
    expect(vjRendererMountsOf(state)).toMatchObject({
      isEngineMounted: true,
      isEngineHidden: true,
      isDomMounted: true,
      isSimpleArriving: true,
    });
    expect(reduceVjRenderer(state, effects)).toMatchObject({
      phase: "webgl2Restoring",
      reason: "contextLost",
      handOffFrom: null,
    });
  });

  it("retires WebGL when the leaving engine breaks during the hand-off", () => {
    const state = run({ type: "ready" }, simple, {
      type: "unavailable",
      reason: "contextCreationFailed",
    });
    expect(state).toMatchObject({
      phase: "simple",
      handOffFrom: null,
      retiredReason: "contextCreationFailed",
    });
    expect(reduceVjRenderer(state, effects)).toMatchObject({
      phase: "dom",
      handOffFrom: "simple",
    });
  });

  it("moves to dom when the arriving engine fails and keeps the simple renderer on top", () => {
    expect(
      run({ type: "ready" }, simple, shownSimple, effects, {
        type: "unavailable",
        reason: "programFailed",
      }),
    ).toMatchObject({ phase: "dom", handOffFrom: "simple" });
  });

  it("ends any hand-off on handOffTimedOut", () => {
    expect(
      run({ type: "ready" }, simple, { type: "handOffTimedOut" }).handOffFrom,
    ).toBeNull();
    const settled = run({ type: "ready" });
    expect(reduceVjRenderer(settled, { type: "handOffTimedOut" })).toBe(
      settled,
    );
  });

  it("ignores engine events while no engine is mounted", () => {
    const state = initialVjRendererOf({
      isDomForced: false,
      renderMode: "simple",
    });
    expect(reduceVjRenderer(state, { type: "contextLost", lossCount: 1 })).toBe(
      state,
    );
  });
});

describe("reduceVjRenderer when a restoring engine breaks during the hand-off", () => {
  it("keeps the DOM renderer drawing when a restoring engine fails during the hand-off", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      simple,
      { type: "unavailable", reason: "programFailed" },
    );
    expect(state).toMatchObject({
      phase: "simple",
      handOffFrom: "dom",
      retiredReason: "programFailed",
    });
    expect(vjRendererMountsOf(state)).toMatchObject({
      isEngineMounted: false,
      isDomMounted: true,
      isSimpleArriving: true,
    });
    expect(reduceVjRenderer(state, effects)).toMatchObject({
      phase: "dom",
      reason: "programFailed",
      handOffFrom: null,
    });
    expect(reduceVjRenderer(state, shownSimple).handOffFrom).toBeNull();
  });

  it("keeps the DOM renderer drawing when a restoring engine loses its context again during the hand-off", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      simple,
      { type: "contextLost", lossCount: 2 },
    );
    expect(state).toMatchObject({
      phase: "simple",
      handOffFrom: "dom",
      retiredReason: "contextLost",
      lossCount: 2,
    });
    expect(vjRendererMountsOf(state)).toMatchObject({
      isEngineMounted: false,
      isDomMounted: true,
      isSimpleArriving: true,
    });
    expect(reduceVjRenderer(state, effects)).toMatchObject({
      phase: "dom",
      reason: "contextLost",
      handOffFrom: null,
    });
  });
});

describe("vjDrawingRendererOf and vjRendererMountsKey", () => {
  it("names each phase's drawing renderer", () => {
    expect(vjDrawingRendererOf(INITIAL_VJ_RENDERER)).toBe("engine");
    expect(
      vjDrawingRendererOf(
        run({ type: "ready" }, { type: "contextLost", lossCount: 1 }),
      ),
    ).toBe("dom");
    expect(vjDrawingRendererOf(run(simple))).toBe("simple");
  });

  it("keys the mounts by which renderers are on the stage", () => {
    expect(
      vjRendererMountsKey(vjRendererMountsOf(run({ type: "ready" }))),
    ).toBe("true|false|false");
    expect(
      vjRendererMountsKey(vjRendererMountsOf(run({ type: "ready" }, simple))),
    ).toBe("true|false|true");
  });
});
