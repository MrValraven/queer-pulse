import { useMemo, useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import {
  BarPlot,
  ChartFrame,
  ChartTooltip,
  ResponsiveChart,
  bandScale,
  linearScale,
  useChartTooltip,
} from "../../shared/components/charts";
import chartStyles from "../../shared/components/charts/charts.module.css";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CHART_RANGES,
  DEFAULT_CHART_RANGE_DAYS,
  type ChartRange,
  DAILY_ACTIVITY,
  DASHBOARD_TODAY_ISO,
  DEFAULT_CHART_RANGE_ID,
  STUDIO_COUNT_FLOOR,
} from "./studioDashboard.data";
import { DAY_MONTH, fixtureDate } from "./studioFixtureDate";
import styles from "./StudioDashboardActivityChart.module.css";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const CHART_PAD = { left: 8, right: 8, top: 14, bottom: 28 };
const MINIMUM_BAR_HEIGHT = 3;

interface ActivityDay {
  date: Date;
  count: number;
  isToday: boolean;
}

interface ActivityTip {
  dayLabel: string;
  countLabel: string;
}

/** The activity series for one range, oldest first, ending on the fixture's
 *  today. */
function activityDaysOf(dayCount: number): ActivityDay[] {
  const todayTime = fixtureDate(DASHBOARD_TODAY_ISO).getTime();
  const counts = DAILY_ACTIVITY.slice(-dayCount);
  return counts.map((count, index) => ({
    date: new Date(
      todayTime - (counts.length - 1 - index) * MILLISECONDS_PER_DAY,
    ),
    count,
    isToday: index === counts.length - 1,
  }));
}

/** The next nice axis maximum above the largest day. */
function axisMaximumOf(days: ActivityDay[]): number {
  const largest = Math.max(...days.map((day) => day.count), STUDIO_COUNT_FLOOR);
  return Math.ceil(largest / 10) * 10;
}

/** Demo dashboard chart: saves and playlist adds per day. Studio never counts
 *  plays, and a day under the floor of 5 reads "Fewer than 5" (and draws as an
 *  empty bar, so its height cannot reveal the exact figure). Every bar is a
 *  focusable mark with a text label, and a data table mirrors the series. */
