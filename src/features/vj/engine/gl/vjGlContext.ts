/**
 * The projector's WebGL2 context: created with the engine's attributes, read
 * back as a reason code when the browser refuses it, and kept alive across a
 * context loss so the compositor can rebuild once the browser restores it.
 */

export type VjEngineUnavailableReason =
  | "webgl2Missing"
  | "softwareRenderer"
  | "contextCreationFailed"
  | "programFailed"
  | "contextLost";

export const VJ_GL_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance",
  failIfMajorPerformanceCaveat: true,
};

export interface VjGlContext {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  parallelCompile: KHR_parallel_shader_compile | null;
  timerQuery: object | null;
  readonly lossCount: number;
  isLost(): boolean;
  dispose(): void;
}

export type VjGlContextResult =
  | { ok: true; context: VjGlContext }
  | { ok: false; reason: VjEngineUnavailableReason };

let cachedWebGl2Availability: boolean | null = null;

/** True when the browser hands out any WebGL2 context, software ones included. Probed once per page. */
export function isVjWebGl2Available(): boolean {
  if (cachedWebGl2Availability !== null) return cachedWebGl2Availability;
  if (typeof document === "undefined") {
    cachedWebGl2Availability = false;
    return false;
  }
  try {
    const probeCanvas = document.createElement("canvas");
    const probeContext = probeCanvas.getContext("webgl2");
    cachedWebGl2Availability = probeContext !== null;
    probeContext?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedWebGl2Availability = false;
  }
  return cachedWebGl2Availability;
}

export function resetVjWebGl2ProbeForTests(): void {
  cachedWebGl2Availability = null;
}

/** Source passes flip v themselves, so uploads keep the browser's row order and straight alpha. */
function applyVjPixelStore(gl: WebGL2RenderingContext): void {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
}

function readTimerQueryExtension(gl: WebGL2RenderingContext): object | null {
  const extension: unknown = gl.getExtension("EXT_disjoint_timer_query_webgl2");
  return typeof extension === "object" ? extension : null;
}

export function createVjGlContext(
  canvas: HTMLCanvasElement,
  handlers: { onLost: (lossCount: number) => void; onRestored: () => void },
): VjGlContextResult {
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", VJ_GL_CONTEXT_ATTRIBUTES);
  } catch {
    return { ok: false, reason: "contextCreationFailed" };
  }
  if (!gl) {
    const reason = isVjWebGl2Available() ? "softwareRenderer" : "webgl2Missing";
    return { ok: false, reason };
  }
  const glContext: WebGL2RenderingContext = gl;
  applyVjPixelStore(glContext);
  let lossCount = 0;
  let isDisposed = false;

  const handleLost = (event: Event) => {
    event.preventDefault();
    lossCount += 1;
    handlers.onLost(lossCount);
  };
  const handleRestored = () => {
    applyVjPixelStore(glContext);
    context.parallelCompile = glContext.getExtension(
      "KHR_parallel_shader_compile",
    );
    context.timerQuery = readTimerQueryExtension(glContext);
    handlers.onRestored();
  };

  const context: VjGlContext = {
    gl: glContext,
    canvas,
    parallelCompile: glContext.getExtension("KHR_parallel_shader_compile"),
    timerQuery: readTimerQueryExtension(glContext),
    get lossCount() {
      return lossCount;
    },
    isLost: () => glContext.isContextLost(),
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
      glContext.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
  canvas.addEventListener("webglcontextlost", handleLost);
  canvas.addEventListener("webglcontextrestored", handleRestored);
  return { ok: true, context };
}
