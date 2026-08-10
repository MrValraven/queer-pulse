import type { ReactNode } from "react";
import styles from "./OfflineBanner.module.css";

export interface OfflineBannerProps {
  /** When true the banner slides into view; when false it stays hidden. */
  offline: boolean;
  /** Already-translated banner copy (features own their i18n key). */
  message: ReactNode;
  /** Extra class hook for feature-specific tweaks (z-index, etc). */
  className?: string;
  /** Show the pulsing coral status dot before the message. */
  showDot?: boolean;
  /** ARIA role, e.g. "status" for a polite live announcement. */
  role?: string;
}

/**
 * Presentational top-of-viewport "you're offline" banner, extracted from a
 * near-identical per-feature copy in `myevents`.
 * It only renders the fixed plum bar and its slide-in transition — detecting
 * connectivity (context flag vs `useOnlineStatus`) and any reconnect toast stay
 * in each feature's thin wrapper, which passes the result down as `offline`.
 */
export function OfflineBanner({
  offline,
  message,
  className,
  showDot = false,
  role,
}: OfflineBannerProps) {
  return (
    <div
      className={[styles.banner, offline && styles.show, className]
        .filter(Boolean)
        .join(" ")}
      role={role}
    >
      {showDot && <span className={styles.dot} aria-hidden />}
      {message}
    </div>
  );
}
