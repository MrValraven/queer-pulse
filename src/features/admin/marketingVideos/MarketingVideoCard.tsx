import { FiFilm, FiPlay, FiWind } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FilmFrame } from "./FilmFrame";
import { formatClock } from "./filmTime";
import { filmUrl, type MarketingVideo } from "./marketingVideos.data";
import styles from "./MarketingVideos.module.css";

/** One film: a still from it, what it is, and the two things you can do. */
export function MarketingVideoCard({
  video,
  onPreview,
  onRender,
}: {
  video: MarketingVideo;
  onPreview: (video: MarketingVideo) => void;
  onRender: (video: MarketingVideo) => void;
}) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.films.${video.id}.title`);
  const headingId = `marketing-video-${video.id}`;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.cardFrame}>
        <FilmFrame
          src={filmUrl(video.id, video.posterSeconds)}
          title={t("admin:marketingVideos.card.frameTitle", { title })}
        />
      </div>
      <div className={styles.cardBody}>
        <h2 id={headingId} className={styles.cardTitle}>
          {title}
        </h2>
        <p className={styles.cardMeta}>
          {t("admin:marketingVideos.card.meta", {
            duration: formatClock(video.durationSeconds),
          })}
        </p>
        <p className={styles.cardSummary}>
          {t(`admin:marketingVideos.films.${video.id}.summary`)}
        </p>
        {video.hasMotionBlur && (
          <p className={styles.cardNote}>
            <FiWind aria-hidden />
            {t("admin:marketingVideos.card.motionBlur")}
          </p>
        )}
        <div className={styles.cardActions}>
          <Button variant="ghost" size="sm" onClick={() => onPreview(video)}>
            <FiPlay aria-hidden />
            {t("admin:marketingVideos.card.preview")}
          </Button>
          <Button size="sm" onClick={() => onRender(video)}>
            <FiFilm aria-hidden />
            {t("admin:marketingVideos.card.render")}
          </Button>
        </div>
      </div>
    </article>
  );
}
