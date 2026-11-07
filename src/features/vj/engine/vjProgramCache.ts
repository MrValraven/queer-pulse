/**
 * The engine's compiled programs (engine plan, Task E16). `startAll` starts
 * every program at engine creation (the setup card shows long before the
 * show), compiling in parallel where KHR_parallel_shader_compile exists.
 * `poll` settles them: a failed core program answers `coreFailed` (the stage
 * falls back to the DOM renderer with reason `programFailed`); a failed
 * effect program only disables that effect, because `get` answers null for it
 * and the pass runner draws a passthrough copy in its place.
 *
 * The frame loop calls `poll`, `get`, `samplerUnitsOf` and `samplerCountOf`;
 * none of them allocates once the programs have settled.
 */
import {
  deleteVjProgram,
  pollVjProgram,
  startVjProgram,
  type VjGlProgram,
} from "./gl/vjGlProgram";
import type { VjGlContext } from "./gl/vjGlContext";
import { VJ_GLSL_VERTEX } from "./shaders/vjGlslCommon";
import {
  VJ_PROGRAM_KEYS,
  type VjProgramKey,
  type VjShaderSource,
} from "./shaders/vjProgramKeys";
import { VJ_SHADER_SOURCES } from "./vjShaderSources";

/** Without these the engine cannot draw a show: their failure hands the stage to the DOM renderer. */
export const VJ_CORE_PROGRAM_KEYS: readonly VjProgramKey[] = [
  "source.clip",
  "transition.fade",
  "mix",
  "output",
];

export type VjProgramCacheStatus = "compiling" | "ready" | "coreFailed";

const NO_SAMPLER_UNITS: Readonly<Record<string, number>> = {};

/** `{ uSource: 0, uPrevious: 1 }`: each sampler's texture unit is its index in the source's list. */
function samplerUnitsFor(
  source: VjShaderSource,
): Readonly<Record<string, number>> {
  const units: Record<string, number> = {};
  source.samplers.forEach((samplerName, unit) => {
    units[samplerName] = unit;
  });
  return units;
}

export class VjProgramCache {
  private readonly context: VjGlContext;
  private readonly sources: Readonly<Record<VjProgramKey, VjShaderSource>>;
  private readonly samplerUnits: Partial<
    Record<VjProgramKey, Readonly<Record<string, number>>>
  > = {};
  private programs: Partial<Record<VjProgramKey, VjGlProgram>> = {};
  /** The programs in VJ_PROGRAM_KEYS order, for an index loop that allocates nothing. */
  private programList: VjGlProgram[] = [];
  private settledStatus: VjProgramCacheStatus | null = null;
  private settledFailedKeys: VjProgramKey[] = [];

  constructor(
    context: VjGlContext,
    sources: Readonly<Record<VjProgramKey, VjShaderSource>> = VJ_SHADER_SOURCES,
  ) {
    this.context = context;
    this.sources = sources;
    for (const programKey of VJ_PROGRAM_KEYS) {
      this.samplerUnits[programKey] = samplerUnitsFor(sources[programKey]);
    }
  }

  /** Starts compiling every program. Programs already started are deleted first. */
  startAll(): void {
    this.deleteAll();
    for (const programKey of VJ_PROGRAM_KEYS) {
      const program = startVjProgram(
        this.context,
        programKey,
        VJ_GLSL_VERTEX,
        this.sources[programKey].fragment,
      );
      this.programs[programKey] = program;
      this.programList.push(program);
    }
  }

  /** `ready` once every program linked or failed with no core failure; `coreFailed` as soon as a core program failed. */
  poll(): VjProgramCacheStatus {
    if (this.settledStatus !== null) return this.settledStatus;
    if (this.programList.length === 0) return "compiling";
    let isCompiling = false;
    for (let index = 0; index < this.programList.length; index += 1) {
      const program = this.programList[index];
      if (!program) continue;
      const status = pollVjProgram(this.context, program);
      if (status === "compiling") isCompiling = true;
    }
    if (this.hasFailedCore()) return this.settle("coreFailed");
    return isCompiling ? "compiling" : this.settle("ready");
  }

  /** The linked program for `programKey`, or null while it compiles or after it failed. */
  get(programKey: VjProgramKey): VjGlProgram | null {
    const program = this.programs[programKey];
    return program?.status === "linked" ? program : null;
  }

  /** Each sampler of the program mapped to its texture unit, for `setVjUniforms`. */
  samplerUnitsOf(programKey: VjProgramKey): Readonly<Record<string, number>> {
    return this.samplerUnits[programKey] ?? NO_SAMPLER_UNITS;
  }

  samplerCountOf(programKey: VjProgramKey): number {
    return this.sources[programKey].samplers.length;
  }

  /** Program keys that failed to compile or link, in VJ_PROGRAM_KEYS order (codes only). */
  failedKeys(): VjProgramKey[] {
    if (this.settledStatus !== null) return this.settledFailedKeys.slice();
    return VJ_PROGRAM_KEYS.filter(
      (programKey) => this.programs[programKey]?.status === "failed",
    );
  }

  /** After a context restore every GL handle is gone: compile everything again. */
  rebuild(): void {
    this.startAll();
  }

  dispose(): void {
    this.deleteAll();
  }

  private hasFailedCore(): boolean {
    return VJ_CORE_PROGRAM_KEYS.some(
      (programKey) => this.programs[programKey]?.status === "failed",
    );
  }

  private settle(status: VjProgramCacheStatus): VjProgramCacheStatus {
    this.settledFailedKeys = this.failedKeys();
    this.settledStatus = status;
    return status;
  }

  private deleteAll(): void {
    for (const program of this.programList) {
      deleteVjProgram(this.context, program);
    }
    this.programs = {};
    this.programList = [];
    this.settledStatus = null;
    this.settledFailedKeys = [];
  }
}
