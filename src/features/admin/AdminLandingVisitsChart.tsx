import { useState, type KeyboardEvent } from "react";
import {
  BarPlot,
  ResponsiveChart,
  useChartTooltip,
  linearScale,
  bandScale,
} from "../../shared/components/charts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ChartTooltip } from "./AdminDashboardChartParts";
import { niceAxis, nextBarIndex } from "./adminChartAxis.helpers";
import type {
  LandingVisitsDay,
  LandingVisitsRangeDays,
} from "./api/adminLandingVisits.api";
import dashboardStyles from "./AdminDashboardPage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";

interface DayTip {
  dayLabel: string;
  visitsLabel: string;
}

/** How many columns apart the day labels under the bars sit, so a 90-day
 *  range stays legible on a phone. Counted back from today, so the newest
 *  day always carries a label. */
const LABEL_STEP_BY_RANGE: Record<LandingVisitsRangeDays, number> = {
  30: 7,
  90: 21,
};

/** Per-bar stagger of the grow-in, kept short enough that 90 bars finish
 *  rising in well under a second. */
const STAGGER_MS_BY_RANGE: Record<LandingVisitsRangeDays, number> = {
  30: 14,
  90: 5,
};

/** A `YYYY-MM-DD` UTC day as a Date at UTC midnight, formatted in UTC too,
 *  so a reader west of Greenwich never sees the day before. */
function utcDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/**
 * One bar per day over the selected range, oldest on the left. Built on the
 * shared `BarPlot` the way `ResponseTimeChart` is. The tooltip shows the day
 * over its count; each bar's accessible name reads the whole `tip` sentence.
 *
 * Up to 90 bars is too many tab stops, so the bars share one (a roving
 * tabindex): Tab lands on the newest day, ArrowLeft and ArrowRight step
 * through the days, Home and End jump to either end, and the focused bar
 * opens its tooltip.
 */
export function AdminLandingVisitsChart({
  days,
  rangeDays,
}: {
  days: readonly LandingVisitsDay[];
  rangeDays: LandingVisitsRangeDays;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tip = useChartTooltip<DayTip>();
  const labelStep = LABEL_STEP_BY_RANGE[rangeDays];
  const staggerMs = STAGGER_MS_BY_RANGE[rangeDays];
  const lastIndex = days.length - 1;
  const [focusedIndex, setFocusedIndex] = useState(lastIndex);
  const tabbableIndex = Math.min(focusedIndex, lastIndex);
  const { max, ticks } = niceAxis(
    Math.max(0, ...days.map((entry) => entry.visits)),
  );

  const moveFocus = (event: KeyboardEvent<SVGRectElement>, index: number) => {
    const nextIndex = nextBarIndex(event.key, index, lastIndex);
    if (nextIndex === null) return;
    event.preventDefault();
    const bars =
      event.currentTarget.ownerSVGElement?.querySelectorAll<SVGRectElement>(
        'rect[role="img"]',
      );
    bars?.[nextIndex]?.focus();
  };

  const shortDay = (day: string) =>
    fmt.date(utcDate(day), {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  return (
    // eslint-disable-next-line react-hooks/refs -- tip.containerRef is visx's callback ref (useTooltipInPortal); this ATTACHES it via the ref attribute and never reads ref.current during render.
    <div ref={tip.containerRef} className={chartStyles.plot}>
      <ResponsiveChart aspect={640 / 260} minHeight={180}>
        {(width, height) => {
          const padLeft = 34;
          // Room for half of the newest day's centred label ("Oct 26").
          const padRight = 24;
          const padTop = 12;
          const padBottom = 30;
          const plotBottom = height - padBottom;
          const valueScale = linearScale(max, padTop, plotBottom);
          const columnScale = bandScale(
            days.length,
            padLeft,
            width - padRight,
            0.28,
          );

          return (
            <BarPlot<LandingVisitsDay, DayTip>
              width={width}
              height={height}
              valueScale={valueScale}
              columnScale={columnScale}
              ticks={ticks}
              gridLeft={padLeft}
              gridRight={width - padRight}
              labelY={height - 10}
              data={days}
              tip={tip}
              ariaLabel={t("admin:dashboard.landingVisits.ariaLabel")}
              axisLabel={(value, axisY) => (
                <text
                  x={padLeft - 8}
                  y={axisY + 4}
                  textAnchor="end"
                  className={dashboardStyles.chAxisSerif}
                >
                  {fmt.number(value)}
                </text>
              )}
              column={(entry, index) => {
                const y = valueScale(entry.visits);
                const dayLabel = shortDay(entry.day);
                const countLabel = fmt.number(entry.visits);
                const tipText = t("admin:dashboard.landingVisits.tip", {
                  day: dayLabel,
                  count: entry.visits,
                  countLabel,
                });
                const visitsLabel = t(
                  "admin:dashboard.landingVisits.tipCount",
                  { count: entry.visits, countLabel },
                );
                const isLabelled = (lastIndex - index) % labelStep === 0;
                return {
                  key: entry.day,
                  label: isLabelled ? dayLabel : undefined,
                  labelClassName:
                    index === lastIndex
                      ? dashboardStyles.chLabelStrong
                      : dashboardStyles.chLabel,
                  bars: [
                    {
                      key: entry.day,
                      y,
                      height: plotBottom - y,
                      rx: 2,
                      fill: "var(--accent)",
                      className: `${dashboardStyles.barSeg} ${chartStyles.mark}`,
                      style: { animationDelay: `${index * staggerMs}ms` },
                      datum: { dayLabel, visitsLabel },
                      ariaLabel: tipText,
                      tabIndex: index === tabbableIndex ? 0 : -1,
                      onFocus: () => setFocusedIndex(index),
                      onKeyDown: (event) => moveFocus(event, index),
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
            {data.visitsLabel}
          </>
        )}
      </ChartTooltip>
    </div>
  );
}
