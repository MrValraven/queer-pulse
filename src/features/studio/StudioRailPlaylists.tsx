import { AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Collapse, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLibrarySaves } from "./api/useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import {
  StudioRailLikedRow,
  StudioRailPlaylistRow,
} from "./StudioRailPlaylistRow";
import {
  StudioRailPlaylistsEmpty,
  StudioRailPlaylistsError,
  StudioRailPlaylistsMore,
  StudioRailPlaylistsSkeleton,
} from "./StudioRailPlaylistStates";
import { toRailPlaylistRows } from "./studioRailPlaylistRows";
import css from "./StudioRailPlaylists.module.css";

const LIKED_ROW_KEY = "studio-liked-songs";

/**
 * The rail's listening home: Liked songs pinned first, then the member's own
 * and collaborative playlists, then the ones they saved. It scrolls on its
 * own. Saved rows show even while the member's own playlists load or fail;
 * those states sit under the list. Playlists share one route, so a row is
 * active when the open collection's id is its own.
 */
export function StudioRailPlaylists() {
  const { t } = useTranslation();
  const mine = useStudioMyPlaylists({ silentError: true });
  const saved = useStudioLibrarySaves("studio_playlist");
  const rows = toRailPlaylistRows(mine.playlists, saved);
  const { pathname, search } = useLocation();
  const openPlaylistId =
    pathname === routes.studioCollection
      ? new URLSearchParams(search).get("id")
      : null;
  const isEmpty =
    !mine.loadState.isLoading && !mine.loadState.isError && rows.length === 0;
  return (
    <nav className={css.root} aria-label={t("studio:railPlaylists.label")}>
      <ul className={css.list}>
        <AnimatePresence initial={false}>
          <CollapseListItem key={LIKED_ROW_KEY}>
            <StudioRailLikedRow isActive={pathname === routes.studioLiked} />
          </CollapseListItem>
          {rows.map((row) => (
            <CollapseListItem key={row.key}>
              <StudioRailPlaylistRow
                row={row}
                isActive={openPlaylistId === row.playlistId}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={mine.loadState.isLoading}>
        <StudioRailPlaylistsSkeleton />
      </Collapse>
      <Collapse isOpen={mine.loadState.isError}>
        <StudioRailPlaylistsError loadState={mine.loadState} />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <StudioRailPlaylistsEmpty />
      </Collapse>
      <Collapse isOpen={mine.hasMore || mine.isFetchNextPageError}>
        <StudioRailPlaylistsMore list={mine} />
      </Collapse>
    </nav>
  );
}
