import { useMemo } from "react";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EmailBlock, EmailLocaleContent } from "./emailTemplate.types";
import {
  sampleValuesFor,
  type EmailTemplatePurpose,
} from "./emailTemplatePurposes";
import { unknownTokensIn } from "./emailTemplateDraft";
import type { FocusFieldHandler } from "./editor/activeField";
import { EmailBlockEditor } from "./editor/EmailBlockEditor";
import { EmailHtmlEditor } from "./editor/EmailHtmlEditor";
import { EmailPlaceholderChips } from "./editor/EmailPlaceholderChips";
import { EmailPreviewFrame } from "./editor/EmailPreviewFrame";
import { EmailTextField } from "./editor/EmailTextField";
import { EmailTemplateModeActions } from "./EmailTemplateModeActions";
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
  onInsertToken: (token: string) => void;
}

export function EmailTemplateLocalePane({
  locale,
  purpose,
  content,
  onUpdate,
  onFocusField,
  onInsertToken,
}: EmailTemplateLocalePaneProps) {
  const { t } = useTranslation();
  const previewHtml = useMemo(
    () => renderEmail(content, sampleValuesFor(locale), locale).html,
    [content, locale],
  );
  const unknownTokens = unknownTokensIn(content, purpose);
  const onBlocksChange = (update: (blocks: EmailBlock[]) => EmailBlock[]) =>
    onUpdate((current) => ({ ...current, blocks: update(current.blocks) }));

  return (
    <div className={styles.pane}>
      <EmailTextField
        id={`email-subject-${locale}`}
        label={t("admin:emailTemplates.editor.subjectField")}
        value={content.subject}
        maxLength={200}
        onFocusField={onFocusField}
        onChange={(subject) => onUpdate((current) => ({ ...current, subject }))}
      />
      <EmailPlaceholderChips purpose={purpose} onInsert={onInsertToken} />
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
      <EmailTemplateModeActions
        content={content}
        locale={locale}
        onUpdate={onUpdate}
      />
      <div className={styles.workspace}>
        <div className={styles.workspaceEditor}>
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
        <EmailPreviewFrame html={previewHtml} />
      </div>
    </div>
  );
}
