import type { Language } from "../../../../shared/i18n/types";
import type {
  EmailDesignInput,
  EmailDesignRenderer,
  EmailDesignTheme,
} from "../emailDesign.types";
import { escapeHtml, fillPlaceholders } from "../emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL, EMAIL_WORDMARK } from "../emailTheme";
import type { EmailBlockContext } from "../renderEmailBlocks";
import { EMAIL_ASSETS, emailAssetUrl } from "./emailAssets";
import { EMAIL_PALETTE } from "./emailPalette";
import {
  colorCellHtml,
  emailDocumentHtml,
  gapCellHtml,
  hostedImageHtml,
  pageFrameHtml,
  presentationTable,
  spacerRowHtml,
} from "./emailShared";
import {
  letterBlockHtml,
  letterSpacerHtml,
  smallCapsHtml,
  type LetterBlockOf,
} from "./letterBlocks";

/**
 * The "letter" design: a typeset note from a person on a sheet of paper. A
 * white card with a hairline border sits on cream; a letterhead, then (for a
 * signer with a photo) a byline naming who writes, then the blocks; the
 * footer rests on the cream outside the sheet. No dark band anywhere: plum
 * lives only in the type. Rhythm comes from spacer tables, which Outlook
 * desktop keeps where it would drop margins.
 *
 * The side gutters are 8% cells, so one value gives a 48px margin on the
 * 600px sheet and still leaves a ~300px measure on a 375px phone without a
 * media query. Every colour comes from `emailPalette.ts`.
 */
const PALETTE = EMAIL_PALETTE.colors;
const { serif: SERIF, sans: SANS } = EMAIL_PALETTE.fonts;

const GUTTER_PERCENT = "8%";
const SHEET_RADIUS_PX = 8;
const AVATAR_PX = 46;
const LETTERHEAD_MARK_PX = 40;
/** Air between the letterhead (or byline) and the first block. */
const OPENING_GAP_PX = 56;

const BYLINE_LEAD: Record<Language, string> = {
  en: "A note from",
  pt: "Uma nota de",
};

type SignatureBlock = LetterBlockOf<"signature">;

/** Theme for the simple blocks drawn by the shared `blockToHtml`
 *  (paragraph, image, spacer, html), so they match the letter's body type. */
const LETTER_THEME: EmailDesignTheme = {
  colors: {
    page: PALETTE.cream,
    card: PALETTE.paper,
    ink: PALETTE.inkStrong,
    inkMuted: PALETTE.inkMuted,
    heading: PALETTE.plum,
    emphasis: PALETTE.accentText,
    link: PALETTE.accentText,
    line: PALETTE.line,
    buttonFill: PALETTE.accentFill,
    buttonText: PALETTE.paper,
  },
  fonts: EMAIL_PALETTE.fonts,
  headingSizePx: { 1: 36, 2: 24 },
  headingLineHeight: 1.2,
  headingLetterSpacing: "-0.01em",
  headingWeight: 400,
  bodySizePx: 17,
  bodyLineHeight: 1.7,
  blockGapPx: 24,
  buttonRadiusPx: 999,
  buttonPaddingCss: "18px 32px",
  buttonFontSizePx: 16,
  buttonMarginCss: "8px 0 36px",
  spacerPx: { sm: 12, md: 28, lg: 56 },
};

function hairlineCellHtml(): string {
  return `<td width="46%" valign="middle">${presentationTable(`<tr><td height="1" bgcolor="${PALETTE.line}" style="height:1px;background:${PALETTE.line};font-size:0;line-height:0;">&nbsp;</td></tr>`, 'width="100%"')}</td>`;
}

/** A hairline across the measure with a small coral dot set in its middle.
 *  Percent cells keep the dot's breathing room in step with the measure. */
