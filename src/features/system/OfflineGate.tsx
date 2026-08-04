import type { ReactNode } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useOnlineStatus } from "../../shared/hooks";
import { OfflinePage } from "./OfflinePage";

/**
 * App-level offline fallback. When the device reports it is offline, replaces
 * the routed UI with the branded {@link OfflinePage} — the counterpart to the
 * service worker's navigation catch handler (src/sw.ts), which serves the
 * precached app shell so the SPA can boot at all while offline. Together they
 * turn a dead network into a real QueerPulse screen instead of the browser's
 * "dinosaur" error page.
 *
 * Dual-mode: in **demo** mode the whole app runs from local mock data and needs
 * no network, so being offline is irrelevant — the gate is a no-op there and
 * never blocks the prototype. Only the **live** app, which depends on the API,
 * shows the offline screen.
 *
 * OfflinePage is imported eagerly (not lazily) on purpose: the offline UI has
 * to be reachable with no network, so it must ride in the precached entry
 * shell, not a lazy chunk that may not be cached yet.
 */
export function OfflineGate({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const online = useOnlineStatus();

  if (!demoMode && !online) {
    return <OfflinePage />;
  }
  return <>{children}</>;
}
