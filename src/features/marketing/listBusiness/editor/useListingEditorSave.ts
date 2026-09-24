import { useState } from "react";
import type { ManagedListingDTO } from "../api/listings.api";
import { flashField, resolveListing422 } from "../listing422";
import type { MissingField } from "../listBusiness.data";
import { useEditListingSave } from "../useEditListingSave";
import type { ListingForm } from "../useListingForm";
import { useIsMountedRef } from "./useIsMountedRef";
import pageStyles from "../ListBusinessPage.module.css";

/**
 * The owner editor's two ways to send an edit: the save bar's Save (`save`)
 * and the leave dialog's "Save and leave" (`saveAndLeave`). Both check the
 * same required fields, clear the local autosave, PATCH through `saveEdit`,
 * and route a failure the same way (a 400/422 names a field, anything else
 * toasts).
 *
 * They differ only in what the page does meanwhile. `save` swaps to the
 * sending panel and `saveEdit` navigates on success. `saveAndLeave` keeps the
 * form under the dialog, which shows its own busy state, and skips that
 * navigation: resolving true hands the exit to the unsaved-changes guard, which
 * then completes the move the visitor had asked for.
 */
export function useListingEditorSave({
  listing,
  form,
  missing,
  clearAutosave,
}: {
  listing: ManagedListingDTO;
  form: ListingForm;
  missing: MissingField[];
  clearAutosave: () => void;
}) {
  const editSave = useEditListingSave({
    editRef: listing.ref,
    editSlug: listing.slug,
    editStatus: listing.status,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Guards against setState after an unmount mid-save.
  const isMountedRef = useIsMountedRef();
  const { draft } = form;

  const showSaveFailure = (error: unknown) => {
    // A validation error (400/422) names the offending field: surface the
    // server's message and flash that field, all the routing one screen needs.
    const target = resolveListing422(error);
    if (target) {
      setServerError(target.message);
      form.setRejectedPhotoSlots(target.photoSlots);
      window.setTimeout(
        () => flashField(target.anchor, pageStyles.fieldFlash),
        80,
      );
      return;
    }
    // Anything else is a plain save failure.
    editSave.showSaveError();
  };

  const save = async () => {
    if (missing.length > 0) return;
    setServerError(null);
    setIsSaving(true);
    try {
      // Clear the local copy the moment the edit is genuinely on the server:
      // holding it any longer would offer to "restore" what is now published.
      clearAutosave();
      await editSave.saveEdit(draft);
    } catch (error) {
      if (!isMountedRef.current) return;
      setIsSaving(false);
      showSaveFailure(error);
    }
  };

  /** True only once the PATCH succeeded; false leaves the visitor on the form
   *  with the same error UI the save bar would show. */
  const saveAndLeave = async (): Promise<boolean> => {
    if (missing.length > 0) return false;
    setServerError(null);
    try {
      clearAutosave();
      await editSave.saveEdit(draft, { shouldNavigate: false });
      return true;
    } catch (error) {
      if (isMountedRef.current) showSaveFailure(error);
      return false;
    }
  };

  return {
    isSaving,
    serverError,
    dismissServerError: () => setServerError(null),
    save,
    saveAndLeave,
  };
}
