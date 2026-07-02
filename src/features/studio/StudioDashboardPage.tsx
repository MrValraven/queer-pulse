import { useSimulatedLoad } from "../../shared/hooks";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioDashboardCharts } from "./StudioDashboardCharts";
import { StudioDashboardSide } from "./StudioDashboardSide";
import { STATS } from "./studioDashboard.data";
import s from "./creator.module.css";

export function StudioDashboardPage() {
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
            Studio · this month
          </div>
          <h1>
            Good week, <em>Mariana.</em>
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
            <em style={{ color: "var(--accent)" }}>Cidade dos santos</em> is two
            months old and still climbing — the curators kept it in rotation.
          </div>
          <div className={s.bigstats}>
            {STATS.map((st) => (
              <div
                key={st.lbl}
                className={[s.bigstat, st.payout && s.bigstatPayout]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={s.bsLbl}>{st.lbl}</div>
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
