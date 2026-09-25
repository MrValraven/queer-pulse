import { useMemo } from "react";
import { FiCopy, FiMail } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { appOrigin } from "../../../shared/lib/inviteUrl";
import type { JoinRequestView } from "../api/useJoinRequests";
import { AdminModal } from "../ui";
import type { EmailDesignVariant } from "./emailDesign.types";
import { fillPlaceholders } from "./emailInlineMarkup";
import type { EmailLocaleContent } from "./emailTemplate.types";
import { EmailPreviewFrame } from "./editor/EmailPreviewFrame";
import { EmailTemplateLocaleTabs } from "./EmailTemplateLocaleTabs";
import { renderEmail, type RenderedEmail } from "./renderEmail";
import { useWelcomeEmailCopy } from "./useWelcomeEmailCopy";
import { welcomeEmailValues } from "./welcomeEmailValues";
import styles from "./AdminEmailTemplates.module.css";

interface WelcomeEmailPreviewModalProps {
  item: JoinRequestView;
  /** The template locale the card resolved for `emailLanguage`. */
  content: EmailLocaleContent;
  emailLanguage: Language;
  hasPortuguese: boolean;
  /** Sets the card's language too, so what was previewed is what gets copied. */
  onLanguageChange: (language: Language) => void;
  variant: EmailDesignVariant;
  /** The card's own render, the exact email the copy buttons put on the
   *  clipboard (public site image origin). */
  emailToCopy: RenderedEmail;
  onClose: () => void;
}

/**
 * The welcome email for one approved applicant, filled with their real name,
 * invite link and expiry, shown before the reviewer copies it. It mirrors the
 * library preview modal; the preview render loads hosted images from this
 * app, while the copy buttons use the card's render through the shared copy
 * hook. The modal stays open after copying.
 */
export function WelcomeEmailPreviewModal({
  item,
  content,
  emailLanguage,
  hasPortuguese,
  onLanguageChange,
  variant,
  emailToCopy,
  onClose,
}: WelcomeEmailPreviewModalProps) {
  const { t } = useTranslation();
  const { copyBody, copySubject } = useWelcomeEmailCopy(item.email);
  const values = useMemo(
    () => welcomeEmailValues(item, emailLanguage),
    [item, emailLanguage],
  );
  const previewEmail = useMemo(
    () =>
      renderEmail(content, values, emailLanguage, {
        design: variant,
        assetOrigin: appOrigin(),
      }),
    [content, values, emailLanguage, variant],
  );
  const previewPreheader =
    content.mode === "blocks"
      ? fillPlaceholders(content.preheader ?? "", values, false)
      : "";

  return (
    <AdminModal
      isFullSize
      title={t("admin:emailTemplates.copy.previewTitle", { name: item.name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
          <Button variant="ghost" onClick={() => void copySubject(emailToCopy)}>
            <FiCopy aria-hidden /> {t("admin:emailTemplates.copy.subjectCta")}
          </Button>
          <Button variant="primary" onClick={() => void copyBody(emailToCopy)}>
            <FiMail aria-hidden /> {t("admin:emailTemplates.copy.copyEmailCta")}
          </Button>
        </>
      }
    >
      <div className={`${styles.pane} ${styles.previewModalPane}`}>
        <p className={styles.previewNote}>
          {t("admin:emailTemplates.copy.previewNote", { name: item.name })}
        </p>
        <div className={styles.previewModalFrame}>
          <EmailPreviewFrame
            html={previewEmail.html}
            subject={previewEmail.subject}
            preheader={previewPreheader}
            recipientName={values.name ?? ""}
            frameTitle={t("admin:emailTemplates.copy.previewTitle", {
              name: item.name,
            })}
            shouldFillHeight
            headerAside={
              hasPortuguese && (
                <EmailTemplateLocaleTabs
                  active={emailLanguage}
                  onChange={onLanguageChange}
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
