import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  applyHandoffTargets,
  clearLaunchMemory,
  readLaunchMemory,
  resolveLaunchSeason,
  writeLaunchMemory,
} from "./appLaunch.utils";
import { useAppLaunchSequence } from "./useAppLaunchSequence";
import { readLaunchPreview, type LaunchPreview } from "./appLaunchPreview";
import styles from "./AppLaunch.module.css";

/** Time-of-day bucket for the returning member's greeting. */
function greetingKeyFor(hour: number): string {
  if (hour < 12) return "feed:greeting.morning";
  if (hour < 18) return "feed:greeting.afternoon";
  return "feed:greeting.evening";
}

/**
 * The boot sequence for the installed app.
 *
 * ONLY the splash is ours. The screen a member sees first — the icon and the
 * zoom out of it — is drawn by the OS from the manifest's `background_color`
 * and the app icon, before any JavaScript exists, and no web API hooks it. That
 * frame is the same --plum as this overlay, so the two read as one screen and
 * this component picks up where the OS leaves off.
 *
 * Renders nothing at all outside the installed app: in a browser tab the launch
 * moment is a page load, not an app opening, and a full-screen take-over there
 * would delay every web visitor and the prerender pass for nothing.
 */
export function AppLaunch() {
  const { isInstalled } = useDisplayMode();
  // The desktop preview (/simulations) forces the sequence on where it would
  // otherwise never run. Null outside a sandbox or a dev server.
  const [preview] = useState(readLaunchPreview);
  // Gate BEFORE the sequence's timers exist, which is why the overlay is a
  // separate component rather than an early return inside one.
  if (!isInstalled && !preview) return null;
  return <AppLaunchOverlay preview={preview} />;
}

function AppLaunchOverlay({ preview }: { preview: LaunchPreview | null }) {
  const { t } = useTranslation();
  const { checking, loggedIn, user } = useAuth();
  // Read once. Whether this launch is an offline launch is settled at boot;
  // reconnecting mid-splash does not retroactively change which path we took.
  const [isOffline] = useState(
    () =>
      preview?.isOffline ??
      (typeof navigator !== "undefined" && navigator.onLine === false),
  );
  const [memory] = useState(() =>
    preview?.name ? { firstName: preview.name } : readLaunchMemory(),
  );
  const [season] = useState(() => preview?.season ?? resolveLaunchSeason());
  // Settled once, in a lazy initializer: reading the clock in the JSX below
  // would be impure, and the greeting must not change under a re-render.
  const [greetingKey] = useState(() => greetingKeyFor(new Date().getHours()));
  const { phase, progress, isOverdue } = useAppLaunchSequence({
    isOffline,
    holdMs: preview?.holdMs,
  });
  // Drives the fade-in of the contents (never of the plum ground itself).
  const [isShown, setIsShown] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Leave the next cold launch something to greet by name, or stop greeting a
  // phone that has been signed out. Only ever a first name, only on this device.
  useEffect(() => {
    // A preview must not write anything: it would leave the sandbox's idea of
    // "Tiago" behind for the next real launch to greet.
    if (preview || checking) return;
    if (loggedIn && user?.profile.firstName) {
      writeLaunchMemory({ firstName: user.profile.firstName });
      return;
    }
    if (!loggedIn) clearLaunchMemory();
  }, [preview, checking, loggedIn, user?.profile.firstName]);

  // Measure the exit's travel while everything is still at rest: `complete`
  // fires a beat before the exit class lands, and reading the rects afterwards
  // would return the transform's destination instead of its origin.
  useLayoutEffect(() => {
    if (progress !== "complete") return;
    applyHandoffTargets(
      overlayRef.current,
      markRef.current,
      wordmarkRef.current,
    );
  }, [progress]);

  if (phase === "done" || typeof document === "undefined") return null;

  // Only ever a status: the splash claims progress it has, and nothing more.
  const statusText = !isOverdue
    ? null
    : isOffline
      ? t("shared:appLaunch.offline")
      : t("shared:appLaunch.stillConnecting");

  const overlayClass = [
    styles.overlay,
    isShown ? styles.shown : "",
    phase === "leaving" ? styles.leaving : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      ref={overlayRef}
      className={overlayClass}
      data-season={season}
      role="status"
      aria-live="polite"
      aria-label={t("shared:appLaunch.ariaLabel")}
    >
      <span className={`${styles.orb} ${styles.orbAccent}`} aria-hidden />
      <span className={`${styles.orb} ${styles.orbSkin}`} aria-hidden />
      <span className={styles.grain} aria-hidden />

      {/* The continuity anchor: the icon's mark, beating, on its way to
          becoming the nav bar's live dot. */}
      <span ref={markRef} className={styles.mark} aria-hidden>
        <span className={styles.markCore} />
        <span className={styles.markRing} />
        <span className={styles.markRingLate} />
      </span>

      <div className={styles.wordmarkGroup}>
        <div ref={wordmarkRef} className={styles.wordmark}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <span className={styles.wordmarkItalic} /> }}
          />
        </div>
        {memory ? (
          <div className={`${styles.tagline} ${styles.greeting}`}>
            <Translation
              i18nKey="shared:appLaunch.greeting"
              values={{
                greeting: t(greetingKey),
                name: memory.firstName,
              }}
              components={{ em: <em className={styles.greetingName} /> }}
            />
          </div>
        ) : (
          <div className={styles.tagline}>{t("shared:appLaunch.tagline")}</div>
        )}
      </div>

      <div className={`${styles.hairline} ${styles[progress]}`} aria-hidden>
        <span className={styles.hairlineFill} />
      </div>
      <p className={`${styles.statusline} ${statusText ? styles.on : ""}`}>
        {statusText}
      </p>
    </div>,
    document.body,
  );
}
