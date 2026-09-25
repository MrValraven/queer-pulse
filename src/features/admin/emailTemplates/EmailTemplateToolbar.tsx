import type { Language } from "../../../shared/i18n/types";
import type { EmailLocaleContent } from "./emailTemplate.types";
import type { EmailTemplatePurpose } from "./emailTemplatePurposes";
import { EmailPlaceholderChips } from "./editor/EmailPlaceholderChips";
import { EmailTemplateLocaleTabs } from "./EmailTemplateLocaleTabs";
import { EmailTemplateModeActions } from "./EmailTemplateModeActions";
import styles from "./AdminEmailTemplates.module.css";

interface EmailTemplateToolbarProps {
  locale: Language;
  onLocaleChange: (locale: Language) => void;
  isLocaleDirty: (locale: Language) => boolean;
  purpose: EmailTemplatePurpose;
  /** The active language's content. Missing while that language has no
   *  version yet, and then the band holds the language switch alone. */
  content: EmailLocaleContent | null;
  onUpdate: (
    update: (content: EmailLocaleContent) => EmailLocaleContent,
  ) => void;
  onInsertToken: (token: string) => void;
}

/**
 * The band above the workspace: language switch, placeholder chips and the
 * HTML actions. It lives outside the per-language pane, which remounts on
 * every language change, so the language button keeps keyboard focus.
 */
export function EmailTemplateToolbar({
  locale,
  onLocaleChange,
  isLocaleDirty,
  purpose,
  content,
  onUpdate,
  onInsertToken,
}: EmailTemplateToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <EmailTemplateLocaleTabs
        active={locale}
        onChange={onLocaleChange}
        isLocaleDirty={isLocaleDirty}
        isLabelHidden
      />
      {content && (
        <>
          <EmailPlaceholderChips purpose={purpose} onInsert={onInsertToken} />
          <EmailTemplateModeActions
            key={locale}
            content={content}
            locale={locale}
            onUpdate={onUpdate}
          />
        </>
      )}
    </div>
  );
}
