import { describe, expect, it, vi } from "vitest";
import {
  createVjFakeWebGl2Canvas,
  type VjFakeWebGl2Options,
} from "../../../test/vjFakeWebGl2";
import { createVjGlContext } from "./gl/vjGlContext";
import { VJ_PROGRAM_KEYS } from "./shaders/vjProgramKeys";
import { VJ_CORE_PROGRAM_KEYS, VjProgramCache } from "./vjProgramCache";
import { VJ_SHADER_SOURCES } from "./vjShaderSources";

function setUp(options: VjFakeWebGl2Options = {}) {
  const fake = createVjFakeWebGl2Canvas(options);
  const result = createVjGlContext(fake.canvas, {
    onLost: vi.fn(),
    onRestored: vi.fn(),
  });
  if (!result.ok) throw new Error("expected a context");
  const cache = new VjProgramCache(result.context);
  cache.startAll();
  return { fake, context: result.context, cache };
}

describe("VjProgramCache", () => {
  it("has a shader source for every program key", () => {
    for (const programKey of VJ_PROGRAM_KEYS) {
      const source = VJ_SHADER_SOURCES[programKey];
      expect(source.fragment).toContain(`// vj-program-key: ${programKey}\n`);
      expect(source.fragment.startsWith("#version 300 es")).toBe(true);
    }
    expect(Object.keys(VJ_SHADER_SOURCES).sort()).toEqual(
      [...VJ_PROGRAM_KEYS].sort(),
    );
  });

  it("answers ready once every program linked", () => {
    const { fake, cache } = setUp({ hasParallelCompile: true });

    expect(cache.poll()).toBe("compiling");
    expect(cache.get("output")).toBeNull();

    fake.completeCompiles();

    expect(cache.poll()).toBe("ready");
    for (const programKey of VJ_PROGRAM_KEYS) {
      expect(cache.get(programKey)?.status).toBe("linked");
    }
    expect(cache.failedKeys()).toEqual([]);
    expect(fake.programs()).toHaveLength(VJ_PROGRAM_KEYS.length);
  });

  it("answers coreFailed when the output program fails to link", () => {
    expect(VJ_CORE_PROGRAM_KEYS).toContain("output");
    const { cache } = setUp({ failingProgramKeys: ["output"] });

    expect(cache.poll()).toBe("coreFailed");
    expect(cache.get("output")).toBeNull();
    expect(cache.failedKeys()).toEqual(["output"]);
  });

  it("keeps working with a failed texture program and lists it", () => {
    const { cache } = setUp({ failingProgramKeys: ["texture.vhs"] });

    expect(cache.poll()).toBe("ready");
    expect(cache.get("texture.vhs")).toBeNull();
    expect(cache.get("texture.filmGrain")?.status).toBe("linked");
    expect(cache.get("output")?.status).toBe("linked");
    expect(cache.failedKeys()).toEqual(["texture.vhs"]);
  });

  it("maps each sampler to its texture unit in source order", () => {
    const { cache } = setUp();

    expect(cache.samplerUnitsOf("output")).toEqual({
      uSource: 0,
      uPrevious: 1,
    });
    expect(cache.samplerCountOf("transition.fade")).toBe(2);
    expect(cache.samplerCountOf("generator.plasma")).toBe(0);
  });

  it("rebuilds every program after a restore", () => {
    const { fake, cache } = setUp();
    expect(cache.poll()).toBe("ready");
    const outputBefore = cache.get("output");

    fake.loseContext();
    fake.restoreContext();
    cache.rebuild();

    expect(fake.programs()).toHaveLength(VJ_PROGRAM_KEYS.length * 2);
    expect(cache.poll()).toBe("ready");
    const outputAfter = cache.get("output");
    expect(outputAfter?.status).toBe("linked");
    expect(outputAfter).not.toBe(outputBefore);
    expect(outputBefore?.program).toBeNull();
  });
});
