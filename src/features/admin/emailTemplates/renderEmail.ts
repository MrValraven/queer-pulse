import type { Language } from "../../../shared/i18n/types";
import type { EmailDesignVariant } from "./emailDesign.types";
import { EMAIL_DESIGNS } from "./emailDesigns";
import type { EmailLocaleContent } from "./emailTemplate.types";
import type { EmailFillValues } from "./emailTemplatePurposes";
import { fillPlaceholders } from "./emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL } from "./emailTheme";
import { htmlToPlainText } from "./htmlToPlainText";
import { blockToText } from "./renderEmailBlocks";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface RenderEmailOptions {
  /** Which design a block-built email wears. Defaults to `current`. */
  design?: EmailDesignVariant;
  /** Origin for hosted images. Defaults to the public site, which is what a
   *  copied email must point at; the live preview passes `appOrigin()`. */
  assetOrigin?: string;
}

/**
 * The ONE renderer: the live preview, "View HTML", "Edit as HTML", "Copy with
 * sample values" and the approved card's copy all call it, so what an admin
 * previews is byte-for-byte what a reviewer pastes, hosted image origin aside.
 * Pure and synchronous.
 *
 * Pass `{}` as `values` to keep every `{token}` literal (used by "Edit as
 * HTML", so the custom HTML still carries its placeholders). Block-built
 * emails wear the chosen design; HTML mode passes through as written.
 */
export function renderEmail(
  content: EmailLocaleContent,
  values: EmailFillValues,
  language: Language,
  options: RenderEmailOptions = {},
): RenderedEmail {
  const subject = fillPlaceholders(content.subject, values, false);
  if (content.mode === "html") {
    const html = fillPlaceholders(content.html ?? "", values, true);
    return { subject, html, text: htmlToPlainText(html) };
  }
  const preheader = fillPlaceholders(content.preheader ?? "", values, false);
  const textParts = content.blocks
    .map((block) => blockToText(block, values))
    .filter((part) => part.length > 0);
  const renderDesign = EMAIL_DESIGNS[options.design ?? "current"];
  return {
    subject,
    html: renderDesign({
      blocks: content.blocks,
      subject,
      preheader,
      values,
      language,
      assetOrigin: options.assetOrigin ?? EMAIL_SITE_URL,
    }),
    text: [...textParts, EMAIL_FOOTER[language]].join("\n\n"),
  };
}
