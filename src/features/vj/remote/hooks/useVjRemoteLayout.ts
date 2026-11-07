/**
 * The remote's two layouts and the compact strips rule. A wide window or a
 * landscape tablet gets the split layout (grid beside the dock column); a
 * short viewport or a short installed app merges the scenes and history
 * strips into one row.
 */
import { useMemo } from "react";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";

export const VJ_SPLIT_QUERY =
  "(min-width: 900px), (orientation: landscape) and (min-width: 700px)";

export const VJ_COMPACT_STRIPS_QUERY =
  "(max-height: 800px), (display-mode: standalone) and (max-height: 900px)";

export type VjRemoteLayoutKind = "phone" | "split";

export interface VjRemoteLayout {
  layout: VjRemoteLayoutKind;
  isCompactStrips: boolean;
}

export function useVjRemoteLayout(): VjRemoteLayout {
  const isSplit = useMediaQuery(VJ_SPLIT_QUERY);
  const isCompactStrips = useMediaQuery(VJ_COMPACT_STRIPS_QUERY);
  return useMemo(
    () => ({ layout: isSplit ? "split" : "phone", isCompactStrips }),
    [isSplit, isCompactStrips],
  );
}
