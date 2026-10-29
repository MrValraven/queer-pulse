import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioFoundingArtistIds } from "./api/useStudioFoundingArtists";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { StudioFoundingBadge } from "./StudioFoundingBadge";

/** One artist on a shelf or grid: a square avatar, the name as the card's
 *  one link and the artist kind under it (StudioMediaCard). */
export function StudioArtistCard({ artist }: { artist: StudioArtistRefView }) {
  const { t } = useTranslation();
  const foundingIds = useStudioFoundingArtistIds();
  return (
    <StudioMediaCard
      kind="artist"
      href={artist.href}
      title={artist.name}
      meta={
        <>
          {t(artist.kindLabelKey)}
          {foundingIds.has(artist.id) ? (
            <StudioFoundingBadge size="sm" />
          ) : null}
        </>
      }
      cover={
        <ImageSlot
          src={artist.avatarUrl ?? undefined}
          tint={artist.tint}
          width="100%"
          height="100%"
          radius={10}
          initials={artist.initials}
          placeholder={artist.name}
          style={{ position: "absolute", inset: 0 }}
        />
      }
    />
  );
}
