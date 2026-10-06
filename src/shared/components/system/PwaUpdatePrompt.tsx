import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { routes } from "../../../app/routeMap";
import { useConsent } from "../../../app/providers/useConsent";
import { PwaUpdateCard, type UpdatePhase } from "./PwaUpdateCard";
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
 * How long Reload waits for the new worker to take over before reloading
 * anyway.
 *
 * Activation is usually quick, but the browser holds it until the old worker
 * finishes its in-flight fetches, so a few seconds is normal and the progress
 * line covers that. Fifteen seconds is well past any healthy activation. If
 * the old worker is somehow still in charge by then, the reload lands on the
 * old build and the card offers the update again, which is far better than a
 * card that says "Updating…" forever.
 */
const UPDATE_RELOAD_TIMEOUT_MS = 15_000;

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
  const [phase, setPhase] = useState<UpdatePhase>("idle");
  // Several signals can each announce the takeover (the worker's own state,
  // the page's controller swap, the safety timeout). The first one reloads and
  // this ref makes the rest no-ops.
  const hasReloadedRef = useRef(false);
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
    setPhase("activating");

    const reloadOnce = () => {
      if (hasReloadedRef.current) return;
      hasReloadedRef.current = true;
      setPhase("reloading");
      window.location.reload();
    };

    // No waiting worker means there is nothing left to activate (another tab
    // may already have applied it), so a reload alone lands on the new build.
    const waitingWorker = swRegistration?.waiting;
    if (!waitingWorker) {
      reloadOnce();
      return;
    }

    // We own the reload because the plugin's own one is unreliable. It only
    // reloads from workbox-window's `controlling` event when `isUpdate` is
    // true, and workbox-window fixes that flag once, at register time, from
    // whether the page already had a controller. A tab that started
    // uncontrolled (a hard reload, or the first visit) never qualifies, and
    // since sw.ts does not call clients.claim() the new worker never takes
    // that tab over either, so the card would sit on "Updating…" forever.
    // "redundant" means a newer worker replaced this one; a reload picks up
    // whichever build is current.
    const fallbackTimeoutId = window.setTimeout(
      reloadOnce,
      UPDATE_RELOAD_TIMEOUT_MS,
    );
    const reloadOnTakeover = () => {
      window.clearTimeout(fallbackTimeoutId);
      reloadOnce();
    };
    waitingWorker.addEventListener("statechange", () => {
      if (
        waitingWorker.state === "activated" ||
        waitingWorker.state === "redundant"
      ) {
        reloadOnTakeover();
      }
    });
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      reloadOnTakeover,
      { once: true },
    );

    // Posts SKIP_WAITING to the waiting worker. On a tab that was controlled
    // at load the plugin reloads too; the ref above keeps ours to one, and a
    // second reload from the plugin is harmless. These listeners need no
    // cleanup: this page's life ends in the reload they trigger.
    void updateServiceWorker(true);
  };

  return (
    <PwaUpdateCard
      phase={phase}
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
