import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NavDrawerContext, type NavSheet } from "./navDrawerContext";

/**
 * Stamped on the history entry the drawer pushes for itself, so the entry is
 * identifiable in devtools. Nothing reads it back — the provider tracks
 * ownership with a ref rather than trusting history state, which survives
 * reloads and would otherwise make a stale entry look live.
 */
const DRAWER_HISTORY_STATE = { queerPulseNavDrawerSentinel: true };

/**
 * Holds the mobile nav drawer's open state above both controls that drive it:
 * the Navbar hamburger (browser mode) and the BottomTabBar "More" tab
 * (installed mode). A context rather than the `qp:open-search` custom-event
 * idiom because the More tab must *read* the state for its `aria-expanded`, not
 * only command it — and because BottomTabBar can unmount mid-session when the
 * display mode flips, so the state cannot live inside it.
 *
 * ## Back-gesture handling
 *
 * In installed mode the drawer is a full-screen overlay and Back is the only
 * dismissal gesture a user reaches for, so Back must close the drawer rather
 * than navigate underneath it. Opening therefore pushes one history entry
 * carrying the *current URL* (so nothing visibly navigates), giving Back
 * something to consume; a `popstate` listener — registered only while the
 * drawer is open, so ordinary history navigation is untouched the rest of the
 * time — closes the drawer when it does.
 *
 * Every other dismissal (Escape, overlay click, the More button toggling shut)
 * pops that entry back off, so the drawer never leaves a dead Back press
 * behind. The exception is navigating via one of the drawer's own links: those
 * use `replace`, which overwrites the entry rather than stacking on it, so they
 * call `closeSheetForNavigation` to say "already consumed, do not pop".
 *
 * This deliberately uses the raw History API rather than React Router's
 * `navigate`: NavDrawerProvider sits *above* `<BrowserRouter>` in App.tsx and
 * has no router context. Pushing the current URL leaves React Router's own
 * location untouched, so the two never disagree about where the app is.
 */
export function NavDrawerProvider({ children }: { children: ReactNode }) {
  const [activeSheet, setActiveSheet] = useState<NavSheet | null>(null);
  // A single boolean that stays `true` across a sheet switch (browse↔account),
  // so the history effects below key on "is *any* sheet open" rather than on
  // *which* one. Keying on `activeSheet` would re-fire the push-entry effect on
  // every switch and stack a second dead Back press; keying on this boolean
  // pushes exactly one entry for a run of open sheets.
  const isAnyOpen = activeSheet !== null;
  // True while the drawer owns a pushed history entry that still needs popping
  // if it closes by anything other than a Back gesture. Starts false, so a
  // drawer that is never opened touches history zero times.
  const historyEntryPushedRef = useRef(false);
  const closedByBackGestureRef = useRef(false);

  const openSheet = useCallback((sheet: NavSheet) => setActiveSheet(sheet), []);
  const closeSheet = useCallback(() => setActiveSheet(null), []);
  const closeSheetForNavigation = useCallback(() => {
    // The `replace` navigation overwrote our entry; mark it consumed before the
    // cleanup effect below can pop a second, real entry and undo that
    // navigation. Set explicitly rather than inferred from a URL change, so a
    // link to the page you are already on behaves identically.
    historyEntryPushedRef.current = false;
    setActiveSheet(null);
  }, []);

  // Give the Back gesture something to consume.
  useEffect(() => {
    if (!isAnyOpen || historyEntryPushedRef.current) return;
    historyEntryPushedRef.current = true;
    window.history.pushState(DRAWER_HISTORY_STATE, "");
  }, [isAnyOpen]);

  // ...and close on it, instead of letting the router navigate underneath an
  // unchanged full-screen overlay.
  useEffect(() => {
    if (!isAnyOpen) return;
    const onPopState = () => {
      // The gesture itself consumed the entry — nothing left to clean up.
      historyEntryPushedRef.current = false;
      closedByBackGestureRef.current = true;
      setActiveSheet(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAnyOpen]);

  // Closed by Escape / overlay click / the More button: pop our entry so it is
  // not left behind as a Back press that appears to do nothing.
  useEffect(() => {
    if (isAnyOpen) return;
    if (closedByBackGestureRef.current) {
      closedByBackGestureRef.current = false;
      return;
    }
    if (!historyEntryPushedRef.current) return;
    historyEntryPushedRef.current = false;
    // The popstate listener above is already torn down by this point (React
    // runs every cleanup for an update before any of its effects), so this pop
    // cannot re-enter as another close.
    window.history.back();
  }, [isAnyOpen]);

  const value = useMemo(
    () => ({ activeSheet, openSheet, closeSheet, closeSheetForNavigation }),
    [activeSheet, openSheet, closeSheet, closeSheetForNavigation],
  );

  return (
    <NavDrawerContext.Provider value={value}>
      {children}
    </NavDrawerContext.Provider>
  );
}
