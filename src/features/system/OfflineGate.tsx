import { useEffect, useState, type ReactNode } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { OfflineBanner } from "../../shared/components/ui";
import { useOnlineStatus } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OfflinePage } from "./OfflinePage";

/**
 * How long a reported `offline` has to hold before the banner appears.
 * `navigator.onLine` flaps (a tunnel, a wifi/cellular handover), and a bar that
 * blinks on every flap is noise. Going back online is applied immediately, so
 * the grace period only ever delays bad news.
 */
const OFFLINE_GRACE_MS = 2_000;

/**
 * App-level offline handling, in two distinct modes.
 *
 * **Cold boot offline** (the device is offline on first mount, so nothing has
 * rendered yet): replaces the routed UI with the branded {@link OfflinePage},
 * the counterpart to the service worker's navigation catch handler (src/sw.ts),
 * which serves the precached app shell so the SPA can boot at all while
 * offline. Together they turn a dead network into a real QueerPulse screen
 * instead of the browser's "dinosaur" error page. There is no member state to
 * lose in this case, because none was ever entered.
 *
 * **Going offline mid-session**: `children` stay mounted and rendered, and the
 * shared {@link OfflineBanner} announces the drop. Unmounting the routed
 * subtree here would destroy every uncommitted piece of state behind it: a
 * half-typed DM, a gathering form, an article draft. `navigator.onLine` is a
 * coarse signal (see `useOnlineStatus`), so a single flap must never cost
 * someone their typing. The sticky `hasEverRenderedOnline` flag is what
 * separates the two modes: once the routed subtree has rendered online, it
 * stays mounted for the rest of the session.
 *
 * Dual-mode: in **demo** mode the whole app runs from local mock data and needs
 * no network, so being offline is irrelevant. The gate is a no-op there and
 * shows neither screen nor banner. Only the **live** app, which depends on the
 * API, surfaces connectivity.
 *
 * OfflinePage is imported eagerly, never lazily, on purpose: the offline UI has
 * to be reachable with no network, so it must ride in the precached entry
 * shell rather than a lazy chunk that may not be cached yet.
 */
export function OfflineGate({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [hasEverRenderedOnline, setHasEverRenderedOnline] = useState(
    () => isOnline,
  );
  const [isOfflineConfirmed, setIsOfflineConfirmed] = useState(false);

  // Both latches are adjusted during render rather than in an effect: each is
  // guarded by the condition it clears, so it runs once per transition instead
  // of looping, and the banner never gets a committed frame that disagrees with
  // the current connectivity.
  if (isOnline && !hasEverRenderedOnline) setHasEverRenderedOnline(true);
  if (isOnline && isOfflineConfirmed) setIsOfflineConfirmed(false);

  useEffect(() => {
    if (isOnline) return;
    const graceTimer = window.setTimeout(
      () => setIsOfflineConfirmed(true),
      OFFLINE_GRACE_MS,
    );
    return () => window.clearTimeout(graceTimer);
  }, [isOnline]);

  if (demoMode) return <>{children}</>;

  if (!isOnline && !hasEverRenderedOnline) {
    return <OfflinePage />;
  }

  return (
    <>
      {/* The banner element stays mounted so its slide-in transition can run.
          Its message is empty while online on purpose: a `role="status"` live
          region only announces content that ARRIVES after it is registered, so
          filling it at the moment of the drop is what makes the announcement
          happen at all. */}
      <OfflineBanner
        offline={isOfflineConfirmed}
        showDot={isOfflineConfirmed}
        role="status"
        message={isOfflineConfirmed ? t("system:offline.sessionBanner") : ""}
      />
      {children}
    </>
  );
}
