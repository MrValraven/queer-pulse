import type { Language } from "../../../../shared/i18n/types";
import type { EmailDesignTheme } from "../emailDesign.types";
import type { EmailBlock, EmailFeatureItem } from "../emailTemplate.types";
import type {
  EmailFillValues,
  EmailPlaceholder,
} from "../emailTemplatePurposes";
import {
  escapeHtml,
  fillPlaceholders,
  headingMarkupToHtml,
  inlineMarkupToHtml,
} from "../emailInlineMarkup";
import { blockToHtml } from "../renderEmailBlocks";
import { EMAIL_ASSETS, emailAssetUrl } from "./emailAssets";
import { EMAIL_PALETTE } from "./emailPalette";
import {
  bulletproofButtonHtml,
  colorCellHtml,
  dotHtml,
  gapCellHtml,
  hostedImageHtml,
  linkFallbackHtml,
  presentationTable,
} from "./emailShared";

/**
 * Block renderers for the "stage" design: serif display type in plum, white
 * cards on cream, and the invite drawn as a dashed-edge pass. Every block
 * renders with no outer margin; `stageDesign.ts` owns the rhythm between
 * blocks. Colours come from `emailPalette.ts`, which names each token and its
 * contrast ratio.
 */
export const STAGE_COLORS = EMAIL_PALETTE.colors;
export const STAGE_FONTS = EMAIL_PALETTE.fonts;

export type StageBlockOf<Type extends EmailBlock["type"]> = Extract<
  EmailBlock,
  { type: Type }
>;

export interface StageBlockContext {
  values: EmailFillValues;
  language: Language;
  assetOrigin: string;
}

const COLORS = STAGE_COLORS;
const CARD_RADIUS_PX = 18;
const BUTTON_FONT_SIZE_PX = 17;
const TICKET_BUTTON_HEIGHT_PX = 56;
/** The widest the ticket button gets inside Outlook's fixed 520px column. */
const TICKET_BUTTON_VML_WIDTH_PX = 460;
const AVATAR_SIZE_PX = 56;
const HEADING_SIZE_PX = { 1: 36, 2: 26 } as const;

/** Only paragraph, image, spacer and html go through the shared renderer; a
 *  zero block gap leaves the spacing to the composer. */
const SHARED_BLOCK_THEME: EmailDesignTheme = {
  colors: {
    page: COLORS.cream,
    card: COLORS.paper,
    ink: COLORS.inkStrong,
    inkMuted: COLORS.inkMuted,
    heading: COLORS.plum,
    emphasis: COLORS.accentText,
    link: COLORS.accentText,
    line: COLORS.line,
    buttonFill: COLORS.accentFill,
    buttonText: COLORS.paper,
  },
  fonts: STAGE_FONTS,
  headingSizePx: HEADING_SIZE_PX,
  headingLineHeight: 1.15,
  headingLetterSpacing: "-0.015em",
  headingWeight: 600,
  bodySizePx: 17,
  bodyLineHeight: 1.6,
  blockGapPx: 0,
  buttonRadiusPx: 999,
  buttonPaddingCss: "18px 34px",
  buttonFontSizePx: BUTTON_FONT_SIZE_PX,
  buttonMarginCss: "0",
  spacerPx: { sm: 8, md: 24, lg: 48 },
};

export function hasText(text: string): boolean {
  return text.trim().length > 0;
}

function filledHtml(text: string, values: EmailFillValues): string {
  return fillPlaceholders(escapeHtml(text), values, true);
}

function filledText(text: string, values: EmailFillValues): string {
  return fillPlaceholders(text, values, false);
}

function joinHtml(parts: string[]): string {
  return parts.filter((part) => part.length > 0).join("\n");
}

const SANS = `font-family:${STAGE_FONTS.sans};`;
const SERIF = `font-family:${STAGE_FONTS.serif};`;

/** A small uppercase line with a dot before it: the eyebrow, the ticket
 *  label. The dot is a fill, so it can be coral or jade on any ground. */
export function dottedLabelHtml(
  text: string,
  textColor: string,
  dotColor: string,
  context: StageBlockContext,
): string {
  const labelHtml = `<p style="margin:0;${SANS}font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${textColor};">${filledHtml(text, context.values)}</p>`;
  return presentationTable(
    `<tr><td valign="middle">${dotHtml(dotColor, 8)}</td>${gapCellHtml(10)}<td valign="middle">${labelHtml}</td></tr>`,
  );
}

const PLACEHOLDER_PATTERN = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;

/** Longer values may wrap: "2 de outubro de 2026" held on one line at 28px
 *  is wider than a phone's ticket and would push the page sideways. */
