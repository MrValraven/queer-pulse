import { useEffect } from "react";

/** The html attribute standalone.css reads for Pulse Live's frameless pages. */
export const QUIZSHOW_FRAMELESS_ATTRIBUTE = "data-quizshow-frameless";

/** How many frameless pages are mounted right now, across transition planes. */
let mountedFramelessPageCount = 0;

/**
 * Stamps `<html data-quizshow-frameless>` while a Pulse Live page (the screen,
 * the remote or the player's `/play` pages) is mounted, and removes it once
 * the last one leaves. These pages render no app frame, so the bottom tab bar
 * is absent, and standalone.css drops `--bottom-inset` to the home indicator
 * inset: the consent banner and the remote's control bar then sit on the
 * bottom edge. Same technique as CheckinFocusLayer's `data-checkin-focus`.
 *
 * Route transitions keep the outgoing page mounted on its own plane while the
 * next one mounts (browser Back from `/play/*` to an event's quizshow page),
 * so a count decides: the outgoing page's cleanup only removes the attribute
 * when no other frameless page is still mounted.
 */
export function useQuizshowFramelessPage(): void {
  useEffect(() => {
    const root = document.documentElement;
    mountedFramelessPageCount += 1;
    root.setAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE, "true");
    return () => {
      mountedFramelessPageCount = Math.max(0, mountedFramelessPageCount - 1);
      if (mountedFramelessPageCount === 0) {
        root.removeAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE);
      }
    };
  }, []);
}
