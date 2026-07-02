import { FadeIn } from "../../shared/components/ui";
import { StudioLine } from "./StudioSkeletons";
import { BARS, CURATORS, CITIES } from "./studioDashboard.data";
import s from "./creator.module.css";

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
            Daily plays · <em>last 14 days</em>
          </h3>
          <div className={s.range}>
            {["7d", "14d", "30d", "1y"].map((r) => (
              <button
                key={r}
                type="button"
                className={[s.rangeBtn, r === "14d" && s.rangeBtnOn]
                  .filter(Boolean)
                  .join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className={s.chart}>
          {BARS.map((h, i) => (
            <div
              key={i}
              className={[s.bar, i === BARS.length - 1 && s.barToday]
                .filter(Boolean)
                .join(" ")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className={s.chartFoot}>
          <span>
            Peak: <em>today</em> · 4,212 plays · Sara picked you on Monday
          </span>
          <span>
            <em>Carta para a santa</em> is 71% of this
          </span>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            Curators &amp; <em>placements</em> · what landed your work this week
          </h3>
        </div>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <DashRowSkeleton key={i} />)
          : CURATORS.map((c, i) => (
              <FadeIn key={i} delay={Math.min(i, 8) * 60} className={s.row}>
                <span
                  className={s.rowAv}
                  style={
                    c.tone === "jade"
                      ? {
                          background: "rgba(74,140,111,.2)",
                          color: "var(--jade-light)",
                        }
                      : undefined
                  }
                >
                  {c.av}
                </span>
                <div>
                  <div className={s.rowWhat}>{c.what}</div>
                  <div className={s.rowWho}>{c.who}</div>
                </div>
                <div className={s.rowWhen}>{c.when}</div>
              </FadeIn>
            ))}
      </div>

      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            Where they're <em>listening</em> from
          </h3>
        </div>
        <div className={s.hint}>
          City-level only · we never see street or finer.{" "}
          <em>This is the most we'll ever tell you about a listener.</em>
        </div>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CityRowSkeleton key={i} />)
          : CITIES.map((c, i) => (
              <FadeIn
                key={c.nm}
                delay={Math.min(i, 8) * 60}
                className={s.cityRow}
              >
                <span className={s.cityNm}>{c.nm}</span>
                <div className={s.barWrap}>
                  <div className={s.barBg}>
                    <div className={s.barFl} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className={s.pct}>{c.pct}%</span>
                </div>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
