import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioLine } from "./StudioSkeletons";
import {
  BARS,
  CHART_RANGES,
  CURATORS,
  CITIES,
  SELECTED_CHART_RANGE_ID,
} from "./studioDashboard.data";
import { fixtureDate, WEEKDAY_DAY_MONTH } from "./studioFixtureDate";
import s from "./creator.module.css";

// Chart footer figures: demo content, fixed for the showcase.
const CHART_PEAK_PLAYS = 4212;
const CHART_TOP_TRACK_TITLE = "Carta para a santa";
const CHART_TOP_TRACK_PERCENT = 71;

/** Mirrors a creator .row: round avatar + two text lines + trailing meta. */
function DashRowSkeleton() {
  return (
    <div className={s.row}>
      <StudioLine width={38} height={38} style={{ borderRadius: "50%" }} />
      <div style={{ flex: 1 }}>
        <StudioLine width="60%" height={13} />
        <StudioLine width="40%" height={11} style={{ marginTop: 6 }} />
      </div>
      <StudioLine width={40} height={11} />
    </div>
  );
}

/** Mirrors a .cityRow: city name + bar + percent. */
function CityRowSkeleton() {
  return (
    <div className={s.cityRow}>
      <StudioLine width={80} height={12} />
      <StudioLine
        width="100%"
        height={8}
        style={{ flex: 1, borderRadius: 4 }}
      />
      <StudioLine width={28} height={12} />
    </div>
  );
}

export function StudioDashboardCharts({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={s.col}>
      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:dashboard.charts.dailyPlays.heading"
              components={{ em: <em /> }}
            />
          </h3>
          <div className={s.range}>
            {CHART_RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                className={[
                  s.rangeBtn,
                  range.id === SELECTED_CHART_RANGE_ID && s.rangeBtnOn,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {fmt.number(range.amount, {
                  style: "unit",
                  unit: range.unit,
                  unitDisplay: "narrow",
                })}
              </button>
            ))}
          </div>
        </div>
        <div className={s.chart}>
          {BARS.map((barHeight, barIndex) => (
            <div
              key={barIndex}
              className={[s.bar, barIndex === BARS.length - 1 && s.barToday]
                .filter(Boolean)
                .join(" ")}
              style={{ height: `${barHeight}%` }}
            />
          ))}
        </div>
        <div className={s.chartFoot}>
          <span>
            <Translation
              i18nKey="studio:demo.dashboard.peakSummary"
              components={{ em: <em /> }}
              values={{ plays: fmt.number(CHART_PEAK_PLAYS) }}
            />
          </span>
          <span>
            <Translation
              i18nKey="studio:demo.dashboard.topTrackShare"
              components={{ em: <em /> }}
              values={{
                title: CHART_TOP_TRACK_TITLE,
                percent: CHART_TOP_TRACK_PERCENT,
              }}
            />
          </span>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:dashboard.charts.curators.heading"
              components={{ em: <em /> }}
            />
          </h3>
        </div>
        {loading
          ? Array.from({ length: 4 }).map((_, skeletonIndex) => (
              <DashRowSkeleton key={skeletonIndex} />
            ))
          : CURATORS.map((curator, curatorIndex) => (
              <FadeIn
                key={curator.whatKey}
                delay={Math.min(curatorIndex, 8) * 60}
                className={s.row}
              >
                <span
                  className={s.rowAv}
                  style={
                    curator.tone === "jade"
                      ? {
                          background: "rgba(var(--jade-rgb), 0.2)",
                          color: "var(--studio-jade-text)",
                        }
                      : undefined
                  }
                >
                  {curator.av}
                </span>
                <div>
                  <div className={s.rowWhat}>
                    <Translation
                      i18nKey={curator.whatKey}
                      components={{ em: <em /> }}
                      values={{ title: curator.title }}
                    />
                  </div>
                  <div className={s.rowWho}>{t(curator.whoKey)}</div>
                </div>
                <div className={s.rowWhen}>
                  {curator.whenIso
                    ? fmt.date(fixtureDate(curator.whenIso), WEEKDAY_DAY_MONTH)
                    : t("studio:demo.dashboard.curator.today")}
                </div>
              </FadeIn>
            ))}
      </div>

      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:dashboard.charts.geography.heading"
              components={{ em: <em /> }}
            />
          </h3>
        </div>
        <div className={s.hint}>
          <Translation
            i18nKey="studio:dashboard.charts.geography.hint"
            components={{ em: <em /> }}
          />
        </div>
        {loading
          ? Array.from({ length: 4 }).map((_, skeletonIndex) => (
              <CityRowSkeleton key={skeletonIndex} />
            ))
          : CITIES.map((city, cityIndex) => (
              <FadeIn
                key={city.name ?? "other-cities"}
                delay={Math.min(cityIndex, 8) * 60}
                className={s.cityRow}
              >
                <span className={s.cityNm}>
                  {city.name ??
                    t("studio:demo.dashboard.otherCities", {
                      count: city.otherCount ?? 0,
                    })}
                </span>
                <div className={s.barWrap}>
                  <div className={s.barBg}>
                    <div
                      className={s.barFl}
                      style={{ width: `${city.pct}%` }}
                    />
                  </div>
                  <span className={s.pct}>{city.pct}%</span>
                </div>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