function letterDividerHtml(): string {
  const dotTable = presentationTable(
    `<tr>${colorCellHtml(PALETTE.coral, 7, 7, "50%")}</tr>`,
  );
  const dotCell = `<td width="8%" align="center" valign="middle" style="width:8%;">${dotTable}</td>`;
  const rowHtml = `<tr>${hairlineCellHtml()}${dotCell}${hairlineCellHtml()}</tr>`;
  const dividerHtml = presentationTable(
    rowHtml,
    'width="100%" style="width:100%;"',
  );
  return [letterSpacerHtml(36), dividerHtml, letterSpacerHtml(40)].join("\n");
}

function hasText(text: string): boolean {
  return text.trim().length > 0;
}

function firstSignature(input: EmailDesignInput): SignatureBlock | undefined {
  return input.blocks.find(
    (block): block is SignatureBlock => block.type === "signature",
  );
}

/** The pulse mark as a round chip. Its cream ground is baked into the GIF,
 *  and the same cream sits behind it for clients that block images. */
function pulseMarkHtml(assetOrigin: string, sizePx: number): string {
  return hostedImageHtml({
    url: emailAssetUrl(assetOrigin, EMAIL_ASSETS.pulseMark),
    alt: "",
    width: sizePx,
    height: sizePx,
    style: `width:${sizePx}px;height:${sizePx}px;border-radius:50%;background:${PALETTE.cream};`,
  });
}

/** The logo image; with images blocked its alt text still reads as a plum
 *  serif wordmark. */
function logoHtml(assetOrigin: string): string {
  const logo = EMAIL_ASSETS.logoOnLight;
  return hostedImageHtml({
    url: emailAssetUrl(assetOrigin, logo),
    alt: EMAIL_WORDMARK,
    width: logo.width,
    height: logo.height,
    style: `width:${logo.width}px;font-family:${SERIF};font-size:22px;line-height:32px;font-weight:700;color:${PALETTE.plum};`,
  });
}

/** Logo left, the pulse mark right, and a hairline closing the letterhead. */
function letterheadHtml(assetOrigin: string): string {
  const { line } = PALETTE;
  const rowHtml = `<tr><td valign="middle" height="${LETTERHEAD_MARK_PX}" style="height:${LETTERHEAD_MARK_PX}px;">${logoHtml(assetOrigin)}</td><td align="right" valign="middle">${pulseMarkHtml(assetOrigin, LETTERHEAD_MARK_PX)}</td></tr>`;
  const hairlineRowHtml = `<tr><td colspan="2" height="1" bgcolor="${line}" style="height:1px;background:${line};font-size:0;line-height:0;">&nbsp;</td></tr>`;
  return presentationTable(
    `${rowHtml}${spacerRowHtml(28)}${hairlineRowHtml}`,
    'width="100%" style="width:100%;"',
  );
}

function avatarHtml(photoUrl: string) {
  return hostedImageHtml({
    url: photoUrl,
    alt: "",
    width: AVATAR_PX,
    height: AVATAR_PX,
    style: `width:${AVATAR_PX}px;height:${AVATAR_PX}px;border-radius:50%;object-fit:cover;background:${PALETTE.creamDeep};`,
  });
}

/** "A note from" and the signer, under the letterhead. Drawn only for a
 *  signer with a photo: a real person, so the note has someone behind it. */
function bylineHtml(
  signature: SignatureBlock,
  photoUrl: string,
  input: EmailDesignInput,
) {
  const { values, language } = input;
  const name = fillPlaceholders(signature.name, values, false);
  const role = fillPlaceholders(signature.role, values, false);
  const nameHtml = hasText(name)
    ? `<p style="margin:0;font-family:${SERIF};font-size:18px;line-height:1.3;color:${PALETTE.plum};">${escapeHtml(name)}</p>`
    : "";
  const roleHtml = hasText(role)
    ? `<p style="margin:2px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${PALETTE.inkMuted};">${escapeHtml(role)}</p>`
    : "";
  const textHtml = `${smallCapsHtml(BYLINE_LEAD[language], {}, "0 0 4px")}${nameHtml}${roleHtml}`;
  const rowHtml = `<tr><td width="${AVATAR_PX}" valign="middle" style="width:${AVATAR_PX}px;">${avatarHtml(photoUrl)}</td>${gapCellHtml(16)}<td valign="middle">${textHtml}</td></tr>`;
  return `${letterSpacerHtml(28)}\n${presentationTable(rowHtml)}`;
}