const UNBROKEN_VALUE_MAX_LENGTH = 16;

/** Fills each `{token}` that has a value with the escaped value, held in a
 *  no-wrap span when short, so a display line never breaks inside
 *  "2 October 2026" or a name. `html` is already escaped markup; a token
 *  without a value stays. */
function fillUnbrokenHtml(html: string, values: EmailFillValues): string {
  return html.replace(PLACEHOLDER_PATTERN, (match, token: string) => {
    const value = values[token as EmailPlaceholder];
    if (value === undefined) return match;
    if (value.length > UNBROKEN_VALUE_MAX_LENGTH) return escapeHtml(value);
    return `<span style="white-space:nowrap;">${escapeHtml(value)}</span>`;
  });
}

export interface DisplayHeadingOptions {
  tag: "h1" | "h2";
  sizePx: number;
  lineHeight: number;
  color: string;
  emphasisColor: string;
}

export function displayHeadingHtml(
  text: string,
  options: DisplayHeadingOptions,
  context: StageBlockContext,
): string {
  const { tag, sizePx, lineHeight, color, emphasisColor } = options;
  const markupHtml = headingMarkupToHtml(text, {}, emphasisColor);
  return `<${tag} style="margin:0;${SERIF}font-size:${sizePx}px;line-height:${lineHeight};font-weight:600;letter-spacing:-0.02em;color:${color};">${fillUnbrokenHtml(markupHtml, context.values)}</${tag}>`;
}

function bodyTextHtml(
  text: string,
  sizePx: number,
  color: string,
  context: StageBlockContext,
  marginCss = "0",
): string {
  return `<p style="margin:${marginCss};${SANS}font-size:${sizePx}px;line-height:1.6;color:${color};">${inlineMarkupToHtml(text, context.values, COLORS.accentText)}</p>`;
}

function headingHtml(
  block: StageBlockOf<"heading">,
  context: StageBlockContext,
): string {
  return displayHeadingHtml(
    block.text,
    {
      tag: block.level === 1 ? "h1" : "h2",
      sizePx: HEADING_SIZE_PX[block.level],
      lineHeight: block.level === 1 ? 1.12 : 1.2,
      color: COLORS.plum,
      emphasisColor: COLORS.accentText,
    },
    context,
  );
}

/** A hero that is not the first block stays on cream in plum type. */
function bodyHeroHtml(
  block: StageBlockOf<"hero">,
  context: StageBlockContext,
): string {
  const headingOptions: DisplayHeadingOptions = {
    tag: "h2",
    sizePx: 40,
    lineHeight: 1.1,
    color: COLORS.plum,
    emphasisColor: COLORS.accentText,
  };
  return joinHtml([
    hasText(block.eyebrow)
      ? dottedLabelHtml(block.eyebrow, COLORS.accentText, COLORS.coral, context)
      : "",
    hasText(block.headline)
      ? `<div style="padding:14px 0 0;">${displayHeadingHtml(block.headline, headingOptions, context)}</div>`
      : "",
    hasText(block.text)
      ? bodyTextHtml(block.text, 18, COLORS.inkStrong, context, "14px 0 0")
      : "",
  ]);
}

function buttonHtml(
  block: StageBlockOf<"button">,
  context: StageBlockContext,
): string {
  return bulletproofButtonHtml({
    label: filledText(block.label, context.values),
    href: filledText(block.href, context.values),
    fillColor: COLORS.accentFill,
    textColor: COLORS.paper,
    fontFamily: STAGE_FONTS.sans,
    fontSizePx: BUTTON_FONT_SIZE_PX,
    heightPx: 52,
    radiusPx: 999,
    paddingXPx: 34,
  });
}

/** A short centred hairline, quiet enough that the pass stays the one loud
 *  mark on the page. */
function dividerHtml(): string {
  return presentationTable(
    `<tr><td align="center" style="padding:12px 0;">${presentationTable(`<tr>${colorCellHtml(COLORS.line, 48, 2, "1px")}</tr>`)}</td></tr>`,
    'width="100%"',
  );
}

/** A white card on the cream body, for the feature list, with the site's
 *  paper-card hairline so it holds its edge on bright screens. */
function whiteCardHtml(innerHtml: string, paddingCss: string): string {
  return presentationTable(
    `<tr><td style="padding:${paddingCss};">${innerHtml}</td></tr>`,
    `width="100%" bgcolor="${COLORS.paper}" style="background:${COLORS.paper};border:1px solid ${COLORS.line};border-radius:${CARD_RADIUS_PX}px;border-collapse:separate;"`,
  );
}

