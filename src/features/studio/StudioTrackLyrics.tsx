import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isTranscriptFormat,
  type StudioSyncedLyricView,
  type StudioTrackView,
} from "./api/studio.adapters";
import {
  useStudioPlayer,
  useStudioPlayerClock,
} from "./player/studioPlayerContext";
import { StudioSyncedLyrics } from "./player/ui/StudioSyncedLyrics";
import { studioSeekAndResume } from "./player/studioSeekAndResume";
import { StudioLyricShareHost } from "./share/StudioLyricShareHost";
import { StudioWarnedContent } from "./StudioWarnedContent";
import { useStudioShowcase } from "./useStudioShowcase";
import trackStyles from "./track.module.css";

/** The clock lives here so only this list re-renders as the track plays.
 *  The list scrolls with the page here, so it follows the part on screen. */
function CurrentSyncedLyrics({
  lines,
  shareTrack,
}: {
  lines: readonly StudioSyncedLyricView[];
  /** A song's track: its lines share as lyric cards (PRD-13). */
  shareTrack?: { trackId: string; title: string };
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { currentLyricIndex } = useStudioPlayerClock();
  const share = shareTrack && {
    ...shareTrack,
    playFromLine: (lineStartMs: number) =>
      studioSeekAndResume(player, lineStartMs / 1000),
  };
  return (
    <StudioSyncedLyrics
      lines={lines}
      activeIndex={currentLyricIndex}
      onSeekLine={(ms) => player.seek(ms / 1000)}
      label={t("studio:player.lyrics.listLabel")}
      isInPageFlow
      share={share}
    />
  );
}

export function StudioTrackLyrics({ track }: { track: StudioTrackView }) {
  const isTranscript = isTranscriptFormat(track.release.format);
  const { t } = useTranslation();
  // The demo's lead sheet link belongs to a song.
  const isLeadSheetShown =
    useStudioShowcase() && track.release.format === "music";
  const player = useStudioPlayer();
  // Timed lines show while this track is the one playing (spec 7.5).
  const syncedLines = player.isCurrentTrack(track.id)
    ? player.currentSyncedLyrics
    : null;
  return (
    // The share sheet lives above the timed lines, which unmount when
    // playback moves to another track, so a half-written send stays open.
    <StudioLyricShareHost>
      <div className={trackStyles.lyrCard}>
        <div className={trackStyles.lyrH}>
          <h2>
            {t(
              isTranscript
                ? "studio:trackPage.transcriptHeading"
                : "studio:trackPage.lyricsHeading",
            )}
          </h2>
        </div>
        {/* Keyed by the track, so another track's page starts covered. */}
        <StudioWarnedContent
          key={track.id}
          trackId={track.id}
          warnings={track.contentWarnings}
        >
          {syncedLines && syncedLines.length > 0 ? (
            <CurrentSyncedLyrics
              lines={syncedLines}
              // A song's lines can be shared as lyric cards (PRD-13).
              shareTrack={
                isTranscript
                  ? undefined
                  : { trackId: track.id, title: track.title }
              }
            />
          ) : track.lyricStanzas.length > 0 ? (
            <div className={trackStyles.lyric} lang="und">
              {track.lyricStanzas.map((lines, stanzaIndex) => (
                <p key={stanzaIndex} className={trackStyles.stanza}>
                  {lines.map((line, lineIndex) => (
                    <Fragment key={lineIndex}>
                      {line}
                      {lineIndex < lines.length - 1 && <br />}
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>
          ) : (
            <p className={trackStyles.noLyrics}>
              {t(
                isTranscript
                  ? "studio:trackPage.noTranscript"
                  : "studio:trackPage.noLyrics",
              )}
            </p>
          )}
        </StudioWarnedContent>
        {isLeadSheetShown && (
          <div className={trackStyles.lyrFoot}>
            <Link to={routes.studioSheetStore}>
              {t("studio:track.lyrics.leadSheetChordsCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </StudioLyricShareHost>
  );
}
