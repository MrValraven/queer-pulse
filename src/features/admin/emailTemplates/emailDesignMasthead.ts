import type { Language } from "../../../shared/i18n/types";
import type { EmailDesignSpec, EmailDesignTheme } from "./emailDesign.types";
import { escapeHtml } from "./emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL, EMAIL_WORDMARK } from "./emailTheme";

/**
 * The Masthead design: the site's plum-panel pattern carried into email. A
 * plum band with the live-text wordmark tops a paper card, the body sits on
 * paper with a large Fraunces headline, and a plum-deep band closes the card.
 *
 * Email clients cannot read CSS custom properties, so every colour is a hex
 * copy of a token in `src/styles/tokens/colors.css` (or a flattened blend of
 * one). Each line names the token it mirrors and, for text, its contrast
 * ratio on the surface it sits on. Change both together.
 *
 * Spacing runs on a 4px scale (8, 12, 16, 20, 24, 32, 48). Type runs 13, 16,
 * 22, 34. The 32px gutter reads as generous at 600px and still leaves a
 * 287px measure on a 375px phone, so no media query is needed.
 */
const MASTHEAD_THEME: EmailDesignTheme = {
  colors: {
    page: "#f7f3ee", // --cream
    card: "#ffffff", // --paper
    ink: "#48484c", // --ink at 80% flattened onto --paper (9.10:1 on paper)
    inkMuted: "#6a6a6d", // --ink at 65% flattened onto --paper (5.39:1 on paper)
    heading: "#2d1b3d", // --plum (15.72:1 on paper)
    emphasis: "#a84430", // --accent-text (5.94:1 on paper)
    link: "#a84430", // --accent-text (5.94:1 on paper)
    line: "#e2dfe4", // --plum at 14% flattened onto --paper
    buttonFill: "#d5431e", // --accent-fill (4.52:1 with a white label)
    buttonText: "#ffffff", // --paper
  },
  fonts: {
    serif: "Fraunces, Georgia, 'Times New Roman', serif",
    sans: "'DM Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  headingSizePx: { 1: 34, 2: 22 },
  headingLineHeight: 1.18,
  headingLetterSpacing: "-0.01em",
  headingWeight: 600,
  bodySizePx: 16,
  bodyLineHeight: 1.65,
  blockGapPx: 20,
  buttonRadiusPx: 999,
  buttonPaddingCss: "18px 36px",
  buttonFontSizePx: 16,
  buttonMarginCss: "12px 0 32px",
  spacerPx: { sm: 8, md: 24, lg: 48 },
};

/** Chrome colours the block theme does not name. */
const MASTHEAD_CHROME = {
  plum: "#2d1b3d", // --plum
  plumDeep: "#241430", // --plum-deep
  coral: "#e8775a", // --accent, a fill only (the pulse dot, a divider dot)
  jade: "#4a8c6f", // --jade, a fill only (a divider dot)
  cream: "#f7f3ee", // --cream (14.23:1 on plum, 15.61:1 on plum deep)
  creamMuted: "#b8b0b5", // --cream at 70% flattened onto --plum-deep (8.14:1 on plum deep)
  accentSoft: "#ffc4af", // --accent-soft (11.31:1 on plum deep)
} as const;

const CARD_GUTTER_PX = 32;
const CARD_RADIUS_PX = 16;
const WORDMARK_ITALIC_PART = "Pulse";

/** A solid-colour table cell. `bgcolor` covers Outlook desktop, which also
 *  ignores the radius, so round dots fall back to small squares there. */
function colorCellHtml(
  color: string,
  widthPx: number,
  heightPx: number,
  radiusCss: string,
): string {
  return `<td width="${widthPx}" height="${heightPx}" bgcolor="${color}" style="width:${widthPx}px;height:${heightPx}px;background:${color};border-radius:${radiusCss};font-size:0;line-height:0;">&nbsp;</td>`;
}

/** A round dot in its own one-cell table, so the row height around it cannot
 *  stretch it into a pill. */
function dotHtml(color: string, sizePx: number): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${colorCellHtml(color, sizePx, sizePx, "50%")}</tr></table>`;
}

/** "Queer" roman and "Pulse" italic, as the brand wordmark sets it. */
function wordmarkTextHtml(sizePx: number): string {
  const hasItalicPart = EMAIL_WORDMARK.endsWith(WORDMARK_ITALIC_PART);
  const romanPart = hasItalicPart
    ? EMAIL_WORDMARK.slice(0, -WORDMARK_ITALIC_PART.length)
    : EMAIL_WORDMARK;
  const italicPart = hasItalicPart
    ? `<em style="font-style:italic;">${escapeHtml(WORDMARK_ITALIC_PART)}</em>`
    : "";
  return `<span style="font-family:${MASTHEAD_THEME.fonts.serif};font-size:${sizePx}px;line-height:1;font-weight:600;letter-spacing:-0.01em;color:${MASTHEAD_CHROME.cream};">${escapeHtml(romanPart)}${italicPart}</span>`;
}

/** The logo in live text: the coral pulse dot, a gap, then the wordmark. */
function lockupHtml(
  dotSizePx: number,
  gapPx: number,
  wordmarkSizePx: number,
): string {
  return [
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>',
    `<td valign="middle" style="padding:2px 0 0;">${dotHtml(MASTHEAD_CHROME.coral, dotSizePx)}</td>`,
    `<td width="${gapPx}" style="width:${gapPx}px;font-size:0;line-height:0;">&nbsp;</td>`,
    `<td valign="middle">${wordmarkTextHtml(wordmarkSizePx)}</td>`,
    "</tr></table>",
  ].join("");
}

function mastheadRowHtml(): string {
  const { plum } = MASTHEAD_CHROME;
  return `<tr><td bgcolor="${plum}" style="padding:32px ${CARD_GUTTER_PX}px;background:${plum};border-radius:${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px 0 0;">${lockupHtml(10, 12, 26)}</td></tr>`;
}

/** Bottom padding is lighter because the last block brings its own gap. */
function bodyRowHtml(bodyHtml: string): string {
  const { colors, fonts } = MASTHEAD_THEME;
  return `<tr><td bgcolor="${colors.card}" style="padding:48px ${CARD_GUTTER_PX}px 28px;background:${colors.card};font-family:${fonts.sans};color:${colors.ink};">${bodyHtml}</td></tr>`;
}

function footerLinkHtml(): string {
  const siteLabel = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  return `<a href="${escapeHtml(EMAIL_SITE_URL)}" style="color:${MASTHEAD_CHROME.accentSoft};text-decoration:none;font-weight:600;">${escapeHtml(siteLabel)}</a>`;
}

function footerRowHtml(language: Language): string {
  const { plumDeep, creamMuted } = MASTHEAD_CHROME;
  const textStyle = `font-family:${MASTHEAD_THEME.fonts.sans};font-size:13px;line-height:1.6;color:${creamMuted};`;
  return [
    `<tr><td bgcolor="${plumDeep}" style="padding:32px ${CARD_GUTTER_PX}px;background:${plumDeep};border-radius:0 0 ${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px;">`,
    lockupHtml(7, 8, 16),
    `<p style="margin:16px 0 0;${textStyle}">${escapeHtml(EMAIL_FOOTER[language])}</p>`,
    `<p style="margin:4px 0 0;${textStyle}">${footerLinkHtml()}</p>`,
    "</td></tr>",
  ].join("\n");
}

function cardHtml(bodyHtml: string, language: Language): string {
  const { card } = MASTHEAD_THEME.colors;
  return [
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${card}" style="width:100%;max-width:600px;background:${card};border-radius:${CARD_RADIUS_PX}px;">`,
    mastheadRowHtml(),
    bodyRowHtml(bodyHtml),
    footerRowHtml(language),
    "</table>",
  ].join("\n");
}

