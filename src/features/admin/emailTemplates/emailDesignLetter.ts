import type { Language } from "../../../shared/i18n/types";
import type { EmailDesignSpec, EmailDesignTheme } from "./emailDesign.types";
import { escapeHtml } from "./emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL, EMAIL_WORDMARK } from "./emailTheme";

/**
 * The Letter design: a quiet, personal note. The wordmark sits on the cream
 * page above a white card, the card carries a slim coral rule on its top edge,
 * and the footer sits back on the cream below it.
 *
 * Email clients cannot read CSS custom properties, so the tokens in
 * `src/styles/tokens/colors.css` are copied here as hex. Each line names the
 * token it mirrors (and, for text, its WCAG contrast on its own background);
 * change both together. Blends are flattened because rgba() borders and text
 * render unevenly across mail clients.
 *
 * Spacing sits on a 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Type
 * steps roughly 1.3x: 13 footer, 17 body and button, 22 wordmark and H2, 34 H1.
 */
const LETTER_THEME: EmailDesignTheme = {
  colors: {
    page: "#f7f3ee", // --cream
    card: "#ffffff", // --paper
    ink: "#3f3f43", // --ink at 84% flattened onto --paper (10.48:1 on paper)
    inkMuted: "#726479", // --plum at 66% flattened onto --cream (4.98:1 on cream)
    heading: "#2d1b3d", // --plum (15.72:1 on paper)
    emphasis: "#a84430", // --accent-text (5.94:1 on paper)
    link: "#a84430", // --accent-text (5.94:1 on paper)
    line: "#e6e4e8", // --line (plum at 12%) flattened onto --paper
    buttonFill: "#d5431e", // --accent-fill (4.52:1 with a white label)
    buttonText: "#ffffff", // --paper
  },
  fonts: {
    serif: "Fraunces, Georgia, 'Times New Roman', serif",
    sans: "'DM Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  headingSizePx: { 1: 34, 2: 22 },
  headingLineHeight: 1.2,
  headingLetterSpacing: "-0.01em",
  // Fraunces medium where installed; Georgia has no 500 and falls to its
  // regular, which keeps the display line light and bookish.
  headingWeight: 500,
  bodySizePx: 17,
  bodyLineHeight: 1.7,
  blockGapPx: 20,
  buttonRadiusPx: 999,
  buttonPaddingCss: "18px 36px",
  buttonFontSizePx: 17,
  buttonMarginCss: "12px 0 32px",
  spacerPx: { sm: 12, md: 24, lg: 48 },
};

/** Shell-only colours: they never reach a block, so they stay out of the theme. */
const LETTER_SHELL_COLORS = {
  pulseDot: "#e8775a", // --accent (the logo's pulse dot, a fill only)
  cardBorder: "#e5e0de", // --line-rgb at 9% (the standard card hairline) flattened onto --cream
  cardRule: "#e8775a", // --accent (a fill only)
  footerLink: "#a84430", // --accent-text (5.38:1 on cream)
} as const;

const TABLE_RESET =
  'role="presentation" cellpadding="0" cellspacing="0" border="0"';

/** "QueerPulse" -> ["Queer", "Pulse"]: the brand sets the second word italic. */
function splitWordmark(wordmark: string): [string, string] {
  const match = /^([A-Z][a-z]*)(.*)$/.exec(wordmark);
  return match ? [match[1] ?? wordmark, match[2] ?? ""] : [wordmark, ""];
}

/** A coloured square cell rounded into a dot (square in Outlook desktop). */
function dotCell(color: string, sizePx: number): string {
  return `<td width="${sizePx}" height="${sizePx}" bgcolor="${color}" style="width:${sizePx}px;height:${sizePx}px;background:${color};border-radius:50%;font-size:0;line-height:0;">&nbsp;</td>`;
}

/** The coral pulse dot then "Queer*Pulse*", as live text so it survives
 *  blocked images and pasting. */
function wordmarkHtml(): string {
  const { colors, fonts } = LETTER_THEME;
  const [romanPart, italicPart] = splitWordmark(EMAIL_WORDMARK);
  return [
    `<table ${TABLE_RESET} align="center"><tr>`,
    `<td valign="middle" style="padding:0 10px 0 0;"><table ${TABLE_RESET}><tr>${dotCell(LETTER_SHELL_COLORS.pulseDot, 9)}</tr></table></td>`,
    `<td valign="middle" style="font-family:${fonts.serif};font-size:22px;line-height:1;font-weight:600;letter-spacing:-0.01em;color:${colors.heading};">${escapeHtml(romanPart)}<em style="font-style:italic;">${escapeHtml(italicPart)}</em></td>`,
    "</tr></table>",
  ].join("");
}

/** The white card: hairline sides, a slim coral rule on its top edge. */
function cardHtml(bodyHtml: string): string {
  const { colors } = LETTER_THEME;
  const { cardBorder, cardRule } = LETTER_SHELL_COLORS;
  return [
    `<table ${TABLE_RESET} width="600" bgcolor="${colors.card}" style="width:100%;max-width:600px;background:${colors.card};border:1px solid ${cardBorder};border-top:3px solid ${cardRule};border-radius:14px;">`,
    `<tr><td bgcolor="${colors.card}" style="padding:44px 40px 28px;background:${colors.card};border-radius:14px;">`,
    bodyHtml,
    "</td></tr></table>",
  ].join("\n");
}

/** Small and centred on the cream: the reason for the email, then the site. */
function footerHtml(language: Language): string {
  const { colors, fonts } = LETTER_THEME;
  const siteLabel = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  const textStyle = `font-family:${fonts.sans};font-size:13px;line-height:1.6;`;
  return [
    `<table ${TABLE_RESET} width="100%" style="max-width:600px;">`,
    `<tr><td align="center" style="padding:0 24px 8px;${textStyle}color:${colors.inkMuted};">${escapeHtml(EMAIL_FOOTER[language])}</td></tr>`,
    `<tr><td align="center" style="padding:0 24px;${textStyle}"><a href="${escapeHtml(EMAIL_SITE_URL)}" style="color:${LETTER_SHELL_COLORS.footerLink};text-decoration:none;font-weight:600;">${escapeHtml(siteLabel)}</a></td></tr>`,
    "</table>",
  ].join("\n");
}

/** Wordmark, card and footer stacked on the cream page. Table layout and
 *  inline styles only, so the markup survives a paste into any mail client. */
function wrapLetterShell(
  bodyHtml: string,
  subject: string,
  language: Language,
): string {
  const { colors } = LETTER_THEME;
  const pageCell = `bgcolor="${colors.page}" style="background:${colors.page};`;
  return [
    "<!doctype html>",
    `<html lang="${language}">`,
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${colors.page};">`,
    `<table ${TABLE_RESET} width="100%" bgcolor="${colors.page}" style="background:${colors.page};">`,
    `<tr><td align="center" ${pageCell}padding:48px 12px 24px;">${wordmarkHtml()}</td></tr>`,
    `<tr><td align="center" ${pageCell}padding:0 12px;">`,
    cardHtml(bodyHtml),
    "</td></tr>",
    `<tr><td align="center" ${pageCell}padding:32px 12px 64px;">`,
    footerHtml(language),
    "</td></tr></table>",
    "</body></html>",
  ].join("\n");
}

/** A section break in a well-set letter: a short coral rule on the text edge. */
const LETTER_DIVIDER_HTML = `<table ${TABLE_RESET} width="100%"><tr><td style="padding:12px 0 32px;"><table ${TABLE_RESET} width="40"><tr><td height="2" bgcolor="${LETTER_SHELL_COLORS.cardRule}" style="width:40px;height:2px;background:${LETTER_SHELL_COLORS.cardRule};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table>`;

export const EMAIL_DESIGN_LETTER: EmailDesignSpec = {
  theme: LETTER_THEME,
  wrapShell: wrapLetterShell,
  dividerHtml: LETTER_DIVIDER_HTML,
};
