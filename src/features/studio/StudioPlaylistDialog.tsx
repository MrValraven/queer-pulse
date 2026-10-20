import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import {
  STUDIO_PLAYLIST_LIMITS,
  type StudioPlaylistVisibility,
} from "./api/studio.types";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioPlaylistCreditChangeConfirm } from "./StudioPlaylistCreditChangeConfirm";
import { StudioPlaylistCreditField } from "./StudioPlaylistCreditField";
import { StudioPlaylistVisibilityField } from "./StudioPlaylistVisibilityField";
import {
  useStudioPlaylistDialogSubmit,
  type StudioPlaylistDialogMode,
} from "./useStudioPlaylistDialogSubmit";
import css from "./StudioPlaylist.module.css";

export type { StudioPlaylistDialogMode } from "./useStudioPlaylistDialogSubmit";

const TITLE_KEY: Record<StudioPlaylistDialogMode, string> = {
  create: "studio:playlist.dialog.createTitle",
  edit: "studio:playlist.dialog.editTitle",
  visibility: "studio:playlist.dialog.visibilityTitle",
};
const SUBMIT_KEY: Record<StudioPlaylistDialogMode, string> = {
  create: "studio:playlist.dialog.createCta",
  edit: "studio:playlist.dialog.saveDetailsCta",
  visibility: "studio:playlist.dialog.saveVisibilityCta",
};

interface StudioPlaylistDialogProps {
  mode: StudioPlaylistDialogMode;
  /** The playlist being edited; absent when creating. */
  playlist?: StudioPlaylistView | null;
  onClose: () => void;
  onSaved: (playlist: StudioPlaylistView) => void;
  /** Off when the caller says what happened itself (the add-to-playlist
   *  picker toasts "Added to {name}" once the new playlist holds the
   *  tracks). Defaults to true. */
  shouldToastOnSave?: boolean;
}

/**
 * Create a playlist (name, who can open it, Show as, an optional
 * description), edit its details, or change who can open it. An editor
 * edits the name and the description only. A credit change that would
 * remove editors asks first and names them. Mount it inside AnimatePresence
 * so the shared Modal plays its exit. A persona credit with Connections only
 * shows the link-only note: listing such a playlist anywhere would tell
 * connections who runs the persona.
 */
export function StudioPlaylistDialog({
  mode,
  playlist = null,
  onClose,
  onSaved,
  shouldToastOnSave = true,
}: StudioPlaylistDialogProps) {
  const { t } = useTranslation();
  const { uploadablePersonas } = useStudioAccess();
  // The edit diffs against the playlist as it was when the dialog opened, so
  // a rename another editor saved meanwhile (picked up by the poll) is left
  // as they saved it.
  const [openedPlaylist] = useState(playlist);
  const submitter = useStudioPlaylistDialogSubmit({
    mode,
    playlist: openedPlaylist,
    shouldToastOnSave,
    onSaved,
  });
  const [name, setName] = useState(playlist?.name ?? "");
  const [description, setDescription] = useState(playlist?.description ?? "");
  const [visibility, setVisibility] = useState<StudioPlaylistVisibility>(
    playlist?.visibility ?? "private",
  );
  const [creditId, setCreditId] = useState<string | null>(
    playlist?.creditSubprofileId ?? null,
  );
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isEditorOnly = playlist?.role === "editor";
  const showsDetails = mode !== "visibility";
  const showsCredit = mode !== "visibility" && !isEditorOnly;
  const trimmedName = name.trim();
  const isNameMissing = showsDetails && trimmedName.length === 0;
  const personaOf = (subprofileId: string | null) =>
    uploadablePersonas.find((persona) => persona.id === subprofileId) ?? null;
  const creditPersona = personaOf(creditId);
  // The persona name stays put while its note folds away.
  const [noteName, setNoteName] = useState(creditPersona?.name ?? "");

  function chooseCredit(subprofileId: string | null) {
    setCreditId(subprofileId);
    const persona = personaOf(subprofileId);
    if (persona) setNoteName(persona.name);
  }

  function submit() {
    setHasTriedSubmit(true);
    if (isNameMissing) {
      // Focus goes to the field that needs fixing, so its error is read out.
      nameInputRef.current?.focus();
      return;
    }
    void submitter.submit({
      name: trimmedName,
      description: description.trim(),
      visibility,
      creditId,
      creditPersonaId: creditPersona?.id ?? null,
    });
  }

  return (
    <>
      <Modal
        title={t(TITLE_KEY[mode])}
        onClose={onClose}
        isStudioPlayerSurface
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("studio:playlist.dialog.cancelCta")}
            </Button>
            <Button
              variant="primary"
              aria-disabled={submitter.isBusy || undefined}
              aria-busy={submitter.isBusy || undefined}
              onClick={submit}
            >
              {t(SUBMIT_KEY[mode])}
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
          {showsDetails && (
            <FormField
              className={css.formField}
              label={t("studio:playlist.dialog.nameLabel")}
              required
              error={
                hasTriedSubmit && isNameMissing
                  ? t("studio:playlist.dialog.nameRequired")
                  : undefined
              }
            >
              <input
                ref={nameInputRef}
                value={name}
                maxLength={STUDIO_PLAYLIST_LIMITS.nameMax}
                placeholder={t("studio:playlist.dialog.namePlaceholder")}
                onChange={(event) => setName(event.target.value)}
              />
            </FormField>
          )}
          {mode !== "edit" && (
            <StudioPlaylistVisibilityField
              value={visibility}
              onChange={setVisibility}
            />
          )}
          {showsCredit && (
            <StudioPlaylistCreditField
              personas={uploadablePersonas}
              value={creditPersona ? creditPersona.id : null}
              onChange={chooseCredit}
            />
          )}
          <div role="status">
            <Collapse
              isOpen={
                !isEditorOnly &&
                visibility === "connections" &&
                creditPersona !== null
              }
            >
              <p className={css.note}>
                {t("studio:playlist.dialog.linkOnlyNote", {
                  name: creditPersona?.name ?? noteName,
                })}
              </p>
            </Collapse>
          </div>
          {showsDetails && (
            <FormField
              className={css.formField}
              label={t("studio:playlist.dialog.descriptionLabel")}
              helper={t("studio:playlist.dialog.descriptionHelper")}
            >
              <textarea
                rows={3}
                value={description}
                maxLength={STUDIO_PLAYLIST_LIMITS.descriptionMax}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormField>
          )}
          <Collapse isOpen={submitter.isErrorShown}>
            <p className={css.error} role="alert">
              {submitter.errorKey && t(submitter.errorKey)}
            </p>
          </Collapse>
        </form>
      </Modal>
      <AnimatePresence>
        {submitter.pendingCreditChange && (
          <StudioPlaylistCreditChangeConfirm
            key="credit-change"
            editors={submitter.pendingCreditChange.editors}
            isBusy={submitter.isBusy}
            onConfirm={submitter.confirmCreditChange}
            onCancel={submitter.cancelCreditChange}
          />
        )}
      </AnimatePresence>
    </>
  );
}
