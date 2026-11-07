import { vi } from "vitest";

/**
 * A recording stand-in for WebGL2 in jsdom. Every method call lands in `calls`;
 * `create*` methods answer fresh handles; constants carry their real WebGL2
 * values (unknown ones get a stable synthetic number). Programs link unless
 * their fragment holds `// vj-program-key: <key>` with a key in
 * `failingProgramKeys`, and `getActiveUniform` reads the `uniform <type> <name>`
 * lines of the linked fragment. Fences, `getBufferSubData` and `readPixels`
 * hand back `probeBytes`.
 */

export interface VjFakeWebGl2Options {
  isContextAvailable?: boolean;
  /** Only `failIfMajorPerformanceCaveat: true` is refused, like a software renderer. */
  isSoftwareOnly?: boolean;
  failingProgramKeys?: string[];
  probeBytes?: Uint8Array;
  shouldThrowOnGetContext?: boolean;
  /** Adds KHR_parallel_shader_compile; programs stay compiling until `completeCompiles()`. */
  hasParallelCompile?: boolean;
  /** Adds EXT_disjoint_timer_query_webgl2; every query answers 1 ms. */
  hasTimerQuery?: boolean;
}

export interface VjFakeGlCall {
  name: string;
  args: unknown[];
}

export interface VjFakeGlHandle {
  readonly kind: string;
  readonly id: number;
}

interface VjFakeShader extends VjFakeGlHandle {
  type: number;
  source: string;
  isDeleted: boolean;
}

interface VjFakeUniform {
  name: string;
  type: number;
  size: number;
}

interface VjFakeProgram extends VjFakeGlHandle {
  shaders: VjFakeShader[];
  isLinked: boolean;
  isCompileComplete: boolean;
  uniforms: VjFakeUniform[];
}

export interface VjFakeWebGl2 {
  context: WebGL2RenderingContext;
  calls: VjFakeGlCall[];
  callsNamed(name: string): VjFakeGlCall[];
  /** Fires `webglcontextlost` on the canvas; answers whether a listener called preventDefault. */
  loseContext(): boolean;
  restoreContext(): void;
  setProbeBytes(bytes: Uint8Array): void;
  setFenceSignalled(isSignalled: boolean): void;
  completeCompiles(): void;
  /** Every program created so far, in creation order. */
  programs(): readonly VjFakeGlHandle[];
}

export const VJ_FAKE_GL_CONSTANTS: Readonly<Record<string, number>> = {
  NO_ERROR: 0,
  POINTS: 0x0000,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  BYTE: 0x1400,
  UNSIGNED_BYTE: 0x1401,
  INT: 0x1404,
  UNSIGNED_INT: 0x1405,
  FLOAT: 0x1406,
  HALF_FLOAT: 0x140b,
  RGBA: 0x1908,
  RGB: 0x1907,
  NEAREST: 0x2600,
  LINEAR: 0x2601,
  LINEAR_MIPMAP_LINEAR: 0x2703,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  TEXTURE_WRAP_R: 0x8072,
  CLAMP_TO_EDGE: 0x812f,
  TEXTURE_2D: 0x0de1,
  TEXTURE_3D: 0x806f,
  TEXTURE_2D_ARRAY: 0x8c1a,
  TEXTURE0: 0x84c0,
  COLOR_BUFFER_BIT: 0x4000,
  RGBA8: 0x8058,
  FRAGMENT_SHADER: 0x8b30,
  VERTEX_SHADER: 0x8b31,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  DELETE_STATUS: 0x8b80,
  ACTIVE_UNIFORMS: 0x8b86,
  FLOAT_VEC2: 0x8b50,
  FLOAT_VEC3: 0x8b51,
  FLOAT_VEC4: 0x8b52,
  INT_VEC2: 0x8b53,
  INT_VEC3: 0x8b54,
  INT_VEC4: 0x8b55,
  BOOL: 0x8b56,
  FLOAT_MAT2: 0x8b5a,
  FLOAT_MAT3: 0x8b5b,
  FLOAT_MAT4: 0x8b5c,
  SAMPLER_2D: 0x8b5e,
  SAMPLER_3D: 0x8b5f,
  SAMPLER_CUBE: 0x8b60,
  SAMPLER_2D_ARRAY: 0x8dc1,
  INT_SAMPLER_2D: 0x8dca,
  UNSIGNED_INT_SAMPLER_2D: 0x8dd2,
  FRAMEBUFFER: 0x8d40,
  READ_FRAMEBUFFER: 0x8ca8,
  DRAW_FRAMEBUFFER: 0x8ca9,
  COLOR_ATTACHMENT0: 0x8ce0,
  FRAMEBUFFER_COMPLETE: 0x8cd5,
  ARRAY_BUFFER: 0x8892,
  PIXEL_PACK_BUFFER: 0x88eb,
  PIXEL_UNPACK_BUFFER: 0x88ec,
  STREAM_READ: 0x88e1,
  DYNAMIC_READ: 0x88e9,
  UNPACK_FLIP_Y_WEBGL: 0x9240,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
  UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243,
  MAX_TEXTURE_SIZE: 0x0d33,
  MAX_TEXTURE_IMAGE_UNITS: 0x8872,
  MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
  MAX_ARRAY_TEXTURE_LAYERS: 0x88ff,
  MAX_3D_TEXTURE_SIZE: 0x8073,
  MAX_RENDERBUFFER_SIZE: 0x84e8,
  SYNC_GPU_COMMANDS_COMPLETE: 0x9117,
  SYNC_STATUS: 0x9114,
  UNSIGNALED: 0x9118,
  SIGNALED: 0x9119,
  ALREADY_SIGNALED: 0x911a,
  TIMEOUT_EXPIRED: 0x911b,
  CONDITION_SATISFIED: 0x911c,
  WAIT_FAILED: 0x911d,
  QUERY_RESULT: 0x8866,
  QUERY_RESULT_AVAILABLE: 0x8867,
  RENDERER: 0x1f01,
  VENDOR: 0x1f00,
  VERSION: 0x1f02,
};

