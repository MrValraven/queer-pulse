import { useState } from "react";
import { FiCheck, FiRotateCcw } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioEpisodeMemory } from "./player/useStudioEpisodeMemory";

/** Mark as played / Mark as unplayed (spec 5.2, 5.3), kept on this device.
 *  The episode's title rides in a visually hidden span, so the name starts
 *  with the visible words; the result reaches a status region. */
export function StudioMarkPlayedButton({
  trackId,
  title,
  className,
}: {
  trackId: string;
  title: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const episodes = useStudioEpisodeMemory();
  const isPlayed = episodes.isPlayed(trackId);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          if (isPlayed) episodes.markUnplayed(trackId);
          else episodes.markPlayed(trackId);
          setStatusKey(
            isPlayed
              ? "studio:episode.markedUnplayedStatus"
              : "studio:episode.markedPlayedStatus",
          );
        }}
      >
        {isPlayed ? <FiRotateCcw aria-hidden /> : <FiCheck aria-hidden />}{" "}
        {t(
          isPlayed
            ? "studio:episode.markUnplayed"
            : "studio:episode.markPlayed",
        )}
        <span className="visuallyHidden"> {title}</span>
      </button>
      <span role="status" className="visuallyHidden">
        {statusKey ? t(statusKey, { title }) : ""}
      </span>
    </>
  );
}
