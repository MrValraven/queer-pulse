/**
 * Program build and uniform upload. A program compiles without blocking where
 * KHR_parallel_shader_compile exists, caches every active uniform's location
 * and type once it links, and sets values through the setter for that type.
 * Failures carry the program key and a stage only: info logs are never read.
 */
import type { VjGlContext } from "./vjGlContext";

export type VjUniformValue = number | readonly number[] | Float32Array;

export interface VjGlProgram {
  key: string;
  program: WebGLProgram | null;
  status: "compiling" | "linked" | "failed";
  failure: "compile" | "link" | null;
}

interface VjUniformSlot {
  location: WebGLUniformLocation;
  type: number;
  size: number;
}

interface VjProgramParts {
  vertexShader: WebGLShader | null;
  fragmentShader: WebGLShader | null;
  uniforms: Map<string, VjUniformSlot>;
}

const programParts = new WeakMap<VjGlProgram, VjProgramParts>();

function compileVjShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function startVjProgram(
  context: VjGlContext,
  key: string,
  vertex: string,
  fragment: string,
): VjGlProgram {
  const { gl } = context;
  const vertexShader = compileVjShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = compileVjShader(gl, gl.FRAGMENT_SHADER, fragment);
  const glProgram: VjGlProgram = {
    key,
    program: null,
    status: "compiling",
    failure: null,
  };
  programParts.set(glProgram, {
    vertexShader,
    fragmentShader,
    uniforms: new Map(),
  });
  if (!vertexShader || !fragmentShader) {
    failVjProgram(context, glProgram, "compile");
    return glProgram;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  glProgram.program = program;
  if (!context.parallelCompile) finishVjProgram(context, glProgram);
  return glProgram;
}

/** Answers the status, finishing the link once the driver says it completed. */
export function pollVjProgram(
  context: VjGlContext,
  program: VjGlProgram,
): VjGlProgram["status"] {
  if (program.status !== "compiling" || !program.program) return program.status;
  const extension = context.parallelCompile;
  if (extension) {
    const isComplete: unknown = context.gl.getProgramParameter(
      program.program,
      extension.COMPLETION_STATUS_KHR,
    );
    if (isComplete !== true) return program.status;
  }
  finishVjProgram(context, program);
  return program.status;
}

function finishVjProgram(context: VjGlContext, program: VjGlProgram): void {
  const { gl } = context;
  const parts = programParts.get(program);
  if (!program.program || !parts) return;
  const isLinked: unknown = gl.getProgramParameter(
    program.program,
    gl.LINK_STATUS,
  );
  if (isLinked !== true) {
    const isCompiled = [parts.vertexShader, parts.fragmentShader].every(
      (shader) =>
        shader !== null &&
        gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true,
    );
    failVjProgram(context, program, isCompiled ? "link" : "compile");
    return;
  }
  readVjActiveUniforms(gl, program.program, parts.uniforms);
  releaseVjShaders(gl, program.program, parts);
  program.status = "linked";
}

function failVjProgram(
  context: VjGlContext,
  program: VjGlProgram,
  failure: "compile" | "link",
): void {
  deleteVjProgram(context, program);
  program.status = "failed";
  program.failure = failure;
}

function releaseVjShaders(
  gl: WebGL2RenderingContext,
  program: WebGLProgram | null,
  parts: VjProgramParts,
): void {
  for (const shader of [parts.vertexShader, parts.fragmentShader]) {
    if (!shader) continue;
    if (program) gl.detachShader(program, shader);
    gl.deleteShader(shader);
  }
  parts.vertexShader = null;
  parts.fragmentShader = null;
}

/** Array uniforms report `name[0]`; the cache keys them by the bare name. */
function readVjActiveUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  uniforms: Map<string, VjUniformSlot>,
): void {
  uniforms.clear();
  const count: unknown = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const uniformCount = typeof count === "number" ? count : 0;
  for (let index = 0; index < uniformCount; index += 1) {
    const info = gl.getActiveUniform(program, index);
    if (!info) continue;
    const location = gl.getUniformLocation(program, info.name);
    if (!location) continue;
    const name = info.name.endsWith("[0]") ? info.name.slice(0, -3) : info.name;
    uniforms.set(name, { location, type: info.type, size: info.size });
  }
}

export function bindVjProgram(
  context: VjGlContext,
  program: VjGlProgram,
): void {
  if (program.status === "linked") context.gl.useProgram(program.program);
}

/** Sets every named value through its cached setter; names the program does not use are ignored. */
export function setVjUniforms(
  context: VjGlContext,
  program: VjGlProgram,
  values: Readonly<Record<string, VjUniformValue>>,
): void {
  const uniforms = programParts.get(program)?.uniforms;
  if (!uniforms || program.status !== "linked") return;
  for (const name in values) {
    const slot = uniforms.get(name);
    const value = values[name];
    if (!slot || value === undefined) continue;
    setVjUniform(context.gl, slot, value);
  }
}

function setVjUniform(
  gl: WebGL2RenderingContext,
  slot: VjUniformSlot,
  value: VjUniformValue,
): void {
  const { location, type } = slot;
  if (typeof value === "number") {
    if (type === gl.FLOAT) gl.uniform1f(location, value);
    else if (type === gl.UNSIGNED_INT) gl.uniform1ui(location, value);
    else if (isVjIntUniformType(gl, type)) gl.uniform1i(location, value);
    return;
  }
  const floatList = value as Float32Array | number[];
  const intList = value as unknown as number[];
  if (type === gl.FLOAT) gl.uniform1fv(location, floatList);
  else if (type === gl.FLOAT_VEC2) gl.uniform2fv(location, floatList);
  else if (type === gl.FLOAT_VEC3) gl.uniform3fv(location, floatList);
  else if (type === gl.FLOAT_VEC4) gl.uniform4fv(location, floatList);
  else if (type === gl.INT_VEC2) gl.uniform2iv(location, intList);
  else if (type === gl.INT_VEC3) gl.uniform3iv(location, intList);
  else if (type === gl.INT_VEC4) gl.uniform4iv(location, intList);
  else if (type === gl.FLOAT_MAT3)
    gl.uniformMatrix3fv(location, false, floatList);
  else if (type === gl.FLOAT_MAT4)
    gl.uniformMatrix4fv(location, false, floatList);
  else if (isVjIntUniformType(gl, type)) gl.uniform1iv(location, intList);
}

/** Ints, bools and every sampler take the `1i` setter (a sampler's value is its texture unit). */
function isVjIntUniformType(gl: WebGL2RenderingContext, type: number): boolean {
  return (
    type === gl.INT ||
    type === gl.BOOL ||
    type === gl.SAMPLER_2D ||
    type === gl.SAMPLER_2D_ARRAY ||
    type === gl.SAMPLER_3D ||
    type === gl.SAMPLER_CUBE ||
    type === gl.INT_SAMPLER_2D ||
    type === gl.UNSIGNED_INT_SAMPLER_2D
  );
}

export function deleteVjProgram(
  context: VjGlContext,
  program: VjGlProgram,
): void {
  const parts = programParts.get(program);
  if (parts) {
    releaseVjShaders(context.gl, program.program, parts);
    parts.uniforms.clear();
  }
  if (program.program) context.gl.deleteProgram(program.program);
  program.program = null;
}
