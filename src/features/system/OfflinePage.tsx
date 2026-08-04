import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import styles from "./OfflinePage.module.css";

interface OfflineLink {
  to: string;
  label: string;
  sub: string;
  icon: ReactNode;
}

/**
 * Honest offline navigation. We can't know for certain which pages the runtime
 * cache holds, so this offers the app's core sections framed as "try one" — the
 * service worker serves any that were opened before, and the rest simply fail
 * to load. No fabricated "your ticket is cached" claims or invented dates.
 */
function buildLinks(t: TFunction): OfflineLink[] {
  return [
    {
      to: routes.feed,
      label: t("system:offline.links.feed.label"),
      sub: t("system:offline.links.feed.sub"),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="14" y2="18" />
        </svg>
      ),
    },
    {
      to: routes.events,
      label: t("system:offline.links.events.label"),
      sub: t("system:offline.links.events.sub"),
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
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
        </svg>
      ),
    },
    {
      to: routes.messages,
      label: t("system:offline.links.messages.label"),
      sub: t("system:offline.links.messages.sub"),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];
}

export function OfflinePage() {
  const { t } = useTranslation();
  const [retrying, setRetrying] = useState(false);
  const links = buildLinks(t);

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
          <h3 className={styles.cachedTitle}>{t("system:offline.tryTitle")}</h3>
          <div className={styles.cachedList}>
            {links.map((item) => (
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
