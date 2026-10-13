import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { releaseFactsLine } from "./studioFacts";
import type { ArtistTabId } from "./studioArtist.data";
import styles from "./studio.module.css";
import ownerStyles from "./StudioArtistOwner.module.css";
import kit from "./studioKit.module.css";

export function StudioArtistMain({
  tab,
  artist,
}: {
  tab: ArtistTabId;
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();

  if (tab === "about") {
    // The persona bio is the artist's own text, shown as written.
    const paragraphs = (artist.artist.bio ?? "")
      .split(/\n{2,}/)
      .filter((paragraph) => paragraph.trim());
    return paragraphs.length > 0 ? (
      <div className={styles.prose}>
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </div>
    ) : (
      <p className={ownerStyles.note}>{t("studio:artistPage.noBio")}</p>
    );
  }

  if (
    artist.releases.length + artist.singles.length + artist.playlists.length ===
    0
  ) {
    return (
      <p className={ownerStyles.note}>{t("studio:artistPage.noReleases")}</p>
    );
  }

  return (
    <>
      {artist.releases.length > 0 && (
        <>
          <div className={styles.rowH}>
            <h2>{t("studio:artist.main.releasesHeading")}</h2>
          </div>
          <div className={`${styles.rowGrid} ${kit.rowGrid3}`}>
            {artist.releases.map((release) => (
              <StudioReleaseCard
                key={release.id}
                release={release}
                meta={releaseFactsLine(release, t)}
              />
            ))}
          </div>
        </>
      )}
      {artist.singles.length > 0 && (
        <>
          <div className={`${styles.rowH} ${kit.sectionGap}`}>
            <h2>
              <Translation
                i18nKey="studio:artist.main.singlesHeading"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <div className={`${styles.rowGrid} ${kit.rowGrid5}`}>
            {artist.singles.map((release) => (
              <StudioReleaseCard
                key={release.id}
                release={release}
                meta={release.releaseYear ?? undefined}
              />
            ))}
          </div>
        </>
      )}
      <Collapse isOpen={artist.playlists.length > 0}>
        <div className={`${styles.rowH} ${kit.sectionGap}`}>
          <h2>
            <Translation
              i18nKey="studio:artistPage.section.playlists"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={`${styles.rowGrid} ${kit.rowGrid5}`}>
          {artist.playlists.map((playlist) => (
            <StudioPlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </Collapse>
    </>
  );
}
