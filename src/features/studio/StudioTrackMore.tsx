import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { releaseFactsLine } from "./studioFacts";
import { StudioShelf } from "./kit/StudioShelf";

const MORE_LIMIT = 4;

export function StudioTrackMore({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const headingId = useId();
  const artistRef = track.release.artist;
  const { artist } = useStudioArtist(artistRef.id);
  const releases = artist
    ? [...artist.releases, ...artist.singles].slice(0, MORE_LIMIT)
    : [];
  if (releases.length === 0) return null;
  return (
    <StudioShelf
      id={headingId}
      title={
        <Translation
          i18nKey="studio:album.more.heading"
          values={{ artist: artistRef.name }}
          components={{ em: <em /> }}
        />
      }
      seeAllHref={track.release.href}
      seeAllLabel={t("studio:trackPage.fullReleaseCta")}
    >
      {releases.map((release) => (
        <StudioReleaseCard
          key={release.id}
          release={release}
          meta={releaseFactsLine(release, t)}
        />
      ))}
    </StudioShelf>
  );
}
