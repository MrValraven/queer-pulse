import type { Language } from "../../../shared/i18n/types";
import { EMAIL_ASSETS, emailAssetUrl } from "./design/emailAssets";
import {
  bulletproofButtonHtml,
  gapCellHtml,
  hostedImageHtml,
  linkFallbackHtml,
  presentationTable,
} from "./design/emailShared";
import type { EmailDesignTheme } from "./emailDesign.types";
import type { EmailBlock, EmailFeatureItem } from "./emailTemplate.types";
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

type BlockOf<Type extends EmailBlock["type"]> = Extract<
  EmailBlock,
  { type: Type }
>;

/**
 * Everything a block needs besides itself. `theme` and `dividerHtml` belong
 * to the design drawing the email: `renderCurrentEmail` passes its own, and
 * any design may reuse these blocks with another theme.
 */
export interface EmailBlockContext {
  values: EmailFillValues;
  language: Language;
  /** Origin for hosted images, e.g. `https://queerpulse.com`. */
  assetOrigin: string;
  theme: EmailDesignTheme;
  dividerHtml: string;
}

const LABEL_SIZE_PX = 13;
const TICKET_RADIUS_PX = 12;
const TICKET_PADDING_PX = 24;
const FEATURE_ROW_GAP_PX = 16;
const AVATAR_SIZE_PX = 40;

function filledHtml(text: string, values: EmailFillValues): string {
  return fillPlaceholders(escapeHtml(text), values, true);
}

function filledText(text: string, values: EmailFillValues): string {
  return fillPlaceholders(text, values, false);
}

function hasText(text: string): boolean {
  return text.trim().length > 0;
}

function joinParts(parts: string[], separator: string): string {
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(separator);
}

function clampWidth(width: number): number {
  return Math.min(Math.max(Math.round(width) || 600, 1), 600);
}

function sansCss(theme: EmailDesignTheme): string {
  return `font-family:${theme.fonts.sans};`;
}

function headingHtml(
  text: string,
  level: 1 | 2,
  context: EmailBlockContext,
  marginCss = `0 0 ${context.theme.blockGapPx}px`,
): string {
  const { theme, values } = context;
  const tag = level === 1 ? "h1" : "h2";
  const size = theme.headingSizePx[level];
  // "0" emits no declaration, which keeps untracked headings lean.
  const letterSpacing =
    theme.headingLetterSpacing === "0"
      ? ""
      : `letter-spacing:${theme.headingLetterSpacing};`;
  return `<${tag} style="margin:${marginCss};font-family:${theme.fonts.serif};font-size:${size}px;line-height:${theme.headingLineHeight};font-weight:${theme.headingWeight};${letterSpacing}color:${theme.colors.heading};">${headingMarkupToHtml(text, values, theme.colors.emphasis)}</${tag}>`;
}

function paragraphHtml(
  text: string,
  context: EmailBlockContext,
  marginCss = `0 0 ${context.theme.blockGapPx}px`,
): string {
  const { theme, values } = context;
  return `<p style="margin:${marginCss};${sansCss(theme)}font-size:${theme.bodySizePx}px;line-height:${theme.bodyLineHeight};color:${theme.colors.ink};">${inlineMarkupToHtml(text, values, theme.colors.link)}</p>`;
}

/** A small uppercase line above a title: the hero eyebrow, the ticket label. */
function smallLabelHtml(
  text: string,
  color: string,
  context: EmailBlockContext,
): string {
  return `<p style="margin:0 0 12px;${sansCss(context.theme)}font-size:${LABEL_SIZE_PX}px;line-height:1.4;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${color};">${filledHtml(text, context.values)}</p>`;
}

function buttonHtml(
  block: BlockOf<"button">,
  context: EmailBlockContext,
): string {
  const { theme, values } = context;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${theme.buttonMarginCss};"><tr><td style="border-radius:${theme.buttonRadiusPx}px;background:${theme.colors.buttonFill};"><a href="${filledHtml(block.href, values)}" style="display:inline-block;padding:${theme.buttonPaddingCss};${sansCss(theme)}font-size:${theme.buttonFontSizePx}px;font-weight:600;line-height:1;color:${theme.colors.buttonText};text-decoration:none;border-radius:${theme.buttonRadiusPx}px;">${filledHtml(block.label, values)}</a></td></tr></table>`;
}

