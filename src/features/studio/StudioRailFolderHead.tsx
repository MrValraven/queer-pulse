import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { FiChevronRight, FiFolder } from "react-icons/fi";
import { Button, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_PLAYLIST_FOLDER_LIMITS } from "./api/useStudioPlaylistFolders.api";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "./kit/useStudioContextMenu";
import type { StudioPlaylistDropHandlers } from "./StudioRailFolder.drag";
import css from "./StudioRailFolder.module.css";

interface StudioRailFolderHeadProps {
  headRef: Ref<HTMLButtonElement>;
  name: string;
  playlistCount: number;
  listId: string;
  isExpanded: boolean;
  isCompact: boolean;
  isDropOver: boolean;
  dropHandlers: StudioPlaylistDropHandlers;
  onToggle: (isExpanded: boolean) => void;
  onOpenMenu: (point: StudioContextMenuPoint) => void;
  onRenameStart: () => void;
}

/**
 * A folder's disclosure button: chevron, folder icon, name and how many
 * playlists it holds. Enter or Space opens and closes it, Right and Left
 * arrows open and close it, F2 renames it, and right-click, a long-press,
 * the Menu key or Shift+F10 opens its menu. A dragged rail playlist lights
 * it up and lands in it. Folded, it is a folder tile with the name in a
 * tooltip.
 */
export function StudioRailFolderHead({
  headRef,
  name,
  playlistCount,
  listId,
  isExpanded,
  isCompact,
  isDropOver,
  dropHandlers,
  onToggle,
  onOpenMenu,
  onRenameStart,
}: StudioRailFolderHeadProps) {
  const { t } = useTranslation();
  const contextMenu = useStudioContextMenu(onOpenMenu);
  const countLabel = t("studio:playlistFolders.count", {
    count: playlistCount,
  });
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" && !isExpanded) onToggle(true);
    else if (event.key === "ArrowLeft" && isExpanded) onToggle(false);
    else if (event.key === "F2" && !isCompact) onRenameStart();
    else return;
    event.preventDefault();
  };
  return (
    <Tooltip label={name} placement="right" isDisabled={!isCompact}>
      <Button
        ref={headRef}
        variant="quiet"
        className={css.head}
        data-compact={isCompact || undefined}
        data-drop-over={isDropOver || undefined}
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? listId : undefined}
        aria-keyshortcuts="Shift+F10 F2"
        title={isCompact ? undefined : name}
        onClick={() => onToggle(!isExpanded)}
        onKeyDown={onKeyDown}
        {...contextMenu}
        {...dropHandlers}
      >
        {isCompact ? (
          <>
            <span className={css.compactTile} aria-hidden>
              <FiFolder />
            </span>
            <span className="visuallyHidden">
              {name}, {countLabel}
            </span>
          </>
        ) : (
          <>
            <FiChevronRight className={css.chevron} aria-hidden />
            <FiFolder className={css.folderIcon} aria-hidden />
            <span className={css.headText}>
              <span className={css.name}>{name}</span>
              <span className={css.meta}>{countLabel}</span>
            </span>
          </>
        )}
      </Button>
    </Tooltip>
  );
}

/**
 * The folder name as an edit field, in the head's place. Enter or leaving
 * the field saves; Escape keeps the old name. A blank or unchanged name
 * saves nothing. `shouldReturnFocus` says whether focus should go back to
 * the head: always after Enter or Escape, and after a blur only when focus
 * went nowhere, so a save on blur never pulls focus from where the member
 * moved it.
 */
export function StudioRailFolderRenameField({
  name,
  onCommit,
  onCancel,
}: {
  name: string;
  onCommit: (name: string, shouldReturnFocus: boolean) => void;
  onCancel: (shouldReturnFocus: boolean) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDoneRef = useRef(false);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  const finish = (shouldSave: boolean, shouldReturnFocus: boolean) => {
    if (isDoneRef.current) return;
    isDoneRef.current = true;
    const trimmed = draft.trim();
    if (shouldSave && trimmed !== "" && trimmed !== name)
      onCommit(trimmed, shouldReturnFocus);
    else onCancel(shouldReturnFocus);
  };
  return (
    <div className={css.rename}>
      <FiFolder className={css.folderIcon} aria-hidden />
      <input
        ref={inputRef}
        className={css.renameInput}
        value={draft}
        maxLength={STUDIO_PLAYLIST_FOLDER_LIMITS.nameMax}
        aria-label={t("studio:playlistFolders.rename.fieldLabel")}
        enterKeyHint="done"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => finish(true, event.relatedTarget === null)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            finish(true, true);
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            finish(false, true);
          }
        }}
      />
    </div>
  );
}
