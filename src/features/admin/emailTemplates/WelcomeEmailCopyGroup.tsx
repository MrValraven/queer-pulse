import { useState } from "react";
import { FiCopy, FiMail } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { JoinRequestView } from "../api/useJoinRequests";
import { AdminSeg } from "../ui";
import { useModEmailTemplates } from "./api/emailTemplateHooks";
import { useEmailDesignVariant } from "./emailDesignVariant";
import { copyPlainText, copyRichEmail } from "./copyEmail";
import { renderEmail } from "./renderEmail";
import { welcomeEmailValues } from "./welcomeEmailValues";
import styles from "./WelcomeEmailCopyGroup.module.css";

/**
 * Copies the filled-in welcome email for one approved applicant. QueerPulse
 * sends no email: this puts the email on the reviewer's clipboard, and the
 * toast tells them where to paste it. Hidden unless the invite still works
 * and an active `invite_approved` template exists.
 */
export function WelcomeEmailCopyGroup({ item }: { item: JoinRequestView }) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const isUsable = Boolean(item.inviteCode) && item.inviteStatus === "valid";
  const { data: templates } = useModEmailTemplates("invite_approved", {
    isEnabled: isUsable,
  });
  const [chosenTemplateId, setChosenTemplateId] = useState<string | null>(null);
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(null);
  const { variant } = useEmailDesignVariant();

  const template =
    templates?.find((candidate) => candidate.id === chosenTemplateId) ??
    templates?.[0];
  if (!isUsable || !template) return null;

  const available: Language[] = template.locales.pt ? ["en", "pt"] : ["en"];
  const wanted = chosenLanguage ?? language;
  const emailLanguage: Language = available.includes(wanted) ? wanted : "en";
  const content = template.locales[emailLanguage] ?? template.locales.en;
  const rendered = renderEmail(
    content,
    welcomeEmailValues(item, emailLanguage),
    emailLanguage,
    { design: variant },
  );
  const languageLabelId = `welcome-email-language-${item.id}`;
  const templateSelectId = `welcome-email-template-${item.id}`;

  async function copyBody() {
    const outcome = await copyRichEmail(rendered);
    if (outcome === "failed") {
      showToast(t("admin:emailTemplates.copy.failedToast"), "error");
      return;
    }
    const key = outcome === "rich" ? "copiedToast" : "copiedPlainToast";
    showToast(
      t(`admin:emailTemplates.copy.${key}`, { email: item.email }),
      "success",
    );
  }

  async function copySubject() {
    const isCopied = await copyPlainText(rendered.subject);
    showToast(
      t(
        isCopied
          ? "admin:emailTemplates.copy.subjectCopiedToast"
          : "admin:emailTemplates.copy.failedToast",
      ),
      isCopied ? "success" : "error",
    );
  }

  return (
    <div className={styles.group}>
      {(available.length > 1 || (templates?.length ?? 0) > 1) && (
        <div className={styles.controls}>
          {available.length > 1 && (
            <div className={styles.control}>
              <span id={languageLabelId} className={styles.controlLabel}>
                {t("admin:emailTemplates.copy.languageLabel")}
              </span>
              <AdminSeg
                ariaLabelledby={languageLabelId}
                value={emailLanguage}
                onChange={(value) =>
                  setChosenLanguage(value === "pt" ? "pt" : "en")
                }
                options={available.map((code) => ({
                  value: code,
                  label: t(`admin:emailTemplates.editor.localeTab.${code}`),
                }))}
              />
            </div>
          )}
          {(templates?.length ?? 0) > 1 && (
            <div className={styles.control}>
              <label htmlFor={templateSelectId} className={styles.controlLabel}>
                {t("admin:emailTemplates.copy.templateLabel")}
              </label>
              <select
                id={templateSelectId}
                className={styles.select}
                value={template.id}
                onChange={(event) => setChosenTemplateId(event.target.value)}
              >
                {templates?.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      <div className={styles.actions}>
        <Button variant="primary" size="md" onClick={() => void copyBody()}>
          <FiMail aria-hidden /> {t("admin:emailTemplates.copy.welcomeCta")}
        </Button>
        <Button variant="ghost" size="md" onClick={() => void copySubject()}>
          <FiCopy aria-hidden /> {t("admin:emailTemplates.copy.subjectCta")}
        </Button>
      </div>
    </div>
  );
}
