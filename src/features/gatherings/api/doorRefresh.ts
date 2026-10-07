import type { QueryClient } from "@tanstack/react-query";
import { DOOR_LINGER_MS } from "../checkin/checkinLinger";
import { eventKeys } from "./eventKeys";

/** Key segment after `eventKeys.attendees(slug, demoMode)` that marks a door
 *  group query (see `attendeePagesRoot`). */
export const DOOR_PAGES_SEGMENT = "pages";

/** First element of every check-in and undo mutation key. */
export const CHECK_IN_MUTATION_ROOT = "check-in";

/** Shared by check-in and undo, so a delayed refresh can see whether
 *  another door tap on this gathering is still in flight. */
export const checkInMutationKey = (slug: string) =>
  [CHECK_IN_MUTATION_ROOT, slug] as const;

/** One pending refresh per gathering. A request made while one is pending
 *  folds into it, so a burst of frames plus this device's own settle cause a
 *  single refetch of each query. */
const pendingDoorRefreshes = new Map<string, number>();

/**
 * The one way a door's cached roster and groups are refreshed from the
 * server: the socket handler (another device, or this one hearing its own
 * frame), the settle of this device's own check-in or undo, and the
 * reconnect all call it.
 *
 * Waits DOOR_LINGER_MS so a row this device just moved is not yanked. When a
 * check-in or undo for the slug is still in flight at that moment, a refetch
 * could land before that write and wipe its optimistic stamp, so the timer
 * re-arms for another DOOR_LINGER_MS. A hanging request therefore costs one
 * cheap check per DOOR_LINGER_MS and never a tight loop, and once the
 * mutation settles (its own settle also calls this) exactly one refresh runs.
 * The roster key prefixes every door group's key, so one invalidation covers
 * the arrival meter and both lists; queries nobody is watching are only
 * marked stale.
 */
export function scheduleDoorRefresh(
  queryClient: QueryClient,
  slug: string,
): void {
  if (pendingDoorRefreshes.has(slug)) return;
  const timerId = window.setTimeout(() => {
    pendingDoorRefreshes.delete(slug);
    if (queryClient.isMutating({ mutationKey: checkInMutationKey(slug) }) > 0) {
      scheduleDoorRefresh(queryClient, slug);
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: eventKeys.attendees(slug, false),
    });
  }, DOOR_LINGER_MS);
  pendingDoorRefreshes.set(slug, timerId);
}

/**
 * After a socket gap a door device may have missed frames. Refreshes every
 * gathering that has a cached door group query (the host's check-in tab
 * created it), each through the scheduler so a slug with a tap in flight
 * waits for it. Member-facing guest-list queries have no `"pages"` entry and
 * are left alone.
 */
export function refreshDoorsAfterReconnect(queryClient: QueryClient): void {
  const doorSlugs = new Set<string>();
  for (const query of queryClient.getQueryCache().findAll({
    queryKey: eventKeys.attendeesRoot,
  })) {
    const [, slug, isDemo, segment] = query.queryKey;
    if (isDemo === false && segment === DOOR_PAGES_SEGMENT) {
      if (typeof slug === "string") doorSlugs.add(slug);
    }
  }
  for (const slug of doorSlugs) scheduleDoorRefresh(queryClient, slug);
}
