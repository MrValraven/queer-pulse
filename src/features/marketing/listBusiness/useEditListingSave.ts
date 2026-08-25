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
 * Encapsulates the owner editor's "save changes" flow (`ListingEditor`): PATCH
 * the listing, toast, and navigate away.
 *
 * An approved listing stays live through owner edits, so a Live listing lands
 * straight on its public page with the changes already showing. A listing that
 * has not been approved yet (still in review, or waiting on a moderator's
 * question) goes back to the account profile, where `PlacesSection` lists the
 * owner's own listings, and its toast says so instead of implying the edit is
 * now public.
 *
 * `saveEdit` throws on failure so the caller can put the form back on screen
 * and show its own recovery UI.
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
    const isAwaitingModerator =
      editStatus === "review" || editStatus === "question";
    showToast(
      t(
        isAwaitingModerator
          ? "marketing:listBusiness.edit.savedInReview"
          : "marketing:listBusiness.edit.saved",
      ),
      "success",
    );
    if (editStatus === "live" && editSlug) {
      void navigate(`${routes.directory}/${editSlug}`);
    } else {
      void navigate(routes.accountProfile);
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