/** A 1px hairline across the full width, drawn as a filled cell so Outlook
 *  keeps it. */
function hairlineHtml(color: string): string {
  return presentationTable(
    `<tr><td height="1" bgcolor="${color}" style="height:1px;background:${color};font-size:0;line-height:0;">&nbsp;</td></tr>`,
    'width="100%"',
  );
}

function featureRowHtml(
  item: EmailFeatureItem,
  context: StageBlockContext,
): string {
  const icon = EMAIL_ASSETS.featureIcons[item.icon];
  const iconHtml = hostedImageHtml({
    url: emailAssetUrl(context.assetOrigin, icon),
    alt: "",
    width: icon.width,
    height: icon.height,
    style: `width:${icon.width}px;background:${COLORS.coralTint};border-radius:50%;`,
  });
  const titleHtml = `<p style="margin:0 0 4px;${SANS}font-size:17px;line-height:1.35;font-weight:700;color:${COLORS.plum};">${filledHtml(item.title, context.values)}</p>`;
  const textHtml = bodyTextHtml(item.text, 15, COLORS.ink, context);
  return `<tr><td width="${icon.width}" valign="top" style="width:${icon.width}px;">${iconHtml}</td>${gapCellHtml(14)}<td valign="top">${titleHtml}${textHtml}</td></tr>`;
}

function featureListHtml(
  block: StageBlockOf<"featureList">,
  context: StageBlockContext,
): string {
  if (block.items.length === 0) return "";
  const separatorHtml = `<tr><td colspan="3" style="padding:20px 0;">${hairlineHtml(COLORS.line)}</td></tr>`;
  const rowsHtml = block.items
    .map((item) => featureRowHtml(item, context))
    .join(separatorHtml);
  return whiteCardHtml(
    presentationTable(rowsHtml, 'width="100%"'),
    "24px 18px",
  );
}

/** The signer's photo, else the pulse mark (drawn on cream, the ground it
 *  sits on here). */
function avatarHtml(photoUrl: string, context: StageBlockContext): string {
  const url = hasText(photoUrl)
    ? photoUrl.trim()
    : emailAssetUrl(context.assetOrigin, EMAIL_ASSETS.pulseMark);
  return hostedImageHtml({
    url,
    alt: "",
    width: AVATAR_SIZE_PX,
    height: AVATAR_SIZE_PX,
    style: `width:${AVATAR_SIZE_PX}px;height:${AVATAR_SIZE_PX}px;border-radius:50%;object-fit:cover;background:${COLORS.creamDeep};`,
  });
}

function signatureHtml(
  block: StageBlockOf<"signature">,
  context: StageBlockContext,
): string {
  const { values } = context;
  const noteHtml = hasText(block.note)
    ? `<p style="margin:0 0 10px;${SERIF}font-size:22px;line-height:1.3;font-style:italic;letter-spacing:-0.01em;color:${COLORS.plum};">${inlineMarkupToHtml(block.note, values, COLORS.accentText)}</p>`
    : "";
  const nameHtml = hasText(block.name)
    ? `<p style="margin:0;${SANS}font-size:15px;line-height:1.4;font-weight:700;color:${COLORS.plum};">${filledHtml(block.name, values)}</p>`
    : "";
  const roleHtml = hasText(block.role)
    ? `<p style="margin:2px 0 0;${SANS}font-size:13px;line-height:1.4;color:${COLORS.inkMuted};">${filledHtml(block.role, values)}</p>`
    : "";
  const photoUrl = filledText(block.photoUrl, values);
  return presentationTable(
    `<tr><td width="${AVATAR_SIZE_PX}" valign="middle" style="width:${AVATAR_SIZE_PX}px;">${avatarHtml(photoUrl, context)}</td>${gapCellHtml(16)}<td valign="middle">${noteHtml}${nameHtml}${roleHtml}</td></tr>`,
    'width="100%"',
  );
}

const TICKET_PADDING_X_PX = 24;

/** The coral-tint strip across the top of the pass: a jade dot and the label. */
function ticketStripHtml(label: string, context: StageBlockContext): string {
  const innerRadius = CARD_RADIUS_PX - 2;
  return `<tr><td bgcolor="${COLORS.coralTint}" style="padding:12px ${TICKET_PADDING_X_PX}px;background:${COLORS.coralTint};border-radius:${innerRadius}px ${innerRadius}px 0 0;">${dottedLabelHtml(label, COLORS.accentText, COLORS.jade, context)}</td></tr>`;
}

/** The tear line: a dashed coral rule from edge to edge, meeting the pass's
 *  own dashed border in the same colour. Where dashes degrade it draws solid, which still
 *  reads as a divide. */