/** A centred 600px card on cream that goes fluid on phones. Table layout and
 *  inline styles only, so it survives a paste into Gmail, Outlook and Mail. */
function wrapMastheadShell(
  bodyHtml: string,
  subject: string,
  language: Language,
): string {
  const { page } = MASTHEAD_THEME.colors;
  return [
    "<!doctype html>",
    `<html lang="${language}">`,
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${page};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${page}" style="background:${page};">`,
    '<tr><td align="center" style="padding:32px 12px 40px;">',
    cardHtml(bodyHtml, language),
    "</td></tr></table>",
    "</body></html>",
  ].join("\n");
}

/** Three 6px dots in plum, coral and jade, centred. Coral is a fill here (2.91:1
 *  on paper is enough for a decorative mark; it carries no text). */
function dividerDotsHtml(): string {
  const gapCell =
    '<td width="10" style="width:10px;font-size:0;line-height:0;">&nbsp;</td>';
  const dotColors = [
    MASTHEAD_CHROME.plum,
    MASTHEAD_CHROME.coral,
    MASTHEAD_CHROME.jade,
  ];
  const dotCells = dotColors.map((color) => colorCellHtml(color, 6, 6, "50%"));
  return [
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:12px 0 32px;">',
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${dotCells.join(gapCell)}</tr></table>`,
    "</td></tr></table>",
  ].join("");
}

export const EMAIL_DESIGN_MASTHEAD: EmailDesignSpec = {
  theme: MASTHEAD_THEME,
  wrapShell: wrapMastheadShell,
  dividerHtml: dividerDotsHtml(),
};
