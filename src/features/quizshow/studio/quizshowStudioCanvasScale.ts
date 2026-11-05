import { createContext, useContext } from "react";

/**
 * Reads how much the studio canvas is scaled on screen right now (the 1280x720
 * slide drawn into a smaller frame). Pieces on the slide that measure the
 * pointer against their own layout, such as a drag, convert with it. Outside
 * a canvas it reads 1.
 */
export const StudioCanvasScaleContext = createContext<() => number>(() => 1);

export function useStudioCanvasScale(): () => number {
  return useContext(StudioCanvasScaleContext);
}
