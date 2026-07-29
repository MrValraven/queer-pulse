import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../../shared/hooks/useUnsavedChangesGuard";
import { routes } from "../../../app/routeMap";
import { useUpdateListing } from "./api/useListings";
import type { ListingDraft, ListingStatus } from "./listBusiness.data";

interface EditListingSaveOptions {
  editRef?: string;
  editSlug?: string;
  editStatus?: ListingStatus;
}

/**
 * Encapsulates `ListingWizard`'s edit-mode "save changes" flow: PATCH the
 * listing, toast, and navigate away — a Live listing goes back to its public
 * page, anything else (still under review, etc.) goes back to the account
 * profile, where `PlacesSection` lists the owner's own listings.
 *
 * `saveEdit` throws on failure so the caller can restore the form to the
 * review step and show its own recovery UI.
 */
export function useEditListingSave({
  editRef,
  editSlug,
  editStatus,
}: EditListingSaveOptions) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateListingMutation = useUpdateListing();

  const saveEdit = async (draft: ListingDraft) => {
    await updateListingMutation.mutateAsync({ ref: editRef as string, draft });
    showToast(t("marketing:listBusiness.edit.saved"), "success");
    if (editStatus === "live" && editSlug) {
      navigate(`${routes.directory}/${editSlug}`);
    } else {
      navigate(routes.accountProfile);
    }
  };

  const showSaveError = () =>
    showToast(t("marketing:listBusiness.edit.saveError"), "error");

  return { saveEdit, showSaveError };
}

/** Warns before losing unsaved edits — armed only while editing, the draft
 *  differs from what loaded, and the wizard is on the "form" phase (not
 *  mid-send or already navigating away after a successful save). */
export function useEditUnsavedGuard(
  isEdit: boolean,
  draft: ListingDraft,
  initialDraft: ListingDraft | undefined,
  isFormPhase: boolean,
) {
  const { t } = useTranslation();
  const isDirty =
    isEdit && initialDraft
      ? JSON.stringify(draft) !== JSON.stringify(initialDraft)
      : false;
  useUnsavedChangesGuard({
    active: isDirty && isFormPhase,
    confirmMessage: t("marketing:listBusiness.edit.discardConfirm"),
  });
}
