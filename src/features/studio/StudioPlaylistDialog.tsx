import { useRef, useState } from "react";
import { Button, Collapse, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import {
  STUDIO_PLAYLIST_LIMITS,
  type StudioPlaylistVisibility,
  type UpdateStudioPlaylistBody,
} from "./api/studio.types";
import { useStudioAccess } from "./api/useStudioAccess";
import {
  useCreateStudioPlaylist,
  useUpdateStudioPlaylist,
} from "./api/useStudioPlaylistMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioPlaylistCreditField } from "./StudioPlaylistCreditField";
import { StudioPlaylistVisibilityField } from "./StudioPlaylistVisibilityField";
import css from "./StudioPlaylist.module.css";

export type StudioPlaylistDialogMode = "create" | "edit" | "visibility";

/** An edit body holding only what the member changed, so a credit-only edit
 *  carries no text. The credit goes only when the member picked a different
 *  one: a saved persona missing from the list (still loading, say) shows as
 *  You and keeps its credit until the member chooses. */
function editBodyOf(
  playlist: StudioPlaylistView,
  draft: {
    name: string;
    description: string;
    creditId: string | null;
    creditPersonaId: string | null;
  },
): UpdateStudioPlaylistBody {
  return {
    ...(draft.name !== playlist.name ? { name: draft.name } : {}),
    ...(draft.description !== (playlist.description ?? "")
      ? { description: draft.description }
      : {}),
    ...(draft.creditId !== playlist.creditSubprofileId
      ? { creditSubprofileId: draft.creditPersonaId }
      : {}),
  };
}

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
 * description), edit its details, or change who can open it. Mount it
 * inside AnimatePresence so the shared Modal plays its exit. A persona
 * credit with Connections only shows the link-only note: listing such a
 * playlist anywhere would tell connections who runs the persona.
 */
export function StudioPlaylistDialog({
  mode,
  playlist = null,
  onClose,
  onSaved,
  shouldToastOnSave = true,
}: StudioPlaylistDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { uploadablePersonas } = useStudioAccess();
  const create = useCreateStudioPlaylist();
  const update = useUpdateStudioPlaylist();
  const [name, setName] = useState(playlist?.name ?? "");
  const [description, setDescription] = useState(playlist?.description ?? "");
  const [visibility, setVisibility] = useState<StudioPlaylistVisibility>(
    playlist?.visibility ?? "private",
  );
  const savedCreditId = playlist?.creditSubprofileId ?? null;
  const [creditId, setCreditId] = useState<string | null>(savedCreditId);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  // The last error and persona name stay put while their panels fold away,
  // so a closing panel never flashes an empty line.
  const [errorKey, setErrorKey] = useState("");
  const [isErrorShown, setIsErrorShown] = useState(false);
  const isBusy = create.isPending || update.isPending;
  const showsDetails = mode !== "visibility";
  const trimmedName = name.trim();
  const isNameMissing = showsDetails && trimmedName.length === 0;
  const personaOf = (subprofileId: string | null) =>
    uploadablePersonas.find((persona) => persona.id === subprofileId) ?? null;
  const creditPersona = personaOf(creditId);
  const [noteName, setNoteName] = useState(creditPersona?.name ?? "");

  function chooseCredit(subprofileId: string | null) {
    setCreditId(subprofileId);
    const persona = personaOf(subprofileId);
    if (persona) setNoteName(persona.name);
  }

  async function save(): Promise<StudioPlaylistView> {
    const trimmedDescription = description.trim();
    if (mode === "create")
      return create.mutateAsync({
        name: trimmedName,
        visibility,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(creditPersona ? { creditSubprofileId: creditPersona.id } : {}),
      });
    if (!playlist) throw new Error("A playlist edit needs its playlist");
    const body =
      mode === "edit"
        ? editBodyOf(playlist, {
            name: trimmedName,
            description: trimmedDescription,
            creditId,
            creditPersonaId: creditPersona?.id ?? null,
          })
        : { visibility };
    // Nothing changed: the playlist on screen is already what was saved.
    if (Object.keys(body).length === 0) return playlist;
    return update.mutateAsync({ playlistId: playlist.id, body });
  }

  async function submit() {
    setHasTriedSubmit(true);
    if (isNameMissing) {
      // Focus goes to the field that needs fixing, so its error is read out.
      nameInputRef.current?.focus();
      return;
    }
    if (isBusy) return;
    setIsErrorShown(false);
    try {
      const saved = await save();
      if (shouldToastOnSave)
        showToast(
          t(
            mode === "create"
              ? "studio:playlist.dialog.createdToast"
              : "studio:playlist.dialog.savedToast",
          ),
          "success",
        );
      onSaved(saved);
    } catch (error) {
      setErrorKey(studioErrorMessageKeyOf(error));
      setIsErrorShown(true);
    }
  }

  return (
    <Modal
      title={t(TITLE_KEY[mode])}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("studio:playlist.dialog.cancelCta")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={isBusy || undefined}
            aria-busy={isBusy || undefined}
            onClick={() => void submit()}
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
          void submit();
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
        {mode !== "visibility" && (
          <StudioPlaylistCreditField
            personas={uploadablePersonas}
            value={creditPersona ? creditPersona.id : null}
            onChange={chooseCredit}
          />
        )}
        <div role="status">
          <Collapse
            isOpen={visibility === "connections" && creditPersona !== null}
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
        <Collapse isOpen={isErrorShown}>
          <p className={css.error} role="alert">
            {errorKey && t(errorKey)}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
