import { FiDisc } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "./kit/useStudioContextMenu";
import { StudioRailCoverArt, StudioRailRowBody } from "./StudioRailRowCover";
import type { StudioRailReleaseRowModel } from "./studioRailPlaylistRows";
import css from "./StudioRailPlaylists.module.css";

/** A release row's second line. An album reads "Album · {artist}". A show
 *  was liked with its own "Podcast · {artist}" line (`show.savedMeta`),
 *  which already names what it is, so that line shows as kept. */
function useReleaseRowLine(artistLine: string | null): string {
  const { t } = useTranslation();
  if (artistLine === null) return t("studio:railPlaylists.releaseFallback");
  const showLinePrefix = t("studio:show.savedMeta", { artist: "" });
  if (artistLine.startsWith(showLinePrefix)) return artistLine;
  return t("studio:railPlaylists.releaseMeta", { artist: artistLine });
}

/** One liked album or show in the rail: its cover (a disc tile without
 *  one), then its name over "Album · {artist}" (a show keeps its podcast
 *  line); folded, the cover alone with the name in a tooltip. It opens the
 *  release page and takes no dropped tracks. Its menu (right-click, a
 *  long-press, the Menu key or Shift+F10) offers Copy link and Remove from
 *  your library. */
export function StudioRailReleaseRow({
  row,
  isActive,
  isCompact = false,
  onOpenMenu,
}: {
  row: StudioRailReleaseRowModel;
  isActive: boolean;
  isCompact?: boolean;
  onOpenMenu: (point: StudioContextMenuPoint) => void;
}) {
  const contextMenu = useStudioContextMenu(onOpenMenu);
  const line = useReleaseRowLine(row.artistLine);
  return (
    <Tooltip label={row.name} placement="right" isDisabled={!isCompact}>
      <Link
        to={row.href}
        className={css.row}
        data-compact={isCompact || undefined}
        aria-current={isActive ? "page" : undefined}
        aria-keyshortcuts="Shift+F10"
        title={isCompact ? undefined : row.name}
        {...contextMenu}
      >
        <StudioRailRowBody
          isCompact={isCompact}
          name={row.name}
          spokenMeta={line}
          cover={
            <StudioRailCoverArt
              coverUrls={row.coverUrl ? [row.coverUrl] : []}
              tint={row.tint}
              fallbackIcon={<FiDisc />}
            />
          }
          meta={<span className={css.metaText}>{line}</span>}
        />
      </Link>
    </Tooltip>
  );
}
