/**
 * Which renderer draws the projector (engine plan, decision 13; Task E22;
 * simple renderer plan, Task T4).
 *
 * - `probing`: the WebGL stage is mounting and the compositor is starting.
 * - `webgl2`: the compositor draws.
 * - `webgl2Restoring`: the first context loss. The DOM renderer shows while
 *   the browser restores the context; the canvas stays mounted and hidden.
 * - `dom`: the backup DOM renderer. Reached when WebGL2 is missing or
 *   refused, a core program fails, the context is lost a second time, or
 *   `?vjRenderer=dom` forces it. Once there, WebGL counts as retired
 *   (`retiredReason`): the page holds `dom` until the remote asks for the
 *   simple renderer, and asking for effects again comes back to `dom`.
 * - `simple`: the simple renderer the remote picked (clips with a crossfade).
 *   It can be left: effects send the page back to the engine, or to `dom`
 *   when WebGL is retired.
 *
 * The hand-off: a remote switch moves `phase` at once and keeps the leaving
 * phase in `handOffFrom`. The leaving renderer stays mounted and drawing
 * until the arriving one reports its first live frame (`firstLiveFrame` from
 * the compositor, `rendererShown` from the DOM and simple renderers) or the
 * stage's `VJ_RENDERER_HAND_OFF_MAX_MS` timer sends `handOffTimedOut`.
 *
 * Pure: `useVjRendererKind` holds the state, the stages send the events.
 */
import type { VjRenderer, VjRenderMode } from "../../../shared/contracts/vj";
import type { VjEngineUnavailableReason } from "../engine/gl/vjGlContext";

export type VjRendererPhase =
  "probing" | "webgl2" | "webgl2Restoring" | "dom" | "simple";

export type VjRendererReason = VjEngineUnavailableReason | "forced";

export interface VjRendererState {
  phase: VjRendererPhase;
  /** Why the DOM renderer shows (or is about to), as a reason code; null on WebGL and simple. */
  reason: VjRendererReason | null;
  /** Context losses seen on this page. */
  lossCount: number;
  /** Set once WebGL failed on its own or `?vjRenderer=dom` forced DOM; effects then return to `dom`. */
  retiredReason: VjRendererReason | null;
  /** The phase whose renderer still draws until this phase's renderer has its first live frame; null when settled. */
  handOffFrom: VjRendererPhase | null;
}

export type VjRendererEvent =
  | { type: "forcedDom" }
  | { type: "ready" }
  | { type: "unavailable"; reason: VjEngineUnavailableReason }
  | { type: "contextLost"; lossCount: number }
  | { type: "contextRestored" }
  | { type: "remoteMode"; mode: VjRenderMode }
  | { type: "firstLiveFrame" }
  | { type: "rendererShown"; renderer: "dom" | "simple" }
  | { type: "handOffTimedOut" };

export const INITIAL_VJ_RENDERER: VjRendererState = {
  phase: "probing",
  reason: null,
  lossCount: 0,
  retiredReason: null,
  handOffFrom: null,
};

/** The longest a leaving renderer keeps drawing while the arriving one starts. */
export const VJ_RENDERER_HAND_OFF_MAX_MS = 4_000;

/** The query parameter an operator sets to `dom` to force the DOM renderer. */
export const VJ_RENDERER_QUERY_PARAM = "vjRenderer";

/** A context lost this many times retires WebGL: effects return to the DOM renderer. */
const VJ_CONTEXT_LOSSES_BEFORE_DOM = 2;

/** True when the page's query string (`location.search`) holds `vjRenderer=dom`. */
export function isVjDomRendererForced(search: string): boolean {
  return new URLSearchParams(search).get(VJ_RENDERER_QUERY_PARAM) === "dom";
}

function isEnginePhase(phase: VjRendererPhase | null): boolean {
  return (
    phase === "probing" || phase === "webgl2" || phase === "webgl2Restoring"
  );
}

function isDomPhase(phase: VjRendererPhase | null): boolean {
  return phase === "webgl2Restoring" || phase === "dom";
}

function isEngineEvent(event: VjRendererEvent): boolean {
  return (
    event.type === "ready" ||
    event.type === "unavailable" ||
    event.type === "contextLost" ||
    event.type === "contextRestored" ||
    event.type === "firstLiveFrame"
  );
}

