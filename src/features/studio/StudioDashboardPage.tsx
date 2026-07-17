import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioDashboardCharts } from "./StudioDashboardCharts";
import { StudioDashboardSide } from "./StudioDashboardSide";
import { STATS } from "./studioDashboard.data";
import s from "./creator.module.css";

/** Mock signed-in artist's first name and current single's title — content,
 * not chrome, interpolated into the translated hero copy below. */
const CURRENT_ARTIST_NAME = "Mariana";
const CURRENT_TRACK_TITLE = "Cidade dos santos";

export function StudioDashboardPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>
            <span
              className="live"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--jade)",
              }}
            />
            {t("studio:dashboard.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:dashboard.hero.title"
              components={{ em: <em /> }}
              values={{ name: CURRENT_ARTIST_NAME }}
            />
          </h1>
          <div
            className="sub"
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "rgba(247,243,238,.62)",
              marginTop: 14,
            }}
          >
            <Translation
              i18nKey="studio:dashboard.hero.sub"
              components={{ em: <em style={{ color: "var(--accent)" }} /> }}
              values={{ trackTitle: CURRENT_TRACK_TITLE }}
            />
          </div>
          <div className={s.bigstats}>
            {STATS.map((st) => (
              <div
                key={st.labelKey}
                className={[s.bigstat, st.payout && s.bigstatPayout]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={s.bsLbl}>{t(st.labelKey, st.labelValues)}</div>
                <div className={s.bsV}>{st.v}</div>
                <div className={s.bsTrend}>{st.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.body}>
        <StudioDashboardCharts loading={loading} />
        <StudioDashboardSide />
      </section>
    </StudioCreatorShell>
  );
}
