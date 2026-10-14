import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiBookmark, FiPlus } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import {
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioFollowedArtists } from "./api/useStudioFollowedArtists";
import { useStudioLibrarySaves } from "./api/useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import { StudioArtistCard } from "./StudioArtistCard";
import { StudioLibrarySavedList } from "./StudioLibrarySavedList";
import { StudioLikedSongsCard } from "./StudioLikedSongsCard";
import { StudioLoadError } from "./StudioLoadStates";
import type { StudioLibraryTab } from "./studioPaths";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import { StudioCardGridSkeleton, StudioCardSkeleton } from "./StudioSkeletons";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

function LibraryEmpty({
  titleKey,
  bodyKey,
  onCreatePlaylist,
}: {
  titleKey: string;
  bodyKey: string;
  onCreatePlaylist?: () => void;
}) {
  const { t } = useTranslation();
  const browseAction = {
    label: t("studio:library.empty.browseCta"),
    to: routes.studio,
  };
  return (
    <EmptyState
      icon={<FiBookmark />}
      title={t(titleKey)}
      description={t(bodyKey)}
      headingLevel={2}
      action={
        onCreatePlaylist
          ? {
              label: t("studio:libraryLive.newPlaylistCta"),
              onClick: onCreatePlaylist,
            }
          : browseAction
      }
      secondaryAction={onCreatePlaylist ? browseAction : undefined}
    />
  );
}

function LibraryPlaylists() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mine = useStudioMyPlaylists();
  const saved = useStudioLibrarySaves("studio_playlist");
  const [isCreating, setIsCreating] = useState(false);
  const isPlaylistsReady = !mine.loadState.isError && !mine.loadState.isLoading;
  // The empty state carries its own Create playlist action, so the header
  // pill appears only once at least one playlist has loaded.
  const hasOwnPlaylists = isPlaylistsReady && mine.playlists.length > 0;
  const mineHeadingId = useId();
  const savedHeadingId = useId();
  return (
    <>
      <section className={styles.row} aria-labelledby={mineHeadingId}>
        <div className={styles.rowH}>
          <h2 id={mineHeadingId}>
            <Translation
              i18nKey="studio:libraryLive.yourPlaylists"
              components={{ em: <em /> }}
            />
          </h2>
          <Collapse isOpen={hasOwnPlaylists} isInitialSkipped={false}>
            <button
              type="button"
              className={kit.pillLink}
              onClick={() => setIsCreating(true)}
            >
              <FiPlus aria-hidden /> {t("studio:libraryLive.newPlaylistCta")}
            </button>
          </Collapse>
        </div>
        {/* Liked songs always leads the grid: it needs no playlist load. */}
        <div className={styles.rowGrid}>
          <StudioLikedSongsCard />
          {mine.loadState.isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <StudioCardSkeleton key={index} />
            ))}
          {isPlaylistsReady &&
            mine.playlists.map((playlist) => (
              <StudioPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
        </div>
        {mine.loadState.isError && (
          <StudioLoadError loadState={mine.loadState} />
        )}
        <Collapse isOpen={isPlaylistsReady && mine.playlists.length === 0}>
          <LibraryEmpty
            titleKey="studio:libraryLive.empty.ownPlaylistsTitle"
            bodyKey="studio:libraryLive.empty.playlistsBody"
            onCreatePlaylist={() => setIsCreating(true)}
          />
        </Collapse>
        {(mine.hasMore || mine.isFetchNextPageError) && (
          <div className={kit.moreFooter}>
            <LoadMoreFooter
              isFetchingNextPage={mine.isFetchingNextPage}
              isFetchNextPageError={mine.isFetchNextPageError}
              onLoadMore={mine.fetchNextPage}
              label={t("studio:playlist.add.showMore")}
              loadingLabel={t("studio:playlist.add.loadingMore")}
              errorMessage={t("studio:playlist.add.loadMoreError")}
            />
          </div>
        )}
      </section>
      <Collapse isOpen={saved.length > 0}>
        <section className={styles.row} aria-labelledby={savedHeadingId}>
          <div className={styles.rowH}>
            <h2 id={savedHeadingId}>
              <Translation
                i18nKey="studio:libraryLive.savedPlaylists"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <StudioLibrarySavedList items={saved} />
        </section>
      </Collapse>
      <AnimatePresence>
        {isCreating && (
          <StudioPlaylistDialog
            key="create"
            mode="create"
            onClose={() => setIsCreating(false)}
            onSaved={(playlist) => {
              setIsCreating(false);
              void navigate(playlist.href);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/** Saved releases. Liked tracks have their own page (routes.studioLiked). */
function LibraryReleases() {
  const items = useStudioLibrarySaves("studio_release");
  if (items.length === 0)
    return (
      <LibraryEmpty
        titleKey="studio:libraryLive.empty.releasesTitle"
        bodyKey="studio:libraryLive.empty.releasesBody"
      />
    );
  return <StudioLibrarySavedList items={items} />;
}

function LibraryArtists() {
  const { t } = useTranslation();
  const followed = useStudioFollowedArtists();
  if (followed.loadState.isError)
    return <StudioLoadError loadState={followed.loadState} />;
  if (followed.loadState.isLoading)
    return <StudioCardGridSkeleton count={4} className={styles.rowGrid} />;
  return (
    <>
      {followed.artists.length === 0 && !followed.hasMore ? (
        <LibraryEmpty
          titleKey="studio:libraryLive.empty.artistsTitle"
          bodyKey="studio:libraryLive.empty.artistsBody"
        />
      ) : (
        <div className={styles.rowGrid}>
          {followed.artists.map((artist) => (
            <StudioArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
      {(followed.hasMore || followed.isFetchNextPageError) && (
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={followed.isFetchingNextPage}
            isFetchNextPageError={followed.isFetchNextPageError}
            onLoadMore={followed.fetchNextPage}
            label={t("studio:libraryLive.showMoreArtists")}
            loadingLabel={t("studio:libraryLive.loadingMoreArtists")}
            errorMessage={t("studio:libraryLive.loadMoreArtistsError")}
          />
        </div>
      )}
    </>
  );
}

/** One library tab's content. */
export function StudioLibraryPanel({ tab }: { tab: StudioLibraryTab }) {
  if (tab === "playlists") return <LibraryPlaylists />;
  if (tab === "artists") return <LibraryArtists />;
  return <LibraryReleases />;
}
