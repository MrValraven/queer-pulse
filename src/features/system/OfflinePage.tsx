import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import styles from "./OfflinePage.module.css";

const CACHED = [
  {
    to: routes.rsvpTicket,
    label: "Your QR ticket — Open clinic night",
    sub: "Thu 12 Jun · Café Beirão · cached 3h ago",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: routes.spacesMap,
    label: "Safe-spaces map · Lisbon",
    sub: "42 venues · updated yesterday",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    to: routes.crisisChat,
    label: "Crisis chat · SMS fallback",
    sub: "Will deliver as soon as signal returns",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    to: routes.emergency,
    label: "Emergency contacts",
    sub: "112 · SOS Voz Amiga · ILGA helpline",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  function retry() {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setRetrying(true);
      setTimeout(() => setRetrying(false), 1600);
    }
  }

  return (
    <SystemStateShell mutedBrand>
      <div className={styles.card}>
        <div className={styles.ic}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>

        <div className={styles.eyebrow}>No connection · cached version</div>
        <h1 className={styles.h1}>
          You're <em>offline.</em>
        </h1>
        <p className={styles.lead}>
          No signal, or our servers can't be reached. <b>Don't worry</b> — your
          gathering RSVPs, your saved safe-spaces map, and your QR ticket are
          still here on this device.
        </p>

        <div className={styles.cached}>
          <h3 className={styles.cachedTitle}>
            Available offline · cached on your device
          </h3>
          <div className={styles.cachedList}>
            {CACHED.map((item) => (
              <Link key={item.to} to={item.to} className={styles.cachedRow}>
                <div className={styles.cachedIc}>{item.icon}</div>
                <div className={styles.cachedText}>
                  <b>{item.label}</b>
                  <span>{item.sub}</span>
                </div>
                <span className={styles.cachedArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.foot}>
          <span className={styles.status}>Listening for signal</span>
          <button type="button" className={styles.retryBtn} onClick={retry}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {retrying ? "Still offline" : "Try again"}
          </button>
        </div>
      </div>
    </SystemStateShell>
  );
}
