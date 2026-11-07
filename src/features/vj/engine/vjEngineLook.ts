/**
 * What React hands the engine (engine plan, Engine types): the look of one
 * applied stage state, the layers it draws, and the clock it reads. The
 * engine never re-renders React; the compositor swaps looks on its own
 * animation frame and ignores a look whose version key it already shows.
 */
import {
  vjBlackoutFadeMs,
  type VjBlendMode,
  type VjEffectSettings,
  type VjSpeed,
  type VjStageState,
  type VjTempo,
  type VjTransitionId,
} from "../../../shared/contracts/vj";
import type {
  VjRenderableClip,
  VjRenderableSource,
} from "../screen/vjLayerMachine";
import { resolveVjTransition } from "./vjTransitionRegistry";

export interface VjClockReader {
  /** Synced server epoch ms now. */
  serverNow: () => number;
  /** performance.now() time of a server epoch ms. */
  toLocalTime: (serverMs: number) => number;
}

export interface VjResolvedTransition {
  mode: VjTransitionId;
  durationMs: number;
}

export interface VjEngineLook {
  /** `${stageEpoch}|${revision}`: a look with the key already shown is a no-op. */
  versionKey: string;
  settings: VjEffectSettings;
  speed: VjSpeed;
  transition: VjResolvedTransition;
  tempo: VjTempo;
  isBlackout: boolean;
  blackoutFadeMs: number;
  strobe: { isStrobing: boolean; isEnabled: boolean };
  mix: { amount: number; blendMode: VjBlendMode };
}

export interface VjEngineLayers {
  live: VjRenderableSource | null;
  mix: VjRenderableClip | null;
}

/** The version key of a stage state: epoch and revision. */
export function vjEngineVersionKey(
  state: Pick<VjStageState, "stageEpoch" | "revision">,
): string {
  return `${state.stageEpoch}|${state.revision}`;
}

/** The engine's look for one applied stage state; strobe flashes only where `isStrobeEnabled` (the lead screen). */
export function vjEngineLookOf(
  state: VjStageState,
  options: { isStrobeEnabled: boolean },
): VjEngineLook {
  return {
    versionKey: vjEngineVersionKey(state),
    settings: { ...state.effects.settings },
    speed: state.effects.speed,
    transition: resolveVjTransition(state.transition, state.tempo),
    tempo: { ...state.tempo },
    isBlackout: state.effects.isBlackout,
    blackoutFadeMs: vjBlackoutFadeMs(state.transition, state.tempo),
    strobe: {
      isStrobing: state.effects.isStrobing,
      isEnabled: options.isStrobeEnabled,
    },
    mix: { amount: state.mix.amount, blendMode: state.mix.blendMode },
  };
}

/** performance.timeOrigin, or 0 where the browser has no performance clock (vjLocalNow then reads Date.now()). */
function performanceTimeOrigin(): number {
  const hasPerformanceClock =
    typeof performance !== "undefined" &&
    typeof performance.now === "function" &&
    typeof performance.timeOrigin === "number";
  return hasPerformanceClock ? performance.timeOrigin : 0;
}

/**
 * The one adapter from the shared clock (`VjStageController` through
 * `useVjStage`, or the remote's clock) to `VjClockReader`. The shared clock's
 * `toLocalTime` answers vjLocalNow time (`performance.timeOrigin +
 * performance.now()`); the engine compares with requestAnimationFrame
 * timestamps (`performance.now()` time), so this subtracts the time origin.
 * The source is read on every call, so a clock that slews stays current.
 */
export function vjClockReaderOf(source: {
  serverNow: () => number;
  toLocalTime: (serverMs: number) => number;
}): VjClockReader {
  return {
    serverNow: () => source.serverNow(),
    toLocalTime: (serverMs) =>
      source.toLocalTime(serverMs) - performanceTimeOrigin(),
  };
}
