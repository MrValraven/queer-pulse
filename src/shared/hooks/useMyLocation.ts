import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

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
 * - reading the permission SETTING is not asking. `navigator.permissions`
 *   answers "granted", "denied" or "prompt" and never a position, so the hook
 *   reads it to keep the on-screen state true (see `usePermissionWatch`).
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
  /** True when the browser has the `<geolocation>` element. Its press is the
   *  one thing that can re-open the permission prompt after the site was
   *  blocked, so a denied state can offer it in place of a dead button. */
  hasInPageRecovery: boolean;
  /** Ask for a position. A no-op while one ask is already in flight. */
  request: () => void;
  /** Forget the position and go back to `idle`. This is the "turn it off"
   *  path: the list returns to the ordering it had before. */
  clear: () => void;
  /** Hand over a position that arrived another way (the `<geolocation>`
   *  element). Handled exactly like a fix from `request()`. */
  receivePosition: (position: GeolocationPosition) => void;
  /** The failing half of `receivePosition`. */
  receivePositionError: (error: GeolocationPositionError) => void;
}

/** Long enough for a cold GPS fix on a phone, short enough to fail visibly. */
const FIX_TIMEOUT_MS = 10_000;
/** A fix from the last two minutes is plenty for "what is near me". */
const FIX_MAX_AGE_MS = 120_000;

/** Whether this browser can be asked for a position at all. Split out so the
 *  answer is the same for the initial status and for `isSupported`. */
function readSupport(): {
  isSupported: boolean;
  hasInPageRecovery: boolean;
  blockedStatus: MyLocationStatus | null;
} {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return {
      isSupported: false,
      hasInPageRecovery: false,
      blockedStatus: "unavailable",
    };
  }
  // Browsers refuse geolocation outside a secure context, so say that plainly
  // instead of letting the member press a control that can only ever fail.
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return {
      isSupported: false,
      hasInPageRecovery: false,
      blockedStatus: "insecure",
    };
  }
  return {
    isSupported: true,
    hasInPageRecovery:
      typeof window !== "undefined" && "HTMLGeolocationElement" in window,
    blockedStatus: null,
  };
}

/**
 * Keeps `status` honest about the browser's own permission setting, without
 * ever asking for a position.
 *
 * A site that is already blocked says so before anyone presses anything, and a
 * member who allows it again in their browser settings finds the control ready
 * the moment they come back, with nothing requested on their behalf.
 *
 * Only a real TRANSITION moves `status`. The same PERMISSION_DENIED error also
 * comes from the operating system blocking the whole browser while the site
 * setting still reads "granted". Re-reading that unchanged "granted" must not
 * wipe the explanation off the screen, so a repeated state is ignored.
 */
function usePermissionWatch(
  isSupported: boolean,
  setStatus: Dispatch<SetStateAction<MyLocationStatus>>,
  setCoordinates: Dispatch<SetStateAction<MyLocationCoordinates | null>>,
) {
  useEffect(() => {
    if (!isSupported || !("permissions" in navigator)) return;
    let isCancelled = false;
    let lastKnownState: PermissionState | null = null;
    let permissionStatus: PermissionStatus | null = null;

    const applyPermissionState = (state: PermissionState) => {
      const previousState = lastKnownState;
      lastKnownState = state;
      if (state === previousState) return;
      if (state === "denied" && previousState === null) {
        // First read of a site that is already blocked. Never over a state
        // something else has already set.
        setStatus((current) => (current === "idle" ? "denied" : current));
      } else if (state === "denied") {
        // Blocked mid-visit: the member withdrew it, so a position held from
        // before goes with it.
        setCoordinates(null);
        setStatus("denied");
      } else if (previousState === "denied") {
        // Allowed again. Back to offering, and the press stays theirs.
        setStatus((current) => (current === "denied" ? "idle" : current));
      }
    };
    const handleChange = () => {
      if (permissionStatus) applyPermissionState(permissionStatus.state);
    };
    const readPermissionState = () => {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (isCancelled) return;
          applyPermissionState(result.state);
          if (permissionStatus) return;
          permissionStatus = result;
          permissionStatus.addEventListener("change", handleChange);
        })
        .catch(() => {
          // A browser that cannot report the setting leaves `status` to the
          // press, exactly as before this watch existed.
        });
    };
    // Safari does not reliably fire `change`, so the setting is read again
    // whenever the page comes back into use, which is exactly the moment
    // somebody returns from their settings.
    const handleReturn = () => {
      if (document.visibilityState === "visible") readPermissionState();
    };

    readPermissionState();
    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);
    return () => {
      isCancelled = true;
      permissionStatus?.removeEventListener("change", handleChange);
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, [isSupported, setStatus, setCoordinates]);
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

  usePermissionWatch(support.isSupported, setStatus, setCoordinates);

  const receivePosition = useCallback((position: GeolocationPosition) => {
    if (!isMountedRef.current) return;
    setCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    setStatus("granted");
  }, []);

  const receivePositionError = useCallback(
    (error: GeolocationPositionError) => {
      if (!isMountedRef.current) return;
      setCoordinates(null);
      if (error.code === error.PERMISSION_DENIED) setStatus("denied");
      else if (error.code === error.TIMEOUT) setStatus("timeout");
      else setStatus("unavailable");
    },
    [],
  );

  const request = useCallback(() => {
    if (!support.isSupported) return;
    // One ask at a time. Guarded here in the handler rather than inside a
    // state updater, so the prompt is raised exactly once per press even under
    // React's double-invoked updaters.
    if (status === "asking") return;
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      receivePosition,
      receivePositionError,
      {
        enableHighAccuracy: false,
        timeout: FIX_TIMEOUT_MS,
        maximumAge: FIX_MAX_AGE_MS,
      },
    );
  }, [support.isSupported, status, receivePosition, receivePositionError]);

  const clear = useCallback(() => {
    setCoordinates(null);
    setStatus(support.blockedStatus ?? "idle");
  }, [support.blockedStatus]);

  return {
    status,
    coordinates,
    isSupported: support.isSupported,
    hasInPageRecovery: support.hasInPageRecovery,
    request,
    clear,
    receivePosition,
    receivePositionError,
  };
}