function gutterCellHtml(): string {
  return `<td width="${GUTTER_PERCENT}" style="width:${GUTTER_PERCENT};font-size:0;line-height:0;">&nbsp;</td>`;
}

/** The sheet: paper, a hairline border, a small radius, 8% gutters. The
 *  bottom padding is light because the last block brings its own gap. */
function sheetHtml(innerHtml: string): string {
  const { paper, line } = PALETTE;
  const contentCell = `<td style="padding:36px 0 28px;font-family:${SANS};color:${PALETTE.inkStrong};">${innerHtml}</td>`;
  return presentationTable(
    `<tr>${gutterCellHtml()}${contentCell}${gutterCellHtml()}</tr>`,
    `width="600" bgcolor="${paper}" style="width:100%;max-width:600px;background:${paper};border:1px solid ${line};border-radius:${SHEET_RADIUS_PX}px;border-collapse:separate;"`,
  );
}

/** Small and centred on the cream, outside the sheet. Muted text is 4.88:1
 *  on cream, accent text 5.38:1. */
function footerHtml(language: Language): string {
  const siteLabel = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  const textCss = `font-family:${SANS};font-size:13px;line-height:1.6;`;
  return [
    `<p style="margin:28px 0 0;${textCss}color:${PALETTE.inkMuted};text-align:center;">${escapeHtml(EMAIL_FOOTER[language])}</p>`,
    `<p style="margin:4px 0 0;${textCss}text-align:center;"><a href="${escapeHtml(EMAIL_SITE_URL)}" style="color:${PALETTE.accentText};text-decoration:none;font-weight:700;">${escapeHtml(siteLabel)}</a></p>`,
  ].join("\n");
}

/** Outlook desktop reads `width:100%` and ignores `max-width`, so without
 *  help the sheet would run across the whole reading pane. This fixed 600px
 *  table exists only for Outlook; every other client reads it as a comment
 *  and keeps the fluid sheet. */
function outlookColumnHtml(contentHtml: string): string {
  return [
    '<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->',
    contentHtml,
    "<!--[if mso]></td></tr></table><![endif]-->",
  ].join("\n");
}

/** Draws a whole block-built email in the letter design. */
export const renderLetterEmail: EmailDesignRenderer = (input) => {
  const signature = firstSignature(input);
  const photoUrl = signature
    ? fillPlaceholders(signature.photoUrl, input.values, false).trim()
    : "";
  const context: EmailBlockContext = {
    values: input.values,
    language: input.language,
    assetOrigin: input.assetOrigin,
    theme: LETTER_THEME,
    dividerHtml: letterDividerHtml(),
  };
  const sheetInnerHtml = [
    letterheadHtml(input.assetOrigin),
    signature && hasText(photoUrl)
      ? bylineHtml(signature, photoUrl, input)
      : "",
    letterSpacerHtml(OPENING_GAP_PX),
    ...input.blocks.map((block) => letterBlockHtml(block, context)),
  ]
    .filter((part) => part.length > 0)
    .join("\n");
  return emailDocumentHtml({
    language: input.language,
    subject: input.subject,
    preheader: input.preheader,
    pageColor: PALETTE.cream,
    bodyHtml: pageFrameHtml(
      PALETTE.cream,
      "40px 8px 48px",
      outlookColumnHtml(
        `${sheetHtml(sheetInnerHtml)}\n${footerHtml(input.language)}`,
      ),
    ),
  });
};
