import type { Language } from "../../../../shared/i18n/types";
import type { EmailDesignRenderer } from "../emailDesign.types";
import type { EmailBlock } from "../emailTemplate.types";
import { escapeHtml, inlineMarkupToHtml } from "../emailInlineMarkup";
import { EMAIL_FOOTER, EMAIL_SITE_URL, EMAIL_WORDMARK } from "../emailTheme";
import {
  EMAIL_ASSETS,
  emailAssetUrl,
  type EmailImageAsset,
} from "./emailAssets";
import {
  emailDocumentHtml,
  hostedImageHtml,
  pageFrameHtml,
  spacerRowHtml,
} from "./emailShared";
import {
  STAGE_COLORS,
  STAGE_FONTS,
  displayHeadingHtml,
  dottedLabelHtml,
  hasText,
  stageBlockHtml,
  type StageBlockContext,
  type StageBlockOf,
} from "./stageBlocks";

/**
 * The "stage" email design: walking into a warm, lit venue. A plum-deep masthead
 * carries the logo, the lifted hero in large Georgia display type and the
 * animated pulse band; the body runs on cream with white cards and the invite
 * drawn as a dashed-edge pass; a quiet cream footer closes it.
 *
 * Gutters are fluid without media queries: each row's content sits in a
 * column capped at 520px inside a 20px cell padding, so the gutter is 40px on
 * a 600px card and 20px on a phone. Outlook desktop, which ignores
 * `max-width`, gets a fixed 520px ghost table instead.
 */
const COLORS = STAGE_COLORS;
const CARD_RADIUS_PX = 20;
const CARD_WIDTH_PX = 600;
const COLUMN_MAX_WIDTH_PX = 520;
const MASTHEAD_FOOT_PX = 20;
const BAND_GAP_PX = 16;
const ROW_SIDE_PADDING_PX = 20;
const SECTION_GAP_PX = 48;
const CARD_GAP_PX = 32;
const TEXT_GAP_PX = 20;
const HEADING_TO_CONTENT_GAP_PX = 16;
const CARD_BLOCK_TYPES = new Set<EmailBlock["type"]>([
  "ticket",
  "featureList",
  "signature",
  "image",
  "button",
  "divider",
]);

/** A centred column that goes fluid below 520px wide. */
function columnHtml(innerHtml: string): string {
  const width = COLUMN_MAX_WIDTH_PX;
  return [
    `<!--[if mso]><table role="presentation" width="${width}" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->`,
    `<table role="presentation" width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${width}px;margin:0 auto;">${innerHtml}</table>`,
    "<!--[if mso]></td></tr></table><![endif]-->",
  ].join("");
}

function cardRowHtml(
  color: string,
  paddingTopPx: number,
  paddingBottomPx: number,
  innerHtml: string,
) {
  return `<tr><td bgcolor="${color}" style="padding:${paddingTopPx}px ${ROW_SIDE_PADDING_PX}px ${paddingBottomPx}px;background:${color};">${columnHtml(innerHtml)}</td></tr>`;
}

function mastheadHeroHtml(
  hero: StageBlockOf<"hero">,
  context: StageBlockContext,
): string {
  const rows: string[] = [spacerRowHtml(32)];
  if (hasText(hero.eyebrow)) {
    rows.push(
      `<tr><td>${dottedLabelHtml(hero.eyebrow, COLORS.accentSoft, COLORS.coral, context)}</td></tr>`,
      spacerRowHtml(14),
    );
  }
  if (hasText(hero.headline)) {
    // Coral on plum deep is 5.93:1, so the emphasis stays coral at display size.
    const headlineHtml = displayHeadingHtml(
      hero.headline,
      {
        tag: "h1",
        sizePx: 44,
        lineHeight: 1.08,
        color: COLORS.cream,
        emphasisColor: COLORS.coral,
      },
      context,
    );
    rows.push(`<tr><td>${headlineHtml}</td></tr>`);
  }
  if (hasText(hero.text)) {
    rows.push(
      `<tr><td><p style="margin:14px 0 0;font-family:${STAGE_FONTS.sans};font-size:18px;line-height:1.55;color:${COLORS.creamMuted};">${inlineMarkupToHtml(hero.text, context.values, COLORS.accentSoft)}</p></td></tr>`,
    );
  }
  return rows.join("");
}

/** The logo image carries styled alt text, so a client that blocks images
 *  still shows the wordmark in cream serif on plum. */
function logoHtml(
  asset: EmailImageAsset,
  widthPx: number,
  altColor: string,
  assetOrigin: string,
) {
  return hostedImageHtml({
    url: emailAssetUrl(assetOrigin, asset),
    alt: EMAIL_WORDMARK,
    width: widthPx,
    height: Math.round((asset.height * widthPx) / asset.width),
    style: `width:${widthPx}px;font-family:${STAGE_FONTS.serif};font-size:20px;font-weight:600;color:${altColor};`,
  });
}

