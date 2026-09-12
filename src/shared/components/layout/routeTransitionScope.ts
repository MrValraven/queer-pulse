import { createContext, useContext } from "react";
import type { Location } from "react-router-dom";

/**
 * What `RouteTransition` tells the routed tree about the plane it is on.
 *
 * `location` is the route this plane was rendered FOR, frozen. AnimatePresence
 * keeps the outgoing plane mounted while it fades, and that plane's `AppRoutes`
 * still subscribes to the router, so without this it re-renders as the NEW
 * route inside the dying plane: two copies of the new page, twice the queries,
 * and (the real damage) motion components mounting inside a plane that is
 * already exiting, which framer can never complete, so the plane is never
 * removed. See RouteTransition.tsx.
 *
 * `isPresent` is false while the plane is that outgoing ghost. A redirect
 * rendered there would navigate the LIVE app a second time.
 */
export interface RouteTransitionScope {
  location: Location;
  isPresent: boolean;
}

export const RouteTransitionScopeContext =
  createContext<RouteTransitionScope | null>(null);

/** Null outside a RouteTransition (tests, the prerender pass). */
export function useRouteTransitionScope(): RouteTransitionScope | null {
  return useContext(RouteTransitionScopeContext);
}
