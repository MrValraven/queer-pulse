import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  type RefObject,
} from "react";

/** Device-only: whether the desktop rail is folded to its icon strip. */
const RAIL_COLLAPSED_STORAGE_KEY = "qp.studio.rail.collapsed.v1";

const listeners = new Set<() => void>();

function readStoredCollapsed(): boolean {
  try {
    return window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    // Private mode or blocked storage: the rail opens expanded.
    return false;
  }
}

let isCollapsedNow =
  typeof window === "undefined" ? false : readStoredCollapsed();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab folding its rail folds this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== RAIL_COLLAPSED_STORAGE_KEY) return;
    isCollapsedNow = event.newValue === "true";
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readCollapsed(): boolean {
  return isCollapsedNow;
}

function readCollapsedOnServer(): boolean {
  return false;
}

function writeCollapsed(isCollapsed: boolean): void {
  isCollapsedNow = isCollapsed;
  try {
    window.localStorage.setItem(
      RAIL_COLLAPSED_STORAGE_KEY,
      String(isCollapsed),
    );
  } catch {
    // Storage refused: the choice still holds for this visit.
  }
  for (const listener of listeners) listener();
}

/**
 * The Studio rail's folded state, shared by the shell (grid column) and the
 * rail (labels, tooltips, toggle). Kept in localStorage on this device only.
 */
export function useStudioRailCollapsed(): {
  isRailCollapsed: boolean;
  toggleRail: () => void;
} {
  const isRailCollapsed = useSyncExternalStore(
    subscribe,
    readCollapsed,
    readCollapsedOnServer,
  );
  const toggleRail = useCallback(() => writeCollapsed(!readCollapsed()), []);
  return { isRailCollapsed, toggleRail };
}

/**
 * Marks the shell's grid `data-rail-moving` while its rail column animates,
 * so studio.module.css can contain the page's layout for exactly that
 * window. Native transition events on the grid itself, no React state.
 */
export function useStudioRailTransitionFlag(
  appRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const isRailTransition = (event: TransitionEvent) =>
      event.target === app && event.propertyName === "grid-template-columns";
    const handleStart = (event: TransitionEvent) => {
      if (isRailTransition(event)) app.dataset.railMoving = "true";
    };
    const handleEnd = (event: TransitionEvent) => {
      if (isRailTransition(event)) delete app.dataset.railMoving;
    };
    app.addEventListener("transitionrun", handleStart);
    app.addEventListener("transitionend", handleEnd);
    app.addEventListener("transitioncancel", handleEnd);
    return () => {
      app.removeEventListener("transitionrun", handleStart);
      app.removeEventListener("transitionend", handleEnd);
      app.removeEventListener("transitioncancel", handleEnd);
      delete app.dataset.railMoving;
    };
  }, [appRef]);
}
