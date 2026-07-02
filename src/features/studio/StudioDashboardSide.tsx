import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import s from "./creator.module.css";

export function StudioDashboardSide() {
  return (
    <div className={s.col}>
      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            Things you can <em>do</em> from here
          </h3>
        </div>
        <div className={s.quickList}>
          <Link to={routes.studioUpload} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
            <span className={s.quickNm}>
              Upload a new release
              <small>WAV / FLAC · 3 steps · 8 minutes</small>
            </span>
            <span className={s.quickArr}>→</span>
          </Link>
          <Link to={routes.studio} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx={12} cy={12} r={9} />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <span className={s.quickNm}>
              Go live — host a listening room
              <small>Plan: Wed 10 Jun · premiere of Cidade dos santos</small>
            </span>
            <span className={s.quickArr}>→</span>
          </Link>
          <Link to={routes.studioPayouts} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span className={s.quickNm}>
              Review payouts &amp; banking
              <small>Next: €2,140 on 5 Jul · SEPA</small>
            </span>
            <span className={s.quickArr}>→</span>
          </Link>
        </div>
      </div>

      <div className={s.sideCard}>
        <div className={s.sideEb}>The deal, always</div>
        <h4>
          80% to <em>you.</em>
        </h4>
        <p>
          Every play, every tip, every buy. The split is the same for a first
          release as for a festival winner — and it's printed on the public
          ledger.
        </p>
        <ul className={s.sideList}>
          <li>
            <span>Per play</span>
            <em>€0.05</em>
          </li>
          <li>
            <span>Your share</span>
            <em>80%+</em>
          </li>
          <li>
            <span>Tips</span>
            <em>100% to you</em>
          </li>
        </ul>
      </div>
    </div>
  );
}
