import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminModal, AdminPageHeader } from "./ui";
import {
  useAdminModResponseTemplates,
  useDeleteModResponseTemplate,
  useReorderModResponseTemplates,
  useUpdateModResponseTemplate,
} from "./api/AdminResponseTemplateHooks";
import { AdminResponseTemplateRows } from "./AdminResponseTemplateRows";
import { AdminResponseTemplateForm } from "./AdminResponseTemplateForm";
import type { ModResponseTemplateAdminDTO } from "./api/adminModResponseTemplates.api";
import styles from "./AdminResponseTemplates.module.css";

type FormMode =
  { kind: "create" } | { kind: "edit"; template: ModResponseTemplateAdminDTO };

/**
 * The moderator response library (`/admin/mod-response-templates`): the
 * admin-managed set of reusable member-facing decision notes the report
 * drawer's picker offers.
 *
 * Deactivating rather than deleting is the intended everyday move. A wording
 * the team has stopped using disappears from the picker while staying
 * recoverable, and nothing that was already sent to a member is affected
 * either way (the approved text is stored on the action, never a template id).
 */
export function AdminResponseTemplatesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminModResponseTemplates();
  const updateTemplate = useUpdateModResponseTemplate();
  const deleteTemplate = useDeleteModResponseTemplate();
  const reorderTemplates = useReorderModResponseTemplates();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ModResponseTemplateAdminDTO | null>(null);

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  const templates = [...(data ?? [])].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );

  function toastError(messageKey: string, cause: unknown) {
    showToast(
      describeError(t(messageKey), cause, t("shared:apiError.tryAgainTail")),
      "error",
    );
  }

  function toggleActive(template: ModResponseTemplateAdminDTO) {
    updateTemplate.mutate(
      { id: template.id, body: { isActive: !template.isActive } },
      {
        onError: (cause) =>
          toastError("admin:moderation.templates.form.saveError", cause),
      },
    );
  }

  function move(template: ModResponseTemplateAdminDTO, delta: -1 | 1) {
    const index = templates.findIndex((row) => row.id === template.id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= templates.length) return;
    const reordered = [...templates];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    reorderTemplates.mutate(
      reordered.map((row) => row.id),
      {
        onError: (cause) =>
          toastError("admin:moderation.templates.reorderError", cause),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    deleteTemplate.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(
          t("admin:moderation.templates.toast.removed", { label }),
          "info",
        ),
      onError: (cause) =>
        toastError("admin:moderation.templates.removeError", cause),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:moderation.templates.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:moderation.templates.eyebrow")}
          title={
            <Translation
              i18nKey="admin:moderation.templates.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:moderation.templates.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              {t("admin:moderation.templates.newCta")}
            </Button>
          }
        />
      </FadeIn>

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={72}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {isForbidden
              ? t("admin:common.panelForbidden")
              : t("admin:moderation.templates.loadError")}
          </p>
        </div>
      ) : templates.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:moderation.templates.empty")}
          </p>
        </div>
      ) : (
        <AdminResponseTemplateRows
          templates={templates}
          onToggleActive={toggleActive}
          onMove={move}
          onEdit={(template) => setFormMode({ kind: "edit", template })}
          onDelete={setDeleteTarget}
        />
      )}

      {formMode && (
        <AdminResponseTemplateForm
          template={formMode.kind === "edit" ? formMode.template : null}
          onClose={() => setFormMode(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:moderation.templates.delete.title", {
            label: deleteTarget.label,
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:moderation.templates.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:moderation.templates.delete.body")}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
