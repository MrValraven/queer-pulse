import { useState } from "react";
import { FiMessageCircle, FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { Button, StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./OfflinePage.module.css";

/**
 * The cold-boot offline screen.
 *
 * WHAT THIS PAGE USED TO OFFER, AND WHY IT IS GONE. Under "try a page you've
 * opened before" it listed the feed, gatherings and messages, on the theory
 * that the service worker would serve whichever of them had been visited. That
 * could not work. `src/sw.ts` caches the app's own scripts, styles, fonts and
 * navigation documents and no API response, so a "cached" page booted with
 * nothing to render; and `OfflineGate` swaps the ENTIRE routed tree for this
 * component while the device booted offline, so following one of those links
 * re-rendered this same screen.
 *
 * WHAT IS TRUE NOW. The one thing readable offline is the messaging cache kept
 * for the device's last signed-in member (PRD-375, see
 * `src/shared/api/queryPersistence/`). When such a record exists,
 * `OfflineGate` passes `savedMessagesHref` and this page links to the saved
 * inbox, which the gate then renders from that cache. Without one, the page
 * says plainly that nothing is readable offline yet. The retry control stays,
 * because it does something real, and recovery is automatic anyway:
 * `useOnlineStatus` subscribes to the browser's `online` event, so the gate
 * drops this screen and mounts the routed tree the moment the signal returns,
 * with no interaction at all.
 */
export function OfflinePage({
  savedMessagesHref,
}: {
  /** Where the saved inbox lives; set only when a saved record exists. */
  savedMessagesHref?: string;
}) {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);
  const hasSavedMessages = savedMessagesHref !== undefined;

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
            {hasSavedMessages
              ? t("system:offline.savedMessages.title")
              : t("system:offline.noCache.title")}
          </h3>
          <p className={styles.noCacheBody}>
            {hasSavedMessages
              ? t("system:offline.savedMessages.body")
              : t("system:offline.noCache.body")}
          </p>
        </div>

        <div className={styles.foot}>
          <span className={styles.status}>{t("system:offline.status")}</span>
          {savedMessagesHref !== undefined ? (
            <Button to={savedMessagesHref} variant="ghost" size="sm">
              <FiMessageCircle aria-hidden />
              {t("system:offline.readSavedMessagesCta")}
            </Button>
          ) : null}
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
