import { useLayoutEffect } from "react";

const STUDIO_SHELL_ATTRIBUTE = "data-studio-shell";

// Counted so a route change between the two Studio shells (one mounting while
// the other unmounts, in either order) never drops the signal mid-visit.
let mountedShellCount = 0;

/** Stamps `<html data-studio-shell="true">` while a Studio shell is mounted.
 *  The app's bottom tab bar is absent in Studio, so standalone.css collapses
 *  `--bottom-inset` on that signal; the listener shell's own tab bar raises it
 *  again at <=880px through useStudioTabsSignal. studio.module.css reads the
 *  signal for the sticky topbar's scroll padding. A layout effect, so the
 *  attribute lands before the first paint. Same technique as MessagesPage's
 *  `data-messages-thread`. */
export function useStudioShellSignal() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    mountedShellCount += 1;
    root.setAttribute(STUDIO_SHELL_ATTRIBUTE, "true");
    return () => {
      mountedShellCount -= 1;
      if (mountedShellCount === 0) root.removeAttribute(STUDIO_SHELL_ATTRIBUTE);
    };
  }, []);
}
