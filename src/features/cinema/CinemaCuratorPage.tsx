import { Link, useParams } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { CURATORS } from "./cinemaCurator.data";
import { CuratorHero } from "./CuratorHero";
import { CuratorMain } from "./CuratorMain";
import { CuratorAside } from "./CuratorAside";
import { CinemaCuratorSkeleton } from "./CinemaCuratorSkeleton";
import styles from "./CinemaCuratorPage.module.css";

export function CinemaCuratorPage() {
  const { slug = "" } = useParams();
  const curator = CURATORS[slug];
  const loading = useSimulatedLoad();

  if (!curator) {
    return (
      <PageShell>
        <div className={styles.body}>
          <EmptyState
            icon={<FiFilm />}
            title="Curator not found"
            description="This curator page doesn't exist or has moved. Meet the council on the cinema's About page."
            action={{ label: "Back to the cinema", to: routes.cinema }}
          />
        </div>
      </PageShell>
    );
  }

  const name = `${curator.namePre}${curator.nameEm}`;

  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>Cinema</Link>
            <span className={styles.sep}>›</span>
            <Link to={routes.cinemaAbout}>Council</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>{name}</span>
            <Link to={routes.cinemaAbout} className={styles.crumbBack}>
              ← Back to the council
            </Link>
          </div>
        </div>
      </section>

      <CuratorHero curator={curator} />

      {loading ? (
        <CinemaCuratorSkeleton />
      ) : (
        <section className={styles.body}>
          <div className={`wrap ${styles.bodyGrid}`}>
            <FadeIn>
              <CuratorMain curator={curator} />
            </FadeIn>
            <FadeIn delay={120}>
              <CuratorAside curator={curator} />
            </FadeIn>
          </div>
        </section>
      )}

      <Outro
        title={
          <>
            Programming is <em>authorship</em>.
          </>
        }
        sub={curator.outroSub}
      >
        <Button size="lg" to={curator.leadCollectionTo}>
          Open the collection →
        </Button>
      </Outro>
    </PageShell>
  );
}
