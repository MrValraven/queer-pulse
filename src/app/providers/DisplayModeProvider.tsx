import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DisplayModeContext } from "./displayModeContext";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { safeStorage } from "../../shared/storage/safeStorage";
import { isStandaloneLaunch } from "./standaloneLaunch";

const INSTALLED_KEY = "qp-installed";

/**
 * `fullscreen` counts as installed; `minimal-ui` deliberately does not — it
 * still renders browser chrome, so a bottom tab bar there would stack against
 * the browser's own toolbar, which is the cramped look we're avoiding.
 * An element shown full screen (a film preview, the render studio) also
 * matches `fullscreen`, so the provider holds its earlier answer until it ends.
 */
const STANDALONE_QUERY =
  "(display-mode: standalone), (display-mode: fullscreen)";

/** A positive "we are in a browser tab" signal, distinct from "query unsupported". */
const BROWSER_QUERY = "(display-mode: browser)";

function subscribeToFullscreen(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function readIsElementFullscreen(): boolean {
  return document.fullscreenElement != null;
}

/** iOS Safari's non-standard home-screen flag. Fixed for the session. */
function readIosStandalone(): boolean {
  if (typeof navigator === "undefined") return false;
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return iosNavigator.standalone === true;
}

/**
 * Sticky fallback for engines where neither signal above is reliable. The
 * manifest's `start_url` is `/?mode=standalone` (see standaloneLaunch.ts), so
 * a launch from the home screen latches the flag; ordinary tab visits never
 * carry the param.
 */
function readStickyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const launchedFromManifest = isStandaloneLaunch(window.location.search);
  if (launchedFromManifest) {
    safeStorage.set(INSTALLED_KEY, "true");
    return true;
  }
  // Guarded: this runs in a render-phase state initializer inside
  // `RootProviders`, which wraps the app ErrorBoundary, so a raw
  // `localStorage` access throwing `SecurityError` (site data blocked) would
  // white-screen the whole app before anything could catch it.
  return safeStorage.get(INSTALLED_KEY) === "true";
}

/**
 * Detects whether QueerPulse is running as an installed app and reflects it onto
 * <html> as `data-display-mode`, mirroring NavModeProvider's `data-nav-mode`, so
 * global CSS (src/styles/standalone.css) can restyle the shell without every
 * component threading the flag down.
 *
 * Three signals are ORed because none covers every platform alone: the media
 * query handles Android/Chrome, desktop and modern iOS; `navigator.standalone`
 * handles iOS home-screen launches; the sticky flag is the belt-and-braces
 * fallback.
 */
export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const matchesStandaloneQuery = useMediaQuery(STANDALONE_QUERY);
  const matchesBrowserQuery = useMediaQuery(BROWSER_QUERY);
  // Read once: install mode cannot change mid-session on iOS, and the property
  // is not observable.
  const [iosStandalone] = useState(readIosStandalone);
  const [stickyInstalled, setStickyInstalled] = useState(readStickyInstalled);

  // Clear the sticky flag ONLY on a positive browser signal. Clearing whenever
  // the other two report false would defeat the fallback's whole purpose: on the
  // engines it exists for, they always report false.
  useEffect(() => {
    if (!matchesBrowserQuery) return;
    safeStorage.remove(INSTALLED_KEY);
    // Reacts to the external browser media-query signal, clearing the fallback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStickyInstalled(false);
  }, [matchesBrowserQuery]);

  const isInstalledBySignals =
    matchesStandaloneQuery || iosStandalone || stickyInstalled;

  // While an element is full screen (requestFullscreen), the display-mode
  // queries describe that element's presentation while the way the app was
  // launched stays the same. Hold the answer from before it went full screen
  // until it leaves. Read through useSyncExternalStore so a query change and
  // the full-screen element land in the same render, whichever event fires
  // first.
  const isElementFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    readIsElementFullscreen,
    () => false,
  );
  const [wasInstalledOutsideFullscreen, setWasInstalledOutsideFullscreen] =
    useState(isInstalledBySignals);
  if (
    !isElementFullscreen &&
    wasInstalledOutsideFullscreen !== isInstalledBySignals
  )
    setWasInstalledOutsideFullscreen(isInstalledBySignals);

  const isInstalled = isElementFullscreen
    ? wasInstalledOutsideFullscreen
    : isInstalledBySignals;

  // `useLayoutEffect`, not `useEffect`: index.html's installed-app boot cover
  // hides #root for as long as this attribute is missing, and an ordinary
  // effect lets the browser paint a frame first — so the installed app gets at
  // least one painted frame with the whole app hidden. On a phone that frame is
  // enough to leave the first screenful with no paint record (correct layout,
  // nothing drawn, fixed only by scrolling). Stamping during the commit means
  // no painted frame ever has the cover up.
  useLayoutEffect(() => {
    document.documentElement.dataset.displayMode = isInstalled
      ? "standalone"
      : "browser";
  }, [isInstalled]);

  const value = useMemo(
    () => ({
      displayMode: isInstalled ? ("standalone" as const) : ("browser" as const),
      isInstalled,
    }),
    [isInstalled],
  );

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
}
