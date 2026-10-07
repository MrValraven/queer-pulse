import { FiFilm, FiInstagram, FiPlay, FiWind } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FilmFrame } from "./FilmFrame";
import { formatClock } from "./filmTime";
import {
  filmUrl,
  type FilmFormatId,
  type MarketingVideo,
} from "./marketingVideos.data";
import styles from "./MarketingVideos.module.css";

/**
 * One film: a still from it, what it is, and what you can do with it. A film
 * with one shape has one render button; a film with several has one per
 * shape. The still is always the 16:9 cut.
 */
export function MarketingVideoCard({
  video,
  onPreview,
  onRender,
}: {
  video: MarketingVideo;
  onPreview: (video: MarketingVideo) => void;
  onRender: (video: MarketingVideo, format: FilmFormatId) => void;
}) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.films.${video.id}.title`);
  const headingId = `marketing-video-${video.id}`;
  const [defaultFormat = "landscape"] = video.formats;
  const hasSeveralFormats = video.formats.length > 1;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.cardFrame}>
        <FilmFrame
          src={filmUrl(video.id, { seconds: video.posterSeconds })}
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
            resolution: t(
              `admin:marketingVideos.format.${defaultFormat}.resolution`,
            ),
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
          {video.formats.map((format) => (
            <Button
              key={format}
              size="sm"
              onClick={() => onRender(video, format)}
            >
              {format === "portrait" ? (
                <FiInstagram aria-hidden />
              ) : (
                <FiFilm aria-hidden />
              )}
              {hasSeveralFormats
                ? t(`admin:marketingVideos.card.renderFormat.${format}`)
                : t("admin:marketingVideos.card.render")}
            </Button>
          ))}
        </div>
      </div>
    </article>
  );
}
