import { STICKER_CANVAS_SIZE } from "../templates/unoReverse.params";
import type { Primitive } from "../templates/primitives";
import { renderPrimitivesToCanvas } from "./renderPrimitivesToCanvas";

/** PNG, because a sticker needs the alpha channel around the card. */
export const STICKER_MIME_TYPE = "image/png";

/**
 * Draw into an existing canvas, used by the builder's live previews. The
 * canvas is sized in CSS pixels by its own styles; the backing store is set
 * here to the sticker's true size and the context scaled to match, so a
 * preview at 120 CSS pixels is still drawn from the same geometry as the
 * 512px export.
 */
export function drawStickerOnCanvas(
  canvas: HTMLCanvasElement,
  primitives: Primitive[],
  size: number = STICKER_CANVAS_SIZE,
): void {
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  context.clearRect(0, 0, size, size);
  const scale = size / STICKER_CANVAS_SIZE;
  if (scale !== 1) context.scale(scale, scale);
  renderPrimitivesToCanvas(context, primitives);
}

/** Render at full size and hand back the PNG bytes the builder uploads. */
export async function renderStickerBlob(
  primitives: Primitive[],
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  drawStickerOnCanvas(canvas, primitives, STICKER_CANVAS_SIZE);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The sticker could not be encoded"));
    }, STICKER_MIME_TYPE);
  });
}
