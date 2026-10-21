import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistFolderView } from "./api/useStudioPlaylistFolders";
import type { StudioMenuItem } from "./kit/StudioMenu";

/** Rename folder, then Delete folder below a hairline. */
export function useStudioFolderMenuItems(
  folder: StudioPlaylistFolderView | null,
  actions: {
    onRename: (folder: StudioPlaylistFolderView) => void;
    onDelete: (folder: StudioPlaylistFolderView) => void;
  },
): StudioMenuItem[] {
  const { t } = useTranslation();
  if (!folder) return [];
  return [
    {
      id: "rename",
      label: t("studio:playlistFolders.menu.rename"),
      icon: <FiEdit2 />,
      onSelect: () => actions.onRename(folder),
    },
    { id: "separator-delete", type: "separator" },
    {
      id: "delete",
      label: t("studio:playlistFolders.menu.delete"),
      icon: <FiTrash2 />,
      tone: "danger",
      onSelect: () => actions.onDelete(folder),
    },
  ];
}
