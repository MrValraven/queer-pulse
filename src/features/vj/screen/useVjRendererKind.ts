import { useReducer } from "react";
import {
  INITIAL_VJ_RENDERER,
  isVjDomRendererForced,
  reduceVjRenderer,
  type VjRendererEvent,
  type VjRendererState,
} from "./vjRendererKind";

function readForcedDom(): boolean {
  return (
    typeof window !== "undefined" &&
    isVjDomRendererForced(window.location.search)
  );
}

/**
 * The projector's renderer state for the page's life. `?vjRenderer=dom`
 * applies `forcedDom` before the first render, so a forced page never mounts
 * the WebGL stage at all.
 */
export function useVjRendererKind(): {
  state: VjRendererState;
  dispatch: (event: VjRendererEvent) => void;
} {
  const [state, dispatch] = useReducer(
    reduceVjRenderer,
    INITIAL_VJ_RENDERER,
    (initial) =>
      readForcedDom()
        ? reduceVjRenderer(initial, { type: "forcedDom" })
        : initial,
  );
  return { state, dispatch };
}
