import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createCoop = useCreateCoop();
  const updateCoop = useUpdateCoop();
  const [draft, setDraft] = useState<CoopFormDraft>(() => draftFromCoop(coop));
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
            showToast(
              t("admin:housingCoop.toast.updated", { name: draft.name }),
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
      createCoop.mutate(body, {
        onSuccess: () => {
          showToast(
            t("admin:housingCoop.toast.created", { name: draft.name }),
            "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.createCoop"),
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
          ? t("admin:housingCoop.form.editEyebrow")
          : t("admin:housingCoop.newCta")
      }
      title={
        isEditing
          ? draft.name || t("admin:housingCoop.form.editTitle")
          : t("admin:housingCoop.form.createTitle")
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
              : t("admin:housingCoop.form.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <AdminHousingCoopIdentityFields draft={draft} onChange={patch} />
        <AdminHousingCoopEconomicsFields draft={draft} onChange={patch} />
      </form>
    </AdminModal>
  );
}
