import { lazy, Suspense, useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { safeStorage } from "../../storage/safeStorage";

const VIEWPORT_DEBUG_STORAGE_KEY = "qp-viewport-debug";
const VIEWPORT_DEBUG_PARAM = "viewport-debug";

/** Stands in when the readout chunk fails to load, so a dropped connection
 *  leaves the app as it was and the app ErrorBoundary stays out of it. */
function ReadoutChunkUnavailable(_props: { onClose: () => void }) {
  return null;
}

// Lazy so the readout and its measuring code ship in their own chunk, fetched
// only on a device where the flag is on.
const ViewportDebugReadout = lazy(() =>
  import("./ViewportDebugReadout")
    .then((module) => ({ default: module.ViewportDebugReadout }))
    .catch(() => ({ default: ReadoutChunkUnavailable })),
);

// The flag is a tiny external store: localStorage is the persisted copy and
// `cachedFlag` keeps the answer in memory, so the readout still turns on for
// this session when storage is blocked. safeStorage wraps every access in
// try/catch.
const flagListeners = new Set<() => void>();
let cachedFlag: boolean | null = null;

function getFlagSnapshot(): boolean {
  if (cachedFlag === null) {
    cachedFlag = safeStorage.get(VIEWPORT_DEBUG_STORAGE_KEY) === "1";
  }
  return cachedFlag;
}

function getServerFlagSnapshot(): boolean {
  return false;
}

function subscribeToFlag(listener: () => void): () => void {
  flagListeners.add(listener);
  return () => {
    flagListeners.delete(listener);
  };
}

function writeFlag(isEnabled: boolean) {
  if (isEnabled) {
    safeStorage.set(VIEWPORT_DEBUG_STORAGE_KEY, "1");
  } else {
    safeStorage.remove(VIEWPORT_DEBUG_STORAGE_KEY);
  }
  cachedFlag = isEnabled;
  for (const listener of flagListeners) listener();
}

function closeReadout() {
  writeFlag(false);
}

/**
 * Mounts the hidden viewport readout on a device where it was turned on.
 * Visiting any route with `?viewport-debug=1` turns it on and keeps it on
 * across navigation and reloads; `?viewport-debug=0` or the panel's close
 * button turns it off. Reads the param through the router so an in-app
 * navigation to such a link (a same-site link tapped in a chat) counts too.
 */
export function ViewportDebugGate() {
  const location = useLocation();
  const paramValue = new URLSearchParams(location.search).get(
    VIEWPORT_DEBUG_PARAM,
  );
  const isEnabled = useSyncExternalStore(
    subscribeToFlag,
    getFlagSnapshot,
    getServerFlagSnapshot,
  );

  // `location.key` re-runs this for a repeat visit to the same URL, so tapping
  // the link again after closing the panel reopens it.
  useEffect(() => {
    if (paramValue === "1") writeFlag(true);
    else if (paramValue === "0") writeFlag(false);
  }, [paramValue, location.key]);

  if (!isEnabled) return null;
  return (
    <Suspense fallback={null}>
      <ViewportDebugReadout onClose={closeReadout} />
    </Suspense>
  );
}
