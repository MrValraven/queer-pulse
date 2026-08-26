import { FiRefreshCw } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PlatformStatusState } from "./api/platformStatus.api";
import { usePlatformStatus } from "./api/usePlatformStatus";
import { StatusLiveComponents } from "./StatusLiveComponents";
import { StatusLiveIncidents } from "./StatusLiveIncidents";
import {
  STATUS_OVERALL_BODY_KEY,
  STATUS_OVERALL_TITLE_KEY,
  STATUS_STATE_ICON,
} from "./statusLive.data";
import { relativeFromNow } from "./statusLive.utils";
import styles from "./StatusLive.module.css";

/** Class map keyed by overall state — depends on the CSS module import. */
const BANNER_CLASS: Record<PlatformStatusState, string | undefined> = {
  operational: styles.bannerOperational,
  degraded: styles.bannerDegraded,
  down: styles.bannerDown,
};

/**
 * The LIVE status page, fed by `GET /status`.
 *
 * The failure case matters as much as the success case. A member reaches this
 * page precisely when they suspect something is broken, so "we could not reach
 * the status service" is itself an answer worth stating plainly, and is styled
 * as an outage rather than hidden behind a spinner that never ends.
 */
export function StatusLive() {
  const { t } = useTranslation();
  const format = useFormat();
  const { data, isLoading, isError, isFetching, refetch } = usePlatformStatus();

  const overall = data?.overall ?? "down";
  const OverallIcon = STATUS_STATE_ICON[overall];

  if (isLoading) {
    return (
      <section className={`wrap ${styles.section}`} aria-busy="true">
        <SkeletonLine height={96} style={{ borderRadius: 18 }} />
        <div className={styles.skeletonRows}>
          {[0, 1, 2, 3].map((rowIndex) => (
            <SkeletonLine
              key={rowIndex}
              height={56}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className={`wrap ${styles.section}`}>
        <div
          className={[styles.banner, styles.bannerDown]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>
              {t("system:status.live.unreachable.title")}
            </h2>
            <p className={styles.bannerBody}>
              {t("system:status.live.unreachable.body")}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {t("system:status.live.refreshCta")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={`wrap ${styles.section}`}>
        <div
          className={[styles.banner, BANNER_CLASS[overall]]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          <span className={styles.bannerIcon}>
            <OverallIcon aria-hidden />
          </span>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>
              {t(STATUS_OVERALL_TITLE_KEY[overall])}
            </h2>
            <p className={styles.bannerBody}>
              {t(STATUS_OVERALL_BODY_KEY[overall])}
            </p>
          </div>
        </div>

        <div className={styles.checkedRow}>
          <p className={styles.checkedAt}>
            {t("system:status.live.lastChecked", {
              when: relativeFromNow(data.checkedAt, format),
            })}
          </p>
          <Button
            variant="ghost"
            size="md"
            onClick={() => void refetch()}
            disabled={isFetching}
            // Only while it is operable: WCAG 2.5.3 wants the accessible name
            // to contain the visible label, and the label below swaps to
            // "Checking" mid-fetch (when the control is disabled anyway).
            aria-label={
              isFetching ? undefined : t("system:status.live.refreshAriaLabel")
            }
          >
            <FiRefreshCw aria-hidden />
            {isFetching
              ? t("system:status.live.refreshingCta")
              : t("system:status.live.refreshCta")}
          </Button>
        </div>

        <p className={styles.signedOutNote}>
          {t("system:status.live.signedOutNote")}
        </p>
      </section>

      <StatusLiveComponents components={data.components} />
      <StatusLiveIncidents
        incidents={data.incidents}
        isHistoryUnavailable={data.isIncidentHistoryUnavailable}
      />
    </>
  );
}
