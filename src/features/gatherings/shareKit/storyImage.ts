import { STORY_IMAGE_MIME_TYPE } from "./shareKit.data";
import {
  STORY_BRAND_DOT,
  STORY_CANVAS_HEIGHT,
  STORY_CANVAS_WIDTH,
  STORY_COLOR_TOKENS,
  STORY_FALLBACK_PALETTE,
  STORY_FONT_TOKENS,
  STORY_ORBS,
  STORY_TEXT,
  STORY_TITLE_LAYOUT,
  type StoryPalette,
  type StoryTextSpec,
} from "./storyImage.data";
import { fitLine, storyLineMaxWidth, wrapTitleLines } from "./storyTextFit";

/** Everything the story image prints, already translated and formatted. */
export interface StoryImageContent {
  brandName: string;
  formatName: string;
  dayNumber: string;
  weekday: string;
  monthAndTime: string;
  title: string;
  place: string;
  details: string;
  displayUrl: string;
}

/** The brand colours and fonts, read from the live tokens at draw time. */
export function readStoryPalette(): StoryPalette {
  if (typeof document === "undefined") return { ...STORY_FALLBACK_PALETTE };
  const rootStyles = getComputedStyle(document.documentElement);
  const read = (token: string, fallback: string) =>
    rootStyles.getPropertyValue(token).trim() || fallback;
  return {
    plum: read(STORY_COLOR_TOKENS.plum, STORY_FALLBACK_PALETTE.plum),
    accent: read(STORY_COLOR_TOKENS.accent, STORY_FALLBACK_PALETTE.accent),
    jade: read(STORY_COLOR_TOKENS.jade, STORY_FALLBACK_PALETTE.jade),
    cream: read(STORY_COLOR_TOKENS.cream, STORY_FALLBACK_PALETTE.cream),
    serif: read(STORY_FONT_TOKENS.serif, STORY_FALLBACK_PALETTE.serif),
    sans: read(STORY_FONT_TOKENS.sans, STORY_FALLBACK_PALETTE.sans),
  };
}

const rgba = (channels: string, alpha: number) => `rgba(${channels}, ${alpha})`;

function canvasFont(spec: StoryTextSpec, palette: StoryPalette): string {
  const style = spec.isItalic ? "italic " : "";
  return `${style}${spec.weight} ${spec.size}px ${palette[spec.family]}`;
}

/** Paint one line at its spec, fitted to the canvas: a line too long for the
 *  space right of `spec.x` ends in an ellipsis inside the side margin. */
function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  spec: StoryTextSpec,
  palette: StoryPalette,
  baselineY: number = spec.y,
) {
  if (!text) return;
  context.font = canvasFont(spec, palette);
  context.fillStyle =
    spec.tone === "accent"
      ? rgba(palette.accent, 1)
      : rgba(palette.cream, spec.alpha ?? 1);
  const fittedText = fitLine(
    text,
    storyLineMaxWidth(spec),
    (line) => context.measureText(line).width,
  );
  context.fillText(fittedText, spec.x, baselineY);
}

function drawGround(context: CanvasRenderingContext2D, palette: StoryPalette) {
  context.fillStyle = rgba(palette.plum, 1);
  context.fillRect(0, 0, STORY_CANVAS_WIDTH, STORY_CANVAS_HEIGHT);
  for (const orb of STORY_ORBS) {
    const channels = palette[orb.tone];
    const gradient = context.createRadialGradient(
      orb.x,
      orb.y,
      0,
      orb.x,
      orb.y,
      orb.radius,
    );
    gradient.addColorStop(0, rgba(channels, orb.alpha));
    gradient.addColorStop(1, rgba(channels, 0));
    context.fillStyle = gradient;
    context.fillRect(0, 0, STORY_CANVAS_WIDTH, STORY_CANVAS_HEIGHT);
  }
  context.beginPath();
  context.arc(
    STORY_BRAND_DOT.x,
    STORY_BRAND_DOT.y,
    STORY_BRAND_DOT.radius,
    0,
    Math.PI * 2,
  );
  context.fillStyle = rgba(palette.accent, 1);
  context.fill();
}

/** Paint the whole story image onto a 1080x1920 context. */
export function drawStoryImage(
  context: CanvasRenderingContext2D,
  content: StoryImageContent,
  palette: StoryPalette,
) {
  drawGround(context, palette);
  drawText(context, content.brandName, STORY_TEXT.brand, palette);
  drawText(context, content.formatName, STORY_TEXT.formatName, palette);
  drawText(context, content.dayNumber, STORY_TEXT.dayNumber, palette);
  drawText(context, content.weekday, STORY_TEXT.weekday, palette);
  drawText(context, content.monthAndTime, STORY_TEXT.monthAndTime, palette);

  context.font = canvasFont(STORY_TEXT.title, palette);
  const titleLines = wrapTitleLines(
    content.title,
    STORY_TITLE_LAYOUT.maxWidth,
    (line) => context.measureText(line).width,
    STORY_TITLE_LAYOUT.maxLines,
  );
  titleLines.forEach((line, index) =>
    drawText(
      context,
      line,
      STORY_TEXT.title,
      palette,
      STORY_TEXT.title.y + index * STORY_TITLE_LAYOUT.lineHeight,
    ),
  );
  const lastTitleBaseline =
    STORY_TEXT.title.y +
    Math.max(titleLines.length - 1, 0) * STORY_TITLE_LAYOUT.lineHeight;
  drawText(
    context,
    content.place,
    STORY_TEXT.place,
    palette,
    lastTitleBaseline + STORY_TITLE_LAYOUT.placeOffsetY,
  );
  drawText(
    context,
    content.details,
    STORY_TEXT.details,
    palette,
    lastTitleBaseline + STORY_TITLE_LAYOUT.detailsOffsetY,
  );
  drawText(context, content.displayUrl, STORY_TEXT.url, palette);
}

/** Wait for every face the image uses, so no line paints in a fallback font.
 *  A face that fails to load leaves the browser's fallback in place. */
async function loadStoryFonts(palette: StoryPalette) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fonts = new Set(
    Object.values(STORY_TEXT).map((spec) => canvasFont(spec, palette)),
  );
  await Promise.all(
    [...fonts].map((font) => document.fonts.load(font).catch(() => [])),
  );
}

/** Render the story image and hand it back as a PNG blob. */
export async function renderStoryImageBlob(
  content: StoryImageContent,
): Promise<Blob> {
  const palette = readStoryPalette();
  await loadStoryFonts(palette);
  const canvas = document.createElement("canvas");
  canvas.width = STORY_CANVAS_WIDTH;
  canvas.height = STORY_CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  drawStoryImage(context, content, palette);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The story image could not be encoded"));
    }, STORY_IMAGE_MIME_TYPE);
  });
}
