import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjFakeWebGl2Canvas,
  installVjFakeWebGl2,
} from "../../../../test/vjFakeWebGl2";
import {
  VJ_GL_CONTEXT_ATTRIBUTES,
  createVjGlContext,
  resetVjWebGl2ProbeForTests,
} from "./vjGlContext";

function noopHandlers() {
  return { onLost: vi.fn(), onRestored: vi.fn() };
}

describe("createVjGlContext", () => {
  beforeEach(() => {
    resetVjWebGl2ProbeForTests();
  });

  it("answers webgl2Missing when the browser has no WebGL2", () => {
    installVjFakeWebGl2({ isContextAvailable: false });
    const canvas = document.createElement("canvas");

    const result = createVjGlContext(canvas, noopHandlers());

    expect(result).toEqual({ ok: false, reason: "webgl2Missing" });
  });

  it("answers softwareRenderer when only the performance caveat refuses the context", () => {
    installVjFakeWebGl2({ isSoftwareOnly: true });
    const canvas = document.createElement("canvas");

    const result = createVjGlContext(canvas, noopHandlers());

    expect(result).toEqual({ ok: false, reason: "softwareRenderer" });
  });

  it("answers contextCreationFailed when getContext throws", () => {
    const fake = createVjFakeWebGl2Canvas({ shouldThrowOnGetContext: true });

    const result = createVjGlContext(fake.canvas, noopHandlers());

    expect(result).toEqual({ ok: false, reason: "contextCreationFailed" });
  });

  it("asks for the engine attributes and keeps straight alpha with no flip", () => {
    const fake = createVjFakeWebGl2Canvas();
    const getContext = vi.spyOn(fake.canvas, "getContext");

    const result = createVjGlContext(fake.canvas, noopHandlers());

    expect(result.ok).toBe(true);
    expect(getContext).toHaveBeenCalledWith("webgl2", VJ_GL_CONTEXT_ATTRIBUTES);
    expect(VJ_GL_CONTEXT_ATTRIBUTES.failIfMajorPerformanceCaveat).toBe(true);
    expect(fake.callsNamed("pixelStorei").map((call) => call.args)).toEqual([
      [fake.context.UNPACK_FLIP_Y_WEBGL, false],
      [fake.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false],
    ]);
  });

  it("counts every context loss and calls preventDefault so a restore can follow", () => {
    const fake = createVjFakeWebGl2Canvas();
    const handlers = noopHandlers();
    const result = createVjGlContext(fake.canvas, handlers);
    if (!result.ok) throw new Error("expected a context");

    const wasFirstPrevented = fake.loseContext();
    expect(result.context.isLost()).toBe(true);
    fake.restoreContext();
    const wasSecondPrevented = fake.loseContext();

    expect(wasFirstPrevented).toBe(true);
    expect(wasSecondPrevented).toBe(true);
    expect(handlers.onLost.mock.calls).toEqual([[1], [2]]);
    expect(result.context.lossCount).toBe(2);
  });

  it("calls onRestored after webglcontextrestored", () => {
    const fake = createVjFakeWebGl2Canvas({ hasParallelCompile: true });
    const handlers = noopHandlers();
    const result = createVjGlContext(fake.canvas, handlers);
    if (!result.ok) throw new Error("expected a context");

    fake.loseContext();
    expect(handlers.onRestored).not.toHaveBeenCalled();
    fake.restoreContext();

    expect(handlers.onRestored).toHaveBeenCalledTimes(1);
    expect(result.context.isLost()).toBe(false);
    expect(result.context.parallelCompile).not.toBeNull();
    expect(fake.callsNamed("pixelStorei")).toHaveLength(4);
  });

  it("removes its listeners on dispose", () => {
    const fake = createVjFakeWebGl2Canvas();
    const handlers = noopHandlers();
    const result = createVjGlContext(fake.canvas, handlers);
    if (!result.ok) throw new Error("expected a context");

    result.context.dispose();
    const wasPreventedAfterDispose = fake.loseContext();
    fake.restoreContext();

    expect(wasPreventedAfterDispose).toBe(false);
    expect(handlers.onLost).not.toHaveBeenCalled();
    expect(handlers.onRestored).not.toHaveBeenCalled();
  });

  it("frees the context through WEBGL_lose_context on dispose", () => {
    const fake = createVjFakeWebGl2Canvas();
    const result = createVjGlContext(fake.canvas, noopHandlers());
    if (!result.ok) throw new Error("expected a context");

    result.context.dispose();

    expect(result.context.isLost()).toBe(true);
    expect(
      fake.callsNamed("getExtension").map((call) => call.args[0]),
    ).toContain("WEBGL_lose_context");
  });
});
