import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../shared/theme/breakpoints";

/** Whether member cards render split: a full-height portrait in a left column
 *  beside the details. Desktop viewports (above the 860px mobile cutover) get
 *  the split; phones keep the compact avatar-in-a-row card. The portrait column
 *  is 30% of the card on every surface (feed and directory CSS). Resolve it once
 *  per list and pass it down, so a grid and its cards always agree. */
export function useIsMemberCardSplit(): boolean {
  return !useMediaQuery(mediaMax("mobile"));
}
