import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminDrawer } from "./ui";
import { AdminLegalRequestFields } from "./AdminLegalRequestFields";
import { AdminLegalRequestNotifyFields } from "./AdminLegalRequestNotifyFields";
import {
  useCreateLegalRequest,
  useUpdateLegalRequest,
} from "./api/useAdminLegalRequests";
import {
  draftFromLegalRequest,
  draftToLegalRequestBody,
  emptyLegalRequestDraft,
  legalRequestDraftProblems,
  type LegalRequestFormDraft,
} from "./adminLegalRequestForm.utils";
import {
  isLegalRequestConflict,
  type AdminLegalRequestDTO,
} from "./api/adminLegalRequests.api";
import styles from "./AdminLegalRequestsPage.module.css";

const FORM_ID = "admin-legal-request-form";

/**
 * Create/edit drawer for one register row. `record` is null for "Record a
 * demand" and the existing row for "Amend"; the draft seeds once and the form
 * owns all field state locally, matching `AdminStatusIncidentForm`.
 *
 * THE EDITOR SENDS THE WHOLE RECORD. The server judges its consistency rules on
 * the MERGED row, so sending every field makes the draft this form validated
 * the exact row the server merges. A partial body would let the form approve a
 * shape that the merge then contradicts, and it would also make an emptied
 * field indistinguishable from an untouched one.
 *
 * A voided record is frozen on the backend (409 on PATCH), so the detail pane
 * never offers Amend on one. The conflict wording below is the safety net for
 * the case where a colleague strikes the record while this drawer is open.
 */
export function AdminLegalRequestForm({
  record,
  onClose,
}: {
  record: AdminLegalRequestDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createRecord = useCreateLegalRequest();
  const updateRecord = useUpdateLegalRequest();
  const [draft, setDraft] = useState<LegalRequestFormDraft>(() =>
    record ? draftFromLegalRequest(record) : emptyLegalRequestDraft(),
  );
  const [hasTriedToSave, setHasTriedToSave] = useState(false);

  const isEditing = record !== null;
  const isSaving = createRecord.isPending || updateRecord.isPending;
  const problems = legalRequestDraftProblems(draft);

  function patch(changes: Partial<LegalRequestFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function reportFailure(error: unknown) {
    showToast(
      describeError(
        isLegalRequestConflict(error)
          ? t("admin:legalRequests.error.voidedConflict")
          : t("admin:legalRequests.error.save"),
        error,
        t("shared:apiError.tryAgainTail"),
      ),
      "error",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTriedToSave(true);
    if (problems.length > 0) return;
    const body = draftToLegalRequestBody(draft);

    if (record) {
      updateRecord.mutate(
        { record, body },
        {
          onSuccess: () => {
            showToast(t("admin:legalRequests.toast.updated"), "success");
            onClose();
          },
          onError: reportFailure,
        },
      );
      return;
    }

    createRecord.mutate(body, {
      onSuccess: () => {
        showToast(t("admin:legalRequests.toast.created"), "success");
        onClose();
      },
      onError: reportFailure,
    });
  }

  return (
    <AdminDrawer
      onClose={onClose}
      label={t("admin:legalRequests.form.drawerLabel")}
      head={
        <>
          <p className={styles.drawerEyebrow}>
            {isEditing
              ? t("admin:legalRequests.form.editEyebrow")
              : t("admin:legalRequests.form.createEyebrow")}
          </p>
          <h2 className={styles.drawerTitle}>
            {isEditing
              ? t("admin:legalRequests.form.editTitle")
              : t("admin:legalRequests.form.createTitle")}
          </h2>
        </>
      }
      foot={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:legalRequests.action.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving}
          >
            {isEditing
              ? t("admin:legalRequests.action.save")
              : t("admin:legalRequests.action.record")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.formGrid} onSubmit={handleSubmit}>
        <AdminLegalRequestFields draft={draft} onChange={patch} />
        <AdminLegalRequestNotifyFields draft={draft} onChange={patch} />

        {hasTriedToSave && problems.length > 0 && (
          <ul className={styles.problems}>
            {problems.map((problem) => (
              <li key={problem}>
                {t(`admin:legalRequests.problem.${problem}`)}
              </li>
            ))}
          </ul>
        )}
      </form>
    </AdminDrawer>
  );
}
