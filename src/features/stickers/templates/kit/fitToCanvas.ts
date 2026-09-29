import type { EllipsePrimitive, PathCommand, Primitive } from "../primitives";
import { STICKER_FIT_MARGIN, STICKER_SIZE } from "./palette";

/**
 * Measures a primitive tree's canvas-space bounds and computes the transform
 * that centres and scales it into the sticker square. Every template ends
 * its build with `applyFit(primitives, fitTransform(primitivesBounds(...)))`
 * so art authored at any size and offset lands the same way.
 */

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface FitTransform {
  translateX: number;
  translateY: number;
  scale: number;
}

/** The maximum scale `fitTransform` ever applies, so art far smaller than the
 *  margin box does not balloon past its natural size. */
const MAX_FIT_SCALE = 1.05;

/** How many points sample an ellipse's perimeter when measuring its bounds. */
const ELLIPSE_SAMPLE_COUNT = 32;

/** A 2x3 affine matrix in the same terms as the CSS/SVG `matrix()` function:
 *  x' = scaleX*x + skewX*y + translateX, y' = skewY*x + scaleY*y + translateY. */
interface AffineMatrix {
  scaleX: number;
  skewY: number;
  skewX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

const IDENTITY_MATRIX: AffineMatrix = {
  scaleX: 1,
  skewY: 0,
  skewX: 0,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
};

/** Composes `outer` after `inner`: transforming a point by the result gives
 *  the same answer as transforming it by `inner`, then by `outer`. */
function composeAffine(outer: AffineMatrix, inner: AffineMatrix): AffineMatrix {
  return {
    scaleX: outer.scaleX * inner.scaleX + outer.skewX * inner.skewY,
    skewY: outer.skewY * inner.scaleX + outer.scaleY * inner.skewY,
    skewX: outer.scaleX * inner.skewX + outer.skewX * inner.scaleY,
    scaleY: outer.skewY * inner.skewX + outer.scaleY * inner.scaleY,
    translateX:
      outer.scaleX * inner.translateX +
      outer.skewX * inner.translateY +
      outer.translateX,
    translateY:
      outer.skewY * inner.translateX +
      outer.scaleY * inner.translateY +
      outer.translateY,
  };
}

function translationMatrix(
  translateX: number,
  translateY: number,
): AffineMatrix {
  return { scaleX: 1, skewY: 0, skewX: 0, scaleY: 1, translateX, translateY };
}

function rotationMatrix(degrees: number): AffineMatrix {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    scaleX: cosine,
    skewY: sine,
    skewX: -sine,
    scaleY: cosine,
    translateX: 0,
    translateY: 0,
  };
}

function uniformScaleMatrix(scale: number): AffineMatrix {
  return {
    scaleX: scale,
    skewY: 0,
    skewX: 0,
    scaleY: scale,
    translateX: 0,
    translateY: 0,
  };
}

/** A group composes translate, then rotate, then scale, matching the order
 *  the renderers apply a `GroupPrimitive`'s own transform in. */
function groupLocalMatrix(group: {
  translateX?: number;
  translateY?: number;
  rotationDeg?: number;
  scale?: number;
}): AffineMatrix {
  return composeAffine(
    composeAffine(
      translationMatrix(group.translateX ?? 0, group.translateY ?? 0),
      rotationMatrix(group.rotationDeg ?? 0),
    ),
    uniformScaleMatrix(group.scale ?? 1),
  );
}

function determinantOf(matrix: AffineMatrix): number {
  return matrix.scaleX * matrix.scaleY - matrix.skewY * matrix.skewX;
}

function transformPoint(
  matrix: AffineMatrix,
  x: number,
  y: number,
): { x: number; y: number } {
  return {
    x: matrix.scaleX * x + matrix.skewX * y + matrix.translateX,
    y: matrix.skewY * x + matrix.scaleY * y + matrix.translateY,
  };
}

function extendBounds(bounds: Bounds | null, x: number, y: number): Bounds {
  if (!bounds) return { minX: x, maxX: x, minY: y, maxY: y };
  return {
    minX: Math.min(bounds.minX, x),
    maxX: Math.max(bounds.maxX, x),
    minY: Math.min(bounds.minY, y),
    maxY: Math.max(bounds.maxY, y),
  };
}

function mergeBounds(
  first: Bounds | null,
  second: Bounds | null,
): Bounds | null {
  if (!first) return second;
  if (!second) return first;
  return {
    minX: Math.min(first.minX, second.minX),
    maxX: Math.max(first.maxX, second.maxX),
    minY: Math.min(first.minY, second.minY),
    maxY: Math.max(first.maxY, second.maxY),
  };
}

/** The overlap of two bounds, or null when they do not overlap on either
 *  axis (an inverted min/max is never returned). */
function intersectBounds(first: Bounds, second: Bounds): Bounds | null {
  const minX = Math.max(first.minX, second.minX);
  const maxX = Math.min(first.maxX, second.maxX);
  const minY = Math.max(first.minY, second.minY);
  const maxY = Math.min(first.maxY, second.maxY);
  if (minX > maxX || minY > maxY) return null;
  return { minX, maxX, minY, maxY };
}

function padBounds(bounds: Bounds, padding: number): Bounds {
  if (padding === 0) return bounds;
  return {
    minX: bounds.minX - padding,
    maxX: bounds.maxX + padding,
    minY: bounds.minY - padding,
    maxY: bounds.maxY + padding,
  };
}

