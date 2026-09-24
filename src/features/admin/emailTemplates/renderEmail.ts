import type { Language } from "../../../shared/i18n/types";
import { EMAIL_DESIGN } from "./emailDesign";
import type { EmailLocaleContent } from "./emailTemplate.types";
import type { EmailFillValues } from "./emailTemplatePurposes";
import { fillPlaceholders } from "./emailInlineMarkup";
import { EMAIL_FOOTER } from "./emailTheme";
import { htmlToPlainText } from "./htmlToPlainText";
import { blockToHtml, blockToText } from "./renderEmailBlocks";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * The ONE renderer: the live preview, "View HTML", "Edit as HTML", "Copy with
 * sample values" and the approved card's copy all call it, so what an admin
 * previews is byte-for-byte what a reviewer pastes. Pure and synchronous.
 *
 * Pass `{}` as `values` to keep every `{token}` literal (used by "Edit as
 * HTML", so the custom HTML still carries its placeholders). Block-built
 * emails wear `EMAIL_DESIGN`; HTML mode passes through as written.
 */
export function renderEmail(
  content: EmailLocaleContent,
  values: EmailFillValues,
  language: Language,
): RenderedEmail {
  const subject = fillPlaceholders(content.subject, values, false);
  if (content.mode === "html") {
    const html = fillPlaceholders(content.html ?? "", values, true);
    return { subject, html, text: htmlToPlainText(html) };
  }
  const bodyHtml = content.blocks
    .map((block) => blockToHtml(block, values))
    .join("\n");
  const textParts = content.blocks
    .map((block) => blockToText(block, values))
    .filter((part) => part.length > 0);
  return {
    subject,
    html: EMAIL_DESIGN.wrapShell(bodyHtml, subject, language),
    text: [...textParts, EMAIL_FOOTER[language]].join("\n\n"),
  };
}
