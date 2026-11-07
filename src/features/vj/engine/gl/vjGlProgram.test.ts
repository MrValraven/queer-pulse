import { describe, expect, it, vi } from "vitest";
import {
  createVjFakeWebGl2Canvas,
  type VjFakeWebGl2Options,
} from "../../../../test/vjFakeWebGl2";
import { createVjGlContext } from "./vjGlContext";
import { pollVjProgram, setVjUniforms, startVjProgram } from "./vjGlProgram";

const VERTEX = "#version 300 es\nvoid main() { gl_Position = vec4(0.0); }";

const FRAGMENT = [
  "#version 300 es",
  "precision highp float;",
  "// vj-program-key: colour",
  "uniform float uMonochrome;",
  "uniform int uMirrorMode;",
  "uniform vec3 uPrideColours[11];",
  "uniform sampler2D uSource;",
  "uniform float uGrainAmount; // vj-optimised-out",
  "out vec4 outColour;",
  "void main() { outColour = vec4(1.0); }",
].join("\n");

function setUp(options: VjFakeWebGl2Options = {}) {
  const fake = createVjFakeWebGl2Canvas(options);
  const result = createVjGlContext(fake.canvas, {
    onLost: vi.fn(),
    onRestored: vi.fn(),
  });
  if (!result.ok) throw new Error("expected a context");
  return { fake, context: result.context };
}

function uniformCalls(fake: ReturnType<typeof setUp>["fake"]) {
  return fake.calls
    .filter((call) => /^uniform/.test(call.name))
    .map((call) => ({
      name: call.name,
      uniform: (call.args[0] as { name: string }).name,
      value: call.args[1],
    }));
}

describe("vjGlProgram", () => {
  it("caches the location and type of every active uniform after link", () => {
    const { fake, context } = setUp();

    const program = startVjProgram(context, "colour", VERTEX, FRAGMENT);
    setVjUniforms(context, program, { uMonochrome: 0.2 });
    setVjUniforms(context, program, { uMonochrome: 0.4 });

    expect(program.status).toBe("linked");
    expect(program.failure).toBeNull();
    expect(fake.callsNamed("getActiveUniform")).toHaveLength(4);
    expect(
      fake.callsNamed("getUniformLocation").map((call) => call.args[1]),
    ).toEqual(["uMonochrome", "uMirrorMode", "uPrideColours[0]", "uSource"]);
    expect(fake.callsNamed("uniform1f").map((call) => call.args[1])).toEqual([
      0.2, 0.4,
    ]);
  });

  it("sets a float, an int, a vec3 array and a sampler by the cached type", () => {
    const { fake, context } = setUp();
    const program = startVjProgram(context, "colour", VERTEX, FRAGMENT);
    const prideColours = new Float32Array(33).fill(0.5);

    setVjUniforms(context, program, {
      uMonochrome: 0.75,
      uMirrorMode: 2,
      uPrideColours: prideColours,
      uSource: 1,
    });

    expect(uniformCalls(fake)).toEqual([
      { name: "uniform1f", uniform: "uMonochrome", value: 0.75 },
      { name: "uniform1i", uniform: "uMirrorMode", value: 2 },
      { name: "uniform3fv", uniform: "uPrideColours[0]", value: prideColours },
      { name: "uniform1i", uniform: "uSource", value: 1 },
    ]);
  });

  it("ignores a uniform the compiler optimised out", () => {
    const { fake, context } = setUp();
    const program = startVjProgram(context, "colour", VERTEX, FRAGMENT);

    setVjUniforms(context, program, { uGrainAmount: 0.6, uNeverDeclared: 1 });

    expect(uniformCalls(fake)).toEqual([]);
  });

  it("reports a link failure by program key without reading the info log", () => {
    const { fake, context } = setUp({ failingProgramKeys: ["colour"] });

    const program = startVjProgram(context, "colour", VERTEX, FRAGMENT);

    expect(program).toMatchObject({
      key: "colour",
      status: "failed",
      failure: "link",
      program: null,
    });
    expect(fake.callsNamed("deleteProgram")).toHaveLength(1);
    expect(fake.callsNamed("getShaderInfoLog")).toEqual([]);
    expect(fake.callsNamed("getProgramInfoLog")).toEqual([]);
  });

  it("stays compiling until the parallel compile extension says complete", () => {
    const { fake, context } = setUp({ hasParallelCompile: true });
    const linkStatus = fake.context.LINK_STATUS;

    const program = startVjProgram(context, "colour", VERTEX, FRAGMENT);
    const firstPoll = pollVjProgram(context, program);
    const linkReadsBeforeComplete = fake
      .callsNamed("getProgramParameter")
      .filter((call) => call.args[1] === linkStatus).length;
    fake.completeCompiles();
    const secondPoll = pollVjProgram(context, program);

    expect(firstPoll).toBe("compiling");
    expect(linkReadsBeforeComplete).toBe(0);
    expect(secondPoll).toBe("linked");
    expect(program.status).toBe("linked");
  });
});
