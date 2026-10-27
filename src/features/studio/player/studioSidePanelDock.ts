import { useLayoutEffect, useSyncExternalStore } from "react";
import { mediaMax, mediaMin } from "../../../shared/theme/breakpoints";

/** The side panel docks as a column from this width. */
export const STUDIO_SIDE_PANEL_DOCK_QUERY = mediaMin(1280);

/** Below 1500px an open docked panel folds the rail to its icon strip. */
export const STUDIO_SIDE_PANEL_RAIL_FOLD_QUERY = mediaMax(1499);

// Counted so a route change between two shells (one mounting while the other
// unmounts, in either order) keeps the dock in place mid-visit.
let mountedDockHostCount = 0;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readIsDockHostMounted(): boolean {
  return mountedDockHostCount > 0;
}

function readIsDockHostMountedOnServer(): boolean {
  return false;
}

/** Marks the caller (the listener shell) as the place the side panel docks.
 *  On a cold load the surface hears it only after the first paint, so the
 *  shell works out its own docked view to show the column from its first
 *  render (useStudioShellSidePanel). Same counted technique as
 *  useStudioShellSignal. */
export function useStudioSidePanelDockHost(): void {
  useLayoutEffect(() => {
    mountedDockHostCount += 1;
    notifyListeners();
    return () => {
      mountedDockHostCount -= 1;
      notifyListeners();
    };
  }, []);
}

/** Whether a dock host is mounted anywhere in the app. */
export function useIsStudioSidePanelDockHostMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    readIsDockHostMounted,
    readIsDockHostMountedOnServer,
  );
}
