import { useMemo } from "react";
import { Collapse, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioArtistPlays } from "./api/useStudioArtistPlays";
import { StudioBarChart } from "./StudioBarChart";
import { StudioLoadError } from "./StudioLoadStates";
import type { StudioBarBucket } from "./studioBarBuckets";
import { formatStudioCount } from "./studioCount";
import { studioReasonCopyKey } from "./studioReason";
import css from "./StudioDashboardExtras.module.css";
import kit from "./studioKit.module.css";

/** Days are UTC dates: formatting in UTC keeps each one on its own date
 *  west of Greenwich. */
const DAY_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
};
/** A date under every seventh day, counted back from today. */
const AXIS_LABEL_STEP = 7;
/** The follower growth chart's shape, so the two charts line up. */
const PLAYS_ASPECT = 1166 / 280;
const PLAYS_MINIMUM_PLOT_HEIGHT = 200;
const PLAYS_WHAT_KEY = "studio:errors.what.plays";

/** A persona the member no longer owns reads as not found. A Retry cannot
 *  change that answer, so this panel offers none. */
function StudioPlaysNotFound() {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      title={
        <Translation
          i18nKey="studio:errors.load.title"
          components={{ em: <em /> }}
          values={{ what: t(PLAYS_WHAT_KEY) }}
        />
      }
      description={t(studioReasonCopyKey("notFound", "load"))}
      compact
      className={kit.loadError}
    />
  );
}

/** The dashboard's plays per day over the last 28 days, today last in jade.
 *  A day the server withheld (1 to 4 plays) reads "Fewer than 5" and draws
 *  the empty bar; a day with no plays reads 0. The all-time and 28-day
 *  totals and the counting note sit under the chart. */
export function StudioPlaysTrendChart({
  subprofileId,
}: {
  subprofileId: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { plays, loadState } = useStudioArtistPlays(subprofileId, true);
  const buckets = useMemo<StudioBarBucket[]>(
    () =>
      (plays?.days ?? []).map((entry) => ({
        key: entry.dayKey,
        date: entry.day,
        count: entry.plays.value ?? 0,
        isWithheld: entry.plays.isBelowThreshold,
        isCurrent: entry.isToday,
      })),
    [plays],
  );
  const hasNoPlays = (plays?.days ?? []).every(
    (entry) => !entry.plays.isBelowThreshold && entry.plays.value === 0,
  );
  const isFailed = loadState.isError || loadState.isNotFound;

  const dayLabelOf = (bucket: StudioBarBucket) =>
    bucket.isCurrent
      ? t("studio:numbers.plays.today")
      : fmt.date(bucket.date, DAY_DATE);
  const axisLabelOf = (bucket: StudioBarBucket, index: number) =>
    bucket.isCurrent || (buckets.length - 1 - index) % AXIS_LABEL_STEP === 0
      ? fmt.date(bucket.date, DAY_DATE)
      : undefined;

  return (
    <div className={css.trendCard}>
      <Collapse isOpen={!isFailed}>
        <StudioBarChart
          buckets={buckets}
          floor={null}
          labels={{
            title: t("studio:numbers.plays.title"),
            subtitle: t("studio:numbers.plays.sub"),
            ariaLabel: t("studio:numbers.plays.ariaLabel"),
            tableCaption: t("studio:numbers.plays.tableCaption"),
            bucketColumn: t("studio:numbers.plays.dayColumn"),
            countColumn: t("studio:numbers.plays.countColumn"),
            showTable: t("studio:numbers.chart.showTable"),
            hideTable: t("studio:numbers.chart.hideTable"),
          }}
          bucketLabelOf={dayLabelOf}
          axisLabelOf={axisLabelOf}
          isLoading={loadState.isLoading}
          aspect={PLAYS_ASPECT}
          minimumPlotHeight={PLAYS_MINIMUM_PLOT_HEIGHT}
          empty={hasNoPlays ? t("studio:numbers.plays.empty") : false}
        />
      </Collapse>
      {/* The totals sit outside the chart frame, which swaps all of its
          children for the empty line on a quiet month. */}
      <Collapse isOpen={plays !== null && !isFailed}>
        {plays && (
          <div className={css.trendFooter}>
            <p className={css.trendTotals}>
              {t("studio:numbers.plays.totals", {
                total: formatStudioCount(plays.total, t, fmt),
                recent: formatStudioCount(plays.total28d, t, fmt),
              })}
            </p>
            <p className={css.trendNote}>{t("studio:numbers.plays.note")}</p>
          </div>
        )}
      </Collapse>
      <Collapse isOpen={loadState.isNotFound}>
        <StudioPlaysNotFound />
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <StudioLoadError loadState={loadState} what={PLAYS_WHAT_KEY} />
      </Collapse>
    </div>
  );
}
