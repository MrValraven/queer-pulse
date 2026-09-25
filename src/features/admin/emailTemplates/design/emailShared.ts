import type { Language } from "../../../../shared/i18n/types";
import { escapeHtml, hasPlaceholderToken } from "../emailInlineMarkup";
import { EMAIL_LINK_FALLBACK } from "../emailTheme";

/**
 * Pure string builders every email design shares: the document, the
 * preheader, table primitives and hosted images. Tables and inline styles
 * only, so the output survives a paste into Gmail, Outlook and Mail.
 *
 * Text arguments are plain text and are escaped here. Callers fill
 * placeholders first with `fillPlaceholders(text, values, false)`; escaping
 * the filled string equals filling the escaped one, so values stay safe.
 * Colours, fonts and style fragments are trusted design constants.
 */

/** Zero-width joiners and spaces after the preheader, so an inbox snippet
 *  runs out of characters before it reaches the body text. */
const PREHEADER_FILLER = "&#847;&zwnj;&nbsp;".repeat(90);

const TABLE_RESET =
  'role="presentation" cellpadding="0" cellspacing="0" border="0"';

/** The invisible inbox preview line, first thing in `<body>`. Empty text
 *  draws nothing. It stays rendered (zero height, page-coloured, transparent)
 *  because pasting into a WebKit or Blink compose window (Gmail web, Apple
 *  Mail) drops unrendered nodes, and `display:none` would lose the line on
 *  the way into the staff member's email. */
export function preheaderHtml(text: string, pageColor: string): string {
  if (text.trim().length === 0) return "";
  return `<div style="max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${pageColor};opacity:0;">${escapeHtml(text)}${PREHEADER_FILLER}</div>`;
}

export interface EmailDocumentOptions {
  language: Language;
  /** Filled, plain text. */
  subject: string;
  /** Filled, plain text; empty draws no preheader. */
  preheader: string;
  pageColor: string;
  /** Everything inside `<body>` after the preheader, usually `pageFrameHtml`. */
  bodyHtml: string;
}

/** The whole document, doctype to `</html>`, locked to light mode so dark
 *  inboxes do not invert the brand colours. */
