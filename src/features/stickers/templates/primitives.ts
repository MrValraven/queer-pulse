/**
 * The drawing vocabulary a sticker template emits, kept deliberately small so
 * the two renderers stay short and provably equivalent: one paints these onto
 * a canvas for the PNG that ships, the other serialises them to the SVG
 * source stored beside it.
 *
 * Nothing here can reference anything outside the document: no gradients, no
 * images, no text, no `href`. That is what makes the serialised SVG safe to
 * store and re-render, and it is why a caption knob is out of scope (text in
 * an SVG needs a font that the rasteriser may substitute).
 */

export interface RectPrimitive {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  /** Uniform corner radius. Omitted means square corners. */
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface EllipsePrimitive {
  type: "ellipse";
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  /** Rotation about its own centre, degrees, clockwise. */
  rotationDeg?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type PathCommand =
  | { type: "moveTo"; x: number; y: number }
  | { type: "lineTo"; x: number; y: number }
  | { type: "close" };

export interface PathPrimitive {
  type: "path";
  commands: PathCommand[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** A transform and an optional rounded-rect clip applied to its children.
 *  Order of application is translate, then rotate, then scale, then clip. */
export interface GroupPrimitive {
  type: "group";
  translateX?: number;
  translateY?: number;
  rotationDeg?: number;
  scale?: number;
  clipRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
  };
  children: Primitive[];
}

export type Primitive =
  RectPrimitive | EllipsePrimitive | PathPrimitive | GroupPrimitive;
