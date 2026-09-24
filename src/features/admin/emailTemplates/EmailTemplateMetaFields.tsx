import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminSeg, AdminToggle } from "../ui";
import {
  EMAIL_TEMPLATE_PURPOSE_CODES,
  type EmailTemplatePurpose,
} from "./emailTemplatePurposes";
import type { EmailTemplateDraft } from "./emailTemplateDraft";
import styles from "./AdminEmailTemplates.module.css";

interface EmailTemplateMetaFieldsProps {
  draft: EmailTemplateDraft;
  onChange: (
    patch: Partial<Pick<EmailTemplateDraft, "label" | "purpose" | "isActive">>,
  ) => void;
}

export function EmailTemplateMetaFields({
  draft,
  onChange,
}: EmailTemplateMetaFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.metaRow}>
      <FormField
        label={t("admin:emailTemplates.editor.labelField")}
        className={styles.metaLabel}
      >
        <input
          className={styles.input}
          value={draft.label}
          maxLength={120}
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </FormField>
      <div className={styles.metaGroup}>
        <span id="email-template-purpose" className={styles.metaGroupLabel}>
          {t("admin:emailTemplates.editor.purposeField")}
        </span>
        <AdminSeg
          ariaLabelledby="email-template-purpose"
          value={draft.purpose}
          onChange={(value) =>
            onChange({ purpose: value as EmailTemplatePurpose })
          }
          options={EMAIL_TEMPLATE_PURPOSE_CODES.map((purpose) => ({
            value: purpose,
            label: t(`admin:emailTemplates.purpose.${purpose}`),
          }))}
        />
        <span className={styles.metaHint}>
          {t("admin:emailTemplates.editor.purposeHint")}
        </span>
      </div>
      <div className={styles.metaGroup}>
        <label
          htmlFor="email-template-active"
          className={styles.metaGroupLabel}
        >
          {t("admin:emailTemplates.editor.activeField")}
        </label>
        <AdminToggle
          id="email-template-active"
          checked={draft.isActive}
          onChange={(isActive) => onChange({ isActive })}
        />
      </div>
    </div>
  );
}
