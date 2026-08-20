import { useState, type FormEvent } from "react";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import {
  useCreateResourceListing,
  useUpdateResourceListing,
} from "./api/useAdminResourceListingMutations";
import type {
  AdminResourceListingDTO,
  ResourceListingCategory,
  ResourceListingStatus,
  ResourceListingWriteBody,
} from "./api/adminResourceListings.api";
import styles from "./AdminResourceListingsPage.module.css";

const FORM_ID = "admin-resource-listing-form";

interface ListingFormDraft {
  category: ResourceListingCategory;
  title: string;
  description: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  status: ResourceListingStatus;
}

function draftFromListing(
  listing: AdminResourceListingDTO | null,
): ListingFormDraft {
  return {
    category: listing?.category ?? "legal_aid",
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    region: listing?.region ?? "",
    phone: listing?.phone ?? "",
    email: listing?.email ?? "",
    website: listing?.website ?? "",
    status: listing?.status ?? "active",
  };
}

function draftToWriteBody(draft: ListingFormDraft): ResourceListingWriteBody {
  return {
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim(),
    region: draft.region.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    website: draft.website.trim(),
    status: draft.status,
  };
}

const CATEGORY_VALUES: ResourceListingCategory[] = [
  "legal_aid",
  "sexual_health_testing",
];
const STATUS_VALUES: ResourceListingStatus[] = ["active", "archived"];

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
              describeError("Couldn't save those changes", error),
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
            describeError("Couldn't create that listing", error),
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
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="listing-category">
            {t("admin:adminResourceListings.field.category")}
          </label>
          <Select
            id="listing-category"
            value={draft.category}
            options={CATEGORY_VALUES.map((value) => ({
              value,
              label: t(`admin:adminResourceListings.category.${value}`),
            }))}
            onChange={(value) =>
              patch({
                category: (value ?? draft.category) as ResourceListingCategory,
              })
            }
          />

          <label className={styles.fieldLabel} htmlFor="listing-title">
            {t("admin:adminResourceListings.field.title")}
          </label>
          <input
            id="listing-title"
            className={styles.textInput}
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
            required
          />

          <label className={styles.fieldLabel} htmlFor="listing-description">
            {t("admin:adminResourceListings.field.description")}
          </label>
          <textarea
            id="listing-description"
            className={styles.textarea}
            rows={4}
            value={draft.description}
            onChange={(event) => patch({ description: event.target.value })}
            required
          />

          <label className={styles.fieldLabel} htmlFor="listing-region">
            {t("admin:adminResourceListings.field.region")}
          </label>
          <input
            id="listing-region"
            className={styles.textInput}
            value={draft.region}
            onChange={(event) => patch({ region: event.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="listing-phone">
            {t("admin:adminResourceListings.field.phone")}
          </label>
          <input
            id="listing-phone"
            className={styles.textInput}
            type="tel"
            value={draft.phone}
            onChange={(event) => patch({ phone: event.target.value })}
          />

          <label className={styles.fieldLabel} htmlFor="listing-email">
            {t("admin:adminResourceListings.field.email")}
          </label>
          <input
            id="listing-email"
            className={styles.textInput}
            type="email"
            value={draft.email}
            onChange={(event) => patch({ email: event.target.value })}
          />

          <label className={styles.fieldLabel} htmlFor="listing-website">
            {t("admin:adminResourceListings.field.website")}
          </label>
          <input
            id="listing-website"
            className={styles.textInput}
            value={draft.website}
            onChange={(event) => patch({ website: event.target.value })}
          />

          <label className={styles.fieldLabel} htmlFor="listing-status">
            {t("admin:adminResourceListings.field.status")}
          </label>
          <Select
            id="listing-status"
            value={draft.status}
            options={STATUS_VALUES.map((value) => ({
              value,
              label: t(`admin:adminResourceListings.status.${value}`),
            }))}
            onChange={(value) =>
              patch({ status: (value ?? draft.status) as ResourceListingStatus })
            }
          />
        </div>
      </form>
    </AdminModal>
  );
}