function withHandOffFrom(
  state: VjRendererState,
  handOffFrom: VjRendererPhase | null,
): VjRendererState {
  return state.handOffFrom === handOffFrom ? state : { ...state, handOffFrom };
}

function forceDom(state: VjRendererState): VjRendererState {
  return {
    ...state,
    phase: "dom",
    reason: "forced",
    retiredReason: "forced",
    handOffFrom: null,
  };
}

function applyReady(state: VjRendererState): VjRendererState {
  if (state.phase === "probing") {
    return { ...state, phase: "webgl2", reason: null };
  }
  if (state.phase === "simple" && state.handOffFrom === "probing") {
    return withHandOffFrom(state, "webgl2");
  }
  return state;
}

/**
 * The leaving phase once the leaving engine breaks during a hand-off to the
 * simple renderer. A restoring engine leaves the DOM renderer drawing, so it
 * keeps drawing until the simple stage shows; a probing or live engine left
 * only its canvas, so the hand-off ends.
 */
function handOffAfterEngineBreaks(
  handOffFrom: VjRendererPhase | null,
): VjRendererPhase | null {
  return handOffFrom === "webgl2Restoring" ? "dom" : null;
}

function applyUnavailable(
  state: VjRendererState,
  reason: VjEngineUnavailableReason,
): VjRendererState {
  if (isEnginePhase(state.phase)) {
    return { ...state, phase: "dom", reason, retiredReason: reason };
  }
  if (state.phase === "simple" && isEnginePhase(state.handOffFrom)) {
    return {
      ...state,
      retiredReason: reason,
      handOffFrom: handOffAfterEngineBreaks(state.handOffFrom),
    };
  }
  return state;
}

function applyContextLost(
  state: VjRendererState,
  reportedLossCount: number,
): VjRendererState {
  const lossCount = Math.max(state.lossCount + 1, reportedLossCount);
  const isRetiring = lossCount >= VJ_CONTEXT_LOSSES_BEFORE_DOM;
  if (isEnginePhase(state.phase)) {
    return isRetiring
      ? {
          ...state,
          phase: "dom",
          reason: "contextLost",
          lossCount,
          retiredReason: "contextLost",
        }
      : {
          ...state,
          phase: "webgl2Restoring",
          reason: "contextLost",
          lossCount,
        };
  }
  if (state.phase === "simple" && isEnginePhase(state.handOffFrom)) {
    return {
      ...state,
      lossCount,
      retiredReason: isRetiring ? "contextLost" : state.retiredReason,
      handOffFrom: handOffAfterEngineBreaks(state.handOffFrom),
    };
  }
  return state;
}

function applyContextRestored(state: VjRendererState): VjRendererState {
  if (state.phase === "webgl2Restoring") {
    return { ...state, phase: "webgl2", reason: null };
  }
  if (state.phase === "simple" && state.handOffFrom === "webgl2Restoring") {
    return withHandOffFrom(state, "webgl2");
  }
  return state;
}

function moveToSimple(state: VjRendererState): VjRendererState {
  if (state.phase === "simple") return state;
  // The simple renderer still draws while another arrives: it stays.
  const handOffFrom = state.handOffFrom === "simple" ? null : state.phase;
  return { ...state, phase: "simple", reason: null, handOffFrom };
}

function reasonOnReturnTo(
  state: VjRendererState,
  phase: VjRendererPhase,
): VjRendererReason | null {
  if (phase === "dom") return state.retiredReason;
  if (phase === "webgl2Restoring") return "contextLost";
  return null;
}

function moveToEffects(state: VjRendererState): VjRendererState {
  if (state.phase !== "simple") return state;
  if (state.handOffFrom !== null) {
    // The leaving renderer still draws: the page goes straight back to it.
    const phase = state.handOffFrom;
    return {
      ...state,
      phase,
      reason: reasonOnReturnTo(state, phase),
      handOffFrom: null,
    };
  }
  return state.retiredReason === null
    ? { ...state, phase: "probing", reason: null, handOffFrom: "simple" }
    : {
        ...state,
        phase: "dom",
        reason: state.retiredReason,
        handOffFrom: "simple",
      };
}

function applyFirstLiveFrame(state: VjRendererState): VjRendererState {
  const isEngineDrawing = state.phase === "probing" || state.phase === "webgl2";
  return isEngineDrawing && state.handOffFrom === "simple"
    ? withHandOffFrom(state, null)
    : state;
}

