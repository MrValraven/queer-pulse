import { useState } from "react";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./OfflinePage.module.css";

/**
 * The cold-boot offline screen.
 *
 * WHAT THIS PAGE USED TO OFFER, AND WHY IT IS GONE. Under "try a page you've
 * opened before" it listed the feed, gatherings and messages, on the theory
 * that the service worker would serve whichever of them had been visited. Two
 * things made that impossible. First, `src/sw.ts` caches the app's own scripts,
 * styles, fonts and navigation documents; it caches no API response, and there
 * is no react-query persister, so a "cached" page boots and then has nothing to
 * render. Second, and decisively: `OfflineGate` swaps the ENTIRE routed tree
 * for this component while the device booted offline, so following one of
 * those links changed the URL and re-rendered this same screen. Three links
 * that could only ever look broken, on the screen a member reaches when they
 * are already having a bad time.
 *
 * WHAT REPLACES THEM is the true state: nothing is readable offline yet. The
 * retry control below stays, because it does something real, and recovery is
 * automatic anyway: `useOnlineStatus` subscribes to the browser's `online`
 * event, so the gate drops this screen and mounts the routed tree the moment
 * the signal returns, with no interaction at all.
 */
export function OfflinePage() {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);

  function retry() {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setIsRetrying(true);
      setTimeout(() => setIsRetrying(false), 1600);
    }
  }

  return (
    <SystemStateShell mutedBrand>
      <StatusCard
        tone="plum"
        icon={<FiWifiOff aria-hidden />}
        kicker={t("system:offline.eyebrow")}
        heading={
          <Translation
            i18nKey="system:offline.h1"
            components={{ em: <em /> }}
          />
        }
        lead={
          <Translation
            i18nKey="system:offline.lead"
            components={{ b: <b /> }}
          />
        }
      >
        <div className={styles.noCache}>
          <h3 className={styles.noCacheTitle}>
            {t("system:offline.noCache.title")}
          </h3>
          <p className={styles.noCacheBody}>
            {t("system:offline.noCache.body")}
          </p>
        </div>

        <div className={styles.foot}>
          <span className={styles.status}>{t("system:offline.status")}</span>
          <button type="button" className={styles.retryBtn} onClick={retry}>
            <FiRefreshCw aria-hidden />
            {isRetrying
              ? t("system:offline.retryingCta")
              : t("system:offline.retryCta")}
          </button>
        </div>
      </StatusCard>
    </SystemStateShell>
  );
}
