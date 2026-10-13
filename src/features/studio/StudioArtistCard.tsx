import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import kit from "./studioKit.module.css";

export function StudioArtistCard({ artist }: { artist: StudioArtistRefView }) {
  const { t } = useTranslation();
  return (
    <Link to={artist.href} className={kit.artistCard}>
      <span className={kit.artistAvatar}>
        <ImageSlot
          src={artist.avatarUrl ?? undefined}
          tint={artist.tint}
          shape="circle"
          width="100%"
          height="100%"
          radius={9999}
          initials={artist.initials}
          placeholder={artist.name}
        />
      </span>
      <span className={kit.artistName}>{artist.name}</span>
      <span className={kit.artistKind}>{t(artist.kindLabelKey)}</span>
    </Link>
  );
}
