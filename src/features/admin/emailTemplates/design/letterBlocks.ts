import type { EmailBlock, EmailFeatureItem } from "../emailTemplate.types";
import type { EmailFillValues } from "../emailTemplatePurposes";
import {
  escapeHtml,
  fillPlaceholders,
  headingMarkupToHtml,
  inlineMarkupToHtml,
} from "../emailInlineMarkup";
import { blockToHtml, type EmailBlockContext } from "../renderEmailBlocks";
import { EMAIL_ASSETS, emailAssetUrl } from "./emailAssets";
import { EMAIL_PALETTE } from "./emailPalette";
import {
  bulletproofButtonHtml,
  colorCellHtml,
  hostedImageHtml,
  linkFallbackHtml,
  presentationTable,
  spacerRowHtml,
} from "./emailShared";

/**
 * Block renderers for the "letter" design: an editorial letter on paper.
 * Plum lives only in the type, coral appears as small fills (a rule, a bar,
 * a dot, the button), and the serif carries every display moment. Contrast
 * notes for each colour live in `emailPalette.ts`; the two pairs it does not
 * list are noted where they are used.
 */
const PALETTE = EMAIL_PALETTE.colors;
const { serif: SERIF, sans: SANS } = EMAIL_PALETTE.fonts;

export type LetterBlockOf<Type extends EmailBlock["type"]> = Extract<
  EmailBlock,
  { type: Type }
>;

const SMALL_CAPS_CSS = `font-family:${SANS};font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;`;
const BUTTON_HEIGHT_PX = 52;
const FEATURE_ICON_PX = 40;
/** Matches the sheet's radius in `letterDesign.ts`. */
const TICKET_RADIUS_PX = 8;

function hasText(text: string): boolean {
  return text.trim().length > 0;
}

function filledText(text: string, values: EmailFillValues): string {
  return fillPlaceholders(text, values, false);
}

function joinHtml(parts: string[]): string {
  return parts.filter((part) => part.length > 0).join("\n");
}

/** Vertical rhythm as a full-width spacer table. Outlook desktop drops
 *  margins on tables and divs, so every gap between blocks is one of these. */
export function letterSpacerHtml(heightPx: number): string {
  return presentationTable(
    spacerRowHtml(heightPx),
    'width="100%" style="width:100%;"',
  );
}

/** A small uppercase line in accent text: the eyebrow, the ticket label, the
 *  byline's "A note from". Accent text on creamDeep is 4.89:1. */
export function smallCapsHtml(
  text: string,
  values: EmailFillValues,
  marginCss: string,
): string {
  return `<p style="margin:${marginCss};${SMALL_CAPS_CSS}color:${PALETTE.accentText};">${escapeHtml(filledText(text, values))}</p>`;
}

/** Georgia display type: regular weight, tight tracking, italic emphasis in
 *  accent text (5.94:1 on paper). */
function displayHtml(
  tag: "h1" | "h2" | "p",
  text: string,
  sizePx: number,
  marginCss: string,
  values: EmailFillValues,
): string {
  const lineHeight = sizePx >= 32 ? 1.1 : 1.25;
  const tracking = sizePx >= 32 ? "-0.02em" : "-0.01em";
  return `<${tag} style="margin:${marginCss};font-family:${SERIF};font-size:${sizePx}px;line-height:${lineHeight};font-weight:400;letter-spacing:${tracking};color:${PALETTE.plum};">${headingMarkupToHtml(text, values, PALETTE.accentText)}</${tag}>`;
}

function pillButtonHtml(label: string, href: string): string {
  return bulletproofButtonHtml({
    label,
    href,
    fillColor: PALETTE.accentFill,
    textColor: PALETTE.paper,
    fontFamily: SANS,
    fontSizePx: 16,
    heightPx: BUTTON_HEIGHT_PX,
    radiusPx: 999,
    paddingXPx: 30,
  });
}

/** The short coral rule that opens the hero. */
function openingRuleHtml(): string {
  const ruleHtml = presentationTable(
    `<tr>${colorCellHtml(PALETTE.coral, 36, 2, "1px")}</tr>`,
  );
  return `${ruleHtml}\n${letterSpacerHtml(18)}`;
}

function heroHtml(
  block: LetterBlockOf<"hero">,
  context: EmailBlockContext,
): string {
  const { values } = context;
  const hasEyebrow = hasText(block.eyebrow);
  return joinHtml([
    hasEyebrow ? openingRuleHtml() : "",
    hasEyebrow ? smallCapsHtml(block.eyebrow, values, "0 0 18px") : "",
    hasText(block.headline)
      ? displayHtml("h1", block.headline, 40, "0 0 22px", values)
      : "",
    hasText(block.text)
      ? `<p style="margin:0;font-family:${SERIF};font-size:20px;line-height:1.55;color:${PALETTE.inkStrong};">${inlineMarkupToHtml(block.text, values, PALETTE.accentText)}</p>`
      : "",
    letterSpacerHtml(44),
  ]);
}

/** The invite, quiet: a creamDeep panel with a coral bar down its left
 *  edge, rounded like the sheet. The fallback line uses ink because inkMuted
 *  on creamDeep is 4.44:1. */
