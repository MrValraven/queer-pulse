import type { StudioRangeKeySteps } from "./studioRange.types";

export function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function fractionOfValue(
  value: number,
  min: number,
  max: number,
): number {
  if (max <= min) return 0;
  return (clampValue(value, min, max) - min) / (max - min);
}

export function valueOfFraction(
  fraction: number,
  min: number,
  max: number,
): number {
  const clampedFraction = Math.min(Math.max(fraction, 0), 1);
  return min + clampedFraction * (max - min);
}

/** Pointer position as a 0 to 1 fraction in reading order. */
export function fractionFromPointer(
  clientX: number,
  trackBounds: { left: number; width: number },
  isRightToLeft: boolean,
): number {
  if (trackBounds.width <= 0) return 0;
  const rawFraction = (clientX - trackBounds.left) / trackBounds.width;
  const clampedFraction = Math.min(Math.max(rawFraction, 0), 1);
  return isRightToLeft ? 1 - clampedFraction : clampedFraction;
}

export function isRightToLeft(element: Element): boolean {
  return getComputedStyle(element).direction === "rtl";
}

/** The value a key moves to, or null for a key the slider does not handle. */
export function steppedValue(
  key: string,
  current: number,
  steps: StudioRangeKeySteps,
  min: number,
  max: number,
  isReadingRightToLeft: boolean,
): number | null {
  const forwardKey = isReadingRightToLeft ? "ArrowLeft" : "ArrowRight";
  const backwardKey = isReadingRightToLeft ? "ArrowRight" : "ArrowLeft";
  let next: number;
  if (key === "Home") next = min;
  else if (key === "End") next = max;
  else if (key === forwardKey || key === "ArrowUp")
    next = current + steps.arrow;
  else if (key === backwardKey || key === "ArrowDown")
    next = current - steps.arrow;
  else if (key === "PageUp") next = current + steps.page;
  else if (key === "PageDown") next = current - steps.page;
  else return null;
  return clampValue(next, min, max);
}
