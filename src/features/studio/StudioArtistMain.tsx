import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaUpdates } from "../subprofiles/PersonaUpdates";
import type { StudioArtistView } from "./api/studio.adapters";
import type { StudioFormat } from "./api/studio.types";
import { StudioArtistDiscovery } from "./StudioArtistDiscovery";
import { StudioArtistEvents } from "./StudioArtistEvents";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { releaseFactsLine } from "./studioFacts";
import type { ArtistTabId } from "./studioArtist.data";
import { useStudioVisitorPreview } from "./studioVisitorPreview";
import styles from "./studio.module.css";
import ownerStyles from "./StudioArtistOwner.module.css";

/** The releases section is titled by the artist's format (spec 5.5). */
const RELEASES_HEADING_KEY: Record<StudioFormat, string> = {
  music: "studio:artist.main.releasesHeading",
  spoken_word: "studio:artist.main.releasesHeading",
  podcast: "studio:artist.main.showsHeading",
  performance: "studio:artist.main.performanceHeading",
};

export function StudioArtistMain({
  tab,
  artist,
}: {
  tab: ArtistTabId;
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const shelfId = useId();
  // The owner viewing as a visitor gets the updates without post actions.
  const { isVisitorPreview } = useStudioVisitorPreview();

  if (tab === "about") {
    // The persona bio is the artist's own text, shown as written.
    const paragraphs = (artist.artist.bio ?? "")
      .split(/\n{2,}/)
      .filter((paragraph) => paragraph.trim());
    return (
      <>
        {paragraphs.length > 0 ? (
          <div className={styles.prose}>
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className={ownerStyles.note}>{t("studio:artistPage.noBio")}</p>
        )}
        <PersonaUpdates
          persona={{
            id: artist.artist.id,
            kind: artist.artist.kind,
            displayName: artist.artist.name,
          }}
          mode={
            artist.isOwner ? "owner" : isVisitorPreview ? "visitor" : "public"
          }
          surface="studio"
        />
      </>
    );
  }

  const hasOwnMusic =
    artist.releases.length + artist.singles.length + artist.playlists.length >
    0;

  return (
    <>
      <Collapse isOpen={!hasOwnMusic}>
        <p className={ownerStyles.note}>{t("studio:artistPage.noReleases")}</p>
      </Collapse>
      {artist.releases.length > 0 && (
        <StudioShelf
          id={`${shelfId}-releases`}
          layout="grid"
          title={t(RELEASES_HEADING_KEY[artist.artist.format])}
        >
          {artist.releases.map((release) => (
            <StudioReleaseCard
              key={release.id}
              release={release}
              meta={releaseFactsLine(release, t)}
            />
          ))}
        </StudioShelf>
      )}
      {artist.singles.length > 0 && (
        <StudioShelf
          id={`${shelfId}-singles`}
          title={
            <Translation
              i18nKey="studio:artist.main.singlesHeading"
              components={{ em: <em /> }}
            />
          }
        >
          {artist.singles.map((release) => (
            <StudioReleaseCard
              key={release.id}
              release={release}
              meta={release.releaseYear ?? undefined}
            />
          ))}
        </StudioShelf>
      )}
      <StudioArtistEvents artistId={artist.artist.id} />
      <Collapse isOpen={artist.playlists.length > 0}>
        <StudioShelf
          id={`${shelfId}-playlists`}
          title={
            <Translation
              i18nKey="studio:artistPage.section.playlists"
              components={{ em: <em /> }}
            />
          }
        >
          {artist.playlists.map((playlist) => (
            <StudioPlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </StudioShelf>
      </Collapse>
      <StudioArtistDiscovery artistId={artist.artist.id} />
    </>
  );
}
