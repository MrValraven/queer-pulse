/**
 * Geometry for the QueerPulse Q punched into the middle of a QR symbol.
 *
 * Lives apart from `QrCode` because two renderers need it: that SVG component,
 * and the canvas in `ProfileQrModal`, which has to paint the mark into the
 * bitmap so it survives the "save to photos" download. Sharing the numbers is
 * what stops the two marks drifting apart.
 */

/**
 * The mark's width, as a fraction of the symbol's. At 0.2 it occludes about 4%
 * of the symbol's area, comfortably inside error-correction level Q's budget
 * even allowing for Reed-Solomon interleaving, which concentrates a contiguous
 * blot into a few codewords rather than spreading it evenly.
 */
const MARK_WIDTH_RATIO = 0.2;

/**
 * The height of the Q's INK, as a fraction of its plate — a cap height, not a
 * font size, which is why it can be stated this plainly. It leaves about one
 * module of white on every side of a seven-module plate, and scales that
 * margin proportionally on the bigger plate a denser symbol gets.
 *
 * Sizing by ink rather than by em keeps the mark the same weight in both
 * renderers and under whichever face actually loaded: a font size buys
 * different amounts of visible letter in every typeface, since the em box
 * carries the ascender and descender room the letter does not fill.
 */
export const MARK_INK_RATIO = 0.62;

/**
 * Shifts the glyph up and to the LEFT by this fraction of the plate's width.
 *
 * A geometric centre and a centre that LOOKS centred are not the same point
 * for this letter: the Q's tail hangs off the bowl's lower right, so measured
 * centring pushes the bowl — the part the eye reads as the mark — down and
 * right inside the plate, and this pulls it back. Tuned by eye against the
 * rendered symbol rather than derived, which is why it is one number both
 * renderers apply.
 */
export const MARK_OPTICAL_NUDGE_RATIO = 0.05;

/**
 * Fraunces' cap height as a fraction of its em, used ONLY by the SVG
 * renderer, which has no way to measure what it draws. The canvas measures
 * the loaded face instead of trusting this. Georgia, the fallback, is within a
 * few percent, so a miss costs a slightly smaller Q rather than a broken one.
 */
export const SERIF_CAP_HEIGHT_RATIO = 0.73;

/**
 * The mark's width in WHOLE modules, rounded to the nearest odd count.
 *
 * Both halves matter. Whole modules keep the plate's edges on the grid the
 * modules are drawn against: a plate sized as a raw fraction (0.2 of a
 * 33-module symbol is 6.6) cuts its border modules in half and leaves slivers
 * of dark poking out along the edges, which reads as a misprint rather than a
 * mark. An ODD count then centres on the symbol's middle module, since every
 * QR version is an odd number of modules across, so the margin around the
 * glyph comes out equal on all four sides.
 */
export function markModulesFor(moduleCount: number): number {
  const exact = moduleCount * MARK_WIDTH_RATIO;
  return Math.max(1, Math.round((exact - 1) / 2) * 2 + 1);
}
