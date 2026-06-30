import { useMemo } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./studioError.module.css";

const WAVE_COUNT = 28;
const GAP_START = 12;
const GAP_END = 15;

function buildWaveBars(): { height: number; opacity: number }[] {
  return Array.from({ length: WAVE_COUNT }, (_, i) => {
    const inGap = i > GAP_START && i < GAP_END;
    return {
      height: inGap ? 2 : Math.round(6 + Math.random() * 30),
      opacity: inGap ? 0.2 : 0.55,
    };
  });
}

export function Studio500Page() {
  const bars = useMemo(() => buildWaveBars(), []);

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

      <div className={`${styles.err} ${styles.errOrbLeft}`}>
        <div className={styles.errNum} aria-hidden>
          500
        </div>

        <div className={styles.errContent}>
          <div className={styles.errEyebrow}>Something dropped out</div>
          <h1>
            We lost the <em>recording.</em>
          </h1>
          <p className={styles.sub}>
            A server on our side stumbled mid-take. Your account, your saves,
            and every artist's payout are safe — this is just the front of
            house. Give it a second and try again.
          </p>

          <div className={styles.deadairWave} aria-hidden>
            {bars.map((bar, i) => (
              <span
                key={i}
                style={{ height: bar.height, opacity: bar.opacity }}
              />
            ))}
          </div>

          <div className={styles.errActions}>
            <button
              type="button"
              className={styles.btPrimary}
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <Link to={routes.studioE} className={styles.btGhost}>
              Back to the player
            </Link>
          </div>

          <div className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden />
            All payouts and banking unaffected ·{" "}
            <a href="https://status.queerpulse.org">status.queerpulse.org</a>
          </div>
          <div className={styles.errRef}>
            ref: QP-STUDIO-500 · 2026-06-10T03:14Z · the council has been pinged
          </div>
        </div>
      </div>
    </div>
  );
}
