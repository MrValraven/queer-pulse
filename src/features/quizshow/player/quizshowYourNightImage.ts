/**
 * "Save image" for the phone's Your night card (item 15). Everything happens on
 * this device: the card is drawn on a canvas, turned into a PNG and handed to
 * the system share sheet or saved as a download. Nothing is sent or stored.
 *
 * Sizes and colours come from computed CSS custom properties of the card
 * element (the `--night-image-*` geometry in QuizshowPlayerEnd.module.css and
 * the stage's --qs-* colours), and the fonts are the app's own --serif and
 * --sans families, so this file holds no colour literal.
 */

export interface QuizshowNightImageContent {
  /** "Your night". */
  heading: string;
  quizTitle: string;
  /** The card's facts, one line each, in the order the card shows them. */
  facts: readonly string[];
}

/** Why the image could not be made; the card names it in its error copy. */
export type QuizshowNightImageFailure =
  "styles_missing" | "canvas_unavailable" | "png_unavailable";

export class QuizshowNightImageError extends Error {
  readonly failure: QuizshowNightImageFailure;

  constructor(failure: QuizshowNightImageFailure) {
    super(failure);
    this.name = "QuizshowNightImageError";
    this.failure = failure;
  }
}

export type QuizshowNightImageOutcome = "shared" | "downloaded" | "cancelled";

export const QUIZSHOW_NIGHT_IMAGE_FILE_NAME = "pulse-live-your-night.png";

/** How long the download's object URL stays alive after the click. */
export const NIGHT_IMAGE_URL_LIFETIME_MS = 30_000;

interface NightImageGeometry {
  width: number;
  height: number;
  padding: number;
  titleSize: number;
  subtitleSize: number;
  factSize: number;
  gap: number;
}

interface NightImagePalette {
  base: string;
  veil: string;
  text: string;
  textMute: string;
  line: string;
  fieldCoral: string;
  fieldPlum: string;
  fieldRose: string;
}

function readProperty(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim();
}

function readNumber(styles: CSSStyleDeclaration, name: string): number {
  return Number.parseFloat(readProperty(styles, name));
}

function geometryOf(styles: CSSStyleDeclaration): NightImageGeometry {
  return {
    width: readNumber(styles, "--night-image-width"),
    height: readNumber(styles, "--night-image-height"),
    padding: readNumber(styles, "--night-image-padding"),
    titleSize: readNumber(styles, "--night-image-title-size"),
    subtitleSize: readNumber(styles, "--night-image-subtitle-size"),
    factSize: readNumber(styles, "--night-image-fact-size"),
    gap: readNumber(styles, "--night-image-gap"),
  };
}

/** Each canvas size must be a positive number; a stylesheet that did not load leaves them NaN. */
function isGeometryReady(geometry: NightImageGeometry): boolean {
  return Object.values(geometry).every(
    (value) => Number.isFinite(value) && value > 0,
  );
}

function isPaletteReady(palette: NightImagePalette): boolean {
  return Object.values(palette).every((colour) => colour !== "");
}

/** The canvas font shorthands: the serif face for the title and facts, the sans face for the quiz title. */
interface NightImageFonts {
  title: string;
  subtitle: string;
  fact: string;
}

function fontsOf(
  styles: CSSStyleDeclaration,
  geometry: NightImageGeometry,
): NightImageFonts | null {
  const serif = readProperty(styles, "--serif");
  const sans = readProperty(styles, "--sans");
  if (serif === "" || sans === "") return null;
  return {
    title: `600 ${geometry.titleSize}px ${serif}`,
    subtitle: `500 ${geometry.subtitleSize}px ${sans}`,
    fact: `600 ${geometry.factSize}px ${serif}`,
  };
}

/**
 * Loads the two faces the image draws with, so the canvas never paints the
 * fallback. A face that cannot load leaves the browser's fallback in place.
 */
async function loadFonts(fonts: NightImageFonts): Promise<void> {
  if (typeof document.fonts === "undefined") return;
  await Promise.all(
    [fonts.title, fonts.subtitle].map((font) =>
      document.fonts.load(font).catch(() => []),
    ),
  );
}

function paletteOf(styles: CSSStyleDeclaration): NightImagePalette {
  return {
    base: readProperty(styles, "--qs-base"),
    veil: readProperty(styles, "--qs-veil"),
    text: readProperty(styles, "--qs-text"),
    textMute: readProperty(styles, "--qs-text-mute"),
    line: readProperty(styles, "--qs-line"),
    fieldCoral: readProperty(styles, "--qs-field-coral"),
    fieldPlum: readProperty(styles, "--qs-field-plum"),
    fieldRose: readProperty(styles, "--qs-field-rose"),
  };
}

