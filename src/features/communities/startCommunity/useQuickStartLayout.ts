import { useMediaQuery } from "../../../shared/hooks";
import { mediaMax } from "../../../shared/theme/breakpoints";

/** The app's mobile width, where `/communities/start` opens the quick flow. */
export const QUICK_START_LAYOUT_QUERY = mediaMax("mobile");

/** True while the window sits at or under the mobile width. */
export function useQuickStartLayout(): boolean {
  return useMediaQuery(QUICK_START_LAYOUT_QUERY);
}
