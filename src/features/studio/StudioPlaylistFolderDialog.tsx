import { useId, useRef, useState } from "react";
import { FiFolder, FiList } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_PLAYLIST_FOLDER_LIMITS } from "./api/useStudioPlaylistFolders.api";
import {
  studioPlaylistFolderErrorKeyOf,
  useCreateStudioPlaylistFolder,
  useMoveStudioPlaylistToFolder,
  useRenameStudioPlaylistFolder,
  useStudioPlaylistFolders,
  type StudioPlaylistFolderView,
} from "./api/useStudioPlaylistFolders";
import css from "./StudioPlaylist.module.css";

/** The playlist a dialog files, by id and name. */
export interface StudioFolderPlaylistRef {
  playlistId: string;
  name: string;
}

export type StudioPlaylistFolderDialogProps =
  | { mode: "create"; playlist?: StudioFolderPlaylistRef; onClose: () => void }
  | { mode: "rename"; folder: StudioPlaylistFolderView; onClose: () => void }
  | { mode: "move"; playlist: StudioFolderPlaylistRef; onClose: () => void };

/**
 * Create a folder (and, from a playlist's menu, file that playlist in it),
 * rename one, or move a playlist into a folder or back out. Mount it inside
 * AnimatePresence so the shared Modal plays its exit.
 */
export function StudioPlaylistFolderDialog(
  props: StudioPlaylistFolderDialogProps,
) {
  return props.mode === "move" ? (
    <FolderMoveDialog playlist={props.playlist} onClose={props.onClose} />
  ) : (
    <FolderNameDialog {...props} />
  );
}

function FolderNameDialog(
  props: Exclude<StudioPlaylistFolderDialogProps, { mode: "move" }>,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateStudioPlaylistFolder();
  const rename = useRenameStudioPlaylistFolder();
  const isRename = props.mode === "rename";
  const playlist = props.mode === "create" ? props.playlist : undefined;
  const [name, setName] = useState(isRename ? props.folder.name : "");
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = create.isPending || rename.isPending;
  const trimmed = name.trim();
  const fail = (error: Error) =>
    showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error");

  function submit() {
    setHasTriedSubmit(true);
    if (trimmed === "") {
      inputRef.current?.focus();
      return;
    }
    if (isBusy) return;
    if (props.mode === "rename") {
      rename.mutate(
        { folderId: props.folder.id, name: trimmed },
        { onSuccess: props.onClose, onError: fail },
      );
      return;
    }
    create.mutate(
      { name: trimmed, playlistId: playlist?.playlistId },
      {
        onSuccess: (folder) => {
          props.onClose();
          showToast(
            playlist
              ? t("studio:playlistFolders.move.movedToast", {
                  playlist: playlist.name,
                  folder: folder.name,
                })
              : t("studio:playlistFolders.create.createdToast", {
                  name: folder.name,
                }),
            "success",
          );
        },
        onError: fail,
      },
    );
  }

  return (
    <Modal
      title={t(
        isRename
          ? "studio:playlistFolders.rename.title"
          : "studio:playlistFolders.create.title",
      )}
      sub={
        playlist
          ? t("studio:playlistFolders.create.withPlaylistSub", {
              name: playlist.name,
            })
          : undefined
      }
      onClose={props.onClose}
      isStudioPlayerSurface
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>
            {t("studio:playlist.dialog.cancelCta")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={isBusy || undefined}
            aria-busy={isBusy || undefined}
            onClick={submit}
          >
            {t(
              isRename
                ? "studio:playlistFolders.rename.saveCta"
                : "studio:playlistFolders.create.createCta",
            )}
          </Button>
        </>
      }
    >
      <form
        className={css.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <FormField
          className={css.formField}
          label={t("studio:playlistFolders.nameLabel")}
          required
          error={
            hasTriedSubmit && trimmed === ""
              ? t("studio:playlistFolders.nameRequired")
              : undefined
          }
        >
          <input
            ref={inputRef}
            value={name}
            maxLength={STUDIO_PLAYLIST_FOLDER_LIMITS.nameMax}
            placeholder={t("studio:playlistFolders.namePlaceholder")}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  );
}

const NO_FOLDER = "";

/** Pick the folder a playlist goes in, or none (the top level). */
function FolderMoveDialog({
  playlist,
  onClose,
}: {
  playlist: StudioFolderPlaylistRef;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const groupName = useId();
  const { folders, folderIdByPlaylistId } = useStudioPlaylistFolders();
  const move = useMoveStudioPlaylistToFolder();
  const [choice, setChoice] = useState(
    folderIdByPlaylistId.get(playlist.playlistId) ?? NO_FOLDER,
  );
  const options = [
    { id: NO_FOLDER, label: t("studio:playlistFolders.move.noFolder") },
    ...folders.map((folder) => ({ id: folder.id, label: folder.name })),
  ];

  function submit() {
    if (move.isPending) return;
    const folderId = choice === NO_FOLDER ? null : choice;
    if (folderId === (folderIdByPlaylistId.get(playlist.playlistId) ?? null)) {
      onClose();
      return;
    }
    const folderName = folders.find((folder) => folder.id === folderId)?.name;
    move.mutate(
      { playlistId: playlist.playlistId, folderId },
      {
        onSuccess: () => {
          onClose();
          showToast(
            folderName
              ? t("studio:playlistFolders.move.movedToast", {
                  playlist: playlist.name,
                  folder: folderName,
                })
              : t("studio:playlistFolders.move.movedOutToast", {
                  playlist: playlist.name,
                }),
            "success",
          );
        },
        onError: (error) =>
          showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error"),
      },
    );
  }

  return (
    <Modal
      title={t("studio:playlistFolders.move.title", { name: playlist.name })}
      onClose={onClose}
      isStudioPlayerSurface
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("studio:playlist.dialog.cancelCta")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={move.isPending || undefined}
            aria-busy={move.isPending || undefined}
            onClick={submit}
          >
            {t("studio:playlistFolders.move.moveCta")}
          </Button>
        </>
      }
    >
      <fieldset className={css.fieldset}>
        <legend className={css.legend}>
          {t("studio:playlistFolders.move.legend")}
        </legend>
        <div className={css.radioCards}>
          {options.map((option) => {
            const Icon = option.id === NO_FOLDER ? FiList : FiFolder;
            return (
              <label key={option.id || "none"} className={css.radioCard}>
                <input
                  type="radio"
                  className={css.radioInput}
                  name={groupName}
                  value={option.id}
                  checked={choice === option.id}
                  onChange={() => setChoice(option.id)}
                />
                <Icon aria-hidden className={css.radioIcon} />
                <span className={css.radioText}>
                  <span className={css.radioTitle}>{option.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </Modal>
  );
}
