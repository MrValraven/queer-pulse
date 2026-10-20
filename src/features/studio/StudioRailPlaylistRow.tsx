import { FiUsers } from "react-icons/fi";
import { RiPushpin2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";
import css from "./StudioRailPlaylists.module.css";

/** Liked songs, pinned above every playlist in the rail. */
export function StudioRailLikedRow({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      to={routes.studioLiked}
      className={css.row}
      title={t("studio:liked.title")}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={css.name}>{t("studio:liked.title")}</span>
      <span className={css.meta}>
        <RiPushpin2Fill aria-hidden />
        <span className={css.metaText}>
          {t("studio:railPlaylists.autoPlaylist")}
        </span>
      </span>
    </Link>
  );
}

/** One playlist in the rail: its name, then who it belongs to. The link has
 *  no `aria-label`, so its accessible name reads both lines. */
export function StudioRailPlaylistRow({
  row,
  isActive,
}: {
  row: StudioRailPlaylistRowModel;
  isActive: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Link
      to={row.href}
      className={css.row}
      aria-current={isActive ? "page" : undefined}
      title={row.name}
    >
      <span className={css.name}>{row.name}</span>
      <span className={css.meta}>
        {row.isCollaborative && (
          <>
            <FiUsers aria-hidden />
            <span className="visuallyHidden">
              {t("studio:playlist.collab.chip")},{" "}
            </span>
          </>
        )}
        <span className={css.metaText}>
          {row.ownerName ?? t("studio:railPlaylists.savedFallback")}
        </span>
      </span>
    </Link>
  );
}