function imageHtml(
  block: BlockOf<"image">,
  context: EmailBlockContext,
): string {
  const { theme, values } = context;
  const width = clampWidth(block.width);
  return `<img src="${filledHtml(block.src, values)}" alt="${filledHtml(block.alt, values)}" width="${width}" style="display:block;width:100%;max-width:${width}px;height:auto;border:0;margin:0 0 ${theme.blockGapPx}px;">`;
}

function spacerHtml(
  block: BlockOf<"spacer">,
  context: EmailBlockContext,
): string {
  const height = context.theme.spacerPx[block.size];
  return `<div style="height:${height}px;line-height:${height}px;font-size:1px;">&nbsp;</div>`;
}

function heroHtml(block: BlockOf<"hero">, context: EmailBlockContext): string {
  const { colors } = context.theme;
  return [
    hasText(block.eyebrow)
      ? smallLabelHtml(block.eyebrow, colors.emphasis, context)
      : "",
    hasText(block.headline) ? headingHtml(block.headline, 1, context) : "",
    hasText(block.text) ? paragraphHtml(block.text, context) : "",
  ]
    .filter((part) => part.length > 0)
    .join("\n");
}

/** The theme's pill button, drawn bulletproof so Outlook keeps its shape.
 *  Height and side padding come from `buttonPaddingCss` ("18px 36px"). */
function ticketButtonHtml(
  label: string,
  href: string,
  theme: EmailDesignTheme,
): string {
  const [paddingY = 0, paddingX = paddingY] = theme.buttonPaddingCss
    .split(/\s+/)
    .map((part) => Number.parseFloat(part));
  return bulletproofButtonHtml({
    label,
    href,
    fillColor: theme.colors.buttonFill,
    textColor: theme.colors.buttonText,
    fontFamily: theme.fonts.sans,
    fontSizePx: theme.buttonFontSizePx,
    heightPx: theme.buttonFontSizePx + paddingY * 2,
    radiusPx: theme.buttonRadiusPx,
    paddingXPx: paddingX,
  });
}

/** The invite as a bordered card: label, title, text, button, then the
 *  paste-this-link line. */
function ticketHtml(
  block: BlockOf<"ticket">,
  context: EmailBlockContext,
): string {
  const { theme, values, language } = context;
  const { colors } = theme;
  const href = filledText(block.href, values);
  const hasButton = hasText(block.buttonLabel);
  const innerHtml = [
    hasText(block.label)
      ? smallLabelHtml(block.label, colors.inkMuted, context)
      : "",
    headingHtml(
      block.title,
      2,
      context,
      hasText(block.text) ? "0 0 8px" : "0 0 20px",
    ),
    hasText(block.text) ? paragraphHtml(block.text, context) : "",
    hasButton
      ? ticketButtonHtml(filledText(block.buttonLabel, values), href, theme)
      : "",
    hasButton
      ? linkFallbackHtml({
          href,
          language,
          textColor: colors.inkMuted,
          linkColor: colors.link,
          fontFamily: theme.fonts.sans,
        })
      : "",
  ]
    .filter((part) => part.length > 0)
    .join("\n");
  return presentationTable(
    `<tr><td style="padding:${TICKET_PADDING_PX}px;">${innerHtml}</td></tr>`,
    `width="100%" bgcolor="${colors.card}" style="margin:0 0 ${theme.blockGapPx}px;background:${colors.card};border:1px solid ${colors.line};border-radius:${TICKET_RADIUS_PX}px;border-collapse:separate;"`,
  );
}

function featureRowHtml(
  item: EmailFeatureItem,
  isLast: boolean,
  context: EmailBlockContext,
): string {
  const { theme, values, assetOrigin } = context;
  const icon = EMAIL_ASSETS.featureIcons[item.icon];
  const iconHtml = hostedImageHtml({
    url: emailAssetUrl(assetOrigin, icon),
    alt: "",
    width: icon.width,
    height: icon.height,
    style: `width:${icon.width}px;`,
  });
  const padding = isLast
    ? "padding:0;"
    : `padding:0 0 ${FEATURE_ROW_GAP_PX}px;`;
  const titleHtml = `<p style="margin:0 0 4px;${sansCss(theme)}font-size:${theme.bodySizePx}px;line-height:1.4;font-weight:600;color:${theme.colors.heading};">${filledHtml(item.title, values)}</p>`;
  const textHtml = paragraphHtml(item.text, context, "0");
  return `<tr><td width="${icon.width}" valign="top" style="width:${icon.width}px;${padding}">${iconHtml}</td>${gapCellHtml(16)}<td valign="top" style="${padding}">${titleHtml}${textHtml}</td></tr>`;
}

