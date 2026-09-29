import type { GroupPrimitive, Primitive } from "../primitives";
import { applyFit, fitTransform, primitivesBounds } from "./fitToCanvas";
import { DIE_CUT_WIDTH, STICKER_WHITE } from "./palette";
import { rotateAbout } from "./shapes";

/**
 * The shared drawing surface every sticker template builds on: a template
 * calls `silhouette`/`paint` in back-to-front order as it draws, then calls
 * `build` once to get the finished, fitted primitive tree. This is what
 * keeps the underlay/paint split and the die-cut-safe fit out of every
 * individual template.
 */

export interface StickerSketch {
  /** Paint `primitive` AND add its white die-cut copy to the underlay. */
  silhouette(primitive: Primitive, options?: { cutWidth?: number }): void;
  /** Paint only (marks inside a silhouette already cut). */
  paint(primitive: Primitive): void;
  /** Add `primitive` to the underlay, unchanged, with no paired paint call.
   *  `silhouette`'s `cutWidth` covers a bigger stroke on the same shape; for
   *  a die-cut halo whose shape genuinely differs from what gets painted
   *  over it, build the exact white shape the art calls for and hand it
   *  here, then `paint` the coloured shape on top. Included in `build`'s
   *  die-cut toggle and its fit, same as a `silhouette` underlay. */
  underlay(primitive: Primitive): void;
  /** Underlay, then paint, rotated when asked, fitted into the canvas. The
   *  fit is computed WITH the underlay even when hasDieCut is false, so
   *  toggling the die-cut never changes the sticker's size. */
  build(options: {
    hasDieCut: boolean;
    rotation?: { degrees: number; originX: number; originY: number };
  }): Primitive[];
}

function rotatedContent(
  primitives: Primitive[],
  rotation?: { degrees: number; originX: number; originY: number },
): Primitive[] {
  if (!rotation) return primitives;
  return [
    rotateAbout(
      primitives,
      rotation.degrees,
      rotation.originX,
      rotation.originY,
    ),
  ];
}

export function createSketch(): StickerSketch {
  const underlayPrimitives: Primitive[] = [];
  const paintPrimitives: Primitive[] = [];

  return {
    silhouette(primitive, options) {
      const cutWidth = options?.cutWidth ?? DIE_CUT_WIDTH;
      underlayPrimitives.push(whiteUnderlayOf(primitive, cutWidth));
      paintPrimitives.push(primitive);
    },
    paint(primitive) {
      paintPrimitives.push(primitive);
    },
    underlay(primitive) {
      underlayPrimitives.push(primitive);
    },
    build(options) {
      // The fit is always measured against underlay-then-paint, whether or
      // not the die-cut underlay actually renders, so toggling `hasDieCut`
      // can never change the outer group's scale or translate.
      const fitBasisContent = rotatedContent(
        [...underlayPrimitives, ...paintPrimitives],
        options.rotation,
      );
      const bounds = primitivesBounds(fitBasisContent);
      const transform = bounds
        ? fitTransform(bounds)
        : { translateX: 0, translateY: 0, scale: 1 };

      const renderedPrimitives = options.hasDieCut
        ? [...underlayPrimitives, ...paintPrimitives]
        : [...paintPrimitives];
      const rotatedRenderedPrimitives = rotatedContent(
        renderedPrimitives,
        options.rotation,
      );
      return applyFit(rotatedRenderedPrimitives, transform);
    },
  };
}

/** The transform-only fields of a group (never its children or its clip),
 *  spread-if-defined so a copy stays minimal. */
function groupTransformsOf(group: GroupPrimitive): {
  translateX?: number;
  translateY?: number;
  rotationDeg?: number;
  scale?: number;
} {
  return {
    ...(group.translateX !== undefined ? { translateX: group.translateX } : {}),
    ...(group.translateY !== undefined ? { translateY: group.translateY } : {}),
    ...(group.rotationDeg !== undefined
      ? { rotationDeg: group.rotationDeg }
      : {}),
    ...(group.scale !== undefined ? { scale: group.scale } : {}),
  };
}

/** A rect/ellipse/path recoloured to `colour`: fill becomes `colour` when the
 *  source has a fill (an open path, one with no `close` command, stays
 *  unfilled even then), stroke `colour` at own stroke width + `extraWidth`,
 *  round caps on a path. A group is handed to `onGroup`, which is where
 *  `whiteUnderlayOf` and `haloOf` differ (the underlay turns a clipped group
 *  into a solid clip shape; the halo copies a group's clip through as-is). */
