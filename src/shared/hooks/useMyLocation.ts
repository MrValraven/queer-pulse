import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Where the member is, asked for once and kept in memory only.
 *
 * The privacy contract this hook exists to hold, in full:
 *
 * - the position lives in React state and nowhere else. It is never written to
 *   `localStorage`, never put in the URL, never attached to a request, and
 *   never logged. Closing the tab forgets it.
 * - nothing is measured about the member because they used it. No analytics, no
 *   telemetry, no counters.
 * - it is asked for once per press (`getCurrentPosition`), never watched.
 *   `watchPosition` would keep a live fix running in the background, which is
 *   both a battery cost and a standing claim on somebody's whereabouts that a
 *   "sort this list by distance" feature has no business making.
 * - a refusal is never retried on its own. Nothing in here re-asks from an
 *   effect, a timer or a re-render: only a deliberate press calls `request()`
 *   again, and a browser that has the site blocked answers that instantly and
 *   silently. That is what keeps a denial a calm state rather than a loop.
 *
 * Everything the position is FOR happens on the device: haversine distances
 * over coordinates the page already fetched.
 */

export type MyLocationStatus =
  /** Never asked. The control is offering, nothing has happened yet. */
  | "idle"
  /** The browser's permission prompt is up, or the fix is being taken. */
  | "asking"
  /** A position is in `coordinates`. */
  | "granted"
  /** The member said no, or the browser has the site blocked. */
  | "denied"
  /** No position available at all (no sensor, or the device could not fix). */
  | "unavailable"
  /** The fix took too long. Worth offering another try. */
  | "timeout"
  /** Not a secure context, so the API is unavailable whatever the member wants. */
  | "insecure";

export interface MyLocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MyLocation {
  status: MyLocationStatus;
  /** The last fix, or `null` whenever there isn't one. Memory only. */
  coordinates: MyLocationCoordinates | null;
  /** True when the browser can be asked at all, so the control can stay hidden
   *  rather than offering something that cannot work. */
  isSupported: boolean;
  /** Ask for a position. A no-op while one ask is already in flight. */
  request: () => void;
  /** Forget the position and go back to `idle`. This is the "turn it off"
   *  path: the list returns to the ordering it had before. */
  clear: () => void;
}

/** Long enough for a cold GPS fix on a phone, short enough to fail visibly. */
const FIX_TIMEOUT_MS = 10_000;
/** A fix from the last two minutes is plenty for "what is near me". */
const FIX_MAX_AGE_MS = 120_000;

/** Whether this browser can be asked for a position at all. Split out so the
 *  answer is the same for the initial status and for `isSupported`. */
function readSupport(): {
  isSupported: boolean;
  blockedStatus: MyLocationStatus | null;
} {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return { isSupported: false, blockedStatus: "unavailable" };
  }
  // Browsers refuse geolocation outside a secure context, so say that plainly
  // instead of letting the member press a control that can only ever fail.
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return { isSupported: false, blockedStatus: "insecure" };
  }
  return { isSupported: true, blockedStatus: null };
}

export function useMyLocation(): MyLocation {
  const [support] = useState(readSupport);
  const [status, setStatus] = useState<MyLocationStatus>(
    support.blockedStatus ?? "idle",
  );
  const [coordinates, setCoordinates] = useState<MyLocationCoordinates | null>(
    null,
  );
  // The browser resolves `getCurrentPosition` whenever it likes, including
  // after this component has gone. Nothing may be set after unmount.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const request = useCallback(() => {
    if (!support.isSupported) return;
    // One ask at a time. Guarded here in the handler rather than inside a
    // state updater, so the prompt is raised exactly once per press even under
    // React's double-invoked updaters.
    if (status === "asking") return;
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        if (!isMountedRef.current) return;
        setCoordinates(null);
        if (error.code === error.PERMISSION_DENIED) setStatus("denied");
        else if (error.code === error.TIMEOUT) setStatus("timeout");
        else setStatus("unavailable");
      },
      {
        enableHighAccuracy: false,
        timeout: FIX_TIMEOUT_MS,
        maximumAge: FIX_MAX_AGE_MS,
      },
    );
  }, [support.isSupported, status]);

  const clear = useCallback(() => {
    setCoordinates(null);
    setStatus(support.blockedStatus ?? "idle");
  }, [support.blockedStatus]);

  return {
    status,
    coordinates,
    isSupported: support.isSupported,
    request,
    clear,
  };
}
