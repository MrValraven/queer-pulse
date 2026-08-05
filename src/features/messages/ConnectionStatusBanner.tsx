import { useEffect, useState } from "react";
import { FiWifi, FiWifiOff } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useRealtime } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/** How long the socket may stay down before we surface a "reconnecting" strip,
 *  so a normal fast (re)connect — including the initial page-load handshake —
 *  never flashes it. Offline is shown immediately (navigator.onLine is truthful). */
const RECONNECT_GRACE_MS = 2500;

type ConnectionStatus = "connected" | "offline" | "reconnecting";

/**
 * A lightweight connection strip at the top of the open thread. Driven by the
 * realtime socket status plus `navigator.onLine`: when the member is offline (or
 * the socket has been down past a short grace), it explains that messages are
 * waiting for the network — so an offline send that flips to `failed` no longer
 * happens silently. Renders nothing while connected, and is inert in demo mode
 * (no live socket ever opens there). Motion (the reconnecting pulse) is gated on
 * `prefers-reduced-motion` in CSS.
 */
export function ConnectionStatusBanner() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { connected } = useRealtime();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine,
  );
  /** True once the socket has been down long enough (while the browser reports
   *  online) to warrant the reconnecting strip — see the grace timer below. */
  const [showReconnecting, setShowReconnecting] = useState(false);

  // Track the browser's own online/offline transitions.
  useEffect(() => {
    function update() {
      setIsOffline(!navigator.onLine);
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Arm the grace timer only while genuinely disconnected-but-online in live
  // mode; connecting/connected/offline/demo have nothing to defer.
  useEffect(() => {
    if (demoMode || connected || isOffline) {
      // Guarded reset (not an unconditional render-loop setState): clear the
      // pending reconnecting state the moment there's nothing to defer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowReconnecting(false);
      return;
    }
    const timer = window.setTimeout(
      () => setShowReconnecting(true),
      RECONNECT_GRACE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [demoMode, connected, isOffline]);

  // Demo mode never has a live socket, so it carries no connection chrome.
  if (demoMode) return null;

  let status: ConnectionStatus;
  if (isOffline) status = "offline";
  else if (!connected && showReconnecting) status = "reconnecting";
  else status = "connected";

  if (status === "connected") return null;

  return (
    <div
      className={styles.connectionBanner}
      data-status={status}
      role="status"
      aria-live="polite"
    >
      <span className={styles.connectionBannerIcon} aria-hidden="true">
        {status === "offline" ? <FiWifiOff /> : <FiWifi />}
      </span>
      <span>
        {status === "offline"
          ? t("messages:connection.offline")
          : t("messages:connection.reconnecting")}
      </span>
    </div>
  );
}
