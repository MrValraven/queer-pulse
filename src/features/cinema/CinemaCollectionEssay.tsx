import { Button } from "../../shared/components/ui";
import type { CollectionDetail } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

/** Curator essay column + a "Collection details" sidebar card with actions. */
export function CinemaCollectionEssay({ data }: { data: CollectionDetail }) {
  return (
    <section className={styles.essay}>
      <div className={`wrap ${styles.essayInner}`}>
        <div>
          <p className={styles.intro}>{data.essayIntro}</p>
          <div className={styles.body}>
            {data.essayBody.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <aside className={styles.detailsCard}>
          <div className={styles.detailsHead}>Collection details</div>
          {data.details.map((row) => (
            <div key={row.k} className={styles.detailsRow}>
              <span className={styles.detailsK}>{row.k}</span>
              <span className={styles.detailsV}>{row.v}</span>
            </div>
          ))}
          <p className={styles.detailsNote}>{data.detailsNote}</p>
          <div className={styles.detailsActions}>
            <Button to={routes.cinemaWatch} className={styles.wideBtn}>
              Start watching
            </Button>
            <Button variant="ghost" className={styles.wideBtn}>
              + Save collection
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