function featureListHtml(
  block: BlockOf<"featureList">,
  context: EmailBlockContext,
): string {
  if (block.items.length === 0) return "";
  const rowsHtml = block.items
    .map((item, index) =>
      featureRowHtml(item, index === block.items.length - 1, context),
    )
    .join("");
  return presentationTable(
    rowsHtml,
    `width="100%" style="margin:0 0 ${context.theme.blockGapPx}px;"`,
  );
}

/** A 40px round avatar: the signer's photo, else the pulse mark. */
function avatarHtml(photoUrl: string, context: EmailBlockContext): string {
  const url = hasText(photoUrl)
    ? photoUrl.trim()
    : emailAssetUrl(context.assetOrigin, EMAIL_ASSETS.pulseMark);
  return hostedImageHtml({
    url,
    alt: "",
    width: AVATAR_SIZE_PX,
    height: AVATAR_SIZE_PX,
    style: `width:${AVATAR_SIZE_PX}px;height:${AVATAR_SIZE_PX}px;border-radius:50%;object-fit:cover;`,
  });
}

function signatureHtml(
  block: BlockOf<"signature">,
  context: EmailBlockContext,
): string {
  const { theme, values } = context;
  const { colors } = theme;
  const noteHtml = hasText(block.note)
    ? `<p style="margin:0 0 16px;font-family:${theme.fonts.serif};font-size:18px;line-height:1.5;font-style:italic;color:${colors.ink};">${inlineMarkupToHtml(block.note, values, colors.link)}</p>`
    : "";
  const nameHtml = hasText(block.name)
    ? `<p style="margin:0;${sansCss(theme)}font-size:${theme.bodySizePx}px;line-height:1.4;font-weight:600;color:${colors.heading};">${filledHtml(block.name, values)}</p>`
    : "";
  const roleHtml = hasText(block.role)
    ? `<p style="margin:0;${sansCss(theme)}font-size:${LABEL_SIZE_PX}px;line-height:1.4;color:${colors.inkMuted};">${filledHtml(block.role, values)}</p>`
    : "";
  const photoUrl = filledText(block.photoUrl, values);
  const rowHtml = `<tr><td width="${AVATAR_SIZE_PX}" valign="middle" style="width:${AVATAR_SIZE_PX}px;">${avatarHtml(photoUrl, context)}</td>${gapCellHtml(12)}<td valign="middle">${nameHtml}${roleHtml}</td></tr>`;
  return [
    noteHtml,
    presentationTable(rowHtml, `style="margin:0 0 ${theme.blockGapPx}px;"`),
  ]
    .filter((part) => part.length > 0)
    .join("\n");
}

/** One block as HTML in the context's design. Pure. */
export function blockToHtml(
  block: EmailBlock,
  context: EmailBlockContext,
): string {
  switch (block.type) {
    case "heading":
      return headingHtml(block.text, block.level, context);
    case "paragraph":
      return paragraphHtml(block.text, context);
    case "button":
      return buttonHtml(block, context);
    case "image":
      return imageHtml(block, context);
    case "divider":
      return context.dividerHtml;
    case "spacer":
      return spacerHtml(block, context);
    case "html":
      return fillPlaceholders(block.html, context.values, true);
    case "hero":
      return heroHtml(block, context);
    case "ticket":
      return ticketHtml(block, context);
    case "featureList":
      return featureListHtml(block, context);
    case "signature":
      return signatureHtml(block, context);
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
    case "hero":
      return joinParts(
        [
          filledText(block.eyebrow, values),
          headingMarkupToText(block.headline, values),
          inlineMarkupToText(block.text, values),
        ],
        "\n\n",
      );
    case "ticket":
      return joinParts(
        [
          filledText(block.label, values),
          headingMarkupToText(block.title, values),
          inlineMarkupToText(block.text, values),
          `${filledText(block.buttonLabel, values)}: ${filledText(block.href, values)}`,
        ],
        "\n\n",
      );
    case "featureList":
      return block.items
        .map(
          (item) =>
            `- ${filledText(item.title, values)}: ${inlineMarkupToText(item.text, values)}`,
        )
        .join("\n");
    case "signature":
      return joinParts(
        [
          inlineMarkupToText(block.note, values),
          filledText(block.name, values),
          filledText(block.role, values),
        ],
        "\n",
      );
  }
}
