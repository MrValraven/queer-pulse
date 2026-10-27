import { useLayoutEffect, useState } from "react";
import { useMediaQuery } from "../../shared/hooks";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioPlayerSurface } from "./player/studioPlayerSurface";
import {
  STUDIO_SIDE_PANEL_DOCK_QUERY,
  STUDIO_SIDE_PANEL_RAIL_FOLD_QUERY,
  useIsStudioSidePanelDockHostMounted,
  useStudioSidePanelDockHost,
} from "./player/studioSidePanelDock";
import { useStudioSidePanelPreference } from "./player/studioSidePanelPreference";
import { resolveStudioSidePanel } from "./player/studioSidePanelState";
import {
  useStudioRailCollapsed,
  useStudioRailPanelFold,
} from "./useStudioRailCollapsed";

/** The rail's folded state for the grid, with the docked panel's fold below
 *  1500px. On a cold load (no shell mounted yet) the store hears the fold
 *  after first paint, so the grid folds from the first render, and the shell
 *  hands this value to the rail's readers (StudioShellRailCollapsedContext)
 *  so they fold with it. A route change finds the fold already counted, so
 *  the store is read as is. */
function useShellRailCollapsed(isFoldRequested: boolean): boolean {
  const { isRailCollapsed } = useStudioRailCollapsed();
  const isDockHostAlreadyMounted = useIsStudioSidePanelDockHostMounted();
  useStudioRailPanelFold(isFoldRequested);
  const [isFoldUnheard, setIsFoldUnheard] = useState(
    () => isFoldRequested && !isRailCollapsed && !isDockHostAlreadyMounted,
  );
  useLayoutEffect(() => {
    // The fold has registered; re-rendering before paint reads it back.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFoldUnheard(false);
  }, []);
  return isRailCollapsed || isFoldUnheard;
}

/** The docked panel as the listener shell (the dock host) shows it, read
 *  from the saved preference and the widths directly, so a cold load lands
 *  on its first render (the surface hears the host only after first paint).
 *  It reads `hasQueue` from the surface, so the shell skips the player
 *  context's per-tick changes. */
export function useStudioShellSidePanel(isCompact: boolean) {
  useStudioSidePanelDockHost();
  const isDockWide = useMediaQuery(STUDIO_SIDE_PANEL_DOCK_QUERY);
  const isFoldWidth = useMediaQuery(STUDIO_SIDE_PANEL_RAIL_FOLD_QUERY);
  const preference = useStudioSidePanelPreference();
  const { hasQueue } = useStudioPlayerSurface();
  const { hasAccess } = useStudioAccess();
  const isDockedPlacement = !isCompact && isDockWide;
  // Invariant: once the surface hears this host, its docked view and this
  // one follow the same rule and differ only by hasAccess. The bar also
  // requires access (StudioPlayerMount), so the bar's toggles never show a
  // docked view this column leaves out.
  const dockedView =
    isDockedPlacement && hasAccess
      ? resolveStudioSidePanel({
          placement: "docked",
          preference,
          floatingView: null,
          hasQueue,
        })
      : null;
  const isRailCollapsed = useShellRailCollapsed(
    dockedView !== null && isFoldWidth,
  );
  return { isDockedPlacement, dockedView, isRailCollapsed };
}
