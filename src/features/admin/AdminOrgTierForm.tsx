import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
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
            showToast(`${draft.name} was updated`, "success");
            onClose();
          },
          onError: (error) =>
            showToast(describeError("Couldn't save those changes", error), "error"),
        },
      );
    } else {
      createOrgTier.mutate(body, {
        onSuccess: () => {
          showToast(`${draft.name} was created`, "success");
          onClose();
        },
        onError: (error) =>
          showToast(describeError("Couldn't create that tier", error), "error"),
      });
    }
  }

  return (
    <AdminModal
      eyebrow={isEditing ? "Edit tier" : "New tier"}
      title={isEditing ? draft.name || "Edit tier" : "Create a partnership tier"}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={saving}
          >
            {isEditing ? "Save changes" : "Create tier"}
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
