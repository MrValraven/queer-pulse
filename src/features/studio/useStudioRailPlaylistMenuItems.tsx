import { FiBookmark, FiEdit2, FiLink, FiSend, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioMenuItem } from "./kit/StudioMenu";
import { studioLinkUrl, type StudioLinkTarget } from "./share/studioLinkTarget";
import { useStudioShareRules } from "./share/useStudioShareRules";
import {
  studioRailFolderMenuItems,
  useStudioRailFolderFilingContext,
} from "./StudioRailFolder.filing";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";

export interface StudioRailPlaylistMenuActions {
  onEdit: (row: StudioRailPlaylistRowModel) => void;
  onSend: (row: StudioRailPlaylistRowModel) => void;
  onDelete: (row: StudioRailPlaylistRowModel) => void;
  onUnsave: (row: StudioRailPlaylistRowModel) => void;
}

export const railPlaylistTargetOf = (
  row: StudioRailPlaylistRowModel,
): StudioLinkTarget => ({
  kind: "playlist",
  id: row.playlistId,
  startAtSeconds: null,
});

/**
 * One rail playlist's menu, in three groups: Edit details (the owner
 * and editors), sharing (Send in a message where the picker rules allow it,
 * Copy link), then the folder group inside the rail list (Move to folder,
 * Move to new folder, Remove from {folder}), then Delete playlist for the
 * owner or Remove from Library for a save, each set apart by a hairline.
 */
export function useStudioRailPlaylistMenuItems(
  row: StudioRailPlaylistRowModel | null,
  actions: StudioRailPlaylistMenuActions,
): StudioMenuItem[] {
  const { t } = useTranslation();
  const { user } = useAuth();
  const filing = useStudioRailFolderFilingContext();
  const rules = useStudioShareRules(row ? railPlaylistTargetOf(row) : null);
  const { share } = useShareLink({
    copied: t("studio:trackMenu.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  if (!row) return [];

  const editing: StudioMenuItem[] = row.hasEditRights
    ? [
        {
          id: "edit",
          label: t("studio:playlist.page.editDetails"),
          icon: <FiEdit2 />,
          onSelect: () => actions.onEdit(row),
        },
      ]
    : [];
  const sharing: StudioMenuItem[] = [];
  if (user && rules.canSendToOthers)
    sharing.push({
      id: "sendInMessage",
      label: t("studio:trackMenu.sendInMessage"),
      icon: <FiSend />,
      onSelect: () => actions.onSend(row),
    });
  sharing.push({
    id: "copyLink",
    label: t("studio:trackMenu.copyLink"),
    icon: <FiLink />,
    onSelect: () => void share(studioLinkUrl(railPlaylistTargetOf(row))),
  });
  const leaving: StudioMenuItem[] = [];
  if (row.isOwner)
    leaving.push({
      id: "delete",
      label: t("studio:playlist.page.deletePlaylist"),
      icon: <FiTrash2 />,
      tone: "danger",
      onSelect: () => actions.onDelete(row),
    });
  else if (row.isSaved)
    leaving.push({
      id: "unsave",
      label: t("studio:railPlaylists.menu.removeSaved"),
      icon: <FiBookmark />,
      onSelect: () => actions.onUnsave(row),
    });

  const filingItems = filing
    ? studioRailFolderMenuItems(
        { playlistId: row.playlistId, name: row.name },
        filing,
        t,
      )
    : [];

  return [editing, sharing, filingItems, leaving]
    .filter((group) => group.length > 0)
    .flatMap((group, index) =>
      index === 0
        ? group
        : [{ id: `separator-${index}`, type: "separator" as const }, ...group],
    );
}
