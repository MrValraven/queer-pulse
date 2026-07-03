import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { FILMMAKERS } from "./cinemaFilmmaker.data";
import { FilmmakerHero } from "./FilmmakerHero";
import { FilmmakerMain } from "./FilmmakerMain";
import { FilmmakerAside } from "./FilmmakerAside";
import styles from "./CinemaFilmmakerPage.module.css";

export function CinemaFilmmakerPage() {
  const { slug = "" } = useParams();
  const filmmaker = FILMMAKERS[slug];
  const tipRef = useRef<HTMLDivElement>(null);

  if (!filmmaker) {
    return (
      <PageShell>
        <div className={styles.body}>
          <EmptyState
            icon={<FiFilm />}
            title="Filmmaker not found"
            description="This filmmaker page doesn't exist or has moved. Browse the cinema to find work by queer filmmakers across the co-op."
            action={{ label: "Back to the cinema", to: routes.cinema }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>Cinema</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>
              {filmmaker.namePre}
              {filmmaker.nameEm}
            </span>
            <Link to={routes.cinema} className={styles.crumbBack}>
              ← Back to the cinema
            </Link>
          </div>
        </div>
      </section>

      <FilmmakerHero
        filmmaker={filmmaker}
        onTip={() =>
          tipRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      />

      <section className={styles.body}>
        <div className={`wrap ${styles.bodyGrid}`}>
          <FilmmakerMain filmmaker={filmmaker} />
          <FilmmakerAside filmmaker={filmmaker} tipRef={tipRef} />
        </div>
      </section>

      <Outro
        title={
          <>
            Make something. <em>Get paid.</em>
          </>
        }
        sub="Submit your film to the cinema. The split is the same for everyone."
      >
        <Button size="lg" to={routes.studioUpload}>
          Submit your film →
        </Button>
      </Outro>
    </PageShell>
  );
}
