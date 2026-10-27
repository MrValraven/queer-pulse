import { useId } from "react";
import { Link } from "react-router-dom";
import { Collapse, ImageSlot } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioArtistView } from "../../api/studio.adapters";
import { useStudioArtistEvents } from "../../api/useStudioArtistEvents";
import { StudioCoverFallback } from "../../kit/StudioCoverFallback";
import { StudioExternalLinkList } from "../../StudioExternalLinkList";
import { StudioEventCard } from "../../StudioSceneEvents";
import type { StudioQueueItem } from "../studioPlayerContext";
import type { StudioNowPlayingArtistState } from "../useStudioNowPlayingArtist";
import {
  NOW_PLAYING_EVENT_LIMIT,
  NOW_PLAYING_RELEASE_LIMIT,
} from "./studioNowPlayingArtist.data";
import css from "./StudioNowPlayingArtist.module.css";
import sections from "./StudioSidePanelSections.module.css";

const NO_ARTIST_ID = "";

/** Where the artist plays next: the first two upcoming events and See all,
 *  which opens the artist page with the full list. Folds away with none. */
function ArtistEventsBrief({
  artistId,
  artist,
}: {
  artistId: string;
  artist: StudioArtistView | null;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const events = useStudioArtistEvents(artistId);
  const shownEvents = events.slice(0, NOW_PLAYING_EVENT_LIMIT);
  return (
    <Collapse isOpen={artist !== null && shownEvents.length > 0}>
      {artist && (
        <section className={css.section} aria-labelledby={headingId}>
          <div className={sections.sectionHead}>
            <h3 id={headingId} className={sections.sectionTitle}>
              <Translation i18nKey="studio:scene.events.title" />
            </h3>
            <Link
              to={artist.artist.href}
              className={sections.sectionLink}
              aria-label={t("studio:sidePanel.seeAllEventsAria", {
                artist: artist.artist.name,
              })}
            >
              {t("studio:kit.shelf.seeAll")}
            </Link>
          </div>
          <div className={css.eventList}>
            {shownEvents.map((event) => (
              <StudioEventCard
                key={event.slug}
                event={event}
                headingLevel="h4"
              />
            ))}
          </div>
        </section>
      )}
    </Collapse>
  );
}

/** The artist's support links (Bandcamp, Ko-fi, Patreon). Folds away when
 *  the artist lists none, for the owner too. */
function ArtistSupportBrief({ artist }: { artist: StudioArtistView | null }) {
  const { t } = useTranslation();
  const headingId = useId();
  const links = artist?.supportLinks ?? [];
  return (
    <Collapse isOpen={artist !== null && links.length > 0}>
      {artist && (
        <section className={css.section} aria-labelledby={headingId}>
          <div className={sections.sectionHead}>
            <h3 id={headingId} className={sections.sectionTitle}>
              {t("studio:support.artistHeading", { name: artist.artist.name })}
            </h3>
          </div>
          <StudioExternalLinkList
            links={links}
            label={t("studio:support.listLabel", { name: artist.artist.name })}
          />
        </section>
      )}
    </Collapse>
  );
}

/** Up to four of the artist's other releases, in the server's order, with
 *  the one playing left out. Folds away when there are none. */
function ArtistMoreReleases({
  artist,
  playingReleaseId,
}: {
  artist: StudioArtistView | null;
  playingReleaseId: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const releases = (artist?.allReleases ?? [])
    .filter((release) => release.id !== playingReleaseId)
    .slice(0, NOW_PLAYING_RELEASE_LIMIT);
  return (
    <Collapse isOpen={artist !== null && releases.length > 0}>
      {artist && (
        <section className={css.section} aria-labelledby={headingId}>
          <div className={sections.sectionHead}>
            <h3 id={headingId} className={sections.sectionTitle}>
              <Translation
                i18nKey="studio:album.more.heading"
                values={{ artist: artist.artist.name }}
              />
            </h3>
          </div>
          <ul className={css.releaseList}>
            {releases.map((release) => (
              <li key={release.id}>
                <Link to={release.href} className={css.releaseRow}>
                  <span className={css.releaseCover}>
                    {release.coverUrl ? (
                      <ImageSlot
                        src={release.coverUrl}
                        tint={release.tint}
                        width={48}
                        height={48}
                        radius={0}
                        style={{ position: "absolute", inset: 0 }}
                      />
                    ) : (
                      <StudioCoverFallback
                        title={release.title}
                        kind={release.format}
                        tint={release.tint}
                      />
                    )}
                  </span>
                  <span className={css.releaseText}>
                    <span className={css.releaseTitle}>{release.title}</span>
                    <span className={css.releaseMeta}>
                      {[t(release.typeLabelKey), release.releaseYear]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Collapse>
  );
}

/**
 * The artist extras under the About card: upcoming events, support links
 * and more releases. Each folds away when empty, and nothing shows until
 * the playing item's artist is ready, so a new track never lists the
 * previous artist's events or releases. The section heads share the panel's
 * head row and render the catalog's titles as plain text.
 */
export function StudioNowPlayingArtistExtras({
  item,
  artistState,
}: {
  item: StudioQueueItem;
  artistState: StudioNowPlayingArtistState;
}) {
  const artist = artistState.status === "ready" ? artistState.artist : null;
  return (
    <div className={css.extras}>
      <ArtistEventsBrief
        artistId={artist ? item.artistId : NO_ARTIST_ID}
        artist={artist}
      />
      <ArtistSupportBrief artist={artist} />
      <ArtistMoreReleases artist={artist} playingReleaseId={item.releaseId} />
    </div>
  );
}
