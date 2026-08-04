import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { MORE } from "./studioAlbum.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

const tagClass = { free: styles.tagFree, mem: styles.tagMem };

export function StudioAlbumMore() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();

  return (
    <section className={styles.row} style={{ paddingBottom: 60 }}>
      <div className={styles.rowH}>
        <h2>
          <Translation
            i18nKey="studio:album.more.heading"
            values={{ artist: "Mariana Sol" }}
            components={{ em: <em /> }}
          />
        </h2>
        <Link to={routes.studioArtist} className={styles.all}>
          {t("studio:album.more.artistPageCta")}{" "}
          <FiArrowRight aria-hidden />
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
                  {t(m.tagLabelKey)}
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
