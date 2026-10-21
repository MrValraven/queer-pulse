import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  StudioChapterView,
  StudioTrackView,
} from "../../api/studio.adapters";
import { useStudioHideExplicit } from "../../api/useStudioPlaybackPreferences";
import { markExplicitStart } from "../studioEpisodePlay";
import { useStudioPlayer, useStudioPlayerClock } from "../studioPlayerContext";
import { StudioChapterList } from "./StudioChapterList";
import styles from "./StudioChapterList.module.css";

/** A track's chapters as a "Tracklist" section; nothing without chapters.
 *  `heading` lets the release page name the track when a mix has several. */
export function StudioTrackChapters({
  track,
  heading,
  isHeadingHidden = false,
  headingLevel = 3,
}: {
  track: Pick<
    StudioTrackView,
    "id" | "title" | "releaseId" | "chapters" | "isExplicit" | "hasAudio"
  >;
  heading?: string;
  /** Keeps the heading for screen readers when a tab already names the section. */
  isHeadingHidden?: boolean;
  /** 2 on the track page, where the section sits straight under the h1. */
  headingLevel?: 2 | 3;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentChapterIndex } = useStudioPlayerClock();
  const hideExplicit = useStudioHideExplicit();
  // Spec 7: a hidden explicit track, or one without audio, starts nowhere.
  const isPlayBlocked = !track.hasAudio || (hideExplicit && track.isExplicit);
  if (!track.chapters || track.chapters.length === 0) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const isCurrent = player.isCurrentTrack(track.id);
  // A chapter names where to start (0:00 included): on the loaded track it
  // also wins over a saved place still waiting to resume.
  const select = (chapter: StudioChapterView) => {
    if (isCurrent) {
      markExplicitStart(player.currentItem?.queueEntryId ?? null);
      player.seek(chapter.startSeconds);
    } else if (!isPlayBlocked)
      void player.playRelease(track.releaseId, track.id, chapter.startSeconds);
  };
  return (
    <section className={styles.section}>
      <Heading
        className={
          isHeadingHidden ? `${styles.heading} visuallyHidden` : styles.heading
        }
      >
        {heading ?? t("studio:chapters.listHeading")}
      </Heading>
      <StudioChapterList
        chapters={track.chapters}
        activeIndex={isCurrent ? currentChapterIndex : null}
        onSelect={select}
        label={t("studio:chapters.listLabel", { title: track.title })}
      />
    </section>
  );
}
