import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

export function StudioArtistSidebar({ onTip }: { onTip: () => void }) {
  return (
    <div className={styles.sideCol}>
      <div className={styles.buyCard}>
        <div className={styles.eb}>Sustain Mariana directly</div>
        <div className={styles.price}>
          €<em>3</em>
          <span style={{ fontSize: 14, color: "var(--text40)" }}>/month</span>
        </div>
        <div className={styles.sub}>
          Direct to Mariana. No platform cut. Subscribers get early-access
          tracks, the weekly note, and seats at every live broadcast.
        </div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP}`}
          >
            Subscribe · €3/mo
          </Link>
          <button type="button" className={styles.bt} onClick={onTip}>
            One-off tip
          </button>
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>Mariana · this month</div>
        <div className={styles.lrow}>
          <span className={styles.k}>Plays</span>
          <span className={styles.v}>
            36,<em>400</em>
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Earnings (streaming)</span>
          <span className={styles.v}>
            €<em>1,820</em>
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Tips received</span>
          <span className={styles.v}>
            €<em>448</em>
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Direct subscribers</span>
          <span className={styles.v}>
            €<em>612</em>
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          Full ledger →
        </Link>
      </div>

      <div className={styles.sideCard}>
        <div className={styles.eb}>Upcoming</div>
        <div className={styles.lrow} style={{ marginTop: 10 }}>
          <span className={styles.k}>
            Premiere ·{" "}
            <em style={{ color: "var(--text)", fontStyle: "italic" }}>
              Cidade dos santos
            </em>
            <br />
            10 Jun · 21:00 Lisbon
          </span>
          <Link
            to={routes.rsvp}
            className={styles.cta}
            style={{ marginTop: 0 }}
          >
            RSVP
          </Link>
        </div>
      </div>
    </div>
  );
}
