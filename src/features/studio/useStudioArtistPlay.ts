import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import type { StudioPlayButtonState } from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";

/** Play all queues at most this many releases, in the server's order. */
const PLAY_ALL_LIMIT = 10;

/**
 * The artist page's Play all, shared by the hero and the sticky header. The
 * server sends releases newest first (published_at desc, id desc) and Play
 * all keeps that order. While one of them is the current release, a press
 * pauses or resumes it in place instead of starting over.
 */
export function useStudioArtistPlay(artist: StudioArtistView): {
  state: StudioPlayButtonState;
  toggle: () => void;
  label: string;
  blockedReason?: string;
} {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const name = artist.artist.name;
  const releaseIds = artist.allReleases
    .map((release) => release.id)
    .slice(0, PLAY_ALL_LIMIT);
  const isCurrent = artist.allReleases.some((release) =>
    player.isCurrentRelease(release.id),
  );
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = isCurrent && player.status === "loading";
  const isBlocked = releaseIds.length === 0;

  return {
    state: isBlocked
      ? "blocked"
      : isLoading
        ? "loading"
        : isPlaying
          ? "playing"
          : "idle",
    toggle: () => {
      if (isBlocked) return;
      if (isCurrent) player.togglePlay();
      else void player.playReleases(releaseIds);
    },
    label: t(
      isPlaying || isLoading
        ? "studio:artistPage.pauseAll"
        : "studio:artistPage.playAll",
      { name },
    ),
    blockedReason: isBlocked
      ? t("studio:hero.blocked.artistNoReleases")
      : undefined,
  };
}
