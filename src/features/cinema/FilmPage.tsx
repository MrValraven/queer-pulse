import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { ImageSlot, Tag } from "../../shared/components/ui";
import { films, filmRelationReason } from "./data";
import { FilmBody } from "./FilmBody";
import { FilmHero } from "./FilmHero";
import styles from "./FilmPage.module.css";
import { routes } from "../../app/routeMap";

const related = films.filter((f) => f.id !== "cascais").slice(0, 4);

export function FilmPage() {
  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>Cinema</Link>
            <span className={styles.sep}>›</span>
            <Link to="/cinema/browse">This week</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>The light between rooms</span>
            <Link to={routes.cinema} className={styles.crumbBack}>
              ← Back to slate
            </Link>
          </div>
        </div>
      </section>

      <FilmHero />
      <FilmBody />

      <section className={styles.splitBand}>
        <div className={`wrap ${styles.splitInner}`}>
          <div>
            <div className="eb">The split</div>
            <h2>
              Eighty percent of every rent goes to <em>the filmmaker.</em>
            </h2>
            <p>
              No exceptions, no tiers, no negotiated rates. The same deal for
              the first-time maker as for the festival winner. The ledger is
              public; the deed is binding.
            </p>
          </div>
          <div className={styles.splitBar}>
            <div className={styles.sbTitle}>€3 rent · where it goes</div>
            <div className={styles.sbAmount}>
              €<em>2.40</em> to Maria
            </div>
            <div className={styles.sbBar}>
              <div className={`${styles.sbSeg} ${styles.fm}`}>
                Filmmaker 80%
              </div>
              <div className={`${styles.sbSeg} ${styles.pay}`}>12%</div>
              <div className={`${styles.sbSeg} ${styles.host}`}>8%</div>
            </div>
            <div className={styles.sbLegend}>
              <div>
                <span className="v">
                  €<em>2.40</em>
                </span>
                Filmmaker
              </div>
              <div>
                <span className="v">€0.36</span>
                Payments
              </div>
              <div>
                <span className="v">€0.24</span>
                Hosting &amp; captions
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.related}>
        <div className="wrap">
          <h2>
            More from the <em>programme</em>
          </h2>
          <div className={styles.sub}>
            Films sharing a curator, a country, or a question.
          </div>
          <div className={styles.relGrid}>
            {related.map((film) => (
              <Link key={film.id} to={routes.film} className={styles.rf}>
                <div className={styles.rfPoster}>
                  <ImageSlot
                    src={film.image}
                    tint={film.tint}
                    width="100%"
                    height="100%"
                    radius={12}
                    placeholder="poster"
                    style={{ position: "absolute", inset: 0 }}
                  />
                </div>
                <div className={styles.rfEb}>{film.format}</div>
                <div className={styles.rfTitle}>
                  {film.titlePre}
                  {film.titleEm && <em>{film.titleEm}</em>}
                  {film.titlePost}
                </div>
                <div className={styles.rfMeta}>{film.meta}</div>
                <Tag className={styles.rfReason}>
                  {filmRelationReason(film)}
                </Tag>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
