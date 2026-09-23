import { STRIPED_FLAG_IDS } from "../../../shared/data/flagStripes.data";

/** Every sticker is rendered into this square, transparent outside the card.
 *  512 is the size WhatsApp uses and the size uploaded to the bucket. */
export const STICKER_CANVAS_SIZE = 512;

/** The card itself: a 2:3 portrait centred in the square, leaving transparent
 *  margins so the sticker reads as a card rather than a full-bleed tile. */
export const UNO_CARD_WIDTH = 320;
export const UNO_CARD_HEIGHT = 480;
export const UNO_CARD_X = (STICKER_CANVAS_SIZE - UNO_CARD_WIDTH) / 2;
export const UNO_CARD_Y = (STICKER_CANVAS_SIZE - UNO_CARD_HEIGHT) / 2;
export const UNO_CARD_RADIUS = 28;

/** The dark keyline drawn around the arrow glyphs so a white arrow stays
 *  legible over a white flag stripe. */
export const UNO_ARROW_OUTLINE = "#1b1b1b";

export interface UnoReverseParams {
  /** A key into `FLAG_STRIPES`. */
  flagId: string;
  /** The card's border, the oval, and the arrows all take this colour. */
  frameColor: string;
  /** Thickness of the border between the card edge and the flag. */
  frameWidth: number;
  /** The oval's tilt, degrees clockwise. */
  ringAngleDeg: number;
  ringStrokeWidth: number;
  hasCornerArrows: boolean;
  /** The corner glyph's size relative to the centre glyph. */
  cornerArrowScale: number;
}

export const UNO_REVERSE_DEFAULTS: UnoReverseParams = {
  flagId: "bisexual",
  frameColor: "#f6f2e8",
  frameWidth: 18,
  ringAngleDeg: 22,
  ringStrokeWidth: 12,
  hasCornerArrows: true,
  cornerArrowScale: 0.4,
};

/** The flags this template can paint. Every striped flag qualifies; the
 *  Progress chevron and the Intersex ring are drawn shapes rather than bands,
 *  so they are out until the template grows a chevron primitive. */
export const UNO_REVERSE_FLAG_IDS: readonly string[] = STRIPED_FLAG_IDS;
