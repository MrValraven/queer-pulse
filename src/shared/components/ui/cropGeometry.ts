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
