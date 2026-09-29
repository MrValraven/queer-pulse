import { mediaMax } from "../../../../shared/theme/breakpoints";

/**
 * The desk's two-column cutover as a `matchMedia` query, the JS twin of the
 * `--desk-split` custom media in `src/styles/tokens/breakpoints.css`. At or
 * below it the desk page grid drops to one column, and the rail reads this to
 * stack as a grid of cards under the table with Pitches first in the DOM.
 * From 1224px the rail sits beside the table. Change both together.
 */
export const DESK_SPLIT_QUERY = mediaMax(1223);
