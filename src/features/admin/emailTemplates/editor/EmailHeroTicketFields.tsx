import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EmailBlock } from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { EmailTextField } from "./EmailTextField";
import styles from "./emailTemplateEditor.module.css";

type BlockOf<Type extends EmailBlock["type"]> = Extract<
  EmailBlock,
  { type: Type }
>;

interface BlockFieldsProps<Type extends EmailBlock["type"]> {
  block: BlockOf<Type>;
  fieldId: string;
  onChange: (next: EmailBlock) => void;
  onFocusField: FocusFieldHandler;
}

/** The opening moment: an optional small line, the headline, optional text.
 *  Limits match the backend validator. */
export function EmailHeroFields({
  block,
  fieldId,
  onChange,
  onFocusField,
}: BlockFieldsProps<"hero">) {
  const { t } = useTranslation();
  const field = (key: string) => t(`admin:emailTemplates.blocks.field.${key}`);
  return (
    <div className={styles.fieldStack}>
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-eyebrow`}
        label={field("heroEyebrow")}
        maxLength={60}
        value={block.eyebrow}
        onChange={(eyebrow) => onChange({ ...block, eyebrow })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-headline`}
        label={field("heroHeadline")}
        maxLength={200}
        hint={field("headlineHint")}
        value={block.headline}
        onChange={(headline) => onChange({ ...block, headline })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-text`}
        label={field("heroText")}
        maxLength={600}
        isMultiline
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
      />
      <p className={styles.blockNote}>{field("heroHint")}</p>
    </div>
  );
}

/** The invite as a pass: label, title, optional text, and its button. */
export function EmailTicketFields({
  block,
  fieldId,
  onChange,
  onFocusField,
}: BlockFieldsProps<"ticket">) {
  const { t } = useTranslation();
  const field = (key: string) => t(`admin:emailTemplates.blocks.field.${key}`);
  return (
    <div className={styles.fieldStack}>
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-label`}
        label={field("ticketLabel")}
        maxLength={60}
        value={block.label}
        onChange={(label) => onChange({ ...block, label })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-title`}
        label={field("ticketTitle")}
        maxLength={200}
        value={block.title}
        onChange={(title) => onChange({ ...block, title })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-text`}
        label={field("ticketText")}
        maxLength={600}
        isMultiline
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-button-label`}
        label={field("buttonLabel")}
        maxLength={60}
        value={block.buttonLabel}
        onChange={(buttonLabel) => onChange({ ...block, buttonLabel })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-href`}
        label={field("buttonHref")}
        maxLength={2000}
        inputMode="url"
        hint={field("buttonHrefHint")}
        value={block.href}
        onChange={(href) => onChange({ ...block, href })}
      />
    </div>
  );
}
