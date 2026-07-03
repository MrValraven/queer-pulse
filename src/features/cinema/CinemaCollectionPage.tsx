import { Link, useParams } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { CinemaShell } from "./CinemaShell";
import { CinemaCollectionHeader } from "./CinemaCollectionHeader";
import { CinemaCollectionEssay } from "./CinemaCollectionEssay";
import { CinemaCollectionFilms } from "./CinemaCollectionFilms";
import { CinemaCollectionAside } from "./CinemaCollectionAside";
import { collectionDetails } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

export function CinemaCollectionPage() {
  const { slug = "" } = useParams();
  const data = collectionDetails[slug];

  if (!data) {
    return (
      <CinemaShell>
        <section className={styles.notFound}>
          <div className="wrap">
            <div className="eb">Collection not found</div>
            <h1>
              We couldn't find <em>that collection</em>
            </h1>
            <p>
              It may have been renamed or retired. Browse the full catalogue to
              find where the films went.
            </p>
            <Button to={routes.cinemaBrowse}>Browse all films</Button>
          </div>
        </section>
      </CinemaShell>
    );
  }

  return (
    <CinemaShell>
      <CinemaCollectionHeader data={data} />
      <CinemaCollectionEssay data={data} />

      <section className={styles.bodySection}>
        <div className="wrap">
          <div className={styles.bodyInner}>
            <CinemaCollectionFilms data={data} />
            <CinemaCollectionAside data={data} />
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <div className={styles.outroInner}>
            <h2>
              A cinema that <em>argues</em>.
            </h2>
            <p className={styles.outroSub}>
              Collections are curators' arguments. Sustainers fund the next
              ones.
            </p>
            <Button to={routes.cinemaMembership} size="lg">
              Sustain the cinema
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.backRow}>
        <div className="wrap">
          <Link to={routes.cinema} className={styles.back}>
            ← Back to Cinema
          </Link>
        </div>
      </div>
    </CinemaShell>
  );
}
