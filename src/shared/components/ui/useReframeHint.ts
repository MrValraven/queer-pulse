import { useId, useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";

const COARSE_POINTER_QUERY = "(pointer: coarse)";

/** Touch copy is the default: it is what the tester's phone needs, and it is
 *  what renders wherever `matchMedia` is missing (tests, prerender). */
function isCoarsePointerNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return true;
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

/**
 * The one-line gesture hint under a square reframe frame, worded for the
 * device in hand: pinch on a touch screen, scroll wheel with a mouse. Read
 * once on mount, since the modal lives for a single reframe. `hintId` lets the
 * frame point `aria-describedby` at the hint.
 */
export function useReframeHint(): { hintId: string; hintText: string } {
  const { t } = useTranslation();
  const hintId = useId();
  const [isCoarsePointer] = useState(isCoarsePointerNow);
  return {
    hintId,
    hintText: t(
      isCoarsePointer
        ? "shared:reframe.hintTouch"
        : "shared:reframe.hintPointer",
    ),
  };
}
