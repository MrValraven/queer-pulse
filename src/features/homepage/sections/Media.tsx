import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import styles from "./Media.module.css";

const FilmIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x={2} y={4} width={20} height={16} rx={2.5} />
    <path d="M2 9h20M7 4v5M12 4v5M17 4v5" />
    <path d="M10 13l5 3-5 3z" fill="currentColor" stroke="none" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 18V5l11-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={17} cy={16} r={3} />
  </svg>
);

export function Media() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} id="media">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="homepage:media.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:media.subtitle")}
          />
        </Reveal>

        <Reveal className={styles.grid}>
          <Link
            to={routes.cinema}
            className={[styles.card, styles.cardFilm].join(" ")}
          >
            <span className={[styles.icon, styles.iconFilm].join(" ")}>
              <FilmIcon />
            </span>
            <div className={styles.eyebrow}>
              {t("homepage:media.cinema.eyebrow")}
            </div>
            <h3 className={styles.title}>
              <Translation
                i18nKey="homepage:media.cinema.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p className={styles.desc}>{t("homepage:media.cinema.desc")}</p>
            <div className={styles.chips}>
              <span className={styles.chip}>
                {t("homepage:media.cinema.chip.stream")}
              </span>
              <span className={styles.chip}>
                {t("homepage:media.cinema.chip.screenings")}
              </span>
              <span className={styles.chip}>
                {t("homepage:media.cinema.chip.submit")}
              </span>
            </div>
            <span className={styles.cta}>{t("homepage:media.cinema.cta")}</span>
          </Link>

          <Link
            to={routes.studio}
            className={[styles.card, styles.cardMusic].join(" ")}
          >
            <span className={[styles.icon, styles.iconMusic].join(" ")}>
              <MusicIcon />
            </span>
            <div className={styles.eyebrow}>
              {t("homepage:media.studio.eyebrow")}
            </div>
            <h3 className={styles.title}>
              <Translation
                i18nKey="homepage:media.studio.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p className={styles.desc}>{t("homepage:media.studio.desc")}</p>
            <div className={styles.chips}>
              <span className={styles.chip}>
                {t("homepage:media.studio.chip.listen")}
              </span>
              <span className={styles.chip}>
                {t("homepage:media.studio.chip.release")}
              </span>
              <span className={styles.chip}>
                {t("homepage:media.studio.chip.liveSessions")}
              </span>
            </div>
            <span className={styles.cta}>{t("homepage:media.studio.cta")}</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
