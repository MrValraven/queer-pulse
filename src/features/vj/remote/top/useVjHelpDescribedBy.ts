/**
 * The help legend's ids (VjHelpLegend.tsx): each legend line's text carries
 * `vjHelpCaptionIdOf(id)`, and a control joins it into its aria-describedby
 * through `useVjHelpDescribedBy` only while help captions are on, so the
 * reference never points at a line that has folded away.
 */
import { useCallback } from "react";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";

/** The id of a legend line's text, for the control's aria-describedby. */
export function vjHelpCaptionIdOf(captionId: string): string {
  return `vj-help-legend-${captionId}`;
}

/**
 * Joins a control's other descriptions (the blocked reason, say) with its
 * legend line while help captions are on; undefined when there is none.
 */
export function useVjHelpDescribedBy(): (
  captionId: string,
  ...otherIds: readonly (string | undefined)[]
) => string | undefined {
  const { isOn } = useVjHelpCaptions();
  return useCallback(
    (captionId, ...otherIds) => {
      const ids = otherIds.filter(
        (otherId): otherId is string => otherId !== undefined && otherId !== "",
      );
      if (isOn) ids.push(vjHelpCaptionIdOf(captionId));
      return ids.length > 0 ? ids.join(" ") : undefined;
    },
    [isOn],
  );
}
