import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button, FormField, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DESK_VIEW_NAME_MAX, type DeskView } from "../api/deskViews.api";
import { deskViewSaveErrorKey } from "./deskViewErrors";
import styles from "./DeskViews.module.css";

export interface DeskViewsManageRowProps {
  view: DeskView;
  /** Whether another view already uses this name. */
  isNameTaken: (name: string) => boolean;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (view: DeskView) => void;
}

/**
 * One saved view in the manage dialog: its name with Rename and Delete, or,
 * while renaming, an inline name field. Editing in place keeps the editor
 * looking at the list they are tidying. Focus moves into the field on
 * Rename and back to the Rename button when the edit ends, so a keyboard
 * user never lands on the page behind the dialog.
 */
export function DeskViewsManageRow({
  view,
  isNameTaken,
  onRename,
  onDelete,
}: DeskViewsManageRowProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(view.name);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      renameButtonRef.current?.focus();
    }
  }, [isEditing]);

  function startEditing(): void {
    setDraftName(view.name);
    setErrorKey(null);
    setIsEditing(true);
  }

  function stopEditing(): void {
    shouldRestoreFocusRef.current = true;
    setIsEditing(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmedName = draftName.trim();
    if (trimmedName === "" || isSaving) return;
    if (trimmedName === view.name) {
      stopEditing();
      return;
    }
    if (isNameTaken(trimmedName)) {
      setErrorKey("magazine:desk.savedViews.duplicateName");
      return;
    }
    setIsSaving(true);
    try {
      await onRename(view.id, trimmedName);
      stopEditing();
    } catch (error) {
      setErrorKey(deskViewSaveErrorKey(error, false));
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <li className={styles.row}>
        <span className={styles.rowName}>{view.name}</span>
        <IconButton
          ref={renameButtonRef}
          size="sm"
          aria-label={t("magazine:desk.views.renameAria", { name: view.name })}
          onClick={startEditing}
        >
          <FiEdit2 aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("magazine:desk.views.deleteAria", { name: view.name })}
          onClick={() => onDelete(view)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <form
        className={styles.renameForm}
        onSubmit={(event) => void submit(event)}
      >
        <FormField
          label={t("magazine:desk.views.renameLabel", { name: view.name })}
          error={errorKey ? t(errorKey) : undefined}
          className={styles.renameField}
        >
          <input
            ref={inputRef}
            type="text"
            value={draftName}
            maxLength={DESK_VIEW_NAME_MAX}
            autoComplete="off"
            onChange={(event) => {
              setDraftName(event.target.value);
              setErrorKey(null);
            }}
            onKeyDown={(event) => {
              // Escape ends the rename; the dialog stays open.
              if (event.key !== "Escape") return;
              event.stopPropagation();
              stopEditing();
            }}
          />
        </FormField>
        <div className={styles.renameActions}>
          <Button type="button" variant="ghost" size="sm" onClick={stopEditing}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={draftName.trim() === "" || isSaving}
          >
            {t("magazine:desk.views.renameSave")}
          </Button>
        </div>
      </form>
    </li>
  );
}
