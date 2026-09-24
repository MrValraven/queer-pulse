import type { Language } from "../../../shared/i18n/types";
import type { EmailDesign } from "./emailDesign.types";
import { DEFAULT_EMAIL_DESIGN, EMAIL_DESIGN_SPECS } from "./emailDesigns";
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
 * HTML", so the custom HTML still carries its placeholders). `design` dresses
 * block-built emails only; HTML mode passes through as written.
 */
export function renderEmail(
  content: EmailLocaleContent,
  values: EmailFillValues,
  language: Language,
  design: EmailDesign = DEFAULT_EMAIL_DESIGN,
): RenderedEmail {
  const subject = fillPlaceholders(content.subject, values, false);
  if (content.mode === "html") {
    const html = fillPlaceholders(content.html ?? "", values, true);
    return { subject, html, text: htmlToPlainText(html) };
  }
  const designSpec = EMAIL_DESIGN_SPECS[design];
  const bodyHtml = content.blocks
    .map((block) => blockToHtml(block, values, designSpec))
    .join("\n");
  const textParts = content.blocks
    .map((block) => blockToText(block, values))
    .filter((part) => part.length > 0);
  return {
    subject,
    html: designSpec.wrapShell(bodyHtml, subject, language),
    text: [...textParts, EMAIL_FOOTER[language]].join("\n\n"),
  };
}
