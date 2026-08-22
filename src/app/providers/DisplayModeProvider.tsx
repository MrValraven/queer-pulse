import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DisplayModeContext } from "./displayModeContext";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { safeStorage } from "../../shared/storage/safeStorage";

const INSTALLED_KEY = "qp-installed";

/**
 * `fullscreen` counts as installed; `minimal-ui` deliberately does not — it
 * still renders browser chrome, so a bottom tab bar there would stack against
 * the browser's own toolbar, which is the cramped look we're avoiding.
 */
const STANDALONE_QUERY =
  "(display-mode: standalone), (display-mode: fullscreen)";

/** A positive "we are in a browser tab" signal, distinct from "query unsupported". */
const BROWSER_QUERY = "(display-mode: browser)";

/** iOS Safari's non-standard home-screen flag. Fixed for the session. */
function readIosStandalone(): boolean {
  if (typeof navigator === "undefined") return false;
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return iosNavigator.standalone === true;
}

/**
 * Sticky fallback for engines where neither signal above is reliable. The
 * manifest's `start_url` is `/?mode=standalone`, so a launch from the home
 * screen latches the flag; ordinary tab visits never carry the param.
 */
function readStickyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const launchedFromManifest =
    new URLSearchParams(window.location.search).get("mode") === "standalone";
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

  const isInstalled =
    matchesStandaloneQuery || iosStandalone || stickyInstalled;

  useEffect(() => {
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
