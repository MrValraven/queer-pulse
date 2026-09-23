import { useEffect, useRef } from "react";
import { drawStickerOnCanvas } from "../../stickers/render/renderStickerBlob";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import {
  STICKER_CANVAS_SIZE,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";

/**
 * One live sticker drawn from the same geometry that ships. The backing store
 * is always the sticker's true 512px size and the caller sizes the element in
 * CSS, so a 112px tile and the 320px hero show identical art.
 *
 * Drawing waits for the next animation frame: a slider drag changes `params`
 * many times a frame, and the flag grid holds two dozen of these, so
 * coalescing keeps a drag at one paint per canvas per frame.
 *
 * A canvas paints pixels only, hence `role="img"` and the caller's label.
 */
export function StickerCanvas({
  flagId,
  params,
  className,
  label,
}: {
  flagId: string;
  params: UnoReverseParams;
  className?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const primitives = unoReverseGeometry({ ...params, flagId });
      drawStickerOnCanvas(canvas, primitives, STICKER_CANVAS_SIZE);
    });
    return () => cancelAnimationFrame(frameId);
  }, [flagId, params]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={className}
      width={STICKER_CANVAS_SIZE}
      height={STICKER_CANVAS_SIZE}
    />
  );
}
