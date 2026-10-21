import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";

/** Phones (the `--md` cut, 640px): a detail hero's action row turns into the
 *  big Play plus round icon buttons with tooltips, so it stays on one line
 *  and the tracklist starts above the fold. */
export function useIsHeroCompact(): boolean {
  return useMediaQuery(mediaMax("md"));
}
