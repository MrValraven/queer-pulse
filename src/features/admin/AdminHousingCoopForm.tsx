import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminModal } from "./ui";
import { useCreateCoop, useUpdateCoop } from "./api/useAdminHousingMutations";
import {
  AdminHousingCoopIdentityFields,
  AdminHousingCoopEconomicsFields,
} from "./AdminHousingCoopFormFields";
import {
  draftFromCoop,
  draftToWriteBody,
  type CoopFormDraft,
} from "./adminHousingCoopForm.utils";
import type { HousingCoopDTO } from "../economy/api/housingCoop.api";
import styles from "./AdminHousingCoopsPage.module.css";

const FORM_ID = "admin-housing-coop-form";

/**
 * Create/edit modal for a housing coop. `coop` is null for "New co-op" and
 * the existing record for "Edit" — the form seeds its draft from it once and
 * owns all field state locally. Submitting calls the matching mutation
 * (no-op in demo mode, per useAdminHousingMutations) and closes on success.
 */
export function AdminHousingCoopForm({
  coop,
  onClose,
}: {
  coop: HousingCoopDTO | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const createCoop = useCreateCoop();
  const updateCoop = useUpdateCoop();
  const [draft, setDraft] = useState<CoopFormDraft>(() =>
    draftFromCoop(coop),
  );
  const isEditing = coop !== null;
  const saving = createCoop.isPending || updateCoop.isPending;

  function patch(changes: Partial<CoopFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draftToWriteBody(draft, coop?.faces ?? []);

    if (coop) {
      updateCoop.mutate(
        { id: coop.id, body },
        {
          onSuccess: () => {
            showToast(`${draft.name} was updated`, "success");
            onClose();
          },
          onError: () =>
            showToast("Couldn't save those changes — please try again", "error"),
        },
      );
    } else {
      createCoop.mutate(body, {
        onSuccess: () => {
          showToast(`${draft.name} was created`, "success");
          onClose();
        },
        onError: () =>
          showToast("Couldn't create that co-op — please try again", "error"),
      });
    }
  }

  return (
    <AdminModal
      eyebrow={isEditing ? "Edit co-op" : "New co-op"}
      title={isEditing ? draft.name || "Edit co-op" : "Create a housing co-op"}
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
            {isEditing ? "Save changes" : "Create co-op"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        className={styles.editorGrid}
        onSubmit={handleSubmit}
      >
        <AdminHousingCoopIdentityFields draft={draft} onChange={patch} />
        <AdminHousingCoopEconomicsFields draft={draft} onChange={patch} />
      </form>
    </AdminModal>
  );
}