/** One soft colour field of the velvet backdrop, fading to nothing at its edge. */
function paintField(
  context: CanvasRenderingContext2D,
  colour: string,
  centre: { x: number; y: number },
  radius: number,
) {
  const gradient = context.createRadialGradient(
    centre.x,
    centre.y,
    0,
    centre.x,
    centre.y,
    radius,
  );
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, "transparent");
  context.fillStyle = gradient;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

function paintBackdrop(
  context: CanvasRenderingContext2D,
  geometry: NightImageGeometry,
  palette: NightImagePalette,
) {
  const { width, height } = geometry;
  context.fillStyle = palette.base;
  context.fillRect(0, 0, width, height);
  paintField(context, palette.fieldCoral, { x: 0, y: 0 }, width);
  paintField(context, palette.fieldPlum, { x: width, y: height }, width);
  paintField(context, palette.fieldRose, { x: width, y: 0 }, width * 0.7);
  context.fillStyle = palette.veil;
  context.fillRect(0, 0, width, height);
}

/** Breaks `text` into lines no wider than `maxWidth`, keeping at most `maxLines`. */
function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let currentLine = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = currentLine === "" ? word : `${currentLine} ${word}`;
    if (
      context.measureText(candidate).width <= maxWidth ||
      currentLine === ""
    ) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine !== "") lines.push(currentLine);
  return lines.slice(0, maxLines);
}

function paintContent(
  context: CanvasRenderingContext2D,
  content: QuizshowNightImageContent,
  geometry: NightImageGeometry,
  palette: NightImagePalette,
  fonts: NightImageFonts,
) {
  const { padding, gap, width } = geometry;
  const textWidth = width - padding * 2;
  context.textBaseline = "alphabetic";
  context.textAlign = "left";

  let cursorY = padding + geometry.titleSize;
  context.fillStyle = palette.text;
  context.font = fonts.title;
  context.fillText(content.heading, padding, cursorY, textWidth);

  context.fillStyle = palette.textMute;
  context.font = fonts.subtitle;
  for (const line of wrapLines(context, content.quizTitle, textWidth, 2)) {
    cursorY += geometry.subtitleSize * 1.3;
    context.fillText(line, padding, cursorY, textWidth);
  }

  cursorY += gap * 1.5;
  context.font = fonts.fact;
  for (const fact of content.facts) {
    context.fillStyle = palette.line;
    context.fillRect(padding, cursorY, textWidth, 2);
    cursorY += gap + geometry.factSize;
    context.fillStyle = palette.text;
    context.fillText(fact, padding, cursorY, textWidth);
    cursorY += gap;
  }
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject(new QuizshowNightImageError("png_unavailable"));
      } else {
        resolve(blob);
      }
    }, "image/png");
  });
}

/**
 * Draws the night card as a PNG. `source` is the card element: its computed
 * style holds the image geometry and the stage colours.
 */
export async function drawYourNightImage(
  source: HTMLElement,
  content: QuizshowNightImageContent,
): Promise<Blob> {
  const styles = getComputedStyle(source);
  const geometry = geometryOf(styles);
  const palette = paletteOf(styles);
  const fonts = fontsOf(styles, geometry);
  if (
    !isGeometryReady(geometry) ||
    !isPaletteReady(palette) ||
    fonts === null
  ) {
    throw new QuizshowNightImageError("styles_missing");
  }
  const canvas = document.createElement("canvas");
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const context = canvas.getContext("2d");
  if (context === null) throw new QuizshowNightImageError("canvas_unavailable");
  await loadFonts(fonts);
  paintBackdrop(context, geometry, palette);
  paintContent(context, content, geometry, palette, fonts);
  return canvasToPng(canvas);
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // A slow device can still be reading the file a moment after the click.
  window.setTimeout(
    () => URL.revokeObjectURL(objectUrl),
    NIGHT_IMAGE_URL_LIFETIME_MS,
  );
}

function isShareAborted(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Hands the PNG to the system share sheet when this browser can share files,
 * else saves it as a download. A share the person closes is "cancelled"; a
 * share the browser refuses (a lost tap permission after drawing, for one)
 * falls back to the download.
 */
export async function shareOrDownloadNightImage(
  blob: Blob,
  shareTitle: string,
): Promise<QuizshowNightImageOutcome> {
  const file = new File([blob], QUIZSHOW_NIGHT_IMAGE_FILE_NAME, {
    type: "image/png",
  });
  const canShareFile =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });
  if (canShareFile) {
    try {
      await navigator.share({ files: [file], title: shareTitle });
      return "shared";
    } catch (error) {
      if (isShareAborted(error)) return "cancelled";
    }
  }
  downloadBlob(blob, QUIZSHOW_NIGHT_IMAGE_FILE_NAME);
  return "downloaded";
}
