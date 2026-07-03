import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { CollectionDetail } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";
import { curatorSlugForName } from "./cinemaCurator.data";

/** Plum collection header: breadcrumb, live tag, serif title, stats, curators. */
export function CinemaCollectionHeader({ data }: { data: CollectionDetail }) {
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.headerInner}`}>
        <div className={styles.crumb}>
          <Link to={routes.cinema}>Cinema</Link>
          <span className={styles.sep} aria-hidden>
            ›
          </span>
          <Link to={routes.cinemaBrowse}>Collections</Link>
          <span className={styles.sep} aria-hidden>
            ›
          </span>
          <span className={styles.cur}>{data.crumbTitle}</span>
        </div>

        <div className={styles.tag}>
          <span className={styles.live} aria-hidden />
          {data.tagLine}
        </div>

        <h1 className={styles.title}>
          {data.titlePre}
          {data.titleEm && <em>{data.titleEm}</em>}
          {data.titlePost}
        </h1>

        <div className={styles.metaRow}>
          {data.stats.map((stat, i) => (
            <Fragment key={stat.k}>
              {i > 0 && <span className={styles.statSep} aria-hidden />}
              <div className={styles.stat}>
                <div className={styles.statK}>{stat.k}</div>
                <div className={styles.statV}>{stat.v}</div>
              </div>
            </Fragment>
          ))}

          <div className={styles.curators}>
            {data.curators.map((c) => (
              <div key={c.name} className={styles.cur2}>
                <div className={styles.curAv} aria-hidden>
                  {c.initials}
                </div>
                <div>
                  <div className={styles.curName}>
                    {(() => {
                      const slug = curatorSlugForName(c.name);
                      return slug ? (
                        <Link to={`${routes.cinemaCurator}/${slug}`}>
                          {c.name}
                        </Link>
                      ) : (
                        c.name
                      );
                    })()}
                  </div>
                  <div className={styles.curRole}>{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
