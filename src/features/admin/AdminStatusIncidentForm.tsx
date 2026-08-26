import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminDrawer } from "./ui";
import {
  useCreateStatusIncident,
  useUpdateStatusIncident,
} from "./api/useAdminStatusIncidentMutations";
import { AdminStatusIncidentFields } from "./AdminStatusIncidentFields";
import {
  draftFromIncident,
  draftToWriteBody,
  isDraftComplete,
  type StatusIncidentFormDraft,
} from "./adminStatusIncidentForm.utils";
import type { AdminStatusIncidentDTO } from "./api/adminStatusIncidents.api";
import styles from "./AdminStatusIncidentsPage.module.css";

const FORM_ID = "admin-status-incident-form";

/**
 * Create/edit drawer for one status incident. `incident` is null for "New
 * incident" and the existing record for "Edit"; the draft seeds once and the
 * form owns all field state locally, matching `AdminOrgTierForm`.
 */
export function AdminStatusIncidentForm({
  incident,
  onClose,
}: {
  incident: AdminStatusIncidentDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createIncident = useCreateStatusIncident();
  const updateIncident = useUpdateStatusIncident();
  const [draft, setDraft] = useState<StatusIncidentFormDraft>(() =>
    draftFromIncident(incident),
  );
  const isEditing = incident !== null;
  const isSaving = createIncident.isPending || updateIncident.isPending;

  function patch(changes: Partial<StatusIncidentFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDraftComplete(draft)) {
      showToast(t("system:statusAdmin.error.required"), "error");
      return;
    }
    const body = draftToWriteBody(draft);

    if (incident) {
      updateIncident.mutate(
        { id: incident.id, body },
        {
          onSuccess: () => {
            showToast(t("system:statusAdmin.toast.updated"), "success");
            onClose();
          },
          onError: (error) =>
            showToast(
              describeError(
                t("system:statusAdmin.error.save"),
                error,
                t("shared:apiError.tryAgainTail"),
              ),
              "error",
            ),
        },
      );
      return;
    }

    createIncident.mutate(body, {
      onSuccess: () => {
        showToast(t("system:statusAdmin.toast.created"), "success");
        onClose();
      },
      onError: (error) =>
        showToast(
          describeError(
            t("system:statusAdmin.error.create"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        ),
    });
  }

  return (
    <AdminDrawer
      onClose={onClose}
      label={t("system:statusAdmin.form.drawerLabel")}
      head={
        <>
          <p className={styles.drawerEyebrow}>
            {isEditing
              ? t("system:statusAdmin.form.editEyebrow")
              : t("system:statusAdmin.form.createEyebrow")}
          </p>
          <h2 className={styles.drawerTitle}>
            {isEditing
              ? t("system:statusAdmin.form.editTitle")
              : t("system:statusAdmin.form.createTitle")}
          </h2>
        </>
      }
      foot={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("system:statusAdmin.action.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving}
          >
            {isEditing
              ? t("system:statusAdmin.action.save")
              : t("system:statusAdmin.action.publish")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.formGrid} onSubmit={handleSubmit}>
        <AdminStatusIncidentFields draft={draft} onChange={patch} />
      </form>
    </AdminDrawer>
  );
}