function ticketHtml(
  block: LetterBlockOf<"ticket">,
  context: EmailBlockContext,
): string {
  const { values, language } = context;
  const href = filledText(block.href, values);
  const hasButton = hasText(block.buttonLabel);
  const innerHtml = joinHtml([
    hasText(block.label) ? smallCapsHtml(block.label, values, "0 0 12px") : "",
    displayHtml("p", block.title, 24, "0 0 10px", values),
    hasText(block.text)
      ? `<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${PALETTE.ink};">${inlineMarkupToHtml(block.text, values, PALETTE.accentText)}</p>`
      : "",
    hasButton
      ? `${letterSpacerHtml(24)}${pillButtonHtml(filledText(block.buttonLabel, values), href)}`
      : "",
    hasButton
      ? linkFallbackHtml({
          href,
          language,
          textColor: PALETTE.ink,
          linkColor: PALETTE.accentText,
          fontFamily: SANS,
          marginCss: "18px 0 0",
        })
      : "",
  ]);
  const { creamDeep, coral } = PALETTE;
  const radius = TICKET_RADIUS_PX;
  const barHtml = `<td width="4" bgcolor="${coral}" style="width:4px;background:${coral};border-radius:${radius}px 0 0 ${radius}px;font-size:0;line-height:0;">&nbsp;</td>`;
  const bodyHtml = `<td bgcolor="${creamDeep}" style="padding:28px 24px 28px 26px;background:${creamDeep};border-radius:0 ${radius}px ${radius}px 0;">${innerHtml}</td>`;
  const panelHtml = presentationTable(
    `<tr>${barHtml}${bodyHtml}</tr>`,
    `width="100%" bgcolor="${creamDeep}" style="width:100%;background:${creamDeep};border-radius:${radius}px;border-collapse:separate;"`,
  );
  return `${panelHtml}\n${letterSpacerHtml(12)}`;
}

function featureRowHtml(
  item: EmailFeatureItem,
  isFirst: boolean,
  context: EmailBlockContext,
): string {
  const { values, assetOrigin } = context;
  const icon = EMAIL_ASSETS.featureIcons[item.icon];
  const iconHtml = hostedImageHtml({
    url: emailAssetUrl(assetOrigin, icon),
    alt: "",
    width: FEATURE_ICON_PX,
    height: FEATURE_ICON_PX,
    style: `width:${FEATURE_ICON_PX}px;height:${FEATURE_ICON_PX}px;border-radius:50%;background:${PALETTE.coralTint};`,
  });
  const border = isFirst ? "" : `border-top:1px solid ${PALETTE.line};`;
  const cellCss = `padding:20px 0;${border}`;
  const titleHtml = `<p style="margin:0 0 4px;font-family:${SANS};font-size:16px;line-height:1.4;font-weight:700;color:${PALETTE.plum};">${escapeHtml(filledText(item.title, values))}</p>`;
  const textHtml = `<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${PALETTE.ink};">${inlineMarkupToHtml(item.text, values, PALETTE.accentText)}</p>`;
  return `<tr><td width="${FEATURE_ICON_PX}" valign="top" style="width:${FEATURE_ICON_PX}px;${cellCss}">${iconHtml}</td><td width="18" style="width:18px;${cellCss}font-size:0;line-height:0;">&nbsp;</td><td valign="top" style="${cellCss}">${titleHtml}${textHtml}</td></tr>`;
}

function featureListHtml(
  block: LetterBlockOf<"featureList">,
  context: EmailBlockContext,
): string {
  if (block.items.length === 0) return "";
  const rowsHtml = block.items
    .map((item, index) => featureRowHtml(item, index === 0, context))
    .join("");
  const listHtml = presentationTable(
    rowsHtml,
    'width="100%" style="width:100%;border-collapse:collapse;"',
  );
  return `${listHtml}\n${letterSpacerHtml(36)}`;
}

/** Where the signature block sits: the note large and italic, then the
 *  name. A signer with a photo also gets the byline at the top. */
function signOffHtml(
  block: LetterBlockOf<"signature">,
  context: EmailBlockContext,
): string {
  const { values } = context;
  const nameHtml = hasText(block.name)
    ? `<p style="margin:0;font-family:${SERIF};font-size:17px;line-height:1.4;color:${PALETTE.plum};">${escapeHtml(filledText(block.name, values))}</p>`
    : "";
  const roleHtml = hasText(block.role)
    ? `<p style="margin:2px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${PALETTE.inkMuted};">${escapeHtml(filledText(block.role, values))}</p>`
    : "";
  return joinHtml([
    letterSpacerHtml(12),
    hasText(block.note)
      ? `<p style="margin:0 0 18px;font-family:${SERIF};font-size:26px;line-height:1.3;font-style:italic;letter-spacing:-0.01em;color:${PALETTE.plum};">${inlineMarkupToHtml(block.note, values, PALETTE.accentText)}</p>`
      : "",
    presentationTable(`<tr>${colorCellHtml(PALETTE.coral, 24, 2, "1px")}</tr>`),
    letterSpacerHtml(14),
    nameHtml,
    roleHtml,
    letterSpacerHtml(32),
  ]);
}

function buttonHtml(block: LetterBlockOf<"button">, values: EmailFillValues) {
  const buttonTable = pillButtonHtml(
    filledText(block.label, values),
    filledText(block.href, values),
  );
  return [letterSpacerHtml(8), buttonTable, letterSpacerHtml(36)].join("\n");
}

/** One block in the letter's language. Paragraph, image, spacer and html go
 *  through the shared renderer with the theme in the context. */
export function letterBlockHtml(
  block: EmailBlock,
  context: EmailBlockContext,
): string {
  switch (block.type) {
    case "hero":
      return heroHtml(block, context);
    case "heading":
      return block.level === 1
        ? displayHtml("h1", block.text, 36, "0 0 24px", context.values)
        : displayHtml("h2", block.text, 26, "0 0 8px", context.values);
    case "ticket":
      return ticketHtml(block, context);
    case "featureList":
      return featureListHtml(block, context);
    case "signature":
      return signOffHtml(block, context);
    case "button":
      return buttonHtml(block, context.values);
    case "divider":
      return context.dividerHtml;
    default:
      return blockToHtml(block, context);
  }
}
