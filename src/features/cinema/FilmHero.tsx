import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FACTS } from "./filmPage.data";
import { FilmHeroPoster } from "./FilmHeroPoster";
import { FilmHeroWatch } from "./FilmHeroWatch";
import styles from "./FilmPage.module.css";
import { routes } from "../../app/routeMap";

export function FilmHero() {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <FilmHeroPoster />

        <div>
          <div className={styles.kicker}>
            <span>{t("cinema:film.hero.coverWeek", { week: 23 })}</span>
            <span className={styles.dot} />
            <span className={styles.by}>
              {t("cinema:film.hero.programmedBy")}{" "}
              <Link to={`${routes.cinemaCurator}/joao-ribeiro`}>
                João Ribeiro
              </Link>
            </span>
          </div>
          <h1 className={styles.title}>
            The light <em>between</em> rooms
          </h1>
          <div className={styles.meta}>
            <Link to={`${routes.cinemaFilmmaker}/maria-vasconcelos`}>
              Maria Vasconcelos
            </Link>{" "}
            · Portugal, 2025 · 92 min · documentary
          </div>

          <div className={styles.curatorPull}>
            <div className={styles.cpAv}>JR</div>
            <div className={styles.cpText}>
              “A patient, generous film about Lisbon's working-class queer
              elders, made over three years in the kitchens that raised them.{" "}
              <em>Stay for the second hour</em> — it's where the film stops
              being about loss and starts being about teaching.”
              <span className="who">
                —{" "}
                <Link to={`${routes.cinemaCurator}/joao-ribeiro`}>
                  João Ribeiro
                </Link>{" "}
                · programming lead
              </span>
            </div>
          </div>

          <FilmHeroWatch />

          <div className={styles.liveStrip}>
            <span className="live" />
            <div>
              <strong>
                Live Q&amp;A with Maria · Wed 10 June, 21:00 Lisbon.
              </strong>{" "}
              Co-hosted with Casa do Comum.{" "}
              <em>Live captions in EN &amp; PT.</em>
            </div>
            <Link to={routes.rsvp}>{t("cinema:film.hero.rsvpCta")}</Link>
          </div>

          <div className={styles.facts}>
            {FACTS.map((f) => (
              <div key={f.labelKey} className={styles.fact}>
                <div className="k">{t(f.labelKey)}</div>
                <div className="v">
                  {f.ok && (
                    <span className="ok">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  {f.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
