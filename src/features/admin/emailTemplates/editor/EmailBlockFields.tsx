import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminSeg } from "../../ui";
import type { EmailBlock } from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { EmailFeatureListFields } from "./EmailFeatureListFields";
import { EmailHeroFields, EmailTicketFields } from "./EmailHeroTicketFields";
import { EmailHtmlEditor } from "./EmailHtmlEditor";
import { EmailSignatureFields } from "./EmailSignatureFields";
import { EmailTextField } from "./EmailTextField";
import styles from "./emailTemplateEditor.module.css";

interface EmailBlockFieldsProps {
  block: EmailBlock;
  fieldId: string;
  onChange: (next: EmailBlock) => void;
  onFocusField: FocusFieldHandler;
}

/** The inputs for one block, by type. Limits match the backend validator. */
export function EmailBlockFields({
  block,
  fieldId,
  onChange,
  onFocusField,
}: EmailBlockFieldsProps) {
  const { t } = useTranslation();
  const field = (key: string) => t(`admin:emailTemplates.blocks.field.${key}`);
  const textProps = { onFocusField };
  const blockProps = { fieldId, onChange, onFocusField };

  switch (block.type) {
    case "hero":
      return <EmailHeroFields {...blockProps} block={block} />;
    case "ticket":
      return <EmailTicketFields {...blockProps} block={block} />;
    case "featureList":
      return <EmailFeatureListFields {...blockProps} block={block} />;
    case "signature":
      return <EmailSignatureFields {...blockProps} block={block} />;
    case "heading":
      return (
        <div className={styles.fieldStack}>
          <EmailTextField
            {...textProps}
            id={`${fieldId}-text`}
            label={field("text")}
            maxLength={200}
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
          />
          <span id={`${fieldId}-level`} className={styles.fieldLabel}>
            {field("level")}
          </span>
          <AdminSeg
            ariaLabelledby={`${fieldId}-level`}
            value={String(block.level)}
            onChange={(value) =>
              onChange({ ...block, level: value === "1" ? 1 : 2 })
            }
            options={[
              { value: "1", label: field("levelLarge") },
              { value: "2", label: field("levelSmall") },
            ]}
          />
        </div>
      );
    case "paragraph":
      return (
        <EmailTextField
          {...textProps}
          id={`${fieldId}-text`}
          label={field("text")}
          maxLength={2000}
          isMultiline
          hint={field("paragraphHint")}
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
        />
      );
    case "button":
      return (
        <div className={styles.fieldStack}>
          <EmailTextField
            {...textProps}
            id={`${fieldId}-label`}
            label={field("buttonLabel")}
            maxLength={60}
            value={block.label}
            onChange={(label) => onChange({ ...block, label })}
          />
          <EmailTextField
            {...textProps}
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
    case "image":
      return (
        <div className={styles.fieldStack}>
          <EmailTextField
            {...textProps}
            id={`${fieldId}-src`}
            label={field("imageSrc")}
            maxLength={2000}
            inputMode="url"
            value={block.src}
            onChange={(src) => onChange({ ...block, src })}
          />
          <EmailTextField
            {...textProps}
            id={`${fieldId}-alt`}
            label={field("imageAlt")}
            maxLength={200}
            value={block.alt}
            onChange={(alt) => onChange({ ...block, alt })}
          />
          <label className={styles.fieldLabel} htmlFor={`${fieldId}-width`}>
            {field("imageWidth")}
          </label>
          <input
            id={`${fieldId}-width`}
            className={styles.numberInput}
            type="number"
            min={1}
            max={600}
            value={block.width}
            onChange={(event) =>
              onChange({ ...block, width: Number(event.target.value) })
            }
          />
        </div>
      );
    case "divider":
      return null;
    case "spacer":
      return (
        <div className={styles.fieldStack}>
          <span id={`${fieldId}-size`} className={styles.fieldLabel}>
            {field("spacerSize")}
          </span>
          <AdminSeg
            ariaLabelledby={`${fieldId}-size`}
            value={block.size}
            onChange={(value) =>
              onChange({
                ...block,
                size: value === "sm" || value === "lg" ? value : "md",
              })
            }
            options={[
              { value: "sm", label: field("sizeSm") },
              { value: "md", label: field("sizeMd") },
              { value: "lg", label: field("sizeLg") },
            ]}
          />
        </div>
      );
    case "html":
      return (
        <EmailHtmlEditor
          id={`${fieldId}-html`}
          label={field("html")}
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          onFocusField={onFocusField}
        />
      );
  }
}
