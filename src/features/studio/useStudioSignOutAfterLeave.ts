import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";

/**
 * Sign out asks first, then signs out. The menu's Sign out row only marks
 * the request and navigates home; a page with a leave guard (uploads
 * running, details unsaved) holds that navigation and asks. The session
 * ends only once the tab has actually arrived home, so a member who picks
 * "Keep" stays on the page still signed in and their uploads keep going.
 * Any other arrival drops the request.
 */
let isSignOutPending = false;

/** Called by the Sign out row's click, before its navigation runs. */
export function requestStudioSignOut(): void {
  isSignOutPending = true;
}

function isHome(pathname: string): boolean {
  return pathname === routes.homepage;
}

/**
 * Mounted by StudioAccountMenu, which outlives the menu's panel. Home is
 * outside Studio, so the arrival usually unmounts the shell: the cleanup
 * reads the live URL and signs out there.
 */
export function useStudioSignOutAfterLeave(): void {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => {
    if (isSignOutPending && !isHome(pathname)) isSignOutPending = false;
    return () => {
      if (!isSignOutPending || !isHome(window.location.pathname)) return;
      isSignOutPending = false;
      signOut();
    };
  }, [pathname, signOut]);
}
