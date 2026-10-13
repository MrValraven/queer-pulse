import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { releaseFactsLine } from "./studioFacts";
import ss from "./studio.module.css";

const MORE_LIMIT = 4;

export function StudioTrackMore({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const artistRef = track.release.artist;
  const { artist } = useStudioArtist(artistRef.id);
  const releases = artist
    ? [...artist.releases, ...artist.singles].slice(0, MORE_LIMIT)
    : [];
  if (releases.length === 0) return null;
  return (
    <section className={ss.row}>
      <div className={ss.rowH}>
        <h2>
          <Translation
            i18nKey="studio:album.more.heading"
            values={{ artist: artistRef.name }}
            components={{ em: <em /> }}
          />
        </h2>
        <Link to={track.release.href} className={ss.all}>
          {t("studio:trackPage.fullReleaseCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
      <div className={ss.rowGrid}>
        {releases.map((release) => (
          <StudioReleaseCard
            key={release.id}
            release={release}
            meta={releaseFactsLine(release, t)}
          />
        ))}
      </div>
    </section>
  );
}
