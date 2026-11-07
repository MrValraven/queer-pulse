import { describe, expect, it, vi } from "vitest";
import {
  createVjFakeWebGl2Canvas,
  type VjFakeGlCall,
  type VjFakeWebGl2Options,
} from "../../../test/vjFakeWebGl2";
import { createVjGlContext } from "./gl/vjGlContext";
import { createVjFullscreenTriangle } from "./gl/vjGlQuad";
import type { VjRenderTarget } from "./gl/vjGlTargets";
import { createVjFrameUniformValues } from "./vjFrameUniforms";
import type { VjPassStep, VjTargetName } from "./vjPassGraph";
import { VjProgramCache } from "./vjProgramCache";
import {
  presentVjOutput,
  runVjPassGraph,
  type VjPassRunnerTargets,
} from "./vjPassRunner";

const WIDTH = 1920;
const HEIGHT = 1080;

interface NamedHandle {
  name: string;
}

function namedTarget(name: string, scale: number): VjRenderTarget {
  return {
    texture: { name: `${name}Texture` },
    framebuffer: { name: `${name}Framebuffer` },
    width: WIDTH * scale,
    height: HEIGHT * scale,
  };
}

function createTargets() {
  const cache = new Map<string, VjRenderTarget>();
  const resolved: { name: VjTargetName; scale: number }[] = [];
  const targets: VjPassRunnerTargets = {
    resolve: (name, scale) => {
      resolved.push({ name, scale });
      const key = `${name}@${scale}`;
      let target = cache.get(key);
      if (!target) {
        target = namedTarget(name, scale);
        cache.set(key, target);
      }
      return target;
    },
  };
  return { targets, resolved };
}

function setUp(options: VjFakeWebGl2Options = {}) {
  const fake = createVjFakeWebGl2Canvas(options);
  const result = createVjGlContext(fake.canvas, {
    onLost: vi.fn(),
    onRestored: vi.fn(),
  });
  if (!result.ok) throw new Error("expected a context");
  const context = result.context;
  const programs = new VjProgramCache(context);
  programs.startAll();
  if (programs.poll() !== "ready") throw new Error("expected ready programs");
  const triangle = createVjFullscreenTriangle(context.gl);
  const { targets, resolved } = createTargets();
  const run = (
    steps: readonly VjPassStep[],
    bindLayer: (name: VjTargetName, unit: number) => boolean = () => true,
  ) => {
    fake.calls.length = 0;
    runVjPassGraph(
      context,
      programs,
      targets,
      triangle,
      steps,
      createVjFrameUniformValues(),
      bindLayer,
    );
  };
  return { fake, context, programs, run, resolved };
}

function handleName(value: unknown): string | null {
  return (value as NamedHandle | null)?.name ?? null;
}

/** The framebuffer bound to FRAMEBUFFER at each draw, in order. */
function drawnFramebuffers(
  calls: readonly VjFakeGlCall[],
  gl: WebGL2RenderingContext,
) {
  let bound: string | null = null;
  const drawn: (string | null)[] = [];
  for (const call of calls) {
    if (call.name === "bindFramebuffer" && call.args[0] === gl.FRAMEBUFFER) {
      bound = handleName(call.args[1]);
    }
    if (call.name === "drawArrays") drawn.push(bound);
  }
  return drawn;
}

/** Texture bound to each unit, in call order: [unit, texture name]. */
function unitBindings(
  calls: readonly VjFakeGlCall[],
  gl: WebGL2RenderingContext,
) {
  let unit = 0;
  const bindings: [number, string | null][] = [];
  for (const call of calls) {
    if (call.name === "activeTexture")
      unit = Number(call.args[0]) - gl.TEXTURE0;
    if (call.name === "bindTexture" && call.args[0] === gl.TEXTURE_2D) {
      bindings.push([unit, handleName(call.args[1])]);
    }
  }
  return bindings;
}

function intUniforms(calls: readonly VjFakeGlCall[]) {
  return calls
    .filter((call) => call.name === "uniform1i")
    .map((call) => [handleName(call.args[0]), call.args[1]]);
}

function floatUniform(calls: readonly VjFakeGlCall[], uniformName: string) {
  return calls
    .filter((call) => call.name === "uniform1f")
    .filter((call) => handleName(call.args[0]) === uniformName)
    .map((call) => call.args[1]);
}

