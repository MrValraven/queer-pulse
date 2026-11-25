import { useEffect } from "react";

/** The html attribute the toast stack's stylesheet reads (Toast.module.css). */
export const TOAST_PLACEMENT_ATTRIBUTE = "data-toast-placement";

/** How many studios are mounted right now, across transition planes. */
let mountedStudioCount = 0;

/**
 * While the studio is mounted, the app's toasts rest on the bottom edge: the
 * studio's dark top bar owns the top edge, and a toast there would cover its
 * save status and controls. Counted, like `useQuizshowFramelessPage`: a route
 * transition keeps the outgoing page mounted beside the next one, so the
 * attribute only goes once the last studio has left.
 */
export function useStudioToastsAtBottom(): void {
  useEffect(() => {
    const root = document.documentElement;
    mountedStudioCount += 1;
    root.setAttribute(TOAST_PLACEMENT_ATTRIBUTE, "bottom");
    return () => {
      mountedStudioCount = Math.max(0, mountedStudioCount - 1);
      if (mountedStudioCount === 0) {
        root.removeAttribute(TOAST_PLACEMENT_ATTRIBUTE);
      }
    };
  }, []);
}
