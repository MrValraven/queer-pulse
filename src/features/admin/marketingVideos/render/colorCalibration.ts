/**
 * Colour calibration for tab capture.
 *
 * Chrome converts a captured tab to YUV with one colour matrix and can label
 * the frames with another (on Linux: converted as BT.601, labelled BT.709).
 * Greys survive that, colours don't: the brand jade comes back as
 * rgb(68, 131, 110) instead of rgb(74, 140, 111). Which matrix is right
 * depends on the platform, so the renderer measures it: before recording, it
 * shows a few known colour patches over the film, captures one frame, and
 * keeps whichever matrix label reproduces them best.
 */
import type { FilmSize } from "../marketingVideos.data";

export type Rgb = readonly [number, number, number];

/** Where the patches sit across the film's width, left to right. */
const PATCH_FRACTIONS = [7 / 24, 1 / 2, 17 / 24] as const;
const LARGEST_PATCH = 240;

/**
 * Patch centres in film pixels, on the film's middle row. For the 1920x1080
 * film they land on x 560, 960 and 1360.
 */
export function calibrationPatches(size: FilmSize) {
  return PATCH_FRACTIONS.map((fraction) => ({
    x: Math.round(size.width * fraction),
    y: Math.round(size.height / 2),
  }));
}

/** Patch side in film pixels: 240 on a wide film, smaller on a narrow one. */
export function calibrationPatchSize(size: FilmSize) {
  return Math.min(LARGEST_PATCH, Math.round(size.width / 6));
}

/** Matrix labels to try, besides the one the frame arrived with. */
const CANDIDATE_MATRICES: VideoMatrixCoefficients[] = [
  "bt709",
  "smpte170m",
  "bt470bg",
];

/** "rgb(232, 119, 90)" (getComputedStyle's form) to [232, 119, 90]. */
export function parseCssRgb(value: string): Rgb | null {
  const match = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(value.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Total channel difference across all patches. */
export function colourError(
  measured: readonly Rgb[],
  expected: readonly Rgb[],
) {
  return measured.reduce(
    (total, colour, patch) =>
      total +
      colour.reduce(
        (sum, channel, index) =>
          sum + Math.abs(channel - (expected[patch]?.[index] ?? channel)),
        0,
      ),
    0,
  );
}

/** The same pixels, labelled with a different YUV matrix. */
export async function withMatrix(
  frame: VideoFrame,
  matrix: VideoMatrixCoefficients,
): Promise<VideoFrame> {
  if (!frame.format) {
    throw new Error("Captured frame has no readable pixel format.");
  }
  const buffer = new Uint8Array(frame.allocationSize());
  const layout = await frame.copyTo(buffer);
  const rect = frame.visibleRect;
  return new VideoFrame(buffer, {
    format: frame.format,
    codedWidth: frame.codedWidth,
    codedHeight: frame.codedHeight,
    visibleRect: rect
      ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      : undefined,
    displayWidth: frame.displayWidth,
    displayHeight: frame.displayHeight,
    timestamp: frame.timestamp,
    layout,
    colorSpace: { ...frame.colorSpace.toJSON(), matrix },
  });
}

/**
 * The matrix label that reproduces `expected` best for this capture, or
 * `null` when the frame's own label is already the best (or its pixels can't
 * be read, in which case there's nothing to correct).
 */
export async function pickCaptureMatrix(
  frame: VideoFrame,
  expected: readonly Rgb[],
  sample: (frame: VideoFrame) => Rgb[],
): Promise<VideoMatrixCoefficients | null> {
  if (
    !frame.format ||
    frame.format.startsWith("RGB") ||
    frame.format.startsWith("BGR")
  ) {
    return null;
  }
  const labelled = frame.colorSpace.matrix;
  let best: { matrix: VideoMatrixCoefficients | null; error: number } = {
    matrix: null,
    error: colourError(sample(frame), expected),
  };
  for (const matrix of CANDIDATE_MATRICES) {
    if (matrix === labelled) continue;
    const relabelled = await withMatrix(frame, matrix);
    try {
      const error = colourError(sample(relabelled), expected);
      if (error < best.error) best = { matrix, error };
    } finally {
      relabelled.close();
    }
  }
  return best.matrix;
}
