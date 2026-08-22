import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import {
  useCreateOrgTier,
  useUpdateOrgTier,
} from "./api/useAdminOrgTierMutations";
import {
  AdminOrgTierContentFields,
  AdminOrgTierCtaFields,
} from "./AdminOrgTierFormFields";
import {
  draftFromOrgTier,
  draftToOrgTierWriteBody,
  type OrgTierFormDraft,
} from "./adminOrgTierForm.utils";
import type { OrgTierAdminDTO } from "../marketing/api/adminOrgTiers.api";
import styles from "./AdminOrgTiersPage.module.css";

const FORM_ID = "admin-org-tier-form";

/**
 * Create/edit modal for a partnership tier. `tier` is null for "New tier"
 * and the existing record for "Edit" — the form seeds its draft from it
 * once and owns all field state locally. Submitting calls the matching
 * mutation (no-op in demo mode, per useAdminOrgTierMutations) and closes on
 * success.
 */
export function AdminOrgTierForm({
  tier,
  onClose,
}: {
  tier: OrgTierAdminDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createOrgTier = useCreateOrgTier();
  const updateOrgTier = useUpdateOrgTier();
  const [draft, setDraft] = useState<OrgTierFormDraft>(() =>
    draftFromOrgTier(tier),
  );
  const isEditing = tier !== null;
  const saving = createOrgTier.isPending || updateOrgTier.isPending;

  function patch(changes: Partial<OrgTierFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draftToOrgTierWriteBody(draft);

    if (tier) {
      updateOrgTier.mutate(
        { id: tier.id, body },
        {
          onSuccess: () => {
            showToast(
              t("admin:orgTier.toast.updated", { name: draft.name }),
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
      createOrgTier.mutate(body, {
        onSuccess: () => {
          showToast(
            t("admin:orgTier.toast.created", { name: draft.name }),
            "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.createTier"),
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
          ? t("admin:orgTier.form.editEyebrow")
          : t("admin:orgTier.newCta")
      }
      title={
        isEditing
          ? draft.name || t("admin:orgTier.form.editTitle")
          : t("admin:orgTier.form.createTitle")
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
              : t("admin:orgTier.form.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <AdminOrgTierContentFields draft={draft} onChange={patch} />
        <AdminOrgTierCtaFields draft={draft} onChange={patch} />
      </form>
    </AdminModal>
  );
}
