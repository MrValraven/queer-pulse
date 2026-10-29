import { useId, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { ChartFrame } from "../../shared/components/charts";
import { Button, Collapse } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminSeg } from "./ui";
import { AdminLandingVisitsChart } from "./AdminLandingVisitsChart";
import { AdminLandingVisitsSources } from "./AdminLandingVisitsSources";
import { useAdminLandingVisits } from "./api/useAdminLandingVisits";
import type { LandingVisitsRangeDays } from "./api/adminLandingVisits.api";
import {
  LANDING_VISIT_PAGES,
  type LandingVisitPage,
} from "../homepage/api/landingVisitBeacon";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import styles from "./AdminLandingVisitsCard.module.css";

const RANGE_OPTIONS: readonly LandingVisitsRangeDays[] = [30, 90];

const PAGE_LABEL_KEY: Record<LandingVisitPage, string> = {
  home: "admin:dashboard.landingVisits.pageHome",
  studio: "admin:dashboard.landingVisits.pageStudio",
};

/**
 * Anonymous landing-page visits per day, with the busiest sources beside
 * them. The counter stores only (day, source, visits), so this card is the
 * whole of what there is to see: no visitor, session or path behind a bar.
 *
 * The page switch (Homepage, Studio page) and the range toggle sit in the
 * frame's head and stay mounted through loading and errors, so a reader can
 * always switch back. A failed read with
 * nothing loaded keeps its error line through a retry, so focus stays on the
 * Retry button.
 */
export function AdminLandingVisitsCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [rangeDays, setRangeDays] = useState<LandingVisitsRangeDays>(30);
  const [page, setPage] = useState<LandingVisitPage>("home");
  const visitsQuery = useAdminLandingVisits(rangeDays, page);
  const { data, error, isLoading, isPlaceholderData, refetch } = visitsQuery;
  const hasLoadError = hasFailedWithoutData(visitsQuery);
  const isRetrying = isRetryingFailedRead(visitsQuery);
  const hasContent = !hasLoadError && data !== undefined;
  const isEmpty = hasContent && data.total === 0;
  const rangeLabelId = useId();
  const pageLabelId = useId();
  const staleClassName = isPlaceholderData ? styles.stale : undefined;

  const pageSwitch = (
    <div className={styles.range}>
      <span id={pageLabelId} className="visuallyHidden">
        {t("admin:dashboard.landingVisits.pageLabel")}
      </span>
      <AdminSeg
        options={LANDING_VISIT_PAGES.map((option) => ({
          value: option,
          label: t(PAGE_LABEL_KEY[option]),
        }))}
        value={page}
        onChange={(next) => setPage(next as LandingVisitPage)}
        ariaLabelledby={pageLabelId}
      />
    </div>
  );

  const rangeToggle = (
    <div className={styles.range}>
      <span id={rangeLabelId} className="visuallyHidden">
        {t("admin:dashboard.landingVisits.rangeLabel")}
      </span>
      <AdminSeg
        options={RANGE_OPTIONS.map((option) => ({
          value: String(option),
          label: t(`admin:dashboard.landingVisits.range${option}`),
        }))}
        value={String(rangeDays)}
        onChange={(next) =>
          setRangeDays(Number(next) as LandingVisitsRangeDays)
        }
        ariaLabelledby={rangeLabelId}
      />
    </div>
  );

  return (
    <ChartFrame
      title={t("admin:dashboard.landingVisits.title")}
      subtitle={t(
        page === "studio"
          ? "admin:dashboard.landingVisits.subStudio"
          : "admin:dashboard.landingVisits.sub",
      )}
      legend={
        <div className={styles.controls}>
          {pageSwitch}
          {rangeToggle}
        </div>
      }
      loading={isLoading && !hasLoadError}
      skeletonHeight={220}
      empty={isEmpty ? t("admin:dashboard.landingVisits.empty") : false}
    >
      <Collapse isOpen={hasLoadError}>
        {/* A status region, like the dashboard header's error panel: the
            Retry label flipping back after a second failure is spoken
            without moving focus. */}
        <div role="status" className={styles.loadError}>
          <p className={styles.loadErrorText}>
            {describeError(
              t("admin:dashboard.landingVisits.loadError"),
              error,
              t("shared:apiError.tryAgainTail"),
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={isRetrying || undefined}
            onClick={isRetrying ? undefined : () => void refetch()}
          >
            <FiRefreshCw aria-hidden />{" "}
            {isRetrying
              ? t("shared:loadError.retryingCta")
              : t("admin:dashboard.landingVisits.retry")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={hasContent} className={styles.content}>
        {data ? (
          <>
            {/* While the other range loads, the previous answer stays on
                screen, dimmed, so the card never drops to a skeleton. */}
            <p
              className={[styles.total, staleClassName]
                .filter(Boolean)
                .join(" ")}
              aria-busy={isPlaceholderData || undefined}
            >
              <Translation
                i18nKey="admin:dashboard.landingVisits.total"
                values={{ count: data.total }}
                slots={{
                  count: (
                    <RollingNumber
                      value={fmt.number(data.total)}
                      numericValue={data.total}
                      className={styles.totalFigure}
                    />
                  ),
                }}
              />
            </p>
            <div
              className={[styles.body, staleClassName]
                .filter(Boolean)
                .join(" ")}
              aria-busy={isPlaceholderData || undefined}
            >
              <AdminLandingVisitsChart
                key={`${data.page}-${data.rangeDays}`}
                days={data.days}
                rangeDays={data.rangeDays}
              />
              <AdminLandingVisitsSources sources={data.topSources} />
            </div>
          </>
        ) : null}
      </Collapse>
    </ChartFrame>
  );
}
