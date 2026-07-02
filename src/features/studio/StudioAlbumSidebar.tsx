import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

export function StudioAlbumSidebar({ onTip }: { onTip: () => void }) {
  return (
    <div className={styles.sideCol}>
      <div className={styles.buyCard}>
        <div className={styles.eb}>The room is open to you</div>
        <div className={styles.price}>
          €<em>8</em>
        </div>
        <div className={styles.sub}>
          Buy the album · keep it offline · FLAC + AAC.
        </div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP}`}
          >
            Buy · €8
          </Link>
          <button type="button" className={styles.bt} onClick={onTip}>
            Pay what you can · €1 min
          </button>
          <Link to={routes.cinemaMembership} className={styles.bt}>
            Streaming included with Sustain
          </Link>
        </div>
        <div className={styles.splitHint}>
          If you buy at €8 — <em>€6.40 to Mariana</em>, €0.80 to the solidarity
          fund, €0.80 to the platform, processing absorbed.
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>
          Public ledger for <em>this release</em>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Paid to Mariana, lifetime</span>
          <span className={styles.v}>
            €<em>8,940</em>
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Paid to collaborators</span>
          <span className={styles.v}>
            €<em>1,420</em>
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Plays this month</span>
          <span className={styles.v}>42,840</span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          Full ledger →
        </Link>
      </div>
    </div>
  );
}
