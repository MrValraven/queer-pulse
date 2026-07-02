import { Link } from "react-router-dom";
import { FACTS } from "./filmPage.data";
import { FilmHeroPoster } from "./FilmHeroPoster";
import { FilmHeroWatch } from "./FilmHeroWatch";
import styles from "./FilmPage.module.css";
import { routes } from "../../app/routeMap";

export function FilmHero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <FilmHeroPoster />

        <div>
          <div className={styles.kicker}>
            <span>Cover film · week 23</span>
            <span className={styles.dot} />
            <span className={styles.by}>Programmed by João Ribeiro</span>
          </div>
          <h1 className={styles.title}>
            The light <em>between</em> rooms
          </h1>
          <div className={styles.meta}>
            Maria Vasconcelos · Portugal, 2025 · 92 min · documentary
          </div>

          <div className={styles.curatorPull}>
            <div className={styles.cpAv}>JR</div>
            <div className={styles.cpText}>
              “A patient, generous film about Lisbon's working-class queer
              elders, made over three years in the kitchens that raised them.{" "}
              <em>Stay for the second hour</em> — it's where the film stops
              being about loss and starts being about teaching.”
              <span className="who">— João Ribeiro · programming lead</span>
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
            <Link to={routes.rsvp}>RSVP →</Link>
          </div>

          <div className={styles.facts}>
            {FACTS.map((f) => (
              <div key={f.k} className={styles.fact}>
                <div className="k">{f.k}</div>
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
