import { describe, expect, it } from "vitest";
import {
  INITIAL_VJ_RENDERER,
  isVjDomRendererForced,
  reduceVjRenderer,
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
    });
    expect(vjRendererOf(INITIAL_VJ_RENDERER)).toBe("webgl2");
    expect(run({ type: "ready" })).toEqual({
      phase: "webgl2",
      reason: null,
      lossCount: 0,
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
    });
  });

  it("returns to WebGL after the restore", () => {
    const state = run(
      { type: "ready" },
      { type: "contextLost", lossCount: 1 },
      { type: "contextRestored" },
    );
    expect(state).toEqual({ phase: "webgl2", reason: null, lossCount: 1 });
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
    });
    // The DOM renderer stays for the page's life.
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
    expect(state).toEqual({ phase: "dom", reason: "forced", lossCount: 0 });
  });

  it("reports dom as the renderer while restoring", () => {
    const state = run({ type: "ready" }, { type: "contextLost", lossCount: 1 });
    expect(vjRendererOf(state)).toBe("dom");
  });
});
