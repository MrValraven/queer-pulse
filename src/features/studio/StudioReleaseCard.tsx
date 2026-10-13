import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/**
 * One release on a grid. The cover is a link kept out of the tab order (the
 * title link is the one a keyboard or screen reader meets), and the play
 * button is its sibling, so no interactive element sits inside a link.
 */
export function StudioReleaseCard({
  release,
  meta,
  tag,
}: {
  release: StudioReleaseCardView;
  meta?: ReactNode;
  tag?: ReactNode;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";

  return (
    <article className={styles.card}>
      <div className={kit.coverArea}>
        <Link
          to={release.href}
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
            {tag}
          </div>
        </Link>
        <button
          type="button"
          className={`${styles.playFab} ${kit.cardPlay}`}
          data-current={isCurrent || undefined}
          aria-label={
            isPlaying
              ? t("studio:card.pauseRelease", { title: release.title })
              : t("studio:card.playRelease", { title: release.title })
          }
          onClick={() => {
            if (isCurrent) player.togglePlay();
            else void player.playRelease(release.id);
          }}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
      </div>
      <h4>
        <Link to={release.href} className={kit.titleLink}>
          {release.title}
        </Link>
      </h4>
      <div className={styles.meta}>
        {meta ??
          [release.artist.name, release.releaseYear]
            .filter(Boolean)
            .join(" · ")}
      </div>
    </article>
  );
}
