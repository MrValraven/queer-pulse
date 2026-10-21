import { useEffect, useSyncExternalStore, type RefObject } from "react";
import {
  FLAT_EQUALIZER_GAINS,
  readEqualizerGains,
  subscribeEqualizerGains,
} from "../studioPlayerPreferences";

/** This device's equaliser gains; flat until the member picks a curve. */
export function useStudioEqualizerGains(): readonly number[] {
  return useSyncExternalStore(
    subscribeEqualizerGains,
    readEqualizerGains,
    () => FLAT_EQUALIZER_GAINS,
  );
}

/** Keys a range steps itself with; Escape and Tab still reach the popover. */
const SLIDER_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** Keeps a slider's own keys inside it, for every range under `rootRef`:
 *  the player's shortcuts and the sheet around it never see them. A native
 *  listener, since the root is a plain wrapper. */
export function useStudioSliderKeyGuard(
  rootRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === "range" &&
        SLIDER_KEYS.has(event.key)
      )
        event.stopPropagation();
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [rootRef]);
}
