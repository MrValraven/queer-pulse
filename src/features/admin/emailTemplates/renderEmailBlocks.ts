import { EMAIL_DESIGN } from "./emailDesign";
import type { EmailBlock } from "./emailTemplate.types";
import type { EmailFillValues } from "./emailTemplatePurposes";
import {
  escapeHtml,
  fillPlaceholders,
  headingMarkupToHtml,
  headingMarkupToText,
  inlineMarkupToHtml,
  inlineMarkupToText,
} from "./emailInlineMarkup";
import { htmlToPlainText } from "./htmlToPlainText";

type EmailHeadingBlock = Extract<EmailBlock, { type: "heading" }>;

const { theme } = EMAIL_DESIGN;
const SANS = `font-family:${theme.fonts.sans};`;

function filledHtml(text: string, values: EmailFillValues): string {
  return fillPlaceholders(escapeHtml(text), values, true);
}

function clampWidth(width: number): number {
  return Math.min(Math.max(Math.round(width) || 600, 1), 600);
}

function headingToHtml(
  block: EmailHeadingBlock,
  values: EmailFillValues,
): string {
  const tag = block.level === 1 ? "h1" : "h2";
  const size = theme.headingSizePx[block.level];
  // "0" emits no declaration, which keeps untracked headings lean.
  const letterSpacing =
    theme.headingLetterSpacing === "0"
      ? ""
      : `letter-spacing:${theme.headingLetterSpacing};`;
  return `<${tag} style="margin:0 0 ${theme.blockGapPx}px;font-family:${theme.fonts.serif};font-size:${size}px;line-height:${theme.headingLineHeight};font-weight:${theme.headingWeight};${letterSpacing}color:${theme.colors.heading};">${headingMarkupToHtml(block.text, values, theme.colors.emphasis)}</${tag}>`;
}

export function blockToHtml(
  block: EmailBlock,
  values: EmailFillValues,
): string {
  switch (block.type) {
    case "heading":
      return headingToHtml(block, values);
    case "paragraph":
      return `<p style="margin:0 0 ${theme.blockGapPx}px;${SANS}font-size:${theme.bodySizePx}px;line-height:${theme.bodyLineHeight};color:${theme.colors.ink};">${inlineMarkupToHtml(block.text, values, theme.colors.link)}</p>`;
    case "button":
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${theme.buttonMarginCss};"><tr><td style="border-radius:${theme.buttonRadiusPx}px;background:${theme.colors.buttonFill};"><a href="${filledHtml(block.href, values)}" style="display:inline-block;padding:${theme.buttonPaddingCss};${SANS}font-size:${theme.buttonFontSizePx}px;font-weight:600;line-height:1;color:${theme.colors.buttonText};text-decoration:none;border-radius:${theme.buttonRadiusPx}px;">${filledHtml(block.label, values)}</a></td></tr></table>`;
    case "image": {
      const width = clampWidth(block.width);
      return `<img src="${filledHtml(block.src, values)}" alt="${filledHtml(block.alt, values)}" width="${width}" style="display:block;width:100%;max-width:${width}px;height:auto;border:0;margin:0 0 ${theme.blockGapPx}px;">`;
    }
    case "divider":
      return EMAIL_DESIGN.dividerHtml;
    case "spacer": {
      const height = theme.spacerPx[block.size];
      return `<div style="height:${height}px;line-height:${height}px;font-size:1px;">&nbsp;</div>`;
    }
    case "html":
      return fillPlaceholders(block.html, values, true);
  }
}

export function blockToText(
  block: EmailBlock,
  values: EmailFillValues,
): string {
  switch (block.type) {
    case "heading":
      return headingMarkupToText(block.text, values);
    case "paragraph":
      return inlineMarkupToText(block.text, values);
    case "button":
      return `${fillPlaceholders(block.label, values, false)}: ${fillPlaceholders(block.href, values, false)}`;
    case "image":
      return fillPlaceholders(block.alt, values, false);
    case "divider":
    case "spacer":
      return "";
    case "html":
      return htmlToPlainText(fillPlaceholders(block.html, values, true));
  }
}
