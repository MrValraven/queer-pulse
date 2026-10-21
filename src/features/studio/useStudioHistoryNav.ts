import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import {
  NavigationType,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import {
  canGoBack as canGoBackFrom,
  currentHistoryIdx,
} from "../../shared/components/layout/canGoBack";
import { routes } from "../../app/routeMap";

interface HistoryPosition {
  historyIdx: number;
  /** The furthest index this tab has reached. A push drops every entry
   *  ahead of it (the browser does the same), and Back and Forward keep it,
   *  so Forward is offered only while an entry really waits ahead. */
  furthestIdx: number;
}

// One store for the tab: both shells and the 404 read the same history. It
// fills on the first layout effect, before the first paint.
let position: HistoryPosition = { historyIdx: -1, furthestIdx: -1 };
const listeners = new Set<() => void>();
/** Studio surfaces using the store now; the first record after the tab
 *  left Studio (a return to Studio) starts the forward stack afresh. */
let mountedUserCount = 0;
let shouldRestartForwardStack = true;

function isStudioPath(pathname: string): boolean {
  return pathname === routes.studio || pathname.startsWith(`${routes.studio}/`);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readPosition(): HistoryPosition {
  return position;
}

function recordPosition(navigationType: NavigationType): void {
  const rawIdx = currentHistoryIdx();
  // The skip link's `#main-content` jump adds a browser entry the router
  // never stamped (no idx). It is the same page, so the position holds.
  const historyIdx = rawIdx >= 0 ? rawIdx : position.historyIdx;
  const isRestart = shouldRestartForwardStack;
  shouldRestartForwardStack = false;
  const furthestIdx =
    isRestart || navigationType === NavigationType.Push
      ? historyIdx
      : Math.max(position.furthestIdx, historyIdx);
  if (
    historyIdx === position.historyIdx &&
    furthestIdx === position.furthestIdx
  ) {
    return;
  }
  position = { historyIdx, furthestIdx };
  for (const listener of listeners) listener();
}

/**
 * In-app Back and Forward that never leave QueerPulse: Back works only when
 * an earlier entry of this tab exists (`canGoBack`, the same guard the app
 * bar and the edge swipe use), so a member who arrived from a shared link is
 * not sent off site. Forward works only after a Back.
 */
export function useStudioHistoryNav() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { key: locationKey } = useLocation();
  const { historyIdx, furthestIdx } = useSyncExternalStore(
    subscribe,
    readPosition,
    readPosition,
  );

  // Every Studio page mounts its own shell, so a move between two pages
  // unmounts one user and mounts the next in the same commit. The restart
  // waits a task and fires only when no user came back and the tab really
  // left Studio, so a page change (even across a lazy chunk's gap) keeps
  // the forward stack and a return to Studio starts it afresh.
  useLayoutEffect(() => {
    mountedUserCount += 1;
    return () => {
      mountedUserCount -= 1;
      if (mountedUserCount > 0) return;
      setTimeout(() => {
        if (mountedUserCount === 0 && !isStudioPath(window.location.pathname)) {
          shouldRestartForwardStack = true;
        }
      }, 0);
    };
  }, []);
  // A layout effect, so the buttons never paint a frame with the previous
  // page's state.
  useLayoutEffect(() => {
    recordPosition(navigationType);
  }, [locationKey, navigationType]);

  const canGoBack = canGoBackFrom(historyIdx);
  const canGoForward = historyIdx >= 0 && historyIdx < furthestIdx;
  const goBack = useCallback(() => {
    if (canGoBack) void navigate(-1);
  }, [canGoBack, navigate]);
  const goForward = useCallback(() => {
    if (canGoForward) void navigate(1);
  }, [canGoForward, navigate]);
  return { canGoBack, canGoForward, goBack, goForward };
}
