import { BLIP_COLORS } from "../../../stickers/templates/blip/blip.params";
import { contrastRatio } from "../stickerContrast";

/** The WCAG floor for UI parts. Blip's eyes, brows and mouth are thin ink
 *  strokes read at sticker size, so they need at least this against the
 *  body colour. */
export const MIN_BLIP_FACE_CONTRAST = 3;

/**
 * Whether Blip's ink face (`#1b1b1b`) fades into a solid body of this colour,
 * so the builder can warn before a near-black body ships with no face.
 */
export function isBlipFaceHardToRead(bodyColor: string): boolean {
  return contrastRatio(bodyColor, BLIP_COLORS.ink) < MIN_BLIP_FACE_CONTRAST;
}