function perforationRowHtml(): string {
  return `<tr><td style="padding:24px 0;"><div style="border-top:2px dashed ${COLORS.coral};font-size:0;line-height:0;">&nbsp;</div></td></tr>`;
}

function ticketButtonHtml(
  block: StageBlockOf<"ticket">,
  context: StageBlockContext,
): string {
  return bulletproofButtonHtml({
    label: filledText(block.buttonLabel, context.values),
    href: filledText(block.href, context.values),
    fillColor: COLORS.accentFill,
    textColor: COLORS.paper,
    fontFamily: STAGE_FONTS.sans,
    fontSizePx: BUTTON_FONT_SIZE_PX,
    heightPx: TICKET_BUTTON_HEIGHT_PX,
    radiusPx: 999,
    widthPx: TICKET_BUTTON_VML_WIDTH_PX,
    isFullWidth: true,
    paddingXPx: 20,
  });
}

/** The stub below the tear line: the ticket text as fine print (ink on
 *  paper, 9.10:1), then the paste-this-link line. */
function ticketStubHtml(
  block: StageBlockOf<"ticket">,
  context: StageBlockContext,
): string {
  const hasFinePrint = hasText(block.text);
  const finePrintHtml = hasFinePrint
    ? `<p style="margin:0;${SANS}font-size:14px;line-height:1.55;color:${COLORS.ink};">${inlineMarkupToHtml(block.text, context.values, COLORS.accentText)}</p>`
    : "";
  const fallbackHtml = linkFallbackHtml({
    href: filledText(block.href, context.values),
    language: context.language,
    textColor: COLORS.inkMuted,
    linkColor: COLORS.accentText,
    fontFamily: STAGE_FONTS.sans,
    marginCss: hasFinePrint ? "12px 0 0" : "0",
  });
  return joinHtml([finePrintHtml, fallbackHtml]);
}

/** The invite as a pass: a dashed coral edge, a tinted strip with the label,
 *  the title, the full-width button, then a tear line and the stub with the
 *  fine print. The action comes first. */
function ticketHtml(
  block: StageBlockOf<"ticket">,
  context: StageBlockContext,
): string {
  const hasButton = hasText(block.buttonLabel);
  const titleHtml = displayHeadingHtml(
    block.title,
    {
      tag: "h2",
      sizePx: 28,
      lineHeight: 1.15,
      color: COLORS.plum,
      emphasisColor: COLORS.accentText,
    },
    context,
  );
  // Without a button there is no stub: the text sits under the title.
  const stubHtml = hasButton ? ticketStubHtml(block, context) : "";
  const inlineTextHtml =
    !hasButton && hasText(block.text)
      ? bodyTextHtml(block.text, 15, COLORS.ink, context, "10px 0 0")
      : "";
  const paddingX = TICKET_PADDING_X_PX;
  const rowsHtml = [
    hasText(block.label) ? ticketStripHtml(block.label, context) : "",
    `<tr><td style="padding:20px ${paddingX}px ${hasButton ? 20 : 28}px;">${titleHtml}${inlineTextHtml}</td></tr>`,
    hasButton
      ? `<tr><td style="padding:0 ${paddingX}px ${stubHtml ? 0 : 28}px;">${ticketButtonHtml(block, context)}</td></tr>`
      : "",
    stubHtml ? perforationRowHtml() : "",
    stubHtml
      ? `<tr><td style="padding:0 ${paddingX}px 24px;">${stubHtml}</td></tr>`
      : "",
  ].join("");
  return presentationTable(
    rowsHtml,
    `width="100%" bgcolor="${COLORS.paper}" style="background:${COLORS.paper};border:2px dashed ${COLORS.coral};border-radius:${CARD_RADIUS_PX}px;border-collapse:separate;"`,
  );
}

/** One block in the stage design. A leading hero never reaches here: the
 *  composer lifts it into the masthead. */
export function stageBlockHtml(
  block: EmailBlock,
  context: StageBlockContext,
): string {
  switch (block.type) {
    case "heading":
      return headingHtml(block, context);
    case "button":
      return buttonHtml(block, context);
    case "divider":
      return dividerHtml();
    case "hero":
      return bodyHeroHtml(block, context);
    case "ticket":
      return ticketHtml(block, context);
    case "featureList":
      return featureListHtml(block, context);
    case "signature":
      return signatureHtml(block, context);
    case "paragraph":
    case "image":
    case "spacer":
    case "html":
      return blockToHtml(block, {
        ...context,
        theme: SHARED_BLOCK_THEME,
        dividerHtml: "",
      });
  }
}
