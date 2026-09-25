import type { Language } from "../../../shared/i18n/types";
import { EMAIL_PALETTE } from "./design/emailPalette";
import {
  colorCellHtml,
  dotHtml,
  gapCellHtml,
  pageFrameHtml,
  preheaderHtml,
  presentationTable,
} from "./design/emailShared";
import type {
  EmailDesignInput,
  EmailDesignRenderer,
  EmailDesignTheme,
} from "./emailDesign.types";
import { escapeHtml } from "./emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL, EMAIL_WORDMARK } from "./emailTheme";
import { blockToHtml, type EmailBlockContext } from "./renderEmailBlocks";

/**
 * The "current" email design: the site's plum-panel pattern carried into
 * email. A plum masthead with the live-text wordmark tops a paper card, the
 * body sits on paper with a large Fraunces headline, and a plum-deep band
 * closes the card.
 *
 * Every colour comes from `design/emailPalette.ts`, which names the token each
 * hex mirrors and its contrast ratio.
 *
 * Spacing runs on a 4px scale (8, 12, 16, 20, 24, 32, 48). Type runs 13, 16,
 * 22, 34. The 32px gutter reads as generous at 600px and still leaves a
 * 287px measure on a 375px phone, so no media query is needed.
 */
const PALETTE = EMAIL_PALETTE.colors;

const DESIGN_THEME: EmailDesignTheme = {
  colors: {
    page: PALETTE.cream,
    card: PALETTE.paper,
    ink: PALETTE.ink,
    inkMuted: PALETTE.inkMuted,
    heading: PALETTE.plum,
    emphasis: PALETTE.accentText,
    link: PALETTE.accentText,
    line: PALETTE.line,
    buttonFill: PALETTE.accentFill,
    buttonText: PALETTE.paper,
  },
  fonts: EMAIL_PALETTE.fonts,
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

const CARD_GUTTER_PX = 32;
const CARD_RADIUS_PX = 16;
const WORDMARK_ITALIC_PART = "Pulse";

/** "Queer" roman and "Pulse" italic, as the brand wordmark sets it. */
function wordmarkTextHtml(sizePx: number): string {
  const hasItalicPart = EMAIL_WORDMARK.endsWith(WORDMARK_ITALIC_PART);
  const romanPart = hasItalicPart
    ? EMAIL_WORDMARK.slice(0, -WORDMARK_ITALIC_PART.length)
    : EMAIL_WORDMARK;
  const italicPart = hasItalicPart
    ? `<em style="font-style:italic;">${escapeHtml(WORDMARK_ITALIC_PART)}</em>`
    : "";
  return `<span style="font-family:${DESIGN_THEME.fonts.serif};font-size:${sizePx}px;line-height:1;font-weight:600;letter-spacing:-0.01em;color:${PALETTE.cream};">${escapeHtml(romanPart)}${italicPart}</span>`;
}

/** The logo in live text: the coral pulse dot, a gap, then the wordmark. */
function lockupHtml(
  dotSizePx: number,
  gapPx: number,
  wordmarkSizePx: number,
): string {
  const cellsHtml = [
    `<td valign="middle" style="padding:2px 0 0;">${dotHtml(PALETTE.coral, dotSizePx)}</td>`,
    gapCellHtml(gapPx),
    `<td valign="middle">${wordmarkTextHtml(wordmarkSizePx)}</td>`,
  ].join("");
  return presentationTable(`<tr>${cellsHtml}</tr>`);
}

function mastheadRowHtml(): string {
  const { plum } = PALETTE;
  return `<tr><td bgcolor="${plum}" style="padding:32px ${CARD_GUTTER_PX}px;background:${plum};border-radius:${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px 0 0;">${lockupHtml(10, 12, 26)}</td></tr>`;
}

/** Bottom padding is lighter because the last block brings its own gap. */
function bodyRowHtml(bodyHtml: string): string {
  const { colors, fonts } = DESIGN_THEME;
  return `<tr><td bgcolor="${colors.card}" style="padding:48px ${CARD_GUTTER_PX}px 28px;background:${colors.card};font-family:${fonts.sans};color:${colors.ink};">${bodyHtml}</td></tr>`;
}

function footerLinkHtml(): string {
  const siteLabel = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  return `<a href="${escapeHtml(EMAIL_SITE_URL)}" style="color:${PALETTE.accentSoft};text-decoration:none;font-weight:600;">${escapeHtml(siteLabel)}</a>`;
}

function footerRowHtml(language: Language): string {
  const { plumDeep, creamMuted } = PALETTE;
  const textStyle = `font-family:${DESIGN_THEME.fonts.sans};font-size:13px;line-height:1.6;color:${creamMuted};`;
  return [
    `<tr><td bgcolor="${plumDeep}" style="padding:32px ${CARD_GUTTER_PX}px;background:${plumDeep};border-radius:0 0 ${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px;">`,
    lockupHtml(7, 8, 16),
    `<p style="margin:16px 0 0;${textStyle}">${escapeHtml(EMAIL_FOOTER[language])}</p>`,
    `<p style="margin:4px 0 0;${textStyle}">${footerLinkHtml()}</p>`,
    "</td></tr>",
  ].join("\n");
}

function cardHtml(bodyHtml: string, language: Language): string {
  const { card } = DESIGN_THEME.colors;
  return [
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${card}" style="width:100%;max-width:600px;background:${card};border-radius:${CARD_RADIUS_PX}px;">`,
    mastheadRowHtml(),
    bodyRowHtml(bodyHtml),
    footerRowHtml(language),
    "</table>",
  ].join("\n");
}

/** A centred 600px card on cream that goes fluid on phones. Table layout and
 *  inline styles only, so it survives a paste into Gmail, Outlook and Mail.
 *  The head predates `emailDocumentHtml` and stays as it was, so emails
 *  without the new blocks render byte for byte as before. */
function wrapInEmailShell(bodyHtml: string, input: EmailDesignInput): string {
  const { page } = DESIGN_THEME.colors;
  return [
    "<!doctype html>",
    `<html lang="${input.language}">`,
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(input.subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${page};">`,
    preheaderHtml(input.preheader, page),
    pageFrameHtml(page, "32px 12px 40px", cardHtml(bodyHtml, input.language)),
    "</body></html>",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

/** Three 6px dots in plum, coral and jade, centred. Coral is a fill here (2.91:1
 *  on paper is enough for a decorative mark; it carries no text). */
function dividerDotsHtml(): string {
  const dotColors = [PALETTE.plum, PALETTE.coral, PALETTE.jade];
  const dotCells = dotColors.map((color) => colorCellHtml(color, 6, 6, "50%"));
  return [
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:12px 0 32px;">',
    presentationTable(`<tr>${dotCells.join(gapCellHtml(10))}</tr>`),
    "</td></tr></table>",
  ].join("");
}

const DIVIDER_HTML = dividerDotsHtml();

/** Draws a whole block-built email in the current design. */
export const renderCurrentEmail: EmailDesignRenderer = (input) => {
  const context: EmailBlockContext = {
    values: input.values,
    language: input.language,
    assetOrigin: input.assetOrigin,
    theme: DESIGN_THEME,
    dividerHtml: DIVIDER_HTML,
  };
  const bodyHtml = input.blocks
    .map((block) => blockToHtml(block, context))
    .join("\n");
  return wrapInEmailShell(bodyHtml, input);
};
