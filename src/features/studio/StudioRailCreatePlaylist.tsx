import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiFolderPlus, FiMusic, FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  studioPlaylistFolderErrorKeyOf,
  useCreateStudioPlaylistFolder,
} from "./api/useStudioPlaylistFolders";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import { StudioPlaylistFolderDialog } from "./StudioPlaylistFolderDialog";
import { startRailFolderRename } from "./StudioRailFolder.state";
import { useStudioRailCollapsed } from "./useStudioRailCollapsed";
import styles from "./studio.module.css";
import railCss from "./StudioRailPlaylists.module.css";

/** The rail's Create pill; on the folded rail an icon button with the label
 *  as its tooltip. It opens a menu: Create playlist opens the create dialog
 *  and, once the playlist is saved, goes to it (the Library page does the
 *  same); Create folder adds a folder at the foot of the folders with its
 *  name in an edit field, ready to type over. Folded, the rail is too narrow
 *  for that field, so Create folder asks for the name in a dialog. */
export function StudioRailCreatePlaylist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<"playlist" | "folder" | null>(null);
  const { isRailCollapsed } = useStudioRailCollapsed();
  const createFolder = useCreateStudioPlaylistFolder();
  const label = t("studio:railPlaylists.create.label");
  // The visible "Create" opens the name, so the name keeps its words.
  const triggerLabel = t("studio:railPlaylists.create.triggerLabel");
  const createFolderInPlace = () => {
    if (isRailCollapsed) {
      setDialog("folder");
      return;
    }
    if (createFolder.isPending) return;
    createFolder.mutate(
      { name: t("studio:playlistFolders.defaultName") },
      {
        onSuccess: (folder) => startRailFolderRename(folder.id),
        onError: (error) =>
          showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error"),
      },
    );
  };
  const items: StudioMenuItem[] = [
    {
      id: "createPlaylist",
      label: t("studio:libraryLive.newPlaylistCta"),
      icon: <FiMusic />,
      onSelect: () => setDialog("playlist"),
    },
    {
      id: "createFolder",
      label: t("studio:playlistFolders.create.menuItem"),
      icon: <FiFolderPlus />,
      onSelect: createFolderInPlace,
    },
  ];
  const menuLabel = t("studio:railPlaylists.create.menuLabel");
  return (
    <>
      {isRailCollapsed ? (
        <div className={railCss.createCompact}>
          <StudioMenu
            label={menuLabel}
            items={items}
            placement="bottom-start"
            trigger={
              <IconButton
                aria-label={triggerLabel}
                className={railCss.createTile}
                tooltip={label}
                tooltipPlacement="right"
              >
                <FiPlus aria-hidden />
              </IconButton>
            }
          />
        </div>
      ) : (
        <StudioMenu
          label={menuLabel}
          items={items}
          placement="bottom-start"
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className={styles.railCreate}
              aria-label={triggerLabel}
              aria-busy={createFolder.isPending || undefined}
            >
              <FiPlus aria-hidden /> {label}
            </Button>
          }
        />
      )}
      <AnimatePresence>
        {dialog === "playlist" && (
          <StudioPlaylistDialog
            key="create"
            mode="create"
            onClose={() => setDialog(null)}
            onSaved={(playlist) => {
              setDialog(null);
              void navigate(playlist.href);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog === "folder" && (
          <StudioPlaylistFolderDialog
            key="createFolder"
            mode="create"
            onClose={() => setDialog(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