/** Stroke half-widths pad the bounds in canvas space, scaled by
 *  `sqrt(|determinant|)` so a stroke keeps its apparent thickness under the
 *  accumulated group scale. */
function strokePadding(
  strokeWidth: number | undefined,
  matrix: AffineMatrix,
): number {
  if (!strokeWidth) return 0;
  return (strokeWidth / 2) * Math.sqrt(Math.abs(determinantOf(matrix)));
}

function boundsOfLocalPoints(
  matrix: AffineMatrix,
  points: readonly (readonly [number, number])[],
): Bounds | null {
  let bounds: Bounds | null = null;
  for (const [x, y] of points) {
    const point = transformPoint(matrix, x, y);
    bounds = extendBounds(bounds, point.x, point.y);
  }
  return bounds;
}

/** 32 points around the ellipse's own perimeter, in its local coordinate
 *  space, with the ellipse's own rotation already applied. */
function ellipseLocalPoints(
  ellipse: EllipsePrimitive,
): (readonly [number, number])[] {
  const radians = ((ellipse.rotationDeg ?? 0) * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const points: (readonly [number, number])[] = [];
  for (
    let sampleIndex = 0;
    sampleIndex < ELLIPSE_SAMPLE_COUNT;
    sampleIndex += 1
  ) {
    const angle = (sampleIndex / ELLIPSE_SAMPLE_COUNT) * Math.PI * 2;
    const localX = Math.cos(angle) * ellipse.radiusX;
    const localY = Math.sin(angle) * ellipse.radiusY;
    points.push([
      ellipse.centerX + localX * cosine - localY * sine,
      ellipse.centerY + localX * sine + localY * cosine,
    ]);
  }
  return points;
}

function rectCorners(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}): (readonly [number, number])[] {
  return [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ];
}

/** The non-`close` command points of a path, in order. */
function pathCommandPoints(
  commands: readonly PathCommand[],
): (readonly [number, number])[] {
  const points: (readonly [number, number])[] = [];
  for (const command of commands) {
    if (command.type === "close") continue;
    points.push([command.x, command.y]);
  }
  return points;
}

function accumulateBounds(
  primitives: readonly Primitive[],
  matrix: AffineMatrix,
): Bounds | null {
  let bounds: Bounds | null = null;
  for (const primitive of primitives) {
    if (primitive.type === "rect") {
      const shapeBounds = boundsOfLocalPoints(matrix, rectCorners(primitive));
      if (shapeBounds) {
        const padding = strokePadding(primitive.strokeWidth, matrix);
        bounds = mergeBounds(bounds, padBounds(shapeBounds, padding));
      }
    } else if (primitive.type === "ellipse") {
      const shapeBounds = boundsOfLocalPoints(
        matrix,
        ellipseLocalPoints(primitive),
      );
      if (shapeBounds) {
        const padding = strokePadding(primitive.strokeWidth, matrix);
        bounds = mergeBounds(bounds, padBounds(shapeBounds, padding));
      }
    } else if (primitive.type === "path") {
      const shapeBounds = boundsOfLocalPoints(
        matrix,
        pathCommandPoints(primitive.commands),
      );
      if (shapeBounds) {
        const padding = strokePadding(primitive.strokeWidth, matrix);
        bounds = mergeBounds(bounds, padBounds(shapeBounds, padding));
      }
    } else {
      const childMatrix = composeAffine(matrix, groupLocalMatrix(primitive));
      let childBounds = accumulateBounds(primitive.children, childMatrix);
      if (childBounds && primitive.clipRect) {
        const clipBounds = boundsOfLocalPoints(
          childMatrix,
          rectCorners(primitive.clipRect),
        );
        childBounds = clipBounds
          ? intersectBounds(childBounds, clipBounds)
          : null;
      } else if (childBounds && primitive.clipPath) {
        const clipBounds = boundsOfLocalPoints(
          childMatrix,
          pathCommandPoints(primitive.clipPath),
        );
        childBounds = clipBounds
          ? intersectBounds(childBounds, clipBounds)
          : null;
      }
      bounds = mergeBounds(bounds, childBounds);
    }
  }
  return bounds;
}

/** Canvas-space bounds of a primitive tree: stroke half-widths included,
 *  group translate/rotate/scale applied, a group's clip (`clipRect` or
 *  `clipPath`) intersected with its children. Null for an empty tree, and
 *  null when a clip does not overlap its children at all. */
export function primitivesBounds(
  primitives: readonly Primitive[],
): Bounds | null {
  return accumulateBounds(primitives, IDENTITY_MATRIX);
}

export function fitTransform(
  bounds: Bounds,
  options?: { size?: number; margin?: number; maxScale?: number },
): FitTransform {
  const size = options?.size ?? STICKER_SIZE;
  const margin = options?.margin ?? STICKER_FIT_MARGIN;
  const maxScale = options?.maxScale ?? MAX_FIT_SCALE;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const availableSpan = size - 2 * margin;
  const scale = Math.min(
    maxScale,
    availableSpan / width,
    availableSpan / height,
  );
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return {
    translateX: size / 2 - centerX * scale,
    translateY: size / 2 - centerY * scale,
    scale,
  };
}

/** Wrap in one group that centres the art and scales it into
 *  size - 2 * margin. */
export function applyFit(
  primitives: Primitive[],
  transform: FitTransform,
): Primitive[] {
  return [
    {
      type: "group",
      translateX: transform.translateX,
      translateY: transform.translateY,
      scale: transform.scale,
      children: primitives,
    },
  ];
}
