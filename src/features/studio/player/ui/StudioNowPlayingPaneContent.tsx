import { Fragment } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioLyricShareHost } from "../../share/StudioLyricShareHost";
import { StudioWarnedContent } from "../../StudioWarnedContent";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { markExplicitStart } from "../studioEpisodePlay";
import { studioSeekAndResume } from "../studioSeekAndResume";
import type { StudioNowPlayingTab } from "../studioPlayerSurface";
import { StudioChapterList } from "./StudioChapterList";
import { StudioNowPlayingArtistPane } from "./StudioNowPlayingArtistPane";
import { StudioNowPlayingCredits } from "./StudioNowPlayingCredits";
import { StudioQueueList } from "./StudioQueueList";
import { StudioSyncedLyrics } from "./StudioSyncedLyrics";
import { useNowPlayingTrackDetail } from "./useNowPlayingTrackDetail";
import styles from "./StudioNowPlaying.module.css";

function EmptyNote({ textKey }: { textKey: string }) {
  const { t } = useTranslation();
  return <p className={styles.empty}>{t(textKey)}</p>;
}

/** The empty line names a transcript on an episode or a spoken word track. */
function noWordsKey(isTranscript: boolean): string {
  return isTranscript
    ? "studio:trackPage.noTranscript"
    : "studio:nowPlaying.noLyrics";
}

/** Plain lyrics from the track's detail; nothing shows until it answers. */
function PlainLyrics({
  trackId,
  isTranscript,
}: {
  trackId: string;
  isTranscript: boolean;
}) {
  const { track, isLoading } = useNowPlayingTrackDetail(trackId);
  if (isLoading) return null;
  if (!track || track.lyricStanzas.length === 0)
    return <EmptyNote textKey={noWordsKey(isTranscript)} />;
  return (
    <div className={styles.stanzas} lang="und">
      {track.lyricStanzas.map((lines, stanzaIndex) => (
        <p key={stanzaIndex}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

/** Timed lyrics when the player has them. A preview's queue item carries no
 *  lyrics of its own, so without timed lines it says there are none. */
function LyricsPaneWords({
  item,
  isTranscript,
}: {
  item: StudioQueueItem;
  isTranscript: boolean;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentLyricIndex } = useStudioPlayerClock();
  const synced = player.currentSyncedLyrics;
  if (synced && synced.length > 0)
    return (
      <StudioSyncedLyrics
        lines={synced}
        activeIndex={currentLyricIndex}
        onSeekLine={(ms) => player.seek(ms / 1000)}
        label={t("studio:player.lyrics.listLabel")}
        // A song's lines share as lyric cards (PRD-13); a private preview's
        // and a transcript's do not.
        share={
          isTranscript || item.previewToken
            ? undefined
            : {
                trackId: item.trackId,
                title: item.title,
                playFromLine: (lineStartMs) =>
                  studioSeekAndResume(player, lineStartMs / 1000),
              }
        }
      />
    );
  if (item.previewToken)
    return <EmptyNote textKey={noWordsKey(isTranscript)} />;
  return <PlainLyrics trackId={item.trackId} isTranscript={isTranscript} />;
}

/** A warned track's words stay covered here as on its page (spec 6.2),
 *  also while the player waits on its warning. Keyed by the track, so the
 *  next track starts covered. */
function LyricsPane({
  item,
  isTranscript,
}: {
  item: StudioQueueItem;
  isTranscript: boolean;
}) {
  return (
    <StudioWarnedContent
      key={item.trackId}
      trackId={item.trackId}
      warnings={item.contentWarnings}
    >
      <LyricsPaneWords item={item} isTranscript={isTranscript} />
    </StudioWarnedContent>
  );
}

function CreditsPane({ item }: { item: StudioQueueItem }) {
  if (item.previewToken)
    return <EmptyNote textKey="studio:nowPlaying.noCredits" />;
  return <StudioNowPlayingCredits trackId={item.trackId} />;
}

function ChaptersPane({ title }: { title: string }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentChapterIndex } = useStudioPlayerClock();
  return (
    <StudioChapterList
      chapters={player.currentChapters ?? []}
      activeIndex={currentChapterIndex}
      onSelect={(chapter) => {
        // A chapter names where to start (0:00 included): it also wins over
        // a saved place still waiting to resume.
        markExplicitStart(player.currentItem?.queueEntryId ?? null);
        player.seek(chapter.startSeconds);
      }}
      label={t("studio:chapters.listLabel", { title })}
    />
  );
}

/** One Now playing pane, shared by the desktop tabs and the phone stack. */
export function StudioNowPlayingPaneContent({
  tab,
  item,
  isTranscript = false,
}: {
  tab: StudioNowPlayingTab;
  item: StudioQueueItem;
  /** An episode or a spoken word track: its words are a transcript. */
  isTranscript?: boolean;
}) {
  if (tab === "queue") return <StudioQueueList headingLevel={3} isInDialog />;
  if (tab === "credits") return <CreditsPane item={item} />;
  if (tab === "chapters") return <ChaptersPane title={item.title} />;
  if (tab === "artist") return <StudioNowPlayingArtistPane item={item} />;
  // The share sheet sits above the per-track lyrics pane, so it and a
  // half-written send stay open when playback moves to the next track.
  return (
    <StudioLyricShareHost>
      <LyricsPane item={item} isTranscript={isTranscript} />
    </StudioLyricShareHost>
  );
}
