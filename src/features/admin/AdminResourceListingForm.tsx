import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import {
  AdminResourceListingContactFields,
  AdminResourceListingDetailsFields,
} from "./AdminResourceListingFormFields";
import {
  draftFromListing,
  draftToWriteBody,
  type ListingFormDraft,
} from "./adminResourceListingForm.utils";
import {
  useCreateResourceListing,
  useUpdateResourceListing,
} from "./api/useAdminResourceListingMutations";
import type { AdminResourceListingDTO } from "./api/adminResourceListings.api";
import styles from "./AdminResourceListingsPage.module.css";

const FORM_ID = "admin-resource-listing-form";

/**
 * Create/edit modal for a resource listing. `listing` is null for "New
 * listing" and the existing record for "Edit" — the form seeds its draft
 * from it once and owns all field state locally. Submitting calls the
 * matching mutation (no-op in demo mode, per useAdminResourceListingMutations)
 * and closes on success.
 */
export function AdminResourceListingForm({
  listing,
  onClose,
}: {
  listing: AdminResourceListingDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createListing = useCreateResourceListing();
  const updateListing = useUpdateResourceListing();
  const [draft, setDraft] = useState<ListingFormDraft>(() =>
    draftFromListing(listing),
  );
  const isEditing = listing !== null;
  const saving = createListing.isPending || updateListing.isPending;

  function patch(changes: Partial<ListingFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draftToWriteBody(draft);

    if (listing) {
      updateListing.mutate(
        { id: listing.id, body },
        {
          onSuccess: () => {
            showToast(
              t("admin:adminResourceListings.toast.updated", {
                title: draft.title,
              }),
              "success",
            );
            onClose();
          },
          onError: (error) =>
            showToast(
              describeError(
                t("admin:errors.saveChanges"),
                error,
                t("shared:apiError.tryAgainTail"),
              ),
              "error",
            ),
        },
      );
    } else {
      createListing.mutate(body, {
        onSuccess: () => {
          showToast(
            t("admin:adminResourceListings.toast.created", {
              title: draft.title,
            }),
            "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.createListing"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      });
    }
  }

  return (
    <AdminModal
      eyebrow={
        isEditing
          ? t("admin:adminResourceListings.form.editEyebrow")
          : t("admin:adminResourceListings.newCta")
      }
      title={
        isEditing
          ? draft.title || t("admin:adminResourceListings.form.editTitle")
          : t("admin:adminResourceListings.form.createTitle")
      }
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={saving}
          >
            {isEditing
              ? t("admin:common.saveChanges")
              : t("admin:adminResourceListings.form.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <AdminResourceListingDetailsFields draft={draft} onChange={patch} />
        <AdminResourceListingContactFields draft={draft} onChange={patch} />
      </form>
    </AdminModal>
  );
}
