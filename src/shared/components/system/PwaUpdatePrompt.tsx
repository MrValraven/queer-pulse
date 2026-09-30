import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { routes } from "../../../app/routeMap";
import { useConsent } from "../../../app/providers/useConsent";
import { PwaUpdateCard } from "./PwaUpdateCard";
import { useNextBuildVersion } from "./useNextBuildVersion";

/**
 * How long an open session may go without asking the server whether a newer
 * build shipped.
 *
 * Browsers only re-fetch the service-worker script on a navigation, and they
 * cap that at once every 24 hours. An installed PWA that is never cold-started
 * (opened Monday, still open Wednesday) therefore keeps running an old build,
 * and its lazy route chunks are the ones a deploy stops serving: the member
 * gets `reloadForStaleChunk`'s hard reload mid-tap instead of the polite card
 * the "prompt" strategy exists for.
 *
 * One hour is the balance: a deploy reaches long-lived sessions within the same
 * working hour, and 24 extra conditional requests a day per open tab is
 * nothing next to the app's normal traffic. Shorter buys no real freshness,
 * since the card still waits on the member to accept.
 */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and, when a new build is waiting, offers a
 * reload rather than taking one. The worker is registered with
 * `registerType: "prompt"` (vite.config.ts) precisely so the swap happens on
 * the user's say-so: auto-claiming mid-session can leave the running page
 * importing lazy chunks the new build no longer ships.
 *
 * The UI is a PERSISTENT card (PwaUpdateCard) rather than a transient toast: a
 * service-worker update asks for a decision, and a 30-second toast that a user
 * happens not to see means they run a stale build until their next cold start.
 * The card stays until the user reloads or dismisses it (dismissal is honoured
 * until the next new build is detected).
 */
export function PwaUpdatePrompt() {
  const [swRegistration, setSwRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >(undefined);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // useRegisterSW registers exactly once (it holds the result in useState),
    // so this callback fires a single time with the live registration.
    onRegisteredSW: (_swScriptUrl, registration) =>
      setSwRegistration(registration),
  });
  // Dismissal hides the card for the rest of this session; a cold start (or the
  // next genuinely new build after a reload) surfaces it again.
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);
  // The consent banner is also a fixed bottom decision, and on a phone it fills
  // most of the screen. Showing both covered the banner's Reject button, so the
  // card waits its turn until the visitor has chosen.
  const { status: consentStatus } = useConsent();
  // Fetched as soon as a build is waiting, so the version is usually in hand by
  // the time consent lets the card show.
  const nextVersion = useNextBuildVersion(needRefresh);
  const lastCheckedAtRef = useRef(0);

  useEffect(() => {
    if (!swRegistration) return;
    // Registration itself was a fetch of the worker script, so the clock starts
    // here: a check a second later would ask the server what it just answered.
    lastCheckedAtRef.current = Date.now();

    const checkForUpdate = () => {
      // A hidden tab has nobody to show the card to, and a check with no
      // network is a guaranteed failure. Both just wait for the next chance.
      if (document.visibilityState !== "visible") return;
      if (!navigator.onLine) return;
      if (Date.now() - lastCheckedAtRef.current < UPDATE_CHECK_INTERVAL_MS) {
        return;
      }
      lastCheckedAtRef.current = Date.now();
      swRegistration.update().catch(() => {
        // A flaky network, a 5xx from the CDN, or a worker that unregistered
        // itself. There is nothing to tell the member and nothing to retry
        // early: the next tick asks again.
      });
    };

    const intervalId = window.setInterval(
      checkForUpdate,
      UPDATE_CHECK_INTERVAL_MS,
    );
    // A backgrounded tab skips its ticks (and mobile engines freeze the timer
    // outright), so a session can come back hours stale. Re-check on return;
    // the elapsed-time guard above keeps ordinary tab-switching free.
    document.addEventListener("visibilitychange", checkForUpdate);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, [swRegistration]);

  if (!needRefresh || dismissed || consentStatus === "unknown") return null;

  const applyUpdate = () => {
    setUpdating(true);
    // Activating the waiting worker fires `controlling`, and the plugin answers
    // with a plain `location.reload()` of whatever URL is current.
    void updateServiceWorker(true);
  };

  return (
    <PwaUpdateCard
      updating={updating}
      nextVersion={nextVersion}
      onReload={applyUpdate}
      onShowChanges={() => {
        // Point the URL at the Changelog first, so that reload lands there on
        // the NEW build. Navigating in-app instead would render this old
        // build's Changelog, which cannot list what just shipped. pushState
        // (over replaceState) keeps Back returning to the page they were on,
        // and React Router ignores it, so nothing re-renders in between.
        window.history.pushState(null, "", routes.changelog);
        applyUpdate();
      }}
      onDismiss={() => setDismissed(true)}
    />
  );
}
