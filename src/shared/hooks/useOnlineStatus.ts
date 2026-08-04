import { useSyncExternalStore } from "react";

/**
 * Subscribe to the browser's connectivity state via the `online`/`offline`
 * events. Returns `true` when the device believes it has a network connection.
 *
 * `navigator.onLine` is a coarse signal (it can be `true` on a captive/dead
 * network), so treat it as "definitely offline when false", not "definitely
 * usable when true" — callers that need certainty should still let a real
 * request fail. It's exactly the right signal for the offline *fallback* UI:
 * `false` reliably means no requests will land.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

// Server / prerender: assume online so the offline UI never renders into the
// static HTML that social scrapers and the prerender step consume.
function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
