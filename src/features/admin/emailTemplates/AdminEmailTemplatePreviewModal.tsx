import { useMemo, useState } from "react";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { appOrigin } from "../../../shared/lib/inviteUrl";
import { AdminModal } from "../ui";
import { useEmailDesignVariant } from "./emailDesignVariant";
import { fillPlaceholders } from "./emailInlineMarkup";
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
  const sampleValues = useMemo(() => sampleValuesFor(locale), [locale]);
  const { variant } = useEmailDesignVariant();
  const renderedEmail = useMemo(
    () =>
      renderEmail(content, sampleValues, locale, {
        design: variant,
        assetOrigin: appOrigin(),
      }),
    [content, sampleValues, locale, variant],
  );
  const previewPreheader =
    content.mode === "blocks"
      ? fillPlaceholders(content.preheader ?? "", sampleValues, false)
      : "";

  return (
    <AdminModal
      isFullSize
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
      <div className={`${styles.pane} ${styles.previewModalPane}`}>
        <p className={styles.previewNote}>
          {t("admin:emailTemplates.preview.sampleNote")}
        </p>
        <div className={styles.previewModalFrame}>
          <EmailPreviewFrame
            html={renderedEmail.html}
            subject={renderedEmail.subject}
            preheader={previewPreheader}
            recipientName={sampleValues.name ?? ""}
            shouldFillHeight
            headerAside={
              hasPortuguese && (
                <EmailTemplateLocaleTabs
                  active={locale}
                  onChange={setLocale}
                  isLocaleDirty={() => false}
                  isLabelHidden
                />
              )
            }
          />
        </div>
      </div>
    </AdminModal>
  );
}