function mastheadHtml(
  hero: StageBlockOf<"hero"> | null,
  context: StageBlockContext,
): string {
  // Plum deep, the pulse band's own ground, so the band and the rounded
  // strip under it join without a seam.
  const plum = COLORS.plumDeep;
  const logo = logoHtml(
    EMAIL_ASSETS.logoOnDark,
    EMAIL_ASSETS.logoOnDark.width,
    COLORS.cream,
    context.assetOrigin,
  );
  const contentHtml = `<tr><td>${logo}</td></tr>${hero ? mastheadHeroHtml(hero, context) : ""}`;
  const band = EMAIL_ASSETS.heroPulse;
  const bandHtml = hostedImageHtml({
    url: emailAssetUrl(context.assetOrigin, band),
    alt: "",
    width: band.width,
    height: band.height,
    style: `width:100%;max-width:${band.width}px;margin:0 auto;background:${plum};`,
  });
  return [
    `<tr><td bgcolor="${plum}" style="padding:32px ${ROW_SIDE_PADDING_PX}px 0;background:${plum};border-radius:${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px 0 0;">${columnHtml(contentHtml)}</td></tr>`,
    `<tr><td align="center" bgcolor="${plum}" style="padding:${BAND_GAP_PX}px 0 0;background:${plum};font-size:0;line-height:0;">${bandHtml}</td></tr>`,
    // Rounds off the bottom of the masthead so it floats as a dark card on
    // the cream body.
    `<tr><td height="${MASTHEAD_FOOT_PX}" bgcolor="${plum}" style="height:${MASTHEAD_FOOT_PX}px;background:${plum};border-radius:0 0 ${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px;font-size:0;line-height:0;">&nbsp;</td></tr>`,
  ].join("\n");
}

/** Space above `next`: a new section breathes most, a heading hugs what it
 *  introduces, cards get room, and runs of text sit closest. */
function gapBefore(previous: EmailBlock, next: EmailBlock): number {
  if (previous.type === "spacer" || next.type === "spacer") return 0;
  if (previous.type === "heading") return HEADING_TO_CONTENT_GAP_PX;
  if (previous.type === "divider") return CARD_GAP_PX;
  if (next.type === "heading" || next.type === "hero") return SECTION_GAP_PX;
  if (CARD_BLOCK_TYPES.has(previous.type) || CARD_BLOCK_TYPES.has(next.type)) {
    return CARD_GAP_PX;
  }
  return TEXT_GAP_PX;
}

function bodyHtml(blocks: EmailBlock[], context: StageBlockContext): string {
  const rows = blocks.flatMap((block, index) => {
    const blockRow = `<tr><td>${stageBlockHtml(block, context)}</td></tr>`;
    const previous = blocks[index - 1];
    if (previous === undefined) return [blockRow];
    const gap = gapBefore(previous, block);
    return gap > 0 ? [spacerRowHtml(gap), blockRow] : [blockRow];
  });
  return cardRowHtml(COLORS.cream, 36, 48, rows.join("\n"));
}

function footerHtml(language: Language, assetOrigin: string): string {
  const textStyle = `font-family:${STAGE_FONTS.sans};font-size:13px;line-height:1.6;color:${COLORS.inkMuted};`;
  const siteLabel = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  const linkHtml = `<a href="${escapeHtml(EMAIL_SITE_URL)}" style="color:${COLORS.accentText};text-decoration:none;font-weight:700;">${escapeHtml(siteLabel)}</a>`;
  const innerHtml = [
    `<tr><td style="border-top:1px solid ${COLORS.line};padding:32px 0 0;">${logoHtml(EMAIL_ASSETS.logoOnLight, 120, COLORS.plum, assetOrigin)}</td></tr>`,
    `<tr><td><p style="margin:16px 0 0;${textStyle}">${escapeHtml(EMAIL_FOOTER[language])}</p><p style="margin:4px 0 0;${textStyle}">${linkHtml}</p></td></tr>`,
  ].join("");
  const { cream } = COLORS;
  return `<tr><td bgcolor="${cream}" style="padding:0 ${ROW_SIDE_PADDING_PX}px 44px;background:${cream};border-radius:0 0 ${CARD_RADIUS_PX}px ${CARD_RADIUS_PX}px;">${columnHtml(innerHtml)}</td></tr>`;
}

/** Draws a whole block-built email in the stage design. A leading hero is
 *  lifted into the plum masthead; every other block runs on cream. */
export const renderStageEmail: EmailDesignRenderer = (input) => {
  const context: StageBlockContext = {
    values: input.values,
    language: input.language,
    assetOrigin: input.assetOrigin,
  };
  const [firstBlock] = input.blocks;
  const leadHero = firstBlock?.type === "hero" ? firstBlock : null;
  const bodyBlocks = leadHero ? input.blocks.slice(1) : input.blocks;
  const { cream } = COLORS;
  // Outlook desktop reads `width:100%` and ignores `max-width`, so it gets a
  // fixed 600px ghost table; every other client keeps the fluid card. A fixed
  // `width:600px` on the card itself would push a phone to 600px wide.
  const cardHtml = [
    `<!--[if mso]><table role="presentation" width="${CARD_WIDTH_PX}" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->`,
    `<table role="presentation" width="${CARD_WIDTH_PX}" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="${cream}" style="width:100%;max-width:${CARD_WIDTH_PX}px;background:${cream};border-radius:${CARD_RADIUS_PX}px;">`,
    mastheadHtml(leadHero, context),
    bodyBlocks.length > 0 ? bodyHtml(bodyBlocks, context) : spacerRowHtml(8),
    footerHtml(input.language, input.assetOrigin),
    "</table>",
    "<!--[if mso]></td></tr></table><![endif]-->",
  ].join("\n");
  return emailDocumentHtml({
    language: input.language,
    subject: input.subject,
    preheader: input.preheader,
    pageColor: cream,
    bodyHtml: pageFrameHtml(cream, "16px 8px 40px", cardHtml),
  });
};
