import { useEffect } from "react";
import { matchPath } from "react-router-dom";
import { registeredChunkLoaders } from "./routeHelpers";
import { useAuth } from "./providers/authContext";
import {
  MEMBER_TABS,
  PUBLIC_TABS,
} from "../shared/components/layout/bottomTabs";

/**
 * Warm a destination's route chunk before the click that needs it.
 *
 * Every route in this app is `React.lazy`, so before this existed a click was
 * the first moment the browser learned it needed the destination's JavaScript.
 * The whole content area sat behind the app-wide `<Suspense>` spinner for a
 * network round trip (measured against production: 200-630ms per chunk), and
 * only once the chunk landed did the page mount and *start* fetching its data.
 * The pages already have skeletons; nobody ever saw them, because the skeletons
 * were inside the chunk still in flight.
 *
 * Hovering, focusing or touching a link is a reliable signal that a click is
 * coming, and it arrives early enough (a few hundred ms on pointer devices) to
 * cover the fetch. By the time the click lands the module is in the bundler's
 * registry, `import()` resolves without touching the network, and the page's own
 * frame paints straight away with its data loading in place.
 */

/**
 * Pathnames already handed to a loader. Misses are recorded too, so a slow drag
 * across a nav column full of unregistered links re-scans the pattern table once
 * per destination rather than once per `pointerover`.
 */
const attempted = new Set<string>();

interface SaveDataConnection {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Never spend someone's data on a page they have not asked for. Prefetching is
 * a bet that a hover becomes a click; on Data Saver or a 2g-class connection the
 * bet is a bad one, and the losing case (bytes burned on a page never opened) is
 * exactly the case those settings exist to prevent.
 */
function isSpeculationUnwelcome(): boolean {
  const connection = (
    navigator as Navigator & { connection?: SaveDataConnection }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return (
    connection.effectiveType === "2g" || connection.effectiveType === "slow-2g"
  );
}

/**
 * Start loading the chunk that serves `pathname`, at most once per pathname.
 *
 * Matching goes through react-router's own `matchPath`, so a registered pattern
 * claims exactly the pathnames the router would give it — `/members/:slug` takes
 * `/members/ana` and never `/members`.
 *
 * Module-private: the only caller is the component below. Exporting it beside a
 * component would also cost this file its Fast Refresh boundary in dev.
 */
function prefetchRoute(pathname: string): void {
  if (attempted.has(pathname)) return;
  if (isSpeculationUnwelcome()) return;
  attempted.add(pathname);

  for (const [pattern, load] of registeredChunkLoaders()) {
    if (!matchPath(pattern, pathname)) continue;
    // Speculative by definition: a failure here means the click will simply pay
    // for the fetch the way it always did, so it must stay silent.
    void load().catch(() => {});
    return;
  }
}

/** The `<a>` this event happened inside, if it points somewhere we can prefetch. */
function navigableAnchor(event: Event): HTMLAnchorElement | null {
  const { target } = event;
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  // A download or a new-tab link does not navigate this document, so its chunk
  // is not the one about to be needed.
  if (anchor.hasAttribute("download")) return null;
  if (anchor.target !== "" && anchor.target !== "_self") return null;
  return anchor;
}

/**
 * One delegated listener set for the whole app, rather than a prop on every
 * link. There are hundreds of `<Link>` call sites across ~140 pages; a wrapper
 * component would have to reach all of them and would still miss the next one
 * somebody writes. Listening at the document catches every link that exists now
 * or later, including links rendered inside portals and third-party markup.
 *
 * Capture phase, because a handler along the way may stop propagation
 * (dropdowns and cards do this a fair amount) and a prefetch must not depend on
 * an unrelated component's event bookkeeping.
 */
export function RoutePrefetcher(): null {
  // The same signal BottomTabBar uses to pick which tab set it installs, so the
  // idle warm below only ever spends bytes on destinations this visitor can
  // actually see in their own chrome.
  const { loggedIn } = useAuth();

  useEffect(() => {
    const onIntent = (event: Event) => {
      const anchor = navigableAnchor(event);
      if (!anchor) return;
      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;
      prefetchRoute(destination.pathname);
    };

    // `pointerover` covers mouse and stylus; `focusin` covers keyboard tabbing;
    // `touchstart` is the only early signal a touch device gives (the ~100ms
    // before the finger lifts), and stays passive so it can never delay a scroll.
    const options: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerover", onIntent, options);
    document.addEventListener("focusin", onIntent, options);
    document.addEventListener("touchstart", onIntent, options);

    // The installed tab bar's destinations are the ones nearly every session
    // visits, and on touch there is no hover to trigger the fetch. Warm them
    // once the browser is otherwise idle, so the first tab press is instant too.
    //
    // The two sets are the bar's own, so this warms exactly what this visitor's
    // chrome offers and nothing else. That matters most signed out: `PUBLIC_TABS`
    // is derived from `authGate`'s `isGatedLink` (see `bottomTabs.ts`), so a
    // logged-out session can no longer spend bytes on a member-only chunk it
    // would never be allowed to open. Read the set here rather than re-listing
    // the public paths, or this becomes the next copy to drift.
    //
    // `requestIdleCallback` is absent on Safari <16.4; there the tabs simply keep
    // the old behaviour rather than competing with the app's own boot work.
    const warmTabs = () => {
      for (const tab of loggedIn ? MEMBER_TABS : PUBLIC_TABS) {
        prefetchRoute(tab.href);
      }
    };
    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const idleHandle = hasIdleCallback
      ? window.requestIdleCallback(warmTabs, { timeout: 4000 })
      : undefined;

    return () => {
      document.removeEventListener("pointerover", onIntent, options);
      document.removeEventListener("focusin", onIntent, options);
      document.removeEventListener("touchstart", onIntent, options);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
    };
    // Re-runs once when the session resolves, which is what swaps the warm set
    // from the public tabs to the member ones on sign-in. `prefetchRoute` is
    // idempotent per pathname, so the re-listen costs nothing already spent.
  }, [loggedIn]);

  return null;
}
