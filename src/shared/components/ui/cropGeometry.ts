export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  aspect: string;
}

export interface SourceSize {
  width: number;
  height: number;
}

/** Identity crop: the whole image, unaspected. Used as the default/reset state. */
export const IDENTITY_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1, aspect: "free" };

/** True when the crop rect covers the entire source image (no reframing applied). */
export function isIdentityCrop(crop: CropRect): boolean {
  return crop.x === 0 && crop.y === 0 && crop.width === 1 && crop.height === 1;
}

/** Largest crop of the given numeric aspect that fits the source, as fractions. */
export function baseCropForAspect(source: SourceSize, aspect: number): { width: number; height: number } {
  const sourceAspect = source.width / source.height;
  if (sourceAspect > aspect) {
    // source is wider than the frame -> height limits
    const width = (aspect * source.height) / source.width;
    return { width, height: 1 };
  }
  // source is taller/narrower -> width limits
  const height = source.width / (aspect * source.height);
  return { width: 1, height };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function cropRectFromPanZoom(
  source: SourceSize,
  aspect: number,
  zoom: number,
  panX: number,
  panY: number,
  aspectLabel: string,
): CropRect {
  const base = baseCropForAspect(source, aspect);
  const width = base.width / zoom;
  const height = base.height / zoom;
  const maxX = 1 - width;
  const maxY = 1 - height;
  return {
    x: clamp(panX * maxX, 0, maxX),
    y: clamp(panY * maxY, 0, maxY),
    width,
    height,
    aspect: aspectLabel,
  };
}

export function panZoomFromCropRect(
  source: SourceSize,
  aspect: number,
  rect: CropRect,
): { zoom: number; panX: number; panY: number } {
  const base = baseCropForAspect(source, aspect);
  const zoom = base.width / rect.width;
  const maxX = 1 - rect.width;
  const maxY = 1 - rect.height;
  return {
    zoom,
    panX: maxX <= 0 ? 0.5 : rect.x / maxX,
    panY: maxY <= 0 ? 0.5 : rect.y / maxY,
  };
}

/** Keep the crop inside the image and no smaller than the kind's minimum output pixels. */
export function clampCrop(
  rect: CropRect,
  source: SourceSize,
  minOutput: { width: number; height: number },
): CropRect {
  const minWidthFraction = Math.min(1, minOutput.width / source.width);
  const minHeightFraction = Math.min(1, minOutput.height / source.height);
  const width = clamp(rect.width, minWidthFraction, 1);
  const height = clamp(rect.height, minHeightFraction, 1);
  return {
    ...rect,
    width,
    height,
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
  };
}

/** CSS to render the sub-rect inside an overflow-hidden box of the crop's aspect. */
export function cropToImgStyle(rect: CropRect): {
  width: string;
  height: string;
  left: string;
  top: string;
} {
  return {
    width: `${100 / rect.width}%`,
    height: `${100 / rect.height}%`,
    left: `${(-100 * rect.x) / rect.width}%`,
    top: `${(-100 * rect.y) / rect.height}%`,
  };
}

/**
 * `object-position` value that keeps a saved crop's SUBJECT in frame when the
 * image is `object-fit: cover`-ed into a box of a DIFFERENT aspect than the
 * crop was framed at.
 *
 * `cropToImgStyle` above renders a crop EXACTLY, which only works when the box
 * matches the crop's own aspect — anywhere else it distorts (it pairs with
 * `object-fit: fill`). A persona banner has no single aspect to match: the same
 * crop lands in a ~2:1 strip on a phone and a ~6:1 strip on a wide desktop, and
 * it varies again per skin. So instead of forcing the crop's box, treat the
 * crop as a FOCAL REGION: keep `object-fit: cover` (no distortion, no
 * letterboxing, fills any band) and pan the visible window towards the centre
 * of what the member framed, instead of letting the browser default to the
 * middle of the file.
 *
 * Percentage `object-position` aligns the p% point of the image with the p%
 * point of the box, so passing the focal point's own fraction both centres it
 * where there is overflow to spend AND degrades correctly at the edges (a crop
 * framed at the top of the image stays anchored to the top).
 */
export function cropFocalPosition(rect: CropRect): string {
  const { x, y } = cropFocalXY(rect);
  return `${x}% ${y}%`;
}

/**
 * The same focal point as `cropFocalPosition`, as the two numbers rather than
 * the joined `object-position` string. Callers that need to override one axis
 * on its own (the persona banner's owner reposition control, which moves only
 * the vertical focus) need the halves separately; splitting the string back
 * apart would be the same maths done twice.
 */
export function cropFocalXY(rect: CropRect): { x: number; y: number } {
  // One decimal is well below a single device pixel on any real banner width;
  // rounding keeps the inline style stable across re-renders.
  return {
    x: Math.round(clamp((rect.x + rect.width / 2) * 100, 0, 100) * 10) / 10,
    y: Math.round(clamp((rect.y + rect.height / 2) * 100, 0, 100) * 10) / 10,
  };
}
