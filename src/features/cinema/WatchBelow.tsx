import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SplitTitle, PosterSlot } from "./CinemaAtoms";
import { films } from "./data";
import { NEXT_UP_STILL_BY_ID } from "./watchPage.data";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

const nextUp = films.filter((film) => film.id !== "cascais").slice(0, 3);

/** Below-the-fold "next up" rail plus the revenue-split transparency panel. */
export function WatchBelow() {
  const { t } = useTranslation();
  return (
    <section className={styles.below}>
      <div className={`wrap ${styles.belowGrid}`}>
        <div>
          <h2>
            <Translation
              i18nKey="cinema:watch.below.nextUpTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={styles.nextGrid}>
            {nextUp.map((film) => (
              <Link key={film.id} to={routes.film} className={styles.nf}>
                <div className={styles.nfPoster}>
                  <PosterSlot
                    src={NEXT_UP_STILL_BY_ID[film.id] ?? film.image}
                    tint={film.tint}
                    radius={10}
                  />
                </div>
                <div className={styles.nfTitle}>
                  <SplitTitle
                    pre={film.titlePre}
                    em={film.titleEm}
                    post={film.titlePost}
                  />
                </div>
                <div className={styles.nfMeta}>{film.meta}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.split}>
          <div className={styles.splitHead}>
            {t("cinema:watch.below.splitHeading")}
          </div>
          <div className={styles.splitBar}>
            <div className={`${styles.splitSeg} ${styles.fm}`} />
            <div className={`${styles.splitSeg} ${styles.py}`} />
            <div className={`${styles.splitSeg} ${styles.hs}`} />
          </div>
          <div className={styles.splitLegend}>
            <div>
              <span className="v">
                <em>80%</em>
              </span>
              {t("cinema:watch.below.splitLegend.filmmaker")}
            </div>
            <div>
              <span className="v">12%</span>
              {t("cinema:watch.below.splitLegend.payments")}
            </div>
            <div>
              <span className="v">8%</span>
              {t("cinema:watch.below.splitLegend.hosting")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
