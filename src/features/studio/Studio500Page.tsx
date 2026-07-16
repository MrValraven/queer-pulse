import { useMemo } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./studioError.module.css";

const WAVE_COUNT = 28;
const GAP_START = 12;
const GAP_END = 15;

/** Mock incident reference — a technical id/timestamp, not language content. */
const INCIDENT_REF = "QP-STUDIO-500";
const INCIDENT_TIMESTAMP = "2026-06-10T03:14Z";

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
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <Link
        to={routes.studioE}
        className={styles.brand}
        aria-label={t("studio:error.brandAria")}
      >
        <span className={styles.pulseDot} aria-hidden />
        <span className={styles.wordmark}>
          <Translation i18nKey="studio:brand.lockup" components={{ em: <em /> }} />
        </span>
        <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
      </Link>

      <div className={`${styles.err} ${styles.errOrbLeft}`}>
        <div className={styles.errNum} aria-hidden>
          500
        </div>

        <div className={styles.errContent}>
          <div className={styles.errEyebrow}>{t("studio:error500.eyebrow")}</div>
          <h1>
            <Translation i18nKey="studio:error500.title" components={{ em: <em /> }} />
          </h1>
          <p className={styles.sub}>{t("studio:error500.body")}</p>

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
              {t("studio:error500.tryAgainCta")}
            </button>
            <Link to={routes.studioE} className={styles.btGhost}>
              {t("studio:error500.backCta")}
            </Link>
          </div>

          <div className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden />
            {t("studio:error500.statusPrefix")}{" "}
            <a href="https://status.queerpulse.org">status.queerpulse.org</a>
          </div>
          <div className={styles.errRef}>
            {t("studio:error500.refLine", {
              ref: INCIDENT_REF,
              timestamp: INCIDENT_TIMESTAMP,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
