import type { Primitive } from "../templates/primitives";

function applyPaint(
  context: CanvasRenderingContext2D,
  primitive: { fill?: string; stroke?: string; strokeWidth?: number },
): void {
  if (primitive.fill) {
    context.fillStyle = primitive.fill;
    context.fill();
  }
  if (primitive.stroke) {
    context.strokeStyle = primitive.stroke;
    context.lineWidth = primitive.strokeWidth ?? 1;
    context.lineJoin = "round";
    context.stroke();
  }
}

function traceRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | undefined,
): void {
  context.beginPath();
  if (radius) {
    context.roundRect(x, y, width, height, radius);
  } else {
    context.rect(x, y, width, height);
  }
}

/**
 * Paint primitives onto a 2D context, matching `primitivesToSvg` shape for
 * shape. The two renderers are the only places that know how a primitive
 * looks, so a new primitive means editing exactly these two files.
 *
 * The context is left with the transform and clip stack it arrived with:
 * every group saves and restores.
 */
export function renderPrimitivesToCanvas(
  context: CanvasRenderingContext2D,
  primitives: Primitive[],
): void {
  for (const primitive of primitives) {
    if (primitive.type === "rect") {
      traceRoundedRect(
        context,
        primitive.x,
        primitive.y,
        primitive.width,
        primitive.height,
        primitive.radius,
      );
      applyPaint(context, primitive);
      continue;
    }
    if (primitive.type === "ellipse") {
      context.beginPath();
      context.ellipse(
        primitive.centerX,
        primitive.centerY,
        primitive.radiusX,
        primitive.radiusY,
        ((primitive.rotationDeg ?? 0) * Math.PI) / 180,
        0,
        Math.PI * 2,
      );
      applyPaint(context, primitive);
      continue;
    }
    if (primitive.type === "path") {
      context.beginPath();
      for (const command of primitive.commands) {
        if (command.type === "moveTo") context.moveTo(command.x, command.y);
        else if (command.type === "lineTo")
          context.lineTo(command.x, command.y);
        else context.closePath();
      }
      applyPaint(context, primitive);
      continue;
    }
    context.save();
    if (primitive.translateX || primitive.translateY) {
      context.translate(primitive.translateX ?? 0, primitive.translateY ?? 0);
    }
    if (primitive.rotationDeg) {
      context.rotate((primitive.rotationDeg * Math.PI) / 180);
    }
    if (primitive.scale !== undefined && primitive.scale !== 1) {
      context.scale(primitive.scale, primitive.scale);
    }
    if (primitive.clipRect) {
      traceRoundedRect(
        context,
        primitive.clipRect.x,
        primitive.clipRect.y,
        primitive.clipRect.width,
        primitive.clipRect.height,
        primitive.clipRect.radius,
      );
      context.clip();
    }
    renderPrimitivesToCanvas(context, primitive.children);
    context.restore();
  }
}
