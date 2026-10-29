import { useState } from "react";
import { flushSync } from "react-dom";
import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useIsMountedRef } from "../marketing/listBusiness/editor/useIsMountedRef";
import {
  flashField,
  resolveListing422,
} from "../marketing/listBusiness/listing422";
import type {
  MissingField,
  PendingListing,
} from "../marketing/listBusiness/listBusiness.data";
import type { ListingForm } from "../marketing/listBusiness/useListingForm";
import { isListingHasOwnerError } from "./api/adminListingEdit.api";
import { useAdminUpdateListing } from "./api/useAdminListingEdit";
import pageStyles from "../marketing/listBusiness/ListBusinessPage.module.css";

/** Where the admin editor stands: the form, the save in flight, or done. */
export type AdminListingEditorPhase = "form" | "sending" | "success";

const scrollToTop = (prefersReducedMotion: boolean) =>
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

/**
 * The toast for a save that failed without naming a field. The server's own
 * reason wins when it gave one; otherwise the copy names what is known from
 * the failure itself: the listing is gone, this account may not make the
 * edit, the server broke, or the request never reached it.
 */
function adminListingSaveErrorText(error: unknown, t: TFunction): string {
  const reason = reasonFor(error);
  if (reason) return reason;
  if (!(error instanceof ApiError)) {
    return t("admin:listingEdit.saveError.network");
  }
  if (error.status === 404) return t("admin:listingEdit.saveError.notFound");
  if (error.status === 403) return t("admin:listingEdit.saveError.forbidden");
  if (error.status >= 500) return t("admin:listingEdit.saveError.server");
  return t("admin:listingEdit.saveError.refused");
}

/**
 * The admin editor's two ways to send an edit, the save bar's Save (`save`)
 * and the leave dialog's "Save and leave" (`saveAndLeave`), both through
 * `PATCH /admin/listings/:ref` with the same required-field gate the owner
 * editor has.
 *
 * A failure routes the way the owner's does: a 400/422 names a field, which
 * is flashed with the server's message above the form. A 409
 * `LISTING_HAS_OWNER` is committed to the page synchronously (`onHasOwner`),
 * so the has-owner notice replaces the editor before anything else here
 * runs. Every other failure toasts its cause.
 *
 * There is no draft to clear afterwards: the admin console keeps none, since
 * autosave writes member-scoped rows against the signed-in account.
 */
export function useAdminListingEditorSave({
  listingRef,
  form,
  missing,
  prefersReducedMotion,
  onHasOwner,
  onSaved,
}: {
  listingRef: string;
  form: ListingForm;
  missing: MissingField[];
  prefersReducedMotion: boolean;
  onHasOwner: () => void;
  onSaved: () => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { mutateAsync: updateListing } = useAdminUpdateListing();
  const [phase, setPhase] = useState<AdminListingEditorPhase>("form");
  const [savedListing, setSavedListing] = useState<PendingListing | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  // Guards against setState after an unmount mid-save.
  const isMountedRef = useIsMountedRef();
  const { draft } = form;

  /** True when the failure has been handed to the page as "has an owner". */
  const handOwnedListingToPage = (error: unknown): boolean => {
    if (!isListingHasOwnerError(error)) return false;
    flushSync(onHasOwner);
    return true;
  };

  const showSaveFailure = (error: unknown) => {
    const target = resolveListing422(error, { t, language }, { isEdit: true });
    if (target) {
      setServerError(target.message);
      form.setRejectedPhotoSlots(target.photoSlots);
      window.setTimeout(
        () => flashField(target.anchor, pageStyles.fieldFlash),
        80,
      );
      return;
    }
    showToast(adminListingSaveErrorText(error, t), "error");
  };

  const save = async () => {
    if (missing.length > 0) return;
    setServerError(null);
    setPhase("sending");
    scrollToTop(prefersReducedMotion);
    try {
      const saved = await updateListing({ ref: listingRef, draft });
      if (!isMountedRef.current) return;
      setSavedListing(saved);
      setPhase("success");
      onSaved();
      scrollToTop(prefersReducedMotion);
    } catch (error) {
      if (handOwnedListingToPage(error) || !isMountedRef.current) return;
      setPhase("form");
      showSaveFailure(error);
    }
  };

  /** True only once the PATCH succeeded, which hands the exit back to the
   *  unsaved-changes guard; false keeps the admin on the form. */
  const saveAndLeave = async (): Promise<boolean> => {
    if (missing.length > 0) return false;
    setServerError(null);
    try {
      await updateListing({ ref: listingRef, draft });
      return true;
    } catch (error) {
      if (!handOwnedListingToPage(error) && isMountedRef.current) {
        showSaveFailure(error);
      }
      return false;
    }
  };

  return {
    phase,
    savedListing,
    serverError,
    dismissServerError: () => setServerError(null),
    save,
    saveAndLeave,
  };
}
