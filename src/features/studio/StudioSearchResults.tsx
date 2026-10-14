import { useId } from "react";
import type { ReactNode } from "react";
import { FiSearch } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchView } from "./api/studio.adapters";
import type { StudioFormat, StudioSearchType } from "./api/studio.types";
import { StudioArtistCard } from "./StudioArtistCard";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioSearchTrackRow } from "./StudioSearchTrackRow";
import styles from "./studio.module.css";
import searchStyles from "./StudioSearch.module.css";

function ResultSection({
  titleKey,
  children,
}: {
  titleKey: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </h2>
      </div>
      {children}
    </section>
  );
}

/** The server's answer, rendered as it came: no client filter runs over it.
 *  `query`, `type` and the genre the server applied are the ones this
 *  result answers; `type` picks the sections shown. */
export function StudioSearchResults({
  result,
  query,
  type,
  format = null,
  onClear,
}: {
  result: StudioSearchView;
  query: string;
  type: StudioSearchType;
  /** The format the result answers: Podcasts heads the section Episodes. */
  format?: StudioFormat | null;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  if (result.isEmpty) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("studio:search.empty.title")}
        description={
          <Translation
            i18nKey="studio:search.empty.description"
            components={{ em: <em /> }}
            values={{ term: query }}
          />
        }
        action={{ label: t("studio:searchPage.clearCta"), onClick: onClear }}
      />
    );
  }
  return (
    <>
      {(type === "all" || type === "releases") &&
        result.releases.length > 0 && (
          <ResultSection titleKey="studio:searchPage.section.releases">
            <div className={styles.rowGrid}>
              {result.releases.map((release) => (
                <StudioReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </ResultSection>
        )}
      {(type === "all" || type === "tracks") && result.tracks.length > 0 && (
        <ResultSection
          titleKey={
            format === "podcast"
              ? "studio:searchPage.episodesHeading"
              : "studio:searchPage.section.tracks"
          }
        >
          <ol className={`${styles.setCard} ${searchStyles.trackList}`}>
            {result.tracks.map((track) => (
              <StudioSearchTrackRow key={track.id} track={track} />
            ))}
          </ol>
        </ResultSection>
      )}
      {(type === "all" || type === "artists") && result.artists.length > 0 && (
        <ResultSection titleKey="studio:searchPage.section.artists">
          <div className={styles.rowGrid}>
            {result.artists.map((artist) => (
              <StudioArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </ResultSection>
      )}
      {(type === "all" || type === "playlists") &&
        result.playlists.length > 0 && (
          <ResultSection titleKey="studio:searchPage.section.playlists">
            <div className={styles.rowGrid}>
              {result.playlists.map((playlist) => (
                <StudioPlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </ResultSection>
        )}
    </>
  );
}
