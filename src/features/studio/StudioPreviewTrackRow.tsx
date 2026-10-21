import { FiPause, FiPlay } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackRowView } from "./api/studio.adapters";
import {
  StudioHiddenTrackNote,
  StudioHiddenTrackNumber,
} from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";
import releaseStyles from "./StudioRelease.module.css";
import styles from "./StudioPreview.module.css";

/** One preview row. A track hidden by "Hide explicit tracks" keeps its
 *  number and offers no Play, as on the release page. */
export function StudioPreviewTrackRow({
  track,
  isCurrent,
  isPlaying,
  isHidden,
  onPlay,
}: {
  track: StudioTrackRowView;
  isCurrent: boolean;
  isPlaying: boolean;
  isHidden: boolean;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  return (
    <li
      className={[styles.track, isHidden && hiddenCss.hidden]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
    >
      {isHidden ? (
        <StudioHiddenTrackNumber position={track.position} />
      ) : (
        <Button
          variant="quiet"
          className={styles.trackPlay}
          aria-disabled={!track.hasAudio || undefined}
          aria-label={t(
            isPlaying
              ? "studio:release.pauseTrack"
              : "studio:release.playTrack",
            { title: track.title },
          )}
          onClick={() => {
            if (track.hasAudio) onPlay();
          }}
        >
          <span className={styles.trackNumber} aria-hidden>
            {track.position}
          </span>
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </Button>
      )}
      <div className={styles.trackText}>
        <span
          className={
            isHidden
              ? `${styles.trackTitle} ${styles.trackTitleHidden}`
              : styles.trackTitle
          }
        >
          {track.title}
          {track.isExplicit && (
            <abbr
              className={releaseStyles.explicit}
              title={t("studio:release.explicit")}
            >
              {t("studio:release.explicitShort")}
            </abbr>
          )}
        </span>
        <StudioTrackWarningPill warnings={track.contentWarnings} />
        {isHidden && <StudioHiddenTrackNote />}
      </div>
      <span className={styles.trackTime}>
        {track.durationLabel ?? t("studio:release.processing")}
      </span>
    </li>
  );
}
