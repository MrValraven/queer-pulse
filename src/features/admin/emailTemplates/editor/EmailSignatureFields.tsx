import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EmailBlock } from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { EmailTextField } from "./EmailTextField";
import styles from "./emailTemplateEditor.module.css";

interface EmailSignatureFieldsProps {
  block: Extract<EmailBlock, { type: "signature" }>;
  fieldId: string;
  onChange: (next: EmailBlock) => void;
  onFocusField: FocusFieldHandler;
}

/** The person signing the email. Only the name is needed; without a photo the
 *  design shows the pulse mark. Limits match the backend validator. */
export function EmailSignatureFields({
  block,
  fieldId,
  onChange,
  onFocusField,
}: EmailSignatureFieldsProps) {
  const { t } = useTranslation();
  const field = (key: string) => t(`admin:emailTemplates.blocks.field.${key}`);
  return (
    <div className={styles.fieldStack}>
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-name`}
        label={field("signatureName")}
        maxLength={80}
        value={block.name}
        onChange={(name) => onChange({ ...block, name })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-role`}
        label={field("signatureRole")}
        maxLength={120}
        value={block.role}
        onChange={(role) => onChange({ ...block, role })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-note`}
        label={field("signatureNote")}
        maxLength={200}
        value={block.note}
        onChange={(note) => onChange({ ...block, note })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-photo`}
        label={field("signaturePhoto")}
        maxLength={2000}
        inputMode="url"
        hint={field("signaturePhotoHint")}
        value={block.photoUrl}
        onChange={(photoUrl) => onChange({ ...block, photoUrl })}
      />
      {/* Temporary: delete with the losing designs. */}
      <p className={styles.blockNote}>{field("signatureLetterHint")}</p>
    </div>
  );
}
