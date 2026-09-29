import { FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { QueueRow } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

interface AdminDashboardHeaderProps {
  /** The live (or demo) triage queue, so the headline count and the
   *  emergency callout reflect the real backlog rather than a baked number.
   *  `undefined` until the overview has loaded: only a loaded queue can say
   *  "caught up" (DES-424). */
  triage: QueueRow[] | undefined;
  /** The overview read failed with nothing loaded, including while a retry
   *  of it runs. */
  isError: boolean;
  /** A retry is in flight: the error line stays and its Retry reads busy. */
  isRetrying: boolean;
  onRetry: () => void;
}

export function AdminDashboardHeader({
  triage,
  isError,
  isRetrying,
  onRetry,
}: AdminDashboardHeaderProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // In the error state the only thing the page asks of the operator is to
  // retry, so Retry takes the primary and "Open moderation" steps back.
  const isLoadError = triage === undefined && isError;

  // The eyebrow shows the actual current moment — genuine data, not a baked
  // demo timestamp.
  const now = new Date();

  // Everything in the triage queue "needs a human"; the danger-tone row is the
  // safety-emergencies bucket (same discriminator in demo and live).
  const triageRows = triage ?? [];
  const totalNeedsHuman = triageRows.reduce((sum, row) => sum + row.count, 0);
  const emergencyCount = triageRows
    .filter((row) => row.tone === "danger")
    .reduce((sum, row) => sum + row.count, 0);
  const isCaughtUp = totalNeedsHuman === 0;

  return (
    <div className={styles.ph}>
      <div className={styles.phText}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {fmt.date(now, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {fmt.time(now)}
        </div>

        {isLoadError ? (
          <>
            <h1 className={styles.h1}>
              {t("admin:dashboard.header.titleErrorLine1")}
              <br />
              <Translation
                i18nKey="admin:dashboard.header.titleErrorLine2"
                components={{ em: <em /> }}
              />
            </h1>
            {/* A status region, like the house error panel: the Retry label
                flipping from "Trying again…" back to "Try again" is spoken,
                so a second failure is heard without moving focus. */}
            <div role="status">
              <p className={styles.phSub}>
                {t("admin:dashboard.header.subError")}
              </p>
              <div className={styles.phRetry}>
                <Button
                  variant="primary"
                  aria-disabled={isRetrying || undefined}
                  onClick={isRetrying ? undefined : onRetry}
                >
                  <FiRefreshCw aria-hidden />{" "}
                  {isRetrying
                    ? t("shared:loadError.retryingCta")
                    : t("shared:loadError.retryCta")}
                </Button>
              </div>
            </div>
          </>
        ) : triage === undefined ? (
          <>
            <SkeletonLine width={240} height={40} style={{ marginTop: 4 }} />
            <SkeletonLine width={190} height={40} style={{ marginTop: 10 }} />
            <SkeletonLine width={360} height={15} style={{ marginTop: 20 }} />
          </>
        ) : (
          <>
            <h1 className={styles.h1}>
              {isCaughtUp ? (
                <>
                  {t("admin:dashboard.header.titleClearLine1")}
                  <br />
                  <Translation
                    i18nKey="admin:dashboard.header.titleClearLine2"
                    components={{ em: <em /> }}
                  />
                </>
              ) : (
                <>
                  {t("admin:dashboard.header.titleLine1", {
                    count: totalNeedsHuman,
                  })}
                  <br />
                  <Translation
                    i18nKey="admin:dashboard.header.titleLine2"
                    components={{ em: <em /> }}
                    values={{ count: totalNeedsHuman }}
                  />
                </>
              )}
            </h1>
            <p className={styles.phSub}>
              {isCaughtUp
                ? t("admin:dashboard.header.subClear")
                : emergencyCount > 0
                  ? t("admin:dashboard.header.subEmergencies", {
                      count: emergencyCount,
                    })
                  : t("admin:dashboard.header.subCalm")}
            </p>
          </>
        )}
      </div>
      <div className={styles.phActions}>
        <Button
          variant={isLoadError ? "ghost" : "primary"}
          to={routes.adminModeration}
        >
          {t("admin:dashboard.header.moderationCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
