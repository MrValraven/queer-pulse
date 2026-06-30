import { useNavigate, Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./studioError.module.css";

const FLAT_DOTS = 18;

export function Studio404Page() {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <Link
        to={routes.studioE}
        className={styles.brand}
        aria-label="QueerPulse Studio home"
      >
        <span className={styles.pulseDot} aria-hidden />
        <span className={styles.wordmark}>
          Queer<em>Pulse</em>
        </span>
        <span className={styles.product}>Studio</span>
      </Link>

      <div className={`${styles.err} ${styles.errOrbRight}`}>
        <div className={styles.errNum} aria-hidden>
          404
        </div>

        <div className={styles.errContent}>
          <div className={styles.errEyebrow}>Track not found</div>
          <h1>
            This song <em>doesn't exist.</em>
          </h1>
          <p className={styles.sub}>
            The track, set, or page you were after was never recorded, got taken
            down by the artist, or lives behind a sign-in. No drama — the
            catalogue is large and the room is warm.
          </p>

          <div className={styles.deadairFlat} aria-hidden>
            {Array.from({ length: FLAT_DOTS }, (_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className={styles.errActions}>
            <Link to={routes.studioE} className={styles.btPrimary}>
              Back to the player
            </Link>
            <button
              type="button"
              className={styles.btGhost}
              onClick={() => navigate(-1)}
            >
              ← Go back
            </button>
          </div>

          <div className={styles.errLinksTitle}>Try one of these instead</div>
          <div className={styles.errGrid}>
            <Link to={routes.studioLive} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                This week's <em>set</em>
              </span>
              <span className={styles.errLinkSub}>
                Live, programmed Mondays
              </span>
            </Link>
            <Link to={routes.studioSearch} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                <em>Search</em> the catalogue
              </span>
              <span className={styles.errLinkSub}>
                Tracks, artists, sheet music
              </span>
            </Link>
            <Link to={routes.studioLibrary} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                Your <em>room</em>
              </span>
              <span className={styles.errLinkSub}>
                Saved, sustaining, tipped
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