export function StudioDashboardActivityChart({
  isLoading,
}: {
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<ActivityTip>();
  const [rangeId, setRangeId] = useState(DEFAULT_CHART_RANGE_ID);
  const [isTableShown, setIsTableShown] = useState(false);
  const range: ChartRange = CHART_RANGES.find(
    (candidate) => candidate.id === rangeId,
  ) ?? { id: DEFAULT_CHART_RANGE_ID, days: DEFAULT_CHART_RANGE_DAYS };
  const days = useMemo(() => activityDaysOf(range.days), [range.days]);
  const labelStep = range.days <= 7 ? 1 : range.days <= 14 ? 2 : 5;

  const countLabelOf = (count: number) =>
    count < STUDIO_COUNT_FLOOR
      ? t("studio:numbers.fewerThanFive")
      : fmt.number(count);
  const dayLabelOf = (day: ActivityDay) =>
    day.isToday
      ? t("studio:demo.dashboard.activity.today")
      : fmt.date(day.date, DAY_MONTH);

  const rangeButtons = (
    <div
      className={styles.range}
      role="group"
      aria-label={t("studio:demo.dashboard.activity.rangeLabel")}
    >
      {CHART_RANGES.map((candidate) => (
        <Button
          key={candidate.id}
          variant={candidate.id === rangeId ? "primary" : "quiet"}
          size="sm"
          aria-pressed={candidate.id === rangeId}
          aria-label={t("studio:demo.dashboard.activity.rangeAria", {
            count: candidate.days,
          })}
          onClick={() => setRangeId(candidate.id)}
        >
          {fmt.number(candidate.days, {
            style: "unit",
            unit: "day",
            unitDisplay: "long",
          })}
        </Button>
      ))}
    </div>
  );

  return (
    <ChartFrame
      title={t("studio:demo.dashboard.activity.title")}
      subtitle={t("studio:demo.dashboard.activity.sub", {
        count: range.days,
      })}
      legend={rangeButtons}
      loading={isLoading}
      skeletonHeight={200}
    >
      {/* eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render. */}
      <div ref={tip.containerRef} className={chartStyles.plot}>
        <ResponsiveChart aspect={360 / 200}>
          {(width, height) => {
            const plotBottom = height - CHART_PAD.bottom;
            const valueScale = linearScale(
              axisMaximumOf(days),
              CHART_PAD.top,
              plotBottom,
            );
            const columnScale = bandScale(
              days.length,
              CHART_PAD.left,
              width - CHART_PAD.right,
              0.35,
            );
            return (
              <BarPlot<ActivityDay, ActivityTip>
                width={width}
                height={height}
                valueScale={valueScale}
                columnScale={columnScale}
                ticks={valueScale.ticks(3)}
                gridLeft={CHART_PAD.left}
                gridRight={width - CHART_PAD.right}
                labelY={height - 9}
                data={days}
                tip={tip}
                ariaLabel={t("studio:demo.dashboard.activity.ariaLabel", {
                  count: range.days,
                })}
                axisLabel={(value, axisY) => (
                  <text
                    x={CHART_PAD.left}
                    y={axisY - 4}
                    className={styles.axisLabel}
                  >
                    {value}
                  </text>
                )}
                column={(day, index) => {
                  const isBelowFloor = day.count < STUDIO_COUNT_FLOOR;
                  const barTop = isBelowFloor
                    ? plotBottom
                    : valueScale(day.count);
                  const barHeight = Math.max(
                    plotBottom - barTop,
                    MINIMUM_BAR_HEIGHT,
                  );
                  const datum = {
                    dayLabel: dayLabelOf(day),
                    countLabel: countLabelOf(day.count),
                  };
                  return {
                    key: day.date.getTime(),
                    label:
                      index % labelStep === 0 || day.isToday
                        ? fmt.date(day.date, { day: "numeric" })
                        : undefined,
                    labelClassName: day.isToday
                      ? styles.columnLabelToday
                      : styles.columnLabel,
                    bars: [
                      {
                        key: day.date.getTime(),
                        y: plotBottom - barHeight,
                        height: barHeight,
                        rx: 4,
                        fill: day.isToday ? "var(--jade)" : "var(--accent)",
                        className: chartStyles.mark,
                        datum,
                        ariaLabel: `${datum.dayLabel}: ${datum.countLabel}`,
                      },
                    ],
                  };
                }}
              />
            );
          }}
        </ResponsiveChart>
        {/* eslint-disable-next-line react-hooks/refs -- passing the memoized visx tooltip bundle (which holds the callback ref) to ChartTooltip, which renders it through a portal; not a during-render ref.current read. */}
        <ChartTooltip tip={tip}>
          {(data) => (
            <>
              <div className={chartStyles.tipStrong}>{data.dayLabel}</div>
              {data.countLabel}
            </>
          )}
        </ChartTooltip>
      </div>
      <Button
        variant="quiet"
        size="sm"
        aria-expanded={isTableShown}
        aria-controls="studio-dashboard-activity-table"
        onClick={() => setIsTableShown((current) => !current)}
      >
        {isTableShown
          ? t("studio:demo.dashboard.activity.hideTable")
          : t("studio:demo.dashboard.activity.showTable")}
      </Button>
      <Collapse isOpen={isTableShown}>
        <table id="studio-dashboard-activity-table" className={styles.table}>
          <caption className={styles.caption}>
            {t("studio:demo.dashboard.activity.tableCaption", {
              count: range.days,
            })}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                {t("studio:demo.dashboard.activity.dayColumn")}
              </th>
              <th scope="col">
                {t("studio:demo.dashboard.activity.countColumn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((day) => (
              <tr key={day.date.getTime()}>
                <th scope="row">{dayLabelOf(day)}</th>
                <td>{countLabelOf(day.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Collapse>
    </ChartFrame>
  );
}