export function emailDocumentHtml(options: EmailDocumentOptions): string {
  const { language, subject, preheader, pageColor, bodyHtml } = options;
  return [
    "<!doctype html>",
    `<html lang="${language}">`,
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">',
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${pageColor};">`,
    preheaderHtml(preheader, pageColor),
    bodyHtml,
    "</body></html>",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

/** A full-width page-colour table with one centred cell. Many clients drop
 *  the `<body>` background, so the page colour rides on this table too. */
export function pageFrameHtml(
  pageColor: string,
  paddingCss: string,
  contentHtml: string,
): string {
  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${pageColor}" style="background:${pageColor};">`,
    `<tr><td align="center" style="padding:${paddingCss};">`,
    contentHtml,
    "</td></tr></table>",
  ].join("\n");
}

/** A layout table with the usual resets. `attributes` is appended as
 *  written, e.g. `width="100%" style="margin:0 0 20px;"`. */
export function presentationTable(innerHtml: string, attributes = ""): string {
  const extra = attributes.length > 0 ? ` ${attributes}` : "";
  return `<table ${TABLE_RESET}${extra}>${innerHtml}</table>`;
}

/** An empty fixed-height row, for vertical rhythm inside a table. */
export function spacerRowHtml(heightPx: number): string {
  return `<tr><td height="${heightPx}" style="height:${heightPx}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

/** An empty fixed-width cell, for the gap between two cells in a row. */
export function gapCellHtml(widthPx: number): string {
  return `<td width="${widthPx}" style="width:${widthPx}px;font-size:0;line-height:0;">&nbsp;</td>`;
}

/** A solid-colour table cell. `bgcolor` covers Outlook desktop, which also
 *  ignores the radius, so round dots fall back to small squares there. */
export function colorCellHtml(
  color: string,
  widthPx: number,
  heightPx: number,
  radiusCss: string,
): string {
  return `<td width="${widthPx}" height="${heightPx}" bgcolor="${color}" style="width:${widthPx}px;height:${heightPx}px;background:${color};border-radius:${radiusCss};font-size:0;line-height:0;">&nbsp;</td>`;
}

/** A round dot in its own one-cell table, so the row height around it cannot
 *  stretch it into a pill. */
export function dotHtml(color: string, sizePx: number): string {
  return presentationTable(
    `<tr>${colorCellHtml(color, sizePx, sizePx, "50%")}</tr>`,
  );
}

export interface HostedImageOptions {
  /** Absolute URL, e.g. from `emailAssetUrl`. Escaped here. */
  url: string;
  /** Plain text; pass "" for a decorative image. */
  alt: string;
  width: number;
  height: number;
  /** Extra inline CSS appended last, so it can override the defaults. */
  style?: string;
}

export function hostedImageHtml(options: HostedImageOptions): string {
  const { url, alt, width, height, style = "" } = options;
  return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;${style}">`;
}

export interface LinkFallbackOptions {
  /** Filled, plain text. */
  href: string;
  language: Language;
  textColor: string;
  linkColor: string;
  fontFamily: string;
  /** Defaults to `12px 0 0`. */
  marginCss?: string;
}

/** Draw the fallback for an http(s) link, and for one that still carries a
 *  `{token}`: "Edit as HTML" renders with no values, and the token must
 *  survive into the custom HTML. Anything else (empty, mailto:) is skipped. */
export function shouldShowLinkFallback(href: string): boolean {
  return /^https?:\/\//i.test(href.trim()) || hasPlaceholderToken(href);
}

/** The quiet line under a button: a short prompt, then the raw URL as a link
 *  that wraps anywhere. Empty when `shouldShowLinkFallback` says so. */
export function linkFallbackHtml(options: LinkFallbackOptions): string {
  const { href, language, textColor, linkColor, fontFamily } = options;
  if (!shouldShowLinkFallback(href)) return "";
  const escapedHref = escapeHtml(href.trim());
  const margin = options.marginCss ?? "12px 0 0";
  return `<p style="margin:${margin};font-family:${fontFamily};font-size:13px;line-height:1.5;color:${textColor};">${escapeHtml(EMAIL_LINK_FALLBACK[language])}<br><a href="${escapedHref}" style="color:${linkColor};text-decoration:underline;word-break:break-all;">${escapedHref}</a></p>`;
}

export interface BulletproofButtonOptions {
  /** Filled, plain text. Escaped here. */
  label: string;
  /** Filled, plain text (`fillPlaceholders(href, values, false)`). Escaped
   *  here, once, for both the VML and the HTML link. */
  href: string;
  fillColor: string;
  textColor: string;
  fontFamily: string;
  fontSizePx: number;
  heightPx: number;
  /** 999 draws a pill; Outlook caps the VML arc at a full half-circle. */
  radiusPx: number;
  /** Fixed width. Without it the HTML button hugs its label and the VML
   *  button, which needs a width, estimates one from the label length. */
  widthPx?: number;
  /** 100% wide in every client but Outlook desktop, which keeps `widthPx`
   *  (or the estimate). Suits a phone-first card. */
  isFullWidth?: boolean;
  /** Side padding of the HTML button. Defaults to 32. */
  paddingXPx?: number;
}

const AVERAGE_GLYPH_WIDTH_EM = 0.6;

function vmlWidthPx(options: BulletproofButtonOptions, paddingXPx: number) {
  if (options.widthPx !== undefined) return options.widthPx;
  const labelWidth =
    options.label.length * options.fontSizePx * AVERAGE_GLYPH_WIDTH_EM;
  return Math.round(labelWidth + paddingXPx * 2);
}

/** Outlook desktop ignores padding and radius on links, so it gets a VML
 *  rounded rectangle; every other client reads the conditional as a comment. */
function vmlButtonHtml(
  options: BulletproofButtonOptions,
  escapedHref: string,
  widthPx: number,
): string {
  const { fillColor, textColor, fontFamily, fontSizePx, heightPx } = options;
  const arcPercent = Math.min(
    50,
    Math.round((options.radiusPx / heightPx) * 100),
  );
  return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapedHref}" style="height:${heightPx}px;v-text-anchor:middle;width:${widthPx}px;" arcsize="${arcPercent}%" stroke="f" fillcolor="${fillColor}"><w:anchorlock/><center style="color:${textColor};font-family:${fontFamily};font-size:${fontSizePx}px;font-weight:bold;">${escapeHtml(options.label)}</center></v:roundrect><![endif]-->`;
}

/** Vertical padding with `line-height:1` sets the height, so a long label
 *  can still wrap on a narrow phone. */
function htmlButtonHtml(
  options: BulletproofButtonOptions,
  escapedHref: string,
  paddingXPx: number,
): string {
  const { fillColor, textColor, fontFamily, fontSizePx, radiusPx } = options;
  const paddingYPx = Math.max(
    0,
    Math.round((options.heightPx - fontSizePx) / 2),
  );
  const sizing = options.isFullWidth
    ? "display:block;width:100%;box-sizing:border-box;"
    : options.widthPx !== undefined
      ? `display:inline-block;width:${options.widthPx}px;box-sizing:border-box;`
      : "display:inline-block;";
  return `<!--[if !mso]><!--><a href="${escapedHref}" style="${sizing}padding:${paddingYPx}px ${paddingXPx}px;background:${fillColor};border-radius:${radiusPx}px;font-family:${fontFamily};font-size:${fontSizePx}px;font-weight:600;line-height:1;text-align:center;color:${textColor};text-decoration:none;-webkit-text-size-adjust:none;">${escapeHtml(options.label)}</a><!--<![endif]-->`;
}

/** A button that renders in every client, Outlook desktop included. Sits in
 *  its own table with no outer margin; the caller spaces it. */
export function bulletproofButtonHtml(
  options: BulletproofButtonOptions,
): string {
  const escapedHref = escapeHtml(options.href.trim());
  const paddingXPx = options.paddingXPx ?? 32;
  const tableAttributes = options.isFullWidth
    ? 'width="100%" style="width:100%;"'
    : "";
  const cellHtml = [
    vmlButtonHtml(options, escapedHref, vmlWidthPx(options, paddingXPx)),
    htmlButtonHtml(options, escapedHref, paddingXPx),
  ].join("");
  return presentationTable(
    `<tr><td align="center">${cellHtml}</td></tr>`,
    tableAttributes,
  );
}
