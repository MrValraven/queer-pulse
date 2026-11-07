import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** The search param that keeps the library section in the URL. */
export const VJ_VIEW_PARAM = "view";
/** `?view=show` opens Scenes and set lists. */
export const VJ_SHOW_VIEW_PARAM_VALUE = "show";

/** The two sections of the library: clips and packs, or scenes and set lists. */
export type VjLibraryView = "clips" | "show";

/**
 * Which section of the library is open. `?view=show` opens Scenes and set
 * lists; anything else (no param included) is Clips, which drops the param so
 * the plain library URL stays clean. A switch replaces the history entry and
 * keeps `?pack=`, so coming back to Clips lands on the same pack.
 */
export function useVjLibraryView(): {
  view: VjLibraryView;
  select: (view: VjLibraryView) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: VjLibraryView =
    searchParams.get(VJ_VIEW_PARAM) === VJ_SHOW_VIEW_PARAM_VALUE
      ? "show"
      : "clips";

  const select = useCallback(
    (nextView: VjLibraryView) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (nextView === "show") {
            next.set(VJ_VIEW_PARAM, VJ_SHOW_VIEW_PARAM_VALUE);
          } else {
            next.delete(VJ_VIEW_PARAM);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { view, select };
}
