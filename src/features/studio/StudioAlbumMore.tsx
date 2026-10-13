import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { releaseFactsLine } from "./studioFacts";
import styles from "./studio.module.css";

const MORE_LIMIT = 4;

/** The artist's other releases. Quietly absent when there are none or the
 *  read failed: the release above is the page. */
export function StudioAlbumMore({ release }: { release: StudioReleaseView }) {
  const { t } = useTranslation();
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

  return (
    <section className={styles.row}>
      <div className={styles.rowH}>
        <h2>
          <Translation
            i18nKey="studio:album.more.heading"
            values={{ artist: release.artist.name }}
            components={{ em: <em /> }}
          />
        </h2>
        <Link to={release.artist.href} className={styles.all}>
          {t("studio:album.more.artistPageCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
      {!artist ? (
        <StudioCardGridSkeleton className={styles.rowGrid} count={MORE_LIMIT} />
      ) : (
        <div className={styles.rowGrid}>
          {others.map((other) => (
            <StudioReleaseCard
              key={other.id}
              release={other}
              meta={releaseFactsLine(other, t)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