const VJ_FAKE_UNIFORM_TYPES: Readonly<Record<string, string>> = {
  float: "FLOAT",
  vec2: "FLOAT_VEC2",
  vec3: "FLOAT_VEC3",
  vec4: "FLOAT_VEC4",
  int: "INT",
  ivec2: "INT_VEC2",
  ivec3: "INT_VEC3",
  ivec4: "INT_VEC4",
  uint: "UNSIGNED_INT",
  bool: "BOOL",
  mat2: "FLOAT_MAT2",
  mat3: "FLOAT_MAT3",
  mat4: "FLOAT_MAT4",
  sampler2D: "SAMPLER_2D",
  sampler3D: "SAMPLER_3D",
  samplerCube: "SAMPLER_CUBE",
  sampler2DArray: "SAMPLER_2D_ARRAY",
  isampler2D: "INT_SAMPLER_2D",
  usampler2D: "UNSIGNED_INT_SAMPLER_2D",
};

const PARALLEL_COMPILE_EXTENSION = { COMPLETION_STATUS_KHR: 0x91b1 };
const TIMER_QUERY_EXTENSION = {
  TIME_ELAPSED_EXT: 0x88bf,
  GPU_DISJOINT_EXT: 0x8fbb,
  QUERY_COUNTER_BITS_EXT: 0x8864,
  TIMESTAMP_EXT: 0x8e28,
};
const FAKE_TIMER_RESULT_NS = 1_000_000;

const syntheticConstants = new Map<string, number>();

function vjFakeConstant(name: string): number {
  const known = VJ_FAKE_GL_CONSTANTS[name];
  if (known !== undefined) return known;
  let synthetic = syntheticConstants.get(name);
  if (synthetic === undefined) {
    synthetic = 0x7f000000 + syntheticConstants.size;
    syntheticConstants.set(name, synthetic);
  }
  return synthetic;
}

/**
 * Reads `uniform <type> <name>;` and `uniform <type> <name>[n];` lines. A line
 * ending in `// vj-optimised-out` stays inactive, like a uniform the compiler
 * dropped because nothing reads it.
 */
