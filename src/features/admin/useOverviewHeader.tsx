import type { ReactNode } from "react";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { QueueRow } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";

interface OverviewHeaderInput {
  /** The live (or demo) triage queue, so the headline count and the
   *  emergency line reflect the real backlog. `undefined` until the overview
   *  has loaded: only a loaded queue can say "caught up" (DES-424). */
  triage: QueueRow[] | undefined;
  /** The overview read failed with nothing loaded, including while a retry
   *  of it runs. */
  isError: boolean;
  /** A retry is in flight: the error copy stays and its Retry reads busy. */
  isRetrying: boolean;
  onRetry: () => void;
}

interface OverviewHeaderParts {
  eyebrow: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  actions: ReactNode;
}

/**
 * The Overview's hero header content for `AdminPageHeader`: the current date
 * as the eyebrow, the triage headline, and the actions. Three states: loading
 * (shimmer lines in the title and sub), a failed read (Retry takes the
 * primary), and loaded.
 */
export function useOverviewHeader({
  triage,
  isError,
  isRetrying,
  onRetry,
}: OverviewHeaderInput): OverviewHeaderParts {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isLoadError = triage === undefined && isError;

  // The eyebrow shows the actual current moment, so it is real data in both
  // demo and live mode.
  const now = new Date();
  const eyebrow = `${fmt.date(now, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${fmt.time(now)}`;

  // In the error state the only thing the page asks of the operator is to
  // retry, so Retry takes the primary and "Open moderation" steps back.
  const moderationCta = (
    <Button
      variant={isLoadError ? "ghost" : "primary"}
      to={routes.adminModeration}
    >
      {t("admin:dashboard.header.moderationCta")} <FiArrowRight aria-hidden />
    </Button>
  );

  if (isLoadError) {
    return {
      eyebrow,
      title: (
        <Translation
          i18nKey="admin:dashboard.header.titleError"
          components={{ em: <em /> }}
        />
      ),
      sub: t("admin:dashboard.header.subError"),
      actions: (
        <>
          {/* A status region, like the house error panel: the Retry label
              flipping from "Trying again…" back to "Try again" is spoken, so
              a second failure is heard without moving focus. */}
          <div role="status" className={styles.retrySlot}>
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
          {moderationCta}
        </>
      ),
    };
  }

  if (triage === undefined) {
    return {
      eyebrow,
      title: (
        <>
          <span className="visuallyHidden">
            {`${t("shared:adminNav.items.overview")}, ${t("shared:loading.label")}`}
          </span>
          <span
            className={`${styles.skeleton} ${styles.titleSkeleton}`}
            aria-hidden
          />
        </>
      ),
      sub: (
        <span
          className={`${styles.skeleton} ${styles.subSkeleton}`}
          aria-hidden
        />
      ),
      actions: moderationCta,
    };
  }

  // Everything in the triage queue "needs a human"; the danger-tone row is the
  // safety-emergencies bucket (same discriminator in demo and live).
  const totalNeedsHuman = triage.reduce((sum, row) => sum + row.count, 0);
  const emergencyCount = triage
    .filter((row) => row.tone === "danger")
    .reduce((sum, row) => sum + row.count, 0);
  const isCaughtUp = totalNeedsHuman === 0;

  return {
    eyebrow,
    title: isCaughtUp ? (
      <Translation
        i18nKey="admin:dashboard.header.titleClear"
        components={{ em: <em /> }}
      />
    ) : (
      <Translation
        i18nKey="admin:dashboard.header.title"
        components={{ em: <em /> }}
        values={{ count: totalNeedsHuman }}
      />
    ),
    sub: isCaughtUp
      ? t("admin:dashboard.header.subClear")
      : emergencyCount > 0
        ? t("admin:dashboard.header.subEmergencies", { count: emergencyCount })
        : t("admin:dashboard.header.subCalm"),
    actions: moderationCta,
  };
}
