import { useReducer } from "react";
import type { VjRenderMode } from "../../../shared/contracts/vj";
import {
  initialVjRendererOf,
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
 * The projector's renderer state for the page's life. The first render
 * already follows `?vjRenderer=dom` and the remote's render mode, so a forced
 * page never mounts the WebGL stage and a screen that joins a show on the
 * simple renderer opens on it. Later mode changes arrive as `remoteMode`
 * events (useVjRendererHandOff).
 */
export function useVjRendererKind(renderMode: VjRenderMode): {
  state: VjRendererState;
  dispatch: (event: VjRendererEvent) => void;
} {
  const [state, dispatch] = useReducer(reduceVjRenderer, renderMode, (mode) =>
    initialVjRendererOf({ isDomForced: readForcedDom(), renderMode: mode }),
  );
  return { state, dispatch };
}
