import { downloadBlobFile } from "../../../shared/lib/downloadBlob";
import {
  logoAssetPath,
  type LogoColorway,
  type LogoConceptId,
} from "./logoConcepts.data";

/** Edge of the exported PNG, in pixels: the square most social platforms ask
 *  for as a profile picture. */
export const PNG_EXPORT_SIZE = 1080;

/** File name of one concept's SVG in one colourway. */
export function logoSvgFilename(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
): string {
  return `queerpulse-${conceptId}-${colorway}.svg`;
}

/** File name of one concept's 1080px PNG in one colourway. */
export function logoPngFilename(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
): string {
  return `queerpulse-${conceptId}-${colorway}-${PNG_EXPORT_SIZE}.png`;
}

/** Parses SVG markup and checks its root is an `<svg>` element. Throws on
 *  anything else, such as the SPA fallback page the host serves with a 200
 *  for a missing file (which parses to an error document). */
function parseSvgDocument(svgText: string): Document {
  const svgDocument = new DOMParser().parseFromString(svgText, "image/svg+xml");
  if (svgDocument.documentElement.nodeName.toLowerCase() !== "svg") {
    throw new Error("Logo asset is not an SVG document");
  }
  return svgDocument;
}

/** Fetches one concept's SVG in one colourway and returns its markup as
 *  served. Rejects on an HTTP error or when the body is not an SVG. */
async function fetchLogoSvg(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
): Promise<string> {
  const response = await fetch(logoAssetPath(conceptId, colorway));
  if (!response.ok) {
    throw new Error(`Logo asset failed to load (${response.status})`);
  }
  const svgText = await response.text();
  parseSvgDocument(svgText);
  return svgText;
}

/** Saves the static SVG of one concept in one colourway. Rejects when the
 *  file cannot be fetched or is not an SVG. */
export async function downloadLogoSvg(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
): Promise<void> {
  const svgText = await fetchLogoSvg(conceptId, colorway);
  downloadBlobFile(
    logoSvgFilename(conceptId, colorway),
    new Blob([svgText], { type: "image/svg+xml" }),
  );
}

/** Gives the SVG root an explicit pixel size. An SVG with only a viewBox
 *  loads into an Image with no intrinsic size in some browsers, and a canvas
 *  cannot draw it then. */
function sizeSvgForRaster(svgText: string, size: number): string {
  const svgDocument = parseSvgDocument(svgText);
  const svgRoot = svgDocument.documentElement;
  svgRoot.setAttribute("width", String(size));
  svgRoot.setAttribute("height", String(size));
  return new XMLSerializer().serializeToString(svgDocument);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Logo image failed to decode"));
    image.src = source;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas produced no PNG"));
    }, "image/png");
  });
}

/**
 * Rasterises one concept's SVG in one colourway to a square PNG of
 * {@link PNG_EXPORT_SIZE} pixels in the browser and saves it. The one-colour
 * file keeps its transparent ground. Rejects when any step fails (fetch,
 * decode, canvas).
 */
export async function downloadLogoPng(
  conceptId: LogoConceptId,
  colorway: LogoColorway,
): Promise<void> {
  const svgText = sizeSvgForRaster(
    await fetchLogoSvg(conceptId, colorway),
    PNG_EXPORT_SIZE,
  );
  const objectUrl = URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml" }),
  );
  try {
    const image = await loadImage(objectUrl);
    // WebKit can paint an SVG blank right after onload; decode() waits until
    // it is ready. A browser that rejects decode() still draws it.
    await image.decode().catch(() => undefined);
    const canvas = document.createElement("canvas");
    canvas.width = PNG_EXPORT_SIZE;
    canvas.height = PNG_EXPORT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");
    context.drawImage(image, 0, 0, PNG_EXPORT_SIZE, PNG_EXPORT_SIZE);
    const pngBlob = await canvasToPngBlob(canvas);
    downloadBlobFile(logoPngFilename(conceptId, colorway), pngBlob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