const MIX_STEP: VjPassStep = {
  programKey: "mix",
  inputs: ["chainB", "mix"],
  output: "chainA",
  uniforms: { uMixAmount: 0.5, uBlendMode: 1 },
  scale: 1,
};

describe("runVjPassGraph", () => {
  it("binds inputs to units in sampler order", () => {
    const { fake, context, run } = setUp();

    run([MIX_STEP]);

    expect(unitBindings(fake.calls, context.gl)).toEqual([
      [0, "chainBTexture"],
      [1, "mixTexture"],
    ]);
    expect(intUniforms(fake.calls)).toEqual([
      ["uBase", 0],
      ["uLayer", 1],
      ["uBlendMode", 1],
    ]);
    expect(drawnFramebuffers(fake.calls, context.gl)).toEqual([
      "chainAFramebuffer",
    ]);
  });

  it("clears a layer target that no step of the frame wrote before reading it", () => {
    const { fake, run } = setUp();

    run([MIX_STEP]);

    const clearIndex = fake.calls.findIndex((call) => call.name === "clear");
    const clearTarget = fake.calls
      .slice(0, clearIndex)
      .filter((call) => call.name === "bindFramebuffer")
      .at(-1);
    expect(handleName(clearTarget?.args[1])).toBe("mixFramebuffer");
    expect(fake.callsNamed("clear")).toHaveLength(1);
  });

  it("draws each step into its output at its scale", () => {
    const { fake, context, run, resolved } = setUp();

    run([
      {
        programKey: "texture.dreamBlur",
        inputs: ["chainA"],
        output: "dreamHalfA",
        uniforms: { uBlurDirection: [1, 0], uBlurRadius: 4 },
        scale: 0.5,
      },
      {
        programKey: "texture.dreamBlur",
        inputs: ["dreamHalfA"],
        output: "dreamHalfB",
        uniforms: { uBlurDirection: [0, 1], uBlurRadius: 4 },
        scale: 0.5,
      },
      {
        programKey: "texture.dreamCombine",
        inputs: ["chainA", "dreamHalfB"],
        output: "chainB",
        uniforms: { uDreamAmount: 0.6 },
        scale: 1,
      },
    ]);

    expect(drawnFramebuffers(fake.calls, context.gl)).toEqual([
      "dreamHalfAFramebuffer",
      "dreamHalfBFramebuffer",
      "chainBFramebuffer",
    ]);
    expect(fake.callsNamed("viewport").map((call) => call.args)).toEqual([
      [0, 0, 960, 540],
      [0, 0, 960, 540],
      [0, 0, WIDTH, HEIGHT],
    ]);
    expect(resolved).toContainEqual({ name: "dreamHalfA", scale: 0.5 });
    expect(resolved).toContainEqual({ name: "dreamHalfB", scale: 0.5 });
    expect(resolved).not.toContainEqual({ name: "dreamHalfB", scale: 1 });
  });

  it("lets a layer bind its own textures before the source program draws", () => {
    const { fake, context, programs, run } = setUp();
    const bindLayer = vi.fn((name: VjTargetName, unit: number) => {
      context.gl.activeTexture(context.gl.TEXTURE0 + unit);
      const layerTexture = { name: `${name}Source` } as unknown as WebGLTexture;
      context.gl.bindTexture(context.gl.TEXTURE_2D, layerTexture);
      return name === "live";
    });

    run(
      [
        {
          programKey: "source.clip",
          inputs: [],
          output: "live",
          uniforms: { uFitMode: 0 },
          scale: 1,
        },
        {
          programKey: "source.clip",
          inputs: [],
          output: "mix",
          uniforms: { uFitMode: 0 },
          scale: 1,
        },
      ],
      bindLayer,
    );

    expect(bindLayer.mock.calls).toEqual([
      ["live", 0],
      ["mix", 0],
    ]);
    const firstBind = fake.calls.findIndex(
      (call) => call.name === "bindTexture",
    );
    const firstUseProgram = fake.calls.findIndex(
      (call) => call.name === "useProgram",
    );
    expect(firstBind).toBeLessThan(firstUseProgram);
    expect(fake.callsNamed("useProgram")[0]?.args[0]).toBe(
      programs.get("source.clip")?.program,
    );
    // The mix layer had no frame yet: its target is cleared and never drawn.
    expect(drawnFramebuffers(fake.calls, context.gl)).toEqual([
      "liveFramebuffer",
    ]);
    expect(fake.callsNamed("clear")).toHaveLength(1);
  });

  it("draws a passthrough copy for a failed program", () => {
    const { fake, context, programs, run } = setUp({
      failingProgramKeys: ["texture.vhs"],
    });

    run([
      {
        programKey: "texture.vhs",
        inputs: ["chainA"],
        output: "chainB",
        uniforms: { uVhsAmount: 0.7 },
        scale: 1,
      },
    ]);

    expect(fake.callsNamed("useProgram").map((call) => call.args[0])).toEqual([
      programs.get("output")?.program,
    ]);
    expect(unitBindings(fake.calls, context.gl)).toEqual([
      [0, "chainATexture"],
      [1, "chainATexture"],
    ]);
    expect(floatUniform(fake.calls, "uOutputGain")).toEqual([1]);
    expect(floatUniform(fake.calls, "uSlewLimit")).toEqual([0]);
    expect(floatUniform(fake.calls, "uBlackout")).toEqual([0]);
    expect(drawnFramebuffers(fake.calls, context.gl)).toEqual([
      "chainBFramebuffer",
    ]);
  });

  it("copies the echo result into feedback", () => {
    const { fake, context, run } = setUp();

    run([
      {
        programKey: "time.echo",
        inputs: ["chainA", "feedback"],
        output: "chainB",
        uniforms: { uEchoAmount: 0.5 },
        scale: 1,
      },
    ]);

    const blits = fake.callsNamed("blitFramebuffer");
    expect(blits).toHaveLength(1);
    const readBinding = fake.calls
      .filter(
        (call) =>
          call.name === "bindFramebuffer" &&
          call.args[0] === context.gl.READ_FRAMEBUFFER,
      )
      .map((call) => handleName(call.args[1]));
    const drawBinding = fake.calls
      .filter(
        (call) =>
          call.name === "bindFramebuffer" &&
          call.args[0] === context.gl.DRAW_FRAMEBUFFER,
      )
      .map((call) => handleName(call.args[1]));
    expect(readBinding[0]).toBe("chainBFramebuffer");
    expect(drawBinding[0]).toBe("feedbackFramebuffer");
  });

  it("sets uResolution to the written target's size from one reused array", () => {
    const { fake, run } = setUp();
    const resolutionArgument = () =>
      fake
        .callsNamed("uniform2fv")
        .find((call) => handleName(call.args[0]) === "uResolution")?.args[1] as
        Float32Array | undefined;

    run([
      {
        programKey: "texture.dreamBlur",
        inputs: ["chainA"],
        output: "dreamHalfA",
        uniforms: { uBlurDirection: [1, 0], uBlurRadius: 4 },
        scale: 0.5,
      },
    ]);
    const halfResolution = resolutionArgument();
    expect(Array.from(halfResolution ?? [])).toEqual([960, 540]);

    run([MIX_STEP]);
    const fullResolution = resolutionArgument();
    expect(Array.from(fullResolution ?? [])).toEqual([WIDTH, HEIGHT]);
    expect(fullResolution).toBe(halfResolution);
  });
});

describe("presentVjOutput", () => {
  it("blits the output to the canvas", () => {
    const { fake, context } = setUp();
    fake.calls.length = 0;

    presentVjOutput(context, namedTarget("outputCurrent", 1), 1280, 720);

    const gl = context.gl;
    expect(fake.callsNamed("blitFramebuffer").map((call) => call.args)).toEqual(
      [[0, 0, WIDTH, HEIGHT, 0, 0, 1280, 720, gl.COLOR_BUFFER_BIT, gl.LINEAR]],
    );
    const bindings = fake
      .callsNamed("bindFramebuffer")
      .map((call) => [call.args[0], handleName(call.args[1])]);
    expect(bindings.slice(0, 2)).toEqual([
      [gl.READ_FRAMEBUFFER, "outputCurrentFramebuffer"],
      [gl.DRAW_FRAMEBUFFER, null],
    ]);
  });
});
