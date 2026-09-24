import type { Language } from "../../../shared/i18n/types";
import type { EmailDesignSpec, EmailDesignTheme } from "./emailDesign.types";
import { escapeHtml } from "./emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_WORDMARK } from "./emailTheme";

/**
 * The original design. Email clients cannot read CSS custom properties, so the
 * tokens in `src/styles/tokens/colors.css` are copied here as hex. Each line
 * names the token it mirrors; change both together.
 */
const CURRENT_THEME: EmailDesignTheme = {
  colors: {
    page: "#f7f3ee", // --cream
    card: "#ffffff", // --paper
    ink: "#1a1a1f", // --ink
    inkMuted: "#717174", // --ink-60 flattened onto --paper
    heading: "#1a1a1f", // --ink
    emphasis: "#a84430", // --accent-text (5.94:1 on paper)
    link: "#a84430", // --accent-text (5.94:1 on paper)
    line: "#e4e1dc", // --line flattened onto --paper
    buttonFill: "#d5431e", // --accent-fill (4.52:1 with a white label)
    buttonText: "#ffffff",
  },
  fonts: {
    serif: "Georgia, 'Times New Roman', serif",
    sans: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  headingSizePx: { 1: 26, 2: 20 },
  headingLineHeight: 1.25,
  headingLetterSpacing: "0",
  headingWeight: 700,
  bodySizePx: 16,
  bodyLineHeight: 1.6,
  blockGapPx: 16,
  buttonRadiusPx: 999,
  buttonPaddingCss: "14px 28px",
  buttonFontSizePx: 16,
  buttonMarginCss: "8px 0 24px",
  spacerPx: { sm: 8, md: 16, lg: 32 },
};

/** A centred 600px card with the wordmark on top and the footer below it.
 *  Table layout and inline styles only, for Outlook. */
function wrapCurrentShell(
  bodyHtml: string,
  subject: string,
  language: Language,
): string {
  const { colors, fonts } = CURRENT_THEME;
  return [
    "<!doctype html>",
    `<html lang="${language}">`,
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${colors.page};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${colors.page};">`,
    '<tr><td align="center" style="padding:24px 12px;">',
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${colors.card};border-radius:16px;">`,
    `<tr><td style="padding:28px 32px 8px;font-family:${fonts.serif};font-size:22px;font-weight:700;color:${colors.link};">${EMAIL_WORDMARK}</td></tr>`,
    `<tr><td style="padding:8px 32px 32px;">${bodyHtml}</td></tr>`,
    "</table>",
    `<p style="margin:16px 0 0;font-family:${fonts.sans};font-size:12px;line-height:1.5;color:${colors.inkMuted};">${escapeHtml(EMAIL_FOOTER[language])}</p>`,
    "</td></tr></table>",
    "</body></html>",
  ].join("\n");
}

export const EMAIL_DESIGN_CURRENT: EmailDesignSpec = {
  theme: CURRENT_THEME,
  wrapShell: wrapCurrentShell,
  dividerHtml: `<hr style="border:0;border-top:1px solid ${CURRENT_THEME.colors.line};margin:24px 0;">`,
};
