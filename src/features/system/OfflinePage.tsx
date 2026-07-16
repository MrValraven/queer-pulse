import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import styles from "./OfflinePage.module.css";

/** Fixed demo "cached" moments — a real Date so the sub-label can localize. */
const TICKET_CACHED_DATE = new Date(2026, 5, 12);

interface CachedItem {
  to: string;
  label: string;
  sub: string;
  icon: ReactNode;
}

/**
 * i18n Pattern B: the ticket/map sub-labels fuse chrome with a formatted date
 * or relative time, so this needs `t` + `fmt` at call time (memoized by the
 * component below).
 */
function buildCached(t: TFunction, fmt: Formatters): CachedItem[] {
  return [
    {
      to: routes.rsvpTicket,
      label: t("system:offline.cached.ticket.label"),
      sub: t("system:offline.cached.ticket.sub", {
        date: fmt.date(TICKET_CACHED_DATE, {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      }),
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
      label: t("system:offline.cached.map.label"),
      sub: t("system:offline.cached.map.sub", {
        when: fmt.relativeTime(-1, "day"),
      }),
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
      label: t("system:offline.cached.crisisChat.label"),
      sub: t("system:offline.cached.crisisChat.sub"),
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
      label: t("system:offline.cached.emergency.label"),
      sub: t("system:offline.cached.emergency.sub"),
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
}

export function OfflinePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [retrying, setRetrying] = useState(false);
  const cached = useMemo(() => buildCached(t, fmt), [t, fmt]);

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

        <div className={styles.eyebrow}>{t("system:offline.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="system:offline.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:offline.lead"
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.cached}>
          <h3 className={styles.cachedTitle}>{t("system:offline.cachedTitle")}</h3>
          <div className={styles.cachedList}>
            {cached.map((item) => (
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
          <span className={styles.status}>{t("system:offline.status")}</span>
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
            {retrying
              ? t("system:offline.retryingCta")
              : t("system:offline.retryCta")}
          </button>
        </div>
      </div>
    </SystemStateShell>
  );
}
