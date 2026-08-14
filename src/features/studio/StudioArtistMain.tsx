import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { RELEASES, SINGLES, type ArtistTabId } from "./studioArtist.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

const tagClass = { free: styles.tagFree, mem: styles.tagMem };

export function StudioArtistMain({ tab }: { tab: ArtistTabId }) {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();

  if (tab === "about") {
    return (
      <div className={styles.prose}>
        <p>
          Mariana Sol writes letters set to a piano so patient it sometimes
          forgets to play. Born in Beja, based in Sintra. Her work moves between
          fado's grammar and something quieter, the song you hum doing the
          dishes.
        </p>
        <p>
          She has released everything she's made through QueerPulse Studio since
          2022, <em>on the same 80% split as every other artist here.</em> She
          mentors two younger composers through the solidarity fund.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.rowH} style={{ marginBottom: 14 }}>
        <h2>{t("studio:artist.main.releasesHeading")}</h2>
      </div>
      {loading ? (
        <StudioCardGridSkeleton
          className={styles.rowGrid}
          count={3}
          style={{ gridTemplateColumns: "repeat(3,1fr)" }}
        />
      ) : (
        <div
          className={styles.rowGrid}
          style={{ gridTemplateColumns: "repeat(3,1fr)" }}
        >
          {RELEASES.map((r, i) => (
            <FadeIn
              key={r.pre}
              delay={Math.min(i, 8) * 60}
              as={Link}
              to={r.to}
              className={styles.card}
            >
              <div className={styles.cardCov}>
                <ImageSlot
                  src={r.image}
                  tint={r.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder="cv"
                  style={{ position: "absolute", inset: 0 }}
                />
                <span className={`${styles.tag} ${styles.tagMem}`}>
                  {t("studio:tag.sustainer")}
                </span>
              </div>
              <h4>
                {r.pre}
                {r.em && <em>{r.em}</em>}
              </h4>
              <div className={styles.meta}>{r.meta}</div>
              <div className={styles.payLine}>
                <span>{r.buy}</span>
                <em>{r.split}</em>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <div className={styles.rowH} style={{ margin: "32px 0 14px" }}>
        <h2>
          <Translation
            i18nKey="studio:artist.main.singlesHeading"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      {loading ? (
        <StudioCardGridSkeleton
          className={styles.rowGrid}
          count={5}
          style={{ gridTemplateColumns: "repeat(5,1fr)" }}
        />
      ) : (
        <div
          className={styles.rowGrid}
          style={{ gridTemplateColumns: "repeat(5,1fr)" }}
        >
          {SINGLES.map((s, i) => (
            <FadeIn
              key={s.pre}
              delay={Math.min(i, 8) * 60}
              as={Link}
              to={routes.studioAlbum}
              className={styles.card}
            >
              <div className={styles.cardCov}>
                <ImageSlot
                  src={s.image}
                  tint={s.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder="cv"
                  style={{ position: "absolute", inset: 0 }}
                />
                <span className={`${styles.tag} ${tagClass[s.tag]}`}>
                  {s.tag === "mem"
                    ? t("studio:tag.sustainer")
                    : t("studio:tag.free")}
                </span>
              </div>
              <h4>
                {s.pre}
                {s.em && <em>{s.em}</em>}
              </h4>
              <div className={styles.meta}>{s.meta}</div>
            </FadeIn>
          ))}
        </div>
      )}
    </>
  );
}
