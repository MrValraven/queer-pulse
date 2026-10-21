import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioShelfSkeleton } from "./StudioSkeletons";
import { releaseFactsLine } from "./studioFacts";

const MORE_LIMIT = 4;

/** The artist's other releases. Quietly absent when there are none or the
 *  read failed: the release above is the page. */
export function StudioAlbumMore({ release }: { release: StudioReleaseView }) {
  const { t } = useTranslation();
  const headingId = useId();
  const { artist, loadState } = useStudioArtist(release.artist.id);
  const others = artist
    ? [...artist.releases, ...artist.singles]
        .filter((candidate) => candidate.id !== release.id)
        .slice(0, MORE_LIMIT)
    : [];
  if (
    loadState.isError ||
    loadState.isNotFound ||
    (artist && others.length === 0)
  )
    return null;

  const title = (
    <Translation
      i18nKey="studio:album.more.heading"
      values={{ artist: release.artist.name }}
      components={{ em: <em /> }}
    />
  );
  if (!artist)
    return (
      <StudioShelfSkeleton
        cards={MORE_LIMIT}
        label={t("studio:loading.moreFromArtist", {
          artist: release.artist.name,
        })}
      />
    );
  return (
    <StudioShelf
      id={headingId}
      title={title}
      seeAllHref={release.artist.href}
      seeAllLabel={t("studio:album.more.artistPageCta")}
    >
      {others.map((other) => (
        <StudioReleaseCard
          key={other.id}
          release={other}
          meta={releaseFactsLine(other, t)}
        />
      ))}
    </StudioShelf>
  );
}
