/**
 * The luminance net's measurements (design 5, WCAG 2.3.1). The probe hands
 * over the canvas output as a 16x16 grid of RGBA bytes (1024 bytes); this
 * module reduces it to sliding windows of 5x4 cells, each about the size of
 * WCAG's flash area, and measures each window's mean relative luminance, its
 * mean red value and whether its mean colour is a saturated red.
 *
 * Window index = row * VJ_WINDOW_STEPS_ACROSS + column, with 12 column steps
 * and 13 row steps (156 windows). A window is the mean over its 20 cells, so
 * a region smaller than a window still counts once its swing, averaged over
 * the window, reaches the WCAG threshold: a full black and white swing needs
 * 2 of the 20 cells. That errs on the side of counting.
 *
 * Runs once per probe reading inside the frame loop: the scratch buffers are
 * allocated once at module load and nothing is allocated per call.
 */

export const VJ_PROBE_GRID = 16;
export const VJ_WINDOW_COLUMNS = 5;
export const VJ_WINDOW_ROWS = 4;
/** Horizontal positions of a 5-cell-wide window on the 16-cell grid. */
export const VJ_WINDOW_STEPS_ACROSS = VJ_PROBE_GRID - VJ_WINDOW_COLUMNS + 1;
/** Vertical positions of a 4-cell-tall window on the 16-cell grid. */
export const VJ_WINDOW_STEPS_DOWN = VJ_PROBE_GRID - VJ_WINDOW_ROWS + 1;
/** 12 x 13 windows. */
export const VJ_WINDOW_COUNT = VJ_WINDOW_STEPS_ACROSS * VJ_WINDOW_STEPS_DOWN;
/** Bytes in one probe reading: 16 x 16 RGBA. */
export const VJ_PROBE_BYTE_LENGTH = VJ_PROBE_GRID * VJ_PROBE_GRID * 4;
/** WCAG: a red is saturated when R / (R + G + B) is at least this. */
export const VJ_SATURATED_RED_RATIO = 0.8;
/** WCAG red flash scale: (R - G - B) * 320. */
export const VJ_RED_VALUE_SCALE = 320;

const CELL_COUNT = VJ_PROBE_GRID * VJ_PROBE_GRID;
const CELLS_PER_WINDOW = VJ_WINDOW_COLUMNS * VJ_WINDOW_ROWS;

/** sRGB byte to linear 0..1, the sRGB transfer with the 0.04045 knee. */
function linearChannelOf(byteValue: number): number {
  const channel = byteValue / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

const LINEAR_CHANNEL_TABLE = new Float64Array(256);
for (let byteValue = 0; byteValue < 256; byteValue += 1) {
  LINEAR_CHANNEL_TABLE[byteValue] = linearChannelOf(byteValue);
}

/** Linear 0..1 of a whole byte 0..255. */
function linearOfByte(byteValue: number): number {
  return LINEAR_CHANNEL_TABLE[byteValue] ?? 0;
}

/** A byte from any number: rounded and clamped into 0..255; not finite reads as 0. */
function byteOf(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(255, Math.max(0, Math.round(value)));
}

/** WCAG relative luminance of an sRGB colour given as 0..255 bytes, 0..1. */
export function vjRelativeLuminance(
  red: number,
  green: number,
  blue: number,
): number {
  return (
    0.2126 * linearOfByte(byteOf(red)) +
    0.7152 * linearOfByte(byteOf(green)) +
    0.0722 * linearOfByte(byteOf(blue))
  );
}

/**
 * WCAG red measure of an sRGB colour given as 0..255 bytes, on the linear
 * 0..1 channels of the relative luminance definition: saturated when
 * R / (R + G + B) >= 0.8, and redValue = max(0, (R - G - B) * 320).
 */
export function vjRedMeasure(
  red: number,
  green: number,
  blue: number,
): { isSaturatedRed: boolean; redValue: number } {
  const linearRed = linearOfByte(byteOf(red));
  const linearGreen = linearOfByte(byteOf(green));
  const linearBlue = linearOfByte(byteOf(blue));
  const channelSum = linearRed + linearGreen + linearBlue;
  return {
    isSaturatedRed:
      channelSum > 0 && linearRed / channelSum >= VJ_SATURATED_RED_RATIO,
    redValue: Math.max(
      0,
      (linearRed - linearGreen - linearBlue) * VJ_RED_VALUE_SCALE,
    ),
  };
}

const cellLuminance = new Float64Array(CELL_COUNT);
const cellRedValue = new Float64Array(CELL_COUNT);
const cellLinearRed = new Float64Array(CELL_COUNT);
const cellLinearOther = new Float64Array(CELL_COUNT);

function measureCells(pixels: Uint8Array): void {
  for (let cellIndex = 0; cellIndex < CELL_COUNT; cellIndex += 1) {
    const byteIndex = cellIndex * 4;
    const linearRed = linearOfByte(pixels[byteIndex] ?? 0);
    const linearGreen = linearOfByte(pixels[byteIndex + 1] ?? 0);
    const linearBlue = linearOfByte(pixels[byteIndex + 2] ?? 0);
    cellLuminance[cellIndex] =
      0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
    const redExcess = linearRed - linearGreen - linearBlue;
    cellRedValue[cellIndex] =
      redExcess > 0 ? redExcess * VJ_RED_VALUE_SCALE : 0;
    cellLinearRed[cellIndex] = linearRed;
    cellLinearOther[cellIndex] = linearGreen + linearBlue;
  }
}

/**
 * Fills the three outputs (each VJ_WINDOW_COUNT long) from one probe reading
 * of VJ_PROBE_BYTE_LENGTH bytes: the mean relative luminance (0..1), the mean
 * red value (0..320) and 1 when the window's mean colour is a saturated red,
 * else 0. Alpha is ignored.
 */
export function measureVjWindows(
  pixels: Uint8Array,
  luminanceOut: Float32Array,
  redOut: Float32Array,
  saturatedRedOut: Uint8Array,
): void {
  measureCells(pixels);
  for (let row = 0; row < VJ_WINDOW_STEPS_DOWN; row += 1) {
    for (let column = 0; column < VJ_WINDOW_STEPS_ACROSS; column += 1) {
      let luminanceSum = 0;
      let redValueSum = 0;
      let linearRedSum = 0;
      let linearOtherSum = 0;
      for (let cellRow = row; cellRow < row + VJ_WINDOW_ROWS; cellRow += 1) {
        const rowStart = cellRow * VJ_PROBE_GRID;
        for (
          let cellColumn = column;
          cellColumn < column + VJ_WINDOW_COLUMNS;
          cellColumn += 1
        ) {
          const cellIndex = rowStart + cellColumn;
          luminanceSum += cellLuminance[cellIndex] ?? 0;
          redValueSum += cellRedValue[cellIndex] ?? 0;
          linearRedSum += cellLinearRed[cellIndex] ?? 0;
          linearOtherSum += cellLinearOther[cellIndex] ?? 0;
        }
      }
      const windowIndex = row * VJ_WINDOW_STEPS_ACROSS + column;
      const channelSum = linearRedSum + linearOtherSum;
      luminanceOut[windowIndex] = luminanceSum / CELLS_PER_WINDOW;
      redOut[windowIndex] = redValueSum / CELLS_PER_WINDOW;
      saturatedRedOut[windowIndex] =
        channelSum > 0 && linearRedSum / channelSum >= VJ_SATURATED_RED_RATIO
          ? 1
          : 0;
    }
  }
}
