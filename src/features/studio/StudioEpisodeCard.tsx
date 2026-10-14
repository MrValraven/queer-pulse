import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLatestEpisodeView } from "./api/studio.adapters";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioFormats.module.css";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** An episode from an earlier year names its year too. */
const DATE_FORMAT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  ...DATE_FORMAT,
  year: "numeric",
};

function publishedDateOptions(publishedAt: Date): Intl.DateTimeFormatOptions {
  const isThisYear = publishedAt.getFullYear() === new Date().getFullYear();
  return isThisYear ? DATE_FORMAT : DATE_FORMAT_WITH_YEAR;
}

/** One episode on the New episodes shelf: the show's cover, the episode
 *  title, the show name and the date. Play starts the episode alone (spec
 *  5.6). The cover link stays out of the tab order, as on release cards. */
export function StudioEpisodeCard({
  episode,
}: {
  episode: StudioLatestEpisodeView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const { track, release } = episode;
  const publishedAt = track.publishedAt ? new Date(track.publishedAt) : null;
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  return (
    <article className={styles.card}>
      <div className={kit.coverArea}>
        <Link
          to={track.href}
          className={kit.coverLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className={styles.cardCov}>
            <ImageSlot
              src={release.coverUrl ?? undefined}
              tint={release.tint}
              width="100%"
              height="100%"
              radius={10}
              placeholder={t("studio:media.coverLabel")}
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
        </Link>
        <button
          type="button"
          className={`${styles.playFab} ${kit.cardPlay}`}
          data-current={isCurrent || undefined}
          aria-label={t(
            isPlaying
              ? "studio:episodeCard.pauseAria"
              : "studio:episodeCard.playAria",
            { title: track.title },
          )}
          onClick={() => {
            if (isCurrent) player.togglePlay();
            else
              void playEpisode(
                player,
                queueItemFromEpisode(track, release),
                showQueueSource(release),
              );
          }}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
      </div>
      <h4>
        <Link to={track.href} className={kit.titleLink}>
          {track.title}
        </Link>
      </h4>
      <div className={`${styles.meta} ${css.shelfMeta}`}>
        <Link to={release.href} className={kit.titleLink}>
          {release.title}
        </Link>
        {publishedAt && <span aria-hidden="true">·</span>}
        {publishedAt && (
          <span>
            {formatters.date(publishedAt, publishedDateOptions(publishedAt))}
          </span>
        )}
      </div>
    </article>
  );
}
