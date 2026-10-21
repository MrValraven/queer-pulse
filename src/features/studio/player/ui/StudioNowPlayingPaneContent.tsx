import { Fragment } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioAccess } from "../../api/useStudioAccess";
import { useStudioTrack } from "../../api/useStudioTrack";
import { StudioLyricShareHost } from "../../share/StudioLyricShareHost";
import { StudioWarnedContent } from "../../StudioWarnedContent";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { studioSeekAndResume } from "../studioSeekAndResume";
import type { StudioNowPlayingTab } from "../studioPlayerSurface";
import { StudioChapterList } from "./StudioChapterList";
import { StudioQueueList } from "./StudioQueueList";
import { StudioSyncedLyrics } from "./StudioSyncedLyrics";
import styles from "./StudioNowPlaying.module.css";

/** The track's detail, for the plain lyrics and the credits. Only a public
 *  track mounts this: a private preview's detail needs its token, so a
 *  preview never asks. Loading ends with any answer, including a missing
 *  track, a failed read or a member without Studio access (whose read never
 *  starts). */
function useNowPlayingTrackDetail(trackId: string) {
  const { track, loadState } = useStudioTrack(trackId);
  const { status } = useStudioAccess();
  return { track, isLoading: loadState.isLoading && status !== "denied" };
}

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

function TrackCredits({ trackId }: { trackId: string }) {
  const { track, isLoading } = useNowPlayingTrackDetail(trackId);
  if (isLoading)
    return <EmptyNote textKey="studio:nowPlaying.creditsLoading" />;
  if (!track || track.credits.length === 0)
    return <EmptyNote textKey="studio:nowPlaying.noCredits" />;
  return (
    <dl className={styles.credits}>
      {track.credits.map((credit, index) => (
        <div
          key={`${credit.role}-${credit.name}-${index}`}
          className={styles.credit}
        >
          <dt>{credit.role}</dt>
          <dd>{credit.name}</dd>
        </div>
      ))}
    </dl>
  );
}

function CreditsPane({ item }: { item: StudioQueueItem }) {
  if (item.previewToken)
    return <EmptyNote textKey="studio:nowPlaying.noCredits" />;
  return <TrackCredits trackId={item.trackId} />;
}

function ChaptersPane({ title }: { title: string }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentChapterIndex } = useStudioPlayerClock();
  return (
    <StudioChapterList
      chapters={player.currentChapters ?? []}
      activeIndex={currentChapterIndex}
      onSelect={(chapter) => player.seek(chapter.startSeconds)}
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
  // The share sheet sits above the per-track lyrics pane, so it and a
  // half-written send stay open when playback moves to the next track.
  return (
    <StudioLyricShareHost>
      <LyricsPane item={item} isTranscript={isTranscript} />
    </StudioLyricShareHost>
  );
}
