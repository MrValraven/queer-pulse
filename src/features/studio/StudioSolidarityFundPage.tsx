import { Link } from "react-router-dom";
import { StudioShell } from "./StudioShell";
import { StudioFundBalance } from "./StudioFundBalance";
import { StudioFundFlows } from "./StudioFundFlows";
import { StudioFundLog } from "./StudioFundLog";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import s from "./funding.module.css";

export function StudioSolidarityFundPage() {
  const { showToast } = useToast();

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>
            <span className={s.live} /> Public · updated Mondays at noon
          </div>
          <h1>
            The <em>solidarity</em> fund.
          </h1>
          <div className={s.dek}>
            A small pooled reserve that pays the people the per-stream rate
            can't reach —{" "}
            <em>
              transcribers, translators, first-timers, and artists in a hard
              month
            </em>
            . Where it comes from and where it goes, in full.
          </div>
        </div>

        <StudioFundBalance />
        <StudioFundFlows />
        <StudioFundLog />

        <div className={s.apply}>
          <div>
            <h2>
              Need it? <em>Ask.</em>
            </h2>
            <p>
              If you're a member having a hard month, the emergency strand is a
              short form and a fast yes —{" "}
              <em>no portfolio, no means test, no shame</em>. Transcribers and
              translators are paid per accepted piece; grants open each quarter.
            </p>
          </div>
          <div className={s.acts}>
            <button
              type="button"
              className={`${s.bt} ${s.btJade} ${s.btLg}`}
              onClick={() =>
                showToast(
                  "Emergency support form opens in a private flow",
                  "info",
                )
              }
            >
              Request emergency support
            </button>
            <Link to={routes.studioCalls} className={`${s.bt} ${s.btLg}`}>
              See open grants &amp; calls →
            </Link>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
