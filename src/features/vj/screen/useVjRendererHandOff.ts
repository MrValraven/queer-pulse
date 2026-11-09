/**
 * The renderer hand-off (simple renderer plan, Task T10). Every renderer
 * event goes through the returned dispatch, which reads what every mounted
 * renderer holds (`snapshotHeld`) just before an event that mounts or
 * unmounts a renderer, while every handle answers. An engine arriving during
 * a blackout draws it at full from its first frame (the compositor's
 * `shouldCutFirstTarget`), so its first live frame hands over at once.
 *
 * It also sends the remote's render mode to the reducer as it changes, and
 * ends a hand-off that runs past VJ_RENDERER_HAND_OFF_MAX_MS with
 * `handOffTimedOut`, so a renderer that never reports still takes over.
 */
import { useEffect, useEffectEvent, useRef } from "react";
import type { VjRenderMode } from "../../../shared/contracts/vj";
import {
  VJ_RENDERER_HAND_OFF_MAX_MS,
  reduceVjRenderer,
  vjDrawingRendererOf,
  vjRendererMountsKey,
  vjRendererMountsOf,
  type VjRendererEvent,
  type VjRendererState,
} from "./vjRendererKind";

/** The state the queued events lead to, and the rendered state it was reduced from. */
interface VjRendererPrediction {
  basis: VjRendererState;
  predicted: VjRendererState;
}

function mountsKeyOf(state: VjRendererState): string {
  return vjRendererMountsKey(vjRendererMountsOf(state));
}

/**
 * Changes when a new hand-off starts or one ends: the renderer arriving and
 * whether one still leaves. The engine's `ready` or a context restore during
 * a hand-off keeps the key, so the safety timer keeps running.
 */
function handOffKeyOf(state: VjRendererState): string {
  const drawing = vjDrawingRendererOf(state);
  return state.handOffFrom === null
    ? `${drawing}|settled`
    : `${drawing}|handing`;
}

export function useVjRendererHandOff(input: {
  state: VjRendererState;
  dispatch: (event: VjRendererEvent) => void;
  renderMode: VjRenderMode;
  snapshotHeld: () => void;
}): (event: VjRendererEvent) => void {
  const { state, dispatch, renderMode, snapshotHeld } = input;
  const predictionRef = useRef<VjRendererPrediction | null>(null);

  /** Two events before a re-render: the second one reduces from the first one's result. */
  const dispatchRenderer = (event: VjRendererEvent): void => {
    const prediction = predictionRef.current;
    const current =
      prediction !== null && prediction.basis === state
        ? prediction.predicted
        : state;
    const next = reduceVjRenderer(current, event);
    if (mountsKeyOf(next) !== mountsKeyOf(current)) snapshotHeld();
    predictionRef.current = { basis: state, predicted: next };
    dispatch(event);
  };

  const sendRemoteMode = useEffectEvent((mode: VjRenderMode) =>
    dispatchRenderer({ type: "remoteMode", mode }),
  );
  // A no-op on mount: the first state already follows the mode.
  useEffect(() => {
    sendRemoteMode(renderMode);
  }, [renderMode]);

  const timeOutHandOff = useEffectEvent(() =>
    dispatchRenderer({ type: "handOffTimedOut" }),
  );
  const handOffKey = handOffKeyOf(state);
  const isHandingOff = state.handOffFrom !== null;
  useEffect(() => {
    if (!isHandingOff) return;
    const timeoutHandle = window.setTimeout(() => {
      timeOutHandOff();
    }, VJ_RENDERER_HAND_OFF_MAX_MS);
    return () => window.clearTimeout(timeoutHandle);
  }, [handOffKey, isHandingOff]);

  return dispatchRenderer;
}
