import { useMemo, useState } from "react";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import type { EmailTemplateAdminDTO } from "./emailTemplate.types";
import { sampleValuesFor } from "./emailTemplatePurposes";
import { EmailPreviewFrame } from "./editor/EmailPreviewFrame";
import { EmailTemplateLocaleTabs } from "./EmailTemplateLocaleTabs";
import { renderEmail } from "./renderEmail";
import styles from "./AdminEmailTemplates.module.css";

interface AdminEmailTemplatePreviewModalProps {
  template: EmailTemplateAdminDTO;
  onClose: () => void;
}

/**
 * Read-only look at a template from the library list, rendered with the same
 * sample values the editor preview uses, so staff can check an email without
 * opening the editor.
 */
export function AdminEmailTemplatePreviewModal({
  template,
  onClose,
}: AdminEmailTemplatePreviewModalProps) {
  const { t, language } = useTranslation();
  const hasPortuguese = Boolean(template.locales.pt);
  const [locale, setLocale] = useState<Language>(
    language === "pt" && hasPortuguese ? "pt" : "en",
  );
  const content =
    locale === "pt" && template.locales.pt
      ? template.locales.pt
      : template.locales.en;
  const renderedEmail = useMemo(
    () => renderEmail(content, sampleValuesFor(locale), locale),
    [content, locale],
  );

  return (
    <AdminModal
      wide
      title={template.label}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
          <Button
            variant="primary"
            to={`${routes.adminEmailTemplateEdit}/${template.id}`}
          >
            {t("admin:emailTemplates.list.editCta")}
          </Button>
        </>
      }
    >
      <div className={styles.pane}>
        {hasPortuguese && (
          <EmailTemplateLocaleTabs
            active={locale}
            onChange={setLocale}
            isLocaleDirty={() => false}
          />
        )}
        <div className={styles.metaGroup}>
          <span className={styles.metaGroupLabel}>
            {t("admin:emailTemplates.editor.subjectField")}
          </span>
          <span className={styles.previewSubject}>{renderedEmail.subject}</span>
        </div>
        <p className={styles.previewNote}>
          {t("admin:emailTemplates.preview.sampleNote")}
        </p>
        <EmailPreviewFrame html={renderedEmail.html} />
      </div>
    </AdminModal>
  );
}
