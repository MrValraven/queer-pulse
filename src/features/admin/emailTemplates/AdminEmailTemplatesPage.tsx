import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { describeError } from "../../../shared/api/errorMessage";
import { Button, FadeIn, SkeletonLine } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal, AdminPageHeader } from "../ui";
import {
  useAdminEmailTemplates,
  useDeleteEmailTemplate,
  useUpdateEmailTemplate,
} from "./api/emailTemplateHooks";
import type { EmailTemplateAdminDTO } from "./emailTemplate.types";
import { AdminEmailTemplatePreviewModal } from "./AdminEmailTemplatePreviewModal";
import { AdminEmailTemplateRows } from "./AdminEmailTemplateRows";
import styles from "./AdminEmailTemplates.module.css";

/**
 * `/admin/email-templates`: the emails staff send by hand. QueerPulse sends
 * none of them; the library exists so the wording is written once and every
 * reviewer copies the same thing.
 */
export function AdminEmailTemplatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();
  const [deleteTarget, setDeleteTarget] =
    useState<EmailTemplateAdminDTO | null>(null);
  const [previewTarget, setPreviewTarget] =
    useState<EmailTemplateAdminDTO | null>(null);
  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  const title = (
    <Translation
      i18nKey="admin:emailTemplates.title"
      components={{ em: <em /> }}
    />
  );

  function toastError(messageKey: string, cause: unknown) {
    showToast(
      describeError(t(messageKey), cause, t("shared:apiError.tryAgainTail")),
      "error",
    );
  }

  function toggleActive(template: EmailTemplateAdminDTO) {
    updateTemplate.mutate(
      { id: template.id, body: { isActive: !template.isActive } },
      {
        onError: (cause) => toastError("admin:emailTemplates.saveError", cause),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    deleteTemplate.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(t("admin:emailTemplates.toast.removed", { label }), "info"),
      onError: (cause) => toastError("admin:emailTemplates.removeError", cause),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={title}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:emailTemplates.eyebrow")}
          title={title}
          sub={t("admin:emailTemplates.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => void navigate(routes.adminEmailTemplateNew)}
            >
              {t("admin:emailTemplates.newCta")}
            </Button>
          }
        />
      </FadeIn>
      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={72}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p>
            {isForbidden
              ? t("admin:common.panelForbidden")
              : t("admin:emailTemplates.loadError")}
          </p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className={styles.notice}>
          <p>{t("admin:emailTemplates.empty")}</p>
        </div>
      ) : (
        <AdminEmailTemplateRows
          templates={data}
          onToggleActive={toggleActive}
          onDelete={setDeleteTarget}
          onPreview={setPreviewTarget}
        />
      )}
      {previewTarget && (
        <AdminEmailTemplatePreviewModal
          template={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}
      {deleteTarget && (
        <AdminModal
          title={t("admin:emailTemplates.delete.title", {
            label: deleteTarget.label,
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:emailTemplates.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.dialogBody}>
            {t("admin:emailTemplates.delete.body")}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
