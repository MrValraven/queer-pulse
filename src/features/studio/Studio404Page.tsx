import { useNavigate, Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./studioError.module.css";

const FLAT_DOTS = 18;

export function Studio404Page() {
  const navigate = useNavigate();
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
          <Translation
            i18nKey="studio:brand.lockup"
            components={{ em: <em /> }}
          />
        </span>
        <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
      </Link>

      <div className={`${styles.err} ${styles.errOrbRight}`}>
        <div className={styles.errNum} aria-hidden>
          404
        </div>

        <div className={styles.errContent}>
          <div className={styles.errEyebrow}>
            {t("studio:error404.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:error404.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("studio:error404.body")}</p>

          <div className={styles.deadairFlat} aria-hidden>
            {Array.from({ length: FLAT_DOTS }, (_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className={styles.errActions}>
            <Link to={routes.studioE} className={styles.btPrimary}>
              {t("studio:error404.backCta")}
            </Link>
            <button
              type="button"
              className={styles.btGhost}
              onClick={() => navigate(-1)}
            >
              ← {t("studio:error404.goBackCta")}
            </button>
          </div>

          <div className={styles.errLinksTitle}>
            {t("studio:error404.tryInsteadTitle")}
          </div>
          <div className={styles.errGrid}>
            <Link to={routes.studioLive} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                <Translation
                  i18nKey="studio:error404.link.set.label"
                  components={{ em: <em /> }}
                />
              </span>
              <span className={styles.errLinkSub}>
                {t("studio:error404.link.set.sub")}
              </span>
            </Link>
            <Link to={routes.studioSearch} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                <Translation
                  i18nKey="studio:error404.link.search.label"
                  components={{ em: <em /> }}
                />
              </span>
              <span className={styles.errLinkSub}>
                {t("studio:error404.link.search.sub")}
              </span>
            </Link>
            <Link to={routes.studioLibrary} className={styles.errLink}>
              <span className={styles.errLinkLabel}>
                <Translation
                  i18nKey="studio:error404.link.library.label"
                  components={{ em: <em /> }}
                />
              </span>
              <span className={styles.errLinkSub}>
                {t("studio:error404.link.library.sub")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
