/**
 * Frame-sync marker for in-browser rendering.
 *
 * Tab capture delivers frames on its own clock, so after seeking the film to a
 * moment there is no API that says "this captured frame is that moment". The
 * renderer paints a strip of black and white cells just below the film, one
 * code per step, and keeps reading captured frames until one carries the code
 * it is waiting for. The film and the strip update in the same paint, so a
 * matching code proves the film in that frame is at the right moment.
 *
 * Layout: 16 equal cells across the strip. Cells 0-13 are the step index in
 * binary (cell 0 is the lowest bit, light = 1). Cell 14 is always light and
 * cell 15 always dark: a frame where the guards don't read that way is torn
 * or mid-transition and is skipped.
 */

export const MARKER_CELLS = 16;
const INDEX_BITS = 14;
export const MAX_MARKER_INDEX = 2 ** INDEX_BITS - 1;

/** Height of the strip in film pixels (the film is 1920x1080). */
export const MARKER_HEIGHT = 12;

const LIGHT = 170;
const DARK = 85;

/** The cells to paint for a step: `true` is a light cell. */
export function markerPattern(index: number): boolean[] {
  if (!Number.isInteger(index) || index < 0 || index > MAX_MARKER_INDEX) {
    throw new RangeError(`Marker index out of range: ${index}`);
  }
  const bits = Array.from(
    { length: INDEX_BITS },
    (_, bit) => Math.floor(index / 2 ** bit) % 2 === 1,
  );
  return [...bits, true, false];
}

/**
 * Reads a step index back from each cell's brightness (0-255), or `null` when
 * the cells don't form a clean code (guards wrong, or a cell is mid-grey).
 */
export function readMarker(cellLuma: ArrayLike<number>): number | null {
  if (cellLuma.length !== MARKER_CELLS) return null;
  const lightGuard = cellLuma[INDEX_BITS] ?? 0;
  const darkGuard = cellLuma[INDEX_BITS + 1] ?? 255;
  if (lightGuard < LIGHT || darkGuard > DARK) {
    return null;
  }
  let index = 0;
  for (let bit = 0; bit < INDEX_BITS; bit++) {
    const luma = cellLuma[bit] ?? 0;
    if (luma >= LIGHT) index += 2 ** bit;
    else if (luma > DARK) return null;
  }
  return index;
}

/**
 * Brightness at the centre of each cell, from one RGBA pixel row sampled
 * across the strip's full width.
 */
export function cellLumaFromRow(
  rgba: ArrayLike<number>,
  rowWidth: number,
): number[] {
  return Array.from({ length: MARKER_CELLS }, (_, cell) => {
    const x = Math.floor(((cell + 0.5) / MARKER_CELLS) * rowWidth);
    const offset = x * 4;
    const red = rgba[offset] ?? 0;
    const green = rgba[offset + 1] ?? 0;
    const blue = rgba[offset + 2] ?? 0;
    return 0.299 * red + 0.587 * green + 0.114 * blue;
  });
}
