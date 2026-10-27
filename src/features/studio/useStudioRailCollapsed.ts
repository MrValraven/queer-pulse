import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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

/** The member's saved choice. Only the member's own toggle writes it. */
let isCollapsedNow =
  typeof window === "undefined" ? false : readStoredCollapsed();

/** How many mounted requesters (the docked panel) want the rail folded. */
let panelFoldRequestCount = 0;
/** The member unfolded the rail by hand during this panel opening. */
let isUnfoldedByHand = false;

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

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

/** Saved choice, or the temporary fold the panel asks for. */
function readCollapsed(): boolean {
  return isCollapsedNow || (panelFoldRequestCount > 0 && !isUnfoldedByHand);
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
  notifyListeners();
}

function toggleCollapsed(): void {
  if (!readCollapsed()) {
    writeCollapsed(true);
    return;
  }
  if (panelFoldRequestCount > 0) isUnfoldedByHand = true;
  if (isCollapsedNow) {
    writeCollapsed(false);
    return;
  }
  notifyListeners();
}

/**
 * While `isRequested` is true the rail folds temporarily, without touching
 * the member's saved choice. When the last request ends, the hand unfold
 * resets for the next opening. The reset waits one microtask so a shell
 * remount inside the same commit keeps the member's unfold.
 */
export function useStudioRailPanelFold(isRequested: boolean): void {
  useLayoutEffect(() => {
    if (!isRequested) return;
    panelFoldRequestCount += 1;
    notifyListeners();
    return () => {
      panelFoldRequestCount -= 1;
      notifyListeners();
      if (panelFoldRequestCount > 0) return;
      queueMicrotask(() => {
        if (panelFoldRequestCount > 0) return;
        isUnfoldedByHand = false;
        notifyListeners();
      });
    };
  }, [isRequested]);
}

/**
 * The listener shell's own fold for its grid, provided around the rail. It
 * also counts a docked panel's fold the store hears only after the first
 * paint, so the rail's labels start folded with the grid and never fade on
 * entry. Null outside the shell, where the store answers alone.
 */
export const StudioShellRailCollapsedContext = createContext<boolean | null>(
  null,
);

/**
 * The Studio rail's folded state, shared by the shell (grid column) and the
 * rail (labels, tooltips, toggle). Kept in localStorage on this device only.
 * Inside the shell the shell's fold answers first; the toggle always writes
 * the store.
 */
export function useStudioRailCollapsed(): {
  isRailCollapsed: boolean;
  toggleRail: () => void;
} {
  const isShellRailCollapsed = useContext(StudioShellRailCollapsedContext);
  const isStoreRailCollapsed = useSyncExternalStore(
    subscribe,
    readCollapsed,
    readCollapsedOnServer,
  );
  const toggleRail = useCallback(() => toggleCollapsed(), []);
  return {
    isRailCollapsed: isShellRailCollapsed ?? isStoreRailCollapsed,
    toggleRail,
  };
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
