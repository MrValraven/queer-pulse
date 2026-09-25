import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { HubBackLink, SkeletonLine } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { useAdminEmailTemplate } from "./api/emailTemplateHooks";
import { draftFromTemplate, newDraft } from "./emailTemplateDraft";
import { EmailTemplateForm } from "./EmailTemplateForm";
import styles from "./AdminEmailTemplates.module.css";

/** `/admin/email-templates/new` and `/admin/email-templates/edit/:id`. */
export function AdminEmailTemplateEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const templateId = id ?? null;
  const query = useAdminEmailTemplate(templateId);
  const [freshDraft] = useState(newDraft);
  const isNotFound =
    query.data === null ||
    (query.isError &&
      query.error instanceof ApiError &&
      query.error.status === 404);

  const title =
    templateId === null ? (
      <Translation
        i18nKey="admin:emailTemplates.editor.newTitle"
        components={{ em: <em /> }}
      />
    ) : (
      <Translation
        i18nKey="admin:emailTemplates.editor.editTitle"
        values={{ label: query.data?.label ?? "" }}
        components={{ em: <em /> }}
      />
    );

  return (
    <AdminShell
      title={title}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        {
          label: t("admin:emailTemplates.editor.backToList"),
          to: routes.adminEmailTemplates,
        },
      ]}
      isFullBleed
    >
      <HubBackLink
        to={routes.adminEmailTemplates}
        label={t("admin:emailTemplates.editor.allTemplates")}
      />
      <AdminPageHeader
        eyebrow={t("admin:emailTemplates.eyebrow")}
        title={title}
      />
      {templateId === null ? (
        <EmailTemplateForm templateId={null} initial={freshDraft} />
      ) : query.isLoading ? (
        <SkeletonLine height={320} style={{ borderRadius: 14 }} />
      ) : isNotFound ? (
        <div className={styles.notice}>
          <p>{t("admin:emailTemplates.editor.notFound")}</p>
          <Link to={routes.adminEmailTemplates}>
            {t("admin:emailTemplates.editor.backToList")}
          </Link>
        </div>
      ) : query.isError || !query.data ? (
        <div className={styles.notice}>
          <p>{t("admin:emailTemplates.loadError")}</p>
        </div>
      ) : (
        <EmailTemplateForm
          key={query.data.id}
          templateId={query.data.id}
          initial={draftFromTemplate(query.data)}
        />
      )}
    </AdminShell>
  );
}
