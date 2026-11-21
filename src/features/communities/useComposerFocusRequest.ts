import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  COMPOSER_FOCUS_PARAM,
  COMPOSER_FOCUS_VALUE,
} from "./composerFocusRequest";

/**
 * Reads the `?compose=1` request from the address bar. `onFocusHandled` drops
 * the param (keeping every other one) with a replace, so a refresh or the back
 * button never focuses the composer a second time.
 */
export function useComposerFocusRequest(): {
  isFocusRequested: boolean;
  onFocusHandled: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const isFocusRequested =
    searchParams.get(COMPOSER_FOCUS_PARAM) === COMPOSER_FOCUS_VALUE;

  const onFocusHandled = useCallback(() => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.delete(COMPOSER_FOCUS_PARAM);
        return nextParams;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { isFocusRequested, onFocusHandled };
}

/**
 * Scrolls the field to the middle of the screen and focuses it once a focus
 * is requested, then reports it handled. The scroll respects the reduced
 * motion preference.
 */
export function useFocusWhenRequested(
  fieldRef: RefObject<HTMLElement | null>,
  isFocusRequested: boolean,
  onFocusHandled?: () => void,
): void {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const onFocusHandledRef = useRef(onFocusHandled);
  useEffect(() => {
    onFocusHandledRef.current = onFocusHandled;
  });

  useEffect(() => {
    if (!isFocusRequested) return;
    const field = fieldRef.current;
    if (!field) return;
    field.scrollIntoView?.({
      block: "center",
      behavior: isReducedMotion ? "auto" : "smooth",
    });
    field.focus({ preventScroll: true });
    onFocusHandledRef.current?.();
  }, [fieldRef, isFocusRequested, isReducedMotion]);
}
