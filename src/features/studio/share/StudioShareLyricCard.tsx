import { useId } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiPause, FiPlay } from "react-icons/fi";
import { LuQuote } from "react-icons/lu";
import { IconButton, ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioTrackView } from "../api/studio.adapters";
import { useStudioHideExplicit } from "../api/useStudioPlaybackPreferences";
import { useStudioTrack } from "../api/useStudioTrack";
import { useStudioPlayer } from "../player/studioPlayerContext";
import { studioSeekAndResume } from "../player/studioSeekAndResume";
import type { StudioShareCardPlay } from "./StudioShareCardBody";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";
import {
  GRANTED_ACCESS,
  studioShareCardStatus,
  trackPlayModel,
} from "./studioShareCardModel";
import { studioShareLabelKey } from "./studioShareLabel";
import {
  LYRIC_NOTE_KEY,
  studioLyricCredit,
  studioLyricLineOf,
} from "./studioShareLyricModel";
import styles from "./StudioShareLyricCard.module.css";

/** The loaded lyric card: the line in Fraunces over a wash of the cover's
 *  tint, then the credit row (cover, track, artist) with play. The track
 *  title is a stretched link over the whole card; play sits above it. */
function StudioShareLyricBody({
  track,
  href,
  lineText,
  noteKey,
  play,
}: {
  track: StudioTrackView;
  href: string;
  lineText: string | null;
  noteKey: string | null;
  play: StudioShareCardPlay | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.body} data-tint={track.release.tint}>
      <LuQuote className={styles.quoteMark} aria-hidden />
      <span className={styles.eyebrow}>
        <LuQuote aria-hidden />
        <span className={styles.eyebrowLabel}>
          {t(studioShareLabelKey("lyric"))}
        </span>
      </span>
      {lineText !== null ? (
        // The words as the artist wrote them, in whatever language they sing.
        <blockquote className={styles.line} lang="und">
          {lineText}
        </blockquote>
      ) : (
        <span className={styles.note} id={play?.noteId}>
          {noteKey ? t(noteKey) : null}
        </span>
      )}
      <div className={styles.credit}>
        <span className={styles.thumb}>
          <ImageSlot
            src={track.release.coverUrl ?? undefined}
            tint={track.release.tint}
            width="100%"
            height="100%"
            radius={0}
            placeholder=""
            style={{ position: "absolute", inset: 0 }}
          />
        </span>
        <span className={styles.creditText}>
          <Link
            to={href}
            className={styles.title}
            aria-label={t("studio:share.card.openAria", { title: track.title })}
          >
            {track.title}
          </Link>
          <span className={styles.artist}>{studioLyricCredit(track)}</span>
        </span>
        {play && (
          <IconButton
            className={styles.play}
            aria-label={play.label}
            aria-disabled={play.isBlocked || undefined}
            aria-describedby={play.isBlocked ? play.noteId : undefined}
            onClick={play.onPlay}
          >
            {play.isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </IconButton>
        )}
      </div>
    </div>
  );
}

/** A shared lyric line (PRD-13): resolved by the reader's own track read,
 *  so the words come from what this reader may see, never from the link.
 *  A warned, withheld or hidden track shows the card without the words.
 *  Play starts the track inside its release at the line (`&t=`). */
export function StudioShareLyricCard({ target }: { target: StudioLinkTarget }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const shouldHideExplicit = useStudioHideExplicit();
  const noteId = useId();
  const { track, loadState } = useStudioTrack(target.id);
  const status = studioShareCardStatus(
    GRANTED_ACCESS,
    loadState,
    track !== null,
  );
  let readyBody = null;
  if (status === "ready" && track) {
    const line = studioLyricLineOf(track, target.lineIndex, shouldHideExplicit);
    const model = trackPlayModel(track, shouldHideExplicit);
    const isCurrent = player.isCurrentTrack(track.id);
    const isPlaying = isCurrent && player.status === "playing";
    const isHidden = model.playMode === "hidden";
    // Called synchronously inside the click, so the audio context unlocks.
    const play = () => {
      if (!isPlaying && model.playMode !== "playable") return;
      // Playing: pause. Current but paused: back to the line, then on.
      if (isPlaying) player.togglePlay();
      else if (isCurrent && target.startAtSeconds !== null)
        studioSeekAndResume(player, target.startAtSeconds);
      else if (isCurrent) player.togglePlay();
      else
        void player.playRelease(
          track.releaseId,
          track.id,
          target.startAtSeconds ?? undefined,
        );
    };
    readyBody = (
      <StudioShareLyricBody
        track={track}
        href={studioLinkPath(target)}
        lineText={line.text}
        noteKey={line.state === "shown" ? null : LYRIC_NOTE_KEY[line.state]}
        play={
          model.playMode === "blocked" || line.state === "withheld"
            ? null
            : {
                isPlaying,
                isBlocked: isHidden && !isPlaying,
                noteId,
                label: t(
                  isPlaying
                    ? "studio:card.pauseRelease"
                    : "studio:share.lyric.playFromLine",
                  { title: track.title },
                ),
                onPlay: play,
              }
        }
      />
    );
  }
  return (
    <AnimatePresence initial={false}>
      <StudioShareCardLayer key={readyBody ? "ready" : status}>
        {readyBody ?? (
          <StudioShareCardStatusBody
            status={status === "ready" ? "loading" : status}
            loadState={loadState}
          />
        )}
      </StudioShareCardLayer>
    </AnimatePresence>
  );
}
