/**
 * GPU timing for the performance measurement (engine plan, Task E16 and
 * "How to measure"). It exists only when the browser offers
 * EXT_disjoint_timer_query_webgl2 and the page was opened with `?vjPerf=1`;
 * otherwise `createVjGpuTimer` answers null and the frame loop skips it.
 *
 * The compositor brackets each group once per frame (`sources`, `effects`,
 * `output`) with `begin(group)` and `end()`. Results arrive a few frames late:
 * `read()` collects every finished query into one readings record, in GPU
 * milliseconds per group, and the same record sits on
 * `window.__vjEnginePerf`. It holds numbers only and logs nothing. Queries
 * come from a small pool, so the frame loop allocates nothing once warm.
 */
import type { VjGlContext } from "./vjGlContext";

export const VJ_GPU_TIMER_QUERY_PARAMETER = "vjPerf";
/** Enough for three groups over several frames of latency. */
const VJ_GPU_TIMER_MAX_QUERIES = 24;
const NANOSECONDS_PER_MILLISECOND = 1_000_000;

export interface VjGpuTimer {
  begin(group: string): void;
  end(): void;
  read(): Readonly<Record<string, number>>;
  dispose(): void;
}

interface VjTimerQueryExtension {
  TIME_ELAPSED_EXT: number;
  GPU_DISJOINT_EXT: number;
}

interface VjTimerSlot {
  query: WebGLQuery;
  group: string;
  isPending: boolean;
}

type VjPerfWindow = Window & {
  __vjEnginePerf?: Readonly<Record<string, number>>;
};

function isVjPerfRequested(): boolean {
  if (typeof window === "undefined") return false;
  const parameters = new URLSearchParams(window.location.search);
  return parameters.get(VJ_GPU_TIMER_QUERY_PARAMETER) === "1";
}

function timerExtensionOf(context: VjGlContext): VjTimerQueryExtension | null {
  const extension = context.timerQuery as Partial<VjTimerQueryExtension> | null;
  if (
    typeof extension?.TIME_ELAPSED_EXT !== "number" ||
    typeof extension.GPU_DISJOINT_EXT !== "number"
  ) {
    return null;
  }
  return {
    TIME_ELAPSED_EXT: extension.TIME_ELAPSED_EXT,
    GPU_DISJOINT_EXT: extension.GPU_DISJOINT_EXT,
  };
}

/** Finished queries into `readings`; a disjoint GPU (clock change, power state) discards them all. */
function collectVjTimerSlots(
  gl: WebGL2RenderingContext,
  extension: VjTimerQueryExtension,
  slots: readonly VjTimerSlot[],
  readings: Record<string, number>,
): void {
  const isDisjoint = gl.getParameter(extension.GPU_DISJOINT_EXT) === true;
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    if (!slot?.isPending) continue;
    if (isDisjoint) {
      slot.isPending = false;
      continue;
    }
    const isAvailable: unknown = gl.getQueryParameter(
      slot.query,
      gl.QUERY_RESULT_AVAILABLE,
    );
    if (isAvailable !== true) continue;
    const elapsed: unknown = gl.getQueryParameter(slot.query, gl.QUERY_RESULT);
    if (typeof elapsed === "number") {
      readings[slot.group] = elapsed / NANOSECONDS_PER_MILLISECOND;
    }
    slot.isPending = false;
  }
}

export function createVjGpuTimer(
  context: VjGlContext,
  options: { isRequested?: boolean } = {},
): VjGpuTimer | null {
  const isRequested = options.isRequested ?? isVjPerfRequested();
  const extension = timerExtensionOf(context);
  if (!isRequested || extension === null) return null;
  const { gl } = context;
  const slots: VjTimerSlot[] = [];
  const readings: Record<string, number> = {};
  let activeSlot: VjTimerSlot | null = null;
  const perfWindow = window as VjPerfWindow;
  perfWindow.__vjEnginePerf = readings;

  const freeSlot = (): VjTimerSlot | null => {
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (slot && !slot.isPending) return slot;
    }
    if (slots.length >= VJ_GPU_TIMER_MAX_QUERIES) return null;
    const slot: VjTimerSlot = {
      query: gl.createQuery(),
      group: "",
      isPending: false,
    };
    slots.push(slot);
    return slot;
  };

  return {
    begin: (group) => {
      if (activeSlot !== null) return;
      const slot = freeSlot();
      if (slot === null) return;
      slot.group = group;
      gl.beginQuery(extension.TIME_ELAPSED_EXT, slot.query);
      activeSlot = slot;
    },
    end: () => {
      if (activeSlot === null) return;
      gl.endQuery(extension.TIME_ELAPSED_EXT);
      activeSlot.isPending = true;
      activeSlot = null;
    },
    read: () => {
      collectVjTimerSlots(gl, extension, slots, readings);
      return readings;
    },
    dispose: () => {
      if (activeSlot !== null) gl.endQuery(extension.TIME_ELAPSED_EXT);
      activeSlot = null;
      for (const slot of slots) gl.deleteQuery(slot.query);
      slots.length = 0;
      if (perfWindow.__vjEnginePerf === readings) {
        delete perfWindow.__vjEnginePerf;
      }
    },
  };
}
