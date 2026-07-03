import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import type { CollectionDetail } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

/** Sticky rail: sign-in progress card + related collections. */
export function CinemaCollectionAside({ data }: { data: CollectionDetail }) {
  return (
    <aside className={styles.aside}>
      <div className={styles.asideCard}>
        <div className={styles.asideHead}>Your progress</div>
        <div className={styles.progHint}>Sign in to track where you are</div>
        <div className={styles.prog}>
          <div className={styles.progFill} />
        </div>
        <div className={styles.progNote}>{data.progressNote}</div>
        <Button
          to={routes.signIn}
          className={styles.wideBtn}
          style={{ marginTop: 14 }}
        >
          Sign in to track progress
        </Button>
      </div>

      <div className={styles.asideCard}>
        <div className={styles.asideHead}>Related collections</div>
        <div className={styles.related}>
          {data.related.map((rc) => (
            <Link
              key={rc.slug}
              to={`${routes.cinemaCollections}/${rc.slug}`}
              className={styles.rc}
            >
              <div className={styles.rcAv} aria-hidden>
                {rc.av}
              </div>
              <div>
                <div className={styles.rcTitle}>
                  {rc.titlePre}
                  {rc.titleEm && <em>{rc.titleEm}</em>}
                  {rc.titlePost}
                </div>
                <div className={styles.rcBy}>{rc.by}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
