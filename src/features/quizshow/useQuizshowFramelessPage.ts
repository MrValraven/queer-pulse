import { useEffect } from "react";

/** The html attribute standalone.css reads for Pulse Live's frameless pages. */
export const QUIZSHOW_FRAMELESS_ATTRIBUTE = "data-quizshow-frameless";

/** How many frameless pages are mounted right now, across transition planes. */
let mountedFramelessPageCount = 0;

/** How many of them asked for the stage base behind the page. */
let stageBasePageCount = 0;

/** The inline backgrounds html and body had before the first such page
 *  mounted, put back once the last one leaves. */
let savedPageBackgrounds: { root: string; body: string } | null = null;

/** The stage's base colour, a token that sits on :root. */
const STAGE_BASE_BACKGROUND = "var(--qs-base)";

interface QuizshowFramelessPageOptions {
  /**
   * Paints html and body with the stage base while the page is mounted, so the
   * cream behind a dark page never flashes past the edge on an iOS overscroll.
   * Only a page that is dark itself asks (the player's `/play`): the print
   * sheets and the light stage keep the app's own background. Off by default.
   */
  shouldPaintStageBase?: boolean;
}

function paintStageBase(): void {
  if (stageBasePageCount === 0) {
    savedPageBackgrounds = {
      root: document.documentElement.style.background,
      body: document.body.style.background,
    };
    document.documentElement.style.background = STAGE_BASE_BACKGROUND;
    document.body.style.background = STAGE_BASE_BACKGROUND;
  }
  stageBasePageCount += 1;
}

function restoreStageBase(): void {
  stageBasePageCount = Math.max(0, stageBasePageCount - 1);
  if (stageBasePageCount > 0) return;
  document.documentElement.style.background = savedPageBackgrounds?.root ?? "";
  document.body.style.background = savedPageBackgrounds?.body ?? "";
  savedPageBackgrounds = null;
}

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
export function useQuizshowFramelessPage({
  shouldPaintStageBase = false,
}: QuizshowFramelessPageOptions = {}): void {
  useEffect(() => {
    const root = document.documentElement;
    mountedFramelessPageCount += 1;
    root.setAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE, "true");
    if (shouldPaintStageBase) paintStageBase();
    return () => {
      mountedFramelessPageCount = Math.max(0, mountedFramelessPageCount - 1);
      if (mountedFramelessPageCount === 0) {
        root.removeAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE);
      }
      if (shouldPaintStageBase) restoreStageBase();
    };
  }, [shouldPaintStageBase]);
}
