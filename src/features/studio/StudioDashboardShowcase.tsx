import { StatGrid, StatTile } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioDashboardCharts } from "./StudioDashboardCharts";
import { StudioDashboardSide } from "./StudioDashboardSide";
import { STATS } from "./studioDashboard.data";
import { DAY_MONTH, fixtureDate } from "./studioFixtureDate";
import s from "./creator.module.css";
import css from "./StudioNumbers.module.css";
import chartStyles from "./StudioDashboardActivityChart.module.css";

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
        <div className={`${s.heroInner} ${chartStyles.heroColumn}`}>
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
          <StatGrid columns={5} className={chartStyles.stats}>
            {STATS.map((stat) => (
              <StatTile
                key={stat.labelKey}
                label={t(
                  stat.labelKey,
                  stat.labelDateIso
                    ? {
                        date: fmt.date(
                          fixtureDate(stat.labelDateIso),
                          DAY_MONTH,
                        ),
                      }
                    : undefined,
                )}
                value={stat.v}
                hint={
                  <Translation
                    i18nKey={stat.trendKey}
                    values={stat.trendValues ?? {}}
                    slots={stat.trendSlots}
                    components={{ up: <em className={chartStyles.trendUp} /> }}
                  />
                }
              />
            ))}
          </StatGrid>
        </div>
      </section>
      <section className={s.body}>
        <StudioDashboardCharts loading={loading} />
        <StudioDashboardSide />
      </section>
    </>
  );
}