export function parseVjFakeUniforms(fragment: string): VjFakeUniform[] {
  const uniforms: VjFakeUniform[] = [];
  const pattern =
    /^\s*uniform\s+(?:(?:lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*(?:\[\s*(\d+)\s*\])?\s*;([^\n]*)/gm;
  for (const match of fragment.matchAll(pattern)) {
    const [, typeName = "", name = "", arraySize, lineRest = ""] = match;
    const constantName = VJ_FAKE_UNIFORM_TYPES[typeName];
    if (!constantName || lineRest.includes("vj-optimised-out")) continue;
    const size = arraySize ? Number(arraySize) : 1;
    uniforms.push({
      name: arraySize ? `${name}[0]` : name,
      type: vjFakeConstant(constantName),
      size,
    });
  }
  return uniforms;
}

function vjFakeProgramKey(fragment: string): string | null {
  return /\/\/\s*vj-program-key:\s*(\S+)/.exec(fragment)?.[1] ?? null;
}

interface VjFakeState {
  canvas: HTMLCanvasElement;
  options: VjFakeWebGl2Options;
  calls: VjFakeGlCall[];
  nextHandleId: number;
  isLost: boolean;
  isFenceSignalled: boolean;
  probeBytes: Uint8Array;
  programs: VjFakeProgram[];
}

function createVjFakeHandle(state: VjFakeState, kind: string): VjFakeGlHandle {
  state.nextHandleId += 1;
  return { kind, id: state.nextHandleId };
}

function copyVjProbeBytes(state: VjFakeState, destination: unknown): void {
  if (!ArrayBuffer.isView(destination)) return;
  const bytes = new Uint8Array(
    destination.buffer,
    destination.byteOffset,
    destination.byteLength,
  );
  bytes.set(state.probeBytes.subarray(0, bytes.length));
}

function linkVjFakeProgram(state: VjFakeState, program: VjFakeProgram): void {
  const fragment = program.shaders.find(
    (shader) => shader.type === vjFakeConstant("FRAGMENT_SHADER"),
  );
  const source = fragment?.source ?? "";
  const key = vjFakeProgramKey(source);
  const isFailing =
    key !== null && (state.options.failingProgramKeys ?? []).includes(key);
  program.isLinked = !isFailing && fragment !== undefined;
  program.uniforms = program.isLinked ? parseVjFakeUniforms(source) : [];
  program.isCompileComplete = !state.options.hasParallelCompile;
}

function readVjFakeProgramParameter(
  state: VjFakeState,
  program: VjFakeProgram,
  parameter: number,
): unknown {
  if (state.isLost) return parameter === 0x91b1 ? true : null;
  if (parameter === vjFakeConstant("LINK_STATUS")) return program.isLinked;
  if (parameter === vjFakeConstant("ACTIVE_UNIFORMS")) {
    return program.uniforms.length;
  }
  if (parameter === PARALLEL_COMPILE_EXTENSION.COMPLETION_STATUS_KHR) {
    return program.isCompileComplete;
  }
  return null;
}

function readVjFakeParameter(parameter: number): unknown {
  const values: Readonly<Record<string, unknown>> = {
    MAX_TEXTURE_SIZE: 16384,
    MAX_TEXTURE_IMAGE_UNITS: 16,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: 32,
    MAX_ARRAY_TEXTURE_LAYERS: 2048,
    MAX_3D_TEXTURE_SIZE: 2048,
    MAX_RENDERBUFFER_SIZE: 16384,
    RENDERER: "Fake WebGL2",
    VENDOR: "QueerPulse tests",
    VERSION: "WebGL 2.0 (fake)",
  };
  for (const name in values) {
    if (vjFakeConstant(name) === parameter) return values[name];
  }
  return null;
}

function createVjFakeExtension(
  state: VjFakeState,
  name: string,
  controls: { loseContext(): boolean; restoreContext(): void },
): object | null {
  if (name === "WEBGL_lose_context") {
    return {
      loseContext: () => void controls.loseContext(),
      restoreContext: () => controls.restoreContext(),
    };
  }
  if (name === "KHR_parallel_shader_compile") {
    return state.options.hasParallelCompile ? PARALLEL_COMPILE_EXTENSION : null;
  }
  if (name === "EXT_disjoint_timer_query_webgl2") {
    return state.options.hasTimerQuery ? TIMER_QUERY_EXTENSION : null;
  }
  return null;
}

type VjFakeMethod = (...args: unknown[]) => unknown;

function createVjFakeShaderMethods(
  state: VjFakeState,
): Record<string, VjFakeMethod> {
  return {
    createShader: (type) => ({
      ...createVjFakeHandle(state, "shader"),
      type: Number(type),
      source: "",
      isDeleted: false,
    }),
    shaderSource: (shader, source) => {
      (shader as VjFakeShader).source = String(source);
    },
    deleteShader: (shader) => {
      if (shader) (shader as VjFakeShader).isDeleted = true;
    },
    getShaderParameter: () => (state.isLost ? null : true),
    createProgram: () => {
      const program: VjFakeProgram = {
        ...createVjFakeHandle(state, "program"),
        shaders: [],
        isLinked: false,
        isCompileComplete: false,
        uniforms: [],
      };
      state.programs.push(program);
      return program;
    },
    attachShader: (program, shader) => {
      (program as VjFakeProgram).shaders.push(shader as VjFakeShader);
    },
    linkProgram: (program) =>
      linkVjFakeProgram(state, program as VjFakeProgram),
    getProgramParameter: (program, parameter) =>
      readVjFakeProgramParameter(
        state,
        program as VjFakeProgram,
        Number(parameter),
      ),
    getActiveUniform: (program, index) =>
      (program as VjFakeProgram).uniforms[Number(index)] ?? null,
    getUniformLocation: (program, name) => {
      const uniform = (program as VjFakeProgram).uniforms.find(
        (candidate) =>
          candidate.name === name || candidate.name === `${String(name)}[0]`,
      );
      return uniform ? { kind: "uniformLocation", name: uniform.name } : null;
    },
  };
}

function createVjFakeSyncMethods(
  state: VjFakeState,
): Record<string, VjFakeMethod> {
  const waitAnswer = () =>
    vjFakeConstant(
      state.isFenceSignalled ? "CONDITION_SATISFIED" : "TIMEOUT_EXPIRED",
    );
  return {
    fenceSync: () => createVjFakeHandle(state, "sync"),
    clientWaitSync: waitAnswer,
    getSyncParameter: () =>
      vjFakeConstant(state.isFenceSignalled ? "SIGNALED" : "UNSIGNALED"),
    getBufferSubData: (_target, _offset, destination) =>
      copyVjProbeBytes(state, destination),
    readPixels: (...args) => copyVjProbeBytes(state, args[6]),
    getQueryParameter: (_query, parameter) =>
      Number(parameter) === vjFakeConstant("QUERY_RESULT_AVAILABLE")
        ? true
        : FAKE_TIMER_RESULT_NS,
    checkFramebufferStatus: () => vjFakeConstant("FRAMEBUFFER_COMPLETE"),
    getError: () => vjFakeConstant("NO_ERROR"),
    getParameter: (parameter) =>
      parameter === TIMER_QUERY_EXTENSION.GPU_DISJOINT_EXT
        ? false
        : readVjFakeParameter(Number(parameter)),
  };
}

function wrapVjFakeMethod(
  state: VjFakeState,
  name: string,
  method: VjFakeMethod | undefined,
): VjFakeMethod {
  return (...args: unknown[]) => {
    state.calls.push({ name, args });
    if (method) return method(...args);
    if (name.startsWith("create")) {
      return createVjFakeHandle(state, name.slice("create".length));
    }
    return undefined;
  };
}

function createVjFakeContextProxy(
  state: VjFakeState,
  controls: { loseContext(): boolean; restoreContext(): void },
): WebGL2RenderingContext {
  const methods: Record<string, VjFakeMethod> = {
    ...createVjFakeShaderMethods(state),
    ...createVjFakeSyncMethods(state),
    isContextLost: () => state.isLost,
    getExtension: (name) =>
      createVjFakeExtension(state, String(name), controls),
    getSupportedExtensions: () => ["WEBGL_lose_context"],
    getContextAttributes: () => null,
  };
  const wrapped = new Map<string, VjFakeMethod>();
  const target = {};
  const proxy = new Proxy(target, {
    get: (_target, property) => {
      if (typeof property !== "string") return undefined;
      if (property === "canvas") return state.canvas;
      if (property === "drawingBufferWidth") return state.canvas.width;
      if (property === "drawingBufferHeight") return state.canvas.height;
      if (property === "then") return undefined;
      if (/^[A-Z][A-Z0-9_]*$/.test(property)) return vjFakeConstant(property);
      let method = wrapped.get(property);
      if (!method) {
        method = wrapVjFakeMethod(state, property, methods[property]);
        wrapped.set(property, method);
      }
      return method;
    },
  });
  return proxy as WebGL2RenderingContext;
}

/** One fake WebGL2 context bound to `canvas`, with the controls a test drives. */
export function createVjFakeWebGl2Context(
  canvas: HTMLCanvasElement,
  options: VjFakeWebGl2Options = {},
): VjFakeWebGl2 {
  const state: VjFakeState = {
    canvas,
    options,
    calls: [],
    nextHandleId: 0,
    isLost: false,
    isFenceSignalled: true,
    probeBytes: options.probeBytes ?? new Uint8Array(16 * 16 * 4),
    programs: [],
  };
  const controls = {
    loseContext: () => {
      state.isLost = true;
      const event = new Event("webglcontextlost", { cancelable: true });
      canvas.dispatchEvent(event);
      return event.defaultPrevented;
    },
    restoreContext: () => {
      state.isLost = false;
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    },
  };
  return {
    context: createVjFakeContextProxy(state, controls),
    calls: state.calls,
    callsNamed: (name) => state.calls.filter((call) => call.name === name),
    ...controls,
    setProbeBytes: (bytes) => {
      state.probeBytes = bytes;
    },
    setFenceSignalled: (isSignalled) => {
      state.isFenceSignalled = isSignalled;
    },
    completeCompiles: () => {
      for (const program of state.programs) program.isCompileComplete = true;
    },
    programs: () => state.programs,
  };
}

function answerVjFakeGetContext(
  fake: () => VjFakeWebGl2,
  options: VjFakeWebGl2Options,
  contextType: unknown,
  attributes: unknown,
): WebGL2RenderingContext | null {
  if (options.shouldThrowOnGetContext) {
    throw new Error("vjFakeWebGl2: getContext threw by request");
  }
  if (contextType !== "webgl2") return null;
  if (options.isContextAvailable === false) return null;
  const isCaveatRequested =
    (attributes as WebGLContextAttributes | undefined)
      ?.failIfMajorPerformanceCaveat === true;
  if (options.isSoftwareOnly && isCaveatRequested) return null;
  return fake().context;
}

/** A detached canvas whose own `getContext` answers the fake context. */
export function createVjFakeWebGl2Canvas(
  options: VjFakeWebGl2Options = {},
): VjFakeWebGl2 & { canvas: HTMLCanvasElement } {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const fake = createVjFakeWebGl2Context(canvas, options);
  Object.defineProperty(canvas, "getContext", {
    configurable: true,
    writable: true,
    value: (contextType: unknown, attributes: unknown) =>
      answerVjFakeGetContext(() => fake, options, contextType, attributes),
  });
  return { canvas, ...fake };
}

/**
 * Stubs `HTMLCanvasElement.prototype.getContext` so every canvas (the
 * availability probe, a canvas React mounts) answers a fake context of its
 * own. The setup file's `vi.restoreAllMocks()` removes the stub after each test.
 */
export function installVjFakeWebGl2(options: VjFakeWebGl2Options = {}): {
  fakeFor(canvas: HTMLCanvasElement): VjFakeWebGl2 | null;
  lastFake(): VjFakeWebGl2 | null;
} {
  const fakes = new Map<HTMLCanvasElement, VjFakeWebGl2>();
  let lastFake: VjFakeWebGl2 | null = null;
  const fakeOf = (canvas: HTMLCanvasElement) => {
    let fake = fakes.get(canvas);
    if (!fake) {
      fake = createVjFakeWebGl2Context(canvas, options);
      fakes.set(canvas, fake);
    }
    lastFake = fake;
    return fake;
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function getVjFakeContext(
      this: HTMLCanvasElement,
      contextType: unknown,
      attributes?: unknown,
    ) {
      return answerVjFakeGetContext(
        () => fakeOf(this),
        options,
        contextType,
        attributes,
      );
    },
  );
  return {
    fakeFor: (canvas) => fakes.get(canvas) ?? null,
    lastFake: () => lastFake,
  };
}
