import { Fragment, useId } from "react";
import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime, type StudioTrackView } from "./api/studio.adapters";
import { playEpisode } from "./player/studioEpisodePlay";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueItemFromEpisode, showQueueSource } from "./player/studioQueue";
import { StudioWarnedContent } from "./StudioWarnedContent";
import { tokenizeShowNotes } from "./studioShowNotesTokens";
import css from "./StudioEpisode.module.css";

/** The episode's show notes (spec 5.3). A time plays the episode from that
 *  point; an address opens in a new tab. */
export function StudioShowNotes({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const headingId = useId();
  const player = useStudioPlayer();
  if (!track.notes) return null;
  const paragraphs = tokenizeShowNotes(track.notes, track.durationSeconds);
  const canPlay = track.hasAudio && track.isDraft !== true;
  return (
    <section className={css.notes} aria-labelledby={headingId}>
      <h2 id={headingId}>{t("studio:episode.notesHeading")}</h2>
      {/* Keyed by the track, so another episode's notes start covered. */}
      <StudioWarnedContent
        key={track.id}
        trackId={track.id}
        warnings={track.contentWarnings}
      >
        {paragraphs.map((tokens, paragraphIndex) => (
          <p key={paragraphIndex}>
            {tokens.map((token, tokenIndex) => {
              if (token.kind === "break") return <br key={tokenIndex} />;
              if (token.kind === "link")
                return (
                  <a
                    key={tokenIndex}
                    href={token.href}
                    target="_blank"
                    rel="nofollow ugc noopener noreferrer"
                    className={css.link}
                  >
                    {token.text}
                    <FiExternalLink aria-hidden className={css.external} />
                    <span className="visuallyHidden">
                      {` ${t("studio:episode.opensInNewTab")}`}
                    </span>
                  </a>
                );
              if (token.kind === "time" && canPlay)
                return (
                  <Button
                    key={tokenIndex}
                    variant="quiet"
                    size="sm"
                    className={css.time}
                    aria-label={t("studio:episode.playFromAria", {
                      time: token.text,
                    })}
                    onClick={() =>
                      void playEpisode(
                        player,
                        queueItemFromEpisode(track, track.release),
                        showQueueSource(track.release),
                        token.seconds,
                      )
                    }
                  >
                    {/* The chapters' format, whatever the notes wrote. */}
                    {formatTrackTime(token.seconds) ?? token.text}
                  </Button>
                );
              return <Fragment key={tokenIndex}>{token.text}</Fragment>;
            })}
          </p>
        ))}
      </StudioWarnedContent>
    </section>
  );
}
