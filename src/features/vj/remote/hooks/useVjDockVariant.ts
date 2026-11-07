/**
 * Which dock design the remote draws. A comparison switch while the two
 * designs sit side by side: the user settles on one, and the other goes.
 * `?dock=pads` draws the Performance pads dock; any other value, or no param,
 * draws the polished dock. The dock root carries the variant as
 * `data-vj-dock-variant`, so the rows' CSS modules style each one.
 */
import { useSearchParams } from "react-router-dom";

/** The search param that picks the dock design. */
export const VJ_DOCK_PARAM = "dock";
/** `?dock=pads` draws the Performance pads dock. */
export const VJ_DOCK_PADS_PARAM_VALUE = "pads";

/** The two dock designs: the polished rows, or the Performance pads. */
export type VjDockVariant = "polish" | "pads";

export function useVjDockVariant(): VjDockVariant {
  const [searchParams] = useSearchParams();
  return searchParams.get(VJ_DOCK_PARAM) === VJ_DOCK_PADS_PARAM_VALUE
    ? "pads"
    : "polish";
}
