import { FiMusic } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Collapse, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioLikedSongsCard } from "./StudioLikedSongsCard";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioCardSkeleton } from "./StudioSkeletons";

const SHOWN_PLAYLIST_COUNT = 8;
const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

/** The "You" page's playlists shelf: Liked songs first, then the newest
 *  eight playlists the member made. Liked songs needs no playlist load, so
 *  it shows through loading, a failed read and an empty library. */
export function StudioMePlaylists() {
  const { t } = useTranslation();
  const { playlists, loadState } = useStudioMyPlaylists();
  const isReady = !loadState.isLoading && !loadState.isError;
  return (
    <>
      <StudioShelf
        id="studio-me-playlists"
        title={t("studio:me.playlists.heading")}
        seeAllHref={routes.studioLibrary}
        seeAllLabel={t("studio:me.playlists.seeAll")}
      >
        <StudioLikedSongsCard key="liked" />
        {loadState.isLoading &&
          SKELETON_KEYS.map((key) => <StudioCardSkeleton key={key} />)}
        {isReady &&
          playlists
            .slice(0, SHOWN_PLAYLIST_COUNT)
            .map((playlist) => (
              <StudioPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
      </StudioShelf>
      <Collapse isOpen={loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.yourPlaylists"
        />
      </Collapse>
      <Collapse isOpen={isReady && playlists.length === 0}>
        <EmptyState
          compact
          icon={<FiMusic aria-hidden />}
          title={t("studio:me.playlists.empty.title")}
          description={t("studio:me.playlists.empty.body")}
          action={{
            label: t("studio:me.playlists.empty.cta"),
            to: routes.studio,
          }}
        />
      </Collapse>
    </>
  );
}
