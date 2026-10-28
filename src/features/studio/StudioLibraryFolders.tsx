import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiChevronRight, FiFolder, FiMoreHorizontal } from "react-icons/fi";
import type { SavedItem } from "../../app/providers/useSaved";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import {
  useStudioPlaylistFolders,
  type StudioPlaylistFolderView,
} from "./api/useStudioPlaylistFolders";
import { StudioMenu } from "./kit/StudioMenu";
import { StudioLibraryGrid } from "./StudioLibraryGrid";
import { StudioLibrarySavedList } from "./StudioLibrarySavedList";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioPlaylistFolderDialog } from "./StudioPlaylistFolderDialog";
import { STUDIO_DISCLOSURE_EXIT, STUDIO_PANEL_OPEN } from "./studioMotion";
import { useStudioFolderMenuItems } from "./StudioRailFolder.menuItems";
import { StudioFolderDeleteConfirm } from "./StudioRailFolderMenu";
import { savedPlaylistIdOf } from "./useStudioLibrarySavedCard";
import styles from "./studio.module.css";
import css from "./StudioLibraryFolders.module.css";

interface LibraryFolderGroup {
  folder: StudioPlaylistFolderView;
  ownPlaylists: StudioPlaylistCardView[];
  savedItems: SavedItem[];
}

type FolderDialog =
  | { kind: "rename"; folder: StudioPlaylistFolderView }
  | { kind: "delete"; folder: StudioPlaylistFolderView };

/** One folder in the Library: a disclosure row with its name and count and
 *  a menu (Rename folder, Delete folder), then its playlists' cards, which
 *  open and close with Collapse. */
function LibraryFolder({
  group,
  isExpanded,
  onToggle,
  onDialog,
}: {
  group: LibraryFolderGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onDialog: (dialog: FolderDialog) => void;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const { folder, ownPlaylists, savedItems } = group;
  const count = ownPlaylists.length + savedItems.length;
  const menuLabel = t("studio:playlistFolders.menu.label", {
    name: folder.name,
  });
  const items = useStudioFolderMenuItems(folder, {
    onRename: () => onDialog({ kind: "rename", folder }),
    onDelete: () => onDialog({ kind: "delete", folder }),
  });
  return (
    <div className={css.folder}>
      <div className={css.head}>
        <Button
          variant="quiet"
          className={css.toggle}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? panelId : undefined}
          onClick={onToggle}
        >
          <FiChevronRight className={css.chevron} aria-hidden />
          <FiFolder className={css.icon} aria-hidden />
          <span className={css.name}>{folder.name}</span>
          <span className={css.count}>
            {t("studio:playlistFolders.count", { count })}
          </span>
        </Button>
        <StudioMenu
          label={menuLabel}
          items={items}
          trigger={
            <IconButton aria-label={menuLabel}>
              <FiMoreHorizontal aria-hidden />
            </IconButton>
          }
        />
      </div>
      <Collapse
        isOpen={isExpanded}
        transition={STUDIO_PANEL_OPEN}
        exitTransition={STUDIO_DISCLOSURE_EXIT}
      >
        <div id={panelId} className={css.panel}>
          <StudioLibraryGrid>
            {ownPlaylists.map((playlist) => (
              <StudioPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </StudioLibraryGrid>
          <StudioLibrarySavedList items={savedItems} />
          <Collapse isOpen={count === 0}>
            <p className={css.empty}>
              {t("studio:playlistFolders.library.emptyHint")}
            </p>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}

/**
 * Library's folders, above the playlists: each folder with the playlists
 * the member filed in it, drawn from the lists the page already shows, so
 * the filter and the sort apply inside folders too. While a filter runs, a
 * folder with no match steps aside and the rest stand open. The section
 * shows once the member has a folder.
 */
export function StudioLibraryFolders({
  ownShown,
  savedShown,
  isFiltering,
}: {
  ownShown: StudioPlaylistCardView[];
  savedShown: SavedItem[];
  isFiltering: boolean;
}) {
  const headingId = useId();
  const { folders } = useStudioPlaylistFolders();
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [dialog, setDialog] = useState<FolderDialog | null>(null);
  const groups: LibraryFolderGroup[] = folders
    .map((folder) => {
      const filed = new Set(folder.playlistIds);
      return {
        folder,
        ownPlaylists: ownShown.filter((playlist) => filed.has(playlist.id)),
        savedItems: savedShown.filter((item) =>
          filed.has(savedPlaylistIdOf(item)),
        ),
      };
    })
    .filter(
      (group) =>
        !isFiltering || group.ownPlaylists.length + group.savedItems.length > 0,
    );
  const toggle = (folderId: string) =>
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  const close = () => setDialog(null);
  return (
    <>
      <Collapse isOpen={groups.length > 0}>
        <section className={styles.row} aria-labelledby={headingId}>
          <div className={styles.rowH}>
            <h2 id={headingId}>
              <Translation
                i18nKey="studio:playlistFolders.library.title"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <ul className={css.list}>
            <AnimatePresence initial={false}>
              {groups.map((group) => (
                <CollapseListItem key={group.folder.id}>
                  <LibraryFolder
                    group={group}
                    isExpanded={isFiltering || expandedIds.has(group.folder.id)}
                    onToggle={() => toggle(group.folder.id)}
                    onDialog={setDialog}
                  />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </Collapse>
      <AnimatePresence>
        {dialog?.kind === "rename" && (
          <StudioPlaylistFolderDialog
            key="rename"
            mode="rename"
            folder={dialog.folder}
            onClose={close}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog?.kind === "delete" && (
          <StudioFolderDeleteConfirm
            key="delete"
            folder={dialog.folder}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
}
