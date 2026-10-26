import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";

/** Phones (the `--md` cut, 640px) and a phone on its side (500px tall or
 *  less): a detail hero's action row turns into the big Play plus round
 *  icon buttons with tooltips, so it stays on one line and the tracklist
 *  starts above the fold. */
export function useIsHeroCompact(): boolean {
  return useMediaQuery(`${mediaMax("md")}, (max-height: 500px)`);
}

/** The hero action row's secondary actions go icon-only (round buttons
 *  with tooltips) up to 1279px as well as on phones: below 1280px the album,
 *  track and episode heroes wrapped their labelled actions onto two rows.
 *  Labels show from 1280px. Play and "Play from {time}" keep their words.
 *  The layout itself follows `useIsHeroCompact`. */
export function useIsHeroActionsCompact(): boolean {
  return useMediaQuery(
    `${mediaMax(1279)}, ${mediaMax("md")}, (max-height: 500px)`,
  );
}

/** Below 1440px a hero's Share moves into its "..." menu with every way to
 *  share (useStudioFoldedShareItems), so the action row keeps one line. */
export function useIsHeroShareFolded(): boolean {
  return useMediaQuery(mediaMax(1439));
}
