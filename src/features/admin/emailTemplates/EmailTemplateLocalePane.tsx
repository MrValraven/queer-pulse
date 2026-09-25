import { useMemo } from "react";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { appOrigin } from "../../../shared/lib/inviteUrl";
import { useEmailDesignVariant } from "./emailDesignVariant";
import type { EmailBlock, EmailLocaleContent } from "./emailTemplate.types";
import {
  sampleValuesFor,
  type EmailTemplatePurpose,
} from "./emailTemplatePurposes";
import { unknownTokensIn } from "./emailTemplateDraft";
import type { FocusFieldHandler } from "./editor/activeField";
import { EmailBlockEditor } from "./editor/EmailBlockEditor";
import { EmailDesignSwitch } from "./editor/EmailDesignSwitch";
import { EmailHtmlEditor } from "./editor/EmailHtmlEditor";
import { EmailPreviewFrame } from "./editor/EmailPreviewFrame";
import { EmailTextField } from "./editor/EmailTextField";
import { fillPlaceholders } from "./emailInlineMarkup";
import { renderEmail } from "./renderEmail";
import styles from "./AdminEmailTemplates.module.css";

interface EmailTemplateLocalePaneProps {
  locale: Language;
  purpose: EmailTemplatePurpose;
  content: EmailLocaleContent;
  onUpdate: (
    update: (content: EmailLocaleContent) => EmailLocaleContent,
  ) => void;
  onFocusField: FocusFieldHandler;
}

export function EmailTemplateLocalePane({
  locale,
  purpose,
  content,
  onUpdate,
  onFocusField,
}: EmailTemplateLocalePaneProps) {
  const { t } = useTranslation();
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
  // The renderer writes the preheader into block-built emails only, so the
  // mock inbox shows it only then.
  const previewPreheader = useMemo(
    () =>
      content.mode === "blocks"
        ? fillPlaceholders(content.preheader ?? "", sampleValues, false)
        : "",
    [content.mode, content.preheader, sampleValues],
  );
  const unknownTokens = unknownTokensIn(content, purpose);
  const onBlocksChange = (update: (blocks: EmailBlock[]) => EmailBlock[]) =>
    onUpdate((current) => ({ ...current, blocks: update(current.blocks) }));

  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceEditor}>
        {unknownTokens.length > 0 && (
          <ul className={styles.tokenWarnings} role="status">
            {unknownTokens.map((token) => (
              <li key={token}>
                {t("admin:emailTemplates.editor.unknownPlaceholder", {
                  token: `{${token}}`,
                })}
              </li>
            ))}
          </ul>
        )}
        <EmailTextField
          id={`email-subject-${locale}`}
          label={t("admin:emailTemplates.editor.subjectField")}
          value={content.subject}
          maxLength={200}
          onFocusField={onFocusField}
          onChange={(subject) =>
            onUpdate((current) => ({ ...current, subject }))
          }
        />
        <EmailTextField
          id={`email-preheader-${locale}`}
          label={t("admin:emailTemplates.editor.preheaderField")}
          hint={t("admin:emailTemplates.editor.preheaderHint")}
          value={content.preheader ?? ""}
          maxLength={200}
          onFocusField={onFocusField}
          onChange={(preheader) =>
            onUpdate((current) => ({ ...current, preheader }))
          }
        />
        {content.mode === "blocks" ? (
          <EmailBlockEditor
            blocks={content.blocks}
            onBlocksChange={onBlocksChange}
            onFocusField={onFocusField}
            idPrefix={`email-${locale}`}
          />
        ) : (
          <EmailHtmlEditor
            id={`email-html-${locale}`}
            label={t("admin:emailTemplates.mode.htmlField")}
            value={content.html ?? ""}
            onChange={(html) => onUpdate((current) => ({ ...current, html }))}
            onFocusField={onFocusField}
          />
        )}
      </div>
      <div className={styles.workspacePreview}>
        <EmailPreviewFrame
          html={renderedEmail.html}
          subject={renderedEmail.subject}
          preheader={previewPreheader}
          recipientName={sampleValues.name ?? ""}
          shouldFillHeight
          headerAside={<EmailDesignSwitch />}
        />
      </div>
    </div>
  );
}
