import { useState } from "react";
import { FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioIconSwap } from "./player/ui/StudioIconSwap";
import { useStudioEpisodeMemory } from "./player/useStudioEpisodeMemory";

/** Mark as played / Mark as unplayed (spec 5.2, 5.3), kept on this device.
 *  A row and a phone hero show the round 44px icon with the words as its
 *  tooltip; a wider hero shows the words. Either way the name carries the
 *  episode's title, and the result reaches a status region. */
export function StudioMarkPlayedButton({
  trackId,
  title,
  isIconOnly = false,
}: {
  trackId: string;
  title: string;
  isIconOnly?: boolean;
}) {
  const { t } = useTranslation();
  const episodes = useStudioEpisodeMemory();
  const isPlayed = episodes.isPlayed(trackId);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const toggle = () => {
    if (isPlayed) episodes.markUnplayed(trackId);
    else episodes.markPlayed(trackId);
    setStatusKey(
      isPlayed
        ? "studio:episode.markedUnplayedStatus"
        : "studio:episode.markedPlayedStatus",
    );
  };
  const words = t(
    isPlayed ? "studio:episode.markUnplayed" : "studio:episode.markPlayed",
  );
  // The name starts with the visible words, then names the episode.
  const label = `${words} ${title}`;
  const icon = (
    <StudioIconSwap iconKey={isPlayed ? "played" : "unplayed"}>
      {isPlayed ? <FiRotateCcw aria-hidden /> : <FiCheckCircle aria-hidden />}
    </StudioIconSwap>
  );
  return (
    <>
      {isIconOnly ? (
        <IconButton
          aria-label={label}
          tooltip={words}
          tooltipPlacement="top"
          onClick={toggle}
        >
          {icon}
        </IconButton>
      ) : (
        <Button variant="quiet" aria-label={label} onClick={toggle}>
          {icon}
          <span>{words}</span>
        </Button>
      )}
      <span role="status" className="visuallyHidden">
        {statusKey ? t(statusKey, { title }) : ""}
      </span>
    </>
  );
}
