/**
 * Which renderer draws the projector (engine plan, decision 13; Task E22).
 *
 * - `probing`: the WebGL stage is mounting and the compositor is starting.
 * - `webgl2`: the compositor draws.
 * - `webgl2Restoring`: the first context loss. The DOM renderer shows while
 *   the browser restores the context; the canvas stays mounted and hidden.
 * - `dom`: the DOM renderer, for the page's life. Reached when WebGL2 is
 *   missing or refused, a core program fails, the context is lost a second
 *   time, or `?vjRenderer=dom` forces it.
 *
 * Pure: `useVjRendererKind` holds the state, the stages send the events.
 */
import type { VjRenderer } from "../../../shared/contracts/vj";
import type { VjEngineUnavailableReason } from "../engine/gl/vjGlContext";

export type VjRendererPhase = "probing" | "webgl2" | "webgl2Restoring" | "dom";

export interface VjRendererState {
  phase: VjRendererPhase;
  /** Why the DOM renderer shows (or is about to), as a reason code; null on WebGL. */
  reason: VjEngineUnavailableReason | "forced" | null;
  /** Context losses seen on this page. */
  lossCount: number;
}

export type VjRendererEvent =
  | { type: "forcedDom" }
  | { type: "ready" }
  | { type: "unavailable"; reason: VjEngineUnavailableReason }
  | { type: "contextLost"; lossCount: number }
  | { type: "contextRestored" };

export const INITIAL_VJ_RENDERER: VjRendererState = {
  phase: "probing",
  reason: null,
  lossCount: 0,
};

/** The query parameter an operator sets to `dom` to force the DOM renderer. */
export const VJ_RENDERER_QUERY_PARAM = "vjRenderer";

/** A context lost this many times settles on the DOM renderer for the page's life. */
const VJ_CONTEXT_LOSSES_BEFORE_DOM = 2;

/** True when the page's query string (`location.search`) holds `vjRenderer=dom`. */
export function isVjDomRendererForced(search: string): boolean {
  return new URLSearchParams(search).get(VJ_RENDERER_QUERY_PARAM) === "dom";
}

export function reduceVjRenderer(
  state: VjRendererState,
  event: VjRendererEvent,
): VjRendererState {
  // The DOM renderer is final: nothing brings WebGL back on this page.
  if (state.phase === "dom") return state;
  switch (event.type) {
    case "forcedDom":
      return { ...state, phase: "dom", reason: "forced" };
    case "ready":
      return state.phase === "probing"
        ? { ...state, phase: "webgl2", reason: null }
        : state;
    case "unavailable":
      return { ...state, phase: "dom", reason: event.reason };
    case "contextLost": {
      const lossCount = Math.max(state.lossCount + 1, event.lossCount);
      const phase =
        lossCount >= VJ_CONTEXT_LOSSES_BEFORE_DOM ? "dom" : "webgl2Restoring";
      return { phase, reason: "contextLost", lossCount };
    }
    case "contextRestored":
      return state.phase === "webgl2Restoring"
        ? { ...state, phase: "webgl2", reason: null }
        : state;
  }
}

/** The VjRenderer a status report names: "dom" while restoring or on DOM. */
export function vjRendererOf(state: VjRendererState): VjRenderer {
  return state.phase === "webgl2Restoring" || state.phase === "dom"
    ? "dom"
    : "webgl2";
}
