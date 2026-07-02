import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { MORE } from "./studioAlbum.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

const tagClass = { free: styles.tagFree, mem: styles.tagMem };

export function StudioAlbumMore() {
  const loading = useSimulatedLoad();

  return (
    <section className={styles.row} style={{ paddingBottom: 60 }}>
      <div className={styles.rowH}>
        <h2>
          More from <em>Mariana Sol</em>
        </h2>
        <Link to={routes.studioArtist} className={styles.all}>
          Artist page →
        </Link>
      </div>
      {loading ? (
        <StudioCardGridSkeleton className={styles.rowGrid} count={4} />
      ) : (
        <div className={styles.rowGrid}>
          {MORE.map((m, i) => (
            <FadeIn
              key={m.pre}
              delay={Math.min(i, 8) * 60}
              as={Link}
              to={routes.studioAlbum}
              className={styles.card}
            >
              <div className={styles.cardCov}>
                <ImageSlot
                  src={m.image}
                  tint={m.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder="cv"
                  style={{ position: "absolute", inset: 0 }}
                />
                <span className={`${styles.tag} ${tagClass[m.tag]}`}>
                  {m.tagLabel}
                </span>
              </div>
              <h4>
                {m.pre}
                {m.em && <em>{m.em}</em>}
              </h4>
              <div className={styles.meta}>{m.meta}</div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
