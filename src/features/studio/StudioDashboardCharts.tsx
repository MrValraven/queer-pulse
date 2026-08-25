import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { StudioLine } from "./StudioSkeletons";
import { BARS, CURATORS, CITIES } from "./studioDashboard.data";
import s from "./creator.module.css";

// Chart footer: bundles live analytics figures (peak day, play count,
// curator attribution, top-track share) — content, computed from data in
// live mode, not fixed platform chrome.
const CHART_PEAK_SUMMARY_PRE = "Peak: ";
const CHART_PEAK_DAY = "today";
const CHART_PEAK_SUMMARY_POST = " · 4,212 plays · Sara picked you on Monday";
const CHART_TOP_TRACK_TITLE = "Carta para a santa";
const CHART_TOP_TRACK_SUMMARY_POST = " is 71% of this";

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
            {["7d", "14d", "30d", "1y"].map((range) => (
              <button
                key={range}
                type="button"
                className={[s.rangeBtn, range === "14d" && s.rangeBtnOn]
                  .filter(Boolean)
                  .join(" ")}
              >
                {range}
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
            {CHART_PEAK_SUMMARY_PRE}
            <em>{CHART_PEAK_DAY}</em>
            {CHART_PEAK_SUMMARY_POST}
          </span>
          <span>
            <em>{CHART_TOP_TRACK_TITLE}</em>
            {CHART_TOP_TRACK_SUMMARY_POST}
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
                key={curatorIndex}
                delay={Math.min(curatorIndex, 8) * 60}
                className={s.row}
              >
                <span
                  className={s.rowAv}
                  style={
                    curator.tone === "jade"
                      ? {
                          background: "rgba(74,140,111,.2)",
                          color: "var(--jade-light)",
                        }
                      : undefined
                  }
                >
                  {curator.av}
                </span>
                <div>
                  <div className={s.rowWhat}>{curator.what}</div>
                  <div className={s.rowWho}>{curator.who}</div>
                </div>
                <div className={s.rowWhen}>{curator.when}</div>
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
                key={city.nm}
                delay={Math.min(cityIndex, 8) * 60}
                className={s.cityRow}
              >
                <span className={s.cityNm}>{city.nm}</span>
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
