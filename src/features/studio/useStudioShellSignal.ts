import { useEffect } from "react";

const STUDIO_SHELL_ATTRIBUTE = "data-studio-shell";

// Counted so a route change between the two Studio shells (one mounting while
// the other unmounts, in either order) never drops the signal mid-visit.
let mountedShellCount = 0;

/** Stamps `<html data-studio-shell="true">` while a Studio shell is mounted.
 *  Studio renders no bottom tab bar, so standalone.css collapses
 *  `--bottom-inset` on that signal and the player bar sits at the screen
 *  bottom; studio.module.css reads it for the sticky topbar's scroll padding.
 *  Same technique as MessagesPage's `data-messages-thread`. */
export function useStudioShellSignal() {
  useEffect(() => {
    const root = document.documentElement;
    mountedShellCount += 1;
    root.setAttribute(STUDIO_SHELL_ATTRIBUTE, "true");
    return () => {
      mountedShellCount -= 1;
      if (mountedShellCount === 0) root.removeAttribute(STUDIO_SHELL_ATTRIBUTE);
    };
  }, []);
}
