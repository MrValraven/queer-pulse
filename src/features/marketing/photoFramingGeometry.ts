import type { CSSProperties } from "react";
import {
  cropFocalXY,
  type CropRect,
  type SourceSize,
} from "../../shared/components/ui/cropGeometry";
import {
  LISTING_PHOTO_ZOOM_MAX,
  type ListingPhotoFraming,
} from "./api/directory.api";

const MIN_ZOOM = 1;
const FOCUS_DECIMALS_FACTOR = 10000;

export const DEFAULT_PHOTO_FRAMING: ListingPhotoFraming = {
  focusX: 0.5,
  focusY: 0.5,
  zoom: 1,
};

export const PHOTO_ZOOM_SLIDER_STEP = 0.05;
export const PHOTO_ZOOM_KEY_STEP = 0.1;
export const PHOTO_FOCUS_KEY_STEP = 0.05;

/**
 * Zoom the save sends for an explicit centred framing on a photo that has a
 * media crop. A plain `zoom: 1` centre reads as "no framing" to the renderer
 * and lets the crop win, so this sits a hair above 1 to keep the centre.
 */
export const CENTRE_OVER_CROP_ZOOM = 1.0001;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampField(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  return Number.isFinite(value) ? clampNumber(value, min, max) : fallback;
}

function roundToFourDecimals(value: number): number {
  return Math.round(value * FOCUS_DECIMALS_FACTOR) / FOCUS_DECIMALS_FACTOR;
}

/** Holds focus inside 0..1 and zoom inside 1..max; a non-finite field falls back to its centred default. */
export function clampPhotoFraming(
  framing: ListingPhotoFraming,
): ListingPhotoFraming {
  return {
    focusX: clampField(framing.focusX, 0, 1, DEFAULT_PHOTO_FRAMING.focusX),
    focusY: clampField(framing.focusY, 0, 1, DEFAULT_PHOTO_FRAMING.focusY),
    zoom: clampField(
      framing.zoom,
      MIN_ZOOM,
      LISTING_PHOTO_ZOOM_MAX,
      DEFAULT_PHOTO_FRAMING.zoom,
    ),
  };
}

/** The four-decimal precision the backend stores. */
export function roundPhotoFraming(
  framing: ListingPhotoFraming,
): ListingPhotoFraming {
  return {
    focusX: roundToFourDecimals(framing.focusX),
    focusY: roundToFourDecimals(framing.focusY),
    zoom: roundToFourDecimals(framing.zoom),
  };
}

export function isSamePhotoFraming(
  first: ListingPhotoFraming,
  second: ListingPhotoFraming,
): boolean {
  const roundedFirst = roundPhotoFraming(first);
  const roundedSecond = roundPhotoFraming(second);
  return (
    roundedFirst.focusX === roundedSecond.focusX &&
    roundedFirst.focusY === roundedSecond.focusY &&
    roundedFirst.zoom === roundedSecond.zoom
  );
}

export function isDefaultPhotoFraming(framing: ListingPhotoFraming): boolean {
  return isSamePhotoFraming(framing, DEFAULT_PHOTO_FRAMING);
}

/** Render order: the saved framing, then the media crop read as a focal region at zoom 1, then the centre. */
export function resolveShotFraming(shot: {
  framing?: ListingPhotoFraming;
  crop?: CropRect;
}): ListingPhotoFraming {
  if (shot.framing) return clampPhotoFraming(shot.framing);
  if (shot.crop) {
    const focal = cropFocalXY(shot.crop);
    return clampPhotoFraming({
      focusX: focal.x / 100,
      focusY: focal.y / 100,
      zoom: 1,
    });
  }
  return DEFAULT_PHOTO_FRAMING;
}

/** The three custom properties the photo CSS reads; percentages match `cropFocalXY` at one decimal. */
export function photoFramingStyle(framing: ListingPhotoFraming): CSSProperties {
  const percentOf = (fraction: number) =>
    `${Math.round(fraction * 1000) / 10}%`;
  return {
    "--frame-x": percentOf(framing.focusX),
    "--frame-y": percentOf(framing.focusY),
    "--frame-zoom": String(framing.zoom),
  } as CSSProperties;
}

/** Size of the image after `object-fit: cover` into the frame; the frame size when a natural dimension is 0. */
export function coverRenderedSize(
  frame: SourceSize,
  natural: SourceSize,
): SourceSize {
  if (natural.width <= 0 || natural.height <= 0) {
    return { width: frame.width, height: frame.height };
  }
  const scale = Math.max(
    frame.width / natural.width,
    frame.height / natural.height,
  );
  return { width: natural.width * scale, height: natural.height * scale };
}

/*
 * Why the shared pan hook fits. The renderer puts the image's focus point at
 * the frame's focus point (object-position) and scales about that same point
 * (transform-origin). For a frame of length W, a cover-rendered image of length
 * R and zoom z, the image fraction under frame position x is
 * (x / z + focus * (R - W / z)) / R. Keeping the grabbed point under the finger
 * after a drag of dx gives focus' = focus - dx / (z * (R - W / z)), which is
 * what useFramePanPinch computes through panDeltaFromFrameDelta(dx / W,
 * visibleFraction) with visibleFraction = W / (z * R). So focusX and focusY go
 * to the hook as panX and panY, and this function supplies the crop fractions.
 */
export function visibleFractionOf(
  frameLength: number,
  renderedLength: number,
  zoom: number,
): number | null {
  if (renderedLength <= 0 || zoom <= 0) return null;
  return frameLength / (zoom * renderedLength);
}

/**
 * Keyboard step for the reframer: plus and minus zoom, and each arrow moves the
 * picture in its own direction, as a drag that way would. A drag right lowers
 * focusX (see visibleFractionOf above), so ArrowRight and ArrowDown subtract
 * the step and ArrowLeft and ArrowUp add it. Null for any other key.
 */
export function nudgePhotoFraming(
  framing: ListingPhotoFraming,
  key: string,
): ListingPhotoFraming | null {
  switch (key) {
    case "ArrowLeft":
      return clampPhotoFraming({
        ...framing,
        focusX: framing.focusX + PHOTO_FOCUS_KEY_STEP,
      });
    case "ArrowRight":
      return clampPhotoFraming({
        ...framing,
        focusX: framing.focusX - PHOTO_FOCUS_KEY_STEP,
      });
    case "ArrowUp":
      return clampPhotoFraming({
        ...framing,
        focusY: framing.focusY + PHOTO_FOCUS_KEY_STEP,
      });
    case "ArrowDown":
      return clampPhotoFraming({
        ...framing,
        focusY: framing.focusY - PHOTO_FOCUS_KEY_STEP,
      });
    case "+":
    case "=":
      return clampPhotoFraming({
        ...framing,
        zoom: framing.zoom + PHOTO_ZOOM_KEY_STEP,
      });
    case "-":
    case "_":
      return clampPhotoFraming({
        ...framing,
        zoom: framing.zoom - PHOTO_ZOOM_KEY_STEP,
      });
    default:
      return null;
  }
}

/** Clamp, round, then keep an explicit centre alive over a media crop by nudging zoom above 1. */
export function framingForSave(
  draft: ListingPhotoFraming,
  hasMediaCrop: boolean,
): ListingPhotoFraming {
  const rounded = roundPhotoFraming(clampPhotoFraming(draft));
  if (hasMediaCrop && isDefaultPhotoFraming(rounded)) {
    return { ...rounded, zoom: CENTRE_OVER_CROP_ZOOM };
  }
  return rounded;
}