function recolouredCopy(
  primitive: Primitive,
  colour: string,
  extraWidth: number,
  options: { onGroup: (group: GroupPrimitive) => Primitive },
): Primitive {
  if (primitive.type === "rect") {
    return {
      type: "rect",
      x: primitive.x,
      y: primitive.y,
      width: primitive.width,
      height: primitive.height,
      ...(primitive.radius !== undefined ? { radius: primitive.radius } : {}),
      ...(primitive.fill !== undefined ? { fill: colour } : {}),
      stroke: colour,
      strokeWidth: (primitive.strokeWidth ?? 0) + extraWidth,
    };
  }
  if (primitive.type === "ellipse") {
    return {
      type: "ellipse",
      centerX: primitive.centerX,
      centerY: primitive.centerY,
      radiusX: primitive.radiusX,
      radiusY: primitive.radiusY,
      ...(primitive.rotationDeg !== undefined
        ? { rotationDeg: primitive.rotationDeg }
        : {}),
      ...(primitive.fill !== undefined ? { fill: colour } : {}),
      stroke: colour,
      strokeWidth: (primitive.strokeWidth ?? 0) + extraWidth,
    };
  }
  if (primitive.type === "path") {
    const isClosedPath = primitive.commands.some(
      (command) => command.type === "close",
    );
    return {
      type: "path",
      commands: primitive.commands,
      ...(primitive.fill !== undefined && isClosedPath ? { fill: colour } : {}),
      stroke: colour,
      strokeWidth: (primitive.strokeWidth ?? 0) + extraWidth,
      lineCap: "round",
    };
  }
  return options.onGroup(primitive);
}

/** White copy used for the die-cut: fills become #ffffff (an open path stays
 *  unfilled), stroke #ffffff at (own stroke width, 0 when unstroked) +
 *  cutWidth, round caps on paths. A group with a clip (`clipRect` or
 *  `clipPath`) becomes its clip shape filled white, with a white stroke of
 *  cutWidth, keeping the group's transforms; other groups map their
 *  children. */
export function whiteUnderlayOf(
  primitive: Primitive,
  cutWidth: number,
): Primitive {
  return recolouredCopy(primitive, STICKER_WHITE, cutWidth, {
    onGroup: (group) => {
      if (group.clipRect) {
        const clipRect = group.clipRect;
        return {
          type: "group",
          ...groupTransformsOf(group),
          children: [
            {
              type: "rect",
              x: clipRect.x,
              y: clipRect.y,
              width: clipRect.width,
              height: clipRect.height,
              ...(clipRect.radius !== undefined
                ? { radius: clipRect.radius }
                : {}),
              fill: STICKER_WHITE,
              stroke: STICKER_WHITE,
              strokeWidth: cutWidth,
            },
          ],
        };
      }
      if (group.clipPath) {
        return {
          type: "group",
          ...groupTransformsOf(group),
          children: [
            {
              type: "path",
              commands: group.clipPath,
              fill: STICKER_WHITE,
              stroke: STICKER_WHITE,
              strokeWidth: cutWidth,
            },
          ],
        };
      }
      return {
        type: "group",
        ...groupTransformsOf(group),
        children: group.children.map((child) =>
          whiteUnderlayOf(child, cutWidth),
        ),
      };
    },
  });
}

function haloOf(
  primitive: Primitive,
  haloColor: string,
  extraWidth: number,
): Primitive {
  return recolouredCopy(primitive, haloColor, extraWidth, {
    onGroup: (group) => ({
      type: "group",
      ...groupTransformsOf(group),
      ...(group.clipRect !== undefined ? { clipRect: group.clipRect } : {}),
      ...(group.clipPath !== undefined ? { clipPath: group.clipPath } : {}),
      children: group.children.map((child) =>
        haloOf(child, haloColor, extraWidth),
      ),
    }),
  });
}

/** Halo copies for readability on busy backgrounds (Blip's face on flag
 *  stripes): every shape repeated first with `haloColor` fill (when filled)
 *  and stroke at own width + extraWidth, round caps and joins; then the
 *  originals. */
export function withHalo(
  primitives: readonly Primitive[],
  haloColor: string,
  extraWidth: number,
): Primitive[] {
  return [
    ...primitives.map((primitive) => haloOf(primitive, haloColor, extraWidth)),
    ...primitives,
  ];
}
