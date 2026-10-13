import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioDashboardCharts } from "./StudioDashboardCharts";
import { StudioDashboardSide } from "./StudioDashboardSide";
import { fixtureDate, STATS } from "./studioDashboard.data";
import s from "./creator.module.css";
import css from "./StudioNumbers.module.css";

/** The demo artist's first name and current single: content, interpolated
 *  into the translated hero copy. */
const CURRENT_ARTIST_NAME = "Mariana";
const CURRENT_TRACK_TITLE = "Cidade dos santos";

/** The demo dashboard: listening charts, money cards and curator activity.
 *  Showcase only (useStudioShowcase); a live artist sees Your numbers. */
export function StudioDashboardShowcase() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();
  return (
    <>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>
            <span className={css.liveDot} aria-hidden />
            {t("studio:dashboard.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:dashboard.hero.title"
              components={{ em: <em /> }}
              values={{ name: CURRENT_ARTIST_NAME }}
            />
          </h1>
          <div className={css.showcaseSub}>
            <Translation
              i18nKey="studio:dashboard.hero.sub"
              components={{ em: <em className={css.accentEm} /> }}
              values={{ trackTitle: CURRENT_TRACK_TITLE }}
            />
          </div>
          <div className={s.bigstats}>
            {STATS.map((stat) => (
              <div
                key={stat.labelKey}
                className={[s.bigstat, stat.payout && s.bigstatPayout]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={s.bsLbl}>
                  {t(
                    stat.labelKey,
                    stat.labelDateIso
                      ? {
                          date: fmt.date(fixtureDate(stat.labelDateIso), {
                            day: "numeric",
                            month: "short",
                          }),
                        }
                      : undefined,
                  )}
                </div>
                <div className={s.bsV}>{stat.v}</div>
                <div className={s.bsTrend}>
                  <Translation
                    i18nKey={stat.trendKey}
                    values={stat.trendValues ?? {}}
                    slots={stat.trendSlots}
                    components={{ up: <em className={s.up} /> }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={s.body}>
        <StudioDashboardCharts loading={loading} />
        <StudioDashboardSide />
      </section>
    </>
  );
}
