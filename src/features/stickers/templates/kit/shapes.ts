import type {
  EllipsePrimitive,
  GroupPrimitive,
  PathPrimitive,
  Primitive,
  RectPrimitive,
} from "../primitives";
import { toPathCommands, type Point } from "./curves";

/**
 * Shape constructors that keep the art files short: every sticker template
 * builds its geometry as arrays of `Point`s and hands them to these to get
 * primitive object literals.
 */

export interface PaintStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function pathOf(
  points: readonly Point[],
  style: PaintStyle & { isClosed?: boolean; lineCap?: "round" | "butt" },
): PathPrimitive {
  return {
    type: "path",
    commands: toPathCommands(points, style.isClosed ?? true),
    ...(style.fill !== undefined ? { fill: style.fill } : {}),
    ...(style.stroke !== undefined ? { stroke: style.stroke } : {}),
    ...(style.strokeWidth !== undefined
      ? { strokeWidth: style.strokeWidth }
      : {}),
    ...(style.lineCap !== undefined ? { lineCap: style.lineCap } : {}),
  };
}

/** An open stroked line with round caps (motion lines, antenna, steam). */
export function lineOf(
  points: readonly Point[],
  stroke: string,
  strokeWidth: number,
): PathPrimitive {
  return pathOf(points, {
    stroke,
    strokeWidth,
    isClosed: false,
    lineCap: "round",
  });
}

export function ellipseOf(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  style: PaintStyle & { rotationDeg?: number },
): EllipsePrimitive {
  return {
    type: "ellipse",
    centerX,
    centerY,
    radiusX,
    radiusY,
    ...(style.rotationDeg !== undefined
      ? { rotationDeg: style.rotationDeg }
      : {}),
    ...(style.fill !== undefined ? { fill: style.fill } : {}),
    ...(style.stroke !== undefined ? { stroke: style.stroke } : {}),
    ...(style.strokeWidth !== undefined
      ? { strokeWidth: style.strokeWidth }
      : {}),
  };
}

export function rectOf(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: PaintStyle,
): RectPrimitive {
  return {
    type: "rect",
    x,
    y,
    width,
    height,
    ...(radius ? { radius } : {}),
    ...(style.fill !== undefined ? { fill: style.fill } : {}),
    ...(style.stroke !== undefined ? { stroke: style.stroke } : {}),
    ...(style.strokeWidth !== undefined
      ? { strokeWidth: style.strokeWidth }
      : {}),
  };
}

/** Rotate children about a point: translate to the origin, rotate, translate
 *  back. */
export function rotateAbout(
  children: Primitive[],
  degrees: number,
  originX: number,
  originY: number,
): GroupPrimitive {
  return {
    type: "group",
    translateX: originX,
    translateY: originY,
    rotationDeg: degrees,
    children: [
      { type: "group", translateX: -originX, translateY: -originY, children },
    ],
  };
}