function applyRendererShown(
  state: VjRendererState,
  renderer: "dom" | "simple",
): VjRendererState {
  if (renderer === "simple") {
    return state.phase === "simple" ? withHandOffFrom(state, null) : state;
  }
  return isDomPhase(state.phase) && state.handOffFrom === "simple"
    ? withHandOffFrom(state, null)
    : state;
}

export function reduceVjRenderer(
  state: VjRendererState,
  event: VjRendererEvent,
): VjRendererState {
  // Engine events only count while an engine is mounted to send them.
  if (isEngineEvent(event) && !vjRendererMountsOf(state).isEngineMounted) {
    return state;
  }
  switch (event.type) {
    case "forcedDom":
      return forceDom(state);
    case "ready":
      return applyReady(state);
    case "unavailable":
      return applyUnavailable(state, event.reason);
    case "contextLost":
      return applyContextLost(state, event.lossCount);
    case "contextRestored":
      return applyContextRestored(state);
    case "remoteMode":
      return event.mode === "simple"
        ? moveToSimple(state)
        : moveToEffects(state);
    case "firstLiveFrame":
      return applyFirstLiveFrame(state);
    case "rendererShown":
      return applyRendererShown(state, event.renderer);
    case "handOffTimedOut":
      return withHandOffFrom(state, null);
  }
}

/** The state a screen opens on, from the query flag and the remote's last mode. */
export function initialVjRendererOf(options: {
  isDomForced: boolean;
  renderMode: VjRenderMode;
}): VjRendererState {
  const isSimple = options.renderMode === "simple";
  if (options.isDomForced) {
    const forced = forceDom(INITIAL_VJ_RENDERER);
    return isSimple ? { ...forced, phase: "simple", reason: null } : forced;
  }
  return isSimple
    ? { ...INITIAL_VJ_RENDERER, phase: "simple" }
    : INITIAL_VJ_RENDERER;
}

/** The VjRenderer a status report names: "dom" while restoring or on DOM, "simple" on the simple renderer. */
export function vjRendererOf(state: VjRendererState): VjRenderer {
  switch (state.phase) {
    case "probing":
    case "webgl2":
      return "webgl2";
    case "webgl2Restoring":
    case "dom":
      return "dom";
    case "simple":
      return "simple";
  }
}

export type VjDrawingRenderer = "engine" | "dom" | "simple";

/** The renderer the phase itself draws with, ignoring any hand-off. */
export function vjDrawingRendererOf(state: VjRendererState): VjDrawingRenderer {
  switch (state.phase) {
    case "probing":
    case "webgl2":
      return "engine";
    case "webgl2Restoring":
    case "dom":
      return "dom";
    case "simple":
      return "simple";
  }
}

export interface VjRendererMounts {
  isEngineMounted: boolean;
  /** The engine canvas stays mounted while its context restores, out of sight. */
  isEngineHidden: boolean;
  isDomMounted: boolean;
  /** The DOM renderer mounts under the leaving simple stage until it shows. */
  isDomArriving: boolean;
  isSimpleMounted: boolean;
  /** The simple stage mounts on top at 1% opacity until it shows. */
  isSimpleArriving: boolean;
}

/** Which renderers sit on the stage: the phase's own plus the leaving one. */
export function vjRendererMountsOf(state: VjRendererState): VjRendererMounts {
  const { phase, handOffFrom } = state;
  return {
    isEngineMounted: isEnginePhase(phase) || isEnginePhase(handOffFrom),
    isEngineHidden:
      phase === "webgl2Restoring" || handOffFrom === "webgl2Restoring",
    isDomMounted: isDomPhase(phase) || isDomPhase(handOffFrom),
    isDomArriving: isDomPhase(phase) && handOffFrom === "simple",
    isSimpleMounted: phase === "simple" || handOffFrom === "simple",
    isSimpleArriving: phase === "simple" && handOffFrom !== null,
  };
}

/** A key that changes only when a renderer mounts or unmounts. */
export function vjRendererMountsKey(mounts: VjRendererMounts): string {
  return `${String(mounts.isEngineMounted)}|${String(mounts.isDomMounted)}|${String(mounts.isSimpleMounted)}`;
}
