import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "../../api/studio.adapters";
import { useStudioTrack } from "../../api/useStudioTrack";
import { StudioTrackChapters } from "./StudioTrackChapters";

function ReleaseTrackChapters({
  trackId,
  title,
  isNamed,
}: {
  trackId: string;
  title: string;
  isNamed: boolean;
}) {
  const { t } = useTranslation();
  // The detail query is the one the track page and the player read (cached).
  const { track } = useStudioTrack(trackId);
  if (!track) return null;
  return (
    <StudioTrackChapters
      track={track}
      // One track: the page tab already says Tracklist. Several: each list
      // keeps its visible "Tracklist for {title}" heading.
      isHeadingHidden={!isNamed}
      heading={
        isNamed ? t("studio:chapters.listHeadingFor", { title }) : undefined
      }
    />
  );
}

/** For a mix release, each track's chapters under the tracklist. */
export function StudioReleaseChapters({
  release,
}: {
  release: StudioReleaseView;
}) {
  if (release.type !== "mix" || release.status === "taken_down") return null;
  const tracks = release.tracks.filter((track) => track.hasAudio);
  return (
    <>
      {tracks.map((track) => (
        <ReleaseTrackChapters
          key={track.id}
          trackId={track.id}
          title={track.title}
          isNamed={tracks.length > 1}
        />
      ))}
    </>
  );
}
